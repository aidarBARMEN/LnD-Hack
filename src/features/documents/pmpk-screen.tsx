"use client";
import { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import { categoryLabels } from "@/locales/messages";
import type { Category } from "@/features/catalog/contracts";
export const pmpkExamples = [
  {
    id: "communication",
    quote: "Рекомендованы занятия с логопедом по развитию коммуникации.",
    category: "communication" as Category,
  },
  {
    id: "development",
    quote: "Рекомендована поддержка в освоении учебных навыков.",
    category: "development" as Category,
  },
];
export default function PmpkScreen() {
  const { locale } = useLocale();
  const kk = locale === "kk";
  const { childProfile, setChildProfile, dispatch, notify } = useDemo();
  const [sample, setSample] = useState("");
  const [category, setCategory] = useState<Category>("communication");
  const [status, setStatus] = useState<"review" | "confirmed" | "rejected">(
    "review",
  );
  const selected = pmpkExamples.find((e) => e.id === sample);
  function confirm() {
    if (!selected) return;
    setChildProfile((p) => ({
      ...p,
      alias: p?.alias ?? "",
      city: p?.city ?? "",
      age: p?.age ?? null,
      language: p?.language ?? "",
      needs: Array.from(new Set([...(p?.needs ?? []), category])),
      revision: Date.now(),
    }));
    dispatch({
      type: "add",
      goal: {
        id: `pmpk-${sample}-${category}`,
        title: kk
          ? `Нұсқаларды қарау: ${categoryLabels(locale)[category]}`
          : `Посмотреть варианты: ${categoryLabels(locale)[category]}`,
        done: false,
        offeringIds: [],
        origin: category === selected.category ? "document" : "user_correction",
        quote: selected.quote,
        historical: false,
      },
    });
    setStatus("confirmed");
    notify(
      kk ? "Расталды және жоспарға қосылды" : "Подтверждено и добавлено в план",
    );
  }
  return (
    <div className="narrow-page">
      <Link href={`/${locale}/assistant`}>
        {kk ? "Оқу чатына өту →" : "Открыть учебный чат →"}
      </Link>
      <h1>{kk ? "ПМПК ұсынымдарын қарау" : "Разбор рекомендаций ПМПК"}</h1>
      <p className="notice">
        {kk
          ? "Оқу мысалы. Дайын нәтиже: бұл AI талдауы емес. Нақты құжаттар жүктелмейді және ешқайда жіберілмейді."
          : "Учебный пример. Результат подготовлен заранее, это не работа AI. Настоящие документы не загружаются и никуда не передаются."}
      </p>
      <p>
        {kk
          ? "Құжаттағы ұсынысты тексеріп, іздеу үшін растаңыз. Қосымша диагноз немесе ем туралы қорытынды жасалмайды."
          : "Проверьте рекомендацию из документа и подтвердите её для поиска. Новые выводы о диагнозе или лечении не делаются."}
      </p>
      <label>
        {kk ? "Мысалды таңдаңыз" : "Выберите пример"}
        <select
          value={sample}
          onChange={(e) => {
            setSample(e.target.value);
            setCategory(
              pmpkExamples.find((s) => s.id === e.target.value)?.category ??
                "communication",
            );
            setStatus("review");
          }}
        >
          <option value="">{kk ? "Таңдау" : "Выбрать"}</option>
          {pmpkExamples.map((e) => (
            <option key={e.id} value={e.id}>
              {categoryLabels(locale)[e.category]}
            </option>
          ))}
        </select>
      </label>
      {selected && (
        <section className="profile-panel">
          <h2>{kk ? "Дереккөзден үзінді" : "Цитата источника"}</h2>
          <p className="quiet">
            {kk
              ? "Ойдан шығарылған қорытынды · 1-бет · «Ұсынымдар» (орысша түпнұсқа)"
              : "Вымышленное заключение · стр. 1 · «Рекомендации»"}
          </p>
          <blockquote lang="ru">{selected.quote}</blockquote>
          <label>
            {kk
              ? "Іздеу бағыты — түзетуге болады"
              : "Направление поиска — можно исправить"}
            <select
              disabled={status !== "review"}
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {Object.entries(categoryLabels(locale)).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <p>
            {kk
              ? "Тек осы бағыт іздеуге қосылады. Құжаттың мәтіні маманға берілмейді."
              : "В поиск добавится только выбранное направление. Текст заключения специалисту не передаётся."}
          </p>
          {status === "review" ? (
            <div className="actions">
              <button className="button primary" onClick={confirm}>
                {kk
                  ? "Растау және жоспарға қосу"
                  : "Подтвердить и добавить в план"}
              </button>
              <button
                className="button light"
                onClick={() => setStatus("rejected")}
              >
                {kk ? "Қабылдамау" : "Отклонить"}
              </button>
            </div>
          ) : (
            <p role="status">
              {status === "confirmed"
                ? kk
                  ? "Расталды"
                  : "Подтверждено"
                : kk
                  ? "Қабылданбады. Профиль өзгермеді."
                  : "Отклонено. Профиль не изменён."}
            </p>
          )}
          {status !== "review" && (
            <button
              className="button light"
              onClick={() => setStatus("review")}
            >
              {kk ? "Қайта қарау" : "Пересмотреть"}
            </button>
          )}
        </section>
      )}
      <p>
        <Link href="/ru/documents">
          {kk
            ? "Басқа оқу мысалдары (орысша)"
            : "Другие учебные примеры (на русском)"}
        </Link>
      </p>
      <div className="actions">
        <Link className="button light" href={`/${locale}/search`}>
          {kk ? "Нұсқаларды іздеу" : "Найти варианты"}
        </Link>
        <Link href={`/${locale}/route`}>
          {kk ? "Менің жоспарым" : "Мой план"}
        </Link>
        {!childProfile && (
          <Link href={`/${locale}`}>
            {kk ? "Іздеу шарттарын көрсету" : "Указать условия поиска"}
          </Link>
        )}
      </div>
    </div>
  );
}
