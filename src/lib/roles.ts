export type RoleId = "sde-intern" | "data-analyst" | "frontend-developer";

export type RoleMeta = {
  id: RoleId;
  title: string;
  tagline: string;
  level: string;
  focus: string[];
};

export const ROLES: RoleMeta[] = [
  {
    id: "sde-intern",
    title: "SDE Intern",
    tagline: "Fundamentals, problem solving and learning mindset.",
    level: "Student / New grad",
    focus: ["CS fundamentals", "Verbal problem solving", "Projects", "Behavioral", "Motivation"],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    tagline: "SQL, statistics and turning numbers into decisions.",
    level: "Entry to mid level",
    focus: ["SQL", "Statistics", "Business insight", "Visualisation", "Stakeholders"],
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    tagline: "JavaScript depth, framework craft and UI quality.",
    level: "Mid level",
    focus: ["JS fundamentals", "React / Vue", "Real projects", "Collaboration", "Accessibility"],
  },
];

export const getRole = (id: string): RoleMeta | undefined => ROLES.find((role) => role.id === id);

export const TOTAL_QUESTIONS = 5;
