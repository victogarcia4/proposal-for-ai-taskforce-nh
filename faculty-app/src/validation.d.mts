export type SurveyAnswers = Record<string, string | string[] | Record<string, string> | undefined>;
export type Answer = { question_id: string; selected: string[]; other_text: string; opinion_type: string };
export type Profile = { category: string; division: string; years: string; privacy: boolean };
export function checkText(text: string): string | null;
export function validateProfile(p: Profile): string | null;
export function validateSurvey(a: SurveyAnswers): string | null;
export function validateAnswer(a: Answer): string | null;
