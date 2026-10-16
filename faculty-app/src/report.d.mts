import type { Option, Question, SurveyItem } from "./content.mjs";
import type { AllData } from "./data";

type Counts = Record<string, number>;
export type Summary = {
  participants: number;
  surveySummary: { item: SurveyItem; n: number; counts?: Counts; rows?: { row: Option; counts: Counts }[] }[];
  questionSummary: { question: Question; n: number; counts: Counts; types: Counts; texts: { text: string; type: string }[] }[];
};
export function summarize(all: AllData): Summary;
export function toCsv(all: AllData): string;
