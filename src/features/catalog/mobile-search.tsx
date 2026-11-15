"use client";
import { recommendOfferings } from "@/features/children/service";
import { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import { categoryLabels } from "@/locales/messages";
import { emptyFilters, searchOfferings } from "./service";
import { localizeOffering } from "./translations";
import type { Filters } from "./contracts";

export default function MobileSearch({
  category = "",
  adult = false,
}: {
  category?: string;
  adult?: boolean;
}) {
  const { childProfile, filtersByAudience, setFiltersByAudience } = useDemo();
  const { locale, t } = useLocale();
  const kk = locale === "kk";
  const [all, setAll] = useState(false);
  const personal = !adult && !all && !!childProfile;
  const key = `unified:${adult}:${category}:${personal ? childProfile.revision : "all"}`;
  const initial: Filters = {
    ...emptyFilters,
    audience: adult ? "adult" : "child",
    category,
    ...(personal
      ? {
          city: childProfile.city,
          age: childProfile.age === null ? "" : String(childProfile.age),
          language: childProfile.language,
        }
      : {}),
  };
  const filters = filtersByAudience[key] ?? initial;
  const results = personal
    ? recommendOfferings(childProfile, filters)
    : searchOfferings(filters);
  function change<K extends keyof Filters>(field: K, value: Filters[K]) {
    setFiltersByAudience((p) => ({
      ...p,
      [key]: { ...filters, [field]: value },
    }));
  }
  return (
    <div className="mobile-search">
      <h1>
        {kk ? "Сұранысыңызға сай нұсқалар" : "Варианты по вашему запросу"}
      </h1>
      <p>
        {kk
          ? "Барлық анкеталар — оқу мысалдары."
          : "Все анкеты — учебные примеры."}
      </p>
      <p className="notice">
        {[
          filters.city,
          filters.age !== "" ? `${filters.age} ${t.years}` : "",
          filters.language === "kk"
            ? "Қазақша"
            : filters.language === "ru"
              ? "Русский"
              : "",
          filters.category
            ? categoryLabels(locale)[
                filters.category as keyof ReturnType<typeof categoryLabels>
              ]
            : "",
        ]
          .filter(Boolean)
          .join(" · ") || (kk ? "Шектеусіз іздеу" : "Поиск без ограничений")}
      </p>
      <label>
        {kk ? "Іздеу" : "Поиск"}
        <input
          type="search"
          value={filters.query ?? ""}
          onChange={(e) => change("query", e.target.value)}
          placeholder={kk ? "Аты, қызмет немесе қала" : "Имя, услуга или город"}
        />
      </label>
      <details className="profile-panel compact-filters">
        <summary>{kk ? "Сүзгілерді өзгерту" : "Изменить фильтры"}</summary>
        <label>
          {t.city}
          <select
            value={filters.city}
            onChange={(e) => change("city", e.target.value)}
          >
            <option value="">{t.anyCity}</option>
            <option>Алматы</option>
            <option>Астана</option>
          </select>
        </label>
        <label>
          {t.age}
          <input
            type="number"
            min="0"
            max="99"
            value={filters.age}
            onChange={(e) => change("age", e.target.value)}
          />
        </label>
        <label>
          {t.category}
          <select
            value={filters.category}
            onChange={(e) => change("category", e.target.value)}
          >
            <option value="">{t.anyCategory}</option>
            {Object.entries(categoryLabels(locale)).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t.lessonLanguage}
          <select
            value={filters.language}
            onChange={(e) => change("language", e.target.value)}
          >
            <option value="">{t.anyLanguage}</option>
            <option value="ru">Русский</option>
            <option value="kk">Қазақша</option>
          </select>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={filters.includeUnknown}
            onChange={(e) => change("includeUnknown", e.target.checked)}
          />
          {t.unknownAgeToggle}
        </label>
        <button
          className="button light"
          onClick={() =>
            setFiltersByAudience((p) => ({ ...p, [key]: initial }))
          }
        >
          {t.reset}
        </button>
      </details>
      <p role="status">
        {t.resultCount}: {results.length}
      </p>
      {!results.length && (
        <section className="empty">
          <h2>{t.noResults}</h2>
          <p>
            {kk
              ? "Шарттарды өзгертіңіз немесе басқа нұсқаларды бөлек қараңыз. Біз қала мен жасты өздігінен өзгертпейміз."
              : "Измените условия или отдельно посмотрите другие варианты. Мы не меняем город и возраст автоматически."}
          </p>
          <button
            className="button light"
            onClick={() => {
              setAll(true);
              setFiltersByAudience((p) => ({
                ...p,
                [`unified:${adult}:${category}:all`]: {
                  ...emptyFilters,
                  audience: adult ? "adult" : "child",
                },
              }));
            }}
          >
            {kk ? "Шектеусіз көрсету" : "Показать без ограничений"}
          </button>
        </section>
      )}
      <div className="quick-results">
        {results.map((raw) => {
          const item = localizeOffering(raw, locale);
          return (
            <article className="profile-panel" key={item.id}>
              <span className="tag">{t.demo}</span>
              <h2>{item.name}</h2>
              <p>{item.service}</p>
              <p>
                {item.city} ·{" "}
                {item.ages ? `${item.ages.join("–")} ${t.years}` : t.unknownAge}{" "}
                · {item.languages?.join(" / ") ?? t.unknownLanguage}
              </p>
              <strong>{item.price}</strong>
              <p className="quiet">
                {kk
                  ? "Көрсетілген іздеу шарттарына сәйкес. Бос уақыт пен қолжетімділікті нақтылау керек."
                  : "Соответствует указанным условиям поиска. Свободное время и доступность нужно уточнить."}
              </p>
              <Link
                className="button primary"
                href={`/${locale}/providers/${item.id}`}
              >
                {kk ? "Маман туралы" : "О специалисте"}
              </Link>
            </article>
          );
        })}
      </div>
      <details className="profile-panel">
        <summary>{kk ? "Басқа қызметтер" : "Другие услуги"}</summary>
        <div className="actions">
          <Link href={`/${locale}/nannies`}>
            {kk ? "Бала күтушілер" : "Няни"}
          </Link>
          <Link href={`/${locale}/directory`}>
            {kk ? "Қосымша бөлімдер (орысша)" : "Дополнительные разделы"}
          </Link>
          <Link
            href={`/${locale}/catalog?audience=${adult ? "adult" : "child"}`}
          >
            {kk ? "Нұсқаларды салыстыру" : "Сравнить варианты"}
          </Link>
        </div>
      </details>
    </div>
  );
}
