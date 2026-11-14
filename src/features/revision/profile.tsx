"use client";
import Link from "next/link";
import { sexLabels } from "@/features/children/sex";
import { MotherSummary } from "@/features/children/family-intake";
import { useState } from "react";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import OnboardingScreen from "@/features/children/onboarding-screen";
import {
  emptyCare,
  publishedListing,
  recommendedSpecialties,
  specialties,
  stages,
} from "./service";
import { downloadFamilyPdf } from "./pdf";
export function Recommendations() {
  const { childProfile } = useDemo();
  const { locale } = useLocale();
  if (!childProfile) return null;
  const codes = recommendedSpecialties(childProfile);
  return (
    <section className="profile-panel">
      <h2>Рекомендуемая коррекционная помощь</h2>
      <p className="quiet">
        По вашим отметкам в профиле. Это список для поиска, а не назначение по
        диагнозу.
      </p>
      {codes.length ? (
        codes.map((code) => (
          <div className="messenger-row" key={code}>
            <span className="round-avatar">{specialties[code][0]}</span>
            <div>
              <strong>{specialties[code]}</strong>
              <small>Выбрано в профиле</small>
            </div>
            <Link
              className="button light"
              href={`/${locale}/search?specialty=${code}`}
            >
              Найти
            </Link>
          </div>
        ))
      ) : (
        <p>
          Отметьте нужную помощь в профиле — здесь появятся ссылки для поиска.
        </p>
      )}
    </section>
  );
}
export function RouteProgress() {
  const { childProfile } = useDemo();
  const { locale } = useLocale();
  const done = childProfile?.care?.completedStages ?? [];
  return (
    <section className="profile-panel">
      <h2>Мой маршрут</h2>
      <p>Пройдено этапов: {done.length} из 4</p>
      <progress value={done.length} max={4} aria-label="Прогресс этапов" />
      <p>
        {stages.map((s, i) => (
          <span className="tag" key={s}>
            {done.includes(i) ? "✓ " : ""}
            {s}
          </span>
        ))}
      </p>
      <Link className="button light" href={`/${locale}/journey`}>
        Открыть маршрут
      </Link>
    </section>
  );
}
export function JourneyScreen() {
  const { childProfile, setChildProfile } = useDemo();
  const { locale } = useLocale();
  if (!childProfile) return <OnboardingScreen />;
  const care = childProfile.care ?? emptyCare;
  const hints = [
    "Сохраните формулировку из документа врача, если он есть. Приложение не устанавливает диагноз.",
    "Психолого-медико-педагогическая комиссия. Запишите заключение и рекомендации, когда они будут у вас.",
    "Запишите назначения врача. Не меняйте их на основании приложения.",
    "Обсудите цели и график со специалистом. Отмечайте шаги в плане.",
  ];
  return (
    <>
      <h1>Мой маршрут</h1>
      <p>
        Отмечайте пройденные этапы сами. Этот ориентир не устанавливает
        обязательную медицинскую последовательность.
      </p>
      <RouteProgress />
      {stages.map((s, i) => (
        <section className="profile-panel" key={s}>
          <label className="check">
            <input
              type="checkbox"
              checked={care.completedStages.includes(i)}
              onChange={(e) =>
                setChildProfile({
                  ...childProfile,
                  care: {
                    ...care,
                    completedStages: e.target.checked
                      ? [...care.completedStages, i]
                      : care.completedStages.filter((n) => n !== i),
                  },
                })
              }
            />
            <strong>
              {i + 1}. {s}
            </strong>
          </label>
          <p>{hints[i]}</p>
          <Link href={`/${locale}/profile/child`}>Дополнить сведения</Link>
        </section>
      ))}
      <Recommendations />
      <Link className="button primary" href={`/${locale}/route`}>
        Мой план — ближайшие задачи
      </Link>
    </>
  );
}
export function ProfileHub() {
  const { childProfile, goals, notify, providerDraft, motherProfile } =
    useDemo();
  const { locale } = useLocale();
  const [busy, setBusy] = useState(false);
  if (!childProfile && motherProfile?.completed)
    return (
      <>
        <h1>Профиль мамы</h1>
        <MotherSummary />
        <Link href={`/${locale}/profile/child`}>Добавить данные ребёнка</Link>
      </>
    );
  if (!childProfile) return <OnboardingScreen />;
  return (
    <>
      <h1>Профиль семьи</h1>
      <p className="notice">
        Пример. Используйте учебные сведения. Обновление страницы очистит
        данные.
      </p>
      <section className="profile-panel">
        <h2>{childProfile.alias || "Ваш ребёнок"}</h2>
        <p>Пол: {sexLabels[childProfile.sex ?? ""]}</p>
        <p>
          {childProfile.city || "Город не указан"} ·{" "}
          {childProfile.age ?? "Возраст не указан"}
          {childProfile.age !== null ? " лет" : ""}
        </p>
        <div className="actions">
          <Link className="button light" href={`/${locale}/profile/child`}>
            Изменить профиль
          </Link>
          <button
            className="button primary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await downloadFamilyPdf(
                  childProfile,
                  goals,
                  publishedListing(providerDraft)
                    ? { "my-demo-profile": providerDraft.name }
                    : {},
                );
                notify("PDF скачан");
              } catch {
                notify("Не удалось создать PDF. Попробуйте ещё раз.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Готовим PDF…" : "Скачать PDF"}
          </button>
        </div>
        <p className="quiet">
          PDF включает сохранённые данные ребёнка, маршрут, задачи, помощь и
          специалистов. Файл создаётся в вашем браузере.
        </p>
      </section>
      <RouteProgress />
      <div className="actions">
        <Link className="button light" href={`/${locale}/route`}>
          Мой план
        </Link>
        <Link className="button light" href={`/${locale}/bookings`}>
          Мои бронирования
        </Link>
        <Link className="button light" href={`/${locale}/publish`}>
          Разместить профиль специалиста
        </Link>
      </div>
      <Recommendations />
    </>
  );
}
export function PlanTemplates() {
  const { goals, dispatch } = useDemo();
  const { locale } = useLocale();
  return (
    <section className="profile-panel">
      <h2>Ближайшие задачи</h2>
      <p>Добавляйте только то, что нужно вашей семье.</p>
      <div className="actions">
        {[
          "Записаться на первую встречу",
          "Уточнить оформление справки",
          "Взять документы на приём",
        ].map((title, i) => (
          <button
            className="button light"
            key={title}
            disabled={goals.some((g) => g.id === `task-${i}`)}
            onClick={() =>
              dispatch({
                type: "add",
                goal: {
                  id: `task-${i}`,
                  title,
                  done: false,
                  offeringIds: [],
                  origin: "manual",
                  quote: null,
                  historical: false,
                },
              })
            }
          >
            {goals.some((g) => g.id === `task-${i}`) ? "✓ " : "+ "}
            {title}
          </button>
        ))}
      </div>
      <Link href={`/${locale}/journey`}>Мой маршрут — этапы помощи →</Link>
    </section>
  );
}
