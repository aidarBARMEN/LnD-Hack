import { matchesSearch } from "@/lib/search";
import type { ChildProfile } from "@/features/children/service";
import { providerPlans } from "@/config/provider-plans";
export const specialties = {
  speech: "Логопед",
  learning: "Дефектолог",
  parent: "Психолог для родителей",
  child: "Детский психолог",
  music: "Музыкальный педагог",
  ergo: "Эрготерапевт",
  swim: "Инструктор по плаванию",
};
export type Specialty = keyof typeof specialties;
export const stages = [
  "Диагноз",
  "Рекомендации ПМПК",
  "Назначение врача",
  "Реабилитация",
];
export interface CareDetails {
  diagnosis: string;
  pmpk: string;
  prescriptions: string;
  documents: string[];
  specialists: Specialty[];
  completedStages: number[];
}
export const emptyCare: CareDetails = {
  diagnosis: "",
  pmpk: "",
  prescriptions: "",
  documents: [],
  specialists: [],
  completedStages: [],
};
export const documentNames = [
  "Заключение ПМПК",
  "Назначение врача",
  "Справка об инвалидности",
  "Индивидуальная программа реабилитации",
];
export function recommendedSpecialties(p: ChildProfile): Specialty[] {
  if (p.care?.specialists.length) return p.care.specialists;
  const codes: Specialty[] = [];
  if (p.needs.includes("communication")) codes.push("speech");
  if (p.needs.includes("development")) codes.push("learning");
  if (p.needs.includes("psychology")) codes.push("child");
  if (p.needs.includes("mobility")) codes.push("ergo");
  return codes;
}
export const districts = [
  "Алатауский",
  "Алмалинский",
  "Ауэзовский",
  "Бостандыкский",
  "Жетысуский",
  "Медеуский",
  "Наурызбайский",
  "Турксибский",
];
export const sections = {
  specialist: "Специалисты",
  daycare: "Центры дневного пребывания",
  nanny: "Няни",
  social: "Социальные помощники",
  auto: "Авто-няня",
  state: "Господдержка",
  legal: "Юридическая поддержка",
};
export type Section = keyof typeof sections;
export interface Review {
  id: string;
  author: string;
  score: number;
  text: string;
}
export interface Listing {
  id: string;
  name: string;
  section: Section;
  specialty?: Specialty;
  district: string;
  price: number | null;
  unit: string;
  languages: string[];
  format: "очно" | "онлайн";
  distance: number;
  description: string;
  methods: string[];
  reviews: Review[];
  documentsChecked: boolean;
  details: string[];
}
const review = (score: number, text: string): Review[] => [
  { id: "example-review", author: "Родитель · пример", score, text },
];
export const listings: Listing[] = [
  {
    id: "speech",
    name: "Алия С. · логопед",
    section: "specialist",
    specialty: "speech",
    district: "Бостандыкский",
    price: 8000,
    unit: "занятие",
    languages: ["ru", "kk"],
    format: "очно",
    distance: 2.4,
    description:
      "Развитие речи и альтернативной коммуникации — способов общения с помощью жестов и карточек.",
    methods: ["Игровые задания", "Карточки для общения"],
    reviews: review(
      5,
      "Пример отзыва: заранее объяснили порядок первой встречи.",
    ),
    documentsChecked: true,
    details: [
      "Адрес: учебный кабинет, ул. Примерная, 12",
      "45 минут; удобное время уточняется",
    ],
  },
  {
    id: "speech-group",
    name: "Айгерим Т. · логопед",
    section: "specialist",
    specialty: "speech",
    district: "Алмалинский",
    price: 5000,
    unit: "занятие",
    languages: ["ru"],
    format: "очно",
    distance: 4.1,
    description: "Практика общения в небольшой группе, 6–16 лет.",
    methods: ["Групповая игра"],
    reviews: review(4, "Пример: удобно обсуждать вопросы после встречи."),
    documentsChecked: false,
    details: ["Учебный кабинет, ул. Примерная, 18", "До 4участников, 50минут"],
  },
  ...(
    [
      ["learning", "Дефектолог — педагог по развитию и обучению", 7000],
      ["child", "Детский психолог", 9000],
      ["parent", "Психолог для родителей", 10000],
      ["music", "Музыкальный педагог", 6000],
      ["ergo", "Эрготерапевт — навыки повседневной жизни", 11000],
      ["swim", "Инструктор по плаванию", 6500],
    ] as const
  ).map(([specialty, name, price], i) => ({
    id: `example-${specialty}`,
    name,
    section: "specialist" as const,
    specialty,
    district: districts[i]!,
    price,
    unit: "занятие",
    languages: ["ru", "kk"],
    format: (i === 2 ? "онлайн" : "очно") as "онлайн" | "очно",
    distance: 1.2 + i,
    description:
      "Пример карточки. Цели и подходящий формат обсуждаются на знакомстве, результат не гарантируется.",
    methods: [
      specialty === "ergo"
        ? "Адаптация повседневных задач"
        : "Индивидуальная встреча",
    ],
    reviews: review(4 + (i % 2), "Пример отзыва: понятное объяснение формата."),
    documentsChecked: false,
    details: [
      "Опыт: 5лет — учебные сведения",
      "Расписание: по будням, время согласуется",
    ],
  })),
  {
    id: "example-daycare",
    name: "Центр «Вместе днём»",
    section: "daycare",
    district: "Наурызбайский",
    price: 120000,
    unit: "месяц",
    languages: ["ru", "kk"],
    format: "очно",
    distance: 6,
    description:
      "Пример дневного пребывания: небольшая группа, отдых и занятия. Это отдельный список центров.",
    methods: ["Сопровождение распорядка", "Групповые занятия"],
    reviews: review(4, "Пример: показали помещение до знакомства."),
    documentsChecked: false,
    details: [
      "Возраст: 4–12лет",
      "График: пн–пт, 09:00–17:00",
      "Адрес: ул. Примерная, 42; доступность входа уточняется",
    ],
  },
  {
    id: "example-social",
    name: "Самал · социальный помощник",
    section: "social",
    district: "Жетысуский",
    price: 2000,
    unit: "час",
    languages: ["ru", "kk"],
    format: "очно",
    distance: 3.1,
    description:
      "Сопровождение семьи в учреждения, помощь с бытовыми задачами и организацией документов.",
    methods: ["Бытовое сопровождение"],
    reviews: review(5, "Пример: помогли составить список документов."),
    documentsChecked: false,
    details: [
      "Опыт: 4года — пример",
      "График: пн, ср, пт, 10:00–16:00",
      "Медицинские процедуры не выполняются",
    ],
  },
  {
    id: "example-auto",
    name: "Ерлан · авто-няня",
    section: "auto",
    district: "Турксибский",
    price: 3500,
    unit: "поездка",
    languages: ["ru", "kk"],
    format: "очно",
    distance: 5,
    description:
      "Пример сопровождения на занятия и обратно. Маршрут, передачу ребёнка и условия безопасности нужно согласовать.",
    methods: ["Поездка и сопровождение"],
    reviews: review(5, "Пример: заранее обсудили место встречи."),
    documentsChecked: false,
    details: [
      "Автомобиль: учебный седан, 2021г.",
      "Детское кресло: заявлено в примере; соответствие возрасту уточняется",
      "Опыт: 6лет — пример",
      "График: будни, 08:00–19:00",
    ],
  },
];
export function rating(item: Listing) {
  return item.reviews.length
    ? item.reviews.reduce((s, r) => s + r.score, 0) / item.reviews.length
    : 0;
}
export interface SearchFilters {
  section: Section;
  query: string;
  district: string;
  specialty: string;
  maxPrice: string;
  minRating: string;
  format: string;
  language: string;
  sort: string;
  nearby: boolean;
}
export const initialSearch: SearchFilters = {
  section: "specialist",
  query: "",
  district: "",
  specialty: "",
  maxPrice: "",
  minRating: "",
  format: "",
  language: "",
  sort: "distance",
  nearby: false,
};
export function searchListings(items: Listing[], f: SearchFilters) {
  return items
    .filter(
      (i) =>
        i.section === f.section &&
        (!f.specialty || i.specialty === f.specialty) &&
        (!f.district || i.district === f.district) &&
        (!f.language || i.languages.includes(f.language)) &&
        (!f.format || i.format === f.format) &&
        (!f.maxPrice || (i.price !== null && i.price <= Number(f.maxPrice))) &&
        (!f.minRating || rating(i) >= Number(f.minRating)) &&
        (!f.nearby || i.distance <= 3) &&
        matchesSearch(
          `${i.name} ${i.description} ${i.methods.join(" ")}`,
          f.query,
        ),
    )
    .sort((a, b) =>
      f.sort === "price"
        ? (a.price ?? Infinity) - (b.price ?? Infinity)
        : f.sort === "rating"
          ? rating(b) - rating(a)
          : a.distance - b.distance,
    );
}
export function visitQuestions(item: Listing) {
  const common = [
    "Каковы возраст ребёнка и его интересы?",
    "Какую цель вы хотите обсудить?",
    "Что уже пробовали и что было удобно семье?",
    "Какие условия или ограничения важно учесть?",
  ];
  if (item.specialty === "parent")
    return [
      "Что сейчас больше всего вас утомляет?",
      "Какую поддержку вы получаете?",
      "Чего вы ждёте от встречи?",
      "Какой формат общения для вас удобен?",
    ];
  return [
    ...common,
    item.specialty === "speech"
      ? "Как ребёнок обычно общается дома?"
      : "Есть ли заключение ПМПК или назначения, которые вы хотите показать?",
  ];
}
export const information = [
  {
    id: "benefits",
    section: "state",
    title: "Пособия и социальные услуги",
    description:
      "Где уточнить порядок обращения за поддержкой семьи. Не определяем право на пособие и не обещаем выплату.",
    url: "https://www.gov.kz/org/adilet/documents/details/505176?lang=ru",
    source: "Министерство юстиции РК",
    needsDocument: true,
  },
  {
    id: "documents",
    section: "state",
    title: "Справки и обращение за услугами",
    description:
      "Официальная памятка о социальной поддержке и портале социальных услуг. Уточните актуальный список документов в уполномоченном органе.",
    url: "https://www.gov.kz/org/kzh-ozsp/press/news/details/1194801?lang=ru",
    source: "Официальный портал gov.kz",
    needsDocument: false,
  },
  {
    id: "rights",
    section: "legal",
    title: "Права семьи и юридическая консультация",
    description:
      "Как узнать о гарантированной государством юридической помощи. Условия бесплатной консультации проверяет уполномоченная организация.",
    url: "https://www.gov.kz/org/adilet-mng/activities/22327?lang=ru",
    source: "Департамент юстиции",
    needsDocument: false,
  },
];
export const plans = providerPlans;
export const nannyDetails: Record<
  string,
  {
    age: number;
    experience: number;
    district: string;
    distance: number;
    score: number;
    courses: string;
    support: string;
    schedule: string;
  }
> = {
  "nanny-a": {
    age: 34,
    experience: 7,
    district: "Бостандыкский",
    distance: 2.2,
    score: 5,
    courses: "Педагогический курс и первая помощь — примеры",
    support:
      "Опыт сопровождения детей с трудностями общения — учебные сведения. Готова сопровождать на занятия и прогулки, поддерживать знакомый распорядок. Упражнения — только по инструкции специалиста и договорённости.",
    schedule: "Будни 09:00–18:00; другие часы обсуждаются",
  },
  "nanny-b": {
    age: 42,
    experience: 10,
    district: "Алмалинский",
    distance: 4.2,
    score: 4,
    courses: "Курс ухода за детьми — пример",
    support:
      "Помощь в быту, прогулки и сопровождение. Опыт с особенностями ребёнка уточняется на знакомстве.",
    schedule: "Пн, ср, пт 10:00–17:00",
  },
  "nanny-c": {
    age: 31,
    experience: 5,
    district: "",
    distance: 10,
    score: 4,
    courses: "Педагогическое образование — пример",
    support:
      "Опыт игр с дошкольниками и поддержки распорядка. Особые условия ухода обсуждаются с семьёй.",
    schedule: "Будни; помесячно или постоянно",
  },
  "nanny-d": {
    age: 39,
    experience: 8,
    district: "Медеуский",
    distance: 2.8,
    score: 5,
    courses: "Первая помощь и сопровождающий уход — примеры",
    support:
      "Сопровождение школьников на занятия и прогулки. Поддержка самостоятельности в быту.",
    schedule: "Вт–сб 12:00–20:00",
  },
};
export interface ProviderDraft {
  name: string;
  email: string;
  specialty: Specialty;
  description: string;
  documentName: string;
  district: string;
  price: string;
  planId: string;
  status: "draft" | "published";
  consent: boolean;
}
export const blankDraft: ProviderDraft = {
  name: "",
  email: "",
  specialty: "speech",
  description: "",
  documentName: "",
  district: districts[0]!,
  price: "",
  planId: "start",
  status: "draft",
  consent: false,
};
export function canPublish(d: ProviderDraft) {
  return (
    d.name.trim().length >= 2 &&
    d.name.length <= 100 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email) &&
    d.email.length <= 200 &&
    d.description.trim().length >= 10 &&
    d.description.length <= 1000 &&
    !!d.documentName &&
    districts.includes(d.district) &&
    d.price !== "" &&
    Number.isFinite(Number(d.price)) &&
    Number(d.price) >= 0 &&
    !!specialties[d.specialty] &&
    plans.some((p) => p.id === d.planId) &&
    d.consent
  );
}
export function publishedListing(d: ProviderDraft): Listing | null {
  return d.status === "published" && canPublish(d)
    ? {
        id: "my-demo-profile",
        name: `${d.name} · пример`,
        section: "specialist",
        specialty: d.specialty,
        district: d.district,
        price: Number(d.price),
        unit: "занятие",
        languages: ["ru"],
        format: "очно",
        distance: 3,
        description: d.description,
        methods: ["Подход обсуждается при знакомстве"],
        reviews: [],
        documentsChecked: false,
        details: [
          "Сведения внесены учебным аккаунтом. Документы не проверены.",
        ],
      }
    : null;
}
