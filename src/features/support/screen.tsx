"use client";

import Link from "next/link";
import { MotherSummary } from "@/features/children/family-intake";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import { LineIcon } from "@/ui/brand-art";
import {
  searchActivities,
  type Stage,
  type TimeFilter,
} from "@/features/support/service";
export default function ForMePage() {
  const { locale, t } = useLocale();
  const { goals, dispatch, notify, supportFilters, setSupportFilters } =
    useDemo();
  const { stage, time } = supportFilters;
  const setStage = (stage: Stage | "") =>
    setSupportFilters((previous) => ({ ...previous, stage }));
  const setTime = (time: TimeFilter) =>
    setSupportFilters((previous) => ({ ...previous, time }));
  const results = searchActivities(stage, time);
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">{locale === "kk" ? "Өзіме" : "Для меня"}</p>
        <h1>
          {locale === "kk" ? "Сізге де қолдау қажет" : "Поддержка нужна и вам"}
        </h1>
        <p className="lead">{t.motherIntro}</p>
      </div>
      <MotherSummary />
      <p className="notice">{t.activityDemo}</p>
      <details className="profile-panel">
        <summary>
          {locale === "kk"
            ? "Қауымдастықтар және ресурстар"
            : "Сообщества и ресурсы"}
        </summary>
        <div className="actions">
          <Link href={`/${locale}/community`}>
            {locale === "kk"
              ? "Бірге ата-аналар қауымдастығы"
              : "Сообщество родителей Бірге"}
          </Link>
          <a href="https://mamapro.kz/" target="_blank" rel="noreferrer">
            Mama Pro ↗
          </a>
          <Link href={`/${locale}/profile/mother`}>
            {locale === "kk"
              ? "Өзім туралы мәліметтер"
              : "Дополнить данные о себе"}
          </Link>
        </div>
        <p>
          {locale === "kk"
            ? "Тәуелсіз ресурстар. Қатысу шарттарын ұйымдастырушыдан нақтылаңыз."
            : "Независимые ресурсы. Условия участия уточняйте у организаторов."}
        </p>
      </details>
      <section className="maternal-filters" aria-label={t.filtersTitle}>
        <label>
          {t.stage}
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as Stage | "")}
          >
            <option value="">{t.stageAll}</option>
            <option value="newborn">{t.newborn}</option>
            <option value="parenting">{t.parenting}</option>
          </select>
        </label>
        <label>
          {t.availableTime}
          <select
            value={time}
            onChange={(e) => setTime(e.target.value as TimeFilter)}
          >
            <option value="">{t.anyTime}</option>
            <option value="15">{t.upTo15}</option>
            <option value="30">{t.upTo30}</option>
            <option value="60">{t.upTo60}</option>
            <option value="over60">{t.over60}</option>
          </select>
        </label>
        <button
          className="button light"
          onClick={() => {
            setStage("");
            setTime("");
          }}
        >
          {t.reset}
        </button>
      </section>
      <p role="status">
        {t.resultCount}: {results.length}
      </p>
      {results.length === 0 ? (
        <div className="empty">
          <h2>{t.noActivities}</h2>
          <p>{t.noActivitiesBody}</p>
        </div>
      ) : (
        <div className="activity-grid">
          {results.map((item) => {
            const saved = goals.some(
              (goal) => goal.id === `activity-${item.id}`,
            );
            return (
              <article className="activity-card" key={item.id}>
                <div className="activity-top">
                  <span className="tag">
                    {item.minutes} {t.minutes} · {t.demo}
                  </span>
                  <span className="activity-icon">
                    <LineIcon
                      name={
                        item.id === "reading" || item.id === "language"
                          ? "book"
                          : item.id === "conversation"
                            ? "heart"
                            : "flower"
                      }
                    />
                  </span>
                </div>
                <h2>{item.title[locale]}</h2>
                <p>{item.description[locale]}</p>
                <button
                  className="button light full"
                  disabled={saved}
                  onClick={() => {
                    dispatch({
                      type: "add",
                      goal: {
                        id: `activity-${item.id}`,
                        title: item.title[locale],
                        done: false,
                        offeringIds: [],
                        origin: "manual",
                        quote: null,
                        historical: false,
                      },
                    });
                    notify(t.activitySavedNotice);
                  }}
                >
                  {saved ? t.activitySaved : t.saveActivity}
                </button>
              </article>
            );
          })}
        </div>
      )}
      <aside className="soft-banner maternal-banner">
        <div>
          <h2>{t.needPerson}</h2>
          <p>{t.needPersonBody}</p>
        </div>
        <Link
          className="button light"
          href={`/${locale}/catalog?audience=adult`}
        >
          {t.adultCatalog}
        </Link>
      </aside>
      <div className="actions">
        <Link className="button primary" href={`/${locale}/route`}>
          {t.openPlan}
        </Link>
      </div>
    </>
  );
}
