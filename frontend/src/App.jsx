import { useEffect, useState } from "react";

function App() {
  const [mensagem, setMensagem] = useState("Conectando ao backend...");

  useEffect(() => {
    fetch("http://localhost:3000")
      .then((resposta) => resposta.text())
      .then((dados) => {
        setMensagem(dados);
      })
      .catch(() => {
        setMensagem("Erro ao conectar com o backend.");
      });
  }, []);

  return (
    <div>
      <h1>Assistente de Cuidado</h1>
      <p>{mensagem}</p>
    </div>
  );
}

export default App;