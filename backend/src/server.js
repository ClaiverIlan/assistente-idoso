
const express = require("express");

const cors = require("cors");

const { DatabaseSync } = require("node:sqlite");

const path = require("path");

const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./swagger");

const {

  gerarRespostaAssistente,

} = require("./services/openai");

const {

  gerarRespostaAssistenteGemini,

} = require("./services/gemini");

const app = express();

const PORT = 3000;

app.use(

  "/api-docs",

  swaggerUi.serve,

  swaggerUi.setup(swaggerSpec)

);

// Permite receber requisições do frontend

app.use(cors());

// Permite trabalhar com JSON

app.use(express.json());

// ========================================

// BANCO DE DADOS

// ========================================

const dbPath = path.join(

  __dirname,

  "../../assistente-idoso.db"

);

// Abre o banco existente ou cria um novo

const db = new DatabaseSync(dbPath);

// Ativa a validação das chaves estrangeiras do SQLite

db.exec("PRAGMA foreign_keys = ON");

// Cria as tabelas caso ainda não existam

db.exec(`

  CREATE TABLE IF NOT EXISTS "CUIDADOR" (

    "Id" INTEGER PRIMARY KEY AUTOINCREMENT,

    "Nome" TEXT,

    "Email" TEXT,

    "Tipo" TEXT

  );

  CREATE TABLE IF NOT EXISTS "IDOSO" (

    "Id" INTEGER PRIMARY KEY AUTOINCREMENT,

    "Cuidador_Id" INTEGER,

    "Nome" TEXT,

    "Data Nascimento" TEXT,

    "Observacoes" TEXT,

    FOREIGN KEY ("Cuidador_Id")

      REFERENCES "CUIDADOR"("Id")

  );

  CREATE TABLE IF NOT EXISTS "MEDICAMENTO" (

    "Id" INTEGER PRIMARY KEY AUTOINCREMENT,

    "Idoso_Id" INTEGER,

    "Nome" TEXT,

    "Dosagem" TEXT,

    "Horario" TEXT,

    "Frequencia" TEXT,

    "Observacoes" TEXT,

    FOREIGN KEY ("Idoso_Id")

      REFERENCES "IDOSO"("Id")

  );

  CREATE TABLE IF NOT EXISTS "LEMBRETE" (

    "Id" INTEGER PRIMARY KEY AUTOINCREMENT,

    "Medicamento_Id" INTEGER,

    "Data_Hora" TEXT,

    "Status" TEXT,

    FOREIGN KEY ("Medicamento_Id")

      REFERENCES "MEDICAMENTO"("Id")

  );

  CREATE TABLE IF NOT EXISTS "OCORRENCIA" (

    "Id" INTEGER PRIMARY KEY AUTOINCREMENT,

    "Idoso_Id" INTEGER,

    "Tipo" TEXT,

    "Descrição" TEXT,

    "Data_Hora" TEXT,

    FOREIGN KEY ("Idoso_Id")

      REFERENCES "IDOSO"("Id")

  );

`);

// ========================================

// MIGRAÇÃO DA ESTRUTURA DE MEDICAMENTOS

// ========================================

// Verifica se a coluna Ativo já existe.

const colunasMedicamento = db

  .prepare('PRAGMA table_info("MEDICAMENTO")')

  .all();

const possuiColunaAtivo = colunasMedicamento.some(

  (coluna) => coluna.name === "Ativo"

);

// Adiciona Ativo somente se ainda não existir.

// Os medicamentos já cadastrados começam como ativos.

if (!possuiColunaAtivo) {

  db.exec(`

    ALTER TABLE "MEDICAMENTO"

    ADD COLUMN "Ativo" INTEGER NOT NULL DEFAULT 1

  `);

}

// Cria a tabela que armazenará os horários e dias

// programados para cada medicamento.

db.exec(`

  CREATE TABLE IF NOT EXISTS "MEDICAMENTO_AGENDA" (

    "Id" INTEGER PRIMARY KEY AUTOINCREMENT,

    "Medicamento_Id" INTEGER NOT NULL,

    "Dia_Semana" INTEGER NOT NULL

      CHECK ("Dia_Semana" BETWEEN 0 AND 6),

    "Horario" TEXT NOT NULL,

    FOREIGN KEY ("Medicamento_Id")

      REFERENCES "MEDICAMENTO"("Id")

  )

`);

// Impede cadastrar duas vezes o mesmo horário

// para o mesmo medicamento no mesmo dia.

db.exec(`

  CREATE UNIQUE INDEX IF NOT EXISTS

  "idx_medicamento_agenda_unica"

  ON "MEDICAMENTO_AGENDA"

  ("Medicamento_Id", "Dia_Semana", "Horario")

`);

// ========================================

// MIGRAÇÃO DOS STATUS DOS LEMBRETES

// ========================================

// Verifica as colunas existentes na tabela LEMBRETE.

const colunasLembrete = db

  .prepare('PRAGMA table_info("LEMBRETE")')

  .all();

// Verifica se a coluna Visualizado_Em existe.

const possuiColunaVisualizadoEm = colunasLembrete.some(

  (coluna) => coluna.name === "Visualizado_Em"

);

// Adiciona a coluna de visualização, caso necessário.

if (!possuiColunaVisualizadoEm) {

  db.exec(`

    ALTER TABLE "LEMBRETE"

    ADD COLUMN "Visualizado_Em" TEXT

  `);

}

// Verifica se a coluna Administrado_Em existe.

const possuiColunaAdministradoEm = colunasLembrete.some(

  (coluna) => coluna.name === "Administrado_Em"

);

// Adiciona a coluna de administração, caso necessário.

if (!possuiColunaAdministradoEm) {

  db.exec(`

    ALTER TABLE "LEMBRETE"

    ADD COLUMN "Administrado_Em" TEXT

  `);

}

// ========================================

// HISTÓRICO DE ADMINISTRAÇÃO DOS MEDICAMENTOS

// ========================================

db.exec(`

  CREATE TABLE IF NOT EXISTS "LEMBRETE_HISTORICO" (

    "Id" INTEGER PRIMARY KEY AUTOINCREMENT,

    "Lembrete_Id" INTEGER,

    "Medicamento_Id" INTEGER,

    "Idoso_Id" INTEGER,

    "Medicamento_Nome" TEXT NOT NULL,

    "Medicamento_Dosagem" TEXT,

    "Data_Hora_Programada" TEXT,

    "Acao" TEXT NOT NULL

      CHECK ("Acao" IN ('ADMINISTRADO', 'DESFEITO')),

    "Data_Hora_Evento" TEXT NOT NULL

  );

  CREATE INDEX IF NOT EXISTS

  "idx_lembrete_historico_idoso_data"

  ON "LEMBRETE_HISTORICO"

  ("Idoso_Id", "Data_Hora_Programada");

`);

// ========================================

// FUNÇÕES DE AGENDA E LEMBRETES RECORRENTES

// ========================================

// Obtém a data atual considerando o horário de Fortaleza.

function obterDataAtualFortaleza() {

  const partes = new Intl.DateTimeFormat("en-CA", {

    timeZone: "America/Fortaleza",

    year: "numeric",

    month: "2-digit",

    day: "2-digit",

  }).formatToParts(new Date());

  const valores = {};

  for (const parte of partes) {

    if (parte.type !== "literal") {

      valores[parte.type] = parte.value;

    }

  }

  const data = `${valores.year}-${valores.month}-${valores.day}`;

  // 0 = domingo, 1 = segunda-feira ... 6 = sábado.

  const diaSemana = new Date(

    Date.UTC(

      Number(valores.year),

      Number(valores.month) - 1,

      Number(valores.day)

    )

  ).getUTCDay();

  return { data, diaSemana };

}

// Obtém a data e a hora atuais considerando o horário de Fortaleza.
// O formato é compatível com comparações de data/hora no SQLite.
function obterDataHoraAtualFortaleza() {
  const partes = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const valores = {};

  for (const parte of partes) {
    if (parte.type !== "literal") {
      valores[parte.type] = parte.value;
    }
  }

  return `${valores.year}-${valores.month}-${valores.day} ${valores.hour}:${valores.minute}:${valores.second}`;
}

// Valida os dias e horários recebidos na agenda.

function validarAgenda(agenda) {

  if (!Array.isArray(agenda)) {

    return "A agenda deve ser uma lista de dias e horários.";

  }

  const combinacoes = new Set();

  for (const item of agenda) {

    const diaSemana = Number(item?.Dia_Semana);

    const horario = item?.Horario;

    if (

      !Number.isInteger(diaSemana) ||

      diaSemana < 0 ||

      diaSemana > 6

    ) {

      return "Cada dia da agenda deve ser um número de 0 (domingo) a 6 (sábado).";

    }

    if (

      typeof horario !== "string" ||

      !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(horario)

    ) {

      return "Cada horário deve estar no formato HH:MM.";

    }

    const chave = `${diaSemana}-${horario}`;

    if (combinacoes.has(chave)) {

      return "A agenda não pode conter o mesmo horário duas vezes no mesmo dia.";

    }

    combinacoes.add(chave);

  }

  return null;

}

// Salva os horários programados de um medicamento.

// Não altera os lembretes que já foram registrados.

function salvarAgendaMedicamento(medicamentoId, agenda) {

  db.prepare(`

    DELETE FROM "MEDICAMENTO_AGENDA"

    WHERE "Medicamento_Id" = ?

  `).run(medicamentoId);

  const inserirHorario = db.prepare(`

    INSERT INTO "MEDICAMENTO_AGENDA"

    ("Medicamento_Id", "Dia_Semana", "Horario")

    VALUES (?, ?, ?)

  `);

  for (const item of agenda) {

    inserirHorario.run(

      medicamentoId,

      Number(item.Dia_Semana),

      item.Horario

    );

  }

}

// Consulta os dias e horários de um medicamento.

function buscarAgendaMedicamento(medicamentoId) {

  return db.prepare(`

    SELECT

      "Id",

      "Medicamento_Id",

      "Dia_Semana",

      "Horario"

    FROM "MEDICAMENTO_AGENDA"

    WHERE "Medicamento_Id" = ?

    ORDER BY "Dia_Semana", "Horario"

  `).all(medicamentoId);

}

// Compara a programação atual com a nova agenda enviada pelo frontend.
// Evita recriar lembretes quando somente nome ou dosagem forem alterados.
function agendaMedicamentoFoiAlterada(medicamentoId, novaAgenda) {
  const agendaAtual = buscarAgendaMedicamento(medicamentoId)
    .map((item) => `${Number(item.Dia_Semana)}-${item.Horario}`)
    .sort();

  const agendaNova = novaAgenda
    .map((item) => `${Number(item.Dia_Semana)}-${item.Horario}`)
    .sort();

  return JSON.stringify(agendaAtual) !== JSON.stringify(agendaNova);
}

// Gera os lembretes de hoje e dos próximos seis dias,
// respeitando exclusivamente os dias e horários cadastrados.
// A consulta prévia impede a criação de lembretes duplicados.
function gerarLembretesProximosSeteDias({ transacaoAtiva = false } = {}) {
  const { data: dataAtual } = obterDataAtualFortaleza();

  // Consulta somente as agendas dos medicamentos ativos.
  const agendas = db.prepare(`
    SELECT
      agenda."Medicamento_Id",
      agenda."Dia_Semana",
      agenda."Horario"
    FROM "MEDICAMENTO_AGENDA" agenda
    INNER JOIN "MEDICAMENTO" medicamento
      ON medicamento."Id" = agenda."Medicamento_Id"
    WHERE medicamento."Ativo" = 1
    ORDER BY agenda."Dia_Semana", agenda."Horario"
  `).all();

  // Organiza os horários por dia da semana.
  const agendaPorDia = new Map();

  for (const item of agendas) {
    const diaSemana = Number(item.Dia_Semana);

    if (!agendaPorDia.has(diaSemana)) {
      agendaPorDia.set(diaSemana, []);
    }

    agendaPorDia.get(diaSemana).push(item);
  }

  // Procura o lembrete pela combinação medicamento + data/hora.
  const buscarExistente = db.prepare(`
    SELECT "Id"
    FROM "LEMBRETE"
    WHERE "Medicamento_Id" = ?
      AND datetime("Data_Hora") = datetime(?)
    LIMIT 1
  `);

  const inserirLembrete = db.prepare(`
    INSERT INTO "LEMBRETE"
    ("Medicamento_Id", "Data_Hora", "Status")
    VALUES (?, ?, 'Pendente')
  `);

  // Usa a data local de Fortaleza como ponto inicial e avança
  // o calendário em UTC para evitar problemas de fuso horário.
  const dataBase = new Date(`${dataAtual}T00:00:00.000Z`);

  // Permite reutilizar a função dentro de outra transação.
  if (!transacaoAtiva) {
    db.exec("BEGIN");
  }

  try {
    // Inclui hoje e os seis dias seguintes.
    for (let deslocamento = 0; deslocamento < 7; deslocamento++) {
      const dataProgramada = new Date(dataBase);

      dataProgramada.setUTCDate(
        dataProgramada.getUTCDate() + deslocamento
      );

      const data = dataProgramada.toISOString().slice(0, 10);
      const diaSemana = dataProgramada.getUTCDay();
      const horariosDoDia = agendaPorDia.get(diaSemana) || [];

      // Só são gerados lembretes para os dias efetivamente cadastrados.
      for (const item of horariosDoDia) {
        const dataHora = `${data}T${item.Horario}:00`;

        const existente = buscarExistente.get(
          item.Medicamento_Id,
          dataHora
        );

        if (!existente) {
          inserirLembrete.run(
            item.Medicamento_Id,
            dataHora
          );
        }
      }
    }

    if (!transacaoAtiva) {
      db.exec("COMMIT");
    }
  } catch (erro) {
    if (!transacaoAtiva) {
      db.exec("ROLLBACK");
    }
    throw erro;
  }
}

console.log("Banco SQLite conectado com sucesso!");

// ========================================

// ROTA INICIAL

// ========================================

app.get("/", (req, res) => {

  res.send(

    "Backend do Assistente de Cuidado funcionando!"

  );

});

// ========================================

// TESTE DA CONEXÃO COM O BANCO

// ========================================

app.get("/api/teste-banco", (req, res) => {

  try {

    const resultado = db

      .prepare('SELECT * FROM "CUIDADOR"')

      .all();

    res.json(resultado);

  } catch (erro) {

    console.error("Erro ao consultar o banco:", erro);

    res.status(500).json({

      erro: "Erro ao consultar o banco de dados.",

    });

  }

});

// ========================================

// CUIDADORES

// ========================================

// Lista todos os cuidadores

app.get("/api/cuidadores", (req, res) => {

  try {

    const cuidadores = db

      .prepare('SELECT * FROM "CUIDADOR"')

      .all();

    res.json(cuidadores);

  } catch (erro) {

    console.error(

      "Erro ao consultar cuidadores:",

      erro

    );

    res.status(500).json({

      erro: "Erro ao consultar os cuidadores.",

    });

  }

});

// Atualiza um cuidador existente

app.put("/api/cuidadores/:id", (req, res) => {

  try {

    const { id } = req.params;

    const { Nome, Email, Tipo } = req.body;

    if (!Nome || !Email || !Tipo) {

      return res.status(400).json({

        erro: "Nome, Email e Tipo são obrigatórios.",

      });

    }

    const resultado = db

      .prepare(`

        UPDATE "CUIDADOR"

        SET

          "Nome" = ?,

          "Email" = ?,

          "Tipo" = ?

        WHERE "Id" = ?

      `)

      .run(Nome, Email, Tipo, id);

    if (resultado.changes === 0) {

      return res.status(404).json({

        erro: "Cuidador não encontrado.",

      });

    }

    res.json({

      mensagem: "Cuidador atualizado com sucesso.",

      Id: Number(id),

      Nome,

      Email,

      Tipo,

    });

  } catch (erro) {

    console.error(

      "Erro ao atualizar cuidador:",

      erro

    );

    res.status(500).json({

      erro: "Erro ao atualizar o cuidador.",

    });

  }

});

// Exclui um cuidador existente

app.delete("/api/cuidadores/:id", (req, res) => {

  try {

    const { id } = req.params;

    const resultado = db

      .prepare(`

        DELETE FROM "CUIDADOR"

        WHERE "Id" = ?

      `)

      .run(id);

    if (resultado.changes === 0) {

      return res.status(404).json({

        erro: "Cuidador não encontrado.",

      });

    }

    res.json({

      mensagem: "Cuidador excluído com sucesso.",

      Id: Number(id),

    });

  } catch (erro) {

    console.error(

      "Erro ao excluir cuidador:",

      erro

    );

    res.status(500).json({

      erro: "Erro ao excluir o cuidador.",

    });

  }

});

// Cadastra um novo cuidador

app.post("/api/cuidadores", (req, res) => {

  try {

    const { Nome, Email, Tipo } = req.body;

    if (!Nome || !Email || !Tipo) {

      return res.status(400).json({

        erro: "Nome, Email e Tipo são obrigatórios.",

      });

    }

    const emailNormalizado = Email.trim();

    // Verifica se já existe um cuidador com esse e-mail,

    // ignorando diferenças entre maiúsculas/minúsculas e espaços.

    const cuidadorExistente = db

      .prepare(`

        SELECT "Id"

        FROM "CUIDADOR"

        WHERE LOWER(TRIM("Email")) = LOWER(TRIM(?))

        LIMIT 1

      `)

      .get(emailNormalizado);

    if (cuidadorExistente) {

      return res.status(409).json({

        erro:

          "Já existe um cuidador cadastrado com esse e-mail.",

      });

    }

    const resultado = db

      .prepare(`

        INSERT INTO "CUIDADOR" ("Nome", "Email", "Tipo")

        VALUES (?, ?, ?)

      `)

      .run(Nome, emailNormalizado, Tipo);

    res.status(201).json({

      mensagem: "Cuidador cadastrado com sucesso.",

      Id: Number(resultado.lastInsertRowid),

      Nome,

      Email: emailNormalizado,

      Tipo,

    });

  } catch (erro) {

    console.error(

      "Erro ao cadastrar cuidador:",

      erro

    );

    res.status(500).json({

      erro: "Erro ao cadastrar o cuidador.",

    });

  }

});

// ========================================

// IDOSOS

// ========================================

// Lista todos os idosos

app.get("/api/idosos", (req, res) => {

  try {

    const idosos = db

      .prepare('SELECT * FROM "IDOSO"')

      .all();

    res.json(idosos);

  } catch (erro) {

    console.error(

      "Erro ao consultar idosos:",

      erro

    );

    res.status(500).json({

      erro: "Erro ao consultar os idosos.",

    });

  }

});

// Cadastra um novo idoso

app.post("/api/idosos", (req, res) => {

  try {

    const {

      Cuidador_Id,

      Nome,

      "Data Nascimento": DataNascimento,

      Observacoes,

    } = req.body;

    if (!Cuidador_Id || !Nome) {

      return res.status(400).json({

        erro: "Cuidador_Id e Nome são obrigatórios.",

      });

    }

    const resultado = db

      .prepare(`

        INSERT INTO "IDOSO"

        ("Cuidador_Id", "Nome", "Data Nascimento", "Observacoes")

        VALUES (?, ?, ?, ?)

      `)

      .run(

        Cuidador_Id,

        Nome,

        DataNascimento,

        Observacoes

      );

    res.status(201).json({

      mensagem: "Idoso cadastrado com sucesso.",

      Id: Number(resultado.lastInsertRowid),

      Cuidador_Id,

      Nome,

      "Data Nascimento": DataNascimento,

      Observacoes,

    });

  } catch (erro) {

    console.error(

      "Erro ao cadastrar idoso:",

      erro

    );

    res.status(500).json({

      erro: "Erro ao cadastrar o idoso.",

    });

  }

});

// Atualiza um idoso existente

app.put("/api/idosos/:id", (req, res) => {

  try {

    const { id } = req.params;

    const {

      Cuidador_Id,

      Nome,

      "Data Nascimento": DataNascimento,

      Observacoes,

    } = req.body;

    if (!Cuidador_Id || !Nome) {

      return res.status(400).json({

        erro: "Cuidador_Id e Nome são obrigatórios.",

      });

    }

    const resultado = db

      .prepare(`

        UPDATE "IDOSO"

        SET

          "Cuidador_Id" = ?,

          "Nome" = ?,

          "Data Nascimento" = ?,

          "Observacoes" = ?

        WHERE "Id" = ?

      `)

      .run(

        Cuidador_Id,

        Nome,

        DataNascimento,

        Observacoes,

        id

      );

    if (resultado.changes === 0) {

      return res.status(404).json({

        erro: "Idoso não encontrado.",

      });

    }

    res.json({

      mensagem: "Idoso atualizado com sucesso.",

      Id: Number(id),

      Cuidador_Id,

      Nome,

      "Data Nascimento": DataNascimento,

      Observacoes,

    });

  } catch (erro) {

    console.error(

      "Erro ao atualizar idoso:",

      erro

    );

    res.status(500).json({

      erro: "Erro ao atualizar o idoso.",

    });

  }

});

// Exclui um idoso e todos os dados relacionados

app.delete("/api/idosos/:id", (req, res) => {

  try {

    const { id } = req.params;

    const idoso = db

      .prepare(`

        SELECT "Id"

        FROM "IDOSO"

        WHERE "Id" = ?

        LIMIT 1

      `)

      .get(id);

    if (!idoso) {

      return res.status(404).json({

        erro: "Idoso não encontrado.",

      });

    }

    db.exec("BEGIN TRANSACTION");

    try {

      // Exclui os lembretes dos medicamentos do idoso

      db.prepare(`

        DELETE FROM "LEMBRETE"

        WHERE "Medicamento_Id" IN (

          SELECT "Id"

          FROM "MEDICAMENTO"

          WHERE "Idoso_Id" = ?

        )

      `).run(id);

      // Exclui o histórico de administração do idoso.

      db.prepare(`

        DELETE FROM "LEMBRETE_HISTORICO"

        WHERE "Idoso_Id" = ?

      `).run(id);

      // Exclui as agendas dos medicamentos do idoso.

      db.prepare(`

        DELETE FROM "MEDICAMENTO_AGENDA"

        WHERE "Medicamento_Id" IN (

          SELECT "Id"

          FROM "MEDICAMENTO"

          WHERE "Idoso_Id" = ?

        )

      `).run(id);

      // Exclui os medicamentos do idoso

      db.prepare(`

        DELETE FROM "MEDICAMENTO"

        WHERE "Idoso_Id" = ?

      `).run(id);

      // Exclui as ocorrências do idoso

      db.prepare(`

        DELETE FROM "OCORRENCIA"

        WHERE "Idoso_Id" = ?

      `).run(id);

      // Exclui o idoso

      db.prepare(`

        DELETE FROM "IDOSO"

        WHERE "Id" = ?

      `).run(id);

      db.exec("COMMIT");

    } catch (erroTransacao) {

      db.exec("ROLLBACK");

      throw erroTransacao;

    }

    res.json({

      mensagem:

        "Idoso e todos os dados relacionados foram excluídos com sucesso.",

      Id: Number(id),

    });

  } catch (erro) {

    console.error(

      "Erro ao excluir idoso:",

      erro

    );

    res.status(500).json({

      erro: "Erro ao excluir o idoso.",

    });

  }

});

// ========================================

// MEDICAMENTOS

// ========================================

// Lista os medicamentos ativos e suas respectivas agendas.

app.get("/api/medicamentos", (req, res) => {

  try {

    const medicamentos = db

      .prepare(`

        SELECT *

        FROM "MEDICAMENTO"

        WHERE "Ativo" = 1

        ORDER BY "Nome"

      `)

      .all();

    const resultado = medicamentos.map((medicamento) => ({

      ...medicamento,

      agenda: buscarAgendaMedicamento(medicamento.Id),

    }));

    res.json(resultado);

  } catch (erro) {

    console.error("Erro ao consultar medicamentos:", erro);

    res.status(500).json({

      erro: "Erro ao consultar os medicamentos.",

    });

  }

});

// Consulta a agenda de um medicamento específico.

app.get("/api/medicamentos/:id/agenda", (req, res) => {

  try {

    const { id } = req.params;

    const medicamento = db

      .prepare(`

        SELECT "Id"

        FROM "MEDICAMENTO"

        WHERE "Id" = ?

        LIMIT 1

      `)

      .get(id);

    if (!medicamento) {

      return res.status(404).json({

        erro: "Medicamento não encontrado.",

      });

    }

    res.json(buscarAgendaMedicamento(id));

  } catch (erro) {

    console.error("Erro ao consultar agenda:", erro);

    res.status(500).json({

      erro: "Erro ao consultar a agenda do medicamento.",

    });

  }

});

// Cadastra um medicamento e sua agenda semanal.

app.post("/api/medicamentos", (req, res) => {

  try {

    const {

      Idoso_Id,

      Nome,

      Dosagem,

      Horario,

      Frequencia,

      Observacoes,

      agenda,

    } = req.body;

    if (!Idoso_Id || !Nome) {

      return res.status(400).json({

        erro: "Idoso_Id e Nome são obrigatórios.",

      });

    }

    const recebeuAgenda = Object.prototype.hasOwnProperty.call(

      req.body,

      "agenda"

    );

    // Valida a agenda quando ela for enviada.

    if (recebeuAgenda) {

      const erroAgenda = validarAgenda(agenda);

      if (erroAgenda) {

        return res.status(400).json({

          erro: erroAgenda,

        });

      }

    }

    // Mantém o primeiro horário no campo antigo

    // para compatibilidade com partes existentes do sistema.

    const horarioPrincipal = recebeuAgenda

      ? (agenda.length > 0 ? agenda[0].Horario : null)

      : (Horario || null);

    db.exec("BEGIN");

    let medicamentoId;

    let lembrete = null;

    try {

      const resultado = db

        .prepare(`

          INSERT INTO "MEDICAMENTO"

          (

            "Idoso_Id",

            "Nome",

            "Dosagem",

            "Horario",

            "Frequencia",

            "Observacoes",

            "Ativo"

          )

          VALUES (?, ?, ?, ?, ?, ?, 1)

        `)

        .run(

          Idoso_Id,

          Nome,

          Dosagem || "",

          horarioPrincipal,

          Frequencia || "",

          Observacoes || ""

        );

      medicamentoId = Number(

        resultado.lastInsertRowid

      );

      if (recebeuAgenda) {

        // Salva todos os dias e horários programados.

        salvarAgendaMedicamento(

          medicamentoId,

          agenda

        );

      } else if (Horario) {

        // Compatibilidade temporária com o formulário antigo.

        const resultadoLembrete = db

          .prepare(`

            INSERT INTO "LEMBRETE"

            (

              "Medicamento_Id",

              "Data_Hora",

              "Status"

            )

            VALUES (?, ?, 'Pendente')

          `)

          .run(medicamentoId, Horario);

        lembrete = {

          Id: Number(

            resultadoLembrete.lastInsertRowid

          ),

          Medicamento_Id: medicamentoId,

          Data_Hora: Horario,

          Status: "Pendente",

        };

      }

      db.exec("COMMIT");

    } catch (erroTransacao) {

      db.exec("ROLLBACK");

      throw erroTransacao;

    }

    res.status(201).json({

      mensagem: "Medicamento cadastrado com sucesso.",

      Id: medicamentoId,

      Idoso_Id,

      Nome,

      Dosagem,

      Horario: horarioPrincipal,

      Frequencia,

      Observacoes,

      Ativo: 1,

      agenda: buscarAgendaMedicamento(medicamentoId),

      lembrete,

    });

  } catch (erro) {

    console.error("Erro ao cadastrar medicamento:", erro);

    res.status(500).json({

      erro: "Erro ao cadastrar o medicamento.",

    });

  }

});

// Atualiza os dados do medicamento e sua agenda.

// Os lembretes já registrados não são alterados.

app.put("/api/medicamentos/:id", (req, res) => {

  try {

    const { id } = req.params;

    const {

      Idoso_Id,

      Nome,

      Dosagem,

      Horario,

      Frequencia,

      Observacoes,

      agenda,

    } = req.body;

    if (!Idoso_Id || !Nome) {

      return res.status(400).json({

        erro: "Idoso_Id e Nome são obrigatórios.",

      });

    }

    const medicamentoExistente = db

      .prepare(`

        SELECT "Id", "Ativo"

        FROM "MEDICAMENTO"

        WHERE "Id" = ?

        LIMIT 1

      `)

      .get(id);

    if (!medicamentoExistente) {

      return res.status(404).json({

        erro: "Medicamento não encontrado.",

      });

    }

    const recebeuAgenda = Object.prototype.hasOwnProperty.call(

      req.body,

      "agenda"

    );

    if (recebeuAgenda) {

      const erroAgenda = validarAgenda(agenda);

      if (erroAgenda) {

        return res.status(400).json({

          erro: erroAgenda,

        });

      }

    }

    const agendaFoiAlterada = recebeuAgenda

      ? agendaMedicamentoFoiAlterada(id, agenda)

      : false;

    const horarioPrincipal = recebeuAgenda

      ? (agenda.length > 0 ? agenda[0].Horario : null)

      : (Horario || null);

    db.exec("BEGIN");

    try {

      db.prepare(`

        UPDATE "MEDICAMENTO"

        SET

          "Idoso_Id" = ?,

          "Nome" = ?,

          "Dosagem" = ?,

          "Horario" = ?,

          "Frequencia" = ?,

          "Observacoes" = ?

        WHERE "Id" = ?

      `).run(

        Idoso_Id,

        Nome,

        Dosagem || "",

        horarioPrincipal,

        Frequencia || "",

        Observacoes || "",

        id

      );

      if (recebeuAgenda) {

        // Atualiza os dias e horários cadastrados.
        salvarAgendaMedicamento(id, agenda);

        if (agendaFoiAlterada) {
          // Remove somente lembretes futuros ainda não administrados.
          // Registros passados e administrações confirmadas são preservados.
          const dataHoraAtual = obterDataHoraAtualFortaleza();

          db.prepare(`
            DELETE FROM "LEMBRETE"
            WHERE "Medicamento_Id" = ?
              AND datetime("Data_Hora") >= datetime(?)
              AND "Administrado_Em" IS NULL
              AND LOWER(TRIM(COALESCE("Status", ''))) NOT IN (
                'realizado',
                'concluido',
                'concluído'
              )
          `).run(id, dataHoraAtual);

          // Recria imediatamente os próximos sete dias conforme a nova agenda.
          // A geração reutiliza a transação aberta nesta rota.
          if (Number(medicamentoExistente.Ativo) === 1) {
            gerarLembretesProximosSeteDias({
              transacaoAtiva: true,
            });
          }
        }

      }

      db.exec("COMMIT");

    } catch (erroTransacao) {

      db.exec("ROLLBACK");

      throw erroTransacao;

    }

    res.json({

      mensagem: "Medicamento atualizado com sucesso.",

      Id: Number(id),

      Idoso_Id,

      Nome,

      Dosagem,

      Horario: horarioPrincipal,

      Frequencia,

      Observacoes,

      Ativo: medicamentoExistente.Ativo,

      agenda: buscarAgendaMedicamento(id),

      lembrete: null,

    });

  } catch (erro) {

    console.error("Erro ao atualizar medicamento:", erro);

    res.status(500).json({

      erro: "Erro ao atualizar o medicamento.",

    });

  }

});

// Desativa o medicamento sem apagar seus lembretes

// nem sua agenda. Assim, o histórico é preservado.

app.delete("/api/medicamentos/:id", (req, res) => {

  try {

    const { id } = req.params;

    const resultado = db

      .prepare(`

        UPDATE "MEDICAMENTO"

        SET "Ativo" = 0

        WHERE "Id" = ? AND "Ativo" = 1

      `)

      .run(id);

    if (resultado.changes === 0) {

      return res.status(404).json({

        erro: "Medicamento não encontrado ou já desativado.",

      });

    }

    res.json({

      mensagem:

        "Medicamento desativado. A agenda e o histórico foram preservados.",

      Id: Number(id),

      Ativo: 0,

    });

  } catch (erro) {

    console.error("Erro ao desativar medicamento:", erro);

    res.status(500).json({

      erro: "Erro ao desativar o medicamento.",

    });

  }

});

// ========================================

// OCORRÊNCIAS

// ========================================

 
// Lista todas as ocorrências

app.get("/api/ocorrencias", (req, res) => {

  try {

    const ocorrencias = db

      .prepare('SELECT * FROM "OCORRENCIA"')

      .all();

    res.json(ocorrencias);

  } catch (erro) {

    console.error(

      "Erro ao consultar ocorrências:",

      erro

    );

    res.status(500).json({

      erro: "Erro ao consultar as ocorrências.",

    });

  }

});

// Cadastra uma nova ocorrência

app.post("/api/ocorrencias", (req, res) => {

  try {

    const {

      Idoso_Id,

      Tipo,

      "Descrição": Descricao,

      Data_Hora,

    } = req.body;

    if (

      !Idoso_Id ||

      !Tipo ||

      !Descricao ||

      !Data_Hora

    ) {

      return res.status(400).json({

        erro:

          "Idoso_Id, Tipo, Descrição e Data_Hora são obrigatórios.",

      });

    }

    const resultado = db

      .prepare(`

        INSERT INTO "OCORRENCIA"

        ("Idoso_Id", "Tipo", "Descrição", "Data_Hora")

        VALUES (?, ?, ?, ?)

      `)

      .run(

        Idoso_Id,

        Tipo,

        Descricao,

        Data_Hora

      );

    res.status(201).json({

      mensagem: "Ocorrência cadastrada com sucesso.",

      Id: Number(resultado.lastInsertRowid),

      Idoso_Id,

      Tipo,

      "Descrição": Descricao,

      Data_Hora,

    });

  } catch (erro) {

    console.error(

      "Erro ao cadastrar ocorrência:",

      erro

    );

    res.status(500).json({

      erro: "Erro ao cadastrar a ocorrência.",

    });

  }

});

// Atualiza uma ocorrência existente

app.put("/api/ocorrencias/:id", (req, res) => {

  try {

    const { id } = req.params;

    const {

      Idoso_Id,

      Tipo,

      "Descrição": Descricao,

      Data_Hora,

    } = req.body;

    if (

      !Idoso_Id ||

      !Tipo ||

      !Descricao ||

      !Data_Hora

    ) {

      return res.status(400).json({

        erro:

          "Idoso_Id, Tipo, Descrição e Data_Hora são obrigatórios.",

      });

    }

    const resultado = db

      .prepare(`

        UPDATE "OCORRENCIA"

        SET

          "Idoso_Id" = ?,

          "Tipo" = ?,

          "Descrição" = ?,

          "Data_Hora" = ?

        WHERE "Id" = ?

      `)

      .run(

        Idoso_Id,

        Tipo,

        Descricao,

        Data_Hora,

        id

      );

    if (resultado.changes === 0) {

      return res.status(404).json({

        erro: "Ocorrência não encontrada.",

      });

    }

    res.json({

      mensagem: "Ocorrência atualizada com sucesso.",

      Id: Number(id),

      Idoso_Id,

      Tipo,

      "Descrição": Descricao,

      Data_Hora,

    });

  } catch (erro) {

    console.error(

      "Erro ao atualizar ocorrência:",

      erro

    );

    res.status(500).json({

      erro: "Erro ao atualizar a ocorrência.",

    });

  }

});

// Exclui uma ocorrência existente

app.delete("/api/ocorrencias/:id", (req, res) => {

  try {

    const { id } = req.params;

    const resultado = db

      .prepare(`

        DELETE FROM "OCORRENCIA"

        WHERE "Id" = ?

      `)

      .run(id);

    if (resultado.changes === 0) {

      return res.status(404).json({

        erro: "Ocorrência não encontrada.",

      });

    }

    res.json({

      mensagem: "Ocorrência excluída com sucesso.",

      Id: Number(id),

    });

  } catch (erro) {

    console.error(

      "Erro ao excluir ocorrência:",

      erro

    );

    res.status(500).json({

      erro: "Erro ao excluir a ocorrência.",

    });

  }

});

// ========================================

// LEMBRETES

// ========================================

// Lista os lembretes e gera os registros do dia.

app.get("/api/lembretes", (req, res) => {

  try {

    // Gera os lembretes de hoje e dos próximos seis dias,
    // respeitando a agenda cadastrada e evitando duplicações.
    gerarLembretesProximosSeteDias();

    // Consulta os lembretes existentes.

    const lembretes = db

      .prepare(`

        SELECT *

        FROM "LEMBRETE"

        ORDER BY "Data_Hora" DESC

      `)

      .all();

    res.json(lembretes);

  } catch (erro) {

    console.error(

      "Erro ao consultar ou gerar lembretes:",

      erro

    );

    res.status(500).json({

      erro: "Erro ao consultar ou gerar os lembretes.",

    });

  }

});

// ========================================

// VISUALIZAÇÃO DOS LEMBRETES

// ========================================

app.patch("/api/lembretes/:id/visualizacao", (req, res) => {

  try {

    const id = Number(req.params.id);

    const { visualizado } = req.body;

    if (!Number.isInteger(id) || id <= 0) {

      return res.status(400).json({

        erro: "Identificador do lembrete inválido.",

      });

    }

    if (typeof visualizado !== "boolean") {

      return res.status(400).json({

        erro: "Informe se o lembrete foi visualizado.",

      });

    }

    const existente = db.prepare(`

      SELECT "Id"

      FROM "LEMBRETE"

      WHERE "Id" = ?

    `).get(id);

    if (!existente) {

      return res.status(404).json({

        erro: "Lembrete não encontrado.",

      });

    }

    const visualizadoEm = visualizado

      ? new Date().toISOString()

      : null;

    db.prepare(`

      UPDATE "LEMBRETE"

      SET "Visualizado_Em" = ?

      WHERE "Id" = ?

    `).run(visualizadoEm, id);

    const lembreteAtualizado = db.prepare(`

      SELECT *

      FROM "LEMBRETE"

      WHERE "Id" = ?

    `).get(id);

    res.json({

      mensagem: visualizado

        ? "Lembrete marcado como lido."

        : "Leitura desfeita com sucesso.",

      lembrete: lembreteAtualizado,

    });

  } catch (erro) {

    console.error("Erro ao atualizar visualização:", erro);

    res.status(500).json({

      erro: "Não foi possível atualizar a visualização.",

    });

  }

});

// ========================================

// ADMINISTRAÇÃO DOS MEDICAMENTOS

// ========================================

 
app.patch("/api/lembretes/:id/administracao", (req, res) => {

  try {

    const id = Number(req.params.id);

    const { administrado } = req.body;

    if (!Number.isInteger(id) || id <= 0) {

      return res.status(400).json({

        erro: "Identificador do lembrete inválido.",

      });

    }

    if (typeof administrado !== "boolean") {

      return res.status(400).json({

        erro: "Informe se o medicamento foi administrado.",

      });

    }

    // Busca o lembrete e os dados do medicamento.

    const lembrete = db.prepare(`

      SELECT

        l."Id",

        l."Medicamento_Id",

        l."Data_Hora",

        l."Status",

        l."Administrado_Em",

        m."Idoso_Id",

        m."Nome" AS "Medicamento_Nome",

        m."Dosagem" AS "Medicamento_Dosagem"

      FROM "LEMBRETE" l

      INNER JOIN "MEDICAMENTO" m

        ON m."Id" = l."Medicamento_Id"

      WHERE l."Id" = ?

      LIMIT 1

    `).get(id);

    if (!lembrete) {

      return res.status(404).json({

        erro: "Lembrete ou medicamento não encontrado.",

      });

    }

    // Identifica o estado atual, inclusive registros antigos.

    const statusAtual = String(lembrete.Status || "")

      .trim()

      .normalize("NFD")

      .replace(/[\u0300-\u036f]/g, "")

      .toLowerCase();

    const jaAdministrado =

      Boolean(lembrete.Administrado_Em) ||

      statusAtual === "realizado" ||

      statusAtual === "concluido";

    // Evita registrar ações repetidas sem necessidade.

    if (administrado === jaAdministrado) {

      return res.json({

        mensagem: "O lembrete já está nesse estado.",

        lembrete,

      });

    }

    const dataHoraEvento = new Date().toISOString();

    const acao = administrado

      ? "ADMINISTRADO"

      : "DESFEITO";

    const novoStatus = administrado

      ? "Realizado"

      : "Pendente";

    // Registra o evento e atualiza o estado atual.

    db.exec("BEGIN TRANSACTION");

    try {

      db.prepare(`

        INSERT INTO "LEMBRETE_HISTORICO" (

          "Lembrete_Id",

          "Medicamento_Id",

          "Idoso_Id",

          "Medicamento_Nome",

          "Medicamento_Dosagem",

          "Data_Hora_Programada",

          "Acao",

          "Data_Hora_Evento"

        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?)

      `).run(

        lembrete.Id,

        lembrete.Medicamento_Id,

        lembrete.Idoso_Id,

        lembrete.Medicamento_Nome,

        lembrete.Medicamento_Dosagem,

        lembrete.Data_Hora,

        acao,

        dataHoraEvento

      );

      db.prepare(`

        UPDATE "LEMBRETE"

        SET

          "Status" = ?,

          "Administrado_Em" = ?

        WHERE "Id" = ?

      `).run(

        novoStatus,

        administrado ? dataHoraEvento : null,

        id

      );

      db.exec("COMMIT");

    } catch (erroTransacao) {

      db.exec("ROLLBACK");

      throw erroTransacao;

    }

    // Retorna o lembrete atualizado.

    const lembreteAtualizado = db.prepare(`

      SELECT *

      FROM "LEMBRETE"

      WHERE "Id" = ?

    `).get(id);

    res.json({

      mensagem: administrado

        ? "Administração confirmada e registrada no histórico."

        : "Confirmação desfeita e registrada no histórico.",

      lembrete: lembreteAtualizado,

    });

  } catch (erro) {

    console.error(

      "Erro ao atualizar administração:",

      erro

    );

    res.status(500).json({

      erro: "Não foi possível atualizar a administração.",

    });

  }

});

// Cadastra um novo lembrete

app.post("/api/lembretes", (req, res) => {

  try {

    const {

      Medicamento_Id,

      Data_Hora,

      Status,

    } = req.body;

    if (

      !Medicamento_Id ||

      !Data_Hora ||

      !Status

    ) {

      return res.status(400).json({

        erro:

          "Medicamento_Id, Data_Hora e Status são obrigatórios.",

      });

    }

    const resultado = db

      .prepare(`

        INSERT INTO "LEMBRETE"

        ("Medicamento_Id", "Data_Hora", "Status")

        VALUES (?, ?, ?)

      `)

      .run(

        Medicamento_Id,

        Data_Hora,

        Status

      );

    res.status(201).json({

      mensagem: "Lembrete cadastrado com sucesso.",

      Id: Number(resultado.lastInsertRowid),

      Medicamento_Id,

      Data_Hora,

      Status,

    });

  } catch (erro) {

    console.error(

      "Erro ao cadastrar lembrete:",

      erro

    );

    res.status(500).json({

      erro: "Erro ao cadastrar o lembrete.",

    });

  }

});

// Atualiza um lembrete existente

app.put("/api/lembretes/:id", (req, res) => {

  try {

    const { id } = req.params;

    const {

      Medicamento_Id,

      Data_Hora,

      Status,

    } = req.body;

    if (

      !Medicamento_Id ||

      !Data_Hora ||

      !Status

    ) {

      return res.status(400).json({

        erro:

          "Medicamento_Id, Data_Hora e Status são obrigatórios.",

      });

    }

    const resultado = db

      .prepare(`

        UPDATE "LEMBRETE"

        SET

          "Medicamento_Id" = ?,

          "Data_Hora" = ?,

          "Status" = ?

        WHERE "Id" = ?

      `)

      .run(

        Medicamento_Id,

        Data_Hora,

        Status,

        id

      );

    if (resultado.changes === 0) {

      return res.status(404).json({

        erro: "Lembrete não encontrado.",

      });

    }

    res.json({

      mensagem: "Lembrete atualizado com sucesso.",

      Id: Number(id),

      Medicamento_Id,

      Data_Hora,

      Status,

    });

  } catch (erro) {

    console.error(

      "Erro ao atualizar lembrete:",

      erro

    );

    res.status(500).json({

      erro: "Erro ao atualizar o lembrete.",

    });

  }

});

// Exclui um lembrete existente

app.delete("/api/lembretes/:id", (req, res) => {

  try {

    const { id } = req.params;

    const resultado = db

      .prepare(`

        DELETE FROM "LEMBRETE"

        WHERE "Id" = ?

      `)

      .run(id);

    if (resultado.changes === 0) {

      return res.status(404).json({

        erro: "Lembrete não encontrado.",

      });

    }

    res.json({

      mensagem: "Lembrete excluído com sucesso.",

      Id: Number(id),

    });

  } catch (erro) {

    console.error(

      "Erro ao excluir lembrete:",

      erro

    );

    res.status(500).json({

      erro: "Erro ao excluir o lembrete.",

    });

  }

});

// ========================================

// FUNÇÃO DE CONTEXTO DO ASSISTENTE

// ========================================

function buscarContextoIdoso(idosoId) {

  const idoso = db

    .prepare(`

      SELECT

        "Id",

        "Cuidador_Id",

        "Nome",

        "Data Nascimento",

        "Observacoes"

      FROM "IDOSO"

      WHERE "Id" = ?

      LIMIT 1

    `)

    .get(idosoId);

  if (!idoso) {

    return null;

  }

  const medicamentos = db

    .prepare(`

      SELECT

        "Id",

        "Idoso_Id",

        "Nome",

        "Dosagem",

        "Horario",

        "Frequencia",

        "Observacoes"

      FROM "MEDICAMENTO"

      WHERE "Idoso_Id" = ?

      ORDER BY "Horario"

    `)

    .all(idosoId);

  const lembretes = db

    .prepare(`

      SELECT

        l."Id",

        l."Medicamento_Id",

        l."Data_Hora",

        l."Status",

        m."Nome" AS "Medicamento_Nome"

      FROM "LEMBRETE" l

      INNER JOIN "MEDICAMENTO" m

        ON m."Id" = l."Medicamento_Id"

      WHERE m."Idoso_Id" = ?

      ORDER BY l."Data_Hora"

    `)

    .all(idosoId);

  const ocorrencias = db

    .prepare(`

      SELECT

        "Id",

        "Idoso_Id",

        "Tipo",

        "Descrição",

        "Data_Hora"

      FROM "OCORRENCIA"

      WHERE "Idoso_Id" = ?

      ORDER BY "Data_Hora" DESC

    `)

    .all(idosoId);

  return {

    idoso,

    medicamentos,

    lembretes,

    ocorrencias,

  };

}

// ========================================

// HISTÓRICO DE LEMBRETES - ÚLTIMOS 90 DIAS

// ========================================

 
app.get(

  "/api/idosos/:idosoId/lembretes/historico",

  (req, res) => {

    try {

      const idosoId = Number(req.params.idosoId);

      if (!Number.isInteger(idosoId) || idosoId <= 0) {

        return res.status(400).json({

          erro: "Identificador do idoso inválido.",

        });

      }

      // Verifica se o idoso existe.

      const idoso = db.prepare(`

        SELECT "Id", "Nome"

        FROM "IDOSO"

        WHERE "Id" = ?

      `).get(idosoId);

      if (!idoso) {

        return res.status(404).json({

          erro: "Idoso não encontrado.",

        });

      }

      // Calcula o período usando a data de Fortaleza.

      const dataAtual = obterDataAtualFortaleza().data;

      const dataInicioObjeto = new Date(

        `${dataAtual}T00:00:00.000Z`

      );

      dataInicioObjeto.setUTCDate(

        dataInicioObjeto.getUTCDate() - 90

      );

      const dataInicio = dataInicioObjeto

        .toISOString()

        .slice(0, 10);

      // Data final: ontem.

      const dataFimObjeto = new Date(

        `${dataAtual}T00:00:00.000Z`

      );

      dataFimObjeto.setUTCDate(

        dataFimObjeto.getUTCDate() - 1

      );

      const dataFim = dataFimObjeto

        .toISOString()

        .slice(0, 10);

      // Busca os lembretes dos últimos 90 dias.

      // Não filtra medicamentos desativados.

      const lembretes = db.prepare(`

        SELECT

          l."Id",

          l."Medicamento_Id",

          l."Data_Hora",

          l."Status",

          l."Administrado_Em",

          m."Idoso_Id",

          m."Nome" AS "Medicamento_Nome",

          m."Dosagem" AS "Medicamento_Dosagem",

          CASE

            WHEN

              l."Administrado_Em" IS NOT NULL

              OR LOWER(TRIM(COALESCE(l."Status", '')))

                IN ('realizado', 'concluido')

            THEN 'Administrado'

            ELSE 'Sem confirmação'

          END AS "Situacao"

        FROM "LEMBRETE" l

        INNER JOIN "MEDICAMENTO" m

          ON m."Id" = l."Medicamento_Id"

        WHERE

          m."Idoso_Id" = ?

          AND SUBSTR(l."Data_Hora", 1, 10) >= ?

          AND SUBSTR(l."Data_Hora", 1, 10) <= ?

        ORDER BY l."Data_Hora" DESC

      `).all(

        idosoId,

        dataInicio,

        dataFim

      );

      // Recupera as ações de confirmação e desfazimento.

      const acoes = db.prepare(`

        SELECT

          "Id",

          "Lembrete_Id",

          "Medicamento_Id",

          "Medicamento_Nome",

          "Medicamento_Dosagem",

          "Data_Hora_Programada",

          "Acao",

          "Data_Hora_Evento"

        FROM "LEMBRETE_HISTORICO"

        WHERE

          "Idoso_Id" = ?

          AND SUBSTR(

            "Data_Hora_Programada", 1, 10

          ) >= ?

          AND SUBSTR(

            "Data_Hora_Programada", 1, 10

          ) <= ?

        ORDER BY "Data_Hora_Evento" DESC

      `).all(

        idosoId,

        dataInicio,

        dataFim

      );

      // Preserva registros antigos sem data identificável.

      const registrosSemData = db.prepare(`

        SELECT

          l."Id",

          l."Medicamento_Id",

          l."Data_Hora",

          l."Status",

          l."Administrado_Em",

          m."Nome" AS "Medicamento_Nome",

          m."Dosagem" AS "Medicamento_Dosagem"

        FROM "LEMBRETE" l

        INNER JOIN "MEDICAMENTO" m

          ON m."Id" = l."Medicamento_Id"

        WHERE

          m."Idoso_Id" = ?

          AND (

            l."Data_Hora" IS NULL

            OR LENGTH(l."Data_Hora") < 10

          )

        ORDER BY l."Id" DESC

      `).all(idosoId);

      res.json({

        idoso,

        periodo: {

          inicio: dataInicio,

          fim: dataFim,

        },

        total: lembretes.length,

        lembretes,

        acoes,

        registrosSemData,

      });

    } catch (erro) {

      console.error(

        "Erro ao consultar histórico de lembretes:",

        erro

      );

      res.status(500).json({

        erro: "Não foi possível consultar o histórico.",

      });

    }

  }

);

// ========================================

// ASSISTENTE

// ========================================

// Monta o contexto do idoso para o Assistente

app.post("/api/assistente/contexto", (req, res) => {

  try {

    const { idosoId, pergunta } = req.body;

    if (!idosoId || !pergunta) {

      return res.status(400).json({

        erro: "idosoId e pergunta são obrigatórios.",

      });

    }

    const contexto = buscarContextoIdoso(idosoId);

    if (!contexto) {

      return res.status(404).json({

        erro: "Idoso não encontrado.",

      });

    }

    res.json({

      pergunta,

      contexto,

    });

  } catch (erro) {

    console.error(

      "Erro ao montar contexto do Assistente:",

      erro

    );

    res.status(500).json({

      erro: "Erro ao montar o contexto do Assistente.",

    });

  }

});

// Gera uma resposta usando o provedor configurado,

// com contexto atual do idoso e histórico recente da conversa.

app.post("/api/assistente", async (req, res) => {

  try {

    const {

      idosoId,

      pergunta,

      historico = [],

    } = req.body;

    if (

      typeof pergunta !== "string" ||

      !pergunta.trim()

    ) {

      return res.status(400).json({

        erro: "A pergunta é obrigatória.",

      });

    }

    // O contexto do idoso é opcional para perguntas gerais.

    let contexto = null;

    if (

      idosoId !== undefined &&

      idosoId !== null &&

      String(idosoId).trim() !== ""

    ) {

      const idosoIdNumerico = Number(idosoId);

      if (

        !Number.isInteger(idosoIdNumerico) ||

        idosoIdNumerico <= 0

      ) {

        return res.status(400).json({

          erro: "O idoso informado é inválido.",

        });

      }

      contexto = buscarContextoIdoso(idosoIdNumerico);

      if (!contexto) {

        return res.status(404).json({

          erro: "Idoso não encontrado.",

        });

      }

    }

    // Valida o histórico e limita o tamanho do conteúdo

    // enviado ao provedor.

    const historicoSeguro = Array.isArray(historico)

      ? historico

          .filter(

            (item) =>

              item &&

              ["usuario", "assistente"].includes(

                item.autor

              ) &&

              typeof item.texto === "string" &&

              item.texto.trim()

          )

          .slice(-10)

          .map((item) => ({

            autor: item.autor,

            texto: item.texto.trim().slice(0, 1500),

          }))

      : [];

    // Gemini é o provedor padrão.

    // A OpenAI só será usada se for explicitamente configurada.

    const provedor = (

      process.env.ASSISTANT_PROVIDER || "gemini"

    )

      .trim()

      .toLowerCase();

    let resposta;

    if (provedor === "gemini") {

      if (!process.env.GEMINI_API_KEY) {

        return res.status(503).json({

          erro: "A chave do Gemini não está configurada.",

        });

      }

      resposta = await gerarRespostaAssistenteGemini({

        pergunta: pergunta.trim(),

        contexto,

        historico: historicoSeguro,

      });

    } else if (provedor === "openai") {

      if (!process.env.OPENAI_API_KEY) {

        return res.status(503).json({

          erro: "A chave da OpenAI não está configurada.",

        });

      }

      resposta = await gerarRespostaAssistente({

        pergunta: pergunta.trim(),

        contexto,

      });

    } else {

      return res.status(500).json({

        erro: "Provedor inválido. Utilize gemini ou openai.",

      });

    }

    return res.json({ resposta });

  } catch (erro) {

    console.error(

      "Erro ao gerar resposta do Assistente:",

      erro.message

    );

    return res.status(502).json({

      erro:

        "Não foi possível obter uma resposta do Assistente. Tente novamente em instantes.",

    });

  }

});

// ========================================

// INICIA O SERVIDOR

// ========================================

app.listen(PORT, () => {

  console.log(

    `Servidor rodando em http://localhost:${PORT}`

  );

});
