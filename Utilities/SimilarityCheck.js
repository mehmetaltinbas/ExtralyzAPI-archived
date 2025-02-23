import { countTokens, encodeTokens, decodeTokens } from "./TokenUtility.js";

const cosineSimilarity = (vec1, vec2) => {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
    const normA = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (normA * normB);
};

const groupSentencesBySimilarity = (sentencesWithEmbeddings, maxTokens) => {
    let chunks = [];
    let currentChunk = [];
    let currentTokenCount = 0;

    for (let i = 0; i < sentencesWithEmbeddings.length; i++) {
        const sentence = sentencesWithEmbeddings[i];
        const sentenceTokens = countTokens(sentence.text);

        if (currentTokenCount + sentenceTokens > maxTokens) {
            chunks.push({
                text: currentChunk.join(" "),
                number: chunks.length + 1,
                tokenCount: countTokens(currentChunk.join(" ")),
            });
            currentChunk = [];
            currentTokenCount = 0;
        }

        if (currentChunk.length > 0) {
            const lastSentenceEmbedding = sentencesWithEmbeddings[i - 1].embedding;
            const similarity = cosineSimilarity(lastSentenceEmbedding, sentence.embedding);
            if (similarity < 0.65) {
                // Anlam farkı varsa yeni chunk başlat
                chunks.push({
                    text: currentChunk.join(" "),
                    number: chunks.length + 1,
                    tokenCount: countTokens(currentChunk.join(" ")),
                });
                currentChunk = [];
                currentTokenCount = 0;
            }
        }

        currentChunk.push(sentence.text);
        currentTokenCount += sentenceTokens;
    }

    if (currentChunk.length > 0) {
        chunks.push({
            text: currentChunk.join(" "),
            number: chunks.length + 1,
            tokenCount: countTokens(currentChunk.join(" ")),
        });
    }

    return chunks;
};

export { groupSentencesBySimilarity };
