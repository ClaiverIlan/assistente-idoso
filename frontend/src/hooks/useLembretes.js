import { useEffect, useState } from "react";

import {
  listarLembretes,
  editarLembrete,
  atualizarVisualizacaoLembrete,
  atualizarAdministracaoLembrete,
} from "../services/api";

export function useLembretes() {
  const [lembretes, setLembretes] = useState([]);

  // ==============================
  // BUSCAR E ATUALIZAR LEMBRETES
  // ==============================

  useEffect(() => {
    let componenteAtivo = true;

    const carregarLembretes = async () => {
      try {
        const dados = await listarLembretes();

        if (componenteAtivo) {
          setLembretes(dados);
        }
      } catch (erro) {
        console.error("Erro ao buscar lembretes:", erro);
      }
    };

    carregarLembretes();

    const intervalo = window.setInterval(() => {
      carregarLembretes();
    }, 60 * 1000);

    return () => {
      componenteAtivo = false;
      window.clearInterval(intervalo);
    };
  }, []);

  // ==============================
  // ATUALIZAR LEMBRETE NA INTERFACE
  // ==============================

  const atualizarLembreteLocal = (lembreteAtualizado) => {
    setLembretes((lembretesAtuais) =>
      lembretesAtuais.map((item) =>
        item.Id === lembreteAtualizado.Id
          ? {
              ...item,
              ...lembreteAtualizado,
            }
          : item
      )
    );
  };

  // ==============================
  // MARCAR OU DESMARCAR COMO LIDO
  // ==============================

  const marcarLembreteVisualizado = async (
    lembrete,
    visualizado = true
  ) => {
    try {
      const atualizado = await atualizarVisualizacaoLembrete(
        lembrete.Id,
        visualizado
      );

      atualizarLembreteLocal(atualizado);

      return atualizado;
    } catch (erro) {
      console.error(
        "Erro ao atualizar visualização:",
        erro
      );

      alert(
        erro.message ||
          "Não foi possível atualizar a visualização."
      );

      throw erro;
    }
  };

  // ==============================
  // CONFIRMAR OU DESFAZER ADMINISTRAÇÃO
  // ==============================

  const marcarLembreteAdministrado = async (
    lembrete,
    administrado = true
  ) => {
    try {
      const atualizado = await atualizarAdministracaoLembrete(
        lembrete.Id,
        administrado
      );

      atualizarLembreteLocal(atualizado);

      return atualizado;
    } catch (erro) {
      console.error(
        "Erro ao atualizar administração:",
        erro
      );

      alert(
        erro.message ||
          "Não foi possível atualizar a administração."
      );

      throw erro;
    }
  };

  // ==============================
  // COMPATIBILIDADE COM A FUNÇÃO ANTIGA
  // ==============================

  const marcarLembreteRealizado = async (
    lembrete,
    novoStatus = "Realizado"
  ) => {
    try {
      const dados = await editarLembrete(
        lembrete.Id,
        {
          Medicamento_Id: lembrete.Medicamento_Id,
          Data_Hora: lembrete.Data_Hora,
          Status: novoStatus,
        }
      );

      setLembretes((lembretesAtuais) =>
        lembretesAtuais.map((item) =>
          item.Id === lembrete.Id
            ? {
                ...item,
                Status: novoStatus,
              }
            : item
        )
      );

      return dados;
    } catch (erro) {
      console.error(
        "Erro ao atualizar status do lembrete:",
        erro
      );

      alert(
        erro.message ||
          "Não foi possível atualizar o lembrete."
      );

      throw erro;
    }
  };

  return {
    lembretes,
    setLembretes,

    // Novas funcionalidades
    marcarLembreteVisualizado,
    marcarLembreteAdministrado,

    // Mantida temporariamente
    marcarLembreteRealizado,
  };
}