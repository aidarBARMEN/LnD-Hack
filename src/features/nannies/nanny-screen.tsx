"use client";
import { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import OnboardingScreen from "@/features/children/onboarding-screen";
import { searchNannies, type BookingMode } from "./service";
import { LineIcon } from "@/ui/brand-art";
import { districts, nannyDetails } from "@/features/revision/service";
export default function NannyScreen() {
  const { childProfile } = useDemo();
  const { locale, t, f } = useLocale();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState(childProfile?.city ?? "");
  const [language, setLanguage] = useState<string>(
    childProfile?.language ?? "",
  );
  const [mode, setMode] = useState<BookingMode | "">("");
  const [maxHourly, setMaxHourly] = useState("");
  const [byProfile, setByProfile] = useState(true);
  const [district, setDistrict] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sort, setSort] = useState("distance");
  const [nearby, setNearby] = useState(false);
  if (!childProfile) return <OnboardingScreen />;
  const results = searchNannies({
    query,
    city,
    language,
    mode,
    maxHourly: mode === "monthly" || mode === "permanent" ? "" : maxHourly,
    profile: byProfile ? childProfile : null,
  })
    .filter(
      (n) =>
        (!district || nannyDetails[n.id]?.district === district) &&
        (!minRating || nannyDetails[n.id]!.score >= Number(minRating)) &&
        (!nearby || nannyDetails[n.id]!.distance <= 3),
    )
    .sort((a, b) =>
      sort === "price"
        ? (a.rates.hourly ?? Infinity) - (b.rates.hourly ?? Infinity)
        : sort === "rating"
          ? nannyDetails[b.id]!.score - nannyDetails[a.id]!.score
          : nannyDetails[a.id]!.distance - nannyDetails[b.id]!.distance,
    );
  return (
    <>
      <div className="page-heading">
        <h1>{f.nannies}</h1>
        <p className="lead">{f.nannyLead}</p>
        <div className="actions">
          <Link className="button light" href={`/${locale}/bookings`}>
            {f.viewBookings}
          </Link>
          <Link href={`/${locale}/profile/child`} className="text-link">
            {f.editProfile}
          </Link>
        </div>
      </div>
      <p className="notice">{f.nannyDemo}</p>
      <div className="nanny-filters">
        <label>
          Район Алматы
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option value="">Все районы</option>
            {districts.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          Рейтинг от
          <select
            value={minRating}
            onChange={(e) => setMinRating(e.target.value)}
          >
            <option value="">Любой</option>
            <option value="4">4 ★</option>
            <option value="5">5 ★</option>
          </select>
        </label>
        <label>
          Сортировка
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="distance">По близости — пример</option>
            <option value="price">По почасовой цене</option>
            <option value="rating">По рейтингу</option>
          </select>
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={nearby}
            onChange={(e) => setNearby(e.target.checked)}
          />
          Рядом со мной — пример до 3км
        </label>
        <label>
          {f.search}
          <input
            type="search"
            placeholder={f.nannyQuery}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          {f.mode}
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as BookingMode | "")}
          >
            <option value="">{f.anyMode}</option>
            {(["hourly", "monthly", "permanent"] as const).map((m) => (
              <option key={m} value={m}>
                {f[m]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {f.city}
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">{t.anyCity}</option>
            <option>Алматы</option>
            <option>Астана</option>
          </select>
        </label>
        <label>
          {f.language}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">{t.anyLanguage}</option>
            <option value="ru">{t.russian}</option>
            <option value="kk">{t.kazakh}</option>
          </select>
        </label>
        {mode !== "monthly" && mode !== "permanent" && (
          <label>
            {f.hourlyBudget}
            <input
              type="number"
              min={0}
              value={maxHourly}
              onChange={(e) => setMaxHourly(e.target.value)}
              placeholder={f.anyBudget}
            />
          </label>
        )}
        <label className="check">
          <input
            type="checkbox"
            checked={byProfile}
            onChange={(e) => setByProfile(e.target.checked)}
          />
          {f.profileNannies}
        </label>
        <button
          className="button light"
          onClick={() => {
            setQuery("");
            setCity("");
            setLanguage("");
            setMode("");
            setMaxHourly("");
            setByProfile(false);
            setDistrict("");
            setMinRating("");
            setSort("distance");
            setNearby(false);
          }}
        >
          {f.reset}
        </button>
      </div>
      <p role="status">
        {t.resultCount}: {results.length}
      </p>
      {results.length === 0 ? (
        <div className="empty">
          <h2>{f.noNannies}</h2>
        </div>
      ) : (
        <div className="nanny-grid">
          {results.map((n) => (
            <article key={n.id} className="offering-card nanny-card">
              <div className="card-top">
                <span className="tag">{t.demo}</span>
                <span>{n.city}</span>
              </div>
              <div className="provider-heading">
                <span className="provider-avatar">
                  <LineIcon name="person" />
                </span>
                <h2>{n.name[locale]}</h2>
              </div>
              <p>{n.skills[locale]}</p>
              <p>
                {nannyDetails[n.id]!.age} лет · опыт{" "}
                {nannyDetails[n.id]!.experience} лет ·{" "}
                {nannyDetails[n.id]!.district || n.city}
              </p>
              <p>{nannyDetails[n.id]!.score} ★ · 1 отзыв — пример</p>
              <details>
                <summary>Квалификация, график и отзывы</summary>
                <p>{nannyDetails[n.id]!.courses}</p>
                <p>{nannyDetails[n.id]!.support}</p>
                <p>{nannyDetails[n.id]!.schedule}</p>
                <blockquote>
                  Пример отзыва: заранее обсудили распорядок и удобное время.
                  Оценка {nannyDetails[n.id]!.score} из 5.
                </blockquote>
                <p>
                  Возраст, опыт, расстояние, курс и отзыв — учебные сведения,
                  документы не проверены.
                </p>
              </details>
              <Link className="button light" href={`/${locale}/chats/${n.id}`}>
                Написать
              </Link>
              <div className="chips">
                <span>
                  {n.ages[0]}–{n.ages[1]} {t.years}
                </span>
                <span>
                  {n.languages
                    .map((l) => (l === "ru" ? t.russian : t.kazakh))
                    .join(" / ")}
                </span>
              </div>
              <dl className="nanny-rates">
                {n.modes.map((m) => (
                  <div key={m}>
                    <dt>{f[m]}</dt>
                    <dd>
                      {n.rates[m] === null
                        ? f.negotiable
                        : `${new Intl.NumberFormat(locale).format(n.rates[m]!)} ₸ ${m === "hourly" ? f.perHour : f.perMonth}`}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="quiet">{f.nannyUnverified}</p>
              <Link
                className="button primary full"
                href={`/${locale}/nannies/${n.id}/book${mode ? `?mode=${mode}` : ""}`}
              >
                {f.book}
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
