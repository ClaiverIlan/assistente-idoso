const db = require("../config/database");

// ========================================
// LISTAR CUIDADORES
// ========================================

function listarCuidadores(req, res) {
  try {
    const cuidadores = db
      .prepare('SELECT * FROM "CUIDADOR"')
      .all();

    res.json(cuidadores);

  } catch (erro) {
    console.error("Erro ao consultar cuidadores:", erro);

    res.status(500).json({
      erro: "Erro ao consultar cuidadores.",
    });
  }
}

// ========================================
// ATUALIZAR CUIDADOR
// ========================================

function atualizarCuidador(req, res) {
  try {
    const { id } = req.params;
    const { Nome, Email, Tipo } = req.body;

    if (!Nome || !Email || !Tipo) {
      return res.status(400).json({
        erro: "Nome, Email e Tipo são obrigatórios.",
      });
    }

    const resultado = db
      .prepare(`
        UPDATE "CUIDADOR"
        SET
          "Nome" = ?,
          "Email" = ?,
          "Tipo" = ?
        WHERE "Id" = ?
      `)
      .run(Nome, Email, Tipo, id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Cuidador não encontrado.",
      });
    }

    res.json({
      mensagem: "Cuidador atualizado com sucesso.",
      Id: Number(id),
      Nome,
      Email,
      Tipo,
    });

  } catch (erro) {
    console.error("Erro ao atualizar cuidador:", erro);

    res.status(500).json({
      erro: "Erro ao atualizar o cuidador.",
    });
  }
}

// ========================================
// EXCLUIR CUIDADOR
// ========================================

function excluirCuidador(req, res) {
  try {
    const { id } = req.params;

    const resultado = db
      .prepare(`
        DELETE FROM "CUIDADOR"
        WHERE "Id" = ?
      `)
      .run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Cuidador não encontrado.",
      });
    }

    res.json({
      mensagem: "Cuidador excluído com sucesso.",
      Id: Number(id),
    });

  } catch (erro) {
    console.error("Erro ao excluir cuidador:", erro);

    res.status(500).json({
      erro: "Erro ao excluir o cuidador.",
    });
  }
}

// ========================================
// CADASTRAR CUIDADOR
// ========================================

function cadastrarCuidador(req, res) {
  try {
    const { Nome, Email, Tipo } = req.body;

    if (!Nome || !Email || !Tipo) {
      return res.status(400).json({
        erro: "Nome, Email e Tipo são obrigatórios.",
      });
    }

    const emailNormalizado = Email.trim();

    // Verifica se já existe um cuidador com esse e-mail.
    const cuidadorExistente = db
      .prepare(`
        SELECT "Id"
        FROM "CUIDADOR"
        WHERE LOWER(TRIM("Email")) = LOWER(TRIM(?))
        LIMIT 1
      `)
      .get(emailNormalizado);

    if (cuidadorExistente) {
      return res.status(409).json({
        erro: "Já existe um cuidador cadastrado com esse e-mail.",
      });
    }

    const resultado = db
      .prepare(`
        INSERT INTO "CUIDADOR" ("Nome", "Email", "Tipo")
        VALUES (?, ?, ?)
      `)
      .run(Nome, emailNormalizado, Tipo);

    res.status(201).json({
      mensagem: "Cuidador cadastrado com sucesso.",
      Id: Number(resultado.lastInsertRowid),
      Nome,
      Email: emailNormalizado,
      Tipo,
    });

  } catch (erro) {
    console.error("Erro ao cadastrar cuidador:", erro);

    res.status(500).json({
      erro: "Erro ao cadastrar o cuidador.",
    });
  }
}

// ========================================
// EXPORTAR FUNÇÕES
// ========================================

module.exports = {
  listarCuidadores,
  atualizarCuidador,
  excluirCuidador,
  cadastrarCuidador,
};