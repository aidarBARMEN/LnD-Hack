import { it, expect } from "vitest";
import { validSex } from "../src/features/children/sex";
import {
  validProfile,
  type ChildProfile,
} from "../src/features/children/service";
import { familyLines } from "../src/features/revision/pdf";
it("пол необязателен, сохраняется в PDF и валидируется", () => {
  const p: ChildProfile = {
    alias: "Пример",
    age: 5,
    city: "Алматы",
    language: "ru",
    needs: [],
    revision: 1,
  };
  expect(validProfile(p)).toBe(true);
  expect(validProfile({ ...p, sex: "female" })).toBe(true);
  expect(validSex("unexpected")).toBe(false);
  expect(familyLines({ ...p, sex: "male" }, [])).toContain("Пол: Мужской");
});
