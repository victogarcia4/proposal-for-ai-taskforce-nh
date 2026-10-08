// These controls reduce disclosure risk. They are not a FERPA/HIPAA certification.
export const PRIVACY_NOTICE_VERSION = "2026-10-07-employee-admin";
export const PRIVACY_NOTICE = "This consultation is for Lone Star employees, not students. Use general or fictional examples. Do not enter student records, grades, patient information, medical details, employee evaluations, IDs, passwords, or information that could identify another person. Submitted opinions are visible to consultation members under generic author labels. The designated administrator can read contributions, including saved drafts and complete histories, and export consultation material as CSV or PDF. Your name and optional profile details are not shared with ordinary members. Pulse answers are associated with your account for editing but shared and exported only as suppressed aggregates. Participation is not anonymous to the administrator.";
export function minimizeProfile(profile, viewerId, admin = false) {
  const own = profile.id === viewerId;
  return {
    id: profile.id, name: own || admin ? profile.name : "Consultation member",
    category: own || admin ? profile.category : "",
    unit: own || admin ? profile.unit : "",
    discipline: own || admin ? profile.discipline : "",
    years: own || admin ? profile.years : "",
    roles: own || admin ? profile.roles || [] : [],
  };
}
export function protectedTextFields(body) {
  const fields = {
    profile: ["name", "unit", "discipline"],
    proposal: ["statement", "issue", "recommendation", "rationale", "example", "affected", "risks", "evidence"],
    comment: ["body"], position: ["body"], disposition: ["reason"],
    moderate: ["reason"], synthesis: ["agreement", "reservations", "minority", "gaps"],
    norm: ["title", "text", "reservations", "applies_to", "existing_rule"],
    draft: ["response_summary"], action: ["text", "owner"], session: ["name"], code: ["label"],
  };
  const content = ["proposal", "norm"].includes(body.action) ? body.content : body;
  return (fields[body.action] || []).map((key) => content?.[key]).filter((text) => typeof text === "string");
}
export function checkProtectedText(body) {
  // Deliberately limited: names and contextual identifiers require human review.
  const patterns = [
    /\b\d{3}-\d{2}-\d{4}\b/,
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    /\b(?:student\s+(?:id|number)|patient\s+(?:id|name)|medical\s+record\s+(?:number|id)|mrn|ssn|date\s+of\s+birth)\s*[:=]\s*\S+/i,
    /\b(?:nombre\s+del\s+paciente|matr[ií]cula|expediente\s+cl[ií]nico|fecha\s+de\s+nacimiento)\s*[:=]\s*\S+/i,
  ];
  if (protectedTextFields(body).some((text) => patterns.some((pattern) => pattern.test(text))))
    throw Object.assign(new Error("Remove personal identifiers from your response. Use a general or fictional example without email addresses, student/patient IDs, or medical records."), { status: 400 });
}
export function suppressedDistribution(counts, threshold = 5) {
  const minimum = Math.max(5, Number(threshold) || 5);
  const suppress = Object.values(counts).some((count) => count > 0 && count < minimum);
  return Object.fromEntries(Object.entries(counts).map(([key, count]) => [key, suppress || count < minimum ? null : count]));
}
