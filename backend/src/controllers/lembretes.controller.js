const db = require("../config/database");

const {
  obterDataAtualFortaleza,
  obterDataHoraAtualFortaleza,
  gerarLembretesProximosSeteDias,
} = require("../services/lembretes.service");

// ========================================
// LISTAR LEMBRETES
// ========================================

function listarLembretes(req, res) {
  try {
    gerarLembretesProximosSeteDias();

    const lembretes = db
      .prepare(`
        SELECT *
        FROM "LEMBRETE"
        ORDER BY "Data_Hora" DESC
      `)
      .all();

    res.json(lembretes);

  } catch (erro) {
    console.error("Erro ao consultar ou gerar lembretes:", erro);

    res.status(500).json({
      erro: "Erro ao consultar ou gerar os lembretes.",
    });
  }
}

// ========================================
// ATUALIZAR VISUALIZAÇÃO
// ========================================

function atualizarVisualizacao(req, res) {
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
}

// ========================================
// ADMINISTRAÇÃO DOS MEDICAMENTOS
// ========================================

function atualizarAdministracao(req, res) {
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

    // Identifica o estado atual.
    const statusAtual = String(lembrete.Status || "")
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const jaAdministrado =
      Boolean(lembrete.Administrado_Em) ||
      statusAtual === "realizado" ||
      statusAtual === "concluido";

    // Evita registrar ações repetidas.
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
    console.error("Erro ao atualizar administração:", erro);

    res.status(500).json({
      erro: "Não foi possível atualizar a administração.",
    });
  }
}

// ========================================
// CADASTRAR LEMBRETE
// ========================================

function cadastrarLembrete(req, res) {
  try {
    const {
      Medicamento_Id,
      Data_Hora,
      Status,
    } = req.body;

    if (!Medicamento_Id || !Data_Hora || !Status) {
      return res.status(400).json({
        erro: "Medicamento_Id, Data_Hora e Status são obrigatórios.",
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
    console.error("Erro ao cadastrar lembrete:", erro);

    res.status(500).json({
      erro: "Erro ao cadastrar o lembrete.",
    });
  }
}

// ========================================
// ATUALIZAR LEMBRETE
// ========================================

function atualizarLembrete(req, res) {
  try {
    const { id } = req.params;

    const {
      Medicamento_Id,
      Data_Hora,
      Status,
    } = req.body;

    if (!Medicamento_Id || !Data_Hora || !Status) {
      return res.status(400).json({
        erro: "Medicamento_Id, Data_Hora e Status são obrigatórios.",
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
    console.error("Erro ao atualizar lembrete:", erro);

    res.status(500).json({
      erro: "Erro ao atualizar o lembrete.",
    });
  }
}

// ========================================
// EXCLUIR LEMBRETE
// ========================================

function excluirLembrete(req, res) {
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
    console.error("Erro ao excluir lembrete:", erro);

    res.status(500).json({
      erro: "Erro ao excluir o lembrete.",
    });
  }
}

// ========================================
// HISTÓRICO DE LEMBRETES - ÚLTIMOS 90 DIAS
// ========================================

function listarHistoricoLembretes(req, res) {
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
    // Inclui também medicamentos desativados.
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
        AND SUBSTR("Data_Hora_Programada", 1, 10) >= ?
        AND SUBSTR("Data_Hora_Programada", 1, 10) <= ?
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

// ========================================
// EXPORTAR FUNÇÕES
// ========================================

module.exports = {
  listarLembretes,
  atualizarVisualizacao,
  atualizarAdministracao,
  cadastrarLembrete,
  atualizarLembrete,
  excluirLembrete,
  listarHistoricoLembretes,
};