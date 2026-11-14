import { describe, expect, it } from "vitest";
import { toggleComparison } from "../src/features/catalog/comparison";
import { offerings } from "../src/features/catalog/service";
import { localizeOffering } from "../src/features/catalog/translations";
import { activities, searchActivities } from "../src/features/support/service";
import { messages, parseLocale } from "../src/locales/messages";
describe("простой сценарий хакатона", () => {
  it("сравнение ограничено тремя вариантами, повтор убирает, а не дублирует", () => {
    let ids: string[] = [];
    for (const id of ["speech", "steps", "early", "balance"])
      ids = toggleComparison(ids, id);
    expect(ids).toEqual(["speech", "steps", "early"]);
    expect(toggleComparison(ids, "steps")).toEqual(["speech", "early"]);
  });
  it("каждая карточка имеет казахский текст без подмены языка занятий", () => {
    for (const item of offerings) {
      const translated = localizeOffering(item, "kk");
      expect(translated.service).not.toBe(item.service);
      expect(translated.languages).toEqual(item.languages);
      expect(translated.contact).toMatch(/example\.invalid$/);
    }
    expect(Object.keys(messages.ru).sort()).toEqual(
      Object.keys(messages.kk).sort(),
    );
    expect(parseLocale("en")).toBeNull();
  });
  it("границы времени не пересекаются и вместе покрывают все занятия", () => {
    const ids = ["15", "30", "60", "over60"].flatMap((time) =>
      searchActivities("", time as "15" | "30" | "60" | "over60").map(
        (item) => item.id,
      ),
    );
    expect(ids).toHaveLength(activities.length);
    expect(new Set(ids).size).toBe(activities.length);
    expect(searchActivities("", "15").every((item) => item.minutes <= 15)).toBe(
      true,
    );
    expect(
      searchActivities("", "30").every(
        (item) => item.minutes > 15 && item.minutes <= 30,
      ),
    ).toBe(true);
    expect(searchActivities("newborn", "over60")).toEqual([]);
  });
  it("этап жизни фильтрует занятия", () => {
    expect(searchActivities("newborn", "").length).toBeLessThan(
      activities.length,
    );
    for (const item of activities) {
      expect(item.title.ru.trim()).not.toBe("");
      expect(item.title.kk.trim()).not.toBe("");
    }
  });
});
