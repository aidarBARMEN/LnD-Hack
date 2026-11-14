import { it, expect } from "vitest";
import {
  emptyMother,
  validMother,
} from "../src/features/children/mother-profile";
it("профиль мамы не требует данных ребёнка и проверяет возраст/выбор", () => {
  expect(
    validMother({
      ...emptyMother,
      name: "Пример",
      age: "32",
      needs: ["Время для себя"],
    }),
  ).toBe(true);
  expect(validMother({ ...emptyMother, age: "32.5" })).toBe(false);
  expect(validMother({ ...emptyMother, age: "-1" })).toBe(false);
  expect(validMother({ ...emptyMother, needs: ["неизвестный ответ"] })).toBe(
    false,
  );
});
