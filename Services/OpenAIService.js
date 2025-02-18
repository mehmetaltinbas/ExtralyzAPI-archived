import { models } from "../Data/Sequelize.js";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import { countTokens, encodeTokens, decodeTokens } from '../Utilities/TokenUtility.js';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const ChatSummarizeAsync = async (chunk) => {
    let initialTokenCount = countTokens(chunk.text);
    let targetTokens = Math.round(initialTokenCount * chunk.ratio);
    let errorMargin = 0.05;
    let lowerLimit = Math.round(initialTokenCount * (chunk.ratio - errorMargin));
    let upperLimit = Math.round(initialTokenCount * (chunk.ratio + errorMargin));

    console.log("\n\n\n");
    console.log(`Ratio --> ${chunk.ratio}`);
    console.log(`lowerlimit --> ${lowerLimit}`);
    console.log(`upperlimit --> ${upperLimit}`);
    console.log(`Initial token count --> ${initialTokenCount}`);
    console.log(`Target token count --> ${targetTokens}`);
    console.log("\n\n\n");

    let summary;
    let attempt = 0;
    let newTokenCount = "";
    
    while (attempt < 3) {
        let message = "";
        if (newTokenCount === "") message = `I will give you a document with ${initialTokenCount} tokens, I want you to abstractive summarize this document in order to make it's token count ${targetTokens} exactly. \n\nDocument:\n${chunk.text}`;
        else message = `I will give you a document with ${initialTokenCount} tokens, I want you to abstractive summarize this document in order to make it's token count ${targetTokens} exactly.. Last time I asked you this you made a document with ${newTokenCount} tokens but that was wrong, I exactly want newly created document by you will have ${targetTokens} tokens. \n\nDocument:\n${chunk.text}.`;
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: message}],
            temperature: 0.7,
            max_completion_tokens: upperLimit
        });
        summary = response.choices[0].message.content;
        newTokenCount = countTokens(summary);

        console.log("\n\n");
        console.log(`Attempt ${attempt + 1}: Generated ${newTokenCount} tokens`);
        console.log(`Summarized is %${Math.floor(newTokenCount/initialTokenCount*100)} of extracted.`);
        console.log("\n\n");

        if (newTokenCount <= upperLimit && newTokenCount >= lowerLimit) return summary;

        attempt++;
    };

    return summary;
};

export default {
    ChatSummarizeAsync,
};
