import { useState } from "react";

function Assistente({
  idosos,
  idosoSelecionado,
  setIdosoSelecionado,
}) {
  const [mensagem, setMensagem] = useState("");

  const perguntasSugeridas = [
    "Quais medicamentos esse idoso utiliza?",
    "Quais são os próximos horários de medicamento?",
    "Quais ocorrências recentes foram registradas?",
  ];

  const selecionarIdoso = (evento) => {
    const idSelecionado = Number(evento.target.value);

    const idoso = idosos.find(
      (item) => item.Id === idSelecionado
    );

    setIdosoSelecionado(idoso || null);
  };

  const usarPergunta = (pergunta) => {
    setMensagem(pergunta);
  };

  const enviarMensagem = (evento) => {
    evento.preventDefault();

    if (!mensagem.trim()) {
      return;
    }

    alert(
      "O envio para a inteligência artificial será conectado na próxima etapa."
    );
  };

  return (
    <div>
      {/* ============================== */}
      {/* CABEÇALHO */}
      {/* ============================== */}

      <header className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Apoio inteligente
        </p>

        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          Assistente
        </h2>

        <p className="mt-2 max-w-2xl text-slate-500">
          Faça perguntas em linguagem natural sobre a rotina
          dos idosos cadastrados.
        </p>
      </header>

      {/* ============================== */}
      {/* SELEÇÃO DO IDOSO */}
      {/* ============================== */}

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Sobre qual idoso você quer perguntar?
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            O assistente utilizará os dados desse idoso como
            contexto para responder.
          </p>
        </div>

        {idosos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
            Nenhum idoso cadastrado.
          </div>
        ) : (
          <select
            value={idosoSelecionado?.Id || ""}
            onChange={selecionarIdoso}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-900"
          >
            <option value="">
              Selecione um idoso
            </option>

            {idosos.map((idoso) => (
              <option
                key={idoso.Id}
                value={idoso.Id}
              >
                {idoso.Nome}
              </option>
            ))}
          </select>
        )}
      </section>

      {/* ============================== */}
      {/* ÁREA DO ASSISTENTE */}
      {/* ============================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-2xl">
            ✨
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Assistente inteligente
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {idosoSelecionado
                ? `Você está consultando informações sobre ${idosoSelecionado.Nome}.`
                : "Selecione um idoso para começar."}
            </p>
          </div>
        </div>

        {/* Área da conversa */}

        <div className="min-h-72 rounded-2xl bg-slate-50 p-5">
          {idosoSelecionado ? (
            <div className="mx-auto flex min-h-60 max-w-2xl flex-col justify-center">
              <div className="text-center">
                <div className="text-4xl">
                  💬
                </div>

                <h4 className="mt-4 text-lg font-semibold text-slate-900">
                  Como posso ajudar?
                </h4>

                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  Pergunte sobre medicamentos, horários,
                  lembretes ou ocorrências registrados para{" "}
                  {idosoSelecionado.Nome}.
                </p>
              </div>

              {/* Perguntas sugeridas */}

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
            </div>
          ) : (
            <div className="flex min-h-60 items-center justify-center text-center">
              <div className="max-w-md">
                <div className="text-4xl">
                  👤
                </div>

                <h4 className="mt-4 text-lg font-semibold text-slate-900">
                  Selecione um idoso
                </h4>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Escolha um idoso acima para que o assistente
                  possa trabalhar com as informações da rotina
                  dele.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Campo de mensagem */}

        <form
          onSubmit={enviarMensagem}
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="text"
            value={mensagem}
            onChange={(evento) =>
              setMensagem(evento.target.value)
            }
            placeholder={
              idosoSelecionado
                ? "Digite sua pergunta..."
                : "Selecione um idoso primeiro"
            }
            disabled={!idosoSelecionado}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100"
          />

          <button
            type="submit"
            disabled={!idosoSelecionado || !mensagem.trim()}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enviar
          </button>
        </form>

        {/* Aviso */}

        <p className="mt-4 text-xs leading-5 text-slate-400">
          O assistente será destinado a consultas informacionais
          sobre os dados registrados no sistema e não deverá
          realizar diagnósticos ou substituir orientação
          profissional.
        </p>
      </section>
    </div>
  );
}

export default Assistente;