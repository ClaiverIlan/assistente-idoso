# Assistente Inteligente para Apoio ao Cuidado Domiciliar de Idosos

Protótipo de aplicação web desenvolvido como parte do Trabalho de Conclusão de Curso (TCC) em Engenharia de Software da Universidade Federal do Ceará (UFC) — Campus Russas.

## Objetivo

Apoiar cuidadores informais na organização de informações e tarefas relacionadas ao cuidado domiciliar de pessoas idosas, reunindo cadastros, programação de medicamentos, lembretes e registros de ocorrências em uma única interface.

O sistema é um **protótipo acadêmico**. Ele não substitui a orientação de profissionais de saúde, não realiza diagnósticos e não deve ser utilizado como ferramenta clínica sem validação, controles de segurança e avaliações adicionais.

## Funcionalidades implementadas

- Cadastro e gerenciamento de cuidadores em um fluxo simplificado de acesso para demonstração.
- Cadastro, consulta, edição e exclusão de idosos.
- Cadastro, edição e exclusão de medicamentos associados aos idosos.
- Programação semanal de medicamentos, com dias e múltiplos horários.
- Geração automática de lembretes no início do backend e verificações periódicas a cada minuto.
- Exibição dos lembretes de hoje e dos próximos dias, em ordem cronológica.
- Indicação visual da situação dos lembretes, incluindo aguardando horário, pendente e administrado.
- Confirmação e desfazimento de administrações de medicamentos.
- Consulta ao histórico de lembretes e ações de administração, com recorte de até 90 dias.
- Cadastro, edição e exclusão de ocorrências relacionadas aos idosos.
- Assistente de consulta em linguagem natural integrado à API Gemini, sujeito à configuração de credenciais e à disponibilidade do serviço.
- Interface responsiva para computadores, tablets e celulares.

## Tecnologias utilizadas

| Camada | Tecnologias |
| --- | --- |
| Frontend | React, Vite, JavaScript e Tailwind CSS |
| Backend | Node.js e Express |
| Banco de dados | SQLite, por meio de `node:sqlite` |
| Inteligência artificial | API Gemini |
| Versionamento | Git e GitHub |

## Estrutura do projeto

```text
assistente-idoso/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── jobs/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.js
│   ├── package.json
│   └── package-lock.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

## Como executar localmente

**Pré-requisitos:** Node.js e npm instalados, além de um banco SQLite inicializado com as tabelas utilizadas pelo backend. O arquivo de banco e as credenciais locais não devem ser publicados no repositório.

**1. Obter o projeto:**

```bash
git clone https://github.com/ClaiverIlan/assistente-idoso.git
cd assistente-idoso
git checkout refatoracao-backend
```

**2. Instalar as dependências do backend:**

```bash
cd backend
npm install
```

Se for utilizar o assistente de IA, configure o arquivo `backend/.env` com a credencial esperada pela integração Gemini implementada no código. **Não envie chaves de API para o GitHub.**

**3. Iniciar o backend:**

```bash
npm start
```

O servidor utiliza, no ambiente de desenvolvimento atual, o endereço `http://localhost:3000`. Ao iniciar, ele conecta ao SQLite e executa a primeira verificação do agendador de lembretes.

**4. Em outro terminal, iniciar o frontend:**

```bash
cd frontend
npm install
npm run dev
```

O endereço local padrão do Vite é `http://localhost:5173` (a porta pode mudar se estiver ocupada). Mantenha os dois processos em execução durante os testes.

**Acesso em dispositivos da mesma rede:** para disponibilizar o frontend na rede local durante uma demonstração, execute `npm run dev -- --host 0.0.0.0` na pasta `frontend`. O dispositivo precisa alcançar o endereço IP do computador e a porta do backend; regras de firewall podem interferir. Esse modo não equivale a uma publicação segura na internet.

## Verificações de qualidade

No diretório `frontend`, execute:

```bash
npm run lint
npm run build
```

O primeiro comando executa o ESLint; o segundo gera uma compilação de distribuição na pasta `frontend/dist`.

### Testes manuais realizados

Nas validações do protótipo realizadas até **06/11/2026**, foram verificados:

- Inicialização do servidor, conexão SQLite e execução repetida do agendador.
- Consulta ao banco sem registros duplicados para a combinação medicamento, data e horário, inclusive após reiniciar o backend.
- Alteração de um horário na programação semanal e atualização correspondente nos lembretes apresentados e armazenados.
- Ordenação cronológica dos lembretes futuros na interface.
- Permanência das quantidades de ações de administração e desfazimento no histórico durante verificações periódicas do agendador.
- Execução de `npm run lint` e `npm run build` sem erros.

Esses testes são evidências dos **cenários verificados**, não uma garantia de ausência de falhas em todas as situações. A lógica da mudança de dia foi revisada no código, mas ainda não foi submetida a um teste automatizado com relógio simulado.

## Limitações e trabalhos futuros

- Adicionar uma opção de ativação, desativação e reativação de medicamentos na interface, preservando as administrações anteriores.
- Tratar ou migrar automaticamente medicamentos cadastrados antes do formato atual de programação semanal.
- Implementar notificações externas, como notificações push, em vez de depender apenas da consulta à interface.
- Fortalecer autenticação, autorização, proteção de dados e demais requisitos de segurança antes de qualquer uso real.
- Ampliar os testes automatizados, especialmente para virada de dia, alterações de agenda, concorrência e integridade dos dados.
- Evoluir a implantação, o monitoramento e a documentação técnica da API.

## Uso responsável

Utilize somente **dados fictícios** nas demonstrações e avaliações atuais. A confirmação de uma dose no protótipo é um registro efetuado pelo cuidador, não uma verificação clínica de que o medicamento foi efetivamente administrado. As respostas geradas por inteligência artificial devem ser tratadas como apoio informativo, e não como recomendações médicas.

## Repositório

[GitHub — ClaiverIlan/assistente-idoso](https://github.com/ClaiverIlan/assistente-idoso)

A versão com as últimas correções verificadas está na branch `refatoracao-backend`; a branch `main` foi mantida separada durante essa etapa de desenvolvimento.
