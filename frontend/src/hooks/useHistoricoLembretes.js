
import { useState } from "react";

import {
  listarHistoricoLembretes,
} from "../services/api";

export function useHistoricoLembretes() {
  const [historico, setHistorico] = useState(null);

  const [carregandoHistorico, setCarregandoHistorico] =
    useState(false);

  const [erroHistorico, setErroHistorico] = useState("");

  // ==============================
  // CARREGAR HISTÓRICO DO IDOSO
  // ==============================

  const carregarHistorico = async (idosoId) => {
    if (!idosoId) {
      setErroHistorico("Selecione um idoso.");
      return null;
    }

    try {
      setCarregandoHistorico(true);
      setErroHistorico("");

      const dados = await listarHistoricoLembretes(idosoId);

      setHistorico(dados);

      return dados;
    } catch (erro) {
      console.error("Erro ao carregar histórico:", erro);

      setErroHistorico(
        erro.message || "Não foi possível carregar o histórico."
      );

      throw erro;
    } finally {
      setCarregandoHistorico(false);
    }
  };

  // ==============================
  // LIMPAR HISTÓRICO
  // ==============================

  const limparHistorico = () => {
    setHistorico(null);
    setErroHistorico("");
    setCarregandoHistorico(false);
  };

  return {
    historico,
    carregandoHistorico,
    erroHistorico,
    carregarHistorico,
    limparHistorico,
  };
}
