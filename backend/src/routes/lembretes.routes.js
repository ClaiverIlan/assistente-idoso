const express = require("express");

const router = express.Router();

const {
  listarLembretes,
  atualizarVisualizacao,
  atualizarAdministracao,
  cadastrarLembrete,
  atualizarLembrete,
  excluirLembrete,
  listarHistoricoLembretes,
} = require("../controllers/lembretes.controller");

// ========================================
// ROTAS DE LEMBRETES
// ========================================

// Listar lembretes e gerar os próximos sete dias
router.get("/lembretes", listarLembretes);

// Atualizar visualização do lembrete
router.patch(
  "/lembretes/:id/visualizacao",
  atualizarVisualizacao
);

// Confirmar ou desfazer administração
router.patch(
  "/lembretes/:id/administracao",
  atualizarAdministracao
);

// Cadastrar lembrete
router.post("/lembretes", cadastrarLembrete);

// Atualizar lembrete
router.put("/lembretes/:id", atualizarLembrete);

// Excluir lembrete
router.delete("/lembretes/:id", excluirLembrete);

// ========================================
// HISTÓRICO DE LEMBRETES
// ========================================

// Consultar histórico dos últimos 90 dias de um idoso
router.get(
  "/idosos/:idosoId/lembretes/historico",
  listarHistoricoLembretes
);

module.exports = router;