const db = require("../config/database");

const {
  validarAgenda,
  salvarAgendaMedicamento,
  buscarAgendaMedicamento,
  agendaMedicamentoFoiAlterada,
} = require("../services/medicamentos.service");

const {
  obterDataHoraAtualFortaleza,
  gerarLembretesProximosSeteDias,
} = require("../services/lembretes.service");

// ========================================
// LISTAR MEDICAMENTOS
// ========================================

function listarMedicamentos(req, res) {
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
}

// ========================================
// CONSULTAR AGENDA DO MEDICAMENTO
// ========================================

function consultarAgendaMedicamento(req, res) {
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
}

// ========================================
// CADASTRAR MEDICAMENTO
// ========================================

function cadastrarMedicamento(req, res) {
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

      medicamentoId = Number(resultado.lastInsertRowid);

      if (recebeuAgenda) {
        salvarAgendaMedicamento(medicamentoId, agenda);

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
          Id: Number(resultadoLembrete.lastInsertRowid),
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
}

// ========================================
// ATUALIZAR MEDICAMENTO E SUA AGENDA
// ========================================

function atualizarMedicamento(req, res) {
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
}

// ========================================
// DESATIVAR MEDICAMENTO
// ========================================

function desativarMedicamento(req, res) {
  try {
    const { id } = req.params;

    const medicamento = db
      .prepare(`
        SELECT "Id", "Ativo"
        FROM "MEDICAMENTO"
        WHERE "Id" = ?
        LIMIT 1
      `)
      .get(id);

    if (!medicamento || Number(medicamento.Ativo) !== 1) {
      return res.status(404).json({
        erro: "Medicamento não encontrado ou já desativado.",
      });
    }

    const dataHoraAtual = obterDataHoraAtualFortaleza();

    db.exec("BEGIN");

    let lembretesRemovidos = 0;

    try {
      // Desativa o medicamento.
      db.prepare(`
        UPDATE "MEDICAMENTO"
        SET "Ativo" = 0
        WHERE "Id" = ?
      `).run(id);

      // Remove somente lembretes futuros não administrados.
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

      // Consulta quantos registros ainda pertencem ao medicamento.
      // A agenda e os registros históricos são preservados.

      db.exec("COMMIT");

    } catch (erroTransacao) {
      db.exec("ROLLBACK");
      throw erroTransacao;
    }

    res.json({
      mensagem:
        "Medicamento desativado. Lembretes futuros pendentes removidos e histórico preservado.",
      Id: Number(id),
      Ativo: 0,
    });

  } catch (erro) {
    console.error("Erro ao desativar medicamento:", erro);

    res.status(500).json({
      erro: "Erro ao desativar o medicamento.",
    });
  }
}

// ========================================
// EXPORTAR FUNÇÕES
// ========================================

module.exports = {
  listarMedicamentos,
  consultarAgendaMedicamento,
  cadastrarMedicamento,
  atualizarMedicamento,
  desativarMedicamento,
};