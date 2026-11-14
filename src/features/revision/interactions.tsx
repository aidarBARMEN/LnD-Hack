"use client";
import { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/ui/demo-shell";
import { useLocale } from "@/ui/use-locale";
import { offerings } from "@/features/catalog/service";
import { nannies } from "@/features/nannies/service";
import {
  canPublish,
  districts,
  listings,
  plans,
  publishedListing,
  specialties,
  type Specialty,
} from "./service";
export function PublishScreen() {
  const { providerDraft: d, setProviderDraft: set, notify } = useDemo();
  const { locale } = useLocale();
  const [pay, setPay] = useState(false);
  const [fileError, setFileError] = useState("");
  const patch = (values: Partial<typeof d>) =>
    set({ ...d, ...values, status: "draft" });
  const plan = plans.find((p) => p.id === d.planId)!;
  return (
    <>
      <h1>Разместить профиль</h1>
      <p className="notice">
        Пример регистрации и оплаты. Учётная запись и платежи не создаются,
        документы никуда не загружаются. Используйте вымышленные сведения.
      </p>
      <p role="status">
        Статус:{" "}
        <strong>
          {d.status === "draft"
            ? "Черновик — скрыт из поиска"
            : "Опубликован в демо этой вкладки"}
        </strong>
      </p>
      <form
        className="profile-panel"
        onSubmit={(e) => {
          e.preventDefault();
          notify("Черновик сохранён в этой вкладке");
        }}
      >
        <h2>1. Учебная регистрация</h2>
        <label>
          Имя специалиста
          <input
            required
            minLength={2}
            maxLength={100}
            value={d.name}
            onChange={(e) => patch({ name: e.target.value })}
          />
        </label>
        <label>
          Email — пример
          <input
            type="email"
            required
            maxLength={200}
            placeholder="specialist@example.invalid"
            value={d.email}
            onChange={(e) => patch({ email: e.target.value })}
          />
        </label>
        <h2>2. Карточка и квалификация</h2>
        <label>
          Специальность
          <select
            value={d.specialty}
            onChange={(e) => patch({ specialty: e.target.value as Specialty })}
          >
            {Object.entries(specialties).map(([v, l]) => (
              <option value={v} key={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label>
          Район
          <select
            value={d.district}
            onChange={(e) => patch({ district: e.target.value })}
          >
            {districts.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Цена за занятие, ₸
          <input
            type="number"
            required
            min={0}
            value={d.price}
            onChange={(e) => patch({ price: e.target.value })}
          />
        </label>
        <label>
          О себе и формате помощи
          <textarea
            required
            minLength={10}
            maxLength={1000}
            value={d.description}
            onChange={(e) => patch({ description: e.target.value })}
          />
        </label>
        <label>
          Учебный документ о квалификации (PDF/JPG/PNG, до 5МБ)
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) {
                patch({ documentName: "" });
                return;
              }
              if (
                file.size > 5 * 1024 * 1024 ||
                !/\.(pdf|jpe?g|png)$/i.test(file.name)
              ) {
                setFileError("Выберите PDF/JPG/PNG размером до 5МБ");
                e.target.value = "";
                patch({ documentName: "" });
                return;
              }
              setFileError("");
              patch({ documentName: file.name });
            }}
          />
        </label>
        {fileError && <p role="alert">{fileError}</p>}
        {d.documentName && (
          <p>
            Выбран пример: {d.documentName}. Хранится только имя файла; проверка
            не выполнена.
          </p>
        )}
        <h2>3. Условный тариф</h2>
        <div className="tariff-grid">
          {plans.map((p) => (
            <label className="tariff" key={p.id}>
              <input
                type="radio"
                name="tariff"
                checked={d.planId === p.id}
                onChange={() => patch({ planId: p.id })}
              />
              <strong>
                {p.name} · {p.price.toLocaleString("ru")} ₸
              </strong>
              <span>{p.description}</span>
            </label>
          ))}
        </div>
        <p>
          Тариф не влияет на рейтинг. Рейтинг рассчитывается только по отзывам.
        </p>
        <label className="check">
          <input
            type="checkbox"
            checked={d.consent}
            onChange={(e) => patch({ consent: e.target.checked })}
          />
          Я использую вымышленные данные и понимаю, что это демонстрация.
        </label>
        <div className="actions">
          <button className="button light">Сохранить черновик</button>
          <button
            className="button primary"
            type="button"
            disabled={!canPublish(d) || d.status === "published"}
            onClick={() => setPay(true)}
          >
            Перейти к демо-оплате
          </button>
        </div>
      </form>
      {pay && (
        <section
          className="profile-panel payment-panel"
          aria-label="Демонстрация оплаты"
        >
          <h2>Демо-оплата</h2>
          <p>
            {plan.name}: {plan.price.toLocaleString("ru")} ₸. Денег не
            списываем; реквизиты карты не нужны.
          </p>
          <div className="actions">
            <button
              className="button primary"
              onClick={() => {
                if (canPublish(d)) {
                  set({ ...d, status: "published" });
                  setPay(false);
                  notify("Учебная оплата прошла. Профиль появился в поиске.");
                }
              }}
            >
              Имитировать успешную оплату
            </button>
            <button
              className="button light"
              onClick={() => {
                setPay(false);
                notify("Оплата отменена. Профиль остался черновиком.");
              }}
            >
              Отменить оплату
            </button>
          </div>
        </section>
      )}
      {d.status === "published" && (
        <Link
          className="button primary"
          href={`/${locale}/search/my-demo-profile`}
        >
          Посмотреть опубликованный пример
        </Link>
      )}
    </>
  );
}
export function ChatsScreen({ id }: { id?: string }) {
  const { chats, setChats, providerDraft } = useDemo();
  const { locale } = useLocale();
  const [text, setText] = useState("");
  const extra = publishedListing(providerDraft);
  const contacts = [
    ...listings.map((i) => ({ id: i.id, name: i.name })),
    ...nannies.map((i) => ({ id: i.id, name: i.name.ru })),
    ...offerings
      .filter((o) => !listings.some((l) => l.id === o.id))
      .map((i) => ({ id: i.id, name: i.name })),
    ...(extra ? [extra] : []),
  ];
  const contact = contacts.find((c) => c.id === id);
  const ids = Object.keys(chats);
  if (!id)
    return (
      <>
        <h1>Чаты</h1>
        <p className="notice">
          Пример переписки. Сообщения не отправляются людям и исчезнут при
          обновлении страницы.
        </p>
        {ids.length ? (
          ids.map((key) => (
            <Link
              className="messenger-row"
              key={key}
              href={`/${locale}/chats/${key}`}
            >
              <span className="round-avatar">Б</span>
              <div>
                <strong>
                  {contacts.find((c) => c.id === key)?.name ??
                    "Учебный контакт"}
                </strong>
                <small>{chats[key]?.at(-1)}</small>
                <small>Только в этой вкладке</small>
              </div>
            </Link>
          ))
        ) : (
          <div className="empty">
            <h2>Здесь появятся ваши диалоги</h2>
            <p>Откройте карточку специалиста и нажмите «Написать».</p>
            <Link className="button primary" href={`/${locale}/search`}>
              Найти специалиста
            </Link>
          </div>
        )}
      </>
    );
  if (!contact)
    return (
      <>
        <h1>Диалог недоступен</h1>
        <Link href={`/${locale}/chats`}>К чатам</Link>
      </>
    );
  return (
    <div className="chat-screen">
      <Link href={`/${locale}/chats`}>← Чаты</Link>
      <h1>{contact.name}</h1>
      <p className="quiet">Учебный контакт · не в сети</p>
      <p className="notice">
        Это демо. Никто не получает сообщения. Не вводите медицинские или личные
        данные.
      </p>
      <div className="chat-messages" role="log" aria-label="Сообщения">
        <p className="bubble incoming">
          Здравствуйте! Это пример диалога для знакомства. Можно обсудить формат
          и свободное время. Ответы специалиста здесь не поступают.
        </p>
        {(chats[id] ?? []).map((message, i) => (
          <p className="bubble outgoing" key={i}>
            {message}
            <small>Пример · не отправлено</small>
          </p>
        ))}
      </div>
      <form
        className="chat-compose"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          setChats({ ...chats, [id]: [...(chats[id] ?? []), text.trim()] });
          setText("");
        }}
      >
        <label>
          Сообщение
          <textarea
            maxLength={1000}
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Например: как проходит знакомство?"
          />
        </label>
        <button className="button primary" disabled={!text.trim()}>
          Добавить в демо-чат
        </button>
      </form>
    </div>
  );
}
