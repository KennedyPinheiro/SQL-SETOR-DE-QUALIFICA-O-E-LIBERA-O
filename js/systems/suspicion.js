/* ========================================
   SISTEMA DE SUSPEITA — S.Q.L.
   Investigação e descoberta de evidências
======================================== */


/* ========================================
   CONFIGURAÇÃO DE EVIDÊNCIAS
======================================== */

const suspicionEvidence = {
    forged_document: {
        points: 35,
        label: "Documento falsificado"
    },

    wrong_apartment: {
        points: 25,
        label: "Alojamento divergente"
    },

    duplicate_inside: {
        points: 40,
        label: "Morador já consta dentro do quartel"
    },

    physical_anomaly: {
        points: 20,
        label: "Anomalia física"
    },

    hat_mismatch: {
        points: 10,
        label: "Quepe divergente"
    },

    glasses_mismatch: {
        points: 10,
        label: "Óculos divergentes"
    },

    unauthorized: {
        points: 30,
        label: "Ausência de autorização"
    }
};


/* ========================================
   REGISTRO DE EVIDÊNCIAS
======================================== */

function discoverEvidence(evidenceKey) {
    const evidence = suspicionEvidence[evidenceKey];

    if (!evidence) return false;

    /* Evita contabilizar a mesma evidência duas vezes */

    if (gameState.discoveredEvidence.has(evidenceKey)) {
        return false;
    }

    /* Registra a evidência descoberta */

    gameState.discoveredEvidence.add(evidenceKey);

    /* Atualiza a suspeita */

    gameState.suspicion = Math.min(
        100,
        gameState.suspicion + evidence.points
    );

    return true;
}


/* ========================================
   REDEFINIÇÃO DA SUSPEITA
======================================== */

function resetSuspicion() {
    gameState.suspicion = 0;
    gameState.discoveredEvidence = new Set();
}


/* ========================================
   CLASSIFICAÇÃO DA SUSPEITA
======================================== */

function getSuspicionLevel() {
    const suspicion = gameState.suspicion;

    if (suspicion >= 80) {
        return {
            label: "CRÍTICO",
            level: "critical"
        };
    }

    if (suspicion >= 60) {
        return {
            label: "ALTO RISCO",
            level: "high"
        };
    }

    if (suspicion >= 40) {
        return {
            label: "SUSPEITO",
            level: "suspicious"
        };
    }

    if (suspicion >= 20) {
        return {
            label: "ATENÇÃO",
            level: "attention"
        };
    }

    return {
        label: "BAIXO",
        level: "low"
    };
}

/* ========================================
   VERIFICAÇÃO DE VALORES NO RESULTADO
======================================== */

function resultContainsValue(result, column, expectedValue) {
    if (!Array.isArray(result) || !result.length) return false;

    return result.some(row => {
        if (!(column in row)) return false;

        return String(row[column]).trim().toLowerCase() ===
            String(expectedValue).trim().toLowerCase();
    });
}
/* ========================================
   ANÁLISE DAS CONSULTAS SQL
======================================== */

function analyzeQueryEvidence(query, result) {
    if (!gameState.currentVisitor || !Array.isArray(result)) {
        return;
    }

    const visitor = gameState.currentVisitor;
    const real = gameState.realNeighbor;

    if (!visitor || !real) return;

    const sql = query.toLowerCase();

    /* ========================================
     DOCUMENTO FALSIFICADO
  ======================================== */

    if (
        gameState.visitorCase === "forged_document" &&
        sql.includes("militares") &&
        sql.includes("id_doc") &&
        sql.includes(visitor.id_doc.toLowerCase()) &&
        result.length === 0
    ) {
        if (discoverEvidence("forged_document")) {
            showSqlMessage(
                "EVIDÊNCIA DESCOBERTA: O documento apresentado não consta no banco de dados militar.",
                "notice"
            );
        }
    }
    /* ========================================
       ALOJAMENTO DIVERGENTE
    ======================================== */

    if (
        gameState.visitorCase === "wrong_apartment" &&
        sql.includes("militares") &&
        resultContainsValue(
            result,
            "alojamento",
            real.alojamento
        ) &&
        String(visitor.alojamento) !== String(real.alojamento)
    ) {
        if (discoverEvidence("wrong_apartment")) {
            showSqlMessage(
                `EVIDÊNCIA DESCOBERTA: O visitante informou o alojamento ${visitor.alojamento}, mas o registro oficial indica ${real.alojamento}.`,
                "notice"
            );
        }
    }
    /* ========================================
    ANOMALIA FÍSICA
 ======================================== */

    if (
        gameState.visitorCase === "physical_anomaly" &&
        sql.includes("militares") &&
        resultContainsValue(
            result,
            "pele",
            real.pele
        ) &&
        String(visitor.pele).toLowerCase() !==
        String(real.pele).toLowerCase()
    ) {
        if (discoverEvidence("physical_anomaly")) {
            showSqlMessage(
                `EVIDÊNCIA DESCOBERTA: A característica física do visitante diverge do cadastro oficial. Registro: ${real.pele}.`,
                "notice"
            );
        }
    }
    /* ========================================
     QUEPE DIVERGENTE
  ======================================== */

    if (
        gameState.visitorCase === "hat_mismatch" &&
        sql.includes("militares") &&
        resultContainsValue(
            result,
            "quepe",
            real.quepe
        ) &&
        String(visitor.quepe).toLowerCase() !==
        String(real.quepe).toLowerCase()
    ) {
        if (discoverEvidence("hat_mismatch")) {
            showSqlMessage(
                `EVIDÊNCIA DESCOBERTA: O uso de quepe pelo visitante diverge do cadastro oficial. Registro: ${real.quepe}.`,
                "notice"
            );
        }
    }

    /* ========================================
    ÓCULOS DIVERGENTES
 ======================================== */

    if (
        gameState.visitorCase === "glasses_mismatch" &&
        sql.includes("militares") &&
        resultContainsValue(
            result,
            "oculos",
            real.oculos
        ) &&
        String(visitor.oculos).toLowerCase() !==
        String(real.oculos).toLowerCase()
    ) {
        if (discoverEvidence("glasses_mismatch")) {
            showSqlMessage(
                `EVIDÊNCIA DESCOBERTA: O uso de óculos pelo visitante diverge do cadastro oficial. Registro: ${real.oculos}.`,
                "notice"
            );
        }
    }

    /* ========================================
    MORADOR JÁ ESTÁ DENTRO
 ======================================== */

    if (
        gameState.visitorCase === "duplicate_inside" &&
        sql.includes("logs_portao") &&
        result.some(row =>
            Object.values(row).some(value =>
                String(value).trim().toLowerCase() ===
                "dentro do quartel"
            )
        )
    ) {
        if (discoverEvidence("duplicate_inside")) {
            showSqlMessage(
                "EVIDÊNCIA DESCOBERTA: Os registros indicam que este morador já se encontra dentro do quartel.",
                "notice"
            );
        }
    }
    /* ========================================
    SEM AUTORIZAÇÃO
 ======================================== */

    if (
        gameState.visitorCase === "unauthorized" &&
        sql.includes("lista_hoje") &&
        result.some(row =>
            Object.values(row).some(value =>
                String(value).trim().toLowerCase() === "nao"
            )
        )
    ) {
        if (discoverEvidence("unauthorized")) {
            showSqlMessage(
                "EVIDÊNCIA DESCOBERTA: O visitante não possui autorização de entrada para hoje.",
                "notice"
            );
        }
    }
}