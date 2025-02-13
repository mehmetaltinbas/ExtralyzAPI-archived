import { models } from '../Data/Sequelize.js';
import fs from 'fs';


const CreateAsync = async (documentData) => {
    try {
        const document = await models.Document.create({
            FilePath: documentData.path,
            FileName: documentData.fileName,
            FileType: documentData.mimetype,
            UserId: documentData.userId
        });
        if (!document) return "Something went wrong.";
        return "Document created."
    } catch (error) {
        return `Error --> ${error}`;
    }
};

const GetAllAsync = async (userId) => {
    try {
        const documents = await models.Document.findAll({ where: { UserId: userId }});
        return documents;
    } catch (error) {
        return `Error --> ${error}`;
    }
};

const GetByIdAsync = async (id) => {
    try {
        const document = await models.Document.findByPk(id);
        if (!document) return "No document found.";
        return document;
    } catch (error) {
        return `Error --> ${error}`;
    }
};

const UpdateAsync = async (documentData) => {
    try {
        
    } catch (error) {
        return `Error --> ${error}`;
    }
};

const DeleteAsync = async (id) => {
    try {
        const document = await GetByIdAsync(id);
        const deletedCount = await models.Document.destroy({ where: { Id: id }});
        if (deletedCount === 0) return "No document found.";
        await fs.promises.unlink(document.FilePath);
        return "Document deleted.";
    } catch (error) {
        return `Error --> ${error}`;
    }
};
    

export default { CreateAsync, GetAllAsync, GetByIdAsync, UpdateAsync, DeleteAsync }