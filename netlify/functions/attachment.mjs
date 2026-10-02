import { context, checked, fail, consultationId } from "./_consultation.mjs";
import { createHash } from "node:crypto";
const mimeByExtension = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
  md: "text/markdown",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};
export function validateFile(name, mime, bytes) {
  const ext = name.split(".").at(-1)?.toLowerCase(),
    expected = mimeByExtension[ext];
  if (!expected || bytes.length < 1 || bytes.length > 5242880)
    fail("Use PDF, DOCX, TXT, MD, PNG, or JPEG up to 5 MB.");
  if (mime !== expected && !(ext === "md" && ["text/plain", ""].includes(mime)))
    fail("The file type does not match its extension.");
  if (ext === "pdf" && !bytes.subarray(0, 5).equals(Buffer.from("%PDF-")))
    fail("Invalid PDF content.");
  if (
    ext === "png" &&
    !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    fail("Invalid PNG content.");
  if (
    ["jpg", "jpeg"].includes(ext) &&
    !(bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
  )
    fail("Invalid JPEG content.");
  if (
    ext === "docx" &&
    !(
      bytes[0] === 80 &&
      bytes[1] === 75 &&
      bytes.includes(Buffer.from("[Content_Types].xml")) &&
      bytes.includes(Buffer.from("word/document.xml"))
    )
  )
    fail("Invalid DOCX content.");
  if (["txt", "md"].includes(ext)) {
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      fail("Text attachments must use UTF-8.");
    }
    if (bytes.includes(0)) fail("Binary data cannot be uploaded as text.");
  }
  return expected;
}
export default async function handler(request) {
  try {
    const ctx = await context(request),
      { db, user, editor, consultation } = ctx;
    if (request.method === "GET") {
      const id = new URL(request.url).searchParams.get("id");
      const record = await checked(
        await db
          .from("nh_attachments")
          .select("*")
          .eq("id", id)
          .eq("consultation_id", consultationId)
          .single(),
      );
      const proposal = await checked(
        await db
          .from("nh_contributions")
          .select("author_id,status")
          .eq("id", record.contribution_id)
          .single(),
      );
      if (
        proposal.author_id !== user.id &&
        proposal.status !== "Submitted" &&
        !(editor && proposal.status === "Moderated")
      )
        fail("Access denied.", 403);
      const { data, error } = await db.storage
        .from("nh-attachments")
        .download(record.path);
      if (error) throw error;
      return new Response(data, {
        headers: {
          "Content-Type": record.mime,
          "Content-Disposition": `attachment; filename="${record.name.replace(/[^a-zA-Z0-9._ -]/g, "_")}"`,
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    if (request.method !== "POST") fail("Method not allowed.", 405);
    if (!consultation.enabled)
      fail("Participation is awaiting administrator activation.", 403);
    const length = Number(request.headers.get("content-length") || 0);
    if (length > 5300000) fail("File too large.", 413);
    const open = await checked(
      await db
        .from("nh_rounds")
        .select("id")
        .eq("consultation_id", consultationId)
        .eq("open", true)
        .eq("phase", "Collect")
        .maybeSingle(),
    );
    if (!open) fail("The contribution round is closed.");
    const form = await request.formData(),
      file = form.get("file"),
      description = String(form.get("description") || "").trim(),
      proposalId = String(form.get("contribution_id") || ""),
      requestId = String(form.get("request_id") || "");
    if (
      !(file instanceof File) ||
      !description ||
      description.length > 500 ||
      !/^[0-9a-f-]{36}$/i.test(requestId)
    )
      fail("Choose a file and provide a short description.");
    if (file.size > 5242880) fail("File too large.", 413);
    const proposal = await checked(
      await db
        .from("nh_contributions")
        .select("id,author_id,status")
        .eq("id", proposalId)
        .eq("consultation_id", consultationId)
        .single(),
    );
    if (proposal.author_id !== user.id)
      fail("You can attach files only to your own contribution.", 403);
    const bytes = Buffer.from(await file.arrayBuffer()),
      mime = validateFile(file.name, file.type, bytes),
      hash = createHash("sha256").update(bytes).digest("hex");
    const path = `${consultationId}/${user.id}/${proposal.id}/${requestId}-${hash}`;
    const existing = await checked(
      await db
        .from("nh_attachments")
        .select("id")
        .eq("path", path)
        .maybeSingle(),
    );
    if (existing) return Response.json(existing);
    const { error: uploadError } = await db.storage
      .from("nh-attachments")
      .upload(path, bytes, { contentType: mime, upsert: false });
    if (uploadError && !/already exists|Duplicate/i.test(uploadError.message))
      throw uploadError;
    const inserted = await db
      .from("nh_attachments")
      .insert({
        consultation_id: consultationId,
        contribution_id: proposal.id,
        author_id: user.id,
        path,
        name: file.name,
        description,
        mime,
        bytes: bytes.length,
      })
      .select("id")
      .single();
    if (inserted.error?.code === "23505")
      return Response.json(
        await checked(
          await db
            .from("nh_attachments")
            .select("id")
            .eq("path", path)
            .single(),
        ),
      );
    return Response.json(await checked(inserted));
  } catch (e) {
    return Response.json(
      { error: e.message || "Attachment request failed." },
      { status: e.status || 500 },
    );
  }
}
