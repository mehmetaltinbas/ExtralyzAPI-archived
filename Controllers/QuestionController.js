import express from "express";
import questionService from "../Services/QuestionService.js";

const router = express.Router();

router.post("/generatequestions/:id/:version", async function GenerateQuestions(req, res) {
    const result = await questionService.GenerateQuestionsAsync(
        req.headers.authorization,
        req.params.id,
        req.params.version,
    );
    res.json(result);
});

router.post('/evaluateanswer/:rearrangedcontentid/:questionnumber', async function EvaluateAnswer(req, res) {
    const result = await questionService.EvaluateAnswerAsync(
        req.headers.authorization,
        {
            rearrangedContentId: req.params.rearrangedcontentid,
            questionNumber: req.params.questionnumber,
            answer: req.body.answer
        }
    );
    res.json(result);
});

router.get("/getallbydocument/:id", async function GetAllQuestions(req, res) {
    const questions = await questionService.GetAllByDocumentAsync(req.headers.authorization, req.params.id);
    res.json(questions);
});

router.get("/:id", async function GetQuestionById(req, res) {
    const question = await questionService.GetByIdAsync(req.params.id, req.headers.authorization);
    res.json(question);
});

export default router;