
import { useEffect, useRef, useState } from "react";

const CHAVE_ARMAZENAMENTO = "assistente-idoso:conversas:v1";

function carregarConversas() {
  try {
    const conteudo = sessionStorage.getItem(CHAVE_ARMAZENAMENTO);

    if (!conteudo) {
      return {};
    }

    const dados = JSON.parse(conteudo);

    if (
      dados &&
      typeof dados === "object" &&
      !Array.isArray(dados)
    ) {
      return dados;
    }

    return {};
  } catch {
    return {};
  }
}

// Formata textos do assistente, incluindo trechos em negrito.
function renderizarTexto(texto) {
  if (typeof texto !== "string") {
    return texto;
  }

  const linhas = texto.split("\n");

  return linhas.map((linha, indiceLinha) => {
    const linhaLimpa = linha.replace(/^\s*\*\s+/, "");
    const partes = linhaLimpa.split(/(\*\*.*?\*\*)/g);

    return (
      <span key={indiceLinha}>
        {partes.map((parte, indiceParte) => {
          if (
            parte.startsWith("**") &&
            parte.endsWith("**") &&
            parte.length >= 4
          ) {
            return (
              <strong key={indiceParte}>
                {parte.slice(2, -2)}
              </strong>
            );
          }

          return parte;
        })}

        {indiceLinha < linhas.length - 1 && <br />}
      </span>
    );
  });
}

function Assistente({
  idosos = [],
  idosoSelecionado,
  setIdosoSelecionado,
}) {
  const [mensagem, setMensagem] = useState("");
  const [conversas, setConversas] = useState(carregarConversas);

  const [carregandoPorConversa, setCarregandoPorConversa] =
    useState({});

  const [listaIdososAberta, setListaIdososAberta] = useState(false);

  const seletorRef = useRef(null);
  const botaoSeletorRef = useRef(null);
  const campoMensagemRef = useRef(null);

  const chaveConversa = idosoSelecionado?.Id
    ? `idoso:${idosoSelecionado.Id}`
    : "geral";

  const mensagens = conversas[chaveConversa] || [];

  const carregando = Boolean(
    carregandoPorConversa[chaveConversa]
  );

  const perguntasSugeridas = [
    "Quais medicamentos esse idoso utiliza?",
    "Quais são os próximos horários de medicamento?",
    "Quais ocorrências recentes foram registradas?",
  ];

  // Salva as conversas na sessão atual do navegador.
  useEffect(() => {
    try {
      sessionStorage.setItem(
        CHAVE_ARMAZENAMENTO,
        JSON.stringify(conversas)
      );
    } catch (erro) {
      console.warn(
        "Não foi possível salvar as conversas na sessão:",
        erro
      );
    }
  }, [conversas]);

  // Ajusta automaticamente a altura do campo de mensagem.
  useEffect(() => {
    const campo = campoMensagemRef.current;

    if (!campo) {
      return;
    }

    campo.style.height = "auto";

    const alturaMaxima = 224;
    const alturaNecessaria = campo.scrollHeight;

    campo.style.height = `${Math.min(
      alturaNecessaria,
      alturaMaxima
    )}px`;
  }, [mensagem]);

  // Fecha a lista de idosos ao clicar fora ou pressionar Escape.
  useEffect(() => {
    if (!listaIdososAberta) {
      return;
    }

    const aoClicarFora = (evento) => {
      if (
        seletorRef.current &&
        !seletorRef.current.contains(evento.target)
      ) {
        setListaIdososAberta(false);
      }
    };

    const aoPressionarTecla = (evento) => {
      if (evento.key === "Escape") {
        setListaIdososAberta(false);
        botaoSeletorRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", aoClicarFora);
    document.addEventListener("keydown", aoPressionarTecla);

    return () => {
      document.removeEventListener("pointerdown", aoClicarFora);
      document.removeEventListener("keydown", aoPressionarTecla);
    };
  }, [listaIdososAberta]);

  // Atualiza apenas a conversa indicada.
  const atualizarConversa = (chave, atualizador) => {
    setConversas((anteriores) => {
      const mensagensAnteriores = Array.isArray(anteriores[chave])
        ? anteriores[chave]
        : [];

      const novasMensagens =
        typeof atualizador === "function"
          ? atualizador(mensagensAnteriores)
          : atualizador;

      return {
        ...anteriores,
        [chave]: novasMensagens.slice(-100),
      };
    });
  };

  // Seleciona um idoso sem apagar o histórico das conversas.
  const selecionarIdoso = (idSelecionado) => {
    const idoso = idosos.find(
      (item) => String(item.Id) === String(idSelecionado)
    );

    setIdosoSelecionado(idoso || null);
    setListaIdososAberta(false);

    botaoSeletorRef.current?.focus();
  };

  const usarPergunta = (pergunta) => {
    setMensagem(pergunta);
    campoMensagemRef.current?.focus();
  };

  // Enter envia a pergunta; Shift + Enter cria uma nova linha.
  const aoPressionarTeclaMensagem = (evento) => {
    if (
      evento.key === "Enter" &&
      !evento.shiftKey &&
      !evento.nativeEvent.isComposing
    ) {
      evento.preventDefault();

      if (mensagem.trim() && !carregando) {
        evento.currentTarget.form?.requestSubmit();
      }
    }
  };

  const enviarMensagem = async (evento) => {
    evento.preventDefault();

    const pergunta = mensagem.trim();

    if (!pergunta || carregando) {
      return;
    }

    // Preserva o idoso e a conversa corretos durante a requisição.
    const chaveDaRequisicao = chaveConversa;
    const idosoDaRequisicao = idosoSelecionado;

    const historico = mensagens
      .filter(
        (item) =>
          item.autor === "usuario" ||
          item.autor === "assistente"
      )
      .slice(-10)
      .map(({ autor, texto }) => ({
        autor,
        texto,
      }));

    atualizarConversa(
      chaveDaRequisicao,
      (anteriores) => [
        ...anteriores,
        {
          autor: "usuario",
          texto: pergunta,
        },
      ]
    );

    setMensagem("");

    setCarregandoPorConversa((anteriores) => ({
      ...anteriores,
      [chaveDaRequisicao]: true,
    }));

    try {
      const corpoRequisicao = {
        pergunta,
        historico,
      };

      if (idosoDaRequisicao?.Id) {
        corpoRequisicao.idosoId = Number(
          idosoDaRequisicao.Id
        );
      }

      const respostaHttp = await fetch(
        "http://localhost:3000/api/assistente",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(corpoRequisicao),
        }
      );

      const dados = await respostaHttp.json();

      if (!respostaHttp.ok) {
        throw new Error(
          dados.erro ||
            `Não foi possível obter a resposta (HTTP ${respostaHttp.status}).`
        );
      }

      if (
        typeof dados.resposta !== "string" ||
        !dados.resposta.trim()
      ) {
        throw new Error(
          "O Assistente não retornou uma resposta válida."
        );
      }

      atualizarConversa(
        chaveDaRequisicao,
        (anteriores) => [
          ...anteriores,
          {
            autor: "assistente",
            texto: dados.resposta,
          },
        ]
      );
    } catch (erro) {
      console.error(
        "Erro ao enviar mensagem ao Assistente:",
        erro
      );

      const mensagemErro =
        erro instanceof TypeError
          ? "Não foi possível conectar ao servidor. Verifique se o backend está funcionando e tente novamente."
          : erro.message ||
            "Ocorreu um erro ao consultar o Assistente. Tente novamente.";

      atualizarConversa(
        chaveDaRequisicao,
        (anteriores) => [
          ...anteriores,
          {
            autor: "erro",
            texto: mensagemErro,
          },
        ]
      );
    } finally {
      setCarregandoPorConversa((anteriores) => ({
        ...anteriores,
        [chaveDaRequisicao]: false,
      }));
    }
  };

  return (
    <div className="min-w-0">
      {/* CABEÇALHO */}
      <header className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Apoio inteligente
        </p>

        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Assistente
        </h2>

        <p className="mt-2 max-w-2xl text-slate-500">
          Faça perguntas em linguagem natural sobre a rotina dos
          idosos cadastrados ou tire dúvidas gerais e educativas
          sobre saúde.
        </p>
      </header>

      {/* SELEÇÃO DO IDOSO */}
      <section className="mb-6 min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Sobre qual idoso você quer perguntar?
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Selecione um idoso para consultar os dados cadastrados.
            Para perguntas gerais, a seleção não é obrigatória.
          </p>
        </div>

        {idosos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            Nenhum idoso cadastrado. Você ainda pode fazer
            perguntas gerais ao Assistente.
          </div>
        ) : (
          <div
            ref={seletorRef}
            className="relative w-full min-w-0"
          >
            {/* BOTÃO DO SELETOR */}
            <button
              ref={botaoSeletorRef}
              type="button"
              onClick={() =>
                setListaIdososAberta((aberta) => !aberta)
              }
              aria-label="Selecionar idoso para consulta"
              aria-expanded={listaIdososAberta}
              aria-controls="lista-idosos-assistente"
              className="flex w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-slate-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
            >
              <span className="min-w-0 flex-1 truncate">
                {idosoSelecionado?.Nome ||
                  "Pergunta geral (sem idoso)"}
              </span>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`shrink-0 text-slate-500 transition-transform ${
                  listaIdososAberta ? "rotate-180" : ""
                }`}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* LISTA DE IDOSOS PERSONALIZADA */}
            {listaIdososAberta && (
              <div
                id="lista-idosos-assistente"
                role="group"
                aria-label="Opções de seleção de idoso"
                className="absolute left-0 right-0 top-full z-30 mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-md"
              >
                <button
                  type="button"
                  onClick={() => selecionarIdoso("")}
                  aria-pressed={!idosoSelecionado}
                  className={`block w-full rounded-lg px-3 py-3 text-left text-sm transition ${
                    !idosoSelecionado
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Pergunta geral (sem idoso)
                </button>

                {idosos.map((idoso) => {
                  const selecionado =
                    String(idosoSelecionado?.Id) ===
                    String(idoso.Id);

                  return (
                    <button
                      key={idoso.Id}
                      type="button"
                      onClick={() =>
                        selecionarIdoso(idoso.Id)
                      }
                      aria-pressed={selecionado}
                      className={`block w-full break-words rounded-lg px-3 py-3 text-left text-sm transition ${
                        selecionado
                          ? "bg-slate-900 text-white"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {idoso.Nome}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ÁREA DO ASSISTENTE */}
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-6 flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-2xl">
            ✨
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-slate-900">
              Assistente inteligente
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {idosoSelecionado
                ? `Você está consultando informações sobre ${idosoSelecionado.Nome}.`
                : "Você pode fazer perguntas gerais ou selecionar um idoso para consultar os dados cadastrados."}
            </p>
          </div>
        </div>

        {/* ÁREA DA CONVERSA */}
        <div className="min-h-72 min-w-0 rounded-2xl bg-slate-50 p-4 sm:p-5">
          {mensagens.length > 0 ? (
            <div className="space-y-4">
              {mensagens.map((item, indice) => (
                <div
                  key={`${item.autor}-${indice}`}
                  className={`flex min-w-0 ${
                    item.autor === "usuario"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`min-w-0 max-w-[90%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-6 ${
                      item.autor === "usuario"
                        ? "bg-slate-900 text-white"
                        : item.autor === "erro"
                          ? "border border-red-200 bg-red-50 text-red-700"
                          : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {item.autor !== "usuario" && (
                      <p className="mb-1 text-xs font-semibold">
                        {item.autor === "erro"
                          ? "Aviso"
                          : "Assistente"}
                      </p>
                    )}

                    {item.autor === "assistente"
                      ? renderizarTexto(item.texto)
                      : item.texto}
                  </div>
                </div>
              ))}

              {carregando && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                    O Assistente está preparando a resposta...
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mx-auto flex min-h-60 max-w-2xl flex-col justify-center">
              <div className="text-center">
                <div className="text-4xl">💬</div>

                <h4 className="mt-4 text-lg font-semibold text-slate-900">
                  Como posso ajudar?
                </h4>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  {idosoSelecionado
                    ? `Pergunte sobre medicamentos, horários, lembretes ou ocorrências registrados para ${idosoSelecionado.Nome}.`
                    : "Digite uma pergunta geral sobre saúde ou selecione um idoso para consultar as informações dele."}
                </p>
              </div>

              {idosoSelecionado && (
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {perguntasSugeridas.map((pergunta) => (
                    <button
                      key={pergunta}
                      type="button"
                      onClick={() => usarPergunta(pergunta)}
                      className="rounded-xl border border-slate-200 bg-white p-3 text-left text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                    >
                      {pergunta}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CAMPO DE MENSAGEM MULTILINHA */}
        <form
          onSubmit={enviarMensagem}
          className="mt-5 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end"
        >
          <textarea
            ref={campoMensagemRef}
            rows={3}
            value={mensagem}
            onChange={(evento) =>
              setMensagem(evento.target.value)
            }
            onKeyDown={aoPressionarTeclaMensagem}
            placeholder={
              idosoSelecionado
                ? "Digite sua pergunta..."
                : "Digite uma pergunta geral..."
            }
            aria-label="Pergunta para o Assistente"
            disabled={carregando}
            className="max-h-56 min-h-24 w-full min-w-0 flex-1 resize-none overflow-y-auto rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          <button
            type="submit"
            disabled={!mensagem.trim() || carregando}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {carregando ? "Enviando..." : "Enviar"}
          </button>
        </form>

        <p className="mt-2 text-xs text-slate-400">
          Enter para enviar. Shift + Enter para nova linha.
        </p>

        {/* AVISO */}
        <p className="mt-4 text-xs leading-5 text-slate-400">
          O Assistente oferece informações educativas e consultas
          aos dados registrados no sistema. Ele não realiza
          diagnósticos nem substitui a orientação de profissionais
          de saúde.
        </p>
      </section>
    </div>
  );
}

export default Assistente;
