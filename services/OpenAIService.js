import { models } from '../db/Sequelize.js';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { countTokens, encodeTokens, decodeTokens } from '../utilities/TokenUtility.js';
import { errorHandler } from '../utilities/ErrorHandler.js';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const ChatGetEmbeddingsAsync = errorHandler(
    async function OpenAIService_ChatGetEmbeddingsAsync(sentences) {
        const response = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: sentences,
        });
        return response.data.map((item, index) => ({
            text: sentences[index],
            embedding: item.embedding,
        }));
    },
);

const ChatRefineAsync = errorHandler(async function OpenAIService_ChatRefineAsync(chunk) {
    const message = `Clean the following extracted text by removing unnecessary sections such as the table of contents, page numbers, author info, acknowledgments, dedications, legal disclaimers, footnotes, references, appendices, repeated headers/footers, and any non-essential metadata. Keep only the meaningful content without modifying or summarizing it.\nIf you find other irrelevant sections, remove them too.\nReturn only the cleaned text with no additional comments or explanations.\nExtracted Text:\n${chunk.text}`;
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'user',
                content: message,
            },
        ],
        temperature: 0.7,
    });
    return response.choices[0].message.content;
});

const ChatSummarizeAsync = errorHandler(
    async function OpenAIService_ChatSummarizeAsync(chunk) {
        let initialTokenCount = countTokens(chunk.text);
        let targetTokens = Math.round(initialTokenCount * chunk.ratio);
        let errorMargin = 0.075;
        let lowerLimit = Math.round(initialTokenCount * (chunk.ratio - errorMargin));
        let upperLimit = Math.round(initialTokenCount * (chunk.ratio + errorMargin));

        /*console.log(`\n\tChunk Number ${chunk.number}`);
    console.log(`Ratio --> ${chunk.ratio}`);
    console.log(`Chunk text --> ${chunk.text}`);
    console.log(`lowerlimit --> ${lowerLimit}`);
    console.log(`upperlimit --> ${upperLimit}`);
    console.log(`Initial token count --> ${initialTokenCount}`);
    console.log(`Target token count --> ${targetTokens}\n`);*/

        let summary;
        let attempt = 0;
        let newTokenCount = 0;
        let scenarios = [];

        while (attempt < 5) {
            let message = '';
            if (newTokenCount === 0)
                message = `I will give you a document with ${initialTokenCount} tokens, I want you to re-explain this document in order to make it's token count around ${targetTokens} tokens (min: ${lowerLimit}, max ${upperLimit}) without losing its meanings (Abstractive Summarization: Generate new sentences that capture the essence of the original test, Involving paraphrasing and condensing information). You can cut unnecessary parts ensuring conciseness. Only give the re-explained document in your answer, I don't want to see any comments because I will directly add this to my app. Include proper titles in re-explained version, ensuring covering the all parts of the document while cutting unnecessary informations. \n\nDocument:\n${chunk.text}`;
            else
                message = `I will give you a document with ${initialTokenCount} tokens, I want you to re-explain this document in order to make it's token count around ${targetTokens} (min: ${lowerLimit}, max ${upperLimit}) tokens without losing its meanings (Abstractive Summarization: Generate new sentences that capture the essence of the original test, Involving paraphrasing and condensing information). You can cut unnecessary parts ensuring conciseness. Last time I asked you this you made a document with ${newTokenCount} tokens but that was wrong, because this wasn't in rage of min: ${lowerLimit}, max: ${upperLimit}, make sure re-expleained version' token count will be inside this range. While forcing to be in this range, don't include meaningless words or sentences. Only give the re-explained document in your answer, I don't want to see any comments because I will directly add this to my app. Include proper titles in re-explained version. ensuring covering the all parts of the document while cutting unnecessary informations. \n\nDocument:\n${chunk.text}.`;
            const response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'user',
                        content: message,
                    },
                ],
                temperature: 0.7,
                max_completion_tokens: upperLimit,
            });
            summary = response.choices[0].message.content;
            newTokenCount = countTokens(summary);

            /*console.log(`\n\tChunk Number ${chunk.number}`);
        console.log(`Attempt ${attempt + 1}: Generated ${newTokenCount} tokens`);
        console.log(`Summarized is %${Math.floor((newTokenCount / initialTokenCount) * 100)} of extracted.\n`);*/

            if (newTokenCount <= upperLimit && newTokenCount >= lowerLimit) {
                const bestCaseScenario = {
                    summary: summary,
                    tokenCount: newTokenCount,
                    difference: Math.abs(targetTokens - newTokenCount),
                    ratio: Math.floor((newTokenCount / initialTokenCount) * 100) / 100,
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

        /*console.log(`Scenario --> ${JSON.stringify(scenarios, null, 2)}`);*/

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
    },
);

const ChatGenerateQuestionsAsync = errorHandler(
    async function OpenAIService_ChatGenerateQuestion(chunk) {
        const numberOfQuestions = Math.floor(chunk.tokenCount / 125);
        const message = `Document: \n ${chunk.text} \n\n Generate ${numberOfQuestions} practice questions from this document in classical response type, give question and its answer in json format like this: [ { "question": "...", "answer": "..." }, { "question": "...", "answer": "..." }, ... ] and give only this json nothing else because my app will directly parse this to store it into a variable. Ensure covering the most of the document with ${numberOfQuestions} questions, generate mid difficultyied questions.`;
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: message,
                },
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' },
        });
        const question = JSON.parse(response.choices[0].message.content);
        return question;
    },
);

const ChatEvaluateAnswerAsync = errorHandler(
    async function OpenAIService_ChatEvaluateAnswerAsync(data) {
        console.log(`\nChat data --> ${JSON.stringify(data)}\n`);
        const message = `Question: ${data.question}\nReal Answer: ${data.realAnswer}\nUser's Answer:${data.userAnswer}\n\nEvaluate user's answer to the question, depending on the real answer only. When evaluating, give a score to user's answer out of 100, tell what he is missing, tell what is wrong, tell what can be improved, tell what is correct. This evaluation will be directly displayed to the user, so prepare it just like you are talking with user. Give all this evaluation in this json format: \n { "score": ..., "missing": ..., "wrong": ..., "correct": ... }`;
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: message,
                },
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' },
        });
        let evaluation = JSON.parse(response.choices[0].message.content);
        evaluation.realAnswer = data.realAnswer;
        return evaluation;
    },
);

export default {
    ChatGetEmbeddingsAsync,
    ChatRefineAsync,
    ChatSummarizeAsync,
    ChatGenerateQuestionsAsync,
    ChatEvaluateAnswerAsync,
};
