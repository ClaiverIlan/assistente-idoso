const db = require("../config/database");

// ========================================
// LISTAR OCORRÊNCIAS
// ========================================

function listarOcorrencias(req, res) {
  try {
    const ocorrencias = db
      .prepare('SELECT * FROM "OCORRENCIA"')
      .all();

    res.json(ocorrencias);

  } catch (erro) {
    console.error("Erro ao consultar ocorrências:", erro);

    res.status(500).json({
      erro: "Erro ao consultar as ocorrências.",
    });
  }
}

// ========================================
// CADASTRAR OCORRÊNCIA
// ========================================

function cadastrarOcorrencia(req, res) {
  try {
    const {
      Idoso_Id,
      Tipo,
      "Descrição": Descricao,
      Data_Hora,
    } = req.body;

    if (
      !Idoso_Id ||
      !Tipo ||
      !Descricao ||
      !Data_Hora
    ) {
      return res.status(400).json({
        erro:
          "Idoso_Id, Tipo, Descrição e Data_Hora são obrigatórios.",
      });
    }

    const resultado = db
      .prepare(`
        INSERT INTO "OCORRENCIA"
        ("Idoso_Id", "Tipo", "Descrição", "Data_Hora")
        VALUES (?, ?, ?, ?)
      `)
      .run(
        Idoso_Id,
        Tipo,
        Descricao,
        Data_Hora
      );

    res.status(201).json({
      mensagem: "Ocorrência cadastrada com sucesso.",
      Id: Number(resultado.lastInsertRowid),
      Idoso_Id,
      Tipo,
      "Descrição": Descricao,
      Data_Hora,
    });

  } catch (erro) {
    console.error("Erro ao cadastrar ocorrência:", erro);

    res.status(500).json({
      erro: "Erro ao cadastrar a ocorrência.",
    });
  }
}

// ========================================
// ATUALIZAR OCORRÊNCIA
// ========================================

function atualizarOcorrencia(req, res) {
  try {
    const { id } = req.params;

    const {
      Idoso_Id,
      Tipo,
      "Descrição": Descricao,
      Data_Hora,
    } = req.body;

    if (
      !Idoso_Id ||
      !Tipo ||
      !Descricao ||
      !Data_Hora
    ) {
      return res.status(400).json({
        erro:
          "Idoso_Id, Tipo, Descrição e Data_Hora são obrigatórios.",
      });
    }

    const resultado = db
      .prepare(`
        UPDATE "OCORRENCIA"
        SET
          "Idoso_Id" = ?,
          "Tipo" = ?,
          "Descrição" = ?,
          "Data_Hora" = ?
        WHERE "Id" = ?
      `)
      .run(
        Idoso_Id,
        Tipo,
        Descricao,
        Data_Hora,
        id
      );

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Ocorrência não encontrada.",
      });
    }

    res.json({
      mensagem: "Ocorrência atualizada com sucesso.",
      Id: Number(id),
      Idoso_Id,
      Tipo,
      "Descrição": Descricao,
      Data_Hora,
    });

  } catch (erro) {
    console.error("Erro ao atualizar ocorrência:", erro);

    res.status(500).json({
      erro: "Erro ao atualizar a ocorrência.",
    });
  }
}

// ========================================
// EXCLUIR OCORRÊNCIA
// ========================================

function excluirOcorrencia(req, res) {
  try {
    const { id } = req.params;

    const resultado = db
      .prepare(`
        DELETE FROM "OCORRENCIA"
        WHERE "Id" = ?
      `)
      .run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Ocorrência não encontrada.",
      });
    }

    res.json({
      mensagem: "Ocorrência excluída com sucesso.",
      Id: Number(id),
    });

  } catch (erro) {
    console.error("Erro ao excluir ocorrência:", erro);

    res.status(500).json({
      erro: "Erro ao excluir a ocorrência.",
    });
  }
}

// ========================================
// EXPORTAR FUNÇÕES
// ========================================

module.exports = {
  listarOcorrencias,
  cadastrarOcorrencia,
  atualizarOcorrencia,
  excluirOcorrencia,
};