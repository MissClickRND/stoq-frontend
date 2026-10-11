# STOQ

React, TypeScript, Vite, Mantine, Redux Toolkit и React Router.

Запуск: `npm install`, затем `npm run dev`.

Архитектура и подключение бэкенда описаны в [ARCHITECTURE.md](./ARCHITECTURE.md).

- `npm run build` — проверка типов и production-сборка.
- `npm test` — доменные расчёты, экспорт, границы FSD и отсутствие локального сохранения моков.
- `npm run test:architecture` — архитектурные ограничения и заглушки запросов.

Данные читаются из `entities/*/model/mock.ts` через публичные API сущностей. Серверные действия пока являются заглушками с `//!`; поиск, навигация, ввод черновиков, корзина, QR и локальный экспорт XLSX работают в интерфейсе.
