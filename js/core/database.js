/* ========================================
  BANCO DE DADOS — S.Q.L.
======================================== */

const seedResidents = [
  { id_doc: "8841-FM", nome: "Francis Mosses", alojamento: "101", patente: "Soldado", quepe: "Sim", oculos: "Nao", pele: "Normal" },
  { id_doc: "3920-AR", nome: "Ana Rudboys", alojamento: "204", patente: "Cabo", quepe: "Nao", oculos: "Sim", pele: "Normal" },
  { id_doc: "7719-WA", nome: "W. Afton", alojamento: "302", patente: "Capitão", quepe: "Sim", oculos: "Sim", pele: "Normal" },
  { id_doc: "5510-ML", nome: "Mia Lin", alojamento: "105", patente: "Tenente", quepe: "Nao", oculos: "Nao", pele: "Normal" },
  { id_doc: "6102-CR", nome: "Carlos Rocha", alojamento: "401", patente: "Sargento", quepe: "Sim", oculos: "Nao", pele: "Normal" },
  { id_doc: "9034-EB", nome: "Elena Vance", alojamento: "202", patente: "Major", quepe: "Nao", oculos: "Sim", pele: "Normal" },
  { id_doc: "2280-JS", nome: "Jonas Silva", alojamento: "303", patente: "Soldado", quepe: "Nao", oculos: "Nao", pele: "Normal" },
  { id_doc: "4491-PT", nome: "Paula Torres", alojamento: "104", patente: "Cabo", quepe: "Sim", oculos: "Sim", pele: "Normal" },
  { id_doc: "7355-RK", nome: "Ravi Kumar", alojamento: "203", patente: "Subtenente", quepe: "Nao", oculos: "Sim", pele: "Normal" },
  { id_doc: "1802-LM", nome: "Lia Martins", alojamento: "301", patente: "Tenente", quepe: "Nao", oculos: "Nao", pele: "Normal" }
];
/* ========================================
 SISTEMA DE CASOS INVESTIGATIVOS — S.Q.L.
======================================== */

const investigationCases = [
  {
    id: "invalid_authorizer",
    description: "Responsável pela autorização inexistente.",
    weight: 2
  },
  {
    id: "unauthorized_sector",
    description: "Autorização emitida por setor divergente.",
    weight: 2
  },
  {
    id: "suspicious_time",
    description: "Horário da autorização inconsistente.",
    weight: 2
  },
  {
    id: "legitimate",
    description: "Autorização sem irregularidades.",
    weight: 5
  },
  {
    id: "cross_reference",
    description: "Caso que exige cruzamento de registros.",
    weight: 3
  },
  {
    id: "multiple_inconsistencies",
    description: "Caso com múltiplas inconsistências.",
    weight: 1
  }
];

/* ========================================
  INICIALIZAÇÃO DAS TABELAS
======================================== */

function setupDatabase() {
  ["militares", "lista_hoje", "logs_portao", "autorizacoes"].forEach(t =>
    alasql(`DROP TABLE IF EXISTS ${t}`)
  );

  alasql(`
      CREATE TABLE militares (
        id_doc STRING,
        nome STRING,
        alojamento STRING,
        patente STRING,
        quepe STRING,
        oculos STRING,
        pele STRING
      )
    `);

  alasql(`
      CREATE TABLE lista_hoje (
        id_doc STRING,
        autorizado STRING
      )
    `);

  alasql(`
      CREATE TABLE logs_portao (
        id_doc STRING,
        status_atual STRING
      )
    `);
  alasql(`
      CREATE TABLE autorizacoes (
          id_doc STRING,
          responsavel STRING,
          horario STRING,
          setor STRING,
          motivo STRING
      )
  `);

  seedResidents.forEach((resident, i) => {
    alasql(
      "INSERT INTO militares VALUES (?,?,?,?,?,?,?)",
      [
        resident.id_doc,
        resident.nome,
        resident.alojamento,
        resident.patente,
        resident.quepe,
        resident.oculos,
        resident.pele
      ]
    );

    alasql(
      "INSERT INTO lista_hoje VALUES (?,?)",
      [
        resident.id_doc,
        i === 4 ? "Nao" : "Sim"
      ]
    );

    alasql(
      "INSERT INTO logs_portao VALUES (?,?)",
      [
        resident.id_doc,
        i === 5 ? "Dentro do quartel" : "Fora do quartel"
      ]
    );
    alasql(
      "INSERT INTO autorizacoes VALUES (?,?,?,?,?)",
      [
        resident.id_doc,
        seedResidents[(i + 2) % seedResidents.length].id_doc,
        `${String(8 + i).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")
        }`,
        ["Portão Norte", "Portão Sul", "Portaria Central"][
        i % 3
        ],
        [
          "Visita familiar",
          "Entrega de documentos",
          "Solicitação de atendimento",
          "Visita autorizada pelo comando"
        ][i % 4]
      ]
    );
  });
  console.table(
    alasql(`
          SELECT
              a.id_doc AS visitante,
              COALESCE(m.nome, 'RESPONSÁVEL NÃO ENCONTRADO') AS responsavel,
              a.horario,
              a.setor,
              a.motivo
          FROM autorizacoes a
          LEFT JOIN militares m
              ON a.responsavel = m.id_doc
      `)
  );

}