// CSV preserves Unicode. Formula-leading cells are escaped for spreadsheet safety.
export function materialRows(feed) {
  const rows = [];
  const add = (kind, id, question, author, revision, status, content) => rows.push({ kind, id, question: question || "", author: author || "", revision: revision || "", status: status || "", content: typeof content === "string" ? content : JSON.stringify(content) });
  const author = (id) => feed.profiles.find((p) => p.id === id)?.name || id;
  for (const p of feed.proposals) {
    add("Opinion", p.id, p.question_id, author(p.author_id), p.revision, p.status, p.content);
    for (const h of p.history || []) add("Opinion history", p.id, p.question_id, author(p.author_id), h.revision, "Historical", h.content);
  }
  for (const c of feed.comments) add(c.position ? "Position" : "Comment", c.target_id, "", author(c.author_id), c.revision, c.position, c.body);
  for (const n of feed.norms) add("Norm", n.id, "", "", n.revision, n.status, n);
  for (const s of feed.syntheses) add("Synthesis", s.question_id, s.question_id, "", "", "", s);
  for (const a of feed.actions) add("Action", a.id, "", "", "", a.status, a);
  add("Pulse aggregates", "pulse", "", "", "", "Suppressed where needed", feed.pulse);
  return rows;
}
export function materialCsv(rows) {
  const keys = ["kind", "id", "question", "author", "revision", "status", "content"];
  const quote = (v) => { const text = String(v ?? ""); return `"${(/^[\s]*[=+@-]/.test(text) ? "'" + text : text).replaceAll('"', '""')}"`; };
  return "\ufeff" + [keys.join(","), ...rows.map((r) => keys.map((k) => quote(r[k])).join(","))].join("\r\n");
}
// Minimal multipage PDF using a standard font. Characters outside Latin-1 are
// represented explicitly as U+hex, rather than silently dropping text.
export function materialPdf(rows) {
  const printable = (s) => String(s).replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, "-").replace(/[^\x20-\x7e\xa0-\xff\n]/gu, (c) => `[U+${c.codePointAt(0).toString(16).toUpperCase()}]`);
  const lines = ["North Harris AI consultation - confidential administrator export", new Date().toISOString(), "Pulse data is aggregated; this export is not anonymous.", ""];
  for (const row of rows) {
    const block = printable(`${row.kind} | ${row.id} | ${row.question}\nAuthor: ${row.author} | Revision: ${row.revision} | ${row.status}\n${row.content}\n`);
    for (const line of block.split("\n")) {
      if (!line) lines.push("");
      for (let start = 0; start < line.length; start += 88) lines.push(line.slice(start, start + 88));
    }
  }
  const pages = [];
  for (let start = 0; start < lines.length; start += 54) pages.push(lines.slice(start, start + 54));
  const objects = ["", "", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"];
  const kids = [];
  for (const page of pages) {
    const pageId = objects.length + 1, streamId = pageId + 1;
    kids.push(`${pageId} 0 R`);
    const escape = (s) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
    const stream = `BT /F1 10 Tf 13 TL 40 750 Td\n${page.map((line) => `(${escape(line)}) Tj T*`).join("\n")}\nET`;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${streamId} 0 R >>`);
    objects.push(`<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`);
  }
  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${kids.length} >>`;
  let output = "%PDF-1.4\n", offsets = [0];
  objects.forEach((obj, i) => { offsets.push(Buffer.byteLength(output, "latin1")); output += `${i + 1} 0 obj\n${obj}\nendobj\n`; });
  const xref = Buffer.byteLength(output, "latin1");
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((n) => String(n).padStart(10, "0") + " 00000 n \n").join("")}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(output, "latin1");
}
