# Assistente Inteligente para Apoio ao Cuidado Domiciliar de Idosos

Protótipo de sistema desenvolvido como parte do Trabalho de Conclusão de Curso em Engenharia de Software da Universidade Federal do Ceará (UFC) - Campus Russas.

## Objetivo

Desenvolver um sistema para apoiar cuidadores informais de idosos na organização da rotina de cuidados domiciliares.

O sistema prevê funcionalidades para:

- cadastro de idosos;
- cadastro e controle de medicamentos;
- geração de lembretes;
- registro de ocorrências;
- consulta de informações por meio de linguagem natural utilizando inteligência artificial.

O módulo de inteligência artificial será utilizado como apoio à consulta das informações cadastradas no sistema, não tendo como objetivo substituir profissionais de saúde ou realizar diagnósticos.

## Tecnologias

### Frontend
- React.js
- Vite
- JavaScript
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Banco de dados
- SQLite

### Inteligência Artificial
- API da OpenAI

## Estrutura do projeto

```text
assistente-idoso/
├── backend/
│   ├── src/
│   │   └── server.js
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md