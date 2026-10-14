# Публикация STOQ

На VPS Selectel размещён только frontend. Запросы идут по схеме: браузер → Nginx → 127.0.0.1:13000 на VPS → исходящий SSH-туннель → локальный gateway:3000. RabbitMQ и связь микросервисов сохраняются. Посетителям VPN не нужен.

## Сервер и CI/CD

| Параметр | Значение |
| --- | --- |
| Публичный IPv4 | 136.234.74.121 |
| SSH администратора | root@136.234.74.121, порт 22, вход ключом |
| ОС | Ubuntu 24.04 LTS |
| Домен | lyaguh.site |
| Временный адрес | http://136.234.74.121 |
| Репозиторий | https://github.com/MissClickRND/stoq-frontend |
| Активная сборка | /var/www/stoq/current |
| Nginx | /etc/nginx/sites-available/stoq |
| Скрипты настройки | /opt/stoq-frontend-deploy |
| Пользователи SSH | stoq-deploy для CI; stoq-tunnel для API |

Push в main запускает GitHub Actions: npm ci, TypeScript, сборка, передача архива по SSH, атомарная замена current, проверка опубликованного commit SHA. Тесты в CI не запускаются. Pull request проверяет TypeScript и сборку без деплоя.

GitHub Secrets: DEPLOY_SSH_KEY и FRONTEND_ENV. GitHub Variables: DEPLOY_HOST и DEPLOY_USER. Новый ключ CI имеет доступ только к stoq-deploy, без sudo. Пароль администратора в CI не хранится. Ключ сервера закреплён в known_hosts.

FRONTEND_ENV содержит:

```dotenv
VITE_API_URL=/api
VITE_WEBSOCKET_API_URL=/
```

Относительные адреса работают по IP и после включения HTTPS. Nginx убирает префикс /api перед отправкой в gateway. Socket.IO использует /socket.io/ и существующий namespace /recommendations. VITE_* видны в браузерном JavaScript; пароли и токены сюда добавлять нельзя. Локальный .env для разработки сохранён.

## Домен на Beget и HTTPS

В DNS-зоне lyaguh.site на Beget замените A-запись корня:

| Тип | Имя | Значение |
| --- | --- | --- |
| A | @ (или пустое имя корня) | 136.234.74.121 |

Старый IP 45.153.191.83 замените, не оставляйте второй A-записью. Если у корня есть AAAA старого хостинга, удалите её: публичный IPv6 этого VPS не настроен. MX/TXT для почты не меняйте. NS оставьте на Beget. www пока не настроен; используйте lyaguh.site.

В сетевом экране Selectel должны быть доступны входящие TCP 22, 80 и 443. Порт 13000 наружу открывать не нужно.

После обновления DNS выполните с компьютера администратора:

```powershell
ssh root@136.234.74.121 "bash /opt/stoq-frontend-deploy/enable-https.sh"
```

Скрипт проверит DNS, выпустит сертификат Let's Encrypt, настроит Nginx и автоматическое продление. До смены DNS выпуск сертификата не сработает. После этого основной адрес — https://lyaguh.site. Пересобирать frontend для смены протокола не нужно. HTTP по IP сохранён для диагностики и проверки CI.

## Владельцу локального бэкенда: Windows

Компьютер должен оставаться включённым. Gateway, RabbitMQ, базы и нужные сервисы запускаются владельцем бэкенда обычным способом. На VPS бэкенд не копируется.

1. Установите Windows OpenSSH Client, если команды ssh и ssh-keygen отсутствуют. Скачайте frontend-репозиторий или папку deploy. Node.js для туннеля не нужен.
2. На компьютере с бэкендом проверьте gateway: curl.exe http://127.0.0.1:3000/product/units. Ошибка 500 означает ошибку обработки запроса; connection refused — gateway не слушает этот адрес.
3. Из корня frontend выполните:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\deploy\install-backend-tunnel.ps1 -BackendHost 127.0.0.1 -BackendPort 3000
```

Скрипт создаст ключ на этом компьютере, ограничит доступ к нему и добавит скрытый запуск туннеля при входе текущего пользователя в Windows. Приватный ключ остаётся в %LOCALAPPDATA%\STOQ\tunnel\id_ed25519. Передайте администратору сайта только напечатанную строку публичного ключа ssh-ed25519.

4. Администратор добавляет этот ключ на VPS отдельной строкой в /home/stoq-tunnel/.ssh/authorized_keys, с ограничениями перед полным публичным ключом:

```text
restrict,port-forwarding,permitlisten="127.0.0.1:13000" ssh-ed25519 ПУБЛИЧНЫЙ_КЛЮЧ_С_КОМПЬЮТЕРА_БЭКЕНДА комментарий
```

Владелец файла: stoq-tunnel:stoq-tunnel; права: 600. Приватный ключ бэкенда в GitHub не нужен.

5. Одновременно порт 13000 занимает только один туннель. Перед запуском на новом компьютере остановите предыдущий: на текущем компьютере-посреднике выполните:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\deploy\stop-backend-tunnel.ps1 -DisableAutostart
```

6. На компьютере бэкенда повторите установку с запуском:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\deploy\install-backend-tunnel.ps1 -BackendHost 127.0.0.1 -BackendPort 3000 -Start
```

Ключ повторно не генерируется. При обрыве SSH переподключается автоматически. После перезагрузки нужен вход этого пользователя в Windows. Режим сна отключает доступность API.

Сейчас туннель работает на компьютере Lyaguh и направлен к адресу исходного env: 26.130.106.197:3000. Пока используется этот посредник, ему нужен доступ к сети бэкенда. После переноса туннеля на компьютер самого бэкенда используйте 127.0.0.1 — тогда доступ к Radmin VPN для туннеля не потребуется.

Файлы установки и журналы находятся в %LOCALAPPDATA%\STOQ\tunnel. После изменения адреса остановите туннель скриптом stop-backend-tunnel.ps1 и повторите установку с новым BackendHost и флагом -Start.

## Если бэкенд на Linux

Создайте отдельный ключ ssh-keygen -t ed25519 -f ~/.ssh/stoq_tunnel. Администратор устанавливает его публичную часть как в Windows-инструкции. Добавьте проверенную строку deploy/known_hosts в ~/.ssh/known_hosts. На компьютере бэкенда запустите:

```bash
ssh -NT -i ~/.ssh/stoq_tunnel -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o ExitOnForwardFailure=yes -o ServerAliveInterval=20 -o ServerAliveCountMax=3 -R 127.0.0.1:13000:127.0.0.1:3000 stoq-tunnel@136.234.74.121
```

Для постоянной работы оформите эту команду как systemd-сервис с Restart=always. Приватный ключ не пересылайте.

## Проверка и диагностика

```powershell
curl.exe http://136.234.74.121/healthz
curl.exe http://136.234.74.121/api/product/units
curl.exe "http://136.234.74.121/socket.io/?EIO=4&transport=polling"
Get-Content "$env:LOCALAPPDATA\STOQ\tunnel\tunnel.log" -Tail 30
```

healthz проверяет Nginx. Список единиц проверяет запрос до локального API. Socket.IO должен вернуть строку, начинающуюся с 0 и JSON параметров соединения. После включения TLS те же проверки доступны через https://lyaguh.site.

502 у /api означает отсутствие туннеля, недоступность gateway или неверный BackendHost. HTTP 500 с JSON gateway означает, что запрос дошёл до бэкенда, но обработка завершилась ошибкой: владелец проверяет логи gateway и соответствующего сервиса. Подключение Socket.IO само по себе не подтверждает работу RPC рекомендаций.

Во время настройки /product/units и Socket.IO отвечали; /dishes возвращал 500 также напрямую. Для полного функционирования приложения владелец должен обеспечить работу соответствующих локальных сервисов.

На VPS:

```bash
nginx -t
systemctl status nginx
ss -lntp | grep 13000
tail -n 50 /var/log/nginx/error.log
readlink /var/www/stoq/current
```

Сборки сохраняются в /var/www/stoq/releases. Откат выполняет stoq-deploy: переключите current на выбранную существующую сборку через временную ссылку и mv -Tf. Общие assets сохранены для открытых вкладок. Старые релизы автоматически не удаляются; следите за диском. Повторный запуск setup-server.sh заменяет Nginx исходной HTTP-конфигурацией, поэтому после выпуска сертификата обновляйте frontend через CI/CD.
