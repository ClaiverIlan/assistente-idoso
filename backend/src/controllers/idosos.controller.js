const db = require("../config/database");

// ========================================
// LISTAR IDOSOS
// ========================================

function listarIdosos(req, res) {
  try {
    const idosos = db
      .prepare('SELECT * FROM "IDOSO"')
      .all();

    res.json(idosos);

  } catch (erro) {
    console.error("Erro ao consultar idosos:", erro);

    res.status(500).json({
      erro: "Erro ao consultar os idosos.",
    });
  }
}

// ========================================
// CADASTRAR IDOSO
// ========================================

function cadastrarIdoso(req, res) {
  try {
    const {
      Cuidador_Id,
      Nome,
      "Data Nascimento": DataNascimento,
      Observacoes,
    } = req.body;

    if (!Cuidador_Id || !Nome) {
      return res.status(400).json({
        erro: "Cuidador_Id e Nome são obrigatórios.",
      });
    }

    const resultado = db
      .prepare(`
        INSERT INTO "IDOSO"
        ("Cuidador_Id", "Nome", "Data Nascimento", "Observacoes")
        VALUES (?, ?, ?, ?)
      `)
      .run(
        Cuidador_Id,
        Nome,
        DataNascimento,
        Observacoes
      );

    res.status(201).json({
      mensagem: "Idoso cadastrado com sucesso.",
      Id: Number(resultado.lastInsertRowid),
      Cuidador_Id,
      Nome,
      "Data Nascimento": DataNascimento,
      Observacoes,
    });

  } catch (erro) {
    console.error("Erro ao cadastrar idoso:", erro);

    res.status(500).json({
      erro: "Erro ao cadastrar o idoso.",
    });
  }
}

// ========================================
// ATUALIZAR IDOSO
// ========================================

function atualizarIdoso(req, res) {
  try {
    const { id } = req.params;

    const {
      Cuidador_Id,
      Nome,
      "Data Nascimento": DataNascimento,
      Observacoes,
    } = req.body;

    if (!Cuidador_Id || !Nome) {
      return res.status(400).json({
        erro: "Cuidador_Id e Nome são obrigatórios.",
      });
    }

    const resultado = db
      .prepare(`
        UPDATE "IDOSO"
        SET
          "Cuidador_Id" = ?,
          "Nome" = ?,
          "Data Nascimento" = ?,
          "Observacoes" = ?
        WHERE "Id" = ?
      `)
      .run(
        Cuidador_Id,
        Nome,
        DataNascimento,
        Observacoes,
        id
      );

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Idoso não encontrado.",
      });
    }

    res.json({
      mensagem: "Idoso atualizado com sucesso.",
      Id: Number(id),
      Cuidador_Id,
      Nome,
      "Data Nascimento": DataNascimento,
      Observacoes,
    });

  } catch (erro) {
    console.error("Erro ao atualizar idoso:", erro);

    res.status(500).json({
      erro: "Erro ao atualizar o idoso.",
    });
  }
}

// ========================================
// EXCLUIR IDOSO E DADOS RELACIONADOS
// ========================================

function excluirIdoso(req, res) {
  try {
    const { id } = req.params;

    const idoso = db
      .prepare(`
        SELECT "Id"
        FROM "IDOSO"
        WHERE "Id" = ?
        LIMIT 1
      `)
      .get(id);

    if (!idoso) {
      return res.status(404).json({
        erro: "Idoso não encontrado.",
      });
    }

    db.exec("BEGIN TRANSACTION");

    try {
      // Exclui os lembretes dos medicamentos do idoso.

      db.prepare(`
        DELETE FROM "LEMBRETE"
        WHERE "Medicamento_Id" IN (
          SELECT "Id"
          FROM "MEDICAMENTO"
          WHERE "Idoso_Id" = ?
        )
      `).run(id);

      // Exclui o histórico de administração.

      db.prepare(`
        DELETE FROM "LEMBRETE_HISTORICO"
        WHERE "Idoso_Id" = ?
      `).run(id);

      // Exclui as agendas dos medicamentos.

      db.prepare(`
        DELETE FROM "MEDICAMENTO_AGENDA"
        WHERE "Medicamento_Id" IN (
          SELECT "Id"
          FROM "MEDICAMENTO"
          WHERE "Idoso_Id" = ?
        )
      `).run(id);

      // Exclui os medicamentos.

      db.prepare(`
        DELETE FROM "MEDICAMENTO"
        WHERE "Idoso_Id" = ?
      `).run(id);

      // Exclui as ocorrências.

      db.prepare(`
        DELETE FROM "OCORRENCIA"
        WHERE "Idoso_Id" = ?
      `).run(id);

      // Por último, exclui o idoso.

      db.prepare(`
        DELETE FROM "IDOSO"
        WHERE "Id" = ?
      `).run(id);

      db.exec("COMMIT");

    } catch (erroTransacao) {
      db.exec("ROLLBACK");
      throw erroTransacao;
    }

    res.json({
      mensagem:
        "Idoso e todos os dados relacionados foram excluídos com sucesso.",
      Id: Number(id),
    });

  } catch (erro) {
    console.error("Erro ao excluir idoso:", erro);

    res.status(500).json({
      erro: "Erro ao excluir o idoso.",
    });
  }
}

// ========================================
// EXPORTAR FUNÇÕES
// ========================================

module.exports = {
  listarIdosos,
  cadastrarIdoso,
  atualizarIdoso,
  excluirIdoso,
};