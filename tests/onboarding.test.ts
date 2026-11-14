import { describe, it, expect } from "vitest";
import {
  validAgeAnswer,
  profileSteps,
} from "../src/features/children/onboarding-flow";
describe("пошаговая анкета", () => {
  it("разрешает пропуск и целый возраст 0–21, отклоняет дробь и выход за границы", () => {
    for (const age of ["", "0", "5", "21"])
      expect(validAgeAnswer(age)).toBe(true);
    for (const age of ["-1", "22", "3.5", "NaN"])
      expect(validAgeAnswer(age)).toBe(false);
  });
  it("без согласия не задаёт медицинские вопросы, обе ветки завершаются проверкой ответов", () => {
    const basic = profileSteps(false);
    expect(basic).not.toContain("diagnosis");
    expect(basic.at(-1)).toBe("review");
    const extended = profileSteps(true);
    expect(extended).toContain("documents");
    expect(extended.at(-1)).toBe("review");
  });
});
