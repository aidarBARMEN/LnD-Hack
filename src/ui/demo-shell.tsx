"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  Suspense,
} from "react";
import {
  routeReducer,
  type RouteAction,
  type RouteGoal,
} from "@/features/routes/service";
import type { Review } from "@/features/documents/service";
import type { Filters } from "@/features/catalog/contracts";
import { useLocale } from "@/ui/use-locale";
import type { Stage, TimeFilter } from "@/features/support/service";
import { BrandMark, LineIcon, type IconName } from "@/ui/brand-art";
import type { ChildProfile } from "@/features/children/service";
import type { MotherProfile } from "@/features/children/mother-profile";
import { blankDraft, type ProviderDraft } from "@/features/revision/service";
import {
  bookingReducer,
  type BookingState,
  type BookingAction,
} from "@/features/nannies/service";
import {
  forumReducer,
  initialPosts,
  type Post,
  type ForumAction,
} from "@/features/community/service";
interface DemoState {
  motherProfile: MotherProfile | null;
  setMotherProfile: Dispatch<SetStateAction<MotherProfile | null>>;
  providerDraft: ProviderDraft;
  setProviderDraft: Dispatch<SetStateAction<ProviderDraft>>;
  chats: Record<string, string[]>;
  setChats: Dispatch<SetStateAction<Record<string, string[]>>>;
  childProfile: ChildProfile | null;
  setChildProfile: Dispatch<SetStateAction<ChildProfile | null>>;
  bookingState: BookingState;
  dispatchBooking: Dispatch<BookingAction>;
  posts: Post[];
  dispatchForum: Dispatch<ForumAction>;
  goals: RouteGoal[];
  dispatch: Dispatch<RouteAction>;
  notify: (text: string) => void;
  review: Review | null;
  setReview: Dispatch<SetStateAction<Review | null>>;
  comparisonIds: string[];
  setComparisonIds: Dispatch<SetStateAction<string[]>>;
  filtersByAudience: Record<string, Filters>;
  setFiltersByAudience: Dispatch<SetStateAction<Record<string, Filters>>>;
  supportFilters: { stage: Stage | ""; time: TimeFilter };
  setSupportFilters: Dispatch<
    SetStateAction<{ stage: Stage | ""; time: TimeFilter }>
  >;
}
const DemoContext = createContext<DemoState | null>(null);
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("Demo provider missing");
  return context;
}
export function DemoProvider({ children }: { children: ReactNode }) {
  const [motherProfile, setMotherProfile] = useState<MotherProfile | null>(
    null,
  );
  const [providerDraft, setProviderDraft] = useState(blankDraft);
  const [chats, setChats] = useState<Record<string, string[]>>({});
  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [bookingState, dispatchBooking] = useReducer(bookingReducer, {
    items: [],
    error: null,
  });
  const [posts, dispatchForum] = useReducer(forumReducer, initialPosts);
  const { locale, t } = useLocale();
  const [goals, dispatch] = useReducer(routeReducer, []);
  const [notice, setNotice] = useState({ text: "", locale });
  const notify = (text: string) => setNotice({ text, locale });
  const [review, setReview] = useState<Review | null>(null);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);
  const [filtersByAudience, setFiltersByAudience] = useState<
    Record<string, Filters>
  >({});
  const [supportFilters, setSupportFilters] = useState<{
    stage: Stage | "";
    time: TimeFilter;
  }>({ stage: "", time: "" });
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return (
    <DemoContext.Provider
      value={{
        motherProfile,
        setMotherProfile,
        providerDraft,
        setProviderDraft,
        chats,
        setChats,
        childProfile,
        setChildProfile,
        bookingState,
        dispatchBooking,
        posts,
        dispatchForum,
        goals,
        dispatch,
        notify,
        review,
        setReview,
        comparisonIds,
        setComparisonIds,
        filtersByAudience,
        setFiltersByAudience,
        supportFilters,
        setSupportFilters,
      }}
    >
      {children}
      {notice.text && notice.locale === locale && (
        <div className="toast" role="status">
          {notice.text}
          <button onClick={() => notify("")} aria-label={t.closeNotice}>
            ×
          </button>
        </div>
      )}
    </DemoContext.Provider>
  );
}
function LanguageSwitch() {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const { locale, t } = useLocale();
  return (
    <div className="language-switch" aria-label={t.language}>
      {(["ru", "kk"] as const).map((lang) => (
        <Link
          key={lang}
          href={`${pathname.replace(/^\/(ru|kk)(?=\/|$)/, `/${lang}`)}${query ? `?${query}` : ""}`}
          hrefLang={lang}
          lang={lang}
          aria-current={locale === lang ? "true" : undefined}
        >
          {lang === "ru" ? "Рус" : "Қаз"}
        </Link>
      ))}
    </div>
  );
}
export default function DemoShell({ children }: { children: ReactNode }) {
  const { goals, comparisonIds } = useDemo();
  const { locale, t } = useLocale();
  const pathname = usePathname();
  const links = [
    [`/${locale}`, t.home],
    [`/${locale}/search`, "Поиск"],
    [`/${locale}/chats`, "Чаты"],
    [`/${locale}/for-me`, "Для меня"],
    [`/${locale}/profile`, "Профиль"],
  ];
  const navIcons: IconName[] = [
    "home",
    "child",
    "community",
    "heart",
    "person",
  ];
  return (
    <>
      <a className="skip" href="#main">
        {t.skip}
      </a>
      <header className="header">
        <div className="header-inner">
          <Link className="brand" href={`/${locale}`}>
            <span className="birge-mark">
              <BrandMark />
            </span>
            <span>
              {t.brand}
              <small>{t.tagline}</small>
            </span>
          </Link>
          <Suspense>
            <LanguageSwitch />
          </Suspense>
        </div>
        <nav className="simple-nav" aria-label={t.navigation}>
          {links.map(([href, label], index) => (
            <Link
              key={href}
              href={href!}
              aria-current={
                pathname === href!.split("?")[0] ? "page" : undefined
              }
            >
              <LineIcon name={navIcons[index]!} className="nav-icon" />
              <span>{label}</span>
              {href!.endsWith("/route") && goals.length > 0 && (
                <span className="count">{goals.length}</span>
              )}
            </Link>
          ))}
        </nav>
      </header>
      <div className="session-note">{t.session}</div>
      <main id="main" key={pathname} className="container">
        {children}
      </main>
      {comparisonIds.length > 0 && !pathname.endsWith("/compare") && (
        <Link
          className="comparison-tray button primary"
          href={`/${locale}/compare`}
        >
          {t.compare} · {comparisonIds.length}/3 →
        </Link>
      )}
      <footer className="container footer">
        <span>{t.brand}</span>
        <p>{t.footer}</p>
        <Link href={`/${locale}/route`}>{t.plan}</Link>
        <Link href="/ru/documents">{t.legacy}</Link>
      </footer>
    </>
  );
}
