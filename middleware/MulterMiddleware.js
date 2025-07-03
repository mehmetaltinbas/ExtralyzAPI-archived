import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsFolderPath = path.join(__dirname, '../Uploads/');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsFolderPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
});

export default {
    uploadsFolderPath,
    upload,
};
