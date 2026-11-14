# Сторонние компоненты «Бірге»

Инвентаризация фактического package-lock.json на14.11.2026. На H1 новых библиотек не было; дополнение R1 перечислено ниже.
Это список метаданных лицензий, не юридическое заключение и не замена текстов LICENSE/NOTICE.
При передаче/распространении сохранить применимые оригинальные license/notice из пакетов.

| Прямая зависимость | Версия | Лицензия из метаданных | Назначение |
|---|---|---|---|
| drizzle-orm | 0.45.4 | Apache-2.0 | Runtime |
| next | 16.4.6 | MIT | Runtime |
| pg | 8.23.1 | MIT | Runtime |
| react | 19.3.1 | MIT | Runtime |
| react-dom | 19.3.1 | MIT | Runtime |
| server-only | 0.0.1 | MIT | Runtime |
| zod | 4.6.7 | MIT | Runtime |
| @playwright/test | 1.65.0 | Apache-2.0 | Development/test |
| @types/node | 24.19.2 | MIT | Development/test |
| @types/pg | 8.23.1 | MIT | Development/test |
| @types/react | 19.3.0 | MIT | Development/test |
| @types/react-dom | 19.3.0 | MIT | Development/test |
| drizzle-kit | 0.31.11 | MIT | Development/test |
| eslint | 9.39.5 | MIT | Development/test |
| eslint-config-next | 16.4.6 | MIT | Development/test |
| typescript | 5.9.3 | Apache-2.0 | Development/test |
| vitest | 5.1.0 | MIT | Development/test |

Полная инвентаризация прямых/транзитивных записей lockfile: [third-party-packages.json](third-party-packages.json).
Optional платформенные пакеты перечислены по lockfile, даже если не установлены на Windows.
Сгенерировано чтением package metadata; лицензионные условия и совместимость перед передачей проверяет команда.

AI disclosure: при разработке и документации использован Codex. Тексты/код проверяются человеком;
учебный разбор документа — заранее подготовленный fixture, не работающий медицинский AI.
В H1 нет фотографий, сторонних иллюстраций/шрифтов/медиа. Иконки/оформление реализованы кодом и текстовыми символами.
В B1 добавлены оригинальные векторные знак и иллюстрации в src/ui/brand-art.tsx и icon.svg;
внешние изображения, шрифты и новые зависимости не добавлялись. Список лицензий остаётся прежним.

## R1 — локальный PDF

Добавлены pdf-lib1.17.1 (MIT), @pdf-lib/fontkit1.1.1 (MIT) для экспорта кириллицы в браузере.
NotoSans-Regular.ttf из notofonts/noto-fonts, SIL Open Font License1.1; полный текст лицензии
сохранён в public/fonts/OFL.txt. Шрифт загружается с того же сайта, не с внешнего CDN.
Источники: https://pdf-lib.js.org/ и https://github.com/notofonts/noto-fonts.
