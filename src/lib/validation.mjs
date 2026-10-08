import { checkProtectedText, PRIVACY_NOTICE_VERSION } from "./privacy.mjs";
import { isEmployeeEmail, EMPLOYEE_CATEGORIES } from "./access-policy.mjs";
export function fail(message, status = 400) {
  throw Object.assign(new Error(message), { status });
}
export function isInstitutionalEmail(email) {
  return isEmployeeEmail(email);
}
export function validateCommand(body) {
  if (!body || !/^[0-9a-f-]{36}$/i.test(body.request_id || ""))
    fail("A valid request identifier is required.");
  checkProtectedText(body);
  if (["profile", "proposal", "comment", "position", "pulse"].includes(body.action) && body.privacy_notice_version !== PRIVACY_NOTICE_VERSION)
    fail("Read and acknowledge the participation privacy notice before saving.");
  const required = (key, max = 10000) => {
    const value = body[key];
    if (typeof value !== "string" || !value.trim() || value.length > max)
      fail(`Invalid ${key}.`);
  };
  const oneOf = (key, allowed) => {
    if (!allowed.includes(body[key])) fail(`Invalid ${key}.`);
  };
  switch (body.action) {
    case "profile":
      required("name", 160);
      for (const k of ["category", "unit", "discipline", "years"])
        if (typeof body[k] !== "string" || body[k].length > 160) fail(`Invalid ${k}.`);
      oneOf("category", EMPLOYEE_CATEGORIES);
      if (body.employee_confirmed !== true) fail("Confirm you are a Lone Star employee, not a student participant.");
      break;
    case "proposal": {
      if (Object.keys(body).some((key) => !["action", "request_id", "privacy_notice_version", "question_id", "status", "content", "id", "revision"].includes(key)))
        fail("Use only the displayed proposal fields.");
      required("question_id", 4);
      oneOf("status", ["Draft", "Submitted"]);
      const c = body.content;
      if (!c || typeof c !== "object" || JSON.stringify(c).length > 40000)
        fail("Invalid proposal content.");
      const allowed = new Set(["depth", "type", "statement", "issue", "recommendation", "rationale", "example", "affected", "risks", "evidence", "scope", "strength", "visibility", "collective", "session_id"]);
      if (Object.entries(c).some(([key, value]) => !allowed.has(key) || typeof value !== "string" || value.length > 4000))
        fail("Use only the displayed proposal fields, with text up to 4000 characters each.");
      if (!["Quick response", "Full proposal"].includes(c.depth))
        fail("Choose a contribution depth.");
      if (
        ![
          "Recommendation",
          "Concern or objection",
          "Practice to share",
          "Question for OTS or administration",
          "Information gap",
          "Not applicable to my role",
          "I do not have enough information",
        ].includes(c.type)
      )
        fail("Choose a contribution type.");
      if (
        body.status === "Submitted" &&
        (!c.statement?.trim() ||
          (c.depth === "Quick response" && c.statement.length > 600))
      )
        fail("Quick responses need a statement of up to 600 characters.");
      if (
        body.status === "Submitted" &&
        c.depth === "Full proposal" &&
        [
          "issue",
          "recommendation",
          "rationale",
          "example",
          "affected",
          "risks",
          "evidence",
          "scope",
          "strength",
        ].some((k) => !c[k]?.trim())
      )
        fail("Complete all full-proposal fields.");
      if (c.visibility && c.visibility !== "Members")
        fail("Committee-only authorship is not enabled.");
      break;
    }
    case "comment":
    case "position":
      required("target_id", 36);
      required("body", 4000);
      oneOf("kind", ["proposal", "norm"]);
      if (!Number.isInteger(body.revision) || body.revision < 1)
        fail("Invalid revision.");
      if (body.action === "position")
        oneOf("position", ["Support", "Support with changes", "Disagree"]);
      break;
    case "pulse": {
      oneOf("stage", ["Baseline", "Closing"]);
      const choices = {
        sentiment: ["Positive", "Mixed", "Negative", "Unsure"],
        challenge: [
          "More of an opportunity",
          "Both equally",
          "More of a challenge",
          "Unsure",
        ],
        confidence: [
          "Very confident",
          "Somewhat confident",
          "Starting out",
          "Unsure",
        ],
        experience: ["Yes", "No", "Prefer not to say"],
        concerns: [
          "Overreliance",
          "Critical thinking",
          "Privacy",
          "Bias or access",
          "Workload or job security",
          "No main concern",
          "Other",
        ],
        guidance: ["Yes", "No", "Unsure"],
      };
      if (
        !body.answers ||
        Object.keys(body.answers).length !== 6 ||
        Object.entries(choices).some(
          ([key, allowed]) => !allowed.includes(body.answers[key]),
        )
      )
        fail("Complete the six pulse items.");
      break;
    }
    case "disposition":
      required("reason", 4000);
      oneOf("outcome", [
        "Incorporated",
        "Incorporated with changes",
        "Referred to OTS",
        "Referred to the system policy process",
        "Referred to professional development",
        "Deferred",
        "Not adopted",
      ]);
      break;
    case "coding":
      if (!Array.isArray(body.codes) || !Array.isArray(body.linked_ids))
        fail("Invalid coding.");
      break;
    case "code":
      required("id", 80);
      required("label", 200);
      oneOf("dimension", ["Theme", "Risk", "Scope", "Suggested action"]);
      break;
    case "moderate":
      required("reason", 4000);
      break;
    case "practice":
      if (typeof body.approved !== "boolean") fail("Invalid approval.");
      break;
    case "synthesis":
      required("question_id", 4);
      for (const k of ["agreement", "reservations", "minority", "gaps"])
        required(k);
      break;
    case "norm": {
      if (
        !body.content ||
        [
          "title",
          "text",
          "scope",
          "strength",
          "route",
          "applies_to",
          "existing_rule",
          "checked_on",
          "review_date",
          "reservations",
        ].some((k) => !body.content[k]?.trim())
      )
        fail("Complete every norm field.");
      if (
        !Array.isArray(body.contribution_ids) ||
        !body.contribution_ids.length ||
        !Array.isArray(body.source_ids) ||
        !body.source_ids.length
      )
        fail("Link supporting contributions and reference sources.");
      if (!/^https:\/\//.test(body.content.existing_rule))
        fail("Use an HTTPS policy or OTS source link.");
      break;
    }
    case "draft":
      oneOf("status", ["Working", "Published", "Final"]);
      if (typeof body.response_summary !== "string")
        fail("Invalid response summary.");
      break;
    case "action":
      required("text", 1000);
      required("owner", 200);
      oneOf("status", ["Open", "In progress", "Complete"]);
      break;
    case "session":
      required("name", 200);
      required("date", 10);
      break;
    case "round":
      required("name", 200);
      oneOf("phase", ["Collect", "Synthesize", "Comment", "Closed"]);
      if (typeof body.open !== "boolean") fail("Invalid round state.");
      break;
    case "roster":
      required("email", 254);
      if (!isInstitutionalEmail(body.email))
        fail("Use an employee @lonestar.edu email address. Students cannot participate.");
      break;
    case "role":
      required("user_id", 36);
      oneOf("role", [
        "Participant",
        "Facilitator",
        "Committee",
        "Administrator",
      ]);
      oneOf("operation", ["Assign", "Revoke"]);
      break;
    case "membership":
      required("user_id", 36);
      if (typeof body.active !== "boolean") fail("Invalid membership state.");
      break;
    default:
      fail("Unknown operation.");
  }
}
