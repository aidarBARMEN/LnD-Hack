import { expect, type Page, type FrameLocator } from "@playwright/test";
interface ProfileOptions {
  alias?: string;
  city?: string;
  language?: "ru" | "kk" | "";
  care?: {
    diagnosis?: string;
    pmpk?: string;
    prescriptions?: string;
    documents?: string[];
    specialists?: string[];
  };
}
export async function enterChildBranch(page: Page | FrameLocator) {
  if (
    await page
      .getByRole("textbox", { name: "Как вас зовут?", exact: true })
      .isVisible()
  ) {
    await page
      .getByRole("textbox", { name: "Как вас зовут?", exact: true })
      .fill("Учебная мама");
    await page.getByRole("button", { name: /^Далее/ }).click();
    await page
      .getByRole("radio", { name: "Моему ребёнку", exact: true })
      .check();
    await page.getByRole("button", { name: /^Далее/ }).click();
  }
}
export async function completeProfile(
  page: Page | FrameLocator,
  locale: "ru" | "kk" = "ru",
  age = "12",
  needs = false,
  options: ProfileOptions = {},
) {
  await enterChildBranch(page);
  const kk = locale === "kk";
  const next = () =>
    page
      .getByRole("button", { name: kk ? "Әрі қарай" : "Далее", exact: false })
      .click();
  if (options.alias !== undefined)
    await page
      .getByRole("textbox", {
        name: kk ? "Баланың аты" : "Имя ребёнка",
        exact: true,
      })
      .fill(options.alias);
  await next();
  await page
    .getByRole("spinbutton", {
      name: kk ? "Толық жасы" : "Возраст, полных лет",
      exact: true,
    })
    .fill(age);
  await next();
  await page
    .getByRole("radio", {
      name: kk ? "Көрсетпеу" : "Не указывать",
      exact: true,
    })
    .check();
  await next();
  await page
    .getByRole("radio", { name: options.city ?? "Алматы", exact: true })
    .check();
  await next();
  await page
    .getByRole("radio", {
      name:
        options.language === "kk"
          ? kk
            ? "Қазақша"
            : "Казахский"
          : options.language === "ru"
            ? kk
              ? "Орысша"
              : "Русский"
            : kk
              ? "Әзірше білмеймін"
              : "Пока не знаю",
      exact: true,
    })
    .check();
  await next();
  if (needs)
    await page
      .getByRole("checkbox", {
        name: kk ? "Сөйлеу және қарым-қатынас" : "Речь и общение",
        exact: true,
      })
      .check();
  await next();
  await page
    .getByRole("radio", {
      name: options.care
        ? kk
          ? "Мәлімет қосу"
          : "Добавить сведения"
        : kk
          ? "Кейін толтырамын"
          : "Заполню позже",
      exact: false,
    })
    .check();
  await next();
  if (options.care) {
    for (const [field, label] of [
      ["diagnosis", "Диагноз — как указан в документе"],
      ["pmpk", "Заключение и рекомендации ПМПК"],
      ["prescriptions", "Назначения врача"],
    ] as const) {
      if (options.care[field])
        await page
          .getByRole("textbox", { name: label, exact: true })
          .fill(options.care[field]!);
      await next();
    }
    for (const name of options.care.documents ?? [])
      await page.getByRole("checkbox", { name, exact: true }).check();
    await next();
    if (!kk)
      await expect(
        page.getByText("Какая помощь указана в рекомендациях?", {
          exact: true,
        }),
      ).toHaveCount(1);
    for (const name of options.care.specialists ?? [])
      await page.getByRole("checkbox", { name, exact: true }).check();
    await next();
  }
  await page
    .getByRole("button", {
      name: kk ? "Сақтап, маман таңдау" : "Сохранить и подобрать",
      exact: false,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: kk ? "Қолдау бүкіл отбасына қажет" : "Поддержка нужна всей семье",
      exact: true,
    }),
  ).toBeVisible();
}
