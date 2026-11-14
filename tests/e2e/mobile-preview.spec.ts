import { test, expect } from "@playwright/test";
import { completeProfile } from "./helpers";

test("телефон содержит интерактивное приложение и мобильную навигацию", async ({
  page,
}) => {
  await page.goto("/mobile");
  const app = page.frameLocator('iframe[title="Мобильное приложение Бірге"]');
  await expect(
    app.getByRole("heading", { name: "Сначала познакомимся", exact: true }),
  ).toBeVisible();
  await completeProfile(app, "ru", "5");
  await expect(
    app.getByRole("heading", {
      name: "Поддержка нужна всей семье",
      exact: false,
    }),
  ).toBeVisible();
  await app
    .getByRole("navigation")
    .getByRole("link", { name: "Поиск", exact: true })
    .click();
  await expect(
    app.getByRole("heading", { name: "Поиск помощи", exact: true }),
  ).toBeVisible();
  await expect(app.getByRole("navigation").getByRole("link")).toHaveCount(5);
  await app
    .getByRole("navigation")
    .getByRole("link", { name: "Главная", exact: true })
    .click();
  await expect(
    app.getByRole("link", { name: "Изменить профиль", exact: true }),
  ).toBeVisible();
  const fits = await page
    .getByTitle("Мобильное приложение Бірге", { exact: true })
    .evaluate((element) => {
      const frame = element as HTMLIFrameElement;
      return (
        frame.contentWindow!.innerWidth <= 390 &&
        frame.contentDocument!.documentElement.scrollWidth <=
          frame.contentWindow!.innerWidth
      );
    });
  expect(fits).toBe(true);
  await page.screenshot({
    path: `work/phone-preview-${test.info().project.name}.png`,
    fullPage: false,
  });
});
