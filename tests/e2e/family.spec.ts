import { test, expect, type Page } from "@playwright/test";
import { completeProfile } from "./helpers";
async function fits(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}
test("профиль сохраняет ограничения в новом поиске и после редактирования", async ({
  page,
}) => {
  await page.goto("/ru");
  await completeProfile(page, "ru", "12", true, { language: "kk" });
  await page
    .getByRole("link", { name: "Посмотреть варианты", exact: true })
    .click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("Алия С.");
  await fits(page);
  await page.getByRole("link", { name: "Главная", exact: true }).click();
  await page
    .getByRole("link", { name: "Изменить профиль", exact: true })
    .click();
  await completeProfile(page, "ru", "12", true, {
    city: "Астана",
    language: "kk",
  });
  await page
    .getByRole("link", { name: "Посмотреть варианты", exact: true })
    .click();
  await expect(page.getByRole("article")).toHaveCount(0);
  await page.reload();
  await page.getByRole("link", { name: /^Бірге/ }).click();
  await expect(
    page.getByRole("heading", { name: "Кому нужна поддержка?", exact: true }),
  ).toBeVisible();
});
test("няня: три формата брони, пересечение, отмена и сохранение языка", async ({
  page,
}) => {
  await page.goto("/ru");
  await completeProfile(page, "ru", "5");
  async function openNanny(mode: string) {
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Поиск", exact: true })
      .click();
    await page.getByText("Другие услуги", { exact: true }).click();
    await page.getByRole("link", { name: "Няни", exact: true }).click();
    await page
      .getByRole("combobox", { name: "Формат занятости", exact: true })
      .selectOption(mode);
    await page
      .getByRole("article")
      .filter({ hasText: "Амина С." })
      .getByRole("link", { name: "Забронировать в демо", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", { name: "Формат занятости", exact: true }),
    ).toHaveValue(mode);
  }
  await openNanny("hourly");
  await page
    .getByRole("button", { name: "Создать демо-бронь", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Демо-бронь сохранена", exact: true }),
  ).toBeVisible();
  await openNanny("hourly");
  await page
    .getByRole("button", { name: "Создать демо-бронь", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "пересекающийся период" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Мои бронирования", exact: true })
    .click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Отменить бронь", exact: true })
    .click();
  await expect(page.getByRole("article")).toContainText("Отменено");
  for (const mode of ["monthly", "permanent"]) {
    await openNanny(mode);
    await page
      .getByRole("button", { name: "Создать демо-бронь", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Демо-бронь сохранена", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("link", { name: "Открыть мои бронирования →", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Отменить бронь", exact: true })
      .click();
  }
  await expect(page.getByRole("article")).toHaveCount(3);
  await fits(page);
  await page.getByRole("link", { name: "Қаз", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Менің броньдарым", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(3);
  await page.screenshot({
    path: `work/family-bookings-${test.info().project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
});
test("форум: публикация, правка, комментарий, поиск, жалоба и удаление", async ({
  page,
}) => {
  await page.goto("/ru/community");
  await expect(page.getByRole("article")).toHaveCount(3);
  await page.getByRole("button", { name: "Создать тему", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Название темы", exact: true })
    .fill("Поддержка и расписание");
  await page
    .getByRole("textbox", { name: "Ваше сообщение", exact: true })
    .fill("Учебный вопрос о гибком графике без личных данных.");
  await page
    .getByRole("button", { name: "Опубликовать в демо", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Поддержка и расписание", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Редактировать", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Название темы", exact: true })
    .fill("Гибкий график для мамы");
  await page
    .getByRole("button", { name: "Сохранить изменения", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Ваш комментарий", exact: true })
    .fill("Небольшие шаги помогают организовать досуг.");
  await page
    .getByRole("button", { name: "Добавить комментарий", exact: true })
    .click();
  await expect(
    page.getByText("Небольшие шаги помогают организовать досуг.", {
      exact: true,
    }),
  ).toBeVisible();
  await fits(page);
  await page.getByRole("link", { name: "К сообществу →", exact: true }).click();
  await page
    .getByRole("searchbox", { name: "Поиск", exact: true })
    .fill("организовать досуг");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page
    .getByRole("link", { name: "Открыть обсуждение →", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Удалить комментарий", exact: true })
    .click();
  await expect(
    page.getByText("Пока нет комментариев", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `work/family-community-${test.info().project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Удалить тему", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(3);
  await page
    .getByRole("link", { name: "Открыть обсуждение →", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Пожаловаться", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Жалоба сохранена в демо", exact: true }),
  ).toBeDisabled();
});
