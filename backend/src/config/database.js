const { DatabaseSync } = require("node:sqlite");
const path = require("path");

// ========================================

// BANCO DE DADOS

// ========================================

const dbPath = path.join(
  __dirname,
  "../../../assistente-idoso.db"
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

// Exporta a conexão para ser utilizada pelas rotas e serviços.
module.exports = db;