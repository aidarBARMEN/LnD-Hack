import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { PDFDocument } from "pdf-lib";
import {
  blankDraft,
  canPublish,
  districts,
  emptyCare,
  initialSearch,
  listings,
  publishedListing,
  rating,
  recommendedSpecialties,
  searchListings,
  visitQuestions,
} from "../src/features/revision/service";
import { createFamilyPdf, familyLines } from "../src/features/revision/pdf";
import {
  validProfile,
  type ChildProfile,
} from "../src/features/children/service";
const profile: ChildProfile = {
  alias: "Учебный ребёнок",
  age: 7,
  city: "Алматы",
  language: "ru",
  needs: ["communication"],
  revision: 1,
  care: {
    ...emptyCare,
    diagnosis: "Пример из документа",
    specialists: ["ergo"],
  },
};
describe("новое ТЗ R1", () => {
  it("помощь следует отметкам, диагноз сам по себе не назначает услугу", () => {
    expect(recommendedSpecialties(profile)).toEqual(["ergo"]);
    expect(
      recommendedSpecialties({
        ...profile,
        needs: [],
        care: { ...emptyCare, diagnosis: "любой текст" },
      }),
    ).toEqual([]);
    expect(
      validProfile({
        ...profile,
        care: { ...emptyCare, pmpk: "a".repeat(1001) },
      }),
    ).toBe(false);
  });
  it("специалисты и дневные центры разделены, все районы представлены в фильтре", () => {
    expect(districts).toHaveLength(8);
    expect(
      searchListings(listings, initialSearch).every(
        (i) => i.section === "specialist",
      ),
    ).toBe(true);
    expect(
      searchListings(listings, { ...initialSearch, section: "daycare" }).map(
        (i) => i.id,
      ),
    ).toEqual(["example-daycare"]);
  });
  it("совмещает услугу, район, цену, язык, рейтинг и пример близости", () => {
    expect(
      searchListings(listings, {
        ...initialSearch,
        specialty: "speech",
        district: "Бостандыкский",
        maxPrice: "8000",
        language: "kk",
        minRating: "4.5",
        nearby: true,
      }).map((i) => i.id),
    ).toEqual(["speech"]);
    expect(
      searchListings(listings, {
        ...initialSearch,
        query: "несуществующий специалист",
      }),
    ).toEqual([]);
    const sorted = searchListings(listings, {
      ...initialSearch,
      sort: "price",
    });
    expect(sorted[0]!.price).toBe(5000);
    expect(
      searchListings(listings, { ...initialSearch, format: "онлайн" }).map(
        (i) => i.specialty,
      ),
    ).toEqual(["parent"]);
  });
  it("не публикует неоплаченный или неполный черновик и не покупает рейтинг", () => {
    expect(canPublish(blankDraft)).toBe(false);
    expect(publishedListing(blankDraft)).toBeNull();
    const draft = {
      ...blankDraft,
      name: "Пример",
      email: "person@example.invalid",
      price: "7000",
      description: "Пример учебного описания",
      documentName: "example.pdf",
      consent: true,
    };
    expect(canPublish(draft)).toBe(true);
    expect(publishedListing(draft)).toBeNull();
    expect(rating(publishedListing({ ...draft, status: "published" })!)).toBe(
      0,
    );
    expect(
      rating(
        publishedListing({ ...draft, status: "published", planId: "team" })!,
      ),
    ).toBe(0);
  });
  it("вопросы первой встречи зависят от типа помощи", () => {
    const speech = listings[0]!;
    const parent = listings.find((i) => i.specialty === "parent")!;
    expect(visitQuestions(speech).length).toBeGreaterThanOrEqual(4);
    expect(visitQuestions(parent)).not.toEqual(visitQuestions(speech));
  });
  it("PDF включает профиль, этапы, задачи и выбранную помощь; длинный текст переносится на страницы", async () => {
    const detailed = {
      ...profile,
      care: {
        ...profile.care!,
        pmpk: "Учебный текст ".repeat(70),
        completedStages: [0, 1],
      },
    };
    const lines = familyLines(detailed, []);
    expect(lines.join("\n")).toContain("Пройден: Диагноз");
    expect(lines).toContain("Эрготерапевт");
    const font = readFileSync("public/fonts/NotoSans-Regular.ttf");
    const bytes = await createFamilyPdf(
      detailed,
      [],
      font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength),
    );
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThan(1);
    expect(doc.getTitle()).toContain("Бірге");
  });
});
