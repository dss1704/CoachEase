export const MACRO_PRESETS = [
  { id: "moderate", label: "Standard / Moderate", protein: 30, carbs: 35, fat: 35 },
  { id: "high-carb", label: "High-carb", protein: 25, carbs: 50, fat: 25 },
  { id: "lower-carb", label: "Lower-carb", protein: 40, carbs: 20, fat: 40 },
  { id: "higher-protein", label: "Higher protein", protein: 30, carbs: 40, fat: 30 },
] as const;
export function macrosFromCalories(calories: number, preset: typeof MACRO_PRESETS[number]) {
  if (!Number.isFinite(calories) || calories <= 0) throw new Error("Enter a calorie target greater than zero.");
  return {
    protein_target: Math.round(calories * preset.protein / 100 / 4),
    carbs_target: Math.round(calories * preset.carbs / 100 / 4),
    fat_target: Math.round(calories * preset.fat / 100 / 9),
  };
}
export function caloriesFromMacros(protein: number, carbs: number, fat: number) {
  if ([protein, carbs, fat].some(value => !Number.isFinite(value) || value < 0)) return null;
  return protein * 4 + carbs * 4 + fat * 9;
}
