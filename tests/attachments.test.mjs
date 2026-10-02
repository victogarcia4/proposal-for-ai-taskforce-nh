import test from "node:test";
import assert from "node:assert/strict";
import { validateFile } from "../netlify/functions/attachment.mjs";
test("attachment validation checks content signatures, allowed types, UTF-8, and size", () => {
  assert.equal(
    validateFile(
      "notes.md",
      "text/markdown",
      Buffer.from("A practice to share"),
    ),
    "text/markdown",
  );
  assert.equal(
    validateFile(
      "sample.pdf",
      "application/pdf",
      Buffer.from("%PDF-1.7 sample"),
    ),
    "application/pdf",
  );
  assert.throws(
    () => validateFile("fake.pdf", "application/pdf", Buffer.from("Not a PDF")),
    /Invalid PDF/,
  );
  assert.throws(
    () =>
      validateFile(
        "upload.exe",
        "application/octet-stream",
        Buffer.from("binary"),
      ),
    /Use PDF/,
  );
  assert.throws(
    () => validateFile("fake.txt", "text/plain", Buffer.from([0xff, 0xfe])),
    /UTF-8/,
  );
  assert.throws(
    () => validateFile("large.txt", "text/plain", Buffer.alloc(5242881)),
    /up to 5 MB/,
  );
});
