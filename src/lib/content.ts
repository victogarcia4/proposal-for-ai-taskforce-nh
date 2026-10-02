export const sources = [
  {
    id: "ots-guidance",
    title: "LSC OTS AI guidelines",
    url: "https://www.lonestar.edu/OTS-AI-Guidelines",
    kind: "Institutional guidance",
  },
  {
    id: "ots-tools",
    title: "LSC tools and data classification",
    url: "https://www.lonestar.edu/OTS-AI-Tools",
    kind: "Institutional guidance",
  },
  {
    id: "policy",
    title: "LSC Policy Manual",
    url: "https://www.lonestar.edu/policy.htm",
    kind: "Institutional policy",
  },
  {
    id: "acc",
    title: "Austin Community College syllabus guidance",
    url: "https://offices.austincc.edu/institutional-effectiveness-and-grant-development/master-syllabi/artificial-intelligence-draft-policies/",
    kind: "External example",
  },
  {
    id: "collegeboard",
    title: "College Board faculty AI research, 2025",
    url: "https://research.collegeboard.org/media/pdf/ai-research-brief-3-vf.pdf",
    kind: "National research",
  },
  {
    id: "aacu",
    title: "AAC&U / Elon faculty survey, 2025 (non-scientific)",
    url: "https://www.aacu.org/newsroom/national-survey-95-of-college-faculty-fear-student-overreliance-on-ai-and-diminished-critical-thinking-among-learners-who-use-generative-ai-tools",
    kind: "National research",
  },
  {
    id: "wcet",
    title: "WCET institutional practices, 2025",
    url: "https://wcet.wiche.edu/wp-content/uploads/sites/11/2025/08/WCET-Supporting-Governance-Operations-and-Instruction-and-Learning-Through-AI-2025.pdf",
    kind: "National research",
  },
  {
    id: "ele",
    title: "Every Learner Everywhere faculty development playbook",
    url: "https://www.everylearnereverywhere.org/blog/10-best-practices-for-generative-ai-faculty-development-insights-from-the-field/",
    kind: "External example",
  },
  {
    id: "ccdaily",
    title: "Faculty-led AI decision-making",
    url: "https://www.ccdaily.com/2025/02/empowering-faculty-to-lead-ai-decision-making/",
    kind: "External example",
  },
  {
    id: "nist",
    title: "NIST AI Risk Management Framework playbook",
    url: "https://www.nist.gov/itl/ai-risk-management-framework/nist-ai-rmf-playbook",
    kind: "Voluntary framework",
  },
];
export const briefings = [
  [
    "OTS asks faculty to explain AI expectations to students and take responsibility for published AI content.",
    "Faculty experience and discipline shape views about AI. Discuss whether AI accelerates, replaces, or distorts each learning outcome.",
    ["ots-guidance", "collegeboard", "ccdaily"],
  ],
  [
    "Existing academic misconduct and grade-appeal procedures remain the authority; read the relevant policy section before relying on it.",
    "ACC provides a syllabus model and cautions that detection tools cannot be the sole evidence of dishonesty.",
    ["policy", "ots-guidance", "acc"],
  ],
  [
    "OTS owns tool approvals and data classifications. Consult the live tool list and contact OTS before procurement; do not enter confidential data into public AI tools.",
    "NIST offers a voluntary Govern, Map, Measure, Manage structure. External guidance does not approve tools for LSC.",
    ["ots-tools", "ots-guidance", "nist"],
  ],
  [
    "Employees remain responsible for AI content they publish; tool requests and data questions go to OTS.",
    "Staff training and workload need explicit attention. WCET found that support for staff can lag faculty support.",
    ["ots-guidance", "wcet"],
  ],
  [
    "Existing accommodation procedures and institutional guidance apply; verify the applicable policy sections with institutional reviewers.",
    "Limited time and knowledge are major barriers. Provide alternatives and practical support for adjuncts and staff.",
    ["policy", "ele", "aacu"],
  ],
  [
    "The Policy Manual controls over inconsistent college guidelines. The committee recommends; it cannot change board policy or approve tools.",
    "Participatory governance benefits from continuing idea-shares, human review, and short review cycles.",
    ["policy", "wcet", "ele"],
  ],
] as const;
