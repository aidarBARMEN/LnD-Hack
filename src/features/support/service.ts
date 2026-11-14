import type { Locale } from "@/locales/messages";
export type Stage = "newborn" | "parenting";
export type TimeFilter = "" | "15" | "30" | "60" | "over60";
interface Activity {
  id: string;
  minutes: number;
  stages: Stage[];
  title: Record<Locale, string>;
  description: Record<Locale, string>;
}
export const activities: Activity[] = [
  {
    id: "reading",
    minutes: 10,
    stages: ["newborn", "parenting"],
    title: {
      ru: "Несколько страниц любимой книги",
      kk: "Сүйікті кітаптың бірнеше беті",
    },
    description: {
      ru: "Оставьте небольшой промежуток для чтения того, что нравится вам. Закончить главу необязательно.",
      kk: "Өзіңіз ұнататын кітапқа аз уақыт бөліңіз. Тарауды аяқтау міндетті емес.",
    },
  },
  {
    id: "creative",
    minutes: 25,
    stages: ["newborn", "parenting"],
    title: {
      ru: "Небольшой творческий проект",
      kk: "Шағын шығармашылық жұмыс",
    },
    description: {
      ru: "Рисунок, коллаж или рукоделие из того, что уже есть под рукой. Без задачи сделать идеально.",
      kk: "Қолда бар заттардан сурет, коллаж немесе қолөнер. Мінсіз жасау міндет емес.",
    },
  },
  {
    id: "language",
    minutes: 15,
    stages: ["newborn", "parenting"],
    title: {
      ru: "Язык или новая тема для себя",
      kk: "Өзіңізге арналған тіл немесе жаңа тақырып",
    },
    description: {
      ru: "Выберите короткую главу или знакомый учебный материал по своему интересу. Это время для вашего любопытства.",
      kk: "Қызықты тақырыптан қысқа тарау не таныс оқу материалын таңдаңыз. Бұл — қызығушылығыңызға арналған уақыт.",
    },
  },
  {
    id: "conversation",
    minutes: 30,
    stages: ["newborn", "parenting"],
    title: { ru: "Разговор с близким человеком", kk: "Жақын адаммен әңгіме" },
    description: {
      ru: "Запланируйте беседу о том, что важно вам. Это идея личного досуга, а не консультация психолога.",
      kk: "Өзіңізге маңызды нәрсе туралы сөйлесуді жоспарлаңыз. Бұл психолог кеңесі емес, бос уақыт идеясы.",
    },
  },
  {
    id: "film",
    minutes: 50,
    stages: ["parenting"],
    title: {
      ru: "Фильм или лекция по интересам",
      kk: "Қызықты фильм немесе дәріс",
    },
    description: {
      ru: "Сохраните время для выбранного вами фильма или лекции. Можно смотреть частями и остановиться, когда удобно.",
      kk: "Өзіңіз таңдаған фильмге не дәріске уақыт сақтаңыз. Бөліп көруге және ыңғайлы кезде тоқтатуға болады.",
    },
  },
  {
    id: "hobby",
    minutes: 75,
    stages: ["parenting"],
    title: {
      ru: "Время для любимого увлечения",
      kk: "Сүйікті әуестікке уақыт",
    },
    description: {
      ru: "Если у вас есть свободное время и договорённость о помощи, оставьте его для своего хобби. Участие в мероприятии здесь не бронируется.",
      kk: "Бос уақыт пен көмек туралы келісім болса, оны өз әуестігіңізге арнаңыз. Мұнда іс-шараға жазылу жасалмайды.",
    },
  },
];
export function searchActivities(stage: Stage | "", time: TimeFilter) {
  return activities.filter(
    (item) =>
      (!stage || item.stages.includes(stage)) &&
      (!time ||
        (time === "15"
          ? item.minutes <= 15
          : time === "30"
            ? item.minutes > 15 && item.minutes <= 30
            : time === "60"
              ? item.minutes > 30 && item.minutes <= 60
              : item.minutes > 60)),
  );
}
