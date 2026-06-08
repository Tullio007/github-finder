# GitHub Finder

Single Page Application que busca e exibe o perfil e os repositórios de um
desenvolvedor usando a API pública do GitHub.

## Arquitetura

Separação de responsabilidades em três camadas, sem build step:

| Arquivo        | Responsabilidade                                                        |
| -------------- | ----------------------------------------------------------------------- |
| `index.html`   | Estrutura semântica + utilitários de **layout** do Tailwind (via CDN).  |
| `styles.css`   | **Design system**: tokens da paleta (variáveis CSS) e classes de componente. |
| `app.js`       | **Comportamento**: validação, requisições (Fetch) e renderização do DOM. |

### Design system

- **Paleta monocromática** (`#000000` → `#BDBDBD`) definida uma única vez como
  variáveis CSS em `:root` (`styles.css`). O `tailwind.config` no `index.html`
  aponta para essas mesmas variáveis, garantindo uma única fonte da verdade e
  impedindo o uso de qualquer cor fora da escala de cinza.
- Classes de componente nomeadas no padrão BEM (`.profile`, `.repo-card`,
  `.btn--primary`, …).

### Comportamento (`app.js`)

- Encapsulado em IIFE (`"use strict"`) para não poluir o escopo global.
- Organizado em seções: Config → DOM → Helpers → API → Render → Controlador.
- Requisições à API do GitHub:
  - `GET /users/{usuario}` — perfil (avatar + nome).
  - `GET /users/{usuario}/repos` — repositórios (6 mais recentes, via `forEach`).
- Tratamento de erros: campo vazio, usuário inexistente (404), falha de rede e
  usuário sem repositórios públicos.
- Cards de repositório criados via DOM API + `textContent`, evitando injeção de
  HTML a partir de dados controlados pelo usuário.

## Como executar

Por ser estático, basta abrir o `index.html` no navegador (ou servir a pasta
com qualquer servidor estático, ex.: `npx serve`).
