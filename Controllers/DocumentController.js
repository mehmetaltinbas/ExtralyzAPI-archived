import express from 'express';
import documentService from '../Services/DocumentService.js';
import multerMiddleware from '../Middlewares/MulterMiddleware.js';
import authMiddleware from '../Middlewares/AuthMiddleware.js';

const router = express.Router();

router.get('/gettokencount/:documentId', async function GetTokenCount(req, res) {
    const documentTokenCountResponse = await documentService.GetTokenCountAsync(
        req.params.documentId,
    );
    res.json(documentTokenCountResponse);
});

router.post('/summarize/:documentId', authMiddleware, async function Summarize(req, res) {
    const documentSummarizationResponse = await documentService.SummarizeAsync({
        documentId: req.params.documentId,
        ratio: req.body.ratio,
    });
    res.json(documentSummarizationResponse);
});

router.post(
    '/create',
    authMiddleware,
    multerMiddleware.upload.single('file'),
    async function CreateDocument(req, res) {
        if (req.file && req.body.fileName) req.file.fileName = req.body.fileName;
        const documentCreationResponse = await documentService.CreateAsync(
            req.user.userId,
            req.file,
        );
        res.json(documentCreationResponse);
    },
);

router.get('/getallbyuserid', authMiddleware, async function GetAllDocumentsByUserId(req, res) {
    const documentsResponse = await documentService.GetAllByUserIdAsync(req.user.userId);
    res.json(documentsResponse);
});

router.get('/getbyid/:documentId', authMiddleware, async function GetDocumentById(req, res) {
    const documentResponse = await documentService.GetByIdAsync(
        req.user.userId,
        req.params.documentId,
    );
    res.json(documentResponse);
});

router.patch('/update/:documentId', authMiddleware, async function UpdateDocument(req, res) {
    req.body.documentId = req.params.documentId;
    const result = await documentService.UpdateAsync(req.user.userId, req.body);
    res.json(result);
});

router.delete('/delete/:id', authMiddleware, async function DeleteDocument(req, res) {
    const result = await documentService.DeleteAsync(req.params.id, req.headers.authorization);
    res.json(result);
});

export default router;
