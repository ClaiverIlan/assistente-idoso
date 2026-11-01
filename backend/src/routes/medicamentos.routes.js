const express = require("express");

const router = express.Router();

const {
  listarMedicamentos,
  consultarAgendaMedicamento,
  cadastrarMedicamento,
  atualizarMedicamento,
  desativarMedicamento,
} = require("../controllers/medicamentos.controller");

// ========================================
// ROTAS DE MEDICAMENTOS
// ========================================

// Listar medicamentos
router.get("/", listarMedicamentos);

// Consultar agenda de um medicamento
router.get("/:id/agenda", consultarAgendaMedicamento);

// Cadastrar medicamento
router.post("/", cadastrarMedicamento);

// Atualizar medicamento e sua agenda
router.put("/:id", atualizarMedicamento);

// Desativar medicamento
router.delete("/:id", desativarMedicamento);

module.exports = router;