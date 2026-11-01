const express = require("express");

const router = express.Router();

const {
  listarOcorrencias,
  cadastrarOcorrencia,
  atualizarOcorrencia,
  excluirOcorrencia,
} = require("../controllers/ocorrencias.controller");

// ========================================
// ROTAS DE OCORRÊNCIAS
// ========================================

// Listar ocorrências
router.get("/", listarOcorrencias);

// Cadastrar ocorrência
router.post("/", cadastrarOcorrencia);

// Atualizar ocorrência
router.put("/:id", atualizarOcorrencia);

// Excluir ocorrência
router.delete("/:id", excluirOcorrencia);

module.exports = router;