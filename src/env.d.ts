declare module 'virtual:question-bank' {
  const tables: { id: string; title: string; deliverable: string; probes: string; questions: { id: string; text: string; version: number }[] }[];
  export default tables;
}
