import { models } from '../Data/Sequelize.js';
import documentService from './DocumentService.js';
import openAIService from '../Services/OpenAIService.js';
import { countTokens, encodeTokens, decodeTokens } from '../Utilities/TokenUtility.js';
import { splitTextIntoSentences, splitTextIntoParagraphs } from '../Utilities/TextSplit.js';
import { groupSentencesBySimilarity } from '../Utilities/SimilarityCheck.js';
import { errorHandler } from '../Utilities/ErrorHandler.js';

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
