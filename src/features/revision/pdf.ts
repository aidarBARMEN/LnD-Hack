import { sexLabels } from "@/features/children/sex";
import type { ChildProfile } from "@/features/children/service";
import type { RouteGoal } from "@/features/routes/service";
import { offerings } from "@/features/catalog/service";
import {
  listings,
  recommendedSpecialties,
  specialties,
  stages,
} from "./service";
export function familyLines(
  profile: ChildProfile,
  goals: RouteGoal[],
  extraNames: Record<string, string> = {},
) {
  const care = profile.care;
  const ids = [...new Set(goals.flatMap((g) => g.offeringIds))];
  return [
    "Бірге — данные семьи",
    "Пример. Сведения внесены родителем; это не медицинское заключение.",
    "Данные ребёнка",
    `Имя: ${profile.alias || "не указано"}`,
    `Пол: ${sexLabels[profile.sex ?? ""]}`,
    `Возраст: ${profile.age ?? "не указан"}`,
    `Город: ${profile.city || "не указан"}`,
    `Язык: ${profile.language === "kk" ? "казахский" : profile.language === "ru" ? "русский" : "не указан"}`,
    `Диагноз: ${care?.diagnosis || "не указан"}`,
    `Заключение и рекомендации ПМПК: ${care?.pmpk || "не указаны"}`,
    `Назначения: ${care?.prescriptions || "не указаны"}`,
    `Имеющиеся справки: ${care?.documents.join(", ") || "не отмечены"}`,
    "Мой маршрут",
    ...stages.map(
      (s, i) =>
        `${care?.completedStages.includes(i) ? "Пройден" : "Не отмечен"}: ${s}`,
    ),
    "Мой план",
    ...(goals.length
      ? goals.map(
          (g) => `${g.done ? "Выполнено" : "Запланировано"}: ${g.title}`,
        )
      : ["Задачи пока не добавлены"]),
    "Помощь по отметкам профиля",
    ...recommendedSpecialties(profile).map((s) => specialties[s]),
    "Сохранённые специалисты",
    ...(ids.length
      ? ids.map(
          (id) =>
            extraNames[id] ??
            listings.find((i) => i.id === id)?.name ??
            offerings.find((i) => i.id === id)?.name ??
            "Сохранённый учебный вариант",
        )
      : ["Не выбраны"]),
    "Список помощи отражает отметки профиля, а не назначение лечения.",
  ];
}
export async function createFamilyPdf(
  profile: ChildProfile,
  goals: RouteGoal[],
  fontBytes: ArrayBuffer,
  extraNames: Record<string, string> = {},
) {
  const [{ PDFDocument, rgb }, { default: fontkit }] = await Promise.all([
    import("pdf-lib"),
    import("@pdf-lib/fontkit"),
  ]);
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, { subset: true });
  const supported = new Set(font.getCharacterSet());
  let page = pdf.addPage([595, 842]);
  let y = 794;
  for (const raw of familyLines(profile, goals, extraNames)) {
    // Treat input as plain text; control characters cannot become PDF operators.
    const cleaned = raw.replace(/[\u0000-\u001f\u007f]/g, " ");
    let line = "";
    for (const char of Array.from(cleaned)) {
      const safe = supported.has(char.codePointAt(0)!) ? char : "?";
      if (font.widthOfTextAtSize(line + safe, 11) > 499) {
        if (y < 55) {
          page = pdf.addPage([595, 842]);
          y = 794;
        }
        page.drawText(line, {
          x: 48,
          y,
          size: 11,
          font,
          color: rgb(0.1, 0.2, 0.18),
        });
        y -= 17;
        line = "";
      }
      line += safe;
    }
    if (y < 55) {
      page = pdf.addPage([595, 842]);
      y = 794;
    }
    page.drawText(line, {
      x: 48,
      y,
      size: 11,
      font,
      color: rgb(0.1, 0.2, 0.18),
    });
    y -= 25;
  }
  pdf.setTitle("Бірге — данные семьи");
  return pdf.save();
}
export async function downloadFamilyPdf(
  profile: ChildProfile,
  goals: RouteGoal[],
  extraNames: Record<string, string> = {},
) {
  const response = await fetch("/fonts/NotoSans-Regular.ttf");
  if (!response.ok) throw Error("Font unavailable");
  const bytes = await createFamilyPdf(
    profile,
    goals,
    await response.arrayBuffer(),
    extraNames,
  );
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "birge-family-example.pdf";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
