const {
  buscarContextoIdoso,
} = require("../services/assistente.service");

const {
  gerarRespostaAssistente,
} = require("../services/openai");

const {
  gerarRespostaAssistenteGemini,
} = require("../services/gemini");

// ========================================
// MONTAR CONTEXTO DO ASSISTENTE
// ========================================

function montarContextoAssistente(req, res) {
  try {
    const { idosoId, pergunta } = req.body;

    if (!idosoId || !pergunta) {
      return res.status(400).json({
        erro: "idosoId e pergunta são obrigatórios.",
      });
    }

    const contexto = buscarContextoIdoso(idosoId);

    if (!contexto) {
      return res.status(404).json({
        erro: "Idoso não encontrado.",
      });
    }

    res.json({
      pergunta,
      contexto,
    });

  } catch (erro) {
    console.error(
      "Erro ao montar contexto do Assistente:",
      erro
    );

    res.status(500).json({
      erro: "Erro ao montar o contexto do Assistente.",
    });
  }
}

// ========================================
// CONVERSA COM O ASSISTENTE
// ========================================

async function conversarComAssistente(req, res) {
  try {
    const {
      idosoId,
      pergunta,
      historico = [],
    } = req.body;

    if (
      typeof pergunta !== "string" ||
      !pergunta.trim()
    ) {
      return res.status(400).json({
        erro: "A pergunta é obrigatória.",
      });
    }

    // O contexto do idoso é opcional para perguntas gerais.
    let contexto = null;

    if (
      idosoId !== undefined &&
      idosoId !== null &&
      String(idosoId).trim() !== ""
    ) {
      const idosoIdNumerico = Number(idosoId);

      if (
        !Number.isInteger(idosoIdNumerico) ||
        idosoIdNumerico <= 0
      ) {
        return res.status(400).json({
          erro: "O idoso informado é inválido.",
        });
      }

      contexto = buscarContextoIdoso(idosoIdNumerico);

      if (!contexto) {
        return res.status(404).json({
          erro: "Idoso não encontrado.",
        });
      }
    }

    // Valida o histórico e limita o tamanho
    // do conteúdo enviado ao provedor.
    const historicoSeguro = Array.isArray(historico)
      ? historico
          .filter(
            (item) =>
              item &&
              ["usuario", "assistente"].includes(item.autor) &&
              typeof item.texto === "string" &&
              item.texto.trim()
          )
          .slice(-10)
          .map((item) => ({
            autor: item.autor,
            texto: item.texto.trim().slice(0, 1500),
          }))
      : [];

    // Gemini é o provedor padrão.
    // OpenAI só será utilizada se estiver explicitamente configurada.
    const provedor = (
      process.env.ASSISTANT_PROVIDER || "gemini"
    )
      .trim()
      .toLowerCase();

    let resposta;

    if (provedor === "gemini") {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(503).json({
          erro: "A chave do Gemini não está configurada.",
        });
      }

      resposta = await gerarRespostaAssistenteGemini({
        pergunta: pergunta.trim(),
        contexto,
        historico: historicoSeguro,
      });

    } else if (provedor === "openai") {
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({
          erro: "A chave da OpenAI não está configurada.",
        });
      }

      resposta = await gerarRespostaAssistente({
        pergunta: pergunta.trim(),
        contexto,
      });

    } else {
      return res.status(500).json({
        erro: "Provedor inválido. Utilize gemini ou openai.",
      });
    }

    return res.json({ resposta });

  } catch (erro) {
    console.error(
      "Erro ao gerar resposta do Assistente:",
      erro.message
    );

    return res.status(502).json({
      erro:
        "Não foi possível obter uma resposta do Assistente. Tente novamente em instantes.",
    });
  }
}

// ========================================
// EXPORTAR FUNÇÕES
// ========================================

module.exports = {
  montarContextoAssistente,
  conversarComAssistente,
};