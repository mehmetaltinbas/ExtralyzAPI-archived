import { models } from "../Data/Sequelize.js";
import userService from "./UserService.js";
import documentService from "./DocumentService.js";
import { errorHandler } from "../Utilities/ErrorHandler.js";

const CreateAsync = errorHandler(
    async function QuestionService_CreateAsync(questionData, authorization) {
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
        return "Document created.";
    },
);

const GetAllAsync = errorHandler(
    async function QuestionService_GetAllAsync(authorization) {
        const document = await documentService.GetByIdAsync(
            questionData.documentId,
            authorization,
        );
        const questions = await models.Question.findAll({
            where: {
                DocumentId: document.Id,
            },
        });
        if (!questions) return "No question found.";
        return questions;
    },
);

const GetByIdAsync = errorHandler(
    async function QuestionService_GetByIdAsync(id, authorization) {
        const document = await documentService.GetByIdAsync(
            questionData.documentId,
            authorization,
        );
        const question = await models.Question.findByPk(id);
        if (!question) return "No question found.";
        if (!(document.Id == question.DocumentId))
            return "You don't have any question with that Id.";
        return question;
    },
);

const UpdateAsync = errorHandler(
    async function QuestionService_UpdateAsync() {},
);

const DeleteAsync = errorHandler(
    async function QuestionService_DeleteAsync(id) {
        const question = await GetByIdAsync(id);
        if (typeof question == "string") return question;
        const deletedCount = await models.Question.destroy({
            where: {
                Id: id,
            },
        });
        if (deletedCount === 0) return "No question found.";
        return "Question deleted.";
    },
);

export default {
    CreateAsync,
    GetAllAsync,
    GetByIdAsync,
    UpdateAsync,
    DeleteAsync,
};
