# Mama Pro — проект API v1

## U1 — локальные изменения

`recommendOfferings(profile, filters?)` — общие правила основного подбора. Явные фильтры
могут менять условия; неизвестный возраст включается только при includeUnknown.
`/search` использует offerings, `/directory` сохраняет расширенный учебный каталог R1.
`/pmpk` не имеет upload/API: подготовленная цитата и подтверждённая категория добавляются
в needs/RouteGoal; отклонение ничего не записывает. Исправление маркируется user_correction.
`/contact/[id]` собирает редактируемый текст с опциональным возрастом/языком; только clipboard,
отправки нет. Медицинские сведения автоматически не включаются. Серверных API не добавлено.

## R1 — добавленные локальные контракты

Новые UI `/search`, `/search/[id]`, `/journey`, `/profile`, `/publish`, `/chats`, `/chats/[id]`.
Серверных API не добавлено. CareDetails содержит diagnosis/pmpk/prescriptions≤1000символов,
флаги имеющихся документов, отмеченные специалистами услуги и completedStages0–3.
`searchListings` — section/query/district/specialty/maxPrice/minRating/format/language/sort/nearby.
`canPublish` валидирует данные/учебный документ/согласие; draft скрыт. Published — только память
вкладки после отдельного действия имитации оплаты. Rating — среднее reviews, тариф не участвует.
`chats` — локальный словарь id→string[]; сообщения≤1000символов. Никаких отправок или ответов AI.
`downloadFamilyPdf` загружает локальный шрифт и создаёт Blob PDF в браузере; сведения не входят
в HTTP request, URL, серверные логи. Нет серверного endpoint экспорта чувствительных данных.

## F1 — фактический локальный контракт

Новые страницы `/[locale]/profile/child`, `/nannies`, `/nannies/[id]/book`, `/bookings`,
`/community`, `/community/[id]` — UI, а не HTTP API. Серверных mutations пока нет.
- `validProfile` и `recommendOfferings`: необязательные alias/age/city/language/needs, версия профиля.
- `searchNannies`: query/city/language/mode/budget/childAge, вывод учебных нянь.
- `prepareBooking`: ID/няня/формат/дата/время/часы/месяцы/часов в неделю; результат —
  локальная бронь с возрастом на момент записи, периодом, оценкой цены и reserved/cancelled.
  Проверяет дату/возраст/доступный формат/пересечения. Подробные типы — `features/nannies/service.ts`.
- `bookingReducer`: create/cancel/clear, повторный ID не дублируется.
- `forumReducer`: create/edit/delete/comment/deleteComment/report; собственные изменения по demo actor.
  Ввод — обычный текст; title≤120, body≤2000, comment≤1000. Жалоба только отмечает состояние.
- `searchPosts`: query (включая комментарии), topic, recent/discussion; RU/KK fixture-поиск.

Это не auth или серверная авторизация. Для real release нужны проверка пользователя на сервере,
RLS, атомарный контроль занятости и настоящая очередь модерации. Контракты далее — будущий план.


13.11.2026, **контракты предложены, endpoints ещё не реализованы**.
Основание: PDF стр. 12–14 и M01–M18. База `/api/v1`, JSON UTF-8.
Названия таблиц в DATABASE_SCHEMA, сценарии/этапы в DEVELOPMENT_PLAN.

Дополнение H1 (пока **не backend endpoints**, реализация в памяти вкладки): maternal stage/time
и общий план. Для S9.6 предлагаются GET `/activities?stage=pregnancy|newborn|parenting&duration=...&locale`,
GET/POST `/me/plan`, PATCH/DELETE `/me/plan/:id` с обычной owner/version проверкой.
POST body `{source_kind,title?,provider_id?,activity_id?}`, ровно один соответствующий target;
PATCH только title/is_done + expected_version; приватный plan no-store. Детские данные не нужны
для этих действий. Эти endpoints не следует описывать как уже работающие в H1.

## Общие правила

Success: `{"data": object|array|null, "meta": {"request_id":"uuid", ...}}`.
List meta: `page` integer≥1, `page_size` default20 max50, `total`, `has_more`.
Стабильная сортировка всегда заканчивается id. ISO timestamps UTC, date `YYYY-MM-DD`, UUID,
деньги — decimal strings (например `"8000.00"`), null — неизвестность. Не имитировать нулевой рейтинг.
POST create 201, read/update/идемпотентный PUT/DELETE 200 с data/result, долгий lifecycle 202.

Ошибка:
```json
{"error":{"code":"VALIDATION_ERROR","message":"Проверьте поля","fields":{"age_years":"Недопустимое значение"}},"meta":{"request_id":"uuid"}}
```

400 invalid input, 401 missing/invalid auth, 403 role/consent/blocked, 404 отсутствующий или чужой
private object, 409 version/duplicate/incompatible transition, 413 file too large, 415 unsupported file,
429 rate limit + Retry-After, 500 unexpected, 503 external temporarily unavailable.
Не выдавать SQL/stack/key/path/личные данные в error. Messages локализуются по code;
`fields` содержит только whitelist ключей, не копию исходного значения.

Cookie-based auth, проверенная Supabase session; `getSession()` без валидации не доказывает личность.
В каждом action/handler: валидация → auth → текущие role/status/consent → ownership → service.
RLS и column grants действуют даже при прямом запросе к Supabase. Cross-user private object — 404,
явно неподходящая роль — 403. Blocked/deleting пользователь не пишет и не читает приватные данные.
Для deleting разрешён только минимальный собственный lifecycle status после проверки сессии,
без выдачи удаляемой анкеты, документов и другого содержимого.
Parent права не выдаются provider-account автоматически, staff-account не становится parent ребёнка.

Cookie-mutations проверяют Origin/Host и CSRF-токен при необходимости транспорта;
state-changing GET запрещён. Server Actions используют штатную защиту Next, но повторяют auth/ownership.
Auth refresh/private ответы: `Cache-Control: private, no-store`; private UI noindex.
Не логировать body/query/cookies, медицинские строки и signed URLs; request_id+route-template+code достаточны.

Для изменяемых агрегатов `expected_version` обязателен; успешный ответ содержит новую `version`.
Повтор безопасных PUT/DELETE идемпотентен. Submit/decision/consent/delete/contact поддерживают
`Idempotency-Key` UUID: scope actor+operation, request hash; иной payload с тем же ключом → 409.
Срок хранения ключа ограничен настройкой (предложено 24 часа для mutations, 1 час contact),
после очистки DB constraints остаются последней защитой от повторных активных записей.
Механизм хранения ключей — небольшая таблица `idempotency_keys`
(scope,key_hash,request_hash,result_id,expires_at), операции принадлежат своим feature services;
не добавлять отдельный сервис. См. ADR-11 и DATABASE_SCHEMA.

## Auth и начальная учётная запись (M01)

Login/register/reset — формы с тонкими Server Actions, вызывающими официальный Supabase Auth SDK.
Это осознанное использование разрешённого стека, не дополнительный самописный auth API.

| Действие | Ввод | Результат / проверка |
|---|---|---|
| register email | email, password, account_type=parent/provider, provider_type?=specialist/center, locale, отдельные consent choices с policy_version | Supabase signup + confirmation mail; profiles безопасно создаёт только parent/provider. Browser не передаёт moderator/admin. До подтверждения нет private доступа |
| login email | email,password | Session cookie/refresh; без раскрытия, существует ли чужой email |
| logout | session | Закрытие сессии и очистка cookie |
| forgot-password | email,locale | Одинаковое внешнее сообщение «Если аккаунт существует…», rate limit |
| `/auth/callback` | Проверенный одноразовый code/token, whitelist next-path/locale | Обмен code/verifyOtp через SDK, redirect только внутри приложения |
| reset-password | new_password после валидированного recovery flow | Пароль меняется через Auth, старый/истёкший токен отклоняется |
| request/verify phone OTP | Нормализованный телефон/код, согласие | Только при настроенном SMS-провайдере; иначе feature disabled, без fake-кода |

Роль создаётся из разрешённого account_type защищённой функцией, произвольный metadata.role
игнорируется. Первого admin назначает контролируемая операционная процедура с аудитом.
Переключение ролей демо — вход разными аккаунтами, не mutation на повышения прав пользователя.

## Аккаунт, согласия, экспорт и удаление (M01,M17)

| Method / path | Ввод | Ответ / права |
|---|---|---|
| GET `/me` | — | active user: id,role,status,full_name,display_name,phone,locale,city_id,district_id,version,consent summary; без raw tokens |
| PATCH `/me` | expected_version, разрешённые full_name/display_name/phone/locale/city_id/district_id | Обновлённый профиль; role/status/email/auth fields запрещены. Изменение email/phone identity — отдельный подтверждаемый Auth flow |
| GET `/me/consents` | purpose? | Только своя история version/locale/action/time и актуальная политика |
| POST `/me/consents` | purpose,policy_version,locale,action=grant/revoke | Запись события; version должна существовать, action/время/actor проверяются. Revoke sensitive_child_data прекращает sensitive processing |
| GET `/policies` | purpose,locale | Текущая опубликованная политика с version/reviewed_at; без silent legal fallback |
| GET `/me/export` | format=json/csv | Fresh-auth owner; полный allowlisted экспорт своих данных. Content-Disposition attachment; CSV formula escaping. При размере больше безопасного response-limit — 202 data_request и private download, не обрезать молча |
| DELETE `/me` | confirmation=true, ожидаемая reauthentication | 202 `{request_id,status:"pending"}`; немедленно status=deleting, дальнейшее удаление идемпотентными шагами. Нельзя удалить чужой аккаунт ID в body |
| GET `/me/data-requests/:id` | UUID | Только owner до закрытия доступа; status/stage/failure_code и export download при готовности. После logout/deletion статус через подтверждённый recovery канал, не публичный UUID lookup |

После revoke разрешены управление согласиями, безопасный export и delete; private questionnaire
не выдаётся обычному dashboard. Точные тексты/retention и обработка опубликованных постов после
удаления согласуются Q02/Q06. `202` не означает «всё уже удалено».

## Ребёнок, dashboard и путь (M02,M03,M06)

| Method / path | Ввод | Ответ / права |
|---|---|---|
| GET `/children` | — | Parent + consent, свои профили; в первой версии один active |
| POST `/children` | Все поля необязательны: age_years?,diagnosis_text?,city_id?,district_id?,preferred_language?,preferred_format?,service_ids[],documents[] | 201 child aggregate; parent_id только из сессии, второй active →409 |
| GET `/children/:id` | — | Own parent aggregate с version; чужой→404 |
| PATCH `/children/:id` | expected_version + изменённые поля | Частичное обновление: отсутствующее поле не меняется, null явно очищает; массив заменяет набор транзакционно. parent_id/is_active из произвольного PATCH запрещены |
| DELETE `/children/:id` | confirmation=true | 200 `{deleted:true}` после CASCADE child joins/progress; собственные повторные запросы безопасны, чужие не раскрывают наличие |
| GET `/dashboard` | — | Parent, активный ребёнок по owner: profile_state, progress, next_step, recommended_providers[0…6], favorites summary, matching_version; тело не отправлять shared cache |
| GET `/checklist` | locale=ru/kk | Опубликованные общие шаги с источниками; guest допустим для справочника |
| POST `/checklist` | Step DTO | Admin-only alias для создания; editor использует `/admin/content/checklist-steps` с тем же service |
| GET `/children/:id/checklist` | locale | Только own; eligible steps с applicability/source/checked_at/done, progress и explainable rule codes |
| PUT `/children/:id/checklist/:stepId` | is_done bool | Parent+consent. Возвращает progress и done_at; step должен быть сейчас доступен или иметь сохранённый прогресс. Недоступный чужой child→404 |

Child payload example:
```json
{"expected_version":2,"age_years":12,"diagnosis_text":null,"preferred_language":"kk","service_ids":["uuid"],"documents":[{"document_type_id":"uuid","is_present":true}]}
```
`age_as_of` выставляется сервером при подтверждении нового возраста; старое значение не
«обновлять» при PATCH другого поля. Пропуск анкеты не требует фиктивного возраста/диагноза.

Step DTO: id,category,title,body,applicability,source:{title,url,checked_at},is_done,done_at,
reason_codes[]. `progress={done,total,percent}`; total0 ⇒ percent0 и явное empty state, не NaN.
Между пересчётами выполненные записи не удаляются; old hidden steps не включаются в текущий total.
Анкета/услуги/район обновляются атомарно; следующее чтение dashboard отражает новые правила.

Dashboard example (не фактический ответ существующего приложения):
```json
{"data":{"profile_state":"partial","progress":{"done":1,"total":4,"percent":25},"next_step":{"id":"uuid","title":"Уточнить перечень документов"},"recommended_providers":[],"matching_version":"rules-v1"},"meta":{"request_id":"uuid"}}
```
При отсутствии анкеты profile_state=missing и CTA onboarding; при отсутствии подходящих providers
пустой массив и понятное объяснение, а не случайные «рекомендации».

## Каталог и карта (M04,M05)

GET `/providers` — public только published/не blocked suppliers; filters:

| Param | Тип / смысл |
|---|---|
| q | string≤100, имя/название/услуга; экранировать SQL wildcard; не включать анкету ребёнка |
| type | specialist/center |
| city,district | UUID справочников, район должен относиться к городу |
| service,methodology | slug; если несколько значений, semantics ANY в рамках одного поля, AND между полями |
| language | ru/kk, только явно указанный язык |
| format | offline/online |
| price_min,price_max | decimal≥0, min≤max; пересечение диапазона **одной** matching услуги; неизвестную цену исключить при явном price filter |
| age | integer 0–21 (Q04); соответствие интервалу услуги, unknown excluded по умолчанию |
| include_unknown_age | bool defaultfalse; только добавляет явно помеченные unknown, не несовместимые |
| sort | district/name/nearby; defaultdistrict |
| page,page_size | 1/20 default, max50 |
| locale | ru/kk для контента, не влияет на права/географию/сроки |

Список и карта используют **один response/одни фильтры и загруженные страницы**, не разные
незаметные SQL-запросы. Map markers — только results с координатами; meta.unmapped_count
объясняет количество карточек без точки. «Показать ещё» добавляет ту же страницу в список и карту.
Не показывать впечатление, что первая страница — все найденные точки города; total/results loaded видны.

Точная геопозиция не попадает в query string. Дополнение POST `/providers/nearby`:
body `{filters:{...},point:{lat,lng},page:1,page_size:20}` → тот же DTO с `distance_m`,
private no-store; point используется в запросе, не хранится и не логируется. Для GET sort=nearby
без point применяется район/имя/id с meta.sort_applied=district и reason=LOCATION_NOT_PROVIDED.
Геолокация только добровольно, отказ не ломает каталог. Расстояние по прямой, не время поездки.

ProviderListItem:
```json
{"id":"uuid","type":"specialist","name":"Учебная карточка","is_demo":true,"services":[{"id":"uuid","name":"Учебная услуга","price_from":"8000.00","price_to":null,"currency":"KZT"}],"methodologies":[],"languages":["ru"],"formats":["offline"],"district":null,"address":null,"lat":null,"lng":null,"rating":null,"review_count":0,"verified":false,"availability":null,"distance_m":null,"updated_at":"2026-11-13T08:00:00Z"}
```

GET `/providers/:id` — расширенный public DTO: description,photo_url/placeholder,experience_years,
contacts,source, schedule, актуальная availability, reviews summary; нет owner_id, storage_path,
verification scans, child data, service keys. Unpublished→404, а owner смотрит через `/provider/me`.
Просроченные availability не кешировать как действующие; card должен использовать no-store
либо ограниченный срок до ближайшего expires_at с revalidation после mutations.

GET `/reference-data?locale&city` — активные публичные справочники для форм/фильтров,
без внутренних moderator fields. Это read-only агрегат, разрешённый PDF §7.

## Избранное и контакт (M07,M18)

| Method / path | Ввод | Ответ / права |
|---|---|---|
| GET `/favorites` | page/page_size/locale | Parent, только свои public card summaries. Hidden provider — минимальный `{id,available:false}`, без скрытого содержимого |
| POST `/favorites` | provider_id | Parent; idempotent add, 201 новый или200 существующий; только доступная карточка |
| DELETE `/favorites/:providerId` | — | Parent; idempotent remove |
| POST `/events/contact` | event_id UUID,provider_id,contact_type | Public/active user, rate limited; только доступная карточка и допустимый contact_type. 201/200 recorded; без утверждения записи/посещения |

Контакт не блокируется при ошибке аналитики. Нельзя отправить arbitrary event с diagnosis,
имя ребёнка, URL назначения или свободный metadata. События других типов создаются owning
серверным сервисом после реального успеха, а не клиентской кнопкой «успех».

## Кабинет поставщика (M09–M12)

Provider-owner route всегда определяет provider по сессии, не доверяет owner_id в body.
Публично опубликованная импортная карточка owner=NULL не присваивается по email/имени.

| Method / path | Ввод | Ответ / правила |
|---|---|---|
| GET `/provider/me` | — | Own полный разрешённый DTO, publication/verification, причины решения, version; без чужих child data |
| POST `/provider/me` | type,name,частичные публичные поля | Создать draft с owner из сессии; uniqueowner, повтор409 |
| PATCH `/provider/me` | expected_version,разрешённые публичные поля | Квалификационные изменения сбрасывают verified/supersede pending; цены/расписание не дают badge. owner/status/moderation запрещены |
| GET `/provider/me/services` | — | Свои services/methodologies/languages/ценовые интервалы |
| PUT `/provider/me/services` | expected_version,services[],methodology_ids[],languages[] | Атомарная замена, FK проверены, removed services не удаляют справочники |
| GET `/provider/me/schedule` | — | Недельные интервалы/timezone |
| PUT `/provider/me/schedule` | expected_version,schedule[{weekday,starts_at,ends_at,timezone}] | Весь набор одной транзакцией, time-range validation |
| GET `/provider/me/availability` | page/page_size | Свои активные/исторические/устаревшие, computed fresh/expired |
| POST `/provider/me/availability` | type=window,start_at,end_at **или** type=capacity,capacity integer | Owner, timestamp серверный; никаких броней |
| PATCH `/provider/me/availability/:id` | expected_version,соответствующие type-поля | Only own; явно обновляет updated_at окна |
| DELETE `/provider/me/availability/:id` | — | Only own, удалить окно/места |
| POST `/provider/me/submit` | expected_version,document_ids[] | Pending snapshot, idempotent, 409 без ready доков/при версии conflict; ответ request_id/status |
| GET `/provider/me/verification-requests` | page/page_size | История собственных решений с reason/version |

### Upload без проксирования 10 MiB через Vercel

PDF `POST /provider/me/documents` уточняется как **init metadata**, не multipart upload:

1. POST `/provider/me/documents`: `{filename,declared_mime,byte_size,doc_type}` → 201
   `{document_id,upload:{bucket,path,token_or_signed_url,expires_at},max_bytes:10485760}`.
   Сервер проверяет owner/size/тип, генерирует object key и upload_pending. Точное средство
   SDK upload определяется совместимой версией в S6; секреты service-role не возвращаются.
2. Browser → private Supabase Storage: bytes с JWT/ограниченным signed разрешением. Object
   доступен только owner/moderator; path соответствует конкретному pending документу; upsert=false.
3. POST `/provider/me/documents/:id/finalize`: `{}` → ready после проверки Storage metadata,
   размера и ограниченного чтения magic bytes. Заявленный MIME/extension сами по себе не доказательство.
   Несоответствие →415/413 + quarantine cleanup; не принимать документ в верификацию.
4. GET `/provider/me/documents` → metadata своих, без постоянных публичных URLs.
5. POST `/provider/me/documents/:id/download` → `{url,expires_at}`, TTL предложено60сек,
   owner/moderator only + audit. Admin вариант `/admin/verification-documents/:id/download`.
6. DELETE `/provider/me/documents/:id` →202 lifecycle remove; если в текущем snapshot,
   снять badge/supersede request атомарно до удаления object.

Проверка magic/metadata не является антивирусной гарантией. Документы не выполнять,
скачивать как attachment/nosniff, preview только ограниченным средством; отдельный scanner
не объявлять существующим. Фото/логотипы используют отдельный public-photo workflow после
проверки изображения и удаления EXIF, не переиспользуют private дипломы.

Основания: [Vercel body limit](https://vercel.com/docs/functions/limitations),
[Supabase upload](https://supabase.com/docs/guides/storage/uploads/standard-uploads),
[Storage RLS](https://supabase.com/docs/guides/storage/security/access-control).

## Отзывы/ответы/жалобы (M08)

| Method / path | Ввод | Ответ / права |
|---|---|---|
| GET `/providers/:id/reviews` | page/page_size | Public published reviews/replies, rating summary; names только alias, не полный profiles |
| POST `/providers/:id/reviews` | rating int1..5,body≤5000,self_confirmed_contact=true | Parent, pending, уникальный active review; не выдавать «подтверждено системой» |
| PATCH `/reviews/:id` | expected_version,rating?,body?,self_confirmed_contact? | Только author; изменённый published становится pending, рейтинг пересчитывается |
| DELETE `/reviews/:id` | — | Только author; публикация снимается, rating меняется; тело удаляется по policy |
| GET `/provider/me/reviews` | page/page_size | Reviews своей карточки и ответы, без медпрофиля автора |
| POST `/provider/me/reviews/:id/reply` | body≤5000 | Owner только своей карточки, published parent-review; чужой provider→403, повтор409 |
| PATCH `/provider/me/reviews/:id/reply` | expected_version,body | Только owner, повторная модерация если Q06 требует |
| DELETE `/provider/me/reviews/:id/reply` | — | Только owner |
| POST `/reviews/:id/report` | reason_code,reason_text?≤1000 | Auth user с допустимой ролью; тот же owning service что `/reports` |

## Сообщество (M13)

Предложение: читать/писать community может active parent, не гость/поставщик. Политика публикации Q06.

| Method / path | Ввод | Ответ / права |
|---|---|---|
| GET `/community/posts` | page/page_size | Published лента, только alias/title/body/time/comment_count; без child/profile joins |
| POST `/community/posts` | title≤200,body≤10000 | Parent own; published при постмодерации или pending при премодерации, вернуть настоящий status |
| GET `/community/posts/:id` | — | Parent; own скрытый через безопасный author DTO, чужой hidden→404 |
| PATCH `/community/posts/:id` | expected_version,title?,body? | Только author, hidden не перепубликовывается автоматически |
| DELETE `/community/posts/:id` | — | Только author; убрать текст/скрыть ответы согласно policy, без потери audit targets |
| GET `/community/posts/:id/comments` | page/page_size | Parent, только published под доступным post |
| POST `/community/posts/:id/comments` | body≤3000 | Parent, rate limit, без файлов и автоматической информации ребёнка |
| PATCH `/community/comments/:id` | expected_version,body | Только author |
| DELETE `/community/comments/:id` | — | Только author |
| POST `/reports` | target_type=review/post/comment,target_id,reason_code,reason_text? | Parent; provider может жаловаться на review своей карточки; сервер преобразует target в один typed FK, duplicateopen идемпотентен |

Пользовательский HTML не исполняется. Alias хранится отдельно от full_name/medical profile.
Комментарий под удалённым/скрытым post не раскрывается прямым запросом к таблице.

## Материалы/психологи (M14,M15)

| Method / path | Параметры | Ответ |
|---|---|---|
| GET `/resources` | locale,category?,duration=up_to_15/15_to_30/30_to_60/over_60,page,page_size | Public published title/description/duration_minutes/url/source{title,url,checked_at}/category; интервалы (0,15],(15,30],(30,60],(60,∞) |
| GET `/support-partners` | locale,language?,format?,page,page_size | Public published name/description/conditions/languages/formats/contacts/checked_at/is_demo; предупреждение, что сервис не экстренный |

Контент и контакты не создаются AI. Внешние ссылки открывать безопасно; администратор вручную
подтверждает источник/контакт, не обещается автоматическая проверка диплома психолога.

## Администрация и модерация (M16,M18)

Только moderator/admin; `/users` и `/metrics` — admin. Ни один маршрут не включает private child DTO.
Staff пишет role/status/publish/verification через строго разрешённые операции с audit в одной DB-транзакции.

| Method / path | Параметры / body | Результат |
|---|---|---|
| GET `/admin/moderation` | kind=verification/review/report/post/comment,status,page,page_size | Очередь разрешённых объектов, counts, version; без постоянных download URLs |
| POST `/admin/verification/:id/decision` | expected_version,expected_provider_qualification_version,decision=verified/rejected,reason | Проверить snapshot и ready files, применить status/badge, audit; stale→409; demo→verified запрещено |
| POST `/admin/reviews/:id/decision` | expected_version,decision=publish/reject/hide,reason | Атомарно moderation+видимый rating |
| POST `/admin/moderation/:type/:id/decision` | type=post/comment,expected_version,decision=publish/hide/delete,reason | Изменение статуса + audit; type whitelist |
| POST `/admin/reports/:id/decision` | expected_version,decision=resolved/dismissed,reason,target_action? | Жалоба закрывается вместе с разрешённым изменением target/audit |
| GET `/admin/users` | q (не медицинское),role?,status?,page,page_size | Admin минимальные аккаунтные поля; не диагноз/children |
| POST `/admin/users/:id/status` | status=active/blocked,reason,expected_version | Admin, audit, запрет блокировки последнего admin без операционной процедуры |
| POST `/admin/users/:id/role` | role=parent/provider/moderator/admin,reason,expected_version,reauth | Admin-only, service-side validation и audit; не роль из self-registration |
| GET `/admin/metrics` | from,to (≤90дней),granularity=day/week | Admin агрегаты registered/profile_completed/contact_clicks/verified_providers/published_reviews/completed_steps; без child/person details, small-cohort guard |
| GET `/admin/audit` | action?,from?,to?,page,page_size | Admin безопасный журнал, без медтекста/секретов |
| GET/PATCH `/admin/settings` | whitelist availability_ttl_days/matching_weights | Admin, version-check+audit; произвольные ключи запрещены |

### CRUD каталога и контента

Для каждой коллекции ниже GET list, POST create, PATCH `/:id` (expected_version),
DELETE `/:id` означает archive/is_active=false с FK-защитой; не каскадное удаление чужого контента.
Все list имеют page/page_size/status/q. Publish/hide — явный переход, не произвольный body.status.

| Prefix / collections | Кто | Поля / publish gate |
|---|---|---|
| `/admin/catalog/{cities,districts,languages,service-categories,services,methodologies,document-types}` | admin | Slug, name_ru/kk, FK, is_active; Q05 кто правит справочники |
| `/admin/catalog/providers` | moderator/admin | Public поля Provider DTO, is_demo,source_url,source_checked_at; owner отдельно; не присваивать badge direct PATCH |
| `/admin/content/{sources,checklist-steps,checklist-rules}` | moderator/admin | source/checked_at, ru/kk, whitelist condition_json, applicability; без источника публикация403/400 |
| `/admin/content/{resource-categories,resources,support-partners}` | moderator/admin | Resource/Partner DTO, approved contacts/URL, даты/переводы |

POST `/{collection}/:id/publish` / `.../hide` для providers/content, с reason/expected_version,
проверкой gate. Dictionaries activate/deactivate. Это конкретизация `*` путей из PDF, не отдельный CRUD engine.

POST `/admin/catalog/imports/preview`: `{kind:"providers",rows:[...≤200],source_label}` → row-level
validation/errors/proposed_counts, без записи. POST `/admin/catalog/imports`: те же строки + request_id
после исправлений → batch_id/counts; транзакционный upsert по source_key, повтор не создаёт дублей.
Не принимать произвольный SQL/файл медицинской анкеты; опасные CSV-формулы/URLs отклоняются.
GET `/admin/catalog/imports/:id` → admin summary/errors без лишних PII.

## Состояния, лимиты и проверки

- Любой экран: loading, empty, error с доступным retry, success. Не повторять POST автоматически
  без idempotency key. Validation рядом с полем и screen-reader summary.
- Limit proposal: Auth использует Supabase anti-abuse, posting/uploads/reports/contact — отдельные
  server limits в Postgres; значения утверждаются в S1/S2, 429 содержит Retry-After. Не глобальный Map.
- Query params публичного поиска не должны автоматически включать диагноз/текст анкеты.
  Private UUID в `/children/:id` — технический адрес ресурса, не публичная ссылка; серверные логи
  используют шаблон пути `/children/:id`, а не фактический id, токен или payload.
- Не делать серверные запросы к произвольным contact/resource URL для проверки без SSRF-защиты.
- Tests: request/response Zod, invalid fields/role/status, direct RLS ownership, version409,
  idempotency, upload size/magic/path, expiry/timezone, deleted targets, no sensitive cache/logs,
  search-map equality, duration boundaries, export completeness и lifecycle partial failures.

## Отклонения/уточнения к исходному минимальному API

Дополнены consent history/policies, reference-data, nearby POST, availability PATCH, document
init/finalize/download/delete, provider-review list/edit reply, comment edit/delete, report decision,
admin role/settings/audit/import и lifecycle status. Они закрывают требования M01–M18, для которых
краткая таблица PDF не задавала отдельного endpoint. Auth остаётся Supabase SDK/Server Actions.
`/resources` и `/support-partners` public; community требует parent — подтверждается Q06.

## T2 — профиль мамы

MotherProfile: name≤50, age (необязательный целый0–120), city, language, needs[], time,
audience mother/child, completed. `validMother` проверяет допустимые значения. Сохраняется
только в клиентском контексте, новых API нет. Имя родителя передаётся между первыми шагами;
детские и материнские ответы разделены. При выборе мамы сохраняются фильтр времени и
ссылки на психолога для родителей, сообщество или социального помощника по её отметкам.
