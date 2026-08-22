# SecretTalk — API Standard

## 1. Назначение

Этот документ определяет правила взаимодействия SecretTalk с внешними API и внутренними сервисными интерфейсами.

## 2. API ownership

Каждый внешний API должен иметь одного определённого владельца интеграции.

Модули не должны напрямую реализовывать один и тот же внешний API разными способами.

## 3. External API

Внешние API должны подключаться через соответствующий service/client layer.

Пример:

`AI MODULE → OPENROUTER CLIENT → OPENROUTER`

Модуль не должен дублировать HTTP/API transport logic, если существует общий client.

## 4. Public module API

Каждый модуль должен иметь понятный public interface.

Другие части приложения используют public interface, а не внутренние файлы модуля.

Пример:

`module.handle(bot, msg)`

## 5. Input

Все данные, полученные из внешнего API или пользовательского ввода, считаются недоверенными.

Перед использованием необходимо проверить:

- наличие;
- тип;
- формат;
- допустимые значения;
- ошибки API.

## 6. Output

Ответ внешнего API не должен автоматически считаться корректным.

Перед передачей результата дальше необходимо проверить необходимую структуру ответа.

## 7. Errors

API errors должны обрабатываться явно.

Необходимо различать:

- authentication error;
- authorization error;
- validation error;
- rate limit;
- timeout;
- unavailable service;
- malformed response.

## 8. Secrets

API credentials должны храниться в environment configuration.

Запрещено:

- hardcode API keys;
- commit credentials;
- выводить credentials в logs;
- сохранять credentials в документации.

## 9. Retry

Повторный запрос допускается только для ошибок, которые действительно могут быть временными.

Нельзя создавать бесконечные retry loops.

## 10. Migration

При замене API client:

`NEW CLIENT`

→ `VERIFY`

→ `INTEGRATE`

→ `REMOVE OLD CLIENT`

→ `SEARCH OLD REFERENCES`

→ `VERIFY`

→ `COMMIT`

## 11. Главное правило

Внешний API — инфраструктура.

Бизнес-логика — внутри соответствующего модуля.

Public API модуля — единственная нормальная точка взаимодействия с его внутренней логикой.
