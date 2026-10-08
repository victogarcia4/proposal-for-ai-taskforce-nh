// Authorization uses the verified identity returned by Supabase, never editable metadata.
export const ADMIN_EMAIL = "vhgarcia100@gmail.com";
export const EMPLOYEE_CATEGORIES = ["Full-time faculty", "Adjunct faculty", "Staff", "Administrator"];
export function isEmployeeEmail(email) {
  return typeof email === "string" && /^[^@\s]+@lonestar\.edu$/i.test(email.trim());
}
export function isSoleAdmin(user) {
  return Boolean(user?.email_confirmed_at && user.email?.trim().toLowerCase() === ADMIN_EMAIL);
}
export function assertEligibleUser(user) {
  if (!user?.email_confirmed_at || (!isSoleAdmin(user) && !isEmployeeEmail(user.email)))
    throw Object.assign(new Error("Use a verified employee @lonestar.edu account. Students cannot participate."), { status: 403 });
}
export function accessRoles(user, storedRoles = []) {
  if (isSoleAdmin(user)) return ["Participant", "Administrator"];
  return ["Participant", ...storedRoles.filter((r) => r === "Facilitator")];
}
export function requireAdmin(user) {
  if (!isSoleAdmin(user)) throw Object.assign(new Error("Only the designated administrator can access histories or export material."), { status: 403 });
}
export function authorizeCommand(user, roles, body) {
  const participant = ["profile", "proposal", "comment", "position", "pulse"];
  if (!participant.includes(body.action)) {
    if (!(body.action === "session" && roles.includes("Facilitator"))) requireAdmin(user);
  }
  if (body.action === "proposal" && body.content?.collective === "true" && !isSoleAdmin(user) && !roles.includes("Facilitator"))
    throw Object.assign(new Error("Facilitator role required."), { status: 403 });
  if (body.action === "role" && ["Administrator", "Committee"].includes(body.role))
    throw Object.assign(new Error("Administrative privileges are reserved for the designated account and cannot be delegated."), { status: 403 });
}
