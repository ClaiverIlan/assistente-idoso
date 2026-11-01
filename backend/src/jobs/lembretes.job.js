const {
  gerarLembretesProximosSeteDias,
} = require("../services/lembretes.service");

const INTERVALO = 60 * 1000;

let intervalo = null;
let executando = false;

function executarGeracaoLembretes() {
  if (executando) {
    return;
  }

  executando = true;

  try {
    gerarLembretesProximosSeteDias();

    console.log(
      "Agendador: verificação de lembretes concluída."
    );
  } catch (erro) {
    console.error(
      "Erro ao gerar lembretes automaticamente:",
      erro
    );
  } finally {
    executando = false;
  }
}

function iniciarAgendadorLembretes() {
  if (intervalo) {
    return;
  }

  console.log("Agendador automático de lembretes iniciado.");

  // Executa uma verificação assim que o backend inicia.
  executarGeracaoLembretes();

  // Repete a verificação a cada minuto.
  intervalo = setInterval(
    executarGeracaoLembretes,
    INTERVALO
  );
}

module.exports = {
  iniciarAgendadorLembretes,
};