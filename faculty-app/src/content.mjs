// Single source of truth for the faculty consultation content.
// Option ids are stored in the database; never reuse an id for a different meaning.

export const PRIVACY_VERSION = "faculty-2026-10";
export const MAX_TEXT = 600;

export const categories = ["Full-time faculty", "Adjunct faculty"];
export const divisions = [
  "English and communications",
  "Mathematics",
  "Natural sciences",
  "Social and behavioral sciences",
  "Humanities and fine arts",
  "Business and technology",
  "Health professions",
  "Workforce and technical programs",
  "Developmental education",
  "Other",
];
export const yearsTeaching = ["0-3", "4-10", "11-20", "21+", "Prefer not to say"];

export const opinionTypes = [
  { id: "advice", label: "Advice" },
  { id: "question", label: "Question" },
  { id: "concern", label: "Concern" },
  { id: "claim", label: "Claim" },
  { id: "practice", label: "Practice to share" },
  { id: "gap", label: "Information gap" },
  { id: "not_sure", label: "Not sure" },
];

const tools = [
  { id: "chatgpt", label: "ChatGPT" },
  { id: "copilot", label: "Microsoft Copilot" },
  { id: "gemini", label: "Google Gemini" },
  { id: "claude", label: "Claude" },
  { id: "perplexity", label: "Perplexity" },
  { id: "notebooklm", label: "NotebookLM" },
  { id: "other", label: "Other" },
  { id: "none", label: "I don't use AI for this" },
];
const awareness = [
  { id: "unaware", label: "Not aware of it" },
  { id: "heard", label: "Heard of it, haven't read it" },
  { id: "read", label: "Read it" },
  { id: "apply", label: "Read it and apply it" },
];
const benefit = [
  { id: "1", label: "Not beneficial" },
  { id: "2", label: "Slightly" },
  { id: "3", label: "Moderately" },
  { id: "4", label: "Very" },
  { id: "na", label: "Not sure" },
];

// Part A: general AI use survey. Kinds: single, multi, matrix, text.
export const survey = [
  {
    id: "S1", kind: "single",
    text: "How often do you use AI tools for your work as faculty?",
    options: [
      { id: "never", label: "Never" },
      { id: "monthly", label: "Monthly or less" },
      { id: "weekly", label: "About weekly" },
      { id: "several", label: "Several times a week" },
      { id: "daily", label: "Daily" },
    ],
  },
  {
    id: "S2", kind: "multi",
    text: "Which AI tools have you used in the last six months?",
    options: tools.filter((t) => t.id !== "none").concat([
      { id: "grammarly", label: "Grammarly or writing assistants" },
      { id: "discipline", label: "Discipline-specific AI tools" },
      { id: "none", label: "None" },
    ]),
  },
  {
    id: "S3", kind: "matrix",
    text: "Which tool do you prefer for each use case?",
    rows: [
      { id: "lectures", label: "Researching material and preparing lectures" },
      { id: "resources", label: "Creating student resources (quizzes, rubrics, study guides)" },
      { id: "feedback", label: "Feedback on student work" },
      { id: "admin", label: "Administrative and repetitive tasks (email, scheduling, reports)" },
      { id: "research", label: "Scholarly research and writing" },
      { id: "data", label: "Data analysis or coding" },
    ],
    options: tools,
  },
  {
    id: "S4", kind: "single",
    text: "How would you rate your own AI proficiency?",
    options: [
      { id: "1", label: "Beginner" },
      { id: "2", label: "Basic" },
      { id: "3", label: "Intermediate" },
      { id: "4", label: "Advanced" },
    ],
  },
  {
    id: "S5", kind: "single",
    text: "How familiar are you with Lone Star College's AI guidelines (OTS AI guidelines, approved tools, data classification)?",
    options: awareness,
  },
  {
    id: "S6", kind: "single",
    text: "How familiar are you with Texas state requirements on AI and cloud tools (for example TX-RAMP vendor certification and the Texas Responsible AI Governance Act)?",
    options: awareness,
  },
  {
    id: "S7", kind: "multi",
    text: "What AI training have you received?",
    options: [
      { id: "none", label: "None" },
      { id: "self", label: "Self-taught" },
      { id: "lsc", label: "LSC workshop or course" },
      { id: "external", label: "External course or conference" },
      { id: "discipline", label: "Training from my discipline or association" },
    ],
  },
  {
    id: "S8", kind: "single",
    text: "Does your syllabus include an AI statement?",
    options: [
      { id: "all", label: "Yes, in all my courses" },
      { id: "some", label: "In some courses" },
      { id: "no", label: "No" },
      { id: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "S9", kind: "matrix",
    text: "In your opinion, how beneficial is AI for:",
    rows: [
      { id: "learning", label: "Student learning" },
      { id: "resources", label: "Developing resources for students" },
      { id: "productivity", label: "Productivity in administrative and repetitive processes" },
      { id: "lectures", label: "Researching material to develop lectures" },
      { id: "assessment", label: "Assessment and feedback" },
      { id: "access", label: "Accessibility and accommodations" },
    ],
    options: benefit,
  },
  {
    id: "S10", kind: "single",
    text: "Overall, how do you feel about AI in higher education?",
    options: [
      { id: "very_concerned", label: "Very concerned" },
      { id: "concerned", label: "Somewhat concerned" },
      { id: "neutral", label: "Neutral" },
      { id: "optimistic", label: "Somewhat optimistic" },
      { id: "very_optimistic", label: "Very optimistic" },
    ],
  },
  {
    id: "S11", kind: "text", optional: true,
    text: "Anything else about how you use AI? (optional)",
  },
];

const OTHER = { id: "other", label: "Other" };
const q = (id, tier, table, text, labels) => ({
  id, tier, table, text,
  options: labels.map(([oid, label]) => ({ id: oid, label })).concat(OTHER),
});

// Part B: working-table questions (10 core + 4 optional).
export const questions = [
  q("T1Q2", "core", "Teaching, learning and assessment",
    "Which AI uses should be prohibited, permitted, or required at each stage of an assignment?", [
      ["no_summative", "Prohibited on unsupervised summative assessments"],
      ["brainstorm", "Permitted for brainstorming and topic exploration, with disclosure"],
      ["grammar", "Permitted for grammar and style review only"],
      ["required_literacy", "Required in at least one guided AI-literacy activity"],
      ["per_assignment", "Decided assignment by assignment in the syllabus"],
      ["by_discipline", "Depends on the discipline or course level"],
    ]),
  q("T1Q3", "core", "Teaching, learning and assessment",
    "What evidence should demonstrate a student's learning process when AI is used?", [
      ["drafts", "Drafts or version history"],
      ["prompt_log", "Prompt log or AI chat transcript"],
      ["reflection", "Short reflection on how AI was used"],
      ["oral", "Oral check-in or brief explanation in class"],
      ["in_class", "In-class or supervised component"],
      ["none_low_stakes", "No extra evidence needed for low-stakes work"],
    ]),
  q("T1Q4", "core", "Teaching, learning and assessment",
    "What discipline-specific activity would develop responsible AI skills for students' future work?", [
      ["critique", "Critique or fact-check an AI-generated answer"],
      ["compare", "Compare AI output with expert or textbook sources"],
      ["workplace", "Use AI on a workplace-style task, then justify the result"],
      ["bias", "Identify bias or errors in AI output for the field"],
      ["ethics", "Discuss professional and ethical rules for AI in the field"],
      ["limit", "My discipline should limit AI skill-building"],
    ]),
  q("T2Q1", "core", "Academic integrity and transparency",
    "What should students and employees disclose about their use of AI?", [
      ["tool", "Which tool was used"],
      ["purpose", "What it was used for (task or stage)"],
      ["prompts", "The prompts or a summary of them"],
      ["verification", "How the output was checked or edited"],
      ["minor_exempt", "Nothing for minor uses (spelling, grammar)"],
      ["faculty_too", "Same disclosure rules for faculty-created materials"],
    ]),
  q("T2Q2", "core", "Academic integrity and transparency",
    "What minimum elements should every syllabus AI statement contain, and what rule applies when it is silent?", [
      ["level", "Clear level: prohibited / permitted / required"],
      ["examples", "Examples of allowed and not-allowed uses"],
      ["citation", "How to disclose or cite AI use"],
      ["consequences", "Consequences of misuse and where to ask questions"],
      ["silent_no", "If silent: AI is not permitted"],
      ["silent_yes", "If silent: AI is permitted with disclosure"],
    ]),
  q("T2Q3", "core", "Academic integrity and transparency",
    "What evidence and review steps should be required before a finding of AI-related misconduct?", [
      ["no_detector_only", "Detection tool results never used as sole evidence"],
      ["conversation", "Conversation with the student before any finding"],
      ["compare_work", "Comparison with the student's previous work"],
      ["explain", "Ask the student to explain or reproduce the work"],
      ["procedures", "Follow existing LSC misconduct and grade-appeal procedures"],
      ["educational", "Educational first response for a first offense"],
    ]),
  q("T3Q1", "core", "Data privacy and tools",
    "Which institutional data may be entered into each category of AI tool?", [
      ["no_records", "No student records or grades in any public AI tool"],
      ["public_only", "Only public or de-identified course content in public tools"],
      ["approved_only", "Institutional data only in LSC-approved tools"],
      ["need_list", "I need a clear list of approved tools and data levels"],
      ["unsure", "I'm unsure what counts as confidential data"],
    ]),
  q("T5Q1", "core", "Equity and professional development",
    "What barriers prevent faculty or adjuncts from using AI responsibly?", [
      ["time", "Lack of time"],
      ["training", "Lack of training or examples in my discipline"],
      ["cost", "Cost or no access to paid tools"],
      ["rules", "Unclear institutional rules"],
      ["ethics", "Ethical or pedagogical concerns"],
      ["adjunct_access", "Adjuncts lack equal access to support"],
    ]),
  q("T5Q4", "core", "Equity and professional development",
    "What training formats, time, and recognition would make participation practical?", [
      ["videos", "Short on-demand videos or modules (under 30 min)"],
      ["workshops", "Hands-on workshops by discipline"],
      ["community", "Faculty learning community or AI champions"],
      ["paid", "Paid time or stipend, especially for adjuncts"],
      ["credit", "Professional development credit or recognition"],
      ["flexible", "Evening or online options for different schedules"],
    ]),
  q("T6Q1", "core", "Governance",
    "Which norms should apply across North Harris, and which decisions should remain with a discipline or instructor?", [
      ["campus_privacy", "Campus-wide: data privacy and disclosure rules"],
      ["campus_misconduct", "Campus-wide: misconduct review process"],
      ["discipline_outcomes", "Discipline: what AI use fits learning outcomes"],
      ["instructor_assignment", "Instructor: assignment-level AI rules"],
      ["instructor_all", "Instructor decides everything within LSC policy"],
    ]),
  q("T1Q1", "optional", "Teaching, learning and assessment",
    "Which learning outcomes must students demonstrate through their own thinking, and where does AI accelerate, replace, or distort them?", [
      ["writing", "Core writing and argumentation"],
      ["problem_solving", "Problem solving and calculation"],
      ["reading", "Critical reading and analysis"],
      ["hands_on", "Hands-on, lab, or clinical skills"],
      ["accelerate", "AI can accelerate routine steps without harming outcomes"],
      ["distorts", "AI distorts outcomes in my course"],
    ]),
  q("T2Q4", "optional", "Academic integrity and transparency",
    "What safeguards should apply when AI is used with copyrighted materials, research, or publications?", [
      ["no_upload", "Don't upload copyrighted materials to public AI tools"],
      ["cite", "Cite AI assistance in publications and course materials"],
      ["verify", "Verify all AI-generated facts and references"],
      ["ownership", "Clarify ownership of AI-assisted course materials"],
      ["guidance", "I need guidance from the library or OTS"],
    ]),
  q("T5Q2", "optional", "Equity and professional development",
    "What equivalent alternatives should be available when an AI tool is inaccessible, unaffordable, or declined?", [
      ["non_ai", "A non-AI version of the same assignment"],
      ["free_tool", "A free, LSC-provided tool"],
      ["lab", "Lab or library access to the tool"],
      ["no_penalty", "No penalty for declining a tool's terms"],
      ["accessibility", "Accessibility check before requiring a tool"],
    ]),
  q("T5Q3", "optional", "Equity and professional development",
    "What AI competencies should faculty demonstrate in their roles?", [
      ["explain_limits", "Explain AI limits and risks to students"],
      ["design", "Design assignments that account for AI"],
      ["protect_data", "Protect student data when using AI"],
      ["evaluate", "Evaluate AI output for accuracy and bias"],
      ["save_time", "Use AI to save time on course preparation"],
      ["encourage", "Competencies should be encouraged, not required"],
    ]),
];

export const coreQuestions = questions.filter((x) => x.tier === "core");
export const optionalQuestions = questions.filter((x) => x.tier === "optional");
