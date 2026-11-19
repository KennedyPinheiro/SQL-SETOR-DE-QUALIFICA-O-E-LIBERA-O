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
   INICIALIZAÇÃO DAS TABELAS
======================================== */

function setupDatabase() {
  ["militares", "lista_hoje", "logs_portao"].forEach(t =>
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
  });
}