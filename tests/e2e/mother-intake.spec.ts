import { test, expect } from "@playwright/test";
import { completeProfile } from "./helpers";
test("имя мамы → выбор получателя → только вопросы маме → её поддержка", async ({
  page,
}) => {
  await page.goto("/mobile?view=family");
  const app = page.frameLocator('iframe[title="Мобильное приложение Бірге"]');
  const next = () => app.getByRole("button", { name: /^Далее/ }).click();
  await app
    .getByRole("textbox", { name: "Как вас зовут?", exact: true })
    .fill("Учебная Алия");
  await next();
  await expect(
    app.getByRole("heading", { name: "Кому нужна помощь?", exact: true }),
  ).toBeVisible();
  await app
    .getByRole("radio", { name: "Мне — поддержка для мамы", exact: true })
    .check();
  await next();
  await expect(
    app.getByRole("textbox", { name: "Имя ребёнка", exact: true }),
  ).toHaveCount(0);
  await app
    .getByRole("spinbutton", { name: "Ваш возраст, полных лет", exact: true })
    .fill("32");
  await next();
  await app.getByRole("radio", { name: "Женский", exact: true }).check();
  await next();
  await app.getByRole("radio", { name: "Алматы", exact: true }).check();
  await next();
  await app.getByRole("radio", { name: "Русский", exact: true }).check();
  await next();
  await expect(
    app.getByRole("heading", {
      name: "Какая помощь нужна?",
      exact: true,
    }),
  ).toBeVisible();
  await app
    .getByRole("checkbox", { name: "Эмоциональная поддержка", exact: true })
    .check();
  await next();
  await app.getByRole("radio", { name: "До 15 минут", exact: true }).check();
  await next();
  await app
    .getByRole("button", { name: /^Сохранить и показать поддержку/ })
    .click();
  await expect(
    app.getByRole("heading", {
      name: "Учебная Алия, поддержка для вас",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    app.getByRole("link", { name: "Найти психолога для себя", exact: true }),
  ).toBeVisible();
  await expect(
    app.getByRole("combobox", { name: "Сколько у вас времени?", exact: true }),
  ).toHaveValue("15");
  await expect(app.getByText("Пол: Женский", { exact: true })).toBeVisible();
  await page.screenshot({
    path: `work/mother-branch-${test.info().project.name}.png`,
    fullPage: false,
    animations: "disabled",
  });
  await app
    .getByRole("navigation")
    .getByRole("link", { name: "Профиль", exact: true })
    .click();
  await expect(
    app.getByRole("heading", { name: "Профиль мамы", exact: true }),
  ).toBeVisible();
  await app
    .getByRole("link", { name: "Изменить данные о себе", exact: true })
    .click();
  await expect(
    app.getByRole("textbox", { name: "Как вас зовут?", exact: true }),
  ).toHaveValue("Учебная Алия");
  await app.getByRole("link", { name: /^Бірге/ }).click();
  await app.getByRole("button", { name: "Для ребёнка", exact: true }).click();
  await completeProfile(app, "ru", "5", false, { alias: "Учебный ребёнок" });
  await app
    .getByRole("navigation")
    .getByRole("link", { name: "Поиск", exact: true })
    .click();
  await app
    .getByRole("navigation")
    .getByRole("link", { name: "Главная", exact: true })
    .click();
  await expect(
    app.getByRole("heading", {
      name: "Поддержка нужна всей семье",
      exact: true,
    }),
  ).toBeVisible();
});
