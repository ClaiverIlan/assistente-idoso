const express = require("express");

const router = express.Router();

const {
  montarContextoAssistente,
  conversarComAssistente,
} = require("../controllers/assistente.controller");

// ========================================
// ROTAS DO ASSISTENTE
// ========================================

// Montar contexto do idoso
router.post("/contexto", montarContextoAssistente);

// Conversar com o Assistente
router.post("/", conversarComAssistente);

module.exports = router;