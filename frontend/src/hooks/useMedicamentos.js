import { useEffect, useState } from "react";

import {
  listarMedicamentos,
  criarMedicamento,
  editarMedicamento as atualizarMedicamentoApi,
  excluirMedicamento as excluirMedicamentoApi,
} from "../services/api";

const estadoInicialNovoMedicamento = {
  Nome: "",
  Dosagem: "",
  Horario: "",
  Frequencia: "",
  Observacoes: "",
};

const estadoInicialMedicamentoEditando = {
  Id: null,
  Idoso_Id: null,
  Nome: "",
  Dosagem: "",
  Horario: "",
  Frequencia: "",
  Observacoes: "",
};

export function useMedicamentos(
  idosoSelecionado,
  setLembretes
) {
  const [medicamentos, setMedicamentos] = useState([]);

  const [
    mostrarFormularioMedicamento,
    setMostrarFormularioMedicamento,
  ] = useState(false);

  const [novoMedicamento, setNovoMedicamento] = useState(
    estadoInicialNovoMedicamento
  );

  const [
    mostrarFormularioEdicaoMedicamento,
    setMostrarFormularioEdicaoMedicamento,
  ] = useState(false);

  const [
    medicamentoEditando,
    setMedicamentoEditando,
  ] = useState(estadoInicialMedicamentoEditando);

  // ==============================
  // BUSCAR MEDICAMENTOS
  // ==============================

  useEffect(() => {
    listarMedicamentos()
      .then((dados) => {
        setMedicamentos(dados);
      })
      .catch((erro) => {
        console.error(
          "Erro ao buscar medicamentos:",
          erro
        );
      });
  }, []);

  // ==============================
  // CADASTRAR MEDICAMENTO
  // ==============================

  const cadastrarMedicamento = async (evento) => {
    evento.preventDefault();

    if (!idosoSelecionado) {
      alert(
        "Selecione um idoso antes de cadastrar o medicamento."
      );
      return;
    }

    try {
      const dados = await criarMedicamento({
        Idoso_Id: idosoSelecionado.Id,
        Nome: novoMedicamento.Nome,
        Dosagem: novoMedicamento.Dosagem,
        Horario: novoMedicamento.Horario,
        Frequencia: novoMedicamento.Frequencia,
        Observacoes: novoMedicamento.Observacoes,
      });

      setMedicamentos((medicamentosAtuais) => [
        ...medicamentosAtuais,
        dados,
      ]);

      if (dados.lembrete) {
        setLembretes((lembretesAtuais) => [
          ...lembretesAtuais,
          dados.lembrete,
        ]);
      }

      setNovoMedicamento(
        estadoInicialNovoMedicamento
      );

      setMostrarFormularioMedicamento(false);
    } catch (erro) {
      console.error(
        "Erro ao cadastrar medicamento:",
        erro
      );

      alert(erro.message);
    }
  };

  // ==============================
  // EDITAR MEDICAMENTO
  // ==============================

  const editarMedicamento = async (evento) => {
    evento.preventDefault();

    try {
      const dados = await atualizarMedicamentoApi(
        medicamentoEditando.Id,
        {
          Idoso_Id: medicamentoEditando.Idoso_Id,
          Nome: medicamentoEditando.Nome,
          Dosagem: medicamentoEditando.Dosagem,
          Horario: medicamentoEditando.Horario,
          Frequencia: medicamentoEditando.Frequencia,
          Observacoes:
            medicamentoEditando.Observacoes,
        }
      );

      setMedicamentos((medicamentosAtuais) =>
        medicamentosAtuais.map((medicamento) =>
          medicamento.Id === dados.Id
            ? dados
            : medicamento
        )
      );

      if (dados.lembrete) {
        setLembretes((lembretesAtuais) =>
          lembretesAtuais.map((lembrete) =>
            lembrete.Id === dados.lembrete.Id
              ? dados.lembrete
              : lembrete
          )
        );
      }

      setMostrarFormularioEdicaoMedicamento(false);
    } catch (erro) {
      console.error(
        "Erro ao atualizar medicamento:",
        erro
      );

      alert(erro.message);
    }
  };

  // ==============================
  // EXCLUIR MEDICAMENTO
  // ==============================

  const excluirMedicamento = async (medicamento) => {
    const confirmar = window.confirm(
      `Deseja realmente excluir ${medicamento.Nome}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await excluirMedicamentoApi(medicamento.Id);

      setMedicamentos((medicamentosAtuais) =>
        medicamentosAtuais.filter(
          (item) => item.Id !== medicamento.Id
        )
      );

      setLembretes((lembretesAtuais) =>
        lembretesAtuais.filter(
          (lembrete) =>
            lembrete.Medicamento_Id !== medicamento.Id
        )
      );

      setMostrarFormularioEdicaoMedicamento(false);
    } catch (erro) {
      console.error(
        "Erro ao excluir medicamento:",
        erro
      );

      alert(erro.message);
    }
  };

  // ==============================
  // PREPARAR EDIÇÃO
  // ==============================

  const prepararEdicaoMedicamento = (medicamento) => {
    setMedicamentoEditando({
      Id: medicamento.Id,
      Idoso_Id: medicamento.Idoso_Id,
      Nome: medicamento.Nome,
      Dosagem: medicamento.Dosagem,
      Horario: medicamento.Horario,
      Frequencia: medicamento.Frequencia,
      Observacoes:
        medicamento.Observacoes || "",
    });

    setMostrarFormularioEdicaoMedicamento(true);
    setMostrarFormularioMedicamento(false);
  };

  return {
    medicamentos,
    mostrarFormularioMedicamento,
    setMostrarFormularioMedicamento,
    novoMedicamento,
    setNovoMedicamento,
    mostrarFormularioEdicaoMedicamento,
    setMostrarFormularioEdicaoMedicamento,
    medicamentoEditando,
    setMedicamentoEditando,
    cadastrarMedicamento,
    editarMedicamento,
    excluirMedicamento,
    prepararEdicaoMedicamento,
  };
}