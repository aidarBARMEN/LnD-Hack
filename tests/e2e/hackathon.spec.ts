import { completeProfile } from "./helpers";
import { test, expect, type Page } from "@playwright/test";
async function fits(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}
test("дополнительные ширины390и768: два входа и maternal-фильтры без переполнения", async ({
  page,
}) => {
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/kk");
    await completeProfile(page, "kk");
    await expect(
      page.getByRole("heading", { name: "Қолдау бүкіл отбасына қажет" }),
    ).toBeVisible();
    await fits(page);
    await page
      .getByRole("link", { name: "Өзіме қолдау ↗", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", { name: "Өмір кезеңіңіз", exact: true }),
    ).toBeVisible();
    await fits(page);
  }
});
test("сравнение → выбор → обращение, язык сохраняет фильтры и план", async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/ru");
  await completeProfile(page);
  await page
    .getByRole("link", { name: "Помощь ребёнку ↗", exact: true })
    .click();
  await expect(page.getByRole("heading", {name:"Поиск помощи",exact:true})).toBeVisible();
  await page.getByRole("link",{name:"Ранее сохранённый каталог",exact:true}).click();
  await page
    .getByRole("combobox", { name: "Категория помощи", exact: true })
    .selectOption("communication");
  await page
    .getByRole("spinbutton", { name: "Возраст, полных лет" })
    .fill("12");
  await expect(page.getByRole("article")).toHaveCount(3);
  await page
    .getByRole("button", { name: "Сравнить", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Сравнить", exact: true })
    .first()
    .click();
  await page.getByRole("link", { name: "Қаз", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "kk");
  await expect(
    page.getByRole("combobox", { name: "Көмек санаты", exact: true }),
  ).toHaveValue("communication");
  await expect(
    page.getByRole("spinbutton", { name: "Толық жасы" }),
  ).toHaveValue("12");
  await page
    .getByRole("link", { name: "Салыстыру (2/3)", exact: true })
    .click();
  await expect(page.getByRole("article")).toHaveCount(2);
  await fits(page);
  await page
    .getByRole("link", { name: "Профильді ашу →", exact: true })
    .first()
    .click();
  await page.getByText("Тексеру туралы не белгілі", { exact: true }).click();
  await expect(page.getByText(/Құжаттар тексерілмеген/)).toBeVisible();
  await page
    .getByRole("link", { name: "Таңдап, хабар дайындау", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Хабар мәтіні" }),
  ).toBeVisible();
  await expect(page.getByText(/хабар ешкімге жіберілмейді/)).toBeVisible();
  await fits(page);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page
    .getByRole("button", { name: "Сұрақты көшіру", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Ештеңе жіберілген жоқ");
  await page.getByRole("link", { name: "Маршрутқа →", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("link", { name: "Рус", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.getByRole("article")).toHaveCount(1);
  expect(errors).toEqual([]);
});
test("поддержка мамы: материнство, время, личный план и пустое состояние", async ({
  page,
}) => {
  await page.goto("/ru");
  await completeProfile(page);
  await page
    .getByRole("link", { name: "Поддержка для меня ↗", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Время для себя — тоже важно" }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Ваш этап", exact: true })
    .selectOption("parenting");
  await page
    .getByRole("combobox", { name: "Сколько у вас времени?", exact: true })
    .selectOption("15");
  await expect(page.getByRole("article")).toHaveCount(2);
  await fits(page);
  await page
    .getByRole("button", { name: "Добавить в мой план", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Занятие уже в плане", exact: true }),
  ).toBeDisabled();
  await page.getByRole("link", { name: "Қаз", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Өмір кезеңіңіз", exact: true }),
  ).toHaveValue("parenting");
  await expect(page.getByRole("article")).toHaveCount(2);
  await page
    .getByRole("link", { name: "Жоспарымды ашу →", exact: true })
    .click();
  const card = page.getByRole("article");
  await expect(card).toHaveCount(1);
  await expect(card).toContainText("Сүйікті кітаптың бірнеше беті");
  await card.getByRole("checkbox").check();
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "1");
  await fits(page);
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Для меня", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Өмір кезеңіңіз", exact: true })
    .selectOption("newborn");
  await page
    .getByRole("combobox", { name: "Қанша уақытыңыз бар?", exact: true })
    .selectOption("over60");
  await expect(
    page.getByRole("heading", { name: "Бұл шарттарға әзірше идея табылмады" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Сүзгілерді тазарту", exact: true })
    .click();
  await expect(page.getByRole("article")).toHaveCount(6);
  await page.screenshot({
    path: `work/mama-support-${test.info().project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.reload();
  await page
    .getByRole("link", { name: "Жоспарымды ашу →", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Маршрутыңыз осы жерден басталады" }),
  ).toBeVisible();
});
