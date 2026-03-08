export type AgeGroup = "10-14" | "15-25" | "25-40" | "unspecified";

export function filterContentByAge(
  content: string,
  ageGroup: AgeGroup
): { filtered: boolean; message: string | null } {
  const adolescentRestricted = [
    "sexual intercourse",
    "contraception_details",
    "fertility_treatment",
    "abortion",
  ];

  if (ageGroup === "10-14") {
    const lower = content.toLowerCase();
    for (const topic of adolescentRestricted) {
      if (lower.includes(topic)) {
        return {
          filtered: true,
          message: "This topic is best discussed with a parent, guardian, or school counselor.",
        };
      }
    }
  }

  return { filtered: false, message: null };
}

export function getResponseComplexity(ageGroup: AgeGroup): {
  level: string;
  instruction: string;
} {
  switch (ageGroup) {
    case "10-14":
      return {
        level: "simple",
        instruction: "Use very simple language, short sentences, avoid medical jargon",
      };
    case "15-25":
      return {
        level: "moderate",
        instruction: "Use clear language with some medical terms explained simply",
      };
    case "25-40":
      return {
        level: "advanced",
        instruction: "Can use medical terminology with brief explanations",
      };
    default:
      return {
        level: "moderate",
        instruction: "Use clear language accessible to general audience",
      };
  }
}
