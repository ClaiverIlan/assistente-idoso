import { useEffect, useState } from "react";

import {
  listarMedicamentos,
  listarLembretes,
  criarMedicamento,
  editarMedicamento as atualizarMedicamentoApi,
  excluirMedicamento as excluirMedicamentoApi,
} from "../services/api";

// Estado inicial do formulário de cadastro.
const estadoInicialNovoMedicamento = {
  Nome: "",
  Dosagem: "",
  Horario: "",
  Frequencia: "",
  Observacoes: "",
  agenda: [],
};

// Estado inicial do formulário de edição.
const estadoInicialMedicamentoEditando = {
  Id: null,
  Idoso_Id: null,
  Nome: "",
  Dosagem: "",
  Horario: "",
  Frequencia: "",
  Observacoes: "",
  agenda: [],
  agendaConfigurada: false,
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
  // ATUALIZAR LEMBRETES
  // ==============================

  // Consulta novamente os lembretes no backend.
  // Essa consulta também solicita a geração dos lembretes de hoje.
  const atualizarLembretes = async () => {
    try {
      const lembretesAtualizados = await listarLembretes();

      setLembretes(lembretesAtualizados);
    } catch (erro) {
      console.error(
        "Erro ao atualizar a lista de lembretes:",
        erro
      );
    }
  };

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
      const agenda = Array.isArray(novoMedicamento.agenda)
        ? novoMedicamento.agenda
        : [];

      const dados = await criarMedicamento({
        Idoso_Id: idosoSelecionado.Id,
        Nome: novoMedicamento.Nome,
        Dosagem: novoMedicamento.Dosagem,

        // Mantém o primeiro horário para compatibilidade.
        Horario:
          agenda.find((item) => item.Horario)?.Horario || "",

        Frequencia: novoMedicamento.Frequencia,
        Observacoes: novoMedicamento.Observacoes,

        // Envia todos os dias e horários programados.
        agenda: agenda.map((item) => ({
          Dia_Semana: Number(item.Dia_Semana),
          Horario: item.Horario,
        })),
      });

      setMedicamentos((medicamentosAtuais) => [
        ...medicamentosAtuais,
        dados,
      ]);

      // Atualiza os lembretes depois do cadastro.
      await atualizarLembretes();

      setNovoMedicamento({
        ...estadoInicialNovoMedicamento,
        agenda: [],
      });

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
      const agenda = Array.isArray(
        medicamentoEditando.agenda
      )
        ? medicamentoEditando.agenda
        : [];

      // Medicamentos antigos podem não ter uma agenda.
      // Nesse caso, não enviamos uma agenda vazia sem necessidade,
      // preservando o horário legado do cadastro.
      const agendaParaEnviar =
        agenda.length > 0 ||
        medicamentoEditando.agendaConfigurada
          ? agenda.map((item) => ({
              Dia_Semana: Number(item.Dia_Semana),
              Horario: item.Horario,
            }))
          : undefined;

      const dados = await atualizarMedicamentoApi(
        medicamentoEditando.Id,
        {
          Idoso_Id: medicamentoEditando.Idoso_Id,
          Nome: medicamentoEditando.Nome,
          Dosagem: medicamentoEditando.Dosagem,

          Horario:
            agenda.find((item) => item.Horario)?.Horario ||
            medicamentoEditando.Horario ||
            "",

          Frequencia: medicamentoEditando.Frequencia,
          Observacoes: medicamentoEditando.Observacoes,

          agenda: agendaParaEnviar,
        }
      );

      setMedicamentos((medicamentosAtuais) =>
        medicamentosAtuais.map((medicamento) =>
          medicamento.Id === dados.Id
            ? dados
            : medicamento
        )
      );

      // Atualiza a lista para refletir a nova programação.
      await atualizarLembretes();

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
  // DESATIVAR MEDICAMENTO
  // ==============================

  const excluirMedicamento = async (medicamento) => {
    const confirmar = window.confirm(
      `Deseja realmente desativar ${medicamento.Nome}? ` +
      "O histórico de lembretes será preservado."
    );

    if (!confirmar) {
      return;
    }

    try {
      await excluirMedicamentoApi(medicamento.Id);

      // O backend desativa o medicamento.
      // Ele deixa de aparecer na lista de ativos.
      setMedicamentos((medicamentosAtuais) =>
        medicamentosAtuais.filter(
          (item) => item.Id !== medicamento.Id
        )
      );

      // Não removemos os lembretes do estado local,
      // pois eles fazem parte do histórico.
      setMostrarFormularioEdicaoMedicamento(false);
    } catch (erro) {
      console.error(
        "Erro ao desativar medicamento:",
        erro
      );

      alert(erro.message);
    }
  };

  // ==============================
  // PREPARAR EDIÇÃO
  // ==============================

  const prepararEdicaoMedicamento = (medicamento) => {
    const agenda = Array.isArray(medicamento.agenda)
      ? medicamento.agenda.map((item) => ({
          Dia_Semana: Number(item.Dia_Semana),
          Horario: item.Horario,
        }))
      : [];

    setMedicamentoEditando({
      Id: medicamento.Id,
      Idoso_Id: medicamento.Idoso_Id,
      Nome: medicamento.Nome,
      Dosagem: medicamento.Dosagem,
      Horario: medicamento.Horario || "",
      Frequencia: medicamento.Frequencia || "",
      Observacoes: medicamento.Observacoes || "",
      agenda,

      // Identifica se esse medicamento já possuía agenda.
      agendaConfigurada: agenda.length > 0,
    });

    setMostrarFormularioEdicaoMedicamento(true);
    setMostrarFormularioMedicamento(false);
  };

  return {
    medicamentos,
    setMedicamentos,

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