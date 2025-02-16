import { models } from '../Data/Sequelize.js';
import fs from 'fs';
import userService from './UserService.js';

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
    return 'Document created.';
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
    if (!documents) return 'No document found.';
    return documents;
  } catch (error) {
    return `Error --> ${error}`;
  }
};

const GetByIdAsync = async (id, authorization) => {
  try {
    const user = await userService.GetCurrentUserAsync(authorization);
    const document = await models.Document.findByPk(id);
    if (!document) return 'No document found.';
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
    if (typeof document == 'string') return document;
    document.FileName = documentData.fileName;
    document.save();
    return `Document's name updated to: ${document.FileName}.`;
  } catch (error) {
    return `Error --> ${error}`;
  }
};

const DeleteAsync = async (id) => {
  try {
    const document = await GetByIdAsync(id);
    if (typeof document == 'string') return document;
    const deletedCount = await models.Document.destroy({
      where: { Id: id },
    });
    if (deletedCount === 0) return 'No document found.';
    await fs.promises.unlink(document.FilePath);
    return 'Document deleted.';
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
