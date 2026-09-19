import { useEffect, useState } from "react";

import {
  listarOcorrencias,
  criarOcorrencia,
  editarOcorrencia as atualizarOcorrenciaApi,
  excluirOcorrencia as excluirOcorrenciaApi,
} from "../services/api";

const estadoInicialNovaOcorrencia = {
  Tipo: "",
  "Descrição": "",
  Data_Hora: "",
};

const estadoInicialOcorrenciaEditando = {
  Id: null,
  Idoso_Id: null,
  Tipo: "",
  "Descrição": "",
  Data_Hora: "",
};

export function useOcorrencias() {
  const [ocorrencias, setOcorrencias] = useState([]);

  const [
    mostrarFormularioOcorrencia,
    setMostrarFormularioOcorrencia,
  ] = useState(false);

  const [novaOcorrencia, setNovaOcorrencia] = useState(
    estadoInicialNovaOcorrencia
  );

  const [
    mostrarFormularioEdicaoOcorrencia,
    setMostrarFormularioEdicaoOcorrencia,
  ] = useState(false);

  const [
    ocorrenciaEditando,
    setOcorrenciaEditando,
  ] = useState(estadoInicialOcorrenciaEditando);

  // ==============================
  // BUSCAR OCORRÊNCIAS
  // ==============================

  useEffect(() => {
    listarOcorrencias()
      .then((dados) => {
        setOcorrencias(dados);
      })
      .catch((erro) => {
        console.error("Erro ao buscar ocorrências:", erro);
      });
  }, []);

  // ==============================
  // CADASTRAR OCORRÊNCIA
  // ==============================

  const cadastrarOcorrencia = async (evento, idosoSelecionado) => {
    evento.preventDefault();

    if (!idosoSelecionado) {
      alert(
        "Selecione um idoso antes de registrar a ocorrência."
      );
      return;
    }

    try {
      const dados = await criarOcorrencia({
        Idoso_Id: idosoSelecionado.Id,
        Tipo: novaOcorrencia.Tipo,
        "Descrição": novaOcorrencia["Descrição"],
        Data_Hora: novaOcorrencia.Data_Hora,
      });

      setOcorrencias((ocorrenciasAtuais) => [
        ...ocorrenciasAtuais,
        dados,
      ]);

      setNovaOcorrencia(
        estadoInicialNovaOcorrencia
      );

      setMostrarFormularioOcorrencia(false);
    } catch (erro) {
      console.error(
        "Erro ao cadastrar ocorrência:",
        erro
      );

      alert(erro.message);
    }
  };

  // ==============================
  // EDITAR OCORRÊNCIA
  // ==============================

  const editarOcorrencia = async (evento) => {
    evento.preventDefault();

    try {
      const dados = await atualizarOcorrenciaApi(
        ocorrenciaEditando.Id,
        {
          Idoso_Id: ocorrenciaEditando.Idoso_Id,
          Tipo: ocorrenciaEditando.Tipo,
          "Descrição": ocorrenciaEditando["Descrição"],
          Data_Hora: ocorrenciaEditando.Data_Hora,
        }
      );

      setOcorrencias((ocorrenciasAtuais) =>
        ocorrenciasAtuais.map((ocorrencia) =>
          ocorrencia.Id === dados.Id
            ? dados
            : ocorrencia
        )
      );

      setMostrarFormularioEdicaoOcorrencia(false);
    } catch (erro) {
      console.error(
        "Erro ao atualizar ocorrência:",
        erro
      );

      alert(erro.message);
    }
  };

  // ==============================
  // EXCLUIR OCORRÊNCIA
  // ==============================

  const excluirOcorrencia = async (ocorrencia) => {
    const confirmar = window.confirm(
      `Deseja realmente excluir a ocorrência "${ocorrencia.Tipo}"?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await excluirOcorrenciaApi(ocorrencia.Id);

      setOcorrencias((ocorrenciasAtuais) =>
        ocorrenciasAtuais.filter(
          (item) => item.Id !== ocorrencia.Id
        )
      );

      if (
        ocorrenciaEditando.Id === ocorrencia.Id
      ) {
        setMostrarFormularioEdicaoOcorrencia(false);
      }
    } catch (erro) {
      console.error(
        "Erro ao excluir ocorrência:",
        erro
      );

      alert(erro.message);
    }
  };

  // ==============================
  // PREPARAR EDIÇÃO
  // ==============================

  const prepararEdicaoOcorrencia = (ocorrencia) => {
    setOcorrenciaEditando({
      Id: ocorrencia.Id,
      Idoso_Id: ocorrencia.Idoso_Id,
      Tipo: ocorrencia.Tipo,
      "Descrição": ocorrencia["Descrição"],
      Data_Hora: ocorrencia.Data_Hora,
    });

    setMostrarFormularioEdicaoOcorrencia(true);
    setMostrarFormularioOcorrencia(false);
  };

  return {
    ocorrencias,
    setOcorrencias,

    mostrarFormularioOcorrencia,
    setMostrarFormularioOcorrencia,

    novaOcorrencia,
    setNovaOcorrencia,

    mostrarFormularioEdicaoOcorrencia,
    setMostrarFormularioEdicaoOcorrencia,

    ocorrenciaEditando,
    setOcorrenciaEditando,

    cadastrarOcorrencia,
    editarOcorrencia,
    excluirOcorrencia,
    prepararEdicaoOcorrencia,
  };
}