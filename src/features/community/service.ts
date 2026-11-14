import { matchesSearch } from "@/lib/search";
import type { Locale } from "@/locales/messages";
export type Topic = "support" | "activities" | "care" | "specialists";
export const topics: Topic[] = ["support", "activities", "care", "specialists"];
export const demoAuthor = "demo-you";
export interface Comment {
  id: string;
  authorId: string;
  body: string;
  locale: Locale;
  createdAt: number;
}
export interface Post {
  id: string;
  authorId: string;
  title: string;
  body: string;
  locale: Locale;
  topic: Topic;
  createdAt: number;
  comments: Comment[];
  reported: boolean;
  translations?: Record<Locale, { title: string; body: string }>;
}
export const initialPosts: Post[] = [
  {
    id: "first-contact",
    authorId: "seed-parent",
    title: "Что спросить у специалиста до первого визита?",
    body: "Учебная тема: я бы сначала уточнила язык занятий, длительность, стоимость и возможность знакомства. Какие организационные вопросы важны вам?",
    locale: "ru",
    topic: "specialists",
    createdAt: 1794542400000,
    comments: [],
    reported: false,
    translations: {
      ru: {
        title: "Что спросить у специалиста до первого визита?",
        body: "Учебная тема: я бы сначала уточнила язык занятий, длительность, стоимость и возможность знакомства. Какие организационные вопросы важны вам?",
      },
      kk: {
        title: "Алғашқы кездесуге дейін маманнан не сұрау керек?",
        body: "Оқу тақырыбы: алдымен сабақ тілін, ұзақтығын, құнын және танысу мүмкіндігін сұрар едім. Сізге қандай ұйымдастыру сұрақтары маңызды?",
      },
    },
  },
  {
    id: "time-for-mom",
    authorId: "seed-parent",
    title: "Как находите время для своих увлечений?",
    body: "Учебная история: хочу выделить 15 минут для чтения. Поделитесь идеями небольшого досуга, без ощущения ещё одной обязанности.",
    locale: "ru",
    topic: "activities",
    createdAt: 1794538800000,
    comments: [],
    reported: false,
    translations: {
      ru: {
        title: "Как находите время для своих увлечений?",
        body: "Учебная история: хочу выделить 15 минут для чтения. Поделитесь идеями небольшого досуга, без ощущения ещё одной обязанности.",
      },
      kk: {
        title: "Өз әуестігіңізге уақытты қалай табасыз?",
        body: "Оқу тарихы: кітап оқуға 15 минут бөлгім келеді. Тағы бір міндетке айналмайтын бос уақыт идеяларымен бөлісіңіз.",
      },
    },
  },
  {
    id: "nanny-schedule",
    authorId: "seed-parent",
    title: "Почасовая няня или постоянный график?",
    body: "Учебное обсуждение: сравниваю форматы помощи. Что вы заранее обсуждаете о расписании, обязанностях и отмене договорённостей? Без личных контактов и данных детей.",
    locale: "ru",
    topic: "care",
    createdAt: 1794535200000,
    comments: [],
    reported: false,
    translations: {
      ru: {
        title: "Почасовая няня или постоянный график?",
        body: "Учебное обсуждение: сравниваю форматы помощи. Что вы заранее обсуждаете о расписании, обязанностях и отмене договорённостей? Без личных контактов и данных детей.",
      },
      kk: {
        title: "Сағаттық күтуші ме, тұрақты кесте ме?",
        body: "Оқу талқылауы: көмек форматтарын салыстырып жүрмін. Кесте, міндеттер мен бас тарту туралы алдын ала нені талқылайсыз? Жеке байланыстар мен бала деректерінсіз.",
      },
    },
  },
];
export function postText(post: Post, locale: Locale) {
  return post.translations?.[locale] ?? { title: post.title, body: post.body };
}
export function searchPosts(
  posts: Post[],
  query: string,
  topic: Topic | "",
  sort: "recent" | "discussed",
) {
  return posts
    .filter(
      (p) =>
        (!topic || p.topic === topic) &&
        matchesSearch(
          `${p.title} ${p.body} ${p.translations?.kk.title ?? ""} ${p.translations?.kk.body ?? ""} ${p.comments.map((c) => c.body).join(" ")}`,
          query,
        ),
    )
    .sort(
      (a, b) =>
        (sort === "discussed" ? b.comments.length - a.comments.length : 0) ||
        b.createdAt - a.createdAt ||
        a.id.localeCompare(b.id),
    );
}
export function validPost(title: string, body: string, topic: string) {
  return (
    title.trim().length > 0 &&
    title.trim().length <= 120 &&
    body.trim().length > 0 &&
    body.trim().length <= 2000 &&
    topics.includes(topic as Topic)
  );
}
export type ForumAction =
  | { type: "create"; post: Post }
  | {
      type: "edit";
      id: string;
      title: string;
      body: string;
      topic: Topic;
      actorId: string;
    }
  | { type: "delete"; id: string; actorId: string }
  | { type: "report"; id: string; actorId: string }
  | { type: "comment"; postId: string; comment: Comment }
  | {
      type: "deleteComment";
      postId: string;
      commentId: string;
      actorId: string;
    };
export function forumReducer(posts: Post[], action: ForumAction): Post[] {
  if (action.type === "create")
    return posts.some((p) => p.id === action.post.id) ||
      action.post.authorId !== demoAuthor ||
      !validPost(action.post.title, action.post.body, action.post.topic)
      ? posts
      : [action.post, ...posts];
  if (action.type === "delete")
    return posts.filter(
      (p) => !(p.id === action.id && p.authorId === action.actorId),
    );
  return posts.map((p) => {
    if (action.type === "comment") {
      if (
        p.id !== action.postId ||
        action.comment.authorId !== demoAuthor ||
        !action.comment.body.trim() ||
        action.comment.body.length > 1000 ||
        p.comments.some((c) => c.id === action.comment.id)
      )
        return p;
      return { ...p, comments: [...p.comments, action.comment] };
    }
    if (action.type === "deleteComment")
      return p.id === action.postId
        ? {
            ...p,
            comments: p.comments.filter(
              (c) =>
                !(c.id === action.commentId && c.authorId === action.actorId),
            ),
          }
        : p;
    if (p.id !== action.id) return p;
    if (action.type === "report") return { ...p, reported: true };
    return p.authorId === action.actorId &&
      validPost(action.title, action.body, action.topic)
      ? {
          ...p,
          title: action.title.trim(),
          body: action.body.trim(),
          topic: action.topic,
        }
      : p;
  });
}
