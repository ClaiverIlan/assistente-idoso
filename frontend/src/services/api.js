const API_URL = "http://localhost:3000/api";

// CUIDADORES
export async function listarCuidadores() {
  const resposta = await fetch(`${API_URL}/cuidadores`);

  if (!resposta.ok) {
    throw new Error("Erro ao buscar cuidadores.");
  }

  return resposta.json();
}

// IDOSOS
export async function listarIdosos() {
  const resposta = await fetch(`${API_URL}/idosos`);

  if (!resposta.ok) {
    throw new Error("Erro ao buscar idosos.");
  }

  return resposta.json();
}

export async function criarIdoso(idoso) {
  const resposta = await fetch(`${API_URL}/idosos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(idoso),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || "Erro ao cadastrar idoso.");
  }

  return dados;
}

export async function editarIdoso(id, idoso) {
  const resposta = await fetch(`${API_URL}/idosos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(idoso),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || "Erro ao atualizar idoso.");
  }

  return dados;
}

export async function excluirIdoso(id) {
  const resposta = await fetch(`${API_URL}/idosos/${id}`, {
    method: "DELETE",
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.erro || "Erro ao excluir idoso.");
  }

  return dados;
}

// MEDICAMENTOS
export async function listarMedicamentos() {
  const resposta = await fetch(`${API_URL}/medicamentos`);

  if (!resposta.ok) {
    throw new Error("Erro ao buscar medicamentos.");
  }

  return resposta.json();
}

// OCORRÊNCIAS
export async function listarOcorrencias() {
  const resposta = await fetch(`${API_URL}/ocorrencias`);

  if (!resposta.ok) {
    throw new Error("Erro ao buscar ocorrências.");
  }

  return resposta.json();
}

// LEMBRETES
export async function listarLembretes() {
  const resposta = await fetch(`${API_URL}/lembretes`);

  if (!resposta.ok) {
    throw new Error("Erro ao buscar lembretes.");
  }

  return resposta.json();
}