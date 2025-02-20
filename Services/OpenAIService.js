import { models } from "../Data/Sequelize.js";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import {
    countTokens,
    encodeTokens,
    decodeTokens,
} from "../Utilities/TokenUtility.js";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const ChatRefineAsync = async (chunk) => {
    try {
        const message = `Clean the following extracted text by removing unnecessary sections such as the table of contents, page numbers, author info, acknowledgments, dedications, legal disclaimers, footnotes, references, appendices, repeated headers/footers, and any non-essential metadata. Keep only the meaningful content without modifying or summarizing it.\nIf you find other irrelevant sections, remove them too.\nReturn only the cleaned text with no additional comments or explanations.\nExtracted Text:\n${chunk.text}`;
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: message,
                },
            ],
            temperature: 0.7,
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("❌ Error in ChatRefineAsync: ", error.stack);
        return {
            success: false,
            message: "❌ Error in ChatRefineAsync",
            error: error.message
        };
    }
};

const ChatGetEmbeddingsAsync = async (sentences) => {
    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: sentences,
        });
        return response.data.map((item, index) => ({
            text: sentences[index],
            embedding: item.embedding,
        }));
    } catch (error) {
        console.error("❌ Error in ChatGetEmbeddingsAsync: ", error.stack);
        return {
            success: false,
            message: "❌ Error in ChatGetEmbeddingsAsync",
            error: error.message
        };
    }
};

const ChatSummarizeAsync = async (chunk) => {
    try {
        let initialTokenCount = countTokens(chunk.text);
        let targetTokens = Math.round(initialTokenCount * chunk.ratio);
        let errorMargin = 0.025;
        let lowerLimit = Math.round(
            initialTokenCount * (chunk.ratio - errorMargin),
        );
        let upperLimit = Math.round(
            initialTokenCount * (chunk.ratio + errorMargin),
        );

        console.log(`\n\tChunk Number ${chunk.number}`);
        console.log(`Ratio --> ${chunk.ratio}`);
        console.log(`Chunk text --> ${chunk.text}`);
        console.log(`lowerlimit --> ${lowerLimit}`);
        console.log(`upperlimit --> ${upperLimit}`);
        console.log(`Initial token count --> ${initialTokenCount}`);
        console.log(`Target token count --> ${targetTokens}\n`);

        let summary;
        let attempt = 0;
        let newTokenCount = 0;
        let scenarios = [];

        while (attempt < 5) {
            let message = "";
            if (newTokenCount === 0)
                message = `I will give you a document with ${initialTokenCount} tokens, I want you to re-explain this document in order to make it's token count exactly ${targetTokens} tokens without losing its meanings (Abstractive Summarization: Generate new sentences that capture the essence of the original test, Involving paraphrasing and condensing information). You can cut unnecessary parts ensuring conciseness. Only give the re-explained document in your answer, I don't want to see any comments because I will directly add this to my app. \n\nDocument:\n${chunk.text}`;
            else
                message = `I will give you a document with ${initialTokenCount} tokens, I want you to re-explain this document in order to make it's token count exactly ${targetTokens} tokens without losing its meanings (Abstractive Summarization: Generate new sentences that capture the essence of the original test, Involving paraphrasing and condensing information). You can cut unnecessary parts ensuring conciseness. Last time I asked you this you made a document with ${newTokenCount} tokens but that was wrong, I exactly want newly created document to have exactly ${targetTokens} tokens. Only give the re-explained document in your answer, I don't want to see any comments because I will directly add this to my app. \n\nDocument:\n${chunk.text}.`;
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "user",
                        content: message,
                    },
                ],
                temperature: 0.7,
                max_completion_tokens: upperLimit,
            });
            summary = response.choices[0].message.content;
            newTokenCount = countTokens(summary);

            console.log(`\n\tChunk Number ${chunk.number}`);
            console.log(
                `Attempt ${attempt + 1}: Generated ${newTokenCount} tokens`,
            );
            console.log(
                `Summarized is %${Math.floor((newTokenCount / initialTokenCount) * 100)} of extracted.\n`,
            );

            if (newTokenCount <= upperLimit && newTokenCount >= lowerLimit) {
                const bestCaseScenario = {
                    summary: summary,
                    tokenCount: newTokenCount,
                    difference: Math.abs(targetTokens - newTokenCount),
                    ratio:
                        Math.floor((newTokenCount / initialTokenCount) * 100) / 100,
                };
                console.log(
                    `\nChunk ${chunk.number} - Best case Scenario --> ${JSON.stringify(bestCaseScenario, null, 2)}\n`,
                );
                return summary;
            }

            const scenario = {
                summary: summary,
                tokenCount: newTokenCount,
                difference: Math.abs(targetTokens - newTokenCount),
                ratio: Math.floor((newTokenCount / initialTokenCount) * 100) / 100,
            };
            scenarios.push(scenario);

            attempt++;
        }

        console.log(`Scenario --> ${JSON.stringify(scenarios, null, 2)}`);

        const differences = scenarios.map((scenario) => scenario.difference);
        const bestDifference = Math.min(...differences);
        console.log(`\nChunk ${chunk.number} - Differences --> ${differences}\n`);
        const bestCaseScenario = scenarios.find(
            (scenario) => scenario.difference === bestDifference,
        );
        console.log(
            `\nChunk ${chunk.number} - The best case scenario --> ${JSON.stringify(bestCaseScenario, null, 2)} \n`,
        );
        summary = bestCaseScenario.summary;
        return summary;
    } catch (error) {
        console.error("❌ Error in ChatSummarizeAsync: ", error.stack);
        return {
            success: false,
            message: "❌ Error in ChatSummarizeAsync",
            error: error.message
        };
    }
};

export default {
    ChatRefineAsync,
    ChatGetEmbeddingsAsync,
    ChatSummarizeAsync,
};
