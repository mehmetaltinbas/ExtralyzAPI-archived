import { models } from "../Data/Sequelize.js";
import userService from "./UserService.js";
import openAIService from "../Services/OpenAIService.js";
import rearrangedContentService from '../Services/RearrangedContentService.js';
import fs from "fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import dotenv from "dotenv";
import multerMiddleware from "../Middlewares/MulterMiddleware.js";
import path from "path";
import {
    countTokens,
    encodeTokens,
    decodeTokens,
} from "../Utilities/TokenUtility.js";
import {
    splitTextIntoSentences,
    splitTextIntoParagraphs,
} from "../Utilities/TextSplit.js";
import { groupSentencesBySimilarity } from "../Utilities/SimilarityCheck.js";

dotenv.config();

const CompareTokenCountAsync = async (authorization, id) => {
    try {
        const document = await GetByIdAsync(id, authorization);
        if (typeof document == "string") return document;

        const extractedText = fs.readFileSync(
            document.ExtractedTextPath,
            "utf-8",
        );
        const extractedTokenCount = countTokens(extractedText);

        const summarizedText = fs.readFileSync(
            document.SummarizedTextPath,
            "utf-8",
        );
        const summarizedTokenCount = countTokens(summarizedText);

        return {
            extracted: extractedTokenCount,
            summarized: summarizedTokenCount,
            ratio: Math.floor(
                (summarizedTokenCount / extractedTokenCount) * 100,
            ),
        };
    } catch (error) {
        return `Error --> ${error}`;
    }
};

const ExtractTextAsync = async (filePath) => {
    try {
        const dataBuffer = new Uint8Array(fs.readFileSync(filePath));
        const pdf = await getDocument({
            data: dataBuffer,
        }).promise;
        let extractedText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            extractedText +=
                textContent.items.map((item) => item.str).join(" ") + "\n";
        }

        return extractedText.trim();
    } catch (error) {
        console.error("❌ Error in ExtractTextAsync: ", error.stack);
        return {
            success: false,
            message: "❌ Error in ExtractTextAsync",
            error: error.message
        };
    }
};

const SplitTextIntoChunksAsync = async (
    text,
    maxTokens
) => {
    try {
        const sentences = splitTextIntoSentences(text);
        const sentencesWithEmbeddings =
            await openAIService.ChatGetEmbeddingsAsync(sentences);

        const chunks = groupSentencesBySimilarity(
            sentencesWithEmbeddings,
            maxTokens,
        );

        console.log(`Generated Chunks --> ${JSON.stringify(chunks, null, 2)}`);
        return chunks;
    } catch (error) {
        console.error("❌ Error in SplitTextIntoChunksAsync: ", error.stack);
        return {
            success: false,
            message: "❌ Error in SplitTextIntoChunksAsync",
            error: error.message
        };
    };
};

const SummarizeAsync = async (authorization, data) => {
    try {
        const document = await GetByIdAsync(data.id, authorization);
        if (typeof document == "string") return document;

        const extractedText = document.FileContent;

        const rawChunks = await SplitTextIntoChunksAsync(extractedText, 2000);
        const refined = await Promise.all(
            rawChunks.map((chunk) =>
                openAIService.ChatRefineAsync({
                    text: chunk.text,
                }),
            ),
        );
        const refinedContent = refined.join("\n");

        const refinedChunks = await SplitTextIntoChunksAsync(refinedContent, 1000);
        const summaries = await Promise.all(
            refinedChunks.map((chunk) =>
                openAIService.ChatSummarizeAsync({
                    text: chunk.text,
                    ratio: data.ratio,
                    number: chunk.number,
                }),
            ),
        );
        const summary = summaries.join("\n");

        const result = await rearrangedContentService.CreateAsync(
            authorization,
            {
                documentId: document.Id,
                text: summary,
                type: document.FileType
            },
        );
        if (result.success === false) return result;

        return summary;
    } catch (error) {
        console.error("❌ Error in SummarizeAsync: ", error.stack);
        return {
            success: false,
            message: "❌ Error in SummarizeAsync",
            error: error.message
        };
    }
};

const CreateAsync = async (documentData, authorization) => {
    try {
        const user = await userService.GetCurrentUserAsync(authorization);
        const extractedText = await ExtractTextAsync(documentData.path);
        const document = await models.Document.create({
            UserId: user.Id,
            FileName: documentData.fileName,
            FileType: documentData.mimetype,
            FilePath: documentData.path,
            FileContent: extractedText,
        });
        if (!document) return "Document couldn't created.";
        return "Document created.";
    } catch (error) {
        return `Error --> ${error}`;
    }
};

const GetAllAsync = async (authorization) => {
    try {
        const user = await userService.GetCurrentUserAsync(authorization);
        const documents = await models.Document.findAll({
            where: {
                UserId: user.Id,
            },
        });
        if (!documents) return "No document found.";
        return documents;
    } catch (error) {
        return `Error --> ${error}`;
    }
};

const GetByIdAsync = async (id, authorization) => {
    try {
        const user = await userService.GetCurrentUserAsync(authorization);
        const document = await models.Document.findByPk(id);
        if (!document) return "No document found.";
        if (!(user.Id == document.UserId))
            return "You don't have any document with that Id.";
        return document;
    } catch (error) {
        return `Error --> ${error}`;
    }
};

const UpdateAsync = async (documentData, authorization) => {
    try {
        const document = await GetByIdAsync(documentData.id, authorization);
        if (typeof document == "string") return document;
        document.FileName = documentData.fileName;
        document.save();
        return `Document's name updated to: ${document.FileName}.`;
    } catch (error) {
        return `Error --> ${error}`;
    }
};

const DeleteAsync = async (id, authorization) => {
    try {
        const document = await GetByIdAsync(id, authorization);
        if (typeof document == "string") return document;
        const deletedCount = await models.Document.destroy({
            where: {
                Id: id,
            },
        });
        if (deletedCount === 0) return "No document found.";
        await fs.promises.unlink(document.FilePath);
        return "Document deleted.";
    } catch (error) {
        return `Error --> ${error}`;
    }
};

export default {
    CompareTokenCountAsync,
    ExtractTextAsync,
    SplitTextIntoChunksAsync,
    SummarizeAsync,
    CreateAsync,
    GetAllAsync,
    GetByIdAsync,
    UpdateAsync,
    DeleteAsync,
};
