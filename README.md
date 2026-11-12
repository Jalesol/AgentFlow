# AgentFlow — Sistema Multiagente com Inteligência Artificial

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Gemini](https://img.shields.io/badge/Google-Gemini_AI-blue)
![Status](https://img.shields.io/badge/Status-Em_desenvolvimento-cyan)

O **AgentFlow** é uma aplicação web que utiliza múltiplos agentes de Inteligência Artificial para executar tarefas de forma sequencial e colaborativa.

O sistema divide uma tarefa entre três agentes especializados: Researcher, Analyst e Writer. Cada agente recebe os resultados da etapa anterior, contribuindo para a construção de um relatório final estruturado.

## Demonstração do funcionamento

**Fluxo de execução:**

1. **Researcher:** pesquisa e reúne informações sobre a tarefa.
2. **Analyst:** analisa as informações e identifica pontos relevantes.
3. **Writer:** organiza os resultados e produz o relatório final.

## Funcionalidades

- Arquitetura multiagente com três agentes especializados.
- Orquestração sequencial das tarefas.
- Integração com a API Google Gemini.
- Comunicação em tempo real utilizando Server-Sent Events (SSE).
- Indicadores visuais de progresso dos agentes.
- Interface web responsiva com tema escuro.
- Renderização de relatórios em Markdown.
- Cópia do relatório gerado.
- Exportação de relatórios em PDF.

## Tecnologias utilizadas

**Frontend**
- HTML5
- CSS3
- JavaScript

**Backend**
- Node.js
- Express
- Nodemon

**Inteligência Artificial**
- Google Gemini API
- @google/genai

## Arquitetura do projeto

```text
AgentFlow/
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   └── index.html
├── src/
│   ├── agents/
│   │   ├── researcher.js
│   │   ├── analyst.js
│   │   └── writer.js
│   ├── services/
│   │   ├── gemini.js
│   │   └── orchestrator.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── package-lock.json
```

## Como executar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/SEU_USUARIO/AgentFlow.git
```

### 2. Entre na pasta

```bash
cd AgentFlow
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure as variáveis de ambiente

Crie seu arquivo `.env` com base no `.env.example`:

```env
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-3.5-flash-lite
PORT=3000
```

Obtenha sua chave de API no Google AI Studio:

https://aistudio.google.com/

### 5. Inicie a aplicação

```bash
npm run dev
```

Acesse:

http://localhost:3000

## API

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/health` | Verifica o funcionamento do servidor |
| GET | `/api/execute?task=...` | Executa o workflow multiagente via SSE |

## Objetivo do projeto

O AgentFlow foi desenvolvido como projeto de portfólio para explorar conceitos de Inteligência Artificial aplicada, integração de APIs, desenvolvimento backend, arquitetura modular e comunicação em tempo real.

## Desenvolvedor

**Lucas Jales de Oliveira**

Desenvolvedor em formação, estudante de Sistemas de Informação e interessado em desenvolvimento de software e Inteligência Artificial.

GitHub: [Jalesol](https://github.com/Jalesol)
