import { test, expect } from "@playwright/test";
import { enterChildBranch } from "./helpers";
test("анкета телефона: возраст, возврат, выбор, правка ответа и подбор", async ({
  page,
}) => {
  await page.goto("/mobile");
  const app = page.frameLocator('iframe[title="Мобильное приложение Бірге"]');
  await enterChildBranch(app);
  const next = () => app.getByRole("button", { name: /^Далее/ }).click();
  await app
    .getByRole("textbox", {
      name: "Имя ребёнка",
      exact: true,
    })
    .fill("Пример ребёнка");
  await next();
  await app
    .getByRole("spinbutton", { name: "Возраст, полных лет", exact: true })
    .fill("3.5");
  await next();
  await expect(
    app.getByRole("alert").filter({ hasText: "целое число" }),
  ).toBeVisible();
  await app.getByRole("spinbutton").fill("6");
  await app.getByRole("button", { name: "Назад", exact: true }).click();
  await expect(app.getByRole("textbox")).toHaveValue("Пример ребёнка");
  await next();
  await expect(app.getByRole("spinbutton")).toHaveValue("6");
  await next();
  await app.getByRole("radio", { name: "Мужской", exact: true }).check();
  await next();
  await app.getByRole("radio", { name: "Алматы", exact: true }).check();
  await next();
  await app.getByRole("radio", { name: "Казахский", exact: true }).check();
  await next();
  await app
    .getByRole("checkbox", { name: "Речь и общение", exact: true })
    .check();
  await next();
  await next();
  await expect(
    app.getByRole("heading", { name: "Проверьте ответы", exact: true }),
  ).toBeVisible();
  await app
    .getByRole("button", { name: "Изменить: Возраст, полных лет", exact: true })
    .click();
  await app.getByRole("spinbutton").fill("7");
  await next();
  await expect(
    app.getByRole("heading", { name: "Проверьте ответы", exact: true }),
  ).toBeVisible();
  await expect(app.getByText("Мужской", { exact: true })).toBeVisible();
  await page.screenshot({
    path: `work/typeform-review-${test.info().project.name}.png`,
    fullPage: false,
    animations: "disabled",
  });
  await app.getByRole("button", { name: /^Сохранить и подобрать/ }).click();
  await expect(
    app.getByRole("link", { name: "Изменить профиль", exact: true }),
  ).toBeVisible();
  await expect(
    app.getByText("Алматы · 7 лет · Казахский", { exact: true }),
  ).toBeVisible();
  await expect(app.getByRole("navigation")).toBeVisible();
});
test("все вопросы можно пропустить и навигация не мешает заполнению", async ({
  page,
}) => {
  await page.goto("/mobile");
  const app = page.frameLocator('iframe[title="Мобильное приложение Бірге"]');
  await enterChildBranch(app);
  await expect(app.getByRole("navigation")).toBeHidden();
  await page.screenshot({
    path: `work/typeform-phone-${test.info().project.name}.png`,
    fullPage: false,
    animations: "disabled",
  });
  for (let i = 0; i < 7; i++)
    await app.getByRole("button", { name: "Пропустить", exact: true }).click();
  await expect(
    app.getByRole("heading", { name: "Проверьте ответы", exact: true }),
  ).toBeVisible();
  await app.getByRole("button", { name: /^Сохранить и подобрать/ }).click();
  await expect(
    app.getByRole("heading", {
      name: "Поддержка нужна всей семье",
      exact: true,
    }),
  ).toBeVisible();
  const fits = await page
    .getByTitle("Мобильное приложение Бірге", { exact: true })
    .evaluate((e) => {
      const frame = e as HTMLIFrameElement;
      return (
        frame.contentDocument!.documentElement.scrollWidth <=
        frame.contentWindow!.innerWidth
      );
    });
  expect(fits).toBe(true);
});
