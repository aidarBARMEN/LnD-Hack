"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import { categoryLabels } from "@/locales/messages";
import {
  learningDocuments,
  navigatorReply,
  freeTextReply,
  type NavigatorIntent,
  type LearningDocument,
} from "./navigator-service";

export default function NavigatorScreen() {
  const { locale } = useLocale();
  const kk = locale === "kk";
  const { setChildProfile, dispatch } = useDemo();
  const [ids, setIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const [text, setText] = useState("");
  const [decisions, setDecisions] = useState<
    Record<string, "confirmed" | "rejected">
  >({});
  const [showEvidence, setShowEvidence] = useState(false);
  const [notice, setNotice] = useState("");
  const log = useRef<HTMLDivElement>(null);
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "auto" });
  }, [messages]);
  const prompts: [NavigatorIntent, string][] = [
    [
      "specialist",
      kk ? "Кіммен кеңесуге болады?" : "С кем проконсультироваться?",
    ],
    ["reason", kk ? "Неге бұл бағыт?" : "Почему это направление?"],
    [
      "questions",
      kk ? "Кездесуде не сұрау керек?" : "Что спросить на встрече?",
    ],
  ];
  function ask(intent: NavigatorIntent, label: string) {
    setMessages((p) => [
      ...p,
      { role: "user", text: label },
      { role: "assistant", text: navigatorReply(intent, ids, locale) },
    ]);
    setShowEvidence(true);
  }
  function confirm(doc: LearningDocument) {
    if (!doc.category) return;
    const category = doc.category;
    setChildProfile((p) => ({
      ...p,
      alias: p?.alias ?? "",
      age: p?.age ?? null,
      city: p?.city ?? "",
      language: p?.language ?? "",
      needs: Array.from(new Set([...(p?.needs ?? []), category])),
      revision: Date.now(),
    }));
    dispatch({
      type: "add",
      goal: {
        id: `navigator-${doc.id}`,
        title: `${kk ? "Нұсқаларды қарау" : "Посмотреть варианты"}: ${categoryLabels(locale)[category]}`,
        done: false,
        offeringIds: [],
        origin: "document",
        quote: doc.quote,
        historical: false,
      },
    });
    setDecisions((p) => ({ ...p, [doc.id]: "confirmed" }));
    setNotice(
      kk
        ? "Бағыт расталып, жоспарға қосылды."
        : "Направление подтверждено и добавлено в план.",
    );
  }
  return (
    <div className="narrow-page navigator-screen">
      <h1>{kk ? "Бірге навигаторы" : "Бірге — чат-навигатор"}</h1>
      <p className="notice">
        {kk
          ? "Оқу чаты · AI қосылмаған. Тек ойдан шығарылған мысалдар. Нақты құжаттар мен жеке мәліметтерді енгізбеңіз."
          : "Учебный чат · AI не подключён. Только вымышленные примеры. Не вводите настоящие документы и личные сведения."}
      </p>
      <p>
        {kk
          ? "Бірнеше оқу құжатын таңдап, сұрақ қойыңыз. Деректер сыртқы қызметтерге жіберілмейді, бет жаңартылғанда өшеді."
          : "Выберите несколько учебных документов и задайте вопрос. Данные не отправляются внешним сервисам и исчезают при обновлении страницы."}
      </p>
      <fieldset className="profile-panel">
        <legend>{kk ? "Оқу құжаттары" : "Учебные документы"}</legend>
        {learningDocuments.map((d) => (
          <label className="quick-choice" key={d.id}>
            <input
              type="checkbox"
              checked={ids.includes(d.id)}
              onChange={(e) => {
                setIds((p) =>
                  e.target.checked
                    ? [...p, d.id]
                    : p.filter((id) => id !== d.id),
                );
                setShowEvidence(false);
                setNotice(
                  kk
                    ? "Құжаттар өзгерді. Жаңа жауап алу үшін сұрақ қойыңыз."
                    : "Набор документов изменён. Задайте вопрос для нового ответа.",
                );
              }}
            />
            {d.title[locale]}
          </label>
        ))}
        <p className="quiet">
          {kk
            ? "Файл жүктеу орнына дайын мәтінді таңдайсыз."
            : "Вместо загрузки файла здесь выбирается подготовленный текст."}
        </p>
      </fieldset>
      <div
        role="log"
        aria-label={kk ? "Чат тарихы" : "История чата"}
        aria-live="polite"
        className="navigator-log"
        ref={log}
      >
        <p className="navigator-bubble">
          {kk
            ? "Сәлеметсіз бе! Құжатта не ұсынылғанын бірге қарап, маманға сұрақ дайындайық."
            : "Здравствуйте! Давайте посмотрим, что рекомендовано в заключении, и подготовим вопросы специалисту."}
        </p>
        {messages.map((m, i) => (
          <div
            key={i}
            className={`navigator-bubble ${m.role === "user" ? "navigator-user" : ""}`}
          >
            <strong>
              {m.role === "user"
                ? kk
                  ? "Сіз"
                  : "Вы"
                : kk
                  ? "Оқу навигаторы"
                  : "Учебный навигатор"}
            </strong>
            <p>{m.text}</p>
          </div>
        ))}
      </div>
      <div className="actions">
        {prompts.map(([intent, label]) => (
          <button
            className="button light"
            key={intent}
            onClick={() => ask(intent, label)}
          >
            {label}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          setMessages((p) => [
            ...p,
            { role: "user", text: text.trim() },
            { role: "assistant", text: freeTextReply(locale) },
          ]);
          setText("");
        }}
      >
        <label>
          {kk ? "Оқу сұрағы" : "Учебный вопрос"}
          <textarea
            rows={2}
            maxLength={500}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              kk ? "Жеке мәліметтерсіз сұрақ" : "Вопрос без личных данных"
            }
          />
        </label>
        <button className="button primary" disabled={!text.trim()}>
          {kk ? "Сұрау" : "Спросить"}
        </button>
      </form>
      {showEvidence && ids.length > 0 && (
        <section aria-label={kk ? "Жауаптың негізі" : "Основания ответа"}>
          <h2>
            {kk ? "Құжаттарда не көрсетілген" : "Что указано в документах"}
          </h2>
          {learningDocuments
            .filter((d) => ids.includes(d.id))
            .map((d) => (
              <article className="profile-panel" key={d.id}>
                <h3>{d.title[locale]}</h3>
                <p className="quiet">
                  {kk ? "Оқу мысалы · бет" : "Учебный пример · страница"}{" "}
                  {d.page} · {kk ? "орысша түпнұсқа" : "русский оригинал"}
                </p>
                <blockquote lang="ru">{d.quote}</blockquote>
                {d.category ? (
                  <>
                    <p>{categoryLabels(locale)[d.category]}</p>
                    {!decisions[d.id] ? (
                      <div className="actions">
                        <button
                          className="button primary"
                          onClick={() => confirm(d)}
                        >
                          {kk
                            ? "Растау және жоспарға қосу"
                            : "Подтвердить и добавить в план"}
                        </button>
                        <button
                          className="button light"
                          onClick={() => {
                            setDecisions((p) => ({ ...p, [d.id]: "rejected" }));
                            setNotice(
                              kk
                                ? "Қабылданбады. Профиль өзгермеді."
                                : "Отклонено. Профиль не изменён.",
                            );
                          }}
                        >
                          {kk ? "Қабылдамау" : "Отклонить"}
                        </button>
                      </div>
                    ) : (
                      <p>
                        {decisions[d.id] === "confirmed"
                          ? kk
                            ? "Расталды"
                            : "Подтверждено"
                          : kk
                            ? "Қабылданбады"
                            : "Отклонено"}
                      </p>
                    )}
                    {decisions[d.id] === "confirmed" && (
                      <Link
                        className="button light"
                        href={`/${locale}/search?specialty=${d.specialty}`}
                      >
                        {kk ? "Анкеталарды қарау" : "Посмотреть анкеты"}
                      </Link>
                    )}
                    {decisions[d.id] === "rejected" && (
                      <button
                        className="button light"
                        onClick={() =>
                          setDecisions((p) => {
                            const next = { ...p };
                            delete next[d.id];
                            return next;
                          })
                        }
                      >
                        {kk ? "Қайта қарау" : "Пересмотреть"}
                      </button>
                    )}
                  </>
                ) : (
                  <p>
                    {kk
                      ? "Нақты бағыт жоқ. Қорытынды авторынан нақтылаңыз."
                      : "Явного направления нет. Уточните у автора заключения."}
                  </p>
                )}
              </article>
            ))}
        </section>
      )}
      <p role="status">{notice}</p>
      <div className="actions">
        <Link href={`/${locale}/route`}>
          {kk ? "Менің жоспарым" : "Мой план"}
        </Link>
        <Link href={`/${locale}/profile/child`}>
          {kk ? "Іздеу шарттарын өзгерту" : "Изменить условия поиска"}
        </Link>
        <button
          className="button light"
          onClick={() => {
            setMessages([]);
            setText("");
            setIds([]);
            setShowEvidence(false);
            setDecisions({});
            setNotice(
              kk
                ? "Чат тазартылды. Жоспардағы расталған әрекеттер сақталды."
                : "Чат очищен. Подтверждённые действия остались в плане.",
            );
          }}
        >
          {kk ? "Чатты тазарту" : "Очистить чат"}
        </button>
      </div>
    </div>
  );
}
