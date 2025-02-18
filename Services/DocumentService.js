import { models } from "../Data/Sequelize.js";
import userService from "./UserService.js";
import openAIService from "../Services/OpenAIService.js";
import fs from "fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import dotenv from "dotenv";
import multerMiddleware from "../Middlewares/MulterMiddleware.js";
import path from "path";
import { countTokens, encodeTokens, decodeTokens } from '../Utilities/TokenUtility.js';

dotenv.config();


const CompareTokenCountAsync = async (authorization, id) => {
    try {
        const document = await GetByIdAsync(id, authorization);
        if (typeof document == "string") return document;

        const extractedText = fs.readFileSync(document.ExtractedTextPath, "utf-8");
        const extractedTokenCount = countTokens(extractedText);

        const summarizedText = fs.readFileSync(document.SummarizedTextPath, "utf-8");
        const summarizedTokenCount = countTokens(summarizedText);

        return {
            extracted: extractedTokenCount,
            summarized: summarizedTokenCount,
            ratio: Math.floor((summarizedTokenCount/extractedTokenCount)*100),
        };
    } catch (error) {
        return `CompareTokenCountAsync Error --> ${error}`;
    }
}

const ExtractTextAsync = async (authorization, id) => {
    try {
        const document = await GetByIdAsync(id, authorization);
        if (typeof document == "string") return document;

        const dataBuffer = new Uint8Array(fs.readFileSync(document.FilePath));
        const pdf = await getDocument({ data: dataBuffer }).promise;
        let extractedText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            extractedText += textContent.items.map((item) => item.str).join(" ") + "\n";
        }

        const textFilePath = path.join(
            multerMiddleware.uploadsFolderPath,
            `${id}-Extracted.txt`
        );

        fs.writeFileSync(textFilePath, extractedText.trim(), "utf-8");
        await document.update({ ExtractedTextPath: textFilePath });

        return extractedText.trim();
    } catch (error) {
        return `ExtractTextAsync Error --> ${error}`;
    }
};

const SplitTextIntoChunksAsync = async (text, maxTokens = process.env.MAX_TOKENS || 1000) => {
    try {
        console.log(text);
        const totalTokens = countTokens(text);
        const tokenizedText = encodeTokens(text);

        const chunkCount = Math.ceil(totalTokens / maxTokens); //determining how many chunks we need
        const chunkSize = Math.ceil(totalTokens / chunkCount);
        let chunks = [];

        console.log(`\n Total Tokens: ${totalTokens} | Splitting into ${chunkCount} chunks with chunk size ${chunkSize} \n`);
        
        for (let i = 0; i < chunkCount; i++) {
            let chunkTokens = tokenizedText.slice(i * chunkSize, (i + 1) * chunkSize);
            let chunkText = decodeTokens(chunkTokens);
            chunks.push(chunkText);
        }

        console.log(`\n Chunk --> ${chunks[0]} \n`);

        return chunks;
    } catch (error) {
        return `Error --> ${error}`;
    }
};

const SummarizeAsync = async (data) => {
    try {
        const document = await GetByIdAsync(data.id, data.authorization);
        if (typeof document == "string") return document;

        const extractedText = fs.readFileSync(document.ExtractedTextPath, "utf-8");
        
        const chunks = await SplitTextIntoChunksAsync(extractedText);

        const summaries = await Promise.all(chunks.map(chunk => openAIService.ChatSummarizeAsync({ ratio: data.ratio, text: chunk })));
        const summary = summaries.join("\n");
        
        console.log(`\n ${summary} \n`);

        const textFilePath = path.join(
            multerMiddleware.uploadsFolderPath,
            `${data.id}-Summarized.txt`
        );

        fs.writeFileSync(textFilePath, summary, "utf-8");
        await document.update({ SummarizedTextPath: textFilePath });

        return summary;
    } catch (error) {
        return `Error --> ${error}`;
    }
};

const CreateAsync = async (documentData, authorization) => {
    try {
        const user = await userService.GetCurrentUserAsync(authorization);
        const document = await models.Document.create({
            UserId: user.Id,
            FilePath: documentData.path,
            FileName: documentData.fileName,
            FileType: documentData.mimetype,
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
            where: { UserId: user.Id },
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
            where: { Id: id },
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
