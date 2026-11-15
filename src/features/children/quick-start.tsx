"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import { categoryLabels } from "@/locales/messages";
import { type Category } from "@/features/catalog/contracts";
import { validAgeAnswer } from "./onboarding-flow";

export default function QuickStart() {
  const { locale } = useLocale();
  const kk = locale === "kk";
  const { setChildProfile } = useDemo();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [needs, setNeeds] = useState<Category[]>([]);
  const [city, setCity] = useState("");
  const [age, setAge] = useState("");
  const [language, setLanguage] = useState<"" | "ru" | "kk">("");
  const [error, setError] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [step]);
  const titles = kk
    ? [
        "Қолдау кімге қажет?",
        "Қазір не маңызды?",
        "Қай қаладан іздейміз?",
        "Бала неше жаста?",
        "Қай тілде сөйлескен ыңғайлы?",
      ]
    : [
        "Кому нужна поддержка?",
        "Какая помощь нужна?",
        "В каком городе ищем?",
        "Сколько лет ребёнку?",
        "На каком языке удобнее общаться?",
      ];
  function next() {
    if (step === 3 && !validAgeAnswer(age)) {
      setError(true);
      return;
    }
    setError(false);
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    setChildProfile({
      alias: "",
      age: age === "" ? null : Number(age),
      city,
      language,
      needs,
      revision: Date.now(),
    });
    router.push(`/${locale}/search`);
  }
  return (
    <section className="typeform-onboarding quick-start">
      <p className="eyebrow">
        {kk ? "Бірге — алғашқы қадам" : "Бірге — первый шаг вместе"}
      </p>
      <p>
        {kk
          ? "Жағдайыңызға сай нұсқаларды табамыз. Диагноз бен құжаттар қажет емес."
          : "Найдём варианты по вашим условиям. Диагноз и документы не нужны."}
      </p>
      <p>
        {kk ? "Қадам" : "Шаг"} {step + 1}/5
      </p>
      <progress
        aria-label={kk ? "Сауалнама барысы" : "Прогресс анкеты"}
        value={step + 1}
        max={5}
      />
      <h1 ref={heading} tabIndex={-1}>
        {titles[step]}
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          next();
        }}
      >
        {step === 0 && (
          <div className="quick-options">
            <button className="button primary" type="button" onClick={next}>
              {kk ? "Балаға" : "Ребёнку"}
            </button>
            <Link className="button light" href={`/${locale}/for-me`}>
              {kk ? "Өзіме" : "Для меня"}
            </Link>
          </div>
        )}
        {step === 1 && (
          <fieldset aria-label={titles[step]}>
            {Object.entries(categoryLabels(locale)).map(([code, label]) => (
              <label className="quick-choice" key={code}>
                <input
                  type="checkbox"
                  checked={needs.includes(code as Category)}
                  onChange={(e) =>
                    setNeeds(
                      e.target.checked
                        ? [...needs, code as Category]
                        : needs.filter((n) => n !== code),
                    )
                  }
                />
                {label}
              </label>
            ))}
          </fieldset>
        )}
        {step === 2 && (
          <label>
            {kk ? "Қала" : "Город"}
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">
                {kk ? "Әзірге білмеймін" : "Пока не знаю"}
              </option>
              <option>Алматы</option>
              <option>Астана</option>
            </select>
          </label>
        )}
        {step === 3 && (
          <label>
            {kk ? "Толық жасы (0–21)" : "Возраст, полных лет (0–21)"}
            <input
              type="number"
              min="0"
              max="21"
              step="1"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </label>
        )}
        {step === 4 && (
          <label>
            {kk ? "Кездесу тілі" : "Язык встречи"}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as typeof language)}
            >
              <option value="">{kk ? "Кез келген" : "Любой"}</option>
              <option value="ru">Русский</option>
              <option value="kk">Қазақша</option>
            </select>
          </label>
        )}
        {error && (
          <p role="alert">
            {kk
              ? "0 мен 21 аралығындағы бүтін санды енгізіңіз."
              : "Введите целое число от 0 до 21."}
          </p>
        )}
        {step > 0 && (
          <div className="actions">
            <button
              className="button light"
              type="button"
              onClick={() => {
                setError(false);
                setStep(step - 1);
              }}
            >
              {kk ? "Артқа" : "Назад"}
            </button>
            <button className="button primary" type="submit">
              {step === 4
                ? kk
                  ? "Нұсқаларды көрсету"
                  : "Показать варианты"
                : kk
                  ? "Келесі"
                  : "Далее"}
            </button>
          </div>
        )}
        <p className="quiet">
          {kk
            ? "Жауаптарды бос қалдыруға болады. Оқу мысалы: нақты жеке деректерді енгізбеңіз. Бетті жаңартқанда жауаптар өшеді."
            : "Ответы можно оставить пустыми. Учебный пример: не вводите реальные личные данные. При обновлении страницы ответы исчезнут."}
        </p>
      </form>
      <details>
        <summary>
          {kk ? "Қосымша мәліметтер" : "Дополнительные сведения"}
        </summary>
        <Link href={`/${locale}/profile/child`}>
          {kk ? "Толық сауалнама" : "Подробная анкета"}
        </Link>
      </details>
    </section>
  );
}
