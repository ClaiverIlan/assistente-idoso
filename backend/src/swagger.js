const swaggerSpec = {
  openapi: "3.0.0",

  info: {
    title: "Assistente de Cuidado ao Idoso - API",
    version: "1.0.0",
    description: "API REST do sistema Assistente de Cuidado ao Idoso"
  },

  servers: [
    {
      url: "http://localhost:3000"
    }
  ],

  tags: [
    {
      name: "Cuidadores",
      description: "Operações relacionadas aos cuidadores"
    },
    {
      name: "Idosos",
      description: "Operações relacionadas aos idosos"
    },
    {
      name: "Medicamentos",
      description: "Operações relacionadas aos medicamentos"
    },
    {
      name: "Ocorrências",
      description: "Operações relacionadas às ocorrências"
    },
    {
      name: "Lembretes",
      description: "Operações relacionadas aos lembretes"
    }
  ],

  paths: {

    // =========================
    // CUIDADORES
    // =========================

    "/api/cuidadores": {
      get: {
        tags: ["Cuidadores"],
        summary: "Lista todos os cuidadores",
        responses: {
          200: {
            description: "Lista de cuidadores retornada com sucesso"
          },
          500: {
            description: "Erro ao consultar os cuidadores"
          }
        }
      },

      post: {
        tags: ["Cuidadores"],
        summary: "Cadastra um novo cuidador",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["Nome", "Email", "Tipo"],
                properties: {
                  Nome: {
                    type: "string",
                    example: "Carlos da Silva"
                  },
                  Email: {
                    type: "string",
                    example: "carlos@email.com"
                  },
                  Tipo: {
                    type: "string",
                    example: "Familiar"
                  }
                }
              }
            }
          }
        },

        responses: {
          201: {
            description: "Cuidador cadastrado com sucesso"
          },
          400: {
            description: "Dados obrigatórios não informados"
          },
          500: {
            description: "Erro ao cadastrar o cuidador"
          }
        }
      }
    },

    "/api/cuidadores/{id}": {
      put: {
        tags: ["Cuidadores"],
        summary: "Atualiza um cuidador existente",

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer"
            },
            example: 1
          }
        ],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["Nome", "Email", "Tipo"],
                properties: {
                  Nome: {
                    type: "string",
                    example: "João da Silva"
                  },
                  Email: {
                    type: "string",
                    example: "joao@email.com"
                  },
                  Tipo: {
                    type: "string",
                    example: "Familiar"
                  }
                }
              }
            }
          }
        },

        responses: {
          200: {
            description: "Cuidador atualizado com sucesso"
          },
          400: {
            description: "Dados obrigatórios não informados"
          },
          404: {
            description: "Cuidador não encontrado"
          },
          500: {
            description: "Erro ao atualizar o cuidador"
          }
        }
      },

      delete: {
        tags: ["Cuidadores"],
        summary: "Exclui um cuidador existente",

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer"
            },
            example: 4
          }
        ],

        responses: {
          200: {
            description: "Cuidador excluído com sucesso"
          },
          404: {
            description: "Cuidador não encontrado"
          },
          500: {
            description: "Erro ao excluir o cuidador"
          }
        }
      }
    },

    // =========================
    // IDOSOS
    // =========================

    "/api/idosos": {
      get: {
        tags: ["Idosos"],
        summary: "Lista todos os idosos",
        responses: {
          200: {
            description: "Lista de idosos retornada com sucesso"
          },
          500: {
            description: "Erro ao consultar os idosos"
          }
        }
      },

      post: {
        tags: ["Idosos"],
        summary: "Cadastra um novo idoso",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["Cuidador_Id", "Nome"],
                properties: {
                  Cuidador_Id: {
                    type: "integer",
                    example: 1
                  },
                  Nome: {
                    type: "string",
                    example: "Ana da Silva"
                  },
                  "Data Nascimento": {
                    type: "string",
                    example: "15/08/1950"
                  },
                  Observacoes: {
                    type: "string",
                    example: "Idosa de teste para validação do sistema"
                  }
                }
              }
            }
          }
        },

        responses: {
          201: {
            description: "Idoso cadastrado com sucesso"
          },
          400: {
            description: "Cuidador_Id ou Nome não informado"
          },
          500: {
            description: "Erro ao cadastrar o idoso"
          }
        }
      }
    },

    "/api/idosos/{id}": {
      put: {
        tags: ["Idosos"],
        summary: "Atualiza um idoso existente",

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer"
            },
            example: 2
          }
        ],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["Cuidador_Id", "Nome"],
                properties: {
                  Cuidador_Id: {
                    type: "integer",
                    example: 1
                  },
                  Nome: {
                    type: "string",
                    example: "Ana da Silva"
                  },
                  "Data Nascimento": {
                    type: "string",
                    example: "15/08/1950"
                  },
                  Observacoes: {
                    type: "string",
                    example: "Atualização de teste pela API."
                  }
                }
              }
            }
          }
        },

        responses: {
          200: {
            description: "Idoso atualizado com sucesso"
          },
          400: {
            description: "Cuidador_Id ou Nome não informado"
          },
          404: {
            description: "Idoso não encontrado"
          },
          500: {
            description: "Erro ao atualizar o idoso"
          }
        }
      },

      delete: {
        tags: ["Idosos"],
        summary: "Exclui um idoso existente",

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer"
            },
            example: 3
          }
        ],

        responses: {
          200: {
            description: "Idoso excluído com sucesso"
          },
          404: {
            description: "Idoso não encontrado"
          },
          500: {
            description: "Erro ao excluir o idoso"
          }
        }
      }
    },

    // =========================
    // MEDICAMENTOS
    // =========================

    "/api/medicamentos": {
      get: {
        tags: ["Medicamentos"],
        summary: "Lista todos os medicamentos",

        responses: {
          200: {
            description: "Lista de medicamentos retornada com sucesso"
          },
          500: {
            description: "Erro ao consultar os medicamentos"
          }
        }
      },

      post: {
        tags: ["Medicamentos"],
        summary: "Cadastra um novo medicamento",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["Idoso_Id", "Nome"],
                properties: {
                  Idoso_Id: {
                    type: "integer",
                    example: 2
                  },
                  Nome: {
                    type: "string",
                    example: "Losartana"
                  },
                  Dosagem: {
                    type: "string",
                    example: "50 mg"
                  },
                  Horario: {
                    type: "string",
                    example: "08:00"
                  },
                  Frequencia: {
                    type: "string",
                    example: "1 vez ao dia"
                  },
                  Observacoes: {
                    type: "string",
                    example: "Tomar pela manhã"
                  }
                }
              }
            }
          }
        },

        responses: {
          201: {
            description: "Medicamento cadastrado com sucesso"
          },
          400: {
            description: "Idoso_Id ou Nome não informado"
          },
          500: {
            description: "Erro ao cadastrar o medicamento"
          }
        }
      }
    },

    "/api/medicamentos/{id}": {
      put: {
        tags: ["Medicamentos"],
        summary: "Atualiza um medicamento existente",

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer"
            },
            example: 3
          }
        ],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["Idoso_Id", "Nome"],
                properties: {
                  Idoso_Id: {
                    type: "integer",
                    example: 2
                  },
                  Nome: {
                    type: "string",
                    example: "Losartana"
                  },
                  Dosagem: {
                    type: "string",
                    example: "100 mg"
                  },
                  Horario: {
                    type: "string",
                    example: "08:00"
                  },
                  Frequencia: {
                    type: "string",
                    example: "1 vez ao dia"
                  },
                  Observacoes: {
                    type: "string",
                    example: "Tomar pela manhã."
                  }
                }
              }
            }
          }
        },

        responses: {
          200: {
            description: "Medicamento atualizado com sucesso"
          },
          400: {
            description: "Idoso_Id ou Nome não informado"
          },
          404: {
            description: "Medicamento não encontrado"
          },
          500: {
            description: "Erro ao atualizar o medicamento"
          }
        }
      },

      delete: {
        tags: ["Medicamentos"],
        summary: "Exclui um medicamento existente",

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer"
            },
            example: 4
          }
        ],

        responses: {
          200: {
            description: "Medicamento excluído com sucesso"
          },
          404: {
            description: "Medicamento não encontrado"
          },
          500: {
            description: "Erro ao excluir o medicamento"
          }
        }
      }
    },

    // =========================
    // OCORRÊNCIAS
    // =========================

    "/api/ocorrencias": {
      get: {
        tags: ["Ocorrências"],
        summary: "Lista todas as ocorrências",

        responses: {
          200: {
            description: "Lista de ocorrências retornada com sucesso"
          },
          500: {
            description: "Erro ao consultar as ocorrências"
          }
        }
      },

      post: {
        tags: ["Ocorrências"],
        summary: "Cadastra uma nova ocorrência",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["Idoso_Id", "Tipo", "Descrição", "Data_Hora"],
                properties: {
                  Idoso_Id: {
                    type: "integer",
                    example: 2
                  },
                  Tipo: {
                    type: "string",
                    example: "Queda"
                  },
                  "Descrição": {
                    type: "string",
                    example: "Idosa apresentou uma queda."
                  },
                  Data_Hora: {
                    type: "string",
                    example: "2026-09-03 18:00:00"
                  }
                }
              }
            }
          }
        },

        responses: {
          201: {
            description: "Ocorrência cadastrada com sucesso"
          },
          400: {
            description: "Dados obrigatórios não informados"
          },
          500: {
            description: "Erro ao cadastrar a ocorrência"
          }
        }
      }
    },

    "/api/ocorrencias/{id}": {
      put: {
        tags: ["Ocorrências"],
        summary: "Atualiza uma ocorrência existente",

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer"
            },
            example: 4
          }
        ],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["Idoso_Id", "Tipo", "Descrição", "Data_Hora"],
                properties: {
                  Idoso_Id: {
                    type: "integer",
                    example: 2
                  },
                  Tipo: {
                    type: "string",
                    example: "Queda"
                  },
                  "Descrição": {
                    type: "string",
                    example: "Idosa apresentou uma queda durante a tarde."
                  },
                  Data_Hora: {
                    type: "string",
                    example: "2026-09-03 18:30:00"
                  }
                }
              }
            }
          }
        },

        responses: {
          200: {
            description: "Ocorrência atualizada com sucesso"
          },
          400: {
            description: "Dados obrigatórios não informados"
          },
          404: {
            description: "Ocorrência não encontrada"
          },
          500: {
            description: "Erro ao atualizar a ocorrência"
          }
        }
      },

      delete: {
        tags: ["Ocorrências"],
        summary: "Exclui uma ocorrência existente",

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer"
            },
            example: 5
          }
        ],

        responses: {
          200: {
            description: "Ocorrência excluída com sucesso"
          },
          404: {
            description: "Ocorrência não encontrada"
          },
          500: {
            description: "Erro ao excluir a ocorrência"
          }
        }
      }
    },

    // =========================
    // LEMBRETES
    // =========================

    "/api/lembretes": {
      get: {
        tags: ["Lembretes"],
        summary: "Lista todos os lembretes",

        responses: {
          200: {
            description: "Lista de lembretes retornada com sucesso"
          },
          500: {
            description: "Erro ao consultar os lembretes"
          }
        }
      },

      post: {
        tags: ["Lembretes"],
        summary: "Cadastra um novo lembrete",

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["Medicamento_Id", "Data_Hora", "Status"],
                properties: {
                  Medicamento_Id: {
                    type: "integer",
                    example: 3
                  },
                  Data_Hora: {
                    type: "string",
                    example: "2026-09-04 08:00:00"
                  },
                  Status: {
                    type: "string",
                    example: "Pendente"
                  }
                }
              }
            }
          }
        },

        responses: {
          201: {
            description: "Lembrete cadastrado com sucesso"
          },
          400: {
            description: "Dados obrigatórios não informados"
          },
          500: {
            description: "Erro ao cadastrar o lembrete"
          }
        }
      }
    },

    "/api/lembretes/{id}": {
      put: {
        tags: ["Lembretes"],
        summary: "Atualiza um lembrete existente",

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer"
            },
            example: 3
          }
        ],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["Medicamento_Id", "Data_Hora", "Status"],
                properties: {
                  Medicamento_Id: {
                    type: "integer",
                    example: 3
                  },
                  Data_Hora: {
                    type: "string",
                    example: "2026-09-04 08:00:00"
                  },
                  Status: {
                    type: "string",
                    example: "Concluído"
                  }
                }
              }
            }
          }
        },

        responses: {
          200: {
            description: "Lembrete atualizado com sucesso"
          },
          400: {
            description: "Dados obrigatórios não informados"
          },
          404: {
            description: "Lembrete não encontrado"
          },
          500: {
            description: "Erro ao atualizar o lembrete"
          }
        }
      },

      delete: {
        tags: ["Lembretes"],
        summary: "Exclui um lembrete existente",

        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer"
            },
            example: 4
          }
        ],

        responses: {
          200: {
            description: "Lembrete excluído com sucesso"
          },
          404: {
            description: "Lembrete não encontrado"
          },
          500: {
            description: "Erro ao excluir o lembrete"
          }
        }
      }
    }
  }
};

module.exports = swaggerSpec;