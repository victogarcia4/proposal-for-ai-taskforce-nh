import { context } from "./_consultation.mjs";
import consultation from "./consultation.mjs";
import { requireAdmin } from "../../src/lib/access-policy.mjs";
import { materialRows, materialCsv, materialPdf } from "../../src/lib/material-export.mjs";
const headers = { "Cache-Control": "private, no-store", Vary: "Authorization", "X-Content-Type-Options": "nosniff" };
export function createExportHandler(getContext = context, getFeed = consultation) {
  return async function(request) {
    try {
      if (request.method !== "GET") return Response.json({ error: "Method not allowed." }, { status: 405, headers });
      const { user } = await getContext(request);
      requireAdmin(user);
      const format = new URL(request.url).searchParams.get("format");
      if (!["csv", "pdf"].includes(format)) return Response.json({ error: "Choose CSV or PDF." }, { status: 400, headers });
      const feedResponse = await getFeed(request);
      if (!feedResponse.ok) return feedResponse;
      const rows = materialRows(await feedResponse.json());
      return new Response(format === "pdf" ? materialPdf(rows) : materialCsv(rows), { headers: { ...headers, "Content-Type": format === "pdf" ? "application/pdf" : "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="north-harris-consultation.${format}"` } });
    } catch (error) { return Response.json({ error: error.message || "Export failed." }, { status: error.status || 500, headers }); }
  };
}
export default createExportHandler();
