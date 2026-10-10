# Frontend Lyaguh Template

Шаблон моих проектов для быстрого создания

Установленные библиотеки :
- React + TS
- RTK
- MantineUI
- ReactRouter
- TablerIcons (Первая загрузка может быть долгим из-за этой библиотеки, если вы сталкиваетесь с проблемой производительности можете попробовать заменить ее на похожие, по типу ReactIcons)

Создана архитектура FSD, настроен роутинг

Архитектура:

Классический FSD:
```text
Lyaguh-Template
├─ index.html
├─ package-lock.json
├─ package.json
├─ postcss.config.cjs
├─ public
│  ├─ favicon.svg
│  ├─ icons
│  └─ img
├─ README.md
├─ src
│  ├─ app
│  │  ├─ main.tsx
│  │  ├─ providers
│  │  │  ├─ store
│  │  │  │  ├─ listeners
│  │  │  │  ├─ listenersMiddleware.ts
│  │  │  │  ├─ loadStates
│  │  │  │  │  └─ loadSettingsState.ts
│  │  │  │  └─ store.ts
│  │  │  └─ styles
│  │  │     └─ index.css
│  │  ├─ theme.ts
│  │  └─ vite-env.d.ts
│  ├─ pages
│  │  ├─ Errors
│  │  │  └─ Error404
│  │  │     ├─ Error404.page.tsx
│  │  │     └─ index.ts
│  │  └─ Main
│  │     ├─ index.ts
│  │     └─ Main.page.tsx
│  ├─ shared
│  │  └─ lib
│  │     ├─ index.ts
│  │     └─ store.ts
│  └─ widgets
│     └─ Read.txt
├─ tsconfig.json
├─ tsconfig.node.json
├─ vite.config.ts


```

