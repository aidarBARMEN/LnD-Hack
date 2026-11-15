import { describe, expect, it } from "vitest";
import {
  recommendOfferings,
  type ChildProfile,
} from "@/features/children/service";
const family: ChildProfile = {
  alias: "Пример",
  age: 5,
  city: "Астана",
  language: "kk",
  needs: ["communication"],
  revision: 1,
};
describe("единый подбор по условиям семьи", () => {
  it("не выдаёт Алматы для Астаны и не подменяет возраст", () => {
    expect(recommendOfferings(family)).toEqual([]);
    expect(
      recommendOfferings({ ...family, city: "Алматы" }).map((i) => i.id),
    ).toEqual(["speech"]);
  });
  it("меняет условие только после явного изменения фильтра", () => {
    expect(
      recommendOfferings(family, { city: "Алматы" }).map((i) => i.id),
    ).toEqual(["speech"]);
    expect(family.city).toBe("Астана");
  });
  it("не использует имя и пол для назначения", () => {
    const baseline = { ...family, city: "Алматы" };
    expect(
      recommendOfferings({ ...baseline, alias: "Другое имя", sex: "female" }),
    ).toEqual(recommendOfferings(baseline));
  });
  it("не считает неизвестный возраст подтверждённым совпадением", () => {
    const movement = {
      ...family,
      city: "Алматы",
      needs: ["mobility"] as ChildProfile["needs"],
      language: "" as const,
    };
    expect(recommendOfferings(movement)).toHaveLength(0);
    expect(
      recommendOfferings(movement, { includeUnknown: true }).map((i) => i.id),
    ).toEqual(["movement"]);
  });
});
