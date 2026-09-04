const express = require("express");
const cors = require("cors");
const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const app = express();

const PORT = 3000;

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Permite receber requisições do frontend
app.use(cors());

// Permite trabalhar com JSON
app.use(express.json());

// Localização do banco SQLite
const dbPath = path.join(__dirname, "../../assistente-idoso.db");

// Abre o banco existente
const db = new DatabaseSync(dbPath);

console.log("Banco SQLite conectado com sucesso!");

// Rota inicial
app.get("/", (req, res) => {
    res.send("Backend do Assistente de Cuidado funcionando!");
});

// Teste da conexão com o banco
app.get("/api/teste-banco", (req, res) => {
    try {
        const resultado = db.prepare("SELECT * FROM CUIDADOR").all();

        res.json(resultado);
    } catch (erro) {
        console.error("Erro ao consultar o banco:", erro);

        res.status(500).json({
            erro: "Erro ao consultar o banco de dados."
        });
    }
});

// Lista todos os cuidadores
app.get("/api/cuidadores", (req, res) => {
    try {
        const cuidadores = db.prepare("SELECT * FROM CUIDADOR").all();

        res.json(cuidadores);
    } catch (erro) {
        console.error("Erro ao consultar cuidadores:", erro);

        res.status(500).json({
            erro: "Erro ao consultar os cuidadores."
        });
    }
});

// Atualiza um cuidador existente
app.put("/api/cuidadores/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { Nome, Email, Tipo } = req.body;

    if (!Nome || !Email || !Tipo) {
      return res.status(400).json({
        erro: "Nome, Email e Tipo são obrigatórios."
      });
    }

    const resultado = db.prepare(`
      UPDATE "CUIDADOR"
      SET "Nome" = ?, "Email" = ?, "Tipo" = ?
      WHERE "Id" = ?
    `).run(
      Nome,
      Email,
      Tipo,
      id
    );

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Cuidador não encontrado."
      });
    }

    res.json({
      mensagem: "Cuidador atualizado com sucesso.",
      Id: Number(id),
      Nome,
      Email,
      Tipo
    });
  } catch (erro) {
    console.error("Erro ao atualizar cuidador:", erro);

    res.status(500).json({
      erro: "Erro ao atualizar o cuidador."
    });
  }
});


// Exclui um cuidador existente
app.delete("/api/cuidadores/:id", (req, res) => {
  try {
    const { id } = req.params;

    const resultado = db.prepare(`
      DELETE FROM "CUIDADOR"
      WHERE "Id" = ?
    `).run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Cuidador não encontrado."
      });
    }

    res.json({
      mensagem: "Cuidador excluído com sucesso.",
      Id: Number(id)
    });
  } catch (erro) {
    console.error("Erro ao excluir cuidador:", erro);

    res.status(500).json({
      erro: "Erro ao excluir o cuidador."
    });
  }
});

// Cadastra um novo cuidador
app.post("/api/cuidadores", (req, res) => {
    try {
        const { Nome, Email, Tipo } = req.body;

        if (!Nome || !Email || !Tipo) {
            return res.status(400).json({
                erro: "Nome, Email e Tipo são obrigatórios."
            });
        }

        const resultado = db.prepare(`
            INSERT INTO CUIDADOR (Nome, Email, Tipo)
            VALUES (?, ?, ?)
        `).run(Nome, Email, Tipo);

        res.status(201).json({
            mensagem: "Cuidador cadastrado com sucesso.",
            Id: Number(resultado.lastInsertRowid),
            Nome,
            Email,
            Tipo
        });
    } catch (erro) {
        console.error("Erro ao cadastrar cuidador:", erro);

        res.status(500).json({
            erro: "Erro ao cadastrar o cuidador."
        });
    }
});

// Lista todos os idosos
app.get("/api/idosos", (req, res) => {
    try {
        const idosos = db.prepare("SELECT * FROM IDOSO").all();

        res.json(idosos);
    } catch (erro) {
        console.error("Erro ao consultar idosos:", erro);

        res.status(500).json({
            erro: "Erro ao consultar os idosos."
        });
    }
});

// Cadastra um novo idoso
app.post("/api/idosos", (req, res) => {
  try {
    const {
      Cuidador_Id,
      Nome,
      "Data Nascimento": DataNascimento,
      Observacoes
    } = req.body;

    if (!Cuidador_Id || !Nome) {
      return res.status(400).json({
        erro: "Cuidador_Id e Nome são obrigatórios."
      });
    }

    const resultado = db.prepare(`
      INSERT INTO "IDOSO"
      ("Cuidador_Id", "Nome", "Data Nascimento", "Observacoes")
      VALUES (?, ?, ?, ?)
    `).run(
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
      Observacoes
    });
  } catch (erro) {
    console.error("Erro ao cadastrar idoso:", erro);

    res.status(500).json({
      erro: "Erro ao cadastrar o idoso."
    });
  }
});

// Atualiza um idoso existente
app.put("/api/idosos/:id", (req, res) => {
  try {
    const { id } = req.params;

    const {
      Cuidador_Id,
      Nome,
      "Data Nascimento": DataNascimento,
      Observacoes
    } = req.body;

    if (!Cuidador_Id || !Nome) {
      return res.status(400).json({
        erro: "Cuidador_Id e Nome são obrigatórios."
      });
    }

    const resultado = db.prepare(`
      UPDATE "IDOSO"
      SET
        "Cuidador_Id" = ?,
        "Nome" = ?,
        "Data Nascimento" = ?,
        "Observacoes" = ?
      WHERE "Id" = ?
    `).run(
      Cuidador_Id,
      Nome,
      DataNascimento,
      Observacoes,
      id
    );

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Idoso não encontrado."
      });
    }

    res.json({
      mensagem: "Idoso atualizado com sucesso.",
      Id: Number(id),
      Cuidador_Id,
      Nome,
      "Data Nascimento": DataNascimento,
      Observacoes
    });
  } catch (erro) {
    console.error("Erro ao atualizar idoso:", erro);

    res.status(500).json({
      erro: "Erro ao atualizar o idoso."
    });
  }
});

// Exclui um idoso existente
app.delete("/api/idosos/:id", (req, res) => {
  try {
    const { id } = req.params;

    const resultado = db.prepare(`
      DELETE FROM "IDOSO"
      WHERE "Id" = ?
    `).run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Idoso não encontrado."
      });
    }

    res.json({
      mensagem: "Idoso excluído com sucesso.",
      Id: Number(id)
    });
  } catch (erro) {
    console.error("Erro ao excluir idoso:", erro);

    res.status(500).json({
      erro: "Erro ao excluir o idoso."
    });
  }
});

// Lista todos os medicamentos
app.get("/api/medicamentos", (req, res) => {
    try {
        const medicamentos = db.prepare("SELECT * FROM MEDICAMENTO").all();

        res.json(medicamentos);
    } catch (erro) {
        console.error("Erro ao consultar medicamentos:", erro);

        res.status(500).json({
            erro: "Erro ao consultar os medicamentos."
        });
    }
});

// Cadastra um novo medicamento
app.post("/api/medicamentos", (req, res) => {
  try {
    const {
      Idoso_Id,
      Nome,
      Dosagem,
      Horario,
      Frequencia,
      Observacoes
    } = req.body;

    if (!Idoso_Id || !Nome) {
      return res.status(400).json({
        erro: "Idoso_Id e Nome são obrigatórios."
      });
    }

    const resultado = db.prepare(`
      INSERT INTO "MEDICAMENTO"
      ("Idoso_Id", "Nome", "Dosagem", "Horario", "Frequencia", "Observacoes")
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      Idoso_Id,
      Nome,
      Dosagem,
      Horario,
      Frequencia,
      Observacoes
    );

    res.status(201).json({
      mensagem: "Medicamento cadastrado com sucesso.",
      Id: Number(resultado.lastInsertRowid),
      Idoso_Id,
      Nome,
      Dosagem,
      Horario,
      Frequencia,
      Observacoes
    });
  } catch (erro) {
    console.error("Erro ao cadastrar medicamento:", erro);

    res.status(500).json({
      erro: "Erro ao cadastrar o medicamento."
    });
  }
});

// Atualiza um medicamento existente
app.put("/api/medicamentos/:id", (req, res) => {
  try {
    const { id } = req.params;

    const {
      Idoso_Id,
      Nome,
      Dosagem,
      Horario,
      Frequencia,
      Observacoes
    } = req.body;

    if (!Idoso_Id || !Nome) {
      return res.status(400).json({
        erro: "Idoso_Id e Nome são obrigatórios."
      });
    }

    const resultado = db.prepare(`
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
      Dosagem,
      Horario,
      Frequencia,
      Observacoes,
      id
    );

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Medicamento não encontrado."
      });
    }

    res.json({
      mensagem: "Medicamento atualizado com sucesso.",
      Id: Number(id),
      Idoso_Id,
      Nome,
      Dosagem,
      Horario,
      Frequencia,
      Observacoes
    });
  } catch (erro) {
    console.error("Erro ao atualizar medicamento:", erro);

    res.status(500).json({
      erro: "Erro ao atualizar o medicamento."
    });
  }
});


// Exclui um medicamento existente
app.delete("/api/medicamentos/:id", (req, res) => {
  try {
    const { id } = req.params;

    const resultado = db.prepare(`
      DELETE FROM "MEDICAMENTO"
      WHERE "Id" = ?
    `).run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Medicamento não encontrado."
      });
    }

    res.json({
      mensagem: "Medicamento excluído com sucesso.",
      Id: Number(id)
    });
  } catch (erro) {
    console.error("Erro ao excluir medicamento:", erro);

    res.status(500).json({
      erro: "Erro ao excluir o medicamento."
    });
  }
});

// Lista todas as ocorrências
app.get("/api/ocorrencias", (req, res) => {
    try {
        const ocorrencias = db.prepare("SELECT * FROM OCORRENCIA").all();

        res.json(ocorrencias);
    } catch (erro) {
        console.error("Erro ao consultar ocorrências:", erro);

        res.status(500).json({
            erro: "Erro ao consultar as ocorrências."
        });
    }
});

// Cadastra uma nova ocorrência
app.post("/api/ocorrencias", (req, res) => {
  try {
    const {
      Idoso_Id,
      Tipo,
      "Descrição": Descricao,
      Data_Hora
    } = req.body;

    if (!Idoso_Id || !Tipo || !Descricao || !Data_Hora) {
      return res.status(400).json({
        erro: "Idoso_Id, Tipo, Descrição e Data_Hora são obrigatórios."
      });
    }

    const resultado = db.prepare(`
      INSERT INTO "OCORRENCIA"
      ("Idoso_Id", "Tipo", "Descrição", "Data_Hora")
      VALUES (?, ?, ?, ?)
    `).run(
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
      Data_Hora
    });
  } catch (erro) {
    console.error("Erro ao cadastrar ocorrência:", erro);

    res.status(500).json({
      erro: "Erro ao cadastrar a ocorrência."
    });
  }
});

// Atualiza uma ocorrência existente
app.put("/api/ocorrencias/:id", (req, res) => {
  try {
    const { id } = req.params;

    const {
      Idoso_Id,
      Tipo,
      "Descrição": Descricao,
      Data_Hora
    } = req.body;

    if (!Idoso_Id || !Tipo || !Descricao || !Data_Hora) {
      return res.status(400).json({
        erro: "Idoso_Id, Tipo, Descrição e Data_Hora são obrigatórios."
      });
    }

    const resultado = db.prepare(`
      UPDATE "OCORRENCIA"
      SET
        "Idoso_Id" = ?,
        "Tipo" = ?,
        "Descrição" = ?,
        "Data_Hora" = ?
      WHERE "Id" = ?
    `).run(
      Idoso_Id,
      Tipo,
      Descricao,
      Data_Hora,
      id
    );

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Ocorrência não encontrada."
      });
    }

    res.json({
      mensagem: "Ocorrência atualizada com sucesso.",
      Id: Number(id),
      Idoso_Id,
      Tipo,
      "Descrição": Descricao,
      Data_Hora
    });
  } catch (erro) {
    console.error("Erro ao atualizar ocorrência:", erro);

    res.status(500).json({
      erro: "Erro ao atualizar a ocorrência."
    });
  }
});

// Exclui uma ocorrência existente
app.delete("/api/ocorrencias/:id", (req, res) => {
  try {
    const { id } = req.params;

    const resultado = db.prepare(`
      DELETE FROM "OCORRENCIA"
      WHERE "Id" = ?
    `).run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Ocorrência não encontrada."
      });
    }

    res.json({
      mensagem: "Ocorrência excluída com sucesso.",
      Id: Number(id)
    });
  } catch (erro) {
    console.error("Erro ao excluir ocorrência:", erro);

    res.status(500).json({
      erro: "Erro ao excluir a ocorrência."
    });
  }
});

// Lista todos os lembretes
app.get("/api/lembretes", (req, res) => {
    try {
        const lembretes = db.prepare("SELECT * FROM LEMBRETE").all();

        res.json(lembretes);
    } catch (erro) {
        console.error("Erro ao consultar lembretes:", erro);

        res.status(500).json({
            erro: "Erro ao consultar os lembretes."
        });
    }
});

// Cadastra um novo lembrete
app.post("/api/lembretes", (req, res) => {
  try {
    const {
      Medicamento_Id,
      Data_Hora,
      Status
    } = req.body;

    if (!Medicamento_Id || !Data_Hora || !Status) {
      return res.status(400).json({
        erro: "Medicamento_Id, Data_Hora e Status são obrigatórios."
      });
    }

    const resultado = db.prepare(`
      INSERT INTO "LEMBRETE"
      ("Medicamento_Id", "Data_Hora", "Status")
      VALUES (?, ?, ?)
    `).run(
      Medicamento_Id,
      Data_Hora,
      Status
    );

    res.status(201).json({
      mensagem: "Lembrete cadastrado com sucesso.",
      Id: Number(resultado.lastInsertRowid),
      Medicamento_Id,
      Data_Hora,
      Status
    });
  } catch (erro) {
    console.error("Erro ao cadastrar lembrete:", erro);

    res.status(500).json({
      erro: "Erro ao cadastrar o lembrete."
    });
  }
});

// Atualiza um lembrete existente
app.put("/api/lembretes/:id", (req, res) => {
  try {
    const { id } = req.params;
    const {
      Medicamento_Id,
      Data_Hora,
      Status
    } = req.body;

    if (!Medicamento_Id || !Data_Hora || !Status) {
      return res.status(400).json({
        erro: "Medicamento_Id, Data_Hora e Status são obrigatórios."
      });
    }

    const resultado = db.prepare(`
      UPDATE "LEMBRETE"
      SET
        "Medicamento_Id" = ?,
        "Data_Hora" = ?,
        "Status" = ?
      WHERE "Id" = ?
    `).run(
      Medicamento_Id,
      Data_Hora,
      Status,
      id
    );

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Lembrete não encontrado."
      });
    }

    res.json({
      mensagem: "Lembrete atualizado com sucesso.",
      Id: Number(id),
      Medicamento_Id,
      Data_Hora,
      Status
    });
  } catch (erro) {
    console.error("Erro ao atualizar lembrete:", erro);

    res.status(500).json({
      erro: "Erro ao atualizar o lembrete."
    });
  }
});

// Exclui um lembrete existente
app.delete("/api/lembretes/:id", (req, res) => {
  try {
    const { id } = req.params;

    const resultado = db.prepare(`
      DELETE FROM "LEMBRETE"
      WHERE "Id" = ?
    `).run(id);

    if (resultado.changes === 0) {
      return res.status(404).json({
        erro: "Lembrete não encontrado."
      });
    }

    res.json({
      mensagem: "Lembrete excluído com sucesso.",
      Id: Number(id)
    });
  } catch (erro) {
    console.error("Erro ao excluir lembrete:", erro);

    res.status(500).json({
      erro: "Erro ao excluir o lembrete."
    });
  }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});