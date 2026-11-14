"use client";
import Link from "next/link";
import type { Offering } from "./contracts";
import { localizeOffering } from "./translations";
import OfferingSummary from "./offering-summary";
import { useLocale } from "@/ui/use-locale";
import { useDemo } from "@/ui/demo-shell";
import { listings } from "@/features/revision/service";
import { VisitPreparation } from "@/features/revision/search";
export default function ProfileScreen({ offering }: { offering: Offering }) {
  const { locale, t } = useLocale();
  const { dispatch, notify } = useDemo();
  const item = localizeOffering(offering, locale);
  return (
    <div className="narrow-page">
      <div className="page-heading">
        <Link
          href={`/${locale}/catalog?audience=${item.audience}`}
          className="text-link"
        >
          {t.backCatalog}
        </Link>
      </div>
      <p className="notice">{t.demoNotice}</p>
      <article className="profile-panel">
        <OfferingSummary item={item} />
        <div className="actions">
          <Link className="button light" href={`/${locale}/chats/${item.id}`}>
            Написать
          </Link>
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
            {t.choose}
          </Link>
          <Link className="button light" href={`/${locale}/compare`}>
            {t.compare}
          </Link>
        </div>
      </article>
      <VisitPreparation
        item={
          listings.find((l) => l.id === offering.id) ?? {
            ...listings[0]!,
            id: offering.id,
            name: offering.name,
            specialty:
              offering.audience === "adult"
                ? "parent"
                : offering.category === "development"
                  ? "learning"
                  : offering.category === "mobility"
                    ? "ergo"
                    : "child",
          }
        }
      />
    </div>
  );
}
