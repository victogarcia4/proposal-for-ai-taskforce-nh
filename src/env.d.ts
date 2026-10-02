declare module 'virtual:question-bank' {
  const tables: { id: string; title: string; deliverable: string; probes: string; questions: { id: string; text: string; version: number }[] }[];
  export default tables;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
