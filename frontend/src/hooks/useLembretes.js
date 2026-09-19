import { useEffect, useState } from "react";

import { listarLembretes } from "../services/api";

export function useLembretes() {
  const [lembretes, setLembretes] = useState([]);

  useEffect(() => {
    listarLembretes()
      .then((dados) => {
        setLembretes(dados);
      })
      .catch((erro) => {
        console.error("Erro ao buscar lembretes:", erro);
      });
  }, []);

  return {
    lembretes,
    setLembretes,
  };
}