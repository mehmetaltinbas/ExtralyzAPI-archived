import express from 'express';
import documentService from '../Services/DocumentService.js';
import userService from '../Services/UserService.js';
import multerMiddleware from '../Middlewares/MulterMiddleware.js';

const router = express.Router();


router.post('/create', multerMiddleware.single('file'), async function CreateDocument(req, res) {
    const currentUser = await userService.GetCurrentUserAsync(req.headers.authorization);
    if (req.file) {
        req.file.fileName = req.body.fileName;
        req.file.userId = currentUser.Id;
    };
    const message = await documentService.CreateAsync(req.file);
    res.send(message);
});

router.get('/', async function GetAllDocuments(req, res) {
    const documents = await documentService.GetAllAsync();
    res.send(documents);
});

router.get('/:id', async function GetDocumentById(req, res) {
    const document = await documentService.GetByIdAsync(req.params.id);
    res.send(document);
});

router.patch('/update/:id', async function UpdateDocument(req, res) {
    req.body.id = req.params.id;
    const message = await documentService.UpdateAsync(req.body);
    res.send(message);
});

router.delete('/delete/:id', async function DeleteDocument(req, res) {
    const message = await documentService.DeleteAsync(req.params.id);
    res.send(message);
});


export default router;