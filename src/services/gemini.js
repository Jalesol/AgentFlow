
import { GoogleGenAI } from "@google/genai";

const MAX_ATTEMPTS = 4;

const RETRYABLE_STATUS = [408, 429, 500, 502, 503, 504];

const wait = (ms) =>
    new Promise(resolve => setTimeout(resolve, ms));

export async function generateText(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("Chave da API Gemini não configurada.");
    }

    const ai = new GoogleGenAI({ apiKey });

    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            console.log(
                `Gemini: tentativa ${attempt}/${MAX_ATTEMPTS}...`
            );

            const response = await ai.models.generateContent({
                model,
                contents: prompt
            });

            return response.text;

        } catch (error) {
            const status = Number(error.status || error.code);

            const shouldRetry =
                RETRYABLE_STATUS.includes(status);

            if (!shouldRetry || attempt === MAX_ATTEMPTS) {
                console.error("Falha na Gemini:", error.message);

                if (status === 503) {
                    throw new Error(
                        "A Gemini continua sobrecarregada após 4 tentativas. Tente novamente mais tarde."
                    );
                }

                throw error;
            }

            const delay = 2000 * Math.pow(2, attempt - 1);

            console.log(
                `Gemini indisponível. Nova tentativa em ${delay / 1000} segundos.`
            );

            await wait(delay);
        }
    }
}
