import { test, expect } from "@playwright/test";
test("чат: документы, цитаты, отклонение, подтверждение, поиск и очистка", async ({
  page,
}) => {
  await page.goto("/ru/assistant");
  await page
    .getByRole("button", { name: "С кем проконсультироваться?", exact: true })
    .click();
  await expect(page.getByRole("log")).toContainText("Сначала выберите");
  await page
    .getByRole("checkbox", { name: "ПМПК: развитие общения", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "Заключение без направления", exact: true })
    .check();
  await page
    .getByRole("button", { name: "С кем проконсультироваться?", exact: true })
    .click();
  await expect(page.getByRole("blockquote")).toHaveCount(2);
  await page.getByRole("button", { name: "Отклонить", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Профиль не изменён");
  await page.getByRole("button", { name: "Пересмотреть", exact: true }).click();
  await page
    .getByRole("button", { name: "Подтвердить и добавить в план", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Посмотреть анкеты", exact: true })
    .click();
  await expect(page.getByRole("article").first()).toBeVisible();
  await page
    .getByRole("link", { name: /Учебный пример ПМПК/ })
    .first()
    .click();
  await page
    .getByRole("link", { name: "Открыть учебный чат →", exact: true })
    .click();
  await page.getByRole("textbox").fill("Учебный вопрос о диагнозе");
  await page.getByRole("button", { name: "Спросить", exact: true }).click();
  await expect(page.getByRole("log")).toContainText("не подбираю специалиста");
  await page.getByRole("button", { name: "Очистить чат", exact: true }).click();
  await expect(page.getByRole("log")).not.toContainText(
    "Учебный вопрос о диагнозе",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("чат KK: нет направления — уточнить у автора", async ({ page }) => {
  await page.goto("/kk/assistant");
  await page
    .getByRole("checkbox", {
      name: "Бағыт көрсетілмеген қорытынды",
      exact: true,
    })
    .check();
  await page
    .getByRole("button", { name: "Кіммен кеңесуге болады?", exact: true })
    .click();
  await expect(page.getByRole("log")).toContainText("нақты бағыт жоқ");
  await expect(
    page.getByRole("button", {
      name: "Растау және жоспарға қосу",
      exact: true,
    }),
  ).toHaveCount(0);
});
