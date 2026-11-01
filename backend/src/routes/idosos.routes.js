const express = require("express");

const router = express.Router();

const {
  listarIdosos,
  cadastrarIdoso,
  atualizarIdoso,
  excluirIdoso,
} = require("../controllers/idosos.controller");

// ========================================
// ROTAS DE IDOSOS
// ========================================

// Listar idosos
router.get("/", listarIdosos);

// Cadastrar idoso
router.post("/", cadastrarIdoso);

// Atualizar idoso
router.put("/:id", atualizarIdoso);

// Excluir idoso e seus dados relacionados
router.delete("/:id", excluirIdoso);

module.exports = router;