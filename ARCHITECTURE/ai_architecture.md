# SecretTalk — AI Architecture Standard

## 1. Назначение

Этот документ определяет архитектурные правила AI-системы SecretTalk.

## 2. AI-персонаж

Каждый AI-персонаж является самостоятельным модулем.

Для AiDa:

`modules/aida/`

Авторитетные компоненты:

`aida.js`

`aida.system.md`

`aida.memory.js`

## 3. Character

Характер персонажа принадлежит его модулю.

Для AiDa:

`modules/aida/aida.system.md`

Старые character и prompt-файлы не должны автоматически становиться источником личности AiDa.

## 4. Memory

Долговременная память персонажа принадлежит его модулю.

Для AiDa:

`modules/aida/aida.memory.js`

Другие memory-системы не должны параллельно управлять той же памятью без архитектурного решения.

## 5. AI Transport

Общая AI-транспортная инфраструктура может находиться вне AI-модуля.

Например:

`ai/openrouter.client.js`

Она отвечает за связь с AI-провайдером.

Она не должна содержать личность конкретного персонажа.

## 6. AI Flow

Стандартный пользовательский путь:

`USER → ROUTER → AI MODULE → AI SERVICE → PROVIDER → RESPONSE`

AI-модуль отвечает за собственную логику.

Router отвечает за маршрут.

Общий AI service отвечает за инфраструктуру, если он утверждён архитектурой.

## 7. Legacy AI

Существующая старая AI-инфраструктура классифицируется перед удалением.

Она может быть:

`ACTIVE`

`LEGACY`

`REFERENCE`

`UNUSED`

`OBSOLETE`

Нельзя автоматически подключать старую AI-инфраструктуру к новой реализации.

## 8. Migration

При переходе на новую AI-архитектуру:

`NEW AI MODULE`

→ `INDEPENDENT VERIFY`

→ `ROUTER INTEGRATION`

→ `DIALOG TEST`

→ `REMOVE OLD AI FLOW`

→ `VERIFY`

→ `COMMIT`

→ `DEPLOY`

→ `PRODUCTION TEST`

## 9. Context

AI-контекст должен иметь определённого владельца.

Нельзя одновременно использовать несколько независимых ContextBuilder-систем без архитектурного решения.

## 10. Prompt

Системная идентичность должна иметь один авторитетный источник.

Для AiDa:

`aida.system.md`

PromptBuilder не должен незаметно переопределять характер персонажа.

## 11. AI Module Boundary

AI-модуль не должен содержать:

- Telegram Router;
- глобальную навигацию;
- Admin business logic;
- Menu business logic.

Он принимает предусмотренный public entrypoint и возвращает результат.

## 12. Главное правило

AI-персонаж — это модуль.

AI transport — инфраструктура.

Router — маршрутизация.

Memory — память.

Character definition — идентичность.

Эти ответственности не должны смешиваться.
