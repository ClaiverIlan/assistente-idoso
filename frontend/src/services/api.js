const API_URL = "http://localhost:3000/api";

// ==============================
// CUIDADORES
// ==============================

export async function listarCuidadores() {
  const resposta = await fetch(`${API_URL}/cuidadores`);

  if (!resposta.ok) {
    throw new Error("Erro ao buscar cuidadores.");
  }

  return resposta.json();
}

// ==============================
// IDOSOS
// ==============================

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

// ==============================
// MEDICAMENTOS
// ==============================

export async function listarMedicamentos() {
  const resposta = await fetch(`${API_URL}/medicamentos`);

  if (!resposta.ok) {
    throw new Error("Erro ao buscar medicamentos.");
  }

  return resposta.json();
}

export async function criarMedicamento(medicamento) {
  const resposta = await fetch(`${API_URL}/medicamentos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(medicamento),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      dados.erro || "Erro ao cadastrar medicamento."
    );
  }

  return dados;
}

export async function editarMedicamento(id, medicamento) {
  const resposta = await fetch(`${API_URL}/medicamentos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(medicamento),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      dados.erro || "Erro ao atualizar medicamento."
    );
  }

  return dados;
}

export async function excluirMedicamento(id) {
  const resposta = await fetch(
    `${API_URL}/medicamentos/${id}`,
    {
      method: "DELETE",
    }
  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      dados.erro || "Erro ao excluir medicamento."
    );
  }

  return dados;
}

// ==============================
// OCORRÊNCIAS
// ==============================

export async function listarOcorrencias() {
  const resposta = await fetch(`${API_URL}/ocorrencias`);

  if (!resposta.ok) {
    throw new Error("Erro ao buscar ocorrências.");
  }

  return resposta.json();
}

export async function criarOcorrencia(ocorrencia) {
  const resposta = await fetch(`${API_URL}/ocorrencias`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(ocorrencia),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      dados.erro || "Erro ao cadastrar ocorrência."
    );
  }

  return dados;
}

export async function editarOcorrencia(id, ocorrencia) {
  const resposta = await fetch(
    `${API_URL}/ocorrencias/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ocorrencia),
    }
  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      dados.erro || "Erro ao atualizar ocorrência."
    );
  }

  return dados;
}

export async function excluirOcorrencia(id) {
  const resposta = await fetch(
    `${API_URL}/ocorrencias/${id}`,
    {
      method: "DELETE",
    }
  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(
      dados.erro || "Erro ao excluir ocorrência."
    );
  }

  return dados;
}

// ==============================
// LEMBRETES
// ==============================

export async function listarLembretes() {
  const resposta = await fetch(`${API_URL}/lembretes`);

  if (!resposta.ok) {
    throw new Error("Erro ao buscar lembretes.");
  }

  return resposta.json();
}