import { validSex, type Sex } from "./sex";
import type { Category } from "../catalog/contracts";
import { emptyFilters, searchOfferings } from "../catalog/service";
import {
  documentNames,
  specialties,
  type CareDetails,
} from "../revision/service";
export interface ChildProfile {
  alias: string;
  sex?: Sex;
  age: number | null;
  city: string;
  language: "" | "ru" | "kk";
  needs: Category[];
  revision: number;
  care?: CareDetails;
}
export const needCodes: Category[] = [
  "communication",
  "development",
  "psychology",
  "mobility",
];
export function validProfile(profile: ChildProfile) {
  return (
    profile.alias.length <= 30 &&
    validSex(profile.sex) &&
    (profile.age === null ||
      (Number.isInteger(profile.age) &&
        profile.age >= 0 &&
        profile.age <= 21)) &&
    ["", "Алматы", "Астана"].includes(profile.city) &&
    ["", "ru", "kk"].includes(profile.language) &&
    profile.needs.every((code) => needCodes.includes(code)) &&
    (!profile.care ||
      ([
        profile.care.diagnosis,
        profile.care.pmpk,
        profile.care.prescriptions,
      ].every((s) => s.length <= 1000) &&
        profile.care.specialists.every((s) => s in specialties) &&
        profile.care.documents.every((s) => documentNames.includes(s)) &&
        profile.care.completedStages.every(
          (n) => Number.isInteger(n) && n >= 0 && n < 4,
        )))
  );
}
export function recommendOfferings(profile: ChildProfile) {
  return searchOfferings({
    ...emptyFilters,
    audience: "child",
    age: profile.age === null ? "" : String(profile.age),
    city: profile.city,
    language: profile.language,
  }).filter(
    (item) => !profile.needs.length || profile.needs.includes(item.category),
  );
}
