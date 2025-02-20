import { models } from "../Data/Sequelize.js";
import userService from "./UserService.js";
import documentService from "./DocumentService.js";

const CreateAsync = async (authorization, data) => {
    try {
        const document = await documentService.GetByIdAsync(data.documentId,authorization,);

        const rearrangedContents = await GetAllAsync(authorization, data.documentId);
        console.log(`\nRearranged contents --> ${JSON.stringify(rearrangedContents, null, 2)}\n`);
        let version = 1;
        if (typeof rearrangedContents.length !== 0) version = rearrangedContents[rearrangedContents.length - 1].Version + 1;

        const rearrangedContent = await models.RearrangedContent.create({
            DocumentId: document.Id,
            Version: version,
            FormattedContent: data.text,
            FormattedType: data.type,
        });
        if (!rearrangedContent) return "Rearranged content couldn't created.";
        return "Rearranged content created.";
    } catch (error) {
        console.error("❌ Error in RearrangedDocument CreateAsync --> ", error.stack);
        return {
            success: false,
            message: "❌ Error in RearrangedDocument CreateAsync",
            error: error.message
        };
    }
};

const GetAllAsync = async (authorization, id) => {
    try {
        const document = await documentService.GetByIdAsync(id, authorization);
        const rearrangedContents = await models.RearrangedContent.findAll({
            where: {
                DocumentId: document.Id,
            },
        });
        if (!rearrangedContents) return "No rearranged content found.";
        return rearrangedContents;
    } catch (error) {
        return `Error --> ${error}`;
    }
};

const GetByIdAsync = async (id, authorization) => {
    try {
        const document = await documentService.GetByIdAsync(
            questionData.documentId,
            authorization,
        );
        const rearrangedContent = await models.RearrangedContent.findByPk(id);
        if (!rearrangedContent) return "No rearranged content found.";
        if (!(document.Id == rearrangedContent.DocumentId))
            return "You don't have any rearranged content with that Id.";
        return question;
    } catch (error) {
        return `Error --> ${error}`;
    }
};

const UpdateAsync = async () => {
    try {
    } catch (error) {
        return `Error --> ${error}`;
    }
};

const DeleteAsync = async (id) => {
    try {
        const rearrangedContent = await GetByIdAsync(id);
        if (typeof rearrangedContent == "string") return rearrangedContent;
        const deletedCount = await models.RearrangedContent.destroy({
            where: {
                Id: id,
            },
        });
        if (deletedCount === 0) return "No rearranged content found.";
        return "Rearranged content deleted.";
    } catch (error) {
        return `Error --> ${error}`;
    }
};

export default {
    CreateAsync,
    GetAllAsync,
    GetByIdAsync,
    UpdateAsync,
    DeleteAsync,
};
