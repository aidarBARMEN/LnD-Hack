"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import { categoryLabels } from "@/locales/messages";
import { onboardingCopy } from "@/locales/onboarding";
import { needCodes, validProfile, type ChildProfile } from "./service";
import {
  profileSteps,
  validAgeAnswer,
  type ProfileStep,
} from "./onboarding-flow";
import {
  documentNames,
  emptyCare,
  specialties,
  type Specialty,
} from "../revision/service";
import { downloadFamilyPdf } from "../revision/pdf";
import { sexLabels, type Sex } from "./sex";
import { FamilyIntake } from "./family-intake";

export default function OnboardingScreen() {
  const { motherProfile, childProfile } = useDemo();
  return motherProfile || childProfile ? <ChildQuestions /> : <FamilyIntake />;
}
export function ChildQuestions() {
  const {
    childProfile,
    setChildProfile,
    setFiltersByAudience,
    dispatchBooking,
    notify,
    goals,
  } = useDemo();
  const { locale, t, f } = useLocale();
  const copy = onboardingCopy[locale];
  const router = useRouter();
  const [sex, setSex] = useState<Sex>(childProfile?.sex ?? "");
  const [alias, setAlias] = useState(childProfile?.alias ?? "");
  const [age, setAge] = useState(
    childProfile?.age == null ? "" : String(childProfile.age),
  );
  const [city, setCity] = useState(childProfile?.city ?? "");
  const [language, setLanguage] = useState<ChildProfile["language"]>(
    childProfile?.language ?? "",
  );
  const [needs, setNeeds] = useState(childProfile?.needs ?? []);
  const [care, setCare] = useState(childProfile?.care ?? emptyCare);
  const [includeCare, setIncludeCare] = useState(
    Boolean(
      childProfile?.care &&
      (childProfile.care.diagnosis ||
        childProfile.care.pmpk ||
        childProfile.care.prescriptions ||
        childProfile.care.documents.length ||
        childProfile.care.specialists.length),
    ),
  );
  const [step, setStep] = useState<ProfileStep>("name");
  const [error, setError] = useState("");
  const [returnToReview, setReturnToReview] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sequence = profileSteps(includeCare);
  const index = sequence.indexOf(step);
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [step]);
  const titles: Record<ProfileStep, string> = {
    name: copy.nameTitle,
    sex: locale === "ru" ? "Пол ребёнка" : "Баланың жынысы",
    age: copy.ageTitle,
    city: copy.cityTitle,
    language: copy.languageTitle,
    needs: copy.needsTitle,
    care: copy.careTitle,
    diagnosis: copy.diagnosisTitle,
    pmpk: copy.pmpkTitle,
    prescriptions: copy.prescriptionsTitle,
    documents: copy.documentsTitle,
    specialists: copy.specialistsTitle,
    review: copy.check,
  };
  const hints: Record<ProfileStep, string> = {
    name: copy.nameHint,
    sex:
      locale === "ru"
        ? "Можно выбрать «Не указывать». Этот ответ не влияет на подбор помощи."
        : "Көрсетпеуге болады. Жауап көмек таңдауға әсер етпейді.",
    age: copy.ageHint,
    city: copy.cityHint,
    language: copy.languageHint,
    needs: copy.needsHint,
    care: copy.careHint,
    diagnosis: copy.diagnosisHint,
    pmpk: copy.pmpkHint,
    prescriptions: copy.prescriptionsHint,
    documents: copy.documentsHint,
    specialists: copy.specialistsHint,
    review: copy.reviewHint,
  };
  function go(next: ProfileStep) {
    setError("");
    setStep(next);
  }
  function next(skip = false) {
    if (step === "age" && !validAgeAnswer(age)) {
      if (skip) setAge("");
      else {
        setError(copy.ageError);
        return;
      }
    }
    if (returnToReview) {
      setReturnToReview(false);
      go(step === "care" && includeCare ? "diagnosis" : "review");
      return;
    }
    go(
      step === "care"
        ? includeCare
          ? "diagnosis"
          : "review"
        : (sequence[index + 1] ?? "review"),
    );
  }
  function save() {
    const profile: ChildProfile = {
      alias: alias.trim(),
      sex,
      age: age === "" ? null : Number(age),
      city,
      language,
      needs,
      care,
      revision: (childProfile?.revision ?? 0) + 1,
    };
    if (!validProfile(profile)) {
      setError(copy.saveError);
      return;
    }
    setChildProfile(profile);
    setFiltersByAudience({});
    window.scrollTo(0, 0);
    notify(f.profileSaved);
    router.push(`/${locale}`);
  }
  function choice(
    name: string,
    value: string,
    selected: string,
    onChange: (v: string) => void,
    options: { value: string; label: string; hint?: string }[],
  ) {
    return (
      <fieldset className="tf-options" aria-label={name}>
        {options.map((option, i) => (
          <label
            className={`tf-option ${selected === option.value ? "selected" : ""}`}
            key={option.value}
          >
            <input
              type="radio"
              name={value}
              value={option.value}
              checked={selected === option.value}
              onChange={() => onChange(option.value)}
            />
            <span className="tf-key" aria-hidden="true">
              {i + 1}
            </span>
            <span>
              {option.label}
              {option.hint && <small>{option.hint}</small>}
            </span>
            <span className="tf-tick" aria-hidden="true">
              {selected === option.value ? "✓" : ""}
            </span>
          </label>
        ))}
      </fieldset>
    );
  }
  function multiple(
    name: string,
    options: { value: string; label: string }[],
    selected: string[],
    onChange: (values: string[]) => void,
  ) {
    return (
      <fieldset className="tf-options" aria-label={name}>
        {options.map((option) => (
          <label
            className={`tf-option ${selected.includes(option.value) ? "selected" : ""}`}
            key={option.value}
          >
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={(e) =>
                onChange(
                  e.target.checked
                    ? [...selected, option.value]
                    : selected.filter((v) => v !== option.value),
                )
              }
            />
            <span>{option.label}</span>
            <span className="tf-tick" aria-hidden="true">
              {selected.includes(option.value) ? "✓" : ""}
            </span>
          </label>
        ))}
      </fieldset>
    );
  }
  function edit(target: ProfileStep) {
    setReturnToReview(true);
    go(target);
  }
  const rows: { label: string; value: string; target: ProfileStep }[] = [
    { label: f.alias, value: alias || copy.empty, target: "name" },
    { label: "Пол", value: sexLabels[sex], target: "sex" },
    { label: f.age, value: age || copy.empty, target: "age" },
    { label: f.city, value: city || copy.empty, target: "city" },
    {
      label: f.language,
      value:
        language === "ru"
          ? t.russian
          : language === "kk"
            ? t.kazakh
            : copy.empty,
      target: "language",
    },
    {
      label: f.needs,
      value:
        needs.map((n) => categoryLabels(locale)[n]).join(", ") || copy.empty,
      target: "needs",
    },
    {
      label: copy.careSummary,
      value: includeCare ? copy.yes : copy.later,
      target: "care",
    },
    ...(includeCare
      ? [
          {
            label: "Диагноз",
            value: care.diagnosis || copy.empty,
            target: "diagnosis" as const,
          },
          {
            label: "ПМПК",
            value: care.pmpk || copy.empty,
            target: "pmpk" as const,
          },
          {
            label: "Назначения",
            value: care.prescriptions || copy.empty,
            target: "prescriptions" as const,
          },
          {
            label: "Справки",
            value: care.documents.join(", ") || copy.empty,
            target: "documents" as const,
          },
          {
            label: "Помощь по рекомендациям",
            value:
              care.specialists.map((s) => specialties[s]).join(", ") ||
              copy.empty,
            target: "specialists" as const,
          },
        ]
      : []),
  ];
  let field: ReactNode = null;
  if (step === "sex")
    field = choice(
      "Пол ребёнка",
      "sex",
      sex,
      (v) => setSex(v as Sex),
      Object.entries(sexLabels).map(([value, label]) => ({
        value,
        label:
          locale === "ru"
            ? label
            : value === "female"
              ? "Әйел"
              : value === "male"
                ? "Ер"
                : "Көрсетпеу",
      })),
    );
  if (step === "name")
    field = (
      <label className="tf-text-label">
        {f.alias}
        <input
          autoComplete="off"
          maxLength={30}
          placeholder={locale === "ru" ? "Например, Алишер" : "Мысалы, Әлішер"}
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
        />
      </label>
    );
  if (step === "age")
    field = (
      <label className="tf-text-label">
        {f.age}
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={21}
          step={1}
          value={age}
          aria-invalid={!!error}
          aria-describedby={error ? "tf-error" : undefined}
          placeholder="0–21"
          onChange={(e) => {
            setAge(e.target.value);
            setError("");
          }}
        />
      </label>
    );
  if (step === "city")
    field = choice(f.city, "city", city, setCity, [
      { value: "Алматы", label: "Алматы" },
      { value: "Астана", label: "Астана" },
      { value: "", label: f.unknown },
    ]);
  if (step === "language")
    field = choice(
      f.language,
      "language",
      language,
      (v) => setLanguage(v as ChildProfile["language"]),
      [
        { value: "ru", label: t.russian },
        { value: "kk", label: t.kazakh },
        { value: "", label: f.unknown },
      ],
    );
  if (step === "needs")
    field = multiple(
      f.needs,
      needCodes.map((value) => ({
        value,
        label: categoryLabels(locale)[value],
      })),
      needs,
      (v) => setNeeds(v as typeof needs),
    );
  if (step === "care")
    field = choice(
      copy.careTitle,
      "care",
      includeCare ? "yes" : "later",
      (v) => setIncludeCare(v === "yes"),
      [
        { value: "later", label: copy.later, hint: copy.more },
        { value: "yes", label: copy.yes },
      ],
    );
  if (step === "diagnosis" || step === "pmpk" || step === "prescriptions") {
    const labels = {
      diagnosis: "Диагноз — как указан в документе",
      pmpk: "Заключение и рекомендации ПМПК",
      prescriptions: "Назначения врача",
    };
    field = (
      <label className="tf-text-label">
        {labels[step]}
        <textarea
          maxLength={1000}
          rows={5}
          value={care[step]}
          onChange={(e) => setCare({ ...care, [step]: e.target.value })}
          placeholder={
            locale === "ru" ? "Только учебный пример" : "Тек оқу мысалы"
          }
        />
      </label>
    );
  }
  if (step === "documents")
    field = multiple(
      copy.documentsTitle,
      documentNames.map((value) => ({ value, label: value })),
      care.documents,
      (v) => setCare({ ...care, documents: v }),
    );
  if (step === "specialists")
    field = multiple(
      copy.specialistsTitle,
      Object.entries(specialties).map(([value, label]) => ({ value, label })),
      care.specialists,
      (v) => setCare({ ...care, specialists: v as Specialty[] }),
    );
  if (step === "review")
    field = (
      <div className="tf-review">
        {rows.map((row) => (
          <div className="tf-review-row" key={row.target}>
            <div>
              <span>{row.label}</span>
              <p>{row.value}</p>
            </div>
            <button
              type="button"
              className="tf-edit"
              aria-label={`${copy.edit}: ${row.label}`}
              onClick={() => edit(row.target)}
            >
              {copy.edit}
            </button>
          </div>
        ))}
      </div>
    );
  return (
    <section className="typeform-onboarding" aria-label={f.childProfile}>
      <div className="tf-top">
        <h1>{childProfile ? f.editProfile : f.onboarding}</h1>
        <span>
          {copy.step} {index + 1} {copy.of} {sequence.length}
        </span>
      </div>
      <progress
        className="tf-progress"
        value={index + 1}
        max={sequence.length}
        aria-label={locale === "ru" ? "Прогресс анкеты" : "Сауалнама барысы"}
      />
      <form
        className="tf-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step === "review") save();
          else next();
        }}
      >
        <div className="tf-question" key={step}>
          <span className="tf-eyebrow">
            {step === "review" ? copy.summary : copy.optional}
          </span>
          <h2 ref={titleRef} tabIndex={-1}>
            {titles[step]}
          </h2>
          <p className="tf-hint">{hints[step]}</p>
          {field}
          {error && (
            <p id="tf-error" role="alert" className="form-error">
              {error}
            </p>
          )}
          {step === "review" && childProfile && (
            <div className="tf-profile-tools">
              <button
                type="button"
                className="text-button"
                disabled={pdfBusy}
                onClick={async () => {
                  setPdfBusy(true);
                  try {
                    await downloadFamilyPdf(childProfile, goals);
                    notify(copy.pdfSuccess);
                  } catch {
                    notify(copy.pdfError);
                  } finally {
                    setPdfBusy(false);
                  }
                }}
              >
                {pdfBusy ? copy.pdfBusy : copy.pdf}
              </button>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setChildProfile(null);
                  dispatchBooking({ type: "clear" });
                  setFiltersByAudience({});
                  notify(f.profileDeleted);
                  router.push(`/${locale}`);
                }}
              >
                {copy.delete}
              </button>
            </div>
          )}
        </div>
        <footer className="tf-actions">
          <div className="tf-buttons">
            <button
              className="button light tf-back"
              type="button"
              disabled={index === 0}
              onClick={() => {
                setReturnToReview(false);
                go(sequence[index - 1]!);
              }}
              aria-label={copy.back}
            >
              ← <span>{copy.back}</span>
            </button>
            <button className="button primary tf-next" type="submit">
              {step === "review" ? f.saveProfile : copy.next}{" "}
              <span aria-hidden="true">→</span>
            </button>
          </div>
          {step !== "review" && (
            <button
              className="tf-skip"
              type="button"
              onClick={() => next(true)}
            >
              {copy.skip}
            </button>
          )}
          <p className="tf-privacy">{copy.privacy}</p>
        </footer>
      </form>
      <Link className="tf-mother-link" href={`/${locale}/for-me`}>
        {f.motherWithoutProfile}
      </Link>
    </section>
  );
}
