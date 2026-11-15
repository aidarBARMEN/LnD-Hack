import { test, expect, type Page } from "@playwright/test";

async function quickProfile(page: Page, kk = false, city = "Алматы") {
  await page.goto(kk ? "/kk" : "/ru");
  await page
    .getByRole("button", { name: kk ? "Балаға" : "Ребёнку", exact: true })
    .click();
  await page.getByRole("checkbox").first().check();
  await page
    .getByRole("button", { name: kk ? "Келесі" : "Далее", exact: true })
    .click();
  await page.getByRole("combobox").selectOption(city);
  await page
    .getByRole("button", { name: kk ? "Келесі" : "Далее", exact: true })
    .click();
  await page.getByRole("spinbutton").fill("5");
  await page
    .getByRole("button", { name: kk ? "Келесі" : "Далее", exact: true })
    .click();
  await page.getByRole("combobox").selectOption("kk");
  await page
    .getByRole("button", {
      name: kk ? "Нұсқаларды көрсету" : "Показать варианты",
      exact: true,
    })
    .click();
}

for (const kk of [false, true]) {
  test(`короткий путь ${kk ? "KK" : "RU"}: условия → профиль → безопасный черновик → план`, async ({
    page,
  }) => {
    await quickProfile(page, kk);
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(page.getByRole("article")).toContainText(kk ? "Әлия" : "Алия");
    await expect(page.getByRole("navigation").getByRole("link")).toHaveCount(4);
    await page.screenshot({
      path: `work/u1-search-${kk ? "kk" : "ru"}-${test.info().project.name}.png`,
      fullPage: false,
    });
    await page
      .getByRole("link", {
        name: kk ? "Маман туралы" : "О специалисте",
        exact: true,
      })
      .click();
    await expect(
      page.getByText(
        kk
          ? /Байланыс, диплом мен тәжірибе тексерілмеген/
          : /Контакт, диплом и опыт не проверялись/,
      ),
    ).toBeVisible();
    await page
      .getByRole("link", {
        name: kk ? "Алғашқы хабарламаны дайындау" : "Подготовить обращение",
        exact: true,
      })
      .click();
    const draft = page.getByRole("textbox");
    await expect(draft).not.toHaveValue(/5/);
    await page
      .getByRole("checkbox", {
        name: kk ? "Баланың жасы" : "Возраст ребёнка",
        exact: true,
      })
      .check();
    await page
      .getByRole("checkbox", {
        name: kk ? "Кездесу тілі" : "Язык встречи",
        exact: true,
      })
      .check();
    await page
      .getByRole("button", {
        name: kk
          ? "Таңдалған мәліметтермен мәтінді құру"
          : "Собрать текст с выбранными сведениями",
        exact: true,
      })
      .click();
    await expect(draft).toHaveValue(/5/);
    await expect(draft).toHaveValue(kk ? /қазақша/ : /казахский/);
    await page.getByRole("checkbox").first().uncheck();
    await page
      .getByRole("button", {
        name: kk
          ? "Таңдалған мәліметтермен мәтінді құру"
          : "Собрать текст с выбранными сведениями",
        exact: true,
      })
      .click();
    await expect(draft).not.toHaveValue(/5/);
    await draft.fill(
      kk
        ? "Сәлеметсіз бе! Бос уақытын нақтылағым келеді."
        : "Здравствуйте! Хочу уточнить свободное время.",
    );
    await expect(
      page
        .getByRole("button", { name: kk ? /көшіру/i : /Скопировать/ })
        .first(),
    ).toBeEnabled();
    await page.getByRole("navigation").getByRole("link").last().click();
    await expect(page.getByRole("checkbox").first()).toBeVisible();
    await page.getByRole("checkbox").first().check();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `work/u1-plan-${kk ? "kk" : "ru"}-${test.info().project.name}.png`,
      fullPage: true,
    });
  });
}

test("Астана/5/kk не получает Алматы; расширение только по действию", async ({
  page,
}) => {
  await quickProfile(page, false, "Астана");
  await expect(page.getByRole("article")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Показать без ограничений", exact: true })
    .click();
  await expect(page.getByRole("article").first()).toBeVisible();
});

test("ПМПК: отклонение не меняет профиль; исправление и подтверждение сохраняют цель", async ({
  page,
}) => {
  await quickProfile(page);
  await page.getByRole("link", { name: "Главная", exact: true }).click();
  await page
    .getByRole("link", { name: "Разобрать пример", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "Выберите пример", exact: true })
    .selectOption("development");
  await expect(page.getByRole("blockquote")).toContainText("учебных навыков");
  await page.getByRole("button", { name: "Отклонить", exact: true }).click();
  await expect(
    page.getByText("Отклонено. Профиль не изменён.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Пересмотреть", exact: true }).click();
  await page
    .getByRole("combobox", {
      name: "Направление поиска — можно исправить",
      exact: true,
    })
    .selectOption("communication");
  await page
    .getByRole("button", { name: "Подтвердить и добавить в план", exact: true })
    .click();
  await expect(
    page.getByRole("button", {
      name: "Подтвердить и добавить в план",
      exact: true,
    }),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Найти варианты", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("navigation").getByRole("link").last().click();
  await expect(
    page.getByText("Посмотреть варианты: Речь и общение", { exact: true }),
  ).toBeVisible();
  await page
    .getByText("Основание: учебный документ · исправлено вами", { exact: true })
    .click();
  await expect(
    page.getByText("Рекомендована поддержка в освоении учебных навыков.", {
      exact: false,
    }),
  ).toBeVisible();
});
