import { models } from '../Data/Sequelize.js';
import userService from './UserService.js';
import documentService from './DocumentService.js';

const CreateAsync = async (questionData, authorization) => {
  try {
    const document = await documentService.GetByIdAsync(
      questionData.documentId,
      authorization,
    );
    const question = await models.Question.create({
      DocumentId: document.Id,
      QestionText: questionData.questionText,
      QuestionType: questionData.questionType,
      Answer: questionData.answer,
    });
    if (!question) return "Document couldn't created.";
    return 'Document created.';
  } catch (error) {
    return `Error --> ${error}`;
  }
};

const GetAllAsync = async (authorization) => {
  try {
    const document = await documentService.GetByIdAsync(
      questionData.documentId,
      authorization,
    );
    const questions = await models.Question.findAll({
      where: { DocumentId: document.Id },
    });
    if (!questions) return 'No question found.';
    return questions;
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
    const question = await models.Question.findByPk(id);
    if (!question) return 'No question found.';
    if (!(document.Id == question.DocumentId))
      return "You don't have any question with that Id.";
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
    const question = await GetByIdAsync(id);
    if (typeof question == 'string') return question;
    const deletedCount = await models.Question.destroy({
      where: { Id: id },
    });
    if (deletedCount === 0) return 'No question found.';
    return 'Question deleted.';
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
