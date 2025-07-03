import { models } from '../db/Sequelize.js';
import documentService from './DocumentService.js';
import openAIService from './OpenAIService.js';
import { countTokens, encodeTokens, decodeTokens } from '../utilities/TokenUtility.js';
import { splitTextIntoSentences, splitTextIntoParagraphs } from '../utilities/TextSplit.js';
import { groupSentencesBySimilarity } from '../utilities/SimilarityCheck.js';
import { errorHandler } from '../utilities/ErrorHandler.js';

const SplitTextIntoChunksAsync = errorHandler(
    async function TextProcessingService_SplitTextIntoChunksAsync(text, maxTokens) {
        const sentences = splitTextIntoSentences(text);

        const sentencesWithEmbeddings = await openAIService.ChatGetEmbeddingsAsync(sentences);

        const chunks = groupSentencesBySimilarity(sentencesWithEmbeddings, maxTokens);

        return chunks;
    },
);

export default {
    SplitTextIntoChunksAsync,
};
