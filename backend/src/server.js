const express = require("express");
const cors = require("cors");
const db = require("./config/database");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// ========================================
// IMPORTAÇÃO DAS ROTAS
// ========================================

const cuidadoresRoutes = require("./routes/cuidadores.routes");
const idososRoutes = require("./routes/idosos.routes");
const medicamentosRoutes = require("./routes/medicamentos.routes");
const ocorrenciasRoutes = require("./routes/ocorrencias.routes");
const lembretesRoutes = require("./routes/lembretes.routes");
const assistenteRoutes = require("./routes/assistente.routes");
const {
  iniciarAgendadorLembretes,
} = require("./jobs/lembretes.job");

// ========================================
// CONFIGURAÇÃO DO EXPRESS
// ========================================

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ========================================
// DOCUMENTAÇÃO SWAGGER
// ========================================

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// ========================================
// REGISTRO DAS ROTAS
// ========================================

app.use("/api/cuidadores", cuidadoresRoutes);

app.use("/api/idosos", idososRoutes);

app.use("/api/medicamentos", medicamentosRoutes);

app.use("/api/ocorrencias", ocorrenciasRoutes);

app.use("/api/assistente", assistenteRoutes);

// O módulo de lembretes contém:
// /api/lembretes
// /api/idosos/:idosoId/lembretes/historico

app.use("/api", lembretesRoutes);

// ========================================
// ROTA INICIAL
// ========================================

app.get("/", (req, res) => {
  res.send("Backend do Assistente de Cuidado funcionando!");
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
// INICIAR SERVIDOR
// ========================================

app.listen(PORT, () => {
  console.log("Banco SQLite conectado com sucesso!");

  console.log(
    `Servidor rodando em http://localhost:${PORT}`
  );

  iniciarAgendadorLembretes();
});