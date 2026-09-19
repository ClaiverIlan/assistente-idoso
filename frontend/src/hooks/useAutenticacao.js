import { useState } from "react";

import { listarCuidadores } from "../services/api";

function recuperarCuidadorSalvo() {
  const cuidadorSalvo = localStorage.getItem("cuidadorAtual");

  if (!cuidadorSalvo) {
    return null;
  }

  try {
    return JSON.parse(cuidadorSalvo);
  } catch (erro) {
    console.error("Erro ao recuperar cuidador salvo:", erro);

    localStorage.removeItem("cuidadorAtual");

    return null;
  }
}

export function useAutenticacao() {
  const [acessoLiberado, setAcessoLiberado] = useState(
    () => localStorage.getItem("cuidadorAtual") !== null
  );

  const [cuidadores, setCuidadores] = useState([]);

  const [cuidadorAtual, setCuidadorAtual] = useState(
    recuperarCuidadorSalvo
  );

  const entrar = async (email) => {
    try {
      const dadosCuidadores = await listarCuidadores();

      const cuidadorEncontrado = dadosCuidadores.find(
        (cuidador) =>
          cuidador.Email?.trim().toLowerCase() ===
          email.trim().toLowerCase()
      );

      if (!cuidadorEncontrado) {
        alert("Nenhum cuidador encontrado com esse e-mail.");
        return false;
      }

      setCuidadores(dadosCuidadores);
      setCuidadorAtual(cuidadorEncontrado);

      localStorage.setItem(
        "cuidadorAtual",
        JSON.stringify(cuidadorEncontrado)
      );

      setAcessoLiberado(true);

      return true;
    } catch (erro) {
      console.error("Erro ao realizar login:", erro);
      alert("Não foi possível realizar o acesso.");

      return false;
    }
  };

  const cadastrar = async (dados) => {
    try {
      const dadosCuidadores = await listarCuidadores();

      const emailInformado = dados.Email
        .trim()
        .toLowerCase();

      const emailJaCadastrado = dadosCuidadores.some(
        (cuidador) =>
          cuidador.Email?.trim().toLowerCase() ===
          emailInformado
      );

      if (emailJaCadastrado) {
        alert(
          "Já existe um cuidador cadastrado com esse e-mail."
        );

        return false;
      }

      const resposta = await fetch(
        "http://localhost:3000/api/cuidadores",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Nome: dados.Nome,
            Email: dados.Email.trim(),
            Tipo: dados.Tipo,
          }),
        }
      );

      const cuidadorCadastrado = await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          cuidadorCadastrado.erro ||
            "Erro ao cadastrar cuidador."
        );
      }

      setCuidadores((cuidadoresAtuais) => [
        ...cuidadoresAtuais,
        cuidadorCadastrado,
      ]);

      setCuidadorAtual(cuidadorCadastrado);

      localStorage.setItem(
        "cuidadorAtual",
        JSON.stringify(cuidadorCadastrado)
      );

      alert("Cuidador cadastrado com sucesso!");

      setAcessoLiberado(true);

      return true;
    } catch (erro) {
      console.error("Erro ao cadastrar cuidador:", erro);
      alert(erro.message);

      return false;
    }
  };

  const sair = () => {
    const confirmar = window.confirm(
      "Tem certeza que deseja sair da conta?"
    );

    if (!confirmar) {
      return false;
    }

    localStorage.removeItem("cuidadorAtual");

    setCuidadorAtual(null);
    setAcessoLiberado(false);

    return true;
  };

  return {
    acessoLiberado,
    cuidadorAtual,
    cuidadores,
    entrar,
    cadastrar,
    sair,
  };
}