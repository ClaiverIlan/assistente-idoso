const express = require("express");

const router = express.Router();

const {
  listarCuidadores,
  atualizarCuidador,
  excluirCuidador,
  cadastrarCuidador,
} = require("../controllers/cuidadores.controller");

// ========================================
// ROTAS DE CUIDADORES
// ========================================

// Listar cuidadores
router.get("/", listarCuidadores);

// Atualizar cuidador
router.put("/:id", atualizarCuidador);

// Excluir cuidador
router.delete("/:id", excluirCuidador);

// Cadastrar cuidador
router.post("/", cadastrarCuidador);

module.exports = router;