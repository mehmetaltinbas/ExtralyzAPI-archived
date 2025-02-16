import express from 'express';
import documentService from '../Services/DocumentService.js';
import multerMiddleware from '../Middlewares/MulterMiddleware.js';

const router = express.Router();

router.post(
  '/create',
  multerMiddleware.single('file'),
  async function CreateDocument(req, res) {
    if (req.file && req.body.fileName) req.file.fileName = req.body.fileName;
    const message = await documentService.CreateAsync(
      req.file,
      req.headers.authorization,
    );
    res.send(message);
  },
);

router.get('/', async function GetAllDocuments(req, res) {
  const documents = await documentService.GetAllAsync(
    req.headers.authorization,
  );
  res.send(documents);
});

router.get('/:id', async function GetDocumentById(req, res) {
  const document = await documentService.GetByIdAsync(
    req.params.id,
    req.headers.authorization,
  );
  res.send(document);
});

router.patch('/update/:id', async function UpdateDocument(req, res) {
  req.body.id = req.params.id;
  const message = await documentService.UpdateAsync(
    req.body,
    req.headers.authorization,
  );
  res.send(message);
});

router.delete('/delete/:id', async function DeleteDocument(req, res) {
  const message = await documentService.DeleteAsync(req.params.id);
  res.send(message);
});

export default router;
