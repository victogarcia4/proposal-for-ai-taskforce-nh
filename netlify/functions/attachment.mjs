import { fail } from "./_consultation.mjs";
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
export default async function handler() {
  return Response.json(
    { error: "Attachments are unavailable during the privacy review. Use a general example in your response; do not upload student or clinical records." },
    { status: 403, headers: { "Cache-Control": "private, no-store", Vary: "Authorization" } },
  );
}
