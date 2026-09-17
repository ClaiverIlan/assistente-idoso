import { useState } from "react";

function Login({ onEntrar, onCadastrar }) {
  const [modo, setModo] = useState("login");
  const [email, setEmail] = useState("");
  const [nome, setNome] = useState("");
  const [emailCadastro, setEmailCadastro] = useState("");
  const [tipo, setTipo] = useState("Cuidador");

  const handleLogin = (evento) => {
    evento.preventDefault();

    onEntrar(email);
  };

  const handleCadastro = (evento) => {
    evento.preventDefault();

    onCadastrar({
      Nome: nome,
      Email: emailCadastro,
      Tipo: tipo,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="w-full max-w-md">

          <div className="mb-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-bold text-white shadow-sm">
              A
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
              Assistente Idoso
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {modo === "login"
                ? "Acesso do cuidador"
                : "Cadastro do cuidador"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            {modo === "login" ? (
              <>
                <h2 className="text-xl font-semibold text-slate-900">
                  Entrar no sistema
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Informe seu e-mail para acessar o ambiente do cuidador.
                </p>

                <form
                  onSubmit={handleLogin}
                  className="mt-6 space-y-5"
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      E-mail
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(evento) =>
                        setEmail(evento.target.value)
                      }
                      placeholder="cuidador@email.com"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Entrar
                  </button>
                </form>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-xs text-slate-400">
                    ou
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <button
                  type="button"
                  onClick={() => setModo("cadastro")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Primeiro acesso? Cadastrar cuidador
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-slate-900">
                  Cadastrar cuidador
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Preencha os dados para criar o cadastro inicial do cuidador.
                </p>

                <form
                  onSubmit={handleCadastro}
                  className="mt-6 space-y-5"
                >
                  <div>
                    <label
                      htmlFor="nome"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Nome
                    </label>

                    <input
                      id="nome"
                      type="text"
                      value={nome}
                      onChange={(evento) =>
                        setNome(evento.target.value)
                      }
                      placeholder="Digite seu nome"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="emailCadastro"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      E-mail
                    </label>

                    <input
                      id="emailCadastro"
                      type="email"
                      value={emailCadastro}
                      onChange={(evento) =>
                        setEmailCadastro(evento.target.value)
                      }
                      placeholder="cuidador@email.com"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="tipo"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Tipo de cuidador
                    </label>

                    <select
                      id="tipo"
                      value={tipo}
                      onChange={(evento) =>
                        setTipo(evento.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="Cuidador">Cuidador</option>
                      <option value="Familiar">Familiar</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Cadastrar cuidador
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => setModo("login")}
                  className="mt-4 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Voltar para o acesso
                </button>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;