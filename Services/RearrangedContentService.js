import { models } from "../Data/Sequelize.js";
import userService from "./UserService.js";
import documentService from "./DocumentService.js";

const CreateAsync = async (authorization, data) => {
    try {
        const document = await documentService.GetByIdAsync(data.documentId,authorization,);

        const rearrangedContents = await GetAllAsync(authorization, data.documentId);
        console.log(`\nRearranged contents --> ${JSON.stringify(rearrangedContents, null, 2)}\n`);
        let version = 1;
        if (rearrangedContents.length > 0) version = rearrangedContents[rearrangedContents.length - 1].Version + 1;

        const rearrangedContent = await models.RearrangedContent.create({
            DocumentId: document.Id,
            Version: version,
            FormattedContent: data.text,
            FormattedType: data.type,
        });
        if (!rearrangedContent) return "Rearranged content couldn't created.";
        return "Rearranged content created.";
    } catch (error) {
        console.error("Error in RearrangedDocumentService/CreateAsync --> ", error.stack);
        return {
            success: false,
            message: "Error in RearrangedDocumentService/CreateAsync",
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
        console.error("Error in RearrangedDocumentService/GetAllAsync --> ", error.stack);
        return {
            success: false,
            message: "Error in RearrangedDocumentService/GetAllAsync",
            error: error.message
        };
    }
};

const GetByVersionAsync = async (authorization, id, version) => {
    try {
        const document = await documentService.GetByIdAsync(
            id,
            authorization,
        );
        const rearrangedContent = await models.RearrangedContent.findOne({
            where: { 
                DocumentId: id,
                Version: version,
            },
        });
        if (!rearrangedContent) return "No rearranged content found.";
        if (!(document.Id == rearrangedContent.DocumentId))
            return "You don't have any rearranged content with that Id.";
        return rearrangedContent.FormattedContent;
    } catch (error) {
        console.error("Error in RearrangedDocumentService/GetByVersionAsync --> ", error.stack);
        return {
            success: false,
            message: "Error in RearrangedDocumentService/GetByVersionAsync",
            error: error.message
        };
    }
};

const GetByIdAsync = async (authorization, id) => {
    try {
        const rearrangedContent = await models.RearrangedContent.findByPk(id);
        const document = await documentService.GetByIdAsync(
            rearrangedContent.DocumentId,
            authorization
        );

        if (document.success === false || typeof document == "string") return document;

        return rearrangedContent
    } catch (error) {
        console.error("Error in RearrangedDocumentService/GetByIdAsync --> ", error.stack);
        return {
            success: false,
            message: "Error in RearrangedDocumentService/GetByIdAsync",
            error: error.message
        };
    }
}

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
        console.error("Error in RearrangedDocumentService/DeleteAsync --> ", error.stack);
        return {
            success: false,
            message: "Error in RearrangedDocumentService/DeleteAsync",
            error: error.message
        };
    }
};

export default {
    CreateAsync,
    GetAllAsync,
    GetByVersionAsync,
    GetByIdAsync,
    UpdateAsync,
    DeleteAsync,
};
