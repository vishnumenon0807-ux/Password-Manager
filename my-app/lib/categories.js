export const CATEGORIES = [
  "Email",
  "Social",
  "Work",
  "Banking",
  "Shopping",
  "Entertainment",
  "Development",
  "Education",
  "Other",
];

export function normaliseCategory(value) {
  return CATEGORIES.includes(value) ? value : "Other";
}
