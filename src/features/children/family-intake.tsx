"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import {
  emptyMother,
  motherNeeds,
  validMother,
  type MotherProfile,
} from "./mother-profile";
import { sexLabels, type Sex } from "./sex";
import { ChildQuestions } from "./onboarding-screen";
function Frame({
  title,
  step,
  total,
  children,
  onNext,
  onBack,
  save = false,
  error = "",
}: {
  title: string;
  step: number;
  total: number;
  children: ReactNode;
  onNext: () => void;
  onBack?: (() => void) | undefined;
  save?: boolean;
  error?: string;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [title]);
  return (
    <section className="typeform-onboarding">
      <div className="tf-top">
        <h1>Сначала познакомимся</h1>
        <span>
          Шаг {step} из {total}
        </span>
      </div>
      <progress
        className="tf-progress"
        value={step}
        max={total}
        aria-label="Прогресс анкеты"
      />
      <form
        className="tf-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          onNext();
        }}
      >
        <div className="tf-question">
          <span className="tf-eyebrow">Поддержка в вашем темпе</span>
          <h2 ref={heading} tabIndex={-1}>
            {title}
          </h2>
          {children}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
        </div>
        <footer className="tf-actions">
          <div className="tf-buttons">
            <button
              type="button"
              className="button light tf-back"
              aria-label="Назад"
              disabled={!onBack}
              onClick={onBack}
            >
              ← <span>Назад</span>
            </button>
            <button className="button primary tf-next">
              {save ? "Сохранить и показать поддержку" : "Далее"}{" "}
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <p className="tf-privacy">
            Это демо: используйте вымышленные сведения. Данные остаются в памяти
            вкладки и исчезают при обновлении.
          </p>
        </footer>
      </form>
    </section>
  );
}
function Options({
  name,
  values,
  selected,
  onChange,
}: {
  name: string;
  values: { value: string; label: string }[];
  selected: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="tf-options" aria-label={name}>
      {values.map((v) => (
        <label
          className={`tf-option ${selected === v.value ? "selected" : ""}`}
          key={v.value}
        >
          <input
            type="radio"
            name={name}
            checked={selected === v.value}
            onChange={() => onChange(v.value)}
          />
          <span>{v.label}</span>
          <span className="tf-tick" aria-hidden="true">
            {selected === v.value ? "✓" : ""}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
export function FamilyIntake() {
  const { motherProfile, setMotherProfile } = useDemo();
  const [name, setName] = useState(motherProfile?.name ?? "");
  const [step, setStep] = useState(0);
  const [audience, setAudience] = useState<"mother" | "child">("child");
  const [branch, setBranch] = useState(false);
  if (branch && audience === "mother")
    return (
      <MotherQuestions
        initial={{ ...emptyMother, name, audience: "mother" }}
        onBack={() => setBranch(false)}
      />
    );
  if (branch) return <ChildQuestions />;
  return (
    <Frame
      title={step === 0 ? "Как вас зовут?" : "Кому нужна помощь?"}
      step={step + 1}
      total={2}
      onBack={step ? () => setStep(0) : undefined}
      onNext={() => {
        if (!step) {
          setStep(1);
          return;
        }
        if (audience === "child")
          setMotherProfile({
            ...emptyMother,
            name: name.trim(),
            audience: "child",
          });
        setBranch(true);
      }}
    >
      {step === 0 ? (
        <>
          <p className="tf-hint">
            Как к вам обращаться? Можно указать только имя.
          </p>
          <label className="tf-text-label">
            Как вас зовут?
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              autoComplete="off"
              placeholder="Например, Алия"
            />
          </label>
        </>
      ) : (
        <>
          <p className="tf-hint">
            {name.trim() ? `${name.trim()}, выберите` : "Выберите"}, с чего
            начнём. Вопросы будут только про того, кому нужна помощь.
          </p>
          <Options
            name="Кому нужна помощь?"
            values={[
              { value: "mother", label: "Мне — поддержка для мамы" },
              { value: "child", label: "Моему ребёнку" },
            ]}
            selected={audience}
            onChange={(v) => setAudience(v as typeof audience)}
          />
        </>
      )}
    </Frame>
  );
}
export function MotherQuestions({
  initial,
  onBack,
}: {
  initial?: MotherProfile;
  onBack?: () => void;
}) {
  const { motherProfile, setMotherProfile, setSupportFilters, notify } =
    useDemo();
  const { locale } = useLocale();
  const router = useRouter();
  const [draft, setDraft] = useState<MotherProfile>(
    initial ?? motherProfile ?? { ...emptyMother, audience: "mother" },
  );
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const fields = initial
    ? ["age", "sex", "city", "language", "needs", "time", "review"]
    : ["name", "age", "sex", "city", "language", "needs", "time", "review"];
  const field = fields[step]!;
  const titles: Record<string, string> = {
    name: "Как вас зовут?",
    age: "Сколько вам лет?",
    sex: "Ваш пол",
    city: "В каком городе вам нужна поддержка?",
    language: "На каком языке вам удобнее общаться?",
    needs: "Какая помощь нужна?",
    time: "Сколько времени вы можете выделить для себя?",
    review: "Проверьте свои ответы",
  };
  const patch = (data: Partial<MotherProfile>) => {
    setDraft({ ...draft, ...data });
    setError("");
  };
  function next() {
    if (
      field === "age" &&
      draft.age !== "" &&
      (!Number.isInteger(Number(draft.age)) ||
        Number(draft.age) < 0 ||
        Number(draft.age) > 120)
    ) {
      setError("Введите целый возраст от 0 до 120 или оставьте поле пустым.");
      return;
    }
    if (field !== "review") {
      setStep(step + 1);
      return;
    }
    if (!validMother(draft)) {
      setError("Проверьте ответы.");
      return;
    }
    setMotherProfile({
      ...draft,
      name: draft.name.trim(),
      audience: "mother",
      completed: true,
    });
    setSupportFilters({ stage: "parenting", time: draft.time });
    notify("Поддержка подобрана по вашим ответам");
    router.push(`/${locale}/for-me`);
  }
  return (
    <Frame
      title={titles[field]!}
      step={step + 1}
      total={fields.length}
      onNext={next}
      onBack={
        step
          ? () => {
              setError("");
              setStep(step - 1);
            }
          : onBack
      }
      save={field === "review"}
      error={error}
    >
      <p className="tf-hint">
        {field === "review"
          ? "Используем ваш выбор для поиска поддержки и занятий. Это не медицинская рекомендация."
          : "Можно оставить ответ пустым или выбрать «Пока не знаю»."}
      </p>
      {field === "name" && (
        <label className="tf-text-label">
          Как вас зовут?
          <input
            maxLength={50}
            value={draft.name}
            onChange={(e) => patch({ name: e.target.value })}
          />
        </label>
      )}
      {field === "age" && (
        <label className="tf-text-label">
          Ваш возраст, полных лет
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            value={draft.age}
            onChange={(e) => patch({ age: e.target.value })}
          />
        </label>
      )}
      {field === "sex" && (
        <Options
          name="Ваш пол"
          values={Object.entries(sexLabels).map(([value, label]) => ({
            value,
            label,
          }))}
          selected={draft.sex ?? ""}
          onChange={(sex) => patch({ sex: sex as Sex })}
        />
      )}
      {field === "city" && (
        <Options
          name="Ваш город"
          values={[
            { value: "Алматы", label: "Алматы" },
            { value: "Астана", label: "Астана" },
            { value: "", label: "Пока не знаю" },
          ]}
          selected={draft.city}
          onChange={(city) => patch({ city })}
        />
      )}
      {field === "language" && (
        <Options
          name="Ваш язык"
          values={[
            { value: "ru", label: "Русский" },
            { value: "kk", label: "Казахский" },
            { value: "", label: "Пока не знаю" },
          ]}
          selected={draft.language}
          onChange={(language) => patch({ language })}
        />
      )}
      {field === "needs" && (
        <fieldset className="tf-options" aria-label="Ваши потребности">
          {motherNeeds.map((need) => (
            <label
              className={`tf-option ${draft.needs.includes(need) ? "selected" : ""}`}
              key={need}
            >
              <input
                type="checkbox"
                checked={draft.needs.includes(need)}
                onChange={(e) =>
                  patch({
                    needs: e.target.checked
                      ? [...draft.needs, need]
                      : draft.needs.filter((n) => n !== need),
                  })
                }
              />
              <span>{need}</span>
            </label>
          ))}
        </fieldset>
      )}
      {field === "time" && (
        <Options
          name="Время для себя"
          values={[
            { value: "15", label: "До 15 минут" },
            { value: "30", label: "15–30 минут" },
            { value: "60", label: "30–60 минут" },
            { value: "over60", label: "Больше часа" },
            { value: "", label: "Пока не знаю" },
          ]}
          selected={draft.time}
          onChange={(time) => patch({ time: time as MotherProfile["time"] })}
        />
      )}
      {field === "review" && (
        <div className="tf-review">
          {[
            { label: "Имя", value: draft.name, target: "name" },
            { label: "Пол", value: sexLabels[draft.sex ?? ""], target: "sex" },
            { label: "Возраст", value: draft.age, target: "age" },
            { label: "Город", value: draft.city, target: "city" },
            {
              label: "Язык",
              value:
                draft.language === "ru"
                  ? "Русский"
                  : draft.language === "kk"
                    ? "Казахский"
                    : "",
              target: "language",
            },
            {
              label: "Нужная поддержка",
              value: draft.needs.join(", "),
              target: "needs",
            },
            {
              label: "Время",
              value: draft.time
                ? draft.time === "over60"
                  ? "Больше часа"
                  : `До ${draft.time} минут`
                : "",
              target: "time",
            },
          ].map((row) => (
            <div className="tf-review-row" key={row.label}>
              <div>
                <span>{row.label}</span>
                <p>{row.value || "Не указано"}</p>
              </div>
              {fields.includes(row.target) && (
                <button
                  type="button"
                  className="tf-edit"
                  aria-label={`Изменить: ${row.label}`}
                  onClick={() => setStep(fields.indexOf(row.target))}
                >
                  Изменить
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Frame>
  );
}
export function MotherSummary() {
  const { motherProfile } = useDemo();
  const { locale } = useLocale();
  if (!motherProfile?.completed) return null;
  return (
    <section className="profile-panel">
      <h2>
        {motherProfile.name
          ? `${motherProfile.name}, поддержка для вас`
          : "Поддержка для вас"}
      </h2>
      <p>
        {[
          motherProfile.city,
          motherProfile.age ? `${motherProfile.age} лет` : "",
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      <p>
        {motherProfile.needs.join(" · ") ||
          "Можно начать с небольшого занятия или общения"}
      </p>
      <p>Пол: {sexLabels[motherProfile.sex ?? ""]}</p>
      <div className="actions">
        {motherProfile.needs.includes("Эмоциональная поддержка") && (
          <Link
            className="button primary"
            href={`/${locale}/search?specialty=parent`}
          >
            Найти психолога для себя
          </Link>
        )}
        {motherProfile.needs.includes("Общение с другими мамами") && (
          <Link className="button primary" href={`/${locale}/community`}>
            Найти общение
          </Link>
        )}
        {motherProfile.needs.includes("Помощь в повседневных делах") && (
          <Link
            className="button primary"
            href={`/${locale}/search?section=social`}
          >
            Найти помощника
          </Link>
        )}
        <Link className="button light" href={`/${locale}/profile/mother`}>
          Изменить данные о себе
        </Link>
      </div>
    </section>
  );
}
