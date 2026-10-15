# Публикация STOQ

Приложение доступно по https://lyaguh.site на VPS 136.234.74.121 (Ubuntu 24.04).

Frontend и основной backend работают на одном сервере. Nginx раздаёт `/var/www/stoq/current`, отправляет `/api/` в `127.0.0.1:3000` с удалением префикса и проксирует `/socket.io/` в тот же gateway. Локальный туннель gateway больше не требуется.

GitHub Actions после push в main выполняет `npm ci`, TypeScript, все тесты и production build, передаёт архив пользователю `stoq-deploy` и атомарно переключает `current`. Pull request запускает проверки без деплоя. GitHub Secrets: `DEPLOY_SSH_KEY`, `FRONTEND_ENV`; Variables: `DEPLOY_HOST`, `DEPLOY_USER`. Ключ сервера закреплён в `deploy/known_hosts`.

Production env:

```dotenv
VITE_API_URL=/api
VITE_WEBSOCKET_API_URL=/
```

Локальный `.env` разработки сохранён. Изменение production env выполняется через GitHub Secrets; пароли и токены нельзя помещать в VITE_*.

HTTPS использует Let's Encrypt с автоматическим продлением через `certbot.timer`. HTTP домена перенаправляется на HTTPS; HTTP по IP сохранён для диагностики CI. Сертификат и существующая TLS-конфигурация сохраняются при настройке Nginx.

Backend: `/opt/stoq-backend/current`, шесть systemd-сервисов, PostgreSQL, Redis, RabbitMQ. У backend-репозитория собственный CI/CD, резервные копии перед миграциями и проверка RPC после переключения. Подробности: `stoq-backend/deploy/README.md`.

AI worker работает на компьютере владельца через существующий локальный прокси и подключается к серверному RabbitMQ по отдельному SSH-туннелю. Для распознавания УПД компьютер должен оставаться включённым; остальные функции работают на VPS. Механизм CommandBusService и RPC сохранён.

Проверки:

```powershell
curl.exe https://lyaguh.site/healthz
curl.exe https://lyaguh.site/deploy-version.txt
curl.exe https://lyaguh.site/backend-version.txt
```

Защищённые `/api/*` требуют входа; HTTP 401 без cookies ожидаем. Для полной проверки API используется backend smoke script с временным тестовым аккаунтом. Socket.IO также проверяется с действующей сессией.

На VPS:

```bash
nginx -t
systemctl status nginx certbot.timer
systemctl list-units 'stoq-backend@*'
redis-cli ping
rabbitmq-diagnostics -q ping
df -h /
```

Старые frontend-релизы остаются в `/var/www/stoq/releases`, assets сохраняются для открытых вкладок. Старые backend-релизы и резервные копии автоматически не удаляются. Следите за свободным местом. Скрипты установки прежнего туннеля gateway сохранены для истории, но в текущем деплое не используются.
