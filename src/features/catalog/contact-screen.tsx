"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import type { Offering } from "./contracts";
import { localizeOffering } from "./translations";
import { useLocale } from "@/ui/use-locale";
import { useDemo } from "@/ui/demo-shell";
export default function ContactScreen({ offering }: { offering: Offering }) {
  const { locale, t } = useLocale();
  const { notify, childProfile } = useDemo();
  const kk = locale === "kk";
  const [shareAge, setShareAge] = useState(false);
  const [shareLanguage, setShareLanguage] = useState(false);
  const item = localizeOffering(offering, locale);
  const [draft, setDraft] = useState(t.draft);
  const [fallback, setFallback] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);
  async function copy() {
    try {
      await navigator.clipboard.writeText(draft);
      setFallback(false);
      notify(t.copied);
    } catch {
      setFallback(true);
      ref.current?.focus();
      ref.current?.select();
    }
  }
  return (
    <div className="narrow-page">
      <div className="page-heading">
        <h1>{t.contactTitle}</h1>
        <p className="lead">{t.contactLead}</p>
      </div>
      <p className="notice">{t.contactDemo}</p>
      <section className="profile-panel">
        <h2>{item.name}</h2>
        <p>{item.service}</p>
        <p className="quiet">
          {t.contact}: {item.contact}
        </p>
        <fieldset>
          <legend>
            {kk
              ? "Хабарламаға қандай мәлімет қосамыз?"
              : "Что включить в обращение?"}
          </legend>
          <label className="check">
            <input
              type="checkbox"
              checked={shareAge}
              onChange={(e) => setShareAge(e.target.checked)}
              disabled={childProfile?.age == null}
            />
            {kk ? "Баланың жасы" : "Возраст ребёнка"}
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={shareLanguage}
              onChange={(e) => setShareLanguage(e.target.checked)}
              disabled={!childProfile?.language}
            />
            {kk ? "Кездесу тілі" : "Язык встречи"}
          </label>
        </fieldset>
        <p className="quiet">
          {kk
            ? "Аты, жынысы, диагнозы мен құжаттары автоматты түрде қосылмайды."
            : "Имя, пол, диагноз и документы автоматически не включаются."}
        </p>
        <button
          className="button light"
          onClick={() =>
            setDraft(
              [
                kk
                  ? `Сәлеметсіз бе! «${item.service}» қызметі туралы білгім келеді.`
                  : `Здравствуйте! Хочу узнать об услуге «${item.service}».`,
                shareAge && childProfile?.age != null
                  ? kk
                    ? `Баланың жасы: ${childProfile.age}.`
                    : `Возраст ребёнка: ${childProfile.age}.`
                  : "",
                shareLanguage && childProfile?.language
                  ? kk
                    ? `Кездесу тілі: ${childProfile.language === "kk" ? "қазақша" : "орысша"}.`
                    : `Язык встречи: ${childProfile.language === "kk" ? "казахский" : "русский"}.`
                  : "",
                kk
                  ? "Алғашқы кездесуге ата-ана қатыса ала ма? Құны мен бос уақытын айтыңызшы."
                  : "Можно ли присутствовать родителю на первой встрече? Подскажите стоимость и свободное время.",
              ]
                .filter(Boolean)
                .join(" "),
            )
          }
        >
          {kk
            ? "Таңдалған мәліметтермен мәтінді құру"
            : "Собрать текст с выбранными сведениями"}
        </button>
        <label htmlFor="contact-draft">{t.draftLabel}</label>
        <textarea
          id="contact-draft"
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
          rows={7}
        />
        <p className="quiet">{t.draftPrivacy}</p>
        {fallback && <p role="status">{t.copyFallback}</p>}
        <div className="actions">
          <button
            className="button primary"
            disabled={!draft.trim()}
            onClick={copy}
          >
            {t.copy}
          </button>
          <button className="button light" onClick={() => setDraft(t.draft)}>
            {t.restoreDraft}
          </button>
          <Link className="button light" href={`/${locale}/route`}>
            {t.toPlan}
          </Link>
        </div>
      </section>
      <section className="profile-panel">
        <h2>{kk ? "Өзіңізге де қолдау" : "Поддержка для вас"}</h2>
        <p>
          {kk
            ? "Қаласаңыз, ата-аналар қауымдастығын немесе өзіңізге қолдауды қараңыз. Мұны кейінге қалдыруға болады."
            : "Если хотите, загляните в сообщество родителей или подберите поддержку для себя. Это можно оставить на потом."}
        </p>
        <Link className="button light" href={`/${locale}/for-me`}>
          {kk ? "Өзіме" : "Для меня"}
        </Link>
      </section>
    </div>
  );
}
