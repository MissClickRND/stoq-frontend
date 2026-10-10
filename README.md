# STOQ

React, TypeScript, Vite, Mantine, Redux Toolkit и React Router.

Запуск: `npm ci`, затем `npm run dev`.
Проверка типов: `npm run typecheck`. Сборка: `npm run build`.

Пустые страницы: /login, /dashboard, /supply, /dishes, /products, /menu-hints, /orders, /logs, /admin-panel.
Корневой адрес перенаправляет на /dashboard. Неизвестные адреса показывают 404.

Страницы: src/pages. Маршруты: src/app/providers/routes/Router.tsx. Тема: src/app/theme.ts.
Палитры primary (салатовая) и secondary (бирюзовая) содержат по 10 оттенков.
Авторизация пока не подключена к приложению; API, хранилище и guards сохранены для дальнейшей разработки.
