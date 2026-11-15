"use client";
import { recommendOfferings } from "@/features/children/service";
import { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import {
  districts,
  information,
  initialSearch,
  listings,
  publishedListing,
  rating,
  searchListings,
  sections,
  specialties,
  visitQuestions,
  type Listing,
  type Section,
} from "./service";
import NannyScreen from "@/features/nannies/nanny-screen";
export function SearchScreen({
  initialSpecialty = "",
  initialSection = "specialist",
}: {
  initialSpecialty?: string;
  initialSection?: Section;
}) {
  const { providerDraft, childProfile } = useDemo();
  const { locale } = useLocale();
  const [filters, setFilters] = useState({
    ...initialSearch,
    section: initialSection,
    specialty: initialSpecialty,
  });
  const extra = publishedListing(providerDraft);
  const results = searchListings(
    extra ? [...listings, extra] : listings,
    filters,
  ).filter(
    (item) =>
      !childProfile ||
      item.section !== "specialist" ||
      recommendOfferings(childProfile).some(
        (candidate) => candidate.id === item.id,
      ) ||
      item.specialty === "parent",
  );
  const set = (key: keyof typeof filters, value: string | boolean) =>
    setFilters({ ...filters, [key]: value });
  const info = information.filter((i) => i.section === filters.section);
  return (
    <>
      <div className="page-heading">
        <h1>Поиск помощи</h1>
        <p>Выберите раздел. Все исполнители, цены и отзывы — примеры.</p>
      </div>
      <div className="section-tabs" role="group" aria-label="Разделы поиска">
        {Object.entries(sections).map(([code, label]) => (
          <button
            className={`button ${filters.section === code ? "primary" : "light"}`}
            key={code}
            aria-pressed={filters.section === code}
            onClick={() =>
              setFilters({ ...initialSearch, section: code as Section })
            }
          >
            {label}
          </button>
        ))}
      </div>
      {filters.section === "nanny" ? (
        <NannyScreen />
      ) : info.length ? (
        <>
          <p className="notice">
            Справочная информация. Подбор тем не означает назначения услуги или
            подтверждения права на льготу.
          </p>
          {info.map((i) => (
            <article className="profile-panel" key={i.id}>
              <span className="tag">Справочная информация</span>
              <h2>{i.title}</h2>
              <p>{i.description}</p>
              <p className="quiet">
                {childProfile?.care?.documents.includes(
                  "Справка об инвалидности",
                )
                  ? "Вы отметили наличие справки: уточните доступные меры поддержки."
                  : "Вы пока не отметили справку: можно начать с уточнения условий обращения."}
              </p>
              <p>Обновлено: 14.11.2026 · {i.source}</p>
              <a
                className="button light"
                href={i.url}
                target="_blank"
                rel="noreferrer"
              >
                Официальный источник ↗
              </a>
            </article>
          ))}
        </>
      ) : (
        <>
          <section
            className="profile-panel directory-filters"
            aria-label="Фильтры поиска"
          >
            <label className="wide">
              Удобный поиск
              <input
                type="search"
                value={filters.query}
                placeholder="Имя, услуга или методика"
                onChange={(e) => set("query", e.target.value)}
              />
            </label>
            {filters.section === "specialist" && (
              <label>
                Услуга
                <select
                  value={filters.specialty}
                  onChange={(e) => set("specialty", e.target.value)}
                >
                  <option value="">Все специалисты</option>
                  {Object.entries(specialties).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Район Алматы
              <select
                value={filters.district}
                onChange={(e) => set("district", e.target.value)}
              >
                <option value="">Все районы</option>
                {districts.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label>
              Цена до, ₸
              <input
                type="number"
                min="0"
                value={filters.maxPrice}
                onChange={(e) => set("maxPrice", e.target.value)}
              />
            </label>
            <label>
              Рейтинг от
              <select
                value={filters.minRating}
                onChange={(e) => set("minRating", e.target.value)}
              >
                <option value="">Любой</option>
                <option value="4">4 ★</option>
                <option value="4.5">4,5 ★</option>
                <option value="5">5 ★</option>
              </select>
            </label>
            <label>
              Формат
              <select
                value={filters.format}
                onChange={(e) => set("format", e.target.value)}
              >
                <option value="">Любой</option>
                <option>очно</option>
                <option>онлайн</option>
              </select>
            </label>
            <label>
              Язык
              <select
                value={filters.language}
                onChange={(e) => set("language", e.target.value)}
              >
                <option value="">Любой</option>
                <option value="ru">Русский</option>
                <option value="kk">Казахский</option>
              </select>
            </label>
            <label>
              Сортировка
              <select
                value={filters.sort}
                onChange={(e) => set("sort", e.target.value)}
              >
                <option value="distance">По близости — пример</option>
                <option value="rating">По рейтингу</option>
                <option value="price">По цене</option>
              </select>
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={filters.nearby}
                onChange={(e) => set("nearby", e.target.checked)}
              />
              Рядом со мной — пример
            </label>
            <button
              className="button light"
              onClick={() =>
                setFilters({ ...initialSearch, section: filters.section })
              }
            >
              Сбросить поиск
            </button>
            <p className="quiet wide">
              Расстояния учебные: условная точка в Алматы, радиус 3км.
              Местоположение не запрашивается. Цены сравнивайте с учётом единицы
              оплаты.
            </p>
          </section>
          <p role="status">Найдено: {results.length}</p>
          {results.length ? (
            <div className="directory-list">
              {results.map((item) => (
                <article className="messenger-row" key={item.id}>
                  <span className="round-avatar">{item.name[0]}</span>
                  <div>
                    <span className="tag">Пример</span>
                    <h2>{item.name}</h2>
                    <p>{item.description}</p>
                    <p className="quiet">
                      {item.district} · {item.format} ·{" "}
                      {item.languages.join(" / ")} · {item.distance}км — пример
                    </p>
                    <p>
                      {item.price === null
                        ? "Цена уточняется"
                        : `от ${item.price.toLocaleString("ru")} ₸ / ${item.unit}`}{" "}
                      ·{" "}
                      {rating(item)
                        ? `${rating(item).toFixed(1)} ★ (${item.reviews.length})`
                        : "Пока нет отзывов"}
                    </p>
                    <Link
                      className="text-link"
                      href={`/${locale}/search/${item.id}`}
                    >
                      Открыть карточку →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty">
              <h2>Ничего не найдено</h2>
              <p>Попробуйте другой район или уменьшите число условий.</p>
              <button
                className="button light"
                onClick={() =>
                  setFilters({ ...initialSearch, section: filters.section })
                }
              >
                Показать все в разделе
              </button>
            </div>
          )}
        </>
      )}
      <p>
        <Link href={`/${locale}/publish`}>Разместить профиль специалиста</Link>{" "}
        ·{" "}
        <Link href={`/${locale}/catalog?audience=child`}>
          Ранее сохранённый каталог
        </Link>
      </p>
    </>
  );
}
export function ListingScreen({ id }: { id: string }) {
  const { providerDraft, goals, dispatch, notify } = useDemo();
  const { locale } = useLocale();
  const extra = publishedListing(providerDraft);
  const item = (extra ? [...listings, extra] : listings).find(
    (i) => i.id === id,
  );
  if (!item)
    return (
      <div className="empty">
        <h1>Профиль недоступен</h1>
        <p>Учебный профиль мог очиститься после обновления страницы.</p>
        <Link href={`/${locale}/search`}>В поиск</Link>
      </div>
    );
  const saved = goals.some((g) => g.offeringIds.includes(id));
  return (
    <>
      <Link href={`/${locale}/directory?section=${item.section}`}>
        ← В поиск
      </Link>
      <p className="notice">
        Пример. Люди, цены, отзывы и отметки проверки вымышлены. Реальных мест и
        записи здесь нет.
      </p>
      <article className="profile-panel">
        <span className="round-avatar">{item.name[0]}</span>
        <h1>{item.name}</h1>
        <p>{item.description}</p>
        <p>
          {item.district} район · Алматы · {item.format} ·{" "}
          {item.languages
            .map((l) => (l === "ru" ? "русский" : "казахский"))
            .join(", ")}
        </p>
        <p>
          {item.price === null
            ? "Цена уточняется"
            : `от ${item.price.toLocaleString("ru")} ₸ за ${item.unit}`}
        </p>
        <p>
          {rating(item)
            ? `${"★".repeat(Math.round(rating(item)))} ${rating(item).toFixed(1)} · отзывов: ${item.reviews.length}`
            : "Нет отзывов — рейтинг не рассчитан"}
        </p>
        <span className="tag">
          {item.documentsChecked
            ? "Проверка документов — пример бейджа"
            : "Документы не проверены"}
        </span>
        <h2>Подходы и условия</h2>
        <ul>
          {[...item.methods, ...item.details].map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        <div className="actions">
          <Link className="button primary" href={`/${locale}/chats/${id}`}>
            Написать
          </Link>
          <button
            className="button light"
            disabled={saved}
            onClick={() => {
              dispatch({
                type: "add",
                goal: {
                  id: `selected-${id}`,
                  title: `Обсудить встречу: ${item.name}`,
                  done: false,
                  offeringIds: [id],
                  origin: "manual",
                  quote: null,
                  historical: false,
                },
              });
              notify("Специалист сохранён в плане");
            }}
          >
            {saved ? "Сохранено" : "Сохранить в план"}
          </button>
        </div>
      </article>
      <VisitPreparation item={item} />
      <section className="profile-panel">
        <h2>Отзывы — примеры</h2>
        {item.reviews.length ? (
          item.reviews.map((r) => (
            <blockquote key={r.id}>
              <strong>
                {r.author} · {r.score} ★
              </strong>
              <p>{r.text}</p>
            </blockquote>
          ))
        ) : (
          <p>Отзывов пока нет. Оплата тарифа не создаёт рейтинг.</p>
        )}
      </section>
    </>
  );
}
export function VisitPreparation({ item }: { item: Listing }) {
  return (
    <div className="preparation-grid">
      <section className="profile-panel">
        <h2>Что спросит специалист на первом визите</h2>
        <p className="quiet">
          Пример вопросов: каждый специалист проводит знакомство по-своему.
        </p>
        <ul>
          {visitQuestions(item).map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </section>
      <section className="profile-panel">
        <h2>Что взять с собой</h2>
        <ul>
          <li>Ваш список вопросов и целей</li>
          <li>
            Заключение ПМПК и назначения, если есть и вы хотите их показать
          </li>
          <li>Документ родителя и справки — состав уточните у организации</li>
          <li>Привычную вещь ребёнка, если это поможет на знакомстве</li>
        </ul>
      </section>
    </div>
  );
}
