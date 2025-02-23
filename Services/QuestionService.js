import { models } from "../Data/Sequelize.js";
import userService from "./UserService.js";
import documentService from "./DocumentService.js";
import { errorHandler } from "../Utilities/ErrorHandler.js";
import rearrangedContentService from "../Services/RearrangedContentService.js";
import openAIService from "../Services/OpenAIService.js";
import textProcessingService from "./TextProcessingService.js";

const GenerateQuestionsAsync = errorHandler(
    async function QuestionService_GenerateQuestionsAsync(authorization, id, version) {
        const rearrangedContent = await rearrangedContentService.GetByVersionAsync(authorization, id, version);
        if (rearrangedContent.isSuccess === false || typeof rearrangedContent == "string") return rearrangedContent;

        const content = rearrangedContent.FormattedContent;

        const chunks = await textProcessingService.SplitTextIntoChunksAsync(content, 1000);
        if (chunks.isSuccess === false) return chunks;

        const questions = await Promise.all(chunks.map((chunk) => openAIService.ChatGenerateQuestionsAsync(chunk)));

        const flattenQuestions = questions.flatMap((obj) => obj.questions);

        for (let i = 1; i < flattenQuestions.length; i++) {
            const question = flattenQuestions[i];
            const result = await CreateAsync(
                authorization, 
                id, 
                {
                    questionContent: question.question,
                    questionType: "Classic",
                    answer: question.answer,
                },
            );
            if (result.isSuccess == false) return result;
        };

        return flattenQuestions;
    },
);

const EvaluateAnswerAsync = errorHandler(async function QuestionService_EvaluateAnswerAsync(authorization, data) {
    const rearrangedContent = await rearrangedContentService.GetByIdAsync(authorization, data.rearrangedContentId);
    if (rearrangedContent.isSuccess == false) return rearrangedContent;

    const question = await models.Question.findOne({ where: { RearrangedContentId: rearrangedContent.Id, QuestionNumber: data.questionNumber }});
    const openAIResult = await openAIService.ChatEvaluateAnswerAsync({
        question: question.QuestionContent,
        realAnswer: question.Answer,
        userAnswer: data.answer,
    });
    return openAIResult;
});

const CreateAsync = errorHandler(async function QuestionService_CreateAsync(authorization, id, data) {
    const rearrangedContent = await rearrangedContentService.GetByIdAsync(authorization, id);
    if (rearrangedContent.isSuccess == false) return rearrangedContent;

    const questions = await GetAllByDocumentAsync(authorization, id);
    if (questions.isSuccess == false) return questions;

    let questionNumber = 1;
    if (questions.length > 0) questionNumber = questions[questions.length - 1].QuestionNumber + 1;

    const question = await models.Question.create({
        RearrangedContentId: rearrangedContent.Id,
        QuestionNumber: questionNumber,
        QuestionContent: data.questionContent,
        QuestionType: data.questionType,
        Answer: data.answer,
    });
    if (!question) return "Question couldn't created.";
    return "Question created.";
});

const GetAllByDocumentAsync = errorHandler(async function QuestionService_GetAllByDocumentAsync(authorization, id) {
    const rearrangedContent = await rearrangedContentService.GetByIdAsync(authorization, id);
    const questions = await models.Question.findAll({
        where: {
            RearrangedContentId: rearrangedContent.Id,
        },
    });
    if (!questions) return "No question found.";
    return questions;
});

const GetByIdAsync = errorHandler(async function QuestionService_GetByIdAsync(authorization, documentId, questionId) {
    const rearrangedContent = await rearrangedContentService.GetByIdAsync(authorization, id);
    const question = await models.Question.findByPk(questionId);
    if (!question) return "No question found.";
    if (!(rearrangedContent.Id == question.RearrangedContentId)) return "You don't have any question with that Id.";
    return question;
});

const UpdateAsync = errorHandler(async function QuestionService_UpdateAsync() {});

const DeleteAsync = errorHandler(async function QuestionService_DeleteAsync(id) {
    const question = await GetByIdAsync(id);
    if (typeof question == "string") return question;
    const deletedCount = await models.Question.destroy({
        where: {
            Id: id,
        },
    });
    if (deletedCount === 0) return "No question found.";
    return "Question deleted.";
});

export default {
    GenerateQuestionsAsync,
    EvaluateAnswerAsync,
    CreateAsync,
    GetAllByDocumentAsync,
    GetByIdAsync,
    UpdateAsync,
    DeleteAsync,
};
