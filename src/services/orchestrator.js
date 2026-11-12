
import { runResearcher } from "../agents/researcher.js";
import { runAnalyst } from "../agents/analyst.js";
import { runWriter } from "../agents/writer.js";

export async function executeWorkflow(task) {
    console.log("\n================================");
    console.log("       AGENTFLOW WORKFLOW");
    console.log("================================\n");

    console.log("[1/3] Researcher iniciado...");
    const research = await runResearcher(task);
    console.log("[1/3] Researcher concluído!");

    console.log("[2/3] Analyst iniciado...");
    const analysis = await runAnalyst(research);
    console.log("[2/3] Analyst concluído!");

    console.log("[3/3] Writer iniciado...");
    const report = await runWriter(research, analysis);
    console.log("[3/3] Writer concluído!");

    console.log("\nWorkflow finalizado com sucesso!");

    return {
        status: "success",
        workflow: "AgentFlow Multi-Agent",
        agents: [
            {
                name: "Researcher",
                status: "completed",
                result: research
            },
            {
                name: "Analyst",
                status: "completed",
                result: analysis
            },
            {
                name: "Writer",
                status: "completed",
                result: report
            }
        ],
        finalReport: report
    };
}
