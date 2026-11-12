
import "dotenv/config";

import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import { executeWorkflow } from "./services/orchestrator.js";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/health", (req, res) => {
    res.json({
        status: "online",
        application: "AgentFlow",
        message: "Servidor funcionando corretamente."
    });
});

// Executa o workflow com transmissão de progresso em tempo real.
app.get("/api/execute", async (req, res) => {
    const task = req.query.task;

    if (!task || typeof task !== "string" || !task.trim()) {
        return res.status(400).json({
            status: "error",
            message: "Informe uma tarefa válida."
        });
    }

    if (task.length > 5000) {
        return res.status(400).json({
            status: "error",
            message: "A tarefa deve ter no máximo 5000 caracteres."
        });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
            status: "error",
            message: "Chave da API Gemini não configurada."
        });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders?.();

    const sendEvent = (data) => {
        if (!res.writableEnded) {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        }
    };

    try {
        const result = await executeWorkflow(task.trim(), (progress) => {
            sendEvent({
                type: "progress",
                ...progress
            });
        });

        sendEvent({
            type: "complete",
            result
        });

    } catch (error) {
        console.error("Erro no AgentFlow:", error);

        sendEvent({
            type: "error",
            message: error.message || "Erro ao executar o workflow."
        });
    } finally {
        res.end();
    }
});

app.listen(PORT, () => {
    console.log("----------------------------------");
    console.log("       AGENTFLOW ONLINE");
    console.log("----------------------------------");
    console.log(`Servidor: http://localhost:${PORT}`);
    console.log("Status: operacional");
});
