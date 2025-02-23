import express from "express";
import documentService from "../Services/DocumentService.js";
import multerMiddleware from "../Middlewares/MulterMiddleware.js";

const router = express.Router();

router.get("/chunks/:id", async function Test(req, res) {
    const chunks = await documentService.SplitTextIntoChunksAsync(req.headers.authorization, req.params.id);
    res.json(chunks);
});

router.get("/gettokencount/:id", async function GetTokenCount(req, res) {
    const result = await documentService.GetTokenCountAsync(req.headers.authorization, req.params.id);
    res.json(result);
});

router.post("/summarize/:id", async function Summarize(req, res) {
    const summarizedText = await documentService.SummarizeAsync(req.headers.authorization, {
        id: req.params.id,
        ratio: req.body.ratio,
    });
    res.json(summarizedText);
});

router.post("/create", multerMiddleware.upload.single("file"), async function CreateDocument(req, res) {
    if (req.file && req.body.fileName) req.file.fileName = req.body.fileName;
    const message = await documentService.CreateAsync(req.headers.authorization, req.file);
    res.json(message);
});

router.get("/getall", async function GetAllDocuments(req, res) {
    const documents = await documentService.GetAllAsync(req.headers.authorization);
    res.json(documents);
});

router.get("/getbyid/:id", async function GetDocumentById(req, res) {
    const document = await documentService.GetByIdAsync(req.params.id, req.headers.authorization);
    res.json(document);
});

router.patch("/update/:id", async function UpdateDocument(req, res) {
    req.body.id = req.params.id;
    const message = await documentService.UpdateAsync(req.body, req.headers.authorization);
    res.json(message);
});

router.delete("/delete/:id", async function DeleteDocument(req, res) {
    const message = await documentService.DeleteAsync(req.params.id, req.headers.authorization);
    res.json(message);
});

export default router;
