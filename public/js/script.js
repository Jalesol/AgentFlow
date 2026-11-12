
const taskInput = document.getElementById("taskInput");
const executeButton = document.getElementById("executeButton");
const newTaskButton = document.getElementById("newTask");
const charCount = document.getElementById("charCount");

const resultsSection = document.getElementById("resultsSection");
const resultContent = document.getElementById("resultContent");
const executionStatus = document.getElementById("executionStatus");
const copyResultButton = document.getElementById("copyResultButton");

let currentReport = "";

const agents = {
    Researcher: {
        card: document.getElementById("researcherCard"),
        status: document.getElementById("researcherStatus")
    },
    Analyst: {
        card: document.getElementById("analystCard"),
        status: document.getElementById("analystStatus")
    },
    Writer: {
        card: document.getElementById("writerCard"),
        status: document.getElementById("writerStatus")
    }
};

// ========================================
// ESTILOS DE EXPORTAÇÃO
// ========================================

function addPrintStyles() {
    const style = document.createElement("style");

    style.textContent = `
        .pdf-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px 15px;
            color: #00d4ff;
            background: rgba(0, 212, 255, 0.08);
            border: 1px solid rgba(0, 212, 255, 0.25);
            border-radius: 7px;
            font-size: 10px;
            font-weight: 600;
            transition: 0.2s;
        }

        .pdf-button:hover {
            color: white;
            background: rgba(0, 212, 255, 0.16);
            border-color: #00d4ff;
        }

        .pdf-button:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        @media print {
            @page {
                size: A4;
                margin: 18mm;
            }

            body {
                background: white !important;
                color: #222 !important;
            }

            body * {
                visibility: hidden !important;
            }

            .result-panel,
            .result-panel * {
                visibility: visible !important;
            }

            .result-panel {
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                overflow: visible !important;
                background: white !important;
                border: none !important;
                box-shadow: none !important;
            }

            .result-header {
                padding: 0 0 15px !important;
                color: #333 !important;
                background: white !important;
                border-bottom: 1px solid #ddd !important;
            }

            .result-header button,
            .pdf-button,
            .secondary-button {
                display: none !important;
            }

            .result-content {
                padding: 20px 0 !important;
                color: #333 !important;
                background: white !important;
                font-family: Arial, sans-serif !important;
                font-size: 11pt !important;
                line-height: 1.65 !important;
            }

            .result-content h1 {
                color: #102a43 !important;
                font-size: 22pt !important;
            }

            .result-content h2 {
                color: #0875b9 !important;
                font-size: 15pt !important;
                border-bottom: 1px solid #ddd !important;
            }

            .result-content h3,
            .result-content strong {
                color: #172b4d !important;
            }

            .result-content p,
            .result-content li,
            .result-content blockquote {
                color: #333 !important;
            }

            .result-content blockquote {
                background: #f2f6fa !important;
                border-left-color: #168cff !important;
            }

            .result-content code,
            .result-content pre {
                color: #222 !important;
                background: #f1f3f5 !important;
                border: 1px solid #ddd !important;
            }

            .result-content pre {
                white-space: pre-wrap !important;
                overflow-wrap: anywhere !important;
            }

            .result-content pre code {
                border: none !important;
            }

            .result-content hr {
                border-top-color: #ddd !important;
            }

            .result-content li {
                break-inside: avoid;
            }

            .result-content h1,
            .result-content h2,
            .result-content h3 {
                break-after: avoid;
            }
        }
    `;

    document.head.appendChild(style);
}

// ========================================
// BOTÃO DE PDF
// ========================================

function createPdfButton() {
    const pdfButton = document.createElement("button");

    pdfButton.type = "button";
    pdfButton.className = "pdf-button";
    pdfButton.innerHTML = "↓ Exportar PDF";
    pdfButton.disabled = true;
    pdfButton.title = "Exportar relatório em PDF";

    copyResultButton.parentElement.appendChild(pdfButton);

    pdfButton.addEventListener("click", () => {
        if (!currentReport.trim()) {
            alert("Não existe relatório para exportar.");
            return;
        }

        document.title = "AgentFlow - Relatório";

        window.print();

        document.title = "AgentFlow";
    });

    return pdfButton;
}

addPrintStyles();

const exportPdfButton = createPdfButton();

// ========================================
// SEGURANÇA E MARKDOWN
// ========================================

function escapeHTML(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatInlineMarkdown(text) {
    let html = escapeHTML(text);

    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
    html = html.replace(/_(.*?)_/g, "<em>$1</em>");

    html = html.replace(/~~(.*?)~~/g, "<del>$1</del>");

    return html;
}

function renderMarkdown(markdown) {
    const lines = markdown.replace(/\r/g, "").split("\n");

    let html = "";
    let paragraph = [];
    let listType = null;
    let codeBlock = false;
    let codeLines = [];

    function closeParagraph() {
        if (paragraph.length > 0) {
            html += `<p>${formatInlineMarkdown(paragraph.join(" "))}</p>`;
            paragraph = [];
        }
    }

    function closeList() {
        if (listType) {
            html += `</${listType}>`;
            listType = null;
        }
    }

    function closeCodeBlock() {
        if (codeBlock) {
            html += `<pre><code>${escapeHTML(codeLines.join("\n"))}</code></pre>`;
            codeLines = [];
            codeBlock = false;
        }
    }

    for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("```")) {
            closeParagraph();
            closeList();

            if (codeBlock) {
                closeCodeBlock();
            } else {
                codeBlock = true;
            }

            continue;
        }

        if (codeBlock) {
            codeLines.push(line);
            continue;
        }

        if (!trimmed) {
            closeParagraph();
            closeList();
            continue;
        }

        const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);

        if (heading) {
            closeParagraph();
            closeList();

            const level = heading[1].length;
            const content = formatInlineMarkdown(heading[2]);

            html += `<h${level}>${content}</h${level}>`;
            continue;
        }

        if (/^([-*_])\1{2,}$/.test(trimmed)) {
            closeParagraph();
            closeList();

            html += "<hr>";
            continue;
        }

        if (trimmed.startsWith(">")) {
            closeParagraph();
            closeList();

            const quote = trimmed.replace(/^>\s?/, "");

            html += `<blockquote>${formatInlineMarkdown(quote)}</blockquote>`;
            continue;
        }

        const unorderedItem = trimmed.match(/^[-*+]\s+(.+)$/);

        if (unorderedItem) {
            closeParagraph();

            if (listType !== "ul") {
                closeList();
                html += "<ul>";
                listType = "ul";
            }

            html += `<li>${formatInlineMarkdown(unorderedItem[1])}</li>`;
            continue;
        }

        const orderedItem = trimmed.match(/^\d+\.\s+(.+)$/);

        if (orderedItem) {
            closeParagraph();

            if (listType !== "ol") {
                closeList();
                html += "<ol>";
                listType = "ol";
            }

            html += `<li>${formatInlineMarkdown(orderedItem[1])}</li>`;
            continue;
        }

        closeList();
        paragraph.push(trimmed);
    }

    closeParagraph();
    closeList();
    closeCodeBlock();

    return html;
}

// ========================================
// CONTROLE DOS AGENTES
// ========================================

function updateAgent(agentName, status) {
    const agent = agents[agentName];

    if (!agent || !agent.card || !agent.status) {
        console.error(`Agente não encontrado: ${agentName}`);
        return;
    }

    agent.card.classList.remove(
        "running",
        "completed",
        "error"
    );

    if (status !== "waiting") {
        agent.card.classList.add(status);
    }

    const labels = {
        waiting: "IDLE",
        running: "EXECUTANDO...",
        completed: "CONCLUÍDO",
        error: "ERRO"
    };

    agent.status.textContent = labels[status] || status;
}

function resetAgents() {
    Object.keys(agents).forEach((name) => {
        updateAgent(name, "waiting");
    });
}

// ========================================
// EXIBIÇÃO DO RELATÓRIO
// ========================================

function showResult(report) {
    currentReport = report;

    resultsSection.hidden = false;

    resultContent.innerHTML = renderMarkdown(report);

    executionStatus.textContent = "CONCLUÍDO";

    copyResultButton.disabled = false;
    exportPdfButton.disabled = false;
}

// ========================================
// EXECUÇÃO DO WORKFLOW
// ========================================

async function executeWorkflow() {
    const task = taskInput.value.trim();

    if (!task) {
        alert("Digite uma tarefa antes de executar.");
        taskInput.focus();
        return;
    }

    executeButton.disabled = true;
    executeButton.textContent = "Executando...";

    resetAgents();

    resultsSection.hidden = true;
    resultContent.innerHTML = "";
    currentReport = "";

    copyResultButton.disabled = true;
    exportPdfButton.disabled = true;

    executionStatus.textContent = "PROCESSANDO";

    try {
        const url = `/api/execute?task=${encodeURIComponent(task)}`;
        const response = await fetch(url);

        if (!response.ok) {
            let errorMessage = "Erro ao iniciar workflow.";

            try {
                const error = await response.json();
                errorMessage = error.message || errorMessage;
            } catch {
                // Mantém a mensagem padrão.
            }

            throw new Error(errorMessage);
        }

        if (!response.body) {
            throw new Error("Não foi possível receber os eventos.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";
        let completed = false;

        while (true) {
            const { value, done } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            const events = buffer.split("\n\n");
            buffer = events.pop() || "";

            for (const event of events) {
                const line = event
                    .split("\n")
                    .find((item) => item.startsWith("data: "));

                if (!line) continue;

                const data = JSON.parse(line.slice(6));

                if (data.type === "progress") {
                    console.log(
                        `Agente ${data.agent}: ${data.status}`
                    );

                    updateAgent(data.agent, data.status);
                }

                if (data.type === "complete") {
                    completed = true;

                    showResult(data.result.finalReport);

                    console.log("Workflow concluído:", data.result);
                }

                if (data.type === "error") {
                    throw new Error(data.message);
                }
            }
        }

        if (!completed) {
            throw new Error(
                "O workflow terminou sem retornar o relatório."
            );
        }

    } catch (error) {
        console.error("Erro no AgentFlow:", error);

        executionStatus.textContent = "FALHA";
        resultsSection.hidden = false;
        resultContent.textContent = error.message;

        currentReport = "";

        copyResultButton.disabled = true;
        exportPdfButton.disabled = true;

        Object.keys(agents).forEach((name) => {
            const card = agents[name].card;

            if (card && card.classList.contains("running")) {
                updateAgent(name, "error");
            }
        });

        alert(error.message);

    } finally {
        executeButton.disabled = false;
        executeButton.innerHTML =
            'Executar workflow <span>↗</span>';
    }
}

// ========================================
// EVENTOS DA INTERFACE
// ========================================

taskInput.addEventListener("input", () => {
    charCount.textContent =
        `${taskInput.value.length} / 5000 caracteres`;
});

executeButton.addEventListener("click", executeWorkflow);

newTaskButton.addEventListener("click", () => {
    taskInput.value = "";
    charCount.textContent = "0 / 5000 caracteres";

    resetAgents();

    resultsSection.hidden = true;
    resultContent.innerHTML = "";
    currentReport = "";

    copyResultButton.disabled = true;
    exportPdfButton.disabled = true;

    executionStatus.textContent = "PROCESSANDO";

    taskInput.focus();
});

// ========================================
// COPIAR RELATÓRIO
// ========================================

copyResultButton.addEventListener("click", async () => {
    if (!currentReport.trim()) return;

    try {
        await navigator.clipboard.writeText(currentReport);

        copyResultButton.textContent = "Copiado!";

        setTimeout(() => {
            copyResultButton.textContent = "Copiar relatório";
        }, 2000);

    } catch (error) {
        console.error("Erro ao copiar relatório:", error);
        alert("Não foi possível copiar o relatório.");
    }
});
