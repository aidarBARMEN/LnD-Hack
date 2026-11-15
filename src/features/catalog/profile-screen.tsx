"use client";
import Link from "next/link";
import type { Offering } from "./contracts";
import { localizeOffering } from "./translations";
import OfferingSummary from "./offering-summary";
import { useLocale } from "@/ui/use-locale";
import { useDemo } from "@/ui/demo-shell";

export default function ProfileScreen({ offering }: { offering: Offering }) {
  const { locale, t } = useLocale();
  const { dispatch, notify } = useDemo();
  const item = localizeOffering(offering, locale);
  return (
    <div className="narrow-page">
      <div className="page-heading">
        <Link
          href={`/${locale}/search?audience=${item.audience}`}
          className="text-link"
        >
          {t.backCatalog}
        </Link>
      </div>
      <p className="notice">{t.demoNotice}</p>
      <article className="profile-panel">
        <OfferingSummary item={item} />
        <div className="actions">
          <Link
            className="button primary"
            href={`/${locale}/contact/${item.id}`}
            onClick={() => {
              dispatch({
                type: "add",
                goal: {
                  id: `offering-${item.id}`,
                  title: item.service,
                  done: false,
                  offeringIds: [item.id],
                  origin: "manual",
                  quote: null,
                  historical: false,
                },
              });
              notify(t.selectedNotice);
            }}
          >
            {locale === "kk"
              ? "Алғашқы хабарламаны дайындау"
              : "Подготовить обращение"}
          </Link>
          <Link className="button light" href={`/${locale}/compare`}>
            {t.compare}
          </Link>
        </div>
      </article>
      <section className="profile-panel">
        <h2>{locale === "kk" ? "Тексеру туралы" : "Что проверено"}</h2>
        <p>
          {locale === "kk"
            ? "Бұл ойдан шығарылған анкета. Байланыс, диплом мен тәжірибе тексерілмеген. Нақты маманға жолданбайды."
            : "Это вымышленная анкета. Контакт, диплом и опыт не проверялись. Обращение не отправляется реальному специалисту."}
        </p>
        <p>
          {locale === "kk"
            ? "Нақты каталогта әр тексерудің көзі, күні және нәтижесі көрсетіледі. Файлды жүктеу тексеруге тең емес."
            : "В реальном каталоге у каждой проверки будут источник, дата и результат. Загрузка файла не равна проверке."}
        </p>
      </section>
    </div>
  );
}
