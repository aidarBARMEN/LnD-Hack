import { validSex, type Sex } from "./sex";
import type { TimeFilter } from "@/features/support/service";
export const motherNeeds = [
  "Эмоциональная поддержка",
  "Общение с другими мамами",
  "Время для себя",
  "Помощь в повседневных делах",
];
export interface MotherProfile {
  name: string;
  sex?: Sex;
  age: string;
  city: string;
  language: string;
  needs: string[];
  time: TimeFilter;
  audience: "mother" | "child";
  completed: boolean;
}
export const emptyMother: MotherProfile = {
  name: "",
  age: "",
  city: "",
  language: "",
  needs: [],
  time: "",
  audience: "child",
  completed: false,
};
export function validMother(p: MotherProfile) {
  return (
    p.name.length <= 50 &&
    validSex(p.sex) &&
    (p.age === "" ||
      (Number.isInteger(Number(p.age)) &&
        Number(p.age) >= 0 &&
        Number(p.age) <= 120)) &&
    ["", "Алматы", "Астана"].includes(p.city) &&
    ["", "ru", "kk"].includes(p.language) &&
    p.needs.every((n) => motherNeeds.includes(n)) &&
    ["", "15", "30", "60", "over60"].includes(p.time)
  );
}
