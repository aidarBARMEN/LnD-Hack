"use client";
import { listings, publishedListing } from "@/features/revision/service";
import { PlanTemplates } from "@/features/revision/profile";
import { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import { offerings } from "@/features/catalog/service";
import { localizeOffering } from "@/features/catalog/translations";
import { activities } from "@/features/support/service";
export default function RoutePage() {
  const { goals, dispatch, notify, providerDraft } = useDemo();
  const { locale, t } = useLocale();
  const [title, setTitle] = useState("");
  const completed = goals.filter((g) => g.done).length;
  return (
    <>
      <div className="page-heading">
        <h1>{t.planHeading}</h1>
        <p className="lead">{t.planLead}</p>
      </div>
      <PlanTemplates />
      <div className="route-layout">
        <section>
          <details className="profile-panel">
            <summary>
              {locale === "kk"
                ? "Өз әрекетімді қосу"
                : "Добавить своё действие"}
            </summary>
            <form
              className="add-goal"
              onSubmit={(e) => {
                e.preventDefault();
                if (!title.trim()) return;
                dispatch({
                  type: "add",
                  goal: {
                    id: crypto.randomUUID(),
                    title: title.trim(),
                    done: false,
                    offeringIds: [],
                    origin: "manual",
                    quote: null,
                    historical: false,
                  },
                });
                setTitle("");
                notify(t.goalAdded);
              }}
            >
              <label htmlFor="goal">{t.goalLabel}</label>
              <div className="input-row">
                <input
                  id="goal"
                  required
                  maxLength={200}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.goalPlaceholder}
                />
                <button className="button primary" disabled={!title.trim()}>
                  {t.addGoal}
                </button>
              </div>
            </form>
          </details>
          {goals.length === 0 ? (
            <div className="empty">
              <h2>{t.emptyPlan}</h2>
              <p>{t.emptyPlanBody}</p>
              <div className="actions centered">
                <Link
                  className="button light"
                  href={`/${locale}/catalog?audience=child`}
                >
                  {t.findHelp}
                </Link>
                <Link className="button light" href={`/${locale}/for-me`}>
                  {t.mother}
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="progress-heading">
                <b>
                  {t.completed} {completed} {t.of} {goals.length}
                </b>
              </div>
              <progress
                value={completed}
                max={goals.length}
                aria-label={t.progress}
              />
              {goals.map((goal, index) => {
                const activity = activities.find(
                  (item) => goal.id === `activity-${item.id}`,
                );
                const originalOffering = offerings.find(
                  (item) => goal.id === `offering-${item.id}`,
                );
                const goalTitle =
                  activity?.title[locale] ??
                  (originalOffering
                    ? localizeOffering(originalOffering, locale).service
                    : goal.title);
                return (
                  <article
                    className={`goal-card ${goal.done ? "done" : ""}`}
                    key={goal.id}
                  >
                    <div className="card-top">
                      <span className="eyebrow">
                        {activity ? t.mother : t.step}{" "}
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <button
                        className="text-button"
                        onClick={() => {
                          dispatch({ type: "remove", id: goal.id });
                          notify(t.deleted);
                        }}
                        aria-label={`${t.deleteGoal}: ${goalTitle}`}
                      >
                        {t.delete}
                      </button>
                    </div>
                    <label className="goal-check">
                      <input
                        type="checkbox"
                        checked={goal.done}
                        onChange={() =>
                          dispatch({ type: "toggle", id: goal.id })
                        }
                      />
                      <span>{goalTitle}</span>
                    </label>
                    {goal.quote && (
                      <details>
                        <summary>
                          {t.basis}
                          {goal.origin === "user_correction" ? t.corrected : ""}
                        </summary>
                        <blockquote lang="ru">{goal.quote}</blockquote>
                      </details>
                    )}
                    {goal.historical && (
                      <p className="notice">{t.historical}</p>
                    )}
                    {goal.offeringIds.map((id) => {
                      const original = offerings.find((o) => o.id === id);
                      if (!original) {
                        const extra = publishedListing(providerDraft);
                        const listing = (
                          extra ? [...listings, extra] : listings
                        ).find((i) => i.id === id);
                        if (!listing) return null;
                        return (
                          <div key={id} className="saved-offering">
                            <b>{listing.name}</b>
                            <p>
                              Пример · {listing.district} · условия уточняются
                            </p>
                            <div className="actions">
                              <Link href={`/${locale}/search/${id}`}>
                                Открыть карточку
                              </Link>
                              <button
                                className="text-button"
                                onClick={() =>
                                  dispatch({
                                    type: "removeOffering",
                                    id: goal.id,
                                    offeringId: id,
                                  })
                                }
                              >
                                {t.removeOffering}
                              </button>
                            </div>
                          </div>
                        );
                      }
                      const item = localizeOffering(original, locale);
                      return (
                        <div key={id} className="saved-offering">
                          <b>{item.name}</b>
                          <p>
                            {t.nextContact}
                            <br />
                            {item.city} · {item.contact}
                          </p>
                          <div className="actions">
                            <Link
                              className="text-link"
                              href={`/${locale}/providers/${id}`}
                            >
                              {t.fullProfile}
                            </Link>
                            <button
                              className="text-button"
                              onClick={() =>
                                dispatch({
                                  type: "removeOffering",
                                  id: goal.id,
                                  offeringId: id,
                                })
                              }
                            >
                              {t.removeOffering}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    <Link
                      className="text-link"
                      href={
                        activity
                          ? `/${locale}/for-me`
                          : `/${locale}/catalog?audience=child`
                      }
                    >
                      {activity
                        ? t.mother
                        : goal.offeringIds.length
                          ? t.moreOptions
                          : t.matchGoal}{" "}
                      →
                    </Link>
                  </article>
                );
              })}
            </>
          )}
        </section>
        <aside className="route-aside">
          <h2>{t.planAside}</h2>
          <p>{t.planAsideBody}</p>
          <hr />
          <p>{t.session}</p>
          <Link href={`/${locale}/pmpk`}>
            {locale === "kk" ? "ПМПК оқу мысалы" : "Учебный пример ПМПК"}
          </Link>
        </aside>
      </div>
    </>
  );
}
