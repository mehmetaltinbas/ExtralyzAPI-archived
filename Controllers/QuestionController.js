import express from 'express';
import questionService from '../Services/QuestionService';

const router = express.Router();

router.get('/', async function GetAllQuestions(req, res) {
  const questions = await questionService.GetAllAsync(
    req.headers.authorization,
  );
  res.send(questions);
});

router.get('/:id', async function GetQuestionById(req, res) {
  const question = await questionService.GetByIdAsync(
    req.params.id,
    req.headers.authorization,
  );
  res.send(question);
});

export default router;
