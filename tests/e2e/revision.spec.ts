import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { completeProfile } from "./helpers";
test("профиль → этапы → задачи → PDF; без беременности", async ({ page }) => {
  await page.goto("/ru");
  await completeProfile(page, "ru", "7", false, {
    care: {
      diagnosis: "Пример записи врача",
      pmpk: "Учебное заключение для проверки PDF",
      prescriptions: "Учебная запись, не медицинское назначение",
      documents: ["Заключение ПМПК"],
      specialists: ["Логопед"],
    },
  });
  await page.getByRole("link", { name: "Профиль", exact: true }).click();
  await page
    .getByRole("link", { name: "Открыть маршрут", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Мой маршрут", exact: true }).first(),
  ).toBeVisible();
  await page.getByRole("checkbox", { name: "1. Диагноз", exact: true }).check();
  await page
    .getByRole("checkbox", { name: "2. Рекомендации ПМПК", exact: true })
    .check();
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "2");
  await page
    .getByRole("link", { name: "Мой план — ближайшие задачи", exact: true })
    .click();
  await page.getByText("Идеи для плана", { exact: true }).click();
  await page
    .getByRole("button", { name: "+ Взять документы на приём", exact: true })
    .click();
  await page.getByRole("link", { name: "Профиль", exact: true }).click();
  const downloading = page.waitForEvent("download");
  await page.getByRole("button", { name: "Скачать PDF", exact: true }).click();
  const download = await downloading;
  const path = `work/r1-family-${test.info().project.name}.pdf`;
  await download.saveAs(path);
  expect((await readFile(path)).subarray(0, 4).toString()).toBe("%PDF");
  await page.getByRole("link", { name: "Найти", exact: true }).click();
  await page.getByText("Изменить фильтры", { exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Категория помощи", exact: true }),
  ).toHaveValue("communication");
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Для меня", exact: true })
    .click();
  await expect(page.getByText(/беременн/i)).toHaveCount(0);
  await page.getByText("Сообщества и ресурсы", { exact: true }).click();
  await expect(
    page.getByRole("link", { name: /Сообщество родителей Бірге/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("разделы поиска, фильтры, карточка и демо-чат", async ({ page }) => {
  await page.goto("/ru/directory");
  const navContrasts = await page
    .getByRole("navigation")
    .getByRole("link")
    .evaluateAll((links) => {
      const channels = (value: string) => value.match(/[\d.]+/g)!.map(Number);
      const luminance = (rgb: number[]) =>
        rgb
          .slice(0, 3)
          .map((c) => {
            const s = c / 255;
            return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          })
          .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i]!, 0);
      return links.map((link) => {
        let element: Element | null = link;
        let bg = [255, 255, 255];
        while (element) {
          const c = channels(getComputedStyle(element).backgroundColor);
          if (c.length === 3 || c[3] === 1) {
            bg = c;
            break;
          }
          element = element.parentElement;
        }
        const a = luminance(channels(getComputedStyle(link).color));
        const b = luminance(bg);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      });
    });
  for (const contrast of navContrasts)
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  await page
    .getByRole("combobox", { name: "Услуга", exact: true })
    .selectOption("speech");
  await page
    .getByRole("combobox", { name: "Район Алматы", exact: true })
    .selectOption("Бостандыкский");
  await page
    .getByRole("spinbutton", { name: "Цена до, ₸", exact: true })
    .fill("8000");
  await page
    .getByRole("combobox", { name: "Рейтинг от", exact: true })
    .selectOption("5");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page
    .getByRole("link", { name: "Открыть карточку →", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Что спросит специалист на первом визите",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Что взять с собой", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Сохранить в план", exact: true })
    .click();
  await page.getByRole("link", { name: "Написать", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Сообщение", exact: true })
    .fill("Учебный вопрос о времени знакомства");
  await page
    .getByRole("button", { name: "Добавить в демо-чат", exact: true })
    .click();
  await expect(page.getByRole("log")).toContainText("не отправлено");
  await page.getByRole("link", { name: "← Чаты", exact: true }).click();
  await expect(page.getByRole("link", { name: /Алия С/ })).toContainText(
    "Учебный вопрос",
  );
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Поиск", exact: true })
    .click();
  await page.getByText("Другие услуги", { exact: true }).click();
  await page
    .getByRole("link", { name: "Дополнительные разделы", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Центры дневного пребывания", exact: true })
    .click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("Вместе днём");
  for (const section of ["Социальные помощники", "Авто-няня"]) {
    await page.getByRole("button", { name: section, exact: true }).click();
    await expect(page.getByRole("article")).toHaveCount(1);
  }
  await page.getByRole("button", { name: "Господдержка", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Официальный источник ↗", exact: true }),
  ).toHaveCount(2);
  await page.getByRole("button", { name: "Специалисты", exact: true }).click();
  await page
    .getByRole("checkbox", { name: "Рядом со мной — пример", exact: true })
    .check();
  await page
    .getByRole("searchbox", { name: "Удобный поиск", exact: true })
    .fill("Невозможный поиск");
  await expect(
    page.getByRole("heading", { name: "Ничего не найдено", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Показать все в разделе", exact: true })
    .click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: `work/r1-search-${test.info().project.name}.png`,
    fullPage: true,
  });
});
test("черновик специалиста скрыт, демо-оплата публикует без рейтинга", async ({
  page,
}) => {
  await page.goto("/ru/publish");
  await expect(
    page.getByRole("button", { name: "Перейти к демо-оплате", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("textbox", { name: "Имя специалиста", exact: true })
    .fill("Учебный специалист Р1");
  await page
    .getByRole("textbox", { name: "Email — пример", exact: true })
    .fill("teacher@example.invalid");
  await page
    .getByRole("spinbutton", { name: "Цена за занятие, ₸", exact: true })
    .fill("7500");
  await page
    .getByRole("textbox", { name: "О себе и формате помощи", exact: true })
    .fill("Учебное описание формата индивидуальной встречи");
  await page
    .getByLabel("Учебный документ о квалификации (PDF/JPG/PNG, до 5МБ)")
    .setInputFiles({
      name: "example.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4\nExample only"),
    });
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Сохранить черновик", exact: true })
    .click();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Поиск", exact: true })
    .click();
  await page.getByText("Другие услуги", { exact: true }).click();
  await page
    .getByRole("link", { name: "Дополнительные разделы", exact: true })
    .click();
  await page
    .getByRole("searchbox", { name: "Удобный поиск", exact: true })
    .fill("Учебный специалист Р1");
  await expect(page.getByRole("article")).toHaveCount(0);
  await page
    .getByRole("link", { name: "Разместить профиль специалиста", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Перейти к демо-оплате", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Отменить оплату", exact: true })
    .click();
  await expect(
    page.getByText("Черновик — скрыт из поиска", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Перейти к демо-оплате", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Имитировать успешную оплату", exact: true })
    .click();
  await page
    .getByRole("link", {
      name: "Посмотреть опубликованный пример",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Учебный специалист Р1 · пример",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Нет отзывов — рейтинг не рассчитан", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `work/r1-provider-${test.info().project.name}.png`,
    fullPage: false,
  });
});
