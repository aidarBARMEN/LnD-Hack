"use client";
import Link from "next/link";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import QuickStart from "./quick-start";
export default function HomeScreen() {
  const { childProfile, goals } = useDemo();
  const { locale } = useLocale();
  const kk = locale === "kk";
  if (!childProfile) return <QuickStart />;
  const next = goals.find((g) => !g.done);
  return (
    <div className="narrow-page">
      <p className="eyebrow">
        {kk ? "Бірге — алғашқы қадам" : "Первый шаг вместе"}
      </p>
      <h1>{kk ? "Сізге ыңғайлы қарқынмен" : "В вашем темпе"}</h1>
      <p>
        {childProfile.city} · {childProfile.age} {kk ? "жас" : "лет"} ·{" "}
        {childProfile.language === "kk"
          ? kk
            ? "Қазақша"
            : "Казахский"
          : childProfile.language === "ru"
            ? kk
              ? "Орысша"
              : "Русский"
            : ""}
      </p>
      <section className="profile-panel">
        <h2>{kk ? "Келесі қадам" : "Ваш следующий шаг"}</h2>
        <p>
          {next?.title ??
            (kk
              ? "Мамандардың шарттарын қарап, алғашқы хабарламаны дайындаңыз."
              : "Посмотрите условия специалистов и подготовьте первое обращение.")}
        </p>
        <Link
          className="button primary"
          href={`/${locale}/${next ? "route" : "search"}`}
        >
          {next
            ? kk
              ? "Жоспарды ашу"
              : "Открыть план"
            : kk
              ? "Нұсқаларды қарау"
              : "Посмотреть варианты"}
        </Link>
      </section>
      <section className="profile-panel">
        <h2>{kk ? "ПМПК ұсынымдары бар ма?" : "Есть рекомендации ПМПК?"}</h2>
        <p>
          {kk
            ? "Оқу мысалынан ұсынымдарды қарап, іздеу үшін растаңыз."
            : "Посмотрите рекомендации из учебного примера и подтвердите их для поиска."}
        </p>
        <Link className="button light" href={`/${locale}/pmpk`}>
          {kk ? "Мысалды талдау" : "Разобрать пример"}
        </Link>
      </section>
      <div className="actions">
        <Link href={`/${locale}/for-me`}>
          {kk ? "Өзіме қолдау" : "Поддержка для меня"}
        </Link>
        <Link href={`/${locale}/profile/child`}>
          {kk ? "Профильді өзгерту" : "Изменить профиль"}
        </Link>
        <Link href={`/${locale}/community`}>
          {kk ? "Ата-аналар қауымдастығы" : "Сообщество родителей"}
        </Link>
      </div>
    </div>
  );
}
