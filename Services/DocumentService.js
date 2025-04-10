import { models } from '../Data/Sequelize.js';
import openAIService from '../Services/OpenAIService.js';
import rearrangedContentService from '../Services/RearrangedContentService.js';
import textProcessingService from './TextProcessingService.js';
import fs from 'fs';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import dotenv from 'dotenv';
import { countTokens, encodeTokens, decodeTokens } from '../Utilities/TokenUtility.js';
import { splitTextIntoSentences, splitTextIntoParagraphs } from '../Utilities/TextSplit.js';
import { groupSentencesBySimilarity } from '../Utilities/SimilarityCheck.js';
import { errorHandler } from '../Utilities/ErrorHandler.js';

dotenv.config();

const GetTokenCountAsync = errorHandler(
    async function DocumentService_GetTokenCountAsync(documentId) {
        const documentResponse = await GetByIdAsync(documentId);
        if (!documentResponse.isSuccess) return document;
        const tokenCount = countTokens(documentResponse.FileContent);
        return {
            isSuccess: true,
            message: 'Token count operation is done for given documentId.',
            tokenCount: tokenCount,
        };
    },
);

const ExtractTextAsync = errorHandler(
    async function DocumentService_ExtractTextAsync(filePath) {
        const dataBuffer = new Uint8Array(fs.readFileSync(filePath));
        const pdf = await getDocument({
            data: dataBuffer,
        }).promise;
        let extractedText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            extractedText += textContent.items.map((item) => item.str).join(' ') + '\n';
        }

        return extractedText.trim();
    },
);

const SummarizeAsync = errorHandler(async function DocumentService_SummarizeAsync(data) {
    const documentResponse = await GetByIdAsync(data.documentId);
    if (!documentResponse.isSuccess) return documentResponse;

    const extractedText = documentResponse.FileContent;

    const rawChunks = await textProcessingService.SplitTextIntoChunksAsync(
        extractedText,
        1800,
    );
    if (rawChunks.isSuccess === false) return rawChunks;
    const refined = await Promise.all(
        rawChunks.map((chunk) =>
            openAIService.ChatRefineAsync({
                text: chunk.text,
            }),
        ),
    );
    const refinedContent = refined.join('\n');

    const refinedChunks = await textProcessingService.SplitTextIntoChunksAsync(
        refinedContent,
        1000,
    );
    if (refinedChunks.isSuccess === false) return refinedChunks;

    const summaries = await Promise.all(
        refinedChunks.map((chunk) =>
            openAIService.ChatSummarizeAsync({
                text: chunk.text,
                ratio: data.ratio,
                number: chunk.number,
            }),
        ),
    );
    const summary = summaries.join('\n');

    const rearrangedContentCreationResponse = await rearrangedContentService.CreateAsync({
        documentId: documentResponse.Id,
        text: summary,
        type: documentResponse.FileType,
    });
    if (!rearrangedContentCreationResponse.isSuccess) return rearrangedContentCreationResponse;

    return { isSuccess: true, message: 'Document summarized.', summary };
});

const CreateAsync = errorHandler(async function DocumentService_CreateAsync(userId, data) {
    const extractedText = await ExtractTextAsync(data.path);
    const document = await models.Document.create({
        UserId: userId,
        FileName: data.fileName,
        FileType: data.mimetype,
        FilePath: data.path,
        FileContent: extractedText,
    });
    if (!document) return { isSuccess: false, message: "Document couldn't created." };
    return { isSuccess: true, message: 'Document created.', document };
});

const GetAllByUserIdAsync = errorHandler(
    async function DocumentService_GetAllByUserIdAsync(userId) {
        const documents = await models.Document.findAll({
            where: {
                UserId: userId,
            },
        });
        if (!documents)
            return {
                isSuccess: false,
                message: 'No document found associated with given userId.',
            };
        return { isSuccess: true, message: 'Document(s) found.', documents };
    },
);

const GetByIdAsync = errorHandler(
    async function DocumentService_GetByIdAsync(userId, documentId) {
        const document = await models.Document.findOne({
            where: {
                Id: documentId,
                UserId: userId,
            },
        });
        if (!document) return { isSuccess: false, message: 'No document found.' };
        return { isSuccess: true, message: 'Document found.', document };
    },
);

const UpdateAsync = errorHandler(async function DocumentService_UpdateAsync(userId, data) {
    const document = await GetByIdAsync(userId, data.documentId);
    if (!document.isSuccess) return document;
    document.FileName = data.fileName;
    document.save();
    return { isSuccess: true, message: 'Document updated.' };
});

const DeleteAsync = errorHandler(
    async function DocumentService_DeleteAsync(userId, documentId) {
        const document = await GetByIdAsync(userId, documentId);
        if (!document.isSuccess) return document;
        const deletedCount = await models.Document.destroy({
            where: {
                Id: documentId,
            },
        });
        if (deletedCount === 0) return { isSuccess: false, message: 'No document found.' };
        await fs.promises.unlink(document.FilePath);
        return { isSuccess: true, message: 'Document deleted.' };
    },
);

export default {
    GetTokenCountAsync,
    ExtractTextAsync,
    SummarizeAsync,
    CreateAsync,
    GetAllByUserIdAsync,
    GetByIdAsync,
    UpdateAsync,
    DeleteAsync,
};
