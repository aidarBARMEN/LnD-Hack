import { describe, expect, it } from "vitest";
import {
  navigatorReply,
  freeTextReply,
  learningDocuments,
} from "@/features/documents/navigator-service";
describe("учебный навигатор", () => {
  it("не придумывает направление без документа или ясной рекомендации", () => {
    expect(navigatorReply("specialist", [], "ru")).toContain(
      "Сначала выберите",
    );
    expect(navigatorReply("specialist", ["unclear"], "ru")).toContain(
      "нет явного направления",
    );
    expect(navigatorReply("specialist", ["missing"], "ru")).toContain(
      "Сначала выберите",
    );
  });
  it("подготовленные рекомендации имеют цитату и страницу", () => {
    for (const doc of learningDocuments.filter((d) => d.category)) {
      expect(doc.quote).toContain("Рекомендованы");
      expect(doc.page).toBeGreaterThan(0);
      expect(doc.specialty).toBeTruthy();
    }
  });
  it("свободный текст не превращается в медицинское назначение", () => {
    expect(freeTextReply("ru")).toContain("не подбираю специалиста");
    expect(freeTextReply("kk")).toContain("ем ұсынбаймын");
  });
});
