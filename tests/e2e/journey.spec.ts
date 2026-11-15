import { completeProfile } from "./helpers";
import { test, expect, type Page } from "@playwright/test";

async function fitsViewport(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}

test("главная → каталог → цель → выполнение; изоляция вкладок и refresh", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/ru");
  await completeProfile(page);
  await fitsViewport(page);
  await page.screenshot({
    path: `work/prototype-${test.info().project.name}.png`,
    fullPage: false,
    animations: "disabled",
  });
  await page
    .getByRole("link", { name: "Посмотреть варианты", exact: true })
    .click();
  await page.getByText("Другие услуги", { exact: true }).click();
  await page
    .getByRole("link", { name: "Сравнить варианты", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Кому нужна помощь" }),
  ).toHaveValue("child");
  await page
    .getByRole("combobox", { name: "Город", exact: true })
    .selectOption("Алматы");
  await page
    .getByRole("spinbutton", { name: "Возраст, полных лет" })
    .fill("12");
  await page
    .getByRole("combobox", { name: "Категория помощи", exact: true })
    .selectOption("communication");
  await page.getByRole("combobox", { name: "Язык занятий" }).selectOption("kk");
  await expect(page.getByRole("article")).toHaveCount(1);
  await fitsViewport(page);
  await page.getByRole("button", { name: "Подробнее →", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "speech@example.invalid",
  );
  await page
    .getByRole("button", { name: "Добавить в маршрут", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Уже в маршруте" }),
  ).toBeDisabled();
  await page.getByRole("link", { name: "К маршруту →", exact: true }).click();
  await page
    .getByRole("checkbox", {
      name: "Развитие речи и альтернативной коммуникации",
    })
    .check();
  await expect(page.getByText("Выполнено 1 из 1")).toBeVisible();
  await page.getByText("Добавить своё действие", { exact: true }).click();
  await page
    .getByRole("textbox", { name: "Что вы хотите сделать?" })
    .fill("Найти группу общения");
  await page
    .getByRole("button", { name: "Добавить цель", exact: true })
    .click();
  await expect(page.getByRole("article")).toHaveCount(2);
  await fitsViewport(page);
  const secondTab = await context.newPage();
  await secondTab.goto("/ru/route");
  await expect(secondTab.getByText("Здесь начнётся ваш маршрут")).toBeVisible();
  await secondTab.close();
  await page
    .getByRole("button", { name: "Убрать вариант", exact: true })
    .click();
  await expect(
    page.getByText("speech@example.invalid", { exact: false }),
  ).toHaveCount(0);
  await page
    .getByRole("button", {
      name: "Удалить цель: Найти группу общения",
      exact: true,
    })
    .click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.reload();
  await expect(page.getByText("Здесь начнётся ваш маршрут")).toBeVisible();
  expect(errors).toEqual([]);
});

test("поддержка взрослому, пустая выдача и сброс фильтров", async ({
  page,
}) => {
  await page.goto("/ru");
  await completeProfile(page);
  await page
    .getByRole("link", { name: "Поддержка для меня", exact: true })
    .click();
  await page
    .getByRole("link", {
      name: "Посмотреть поддержку взрослому →",
      exact: true,
    })
    .click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("Дана К.");
  await page
    .getByRole("combobox", { name: "Город", exact: true })
    .selectOption("Астана");
  await expect(page.getByText("Пока нет подходящих вариантов")).toBeVisible();
  await expect(
    page.getByRole("combobox", { name: "Город", exact: true }),
  ).toHaveValue("Астана");
  await page
    .getByRole("button", { name: "Сбросить фильтры", exact: true })
    .last()
    .click();
  await expect(page.getByRole("article")).toHaveCount(7);
});

test("документ: цитаты, принятие, исправление, отклонение и исторический срок", async ({
  page,
}) => {
  await page.goto("/ru/documents");
  await expect(
    page.getByText("Учебный пример · подготовленный результат (fixture)"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Показать учебный разбор" }).click();
  await page
    .getByRole("button", { name: "Исправить", exact: true })
    .first()
    .click();
  await page.getByRole("textbox").fill("Подобрать удобный способ общения");
  await page.getByRole("button", { name: "Подтвердить исправление" }).click();
  await page.getByRole("button", { name: "Отклонить", exact: true }).click();
  await expect(page.getByText("Отклонено", { exact: true })).toBeVisible();
  await fitsViewport(page);
  await page.getByRole("link", { name: "Перейти в мой маршрут →" }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText(
    "Подобрать удобный способ общения",
  );
  await page
    .getByText("Основание: учебный документ · исправлено вами", { exact: true })
    .click();
  await expect(page.locator("blockquote")).toHaveText(
    "Цель: развитие альтернативной коммуникации.",
  );
  await page
    .getByRole("link", {
      name: "Учебный пример ПМПК",
      exact: true,
    })
    .first()
    .click();
  await page
    .getByRole("link", {
      name: "Другие учебные примеры (на русском)",
      exact: true,
    })
    .click();
  await expect(page.getByText("Отклонено", { exact: true })).toBeVisible();
  await page
    .getByRole("combobox", { name: "Выберите учебный документ" })
    .selectOption("expired");
  await page.getByRole("button", { name: "Показать учебный разбор" }).click();
  await expect(
    page.getByText(/Истёк. Запись останется исторической/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Подтвердить и добавить", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Выберите учебный документ" })
    .selectOption("no-facts");
  await page.getByRole("button", { name: "Показать учебный разбор" }).click();
  await expect(
    page.getByText("Цели не найдены", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: /Мой план/, exact: false })
    .first()
    .click();
  await expect(page.getByRole("article")).toHaveCount(2);
  await expect(
    page.getByText(/Историческая рекомендация. Срок истёк/),
  ).toBeVisible();
});
