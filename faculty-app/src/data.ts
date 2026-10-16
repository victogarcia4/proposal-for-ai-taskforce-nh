import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PRIVACY_VERSION } from "./content.mjs";
import type { Answer, Profile, SurveyAnswers } from "./validation.mjs";

export type Status = "Draft" | "Submitted";
export type SavedAnswer = Answer & { status: Status; updated_at?: string };
export type Mine = {
  profile: (Omit<Profile, "privacy"> & { privacy_version: string }) | null;
  survey: { answers: SurveyAnswers; status: Status } | null;
  answers: SavedAnswer[];
};
export type AllData = {
  profiles: { user_id: string; category: string; division: string; years: string }[];
  surveys: { user_id: string; answers: SurveyAnswers; status: Status }[];
  answers: (SavedAnswer & { user_id: string })[];
};
export type User = { id: string; email: string };

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// Without Supabase settings the app runs as an in-browser demo with no stored data.
export const DEMO = !url || !key;
const sb: SupabaseClient | null = DEMO
  ? null
  : createClient(url!, key!, {
      auth: { persistSession: true, storage: typeof window === "undefined" ? undefined : window.localStorage },
    });

const FACULTY_EMAIL = /^[^@\s]+@lonestar\.edu$/i;
export const isFacultyEmail = (email: string) => FACULTY_EMAIL.test(email.trim());

const demo = { user: null as User | null, admin: false, mine: { profile: null, survey: null, answers: [] } as Mine };

function must<R extends { error: { message: string } | null }>(result: R): R extends { data: infer D } ? D : never {
  if (result.error) throw new Error(result.error.message);
  return (result as unknown as { data: never }).data;
}

export async function currentUser(): Promise<User | null> {
  if (!sb) return demo.user;
  const { data } = await sb.auth.getSession();
  const u = data.session?.user;
  return u ? { id: u.id, email: u.email ?? "" } : null;
}

export async function sendCode(email: string) {
  if (!isFacultyEmail(email)) throw new Error("Use your Lone Star employee email (@lonestar.edu).");
  if (!sb) return;
  const { error } = await sb.auth.signInWithOtp({ email: email.trim().toLowerCase(), options: { shouldCreateUser: true } });
  if (error && (error.status === 429 || /rate limit/i.test(error.message))) throw new RateLimited();
  if (error) throw new Error(error.message);
}

// Supabase limits how many sign-in emails go out; the last code still works until it expires.
export class RateLimited extends Error {
  constructor() {
    super("We can't send another code right now. Enter the last code you received, or try again in a few minutes.");
  }
}

export async function verifyCode(email: string, token: string) {
  if (!/^\d{6,10}$/.test(token.trim())) throw new Error("Enter the code from your email.");
  if (!sb) {
    demo.user = { id: "demo-user", email };
    return;
  }
  must(await sb.auth.verifyOtp({ email: email.trim().toLowerCase(), token: token.trim(), type: "email" }));
}

export async function adminSignIn(email: string, password: string) {
  if (!sb) {
    demo.user = { id: "demo-admin", email };
    demo.admin = true;
    return;
  }
  must(await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password }));
}

export async function signOut() {
  if (!sb) {
    demo.user = null;
    demo.admin = false;
    return;
  }
  await sb.auth.signOut();
}

export async function isAdmin(): Promise<boolean> {
  if (!sb) return demo.admin;
  const user = await currentUser();
  if (!user) return false;
  const rows = must(await sb.from("nhf_admins").select("email").eq("email", user.email.toLowerCase()));
  return (rows ?? []).length > 0;
}

export async function loadMine(): Promise<Mine> {
  if (!sb) return structuredClone(demo.mine);
  const user = await currentUser();
  if (!user) throw new Error("Please sign in.");
  const [profile, survey, answers] = await Promise.all([
    sb.from("nhf_profiles").select("category,division,years,privacy_version").eq("user_id", user.id).maybeSingle(),
    sb.from("nhf_survey").select("answers,status").eq("user_id", user.id).maybeSingle(),
    sb.from("nhf_answers").select("question_id,selected,other_text,opinion_type,status,updated_at").eq("user_id", user.id),
  ]);
  return { profile: must(profile), survey: must(survey), answers: must(answers) ?? [] };
}

export async function saveProfile(p: Profile) {
  const row = { category: p.category, division: p.division, years: p.years, privacy_version: PRIVACY_VERSION };
  if (!sb) {
    demo.mine.profile = row;
    return;
  }
  const user = await currentUser();
  must(await sb.from("nhf_profiles").upsert({ user_id: user!.id, ...row, updated_at: new Date().toISOString() }));
}

export async function saveSurvey(answers: SurveyAnswers, status: Status) {
  if (!sb) {
    demo.mine.survey = { answers, status };
    return;
  }
  const user = await currentUser();
  must(await sb.from("nhf_survey").upsert({ user_id: user!.id, answers, status, updated_at: new Date().toISOString() }));
}

export async function saveAnswer(a: Answer, status: Status) {
  const row = { question_id: a.question_id, selected: a.selected, other_text: a.other_text.trim(), opinion_type: a.opinion_type, status };
  if (!sb) {
    demo.mine.answers = demo.mine.answers.filter((x) => x.question_id !== a.question_id).concat(row);
    return;
  }
  const user = await currentUser();
  must(await sb.from("nhf_answers").upsert({ user_id: user!.id, ...row, updated_at: new Date().toISOString() }));
}

export async function loadAll(): Promise<AllData> {
  if (!sb) {
    const { demoAll } = await import("./demo");
    return demoAll();
  }
  const [profiles, surveys, answers] = await Promise.all([
    sb.from("nhf_profiles").select("user_id,category,division,years"),
    sb.from("nhf_survey").select("user_id,answers,status"),
    sb.from("nhf_answers").select("user_id,question_id,selected,other_text,opinion_type,status,updated_at"),
  ]);
  return { profiles: must(profiles) ?? [], surveys: must(surveys) ?? [], answers: must(answers) ?? [] };
}
