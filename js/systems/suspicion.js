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
    },

    invalid_authorizer: {
        points: 30,
        label: "Responsável inexistente"
    },

    unauthorized_sector: {
        points: 25,
        label: "Setor divergente"
    },

    suspicious_time: {
        points: 25,
        label: "Horário inconsistente"
    },

    cross_reference: {
        points: 35,
        label: "Movimentação incompatível com a autorização"
    }
};


/* ========================================
   DESCOBERTA DE EVIDÊNCIAS
======================================== */

function discoverEvidence(evidenceKey) {
    const evidence = suspicionEvidence[evidenceKey];

    if (!evidence) return false;

    /* Evita contabilizar evidências duplicadas */

    if (gameState.discoveredEvidence.has(evidenceKey)) {
        return false;
    }

    /* Registra evidência */

    gameState.discoveredEvidence.add(evidenceKey);
    // Efeito sonoro de nova evidência
    if (typeof window.playSound === "function") {
        window.playSound("select");
    }

    /* Atualiza pontuação */

    gameState.suspicion = Math.min(
        100,
        gameState.suspicion + evidence.points
    );

    /* Atualiza interface */

    if (typeof updateSuspicionUI === "function") {
        updateSuspicionUI();
    }

    /* Anima atualização */

    if (typeof animateSuspicion === "function") {
        animateSuspicion();
    }

    return true;
}

/* ========================================
   RESET DO SISTEMA DE SUSPEITA
======================================== */

function resetSuspicion() {
    /* Zera pontuação */

    gameState.suspicion = 0;

    /* Limpa evidências */

    gameState.discoveredEvidence = new Set();

    /* Atualiza interface */

    /* Reinicia controle de alertas */

    if (typeof lastSuspicionAlertLevel !== "undefined") {
        lastSuspicionAlertLevel = "low";
    }
    if (typeof updateSuspicionUI === "function") {
        updateSuspicionUI();
    }
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

    const flaws = gameState.visitorFlaws?.length
        ? gameState.visitorFlaws
        : [gameState.visitorCase];

    const investigationCase = gameState.investigationCase || gameState.visitorCase;
    const sqlTables = new Set(
        (query.toLowerCase().match(/\b(militares|lista_hoje|logs_portao|autorizacoes|movimentacoes)\b/g) || [])
    );
    const visitorIds = new Set(
        [visitor.id_doc, real.id_doc]
            .filter(value => value !== null && value !== undefined)
            .map(value => String(value).trim().toLowerCase())
    );
    const isVisitorRow = row => Object.entries(row).some(([column, value]) =>
        ["id_doc", "visitante", "id_visitante"].includes(column.toLowerCase()) &&
        visitorIds.has(String(value).trim().toLowerCase())
    );
    const relevantRows = result.filter(isVisitorRow);
    const rowsToCheck = relevantRows;
    const hasFlag = (row, names) => names.some(name =>
        Object.entries(row).some(([column, value]) =>
            column.toLowerCase() === name &&
            [1, true, "1", "true", "sim"].includes(
                typeof value === "string" ? value.trim().toLowerCase() : value
            )
        )
    );
    const discoverSqlEvidence = (key, message) => {
        if (discoverEvidence(key)) showSqlMessage(`EVIDÊNCIA DESCOBERTA: ${message}`, "notice");
    };

    // Casos SQL legítimos nunca produzem evidência investigativa.
    if (investigationCase !== "legitimate") {
        if (sqlTables.has("autorizacoes")) {
            const authorizerRows = rowsToCheck.filter(row =>
                "responsavel" in row || hasFlag(row, ["responsavel_inexistente"])
            );
            const invalidAuthorizer = authorizerRows.some(row => {
                if (hasFlag(row, ["responsavel_inexistente"])) return true;
                const responsible = row.responsavel;
                if (!responsible) return false;
                return !alasql("SELECT id_doc FROM militares WHERE id_doc = ?", [responsible]).length;
            });
            if (invalidAuthorizer) {
                discoverSqlEvidence("invalid_authorizer", "A autorização aponta para um responsável inexistente.");
            }

            const wrongSector = rowsToCheck.some(row =>
                hasFlag(row, ["setor_irregular"]) ||
                ("setor" in row && String(row.setor).trim().toLowerCase() === "área restrita")
            );
            if (wrongSector) {
                discoverSqlEvidence("unauthorized_sector", "A autorização foi emitida por um setor divergente.");
            }

            const wrongTime = rowsToCheck.some(row => {
                if (hasFlag(row, ["horario_irregular"])) return true;
                if (!("horario" in row)) return false;
                const hour = Number(String(row.horario).slice(0, 2));
                return Number.isFinite(hour) && (hour < 6 || hour > 22);
            });
            if (wrongTime) {
                discoverSqlEvidence("suspicious_time", "O horário registrado para a autorização é inconsistente.");
            }
        }

        if (sqlTables.has("autorizacoes") && sqlTables.has("movimentacoes")) {
            const audit = typeof investigateVisitor === "function"
                ? investigateVisitor(visitor.id_doc)
                : null;
            const queryShowsCrossReference = relevantRows.some(row =>
                hasFlag(row, ["referencia_cruzada", "cross_reference", "movimentacao_incompativel"]) ||
                ("local" in row && String(row.local).trim().toLowerCase() === "arsenal" &&
                    "atividade" in row && String(row.atividade).trim().toLowerCase() === "inspeção")
            );
            if (audit?.evidences?.some(evidence => evidence.includes("Movimentação")) || queryShowsCrossReference) {
                discoverSqlEvidence("cross_reference", "A movimentação do responsável é incompatível com a autorização.");
            }
        }
    }

    // DOCUMENTO FALSIFICADO
    if (
        flaws.includes("forged_document") &&
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

    // ALOJAMENTO DIVERGENTE
    if (
        flaws.includes("wrong_apartment") &&
        sql.includes("militares") &&
        resultContainsValue(result, "alojamento", real.alojamento) &&
        String(visitor.alojamento) !== String(real.alojamento)
    ) {
        if (discoverEvidence("wrong_apartment")) {
            showSqlMessage(
                `EVIDÊNCIA DESCOBERTA: O visitante informou o alojamento ${visitor.alojamento}, mas o registro oficial indica ${real.alojamento}.`,
                "notice"
            );
        }
    }

    // ANOMALIA FÍSICA
    if (
        flaws.includes("physical_anomaly") &&
        sql.includes("militares") &&
        resultContainsValue(result, "pele", real.pele) &&
        String(visitor.pele).toLowerCase() !== String(real.pele).toLowerCase()
    ) {
        if (discoverEvidence("physical_anomaly")) {
            showSqlMessage(
                `EVIDÊNCIA DESCOBERTA: A característica física do visitante diverge do cadastro oficial. Registro: ${real.pele}.`,
                "notice"
            );
        }
    }

    // QUEPE DIVERGENTE
    if (
        flaws.includes("hat_mismatch") &&
        sql.includes("militares") &&
        resultContainsValue(result, "quepe", real.quepe) &&
        String(visitor.quepe).toLowerCase() !== String(real.quepe).toLowerCase()
    ) {
        if (discoverEvidence("hat_mismatch")) {
            showSqlMessage(
                `EVIDÊNCIA DESCOBERTA: O uso de quepe pelo visitante diverge do cadastro oficial. Registro: ${real.quepe}.`,
                "notice"
            );
        }
    }

    // ÓCULOS DIVERGENTES
    if (
        flaws.includes("glasses_mismatch") &&
        sql.includes("militares") &&
        resultContainsValue(result, "oculos", real.oculos) &&
        String(visitor.oculos).toLowerCase() !== String(real.oculos).toLowerCase()
    ) {
        if (discoverEvidence("glasses_mismatch")) {
            showSqlMessage(
                `EVIDÊNCIA DESCOBERTA: O uso de óculos pelo visitante diverge do cadastro oficial. Registro: ${real.oculos}.`,
                "notice"
            );
        }
    }

    // MORADOR JÁ ESTÁ DENTRO
    if (
        flaws.includes("duplicate_inside") &&
        sql.includes("logs_portao") &&
        result.some(row =>
            Object.values(row).some(value =>
                String(value).trim().toLowerCase() === "dentro do quartel"
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

    // SEM AUTORIZAÇÃO
    if (
        flaws.includes("unauthorized") &&
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
