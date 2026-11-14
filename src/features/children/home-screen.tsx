"use client";
import Link from "next/link";
import { useState } from "react";
import { RouteProgress, Recommendations } from "@/features/revision/profile";
import ForMePage from "@/features/support/screen";

import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import OnboardingScreen from "@/features/children/onboarding-screen";
import { recommendOfferings } from "@/features/children/service";
import { localizeOffering } from "@/features/catalog/translations";
import {
  FamilyIllustration,
  MotherIllustration,
  LineIcon,
} from "@/ui/brand-art";
export default function HomeScreen() {
  const { childProfile, motherProfile } = useDemo();
  const { locale, t, f } = useLocale();
  const [chosenView, setView] = useState<string | null>(null);
  const view =
    chosenView ??
    (!childProfile &&
    motherProfile?.completed &&
    motherProfile.audience === "mother"
      ? "mother"
      : "child");
  const switcher = (
    <div
      className="home-switch"
      role="group"
      aria-label="Для кого нужна помощь"
    >
      <button
        className={`button ${view === "child" ? "primary" : "light"}`}
        aria-pressed={view === "child"}
        onClick={() => setView("child")}
      >
        Для ребёнка
      </button>
      <button
        className={`button ${view === "mother" ? "primary" : "light"}`}
        aria-pressed={view === "mother"}
        onClick={() => setView("mother")}
      >
        Для меня
      </button>
    </div>
  );
  if (view === "mother")
    return (
      <>
        {switcher}
        <ForMePage />
      </>
    );
  if (!childProfile)
    return (
      <>
        {switcher}
        <OnboardingScreen />
      </>
    );

  const recommendations = recommendOfferings(childProfile)
    .filter((item) => item.kind === "Специалист")
    .slice(0, 3)
    .map((item) => localizeOffering(item, locale));
  return (
    <div className="simple-home">
      {switcher}
      <div className="profile-match">
        <div>
          <b>
            {f.yourChild}
            {childProfile.alias ? `: ${childProfile.alias}` : ""}
          </b>
          <p>
            {[
              childProfile.city,
              childProfile.age === null
                ? null
                : `${childProfile.age} ${t.years}`,
              childProfile.language === "ru"
                ? t.russian
                : childProfile.language === "kk"
                  ? t.kazakh
                  : null,
            ]
              .filter(Boolean)
              .join(" · ") || f.recommendLead}
          </p>
        </div>
        <Link className="button light" href={`/${locale}/profile/child`}>
          {f.editProfile}
        </Link>
      </div>
      <section className="home-hero">
        <div className="page-heading">
          <p className="eyebrow">
            <span className="eyebrow-dot" />
            {t.heroEyebrow}
          </p>
          <h1>
            {t.heroTitle}
            <span className="heading-spark" aria-hidden="true">
              ✳
            </span>
          </h1>
          <p className="lead">{t.heroLead}</p>
        </div>
        <div className="hero-visual">
          <FamilyIllustration />
          <p>{t.heroNote}</p>
        </div>
      </section>
      <div className="entry-grid">
        <article className="entry-card child-entry">
          <div className="entry-visual">
            <FamilyIllustration compact />
          </div>
          <span className="entry-badge">
            <LineIcon name="child" />
            {t.childBadge}
          </span>
          <h2>{t.childTitle}</h2>
          <p>{t.childLead}</p>
          <span className="entry-feature">{t.childFeature}</span>
          <Link className="button primary" href={`/${locale}/search`}>
            {t.childAction}
          </Link>
        </article>
        <article className="entry-card mother-entry">
          <div className="entry-visual mother-visual">
            <MotherIllustration />
          </div>
          <span className="entry-badge">
            <LineIcon name="heart" />
            {t.motherBadge}
          </span>
          <h2>{t.motherTitle}</h2>
          <p>{t.motherLead}</p>
          <span className="entry-feature">{t.motherFeature}</span>
          <Link
            className="button primary mother-button"
            href={`/${locale}/for-me`}
          >
            {t.motherAction}
          </Link>
        </article>
      </div>
      <RouteProgress />
      <Recommendations />
      <div className="actions">
        <Link className="button primary" href={`/${locale}/search`}>
          Поиск специалистов
        </Link>
        <Link className="button light" href={`/${locale}/route`}>
          Мой план — задачи
        </Link>
      </div>
      <section className="recommendations">
        <div className="steps-heading">
          <h2>{f.personalized}</h2>
          <Link href={`/${locale}/search`}>{f.allSpecialists} →</Link>
        </div>
        <p className="quiet">{f.recommendLead}</p>
        {recommendations.length === 0 ? (
          <div className="empty">
            <p>{f.noMatches}</p>
            <Link href={`/${locale}/profile/child`}>{f.editProfile}</Link>
          </div>
        ) : (
          <div className="recommendation-grid">
            {recommendations.map((item) => (
              <article className="offering-card" key={item.id}>
                <span className="tag">{t.demo}</span>
                <h3>{item.name}</h3>
                <p>{item.service}</p>
                <div className="chips">
                  {childProfile.city && <span>{f.matchedCity}</span>}
                  {childProfile.age !== null && <span>{f.matchedAge}</span>}
                  {childProfile.language && <span>{f.matchedLanguage}</span>}
                  {childProfile.needs.length > 0 && (
                    <span>{f.matchedNeed}</span>
                  )}
                </div>
                <Link
                  className="button primary"
                  href={`/${locale}/providers/${item.id}`}
                >
                  {t.fullProfile}
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="quick-services">
        <h2>{f.newFeatures}</h2>
        <div className="actions">
          <Link className="button primary" href={`/${locale}/nannies`}>
            {f.browseNannies}
          </Link>
          <Link className="button light" href={`/${locale}/community`}>
            {f.browseCommunity}
          </Link>
        </div>
      </section>
      <p className="privacy-line">
        <LineIcon name="shield" />
        {t.privacyLine}
      </p>
      <section className="simple-steps">
        <div className="steps-heading">
          <div>
            <p className="eyebrow">{t.planHint}</p>
            <h2>{t.howTitle}</h2>
          </div>
          <Link className="text-link" href={`/${locale}/route`}>
            {t.openPlan}
          </Link>
        </div>
        <ol>
          <li>{t.howOne}</li>
          <li>{t.howTwo}</li>
          <li>{t.howThree}</li>
        </ol>
      </section>
    </div>
  );
}
