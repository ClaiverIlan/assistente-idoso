import { useEffect, useState } from "react";

import {
  listarIdosos,
  criarIdoso,
  editarIdoso as atualizarIdosoApi,
  excluirIdoso as excluirIdosoApi,
} from "../services/api";

const estadoInicialNovoIdoso = {
  Nome: "",
  "Data Nascimento": "",
  Observacoes: "",
};

const estadoInicialIdosoEditando = {
  Id: null,
  Nome: "",
  "Data Nascimento": "",
  Observacoes: "",
};

export function useIdosos(cuidadorAtual) {
  const [idosos, setIdosos] = useState([]);

  const [idosoSelecionado, setIdosoSelecionado] = useState(null);

  const [mostrarFormularioIdoso, setMostrarFormularioIdoso] =
    useState(false);

  const [novoIdoso, setNovoIdoso] = useState(
    estadoInicialNovoIdoso
  );

  const [mostrarFormularioEdicao, setMostrarFormularioEdicao] =
    useState(false);

  const [idosoEditando, setIdosoEditando] = useState(
    estadoInicialIdosoEditando
  );

  // ==============================
  // BUSCAR IDOSOS
  // ==============================

  useEffect(() => {
    if (!cuidadorAtual) {
      setIdosos([]);
      setIdosoSelecionado(null);
      return;
    }

    listarIdosos()
      .then((dados) => {
        const idososDoCuidador = dados.filter(
          (idoso) =>
            idoso.Cuidador_Id === cuidadorAtual.Id
        );

        setIdosos(idososDoCuidador);
      })
      .catch((erro) => {
        console.error("Erro ao buscar idosos:", erro);
      });
  }, [cuidadorAtual]);

  // ==============================
  // CADASTRAR IDOSO
  // ==============================

  const cadastrarIdoso = async (evento) => {
    evento.preventDefault();

    if (!cuidadorAtual) {
      alert("Nenhum cuidador está conectado.");
      return;
    }

    try {
      const dados = await criarIdoso({
        Cuidador_Id: cuidadorAtual.Id,
        Nome: novoIdoso.Nome,
        "Data Nascimento":
          novoIdoso["Data Nascimento"],
        Observacoes: novoIdoso.Observacoes,
      });

      setIdosos((idososAtuais) => [
        ...idososAtuais,
        dados,
      ]);

      setNovoIdoso(estadoInicialNovoIdoso);
      setMostrarFormularioIdoso(false);
    } catch (erro) {
      console.error("Erro ao cadastrar idoso:", erro);
      alert(erro.message);
    }
  };

  // ==============================
  // EXCLUIR IDOSO
  // ==============================

  const excluirIdoso = async (idoso) => {
    const confirmar = window.confirm(
      `Deseja realmente excluir ${idoso.Nome}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      await excluirIdosoApi(idoso.Id);

      setIdosos((idososAtuais) =>
        idososAtuais.filter(
          (item) => item.Id !== idoso.Id
        )
      );

      if (idosoSelecionado?.Id === idoso.Id) {
        setIdosoSelecionado(null);
      }

      if (
        mostrarFormularioEdicao &&
        idosoEditando.Id === idoso.Id
      ) {
        setMostrarFormularioEdicao(false);
      }
    } catch (erro) {
      console.error("Erro ao excluir idoso:", erro);
      alert(erro.message);
    }
  };

  // ==============================
  // EDITAR IDOSO
  // ==============================

  const editarIdoso = async (evento) => {
    evento.preventDefault();

    if (!cuidadorAtual) {
      alert("Nenhum cuidador está conectado.");
      return;
    }

    try {
      const dados = await atualizarIdosoApi(
        idosoEditando.Id,
        {
          Cuidador_Id: cuidadorAtual.Id,
          Nome: idosoEditando.Nome,
          "Data Nascimento":
            idosoEditando["Data Nascimento"],
          Observacoes: idosoEditando.Observacoes,
        }
      );

      setIdosos((idososAtuais) =>
        idososAtuais.map((idoso) =>
          idoso.Id === dados.Id ? dados : idoso
        )
      );

      if (idosoSelecionado?.Id === dados.Id) {
        setIdosoSelecionado(dados);
      }

      setMostrarFormularioEdicao(false);
    } catch (erro) {
      console.error("Erro ao atualizar idoso:", erro);
      alert(erro.message);
    }
  };

  // ==============================
  // PREPARAR EDIÇÃO
  // ==============================

  const prepararEdicaoIdoso = (idoso) => {
    setIdosoEditando({
      Id: idoso.Id,
      Nome: idoso.Nome,
      "Data Nascimento":
        idoso["Data Nascimento"],
      Observacoes: idoso.Observacoes || "",
    });

    setMostrarFormularioEdicao(true);
    setMostrarFormularioIdoso(false);
  };

  return {
    idosos,
    idosoSelecionado,
    setIdosoSelecionado,
    mostrarFormularioIdoso,
    setMostrarFormularioIdoso,
    novoIdoso,
    setNovoIdoso,
    mostrarFormularioEdicao,
    setMostrarFormularioEdicao,
    idosoEditando,
    setIdosoEditando,
    cadastrarIdoso,
    editarIdoso,
    excluirIdoso,
    prepararEdicaoIdoso,
  };
}