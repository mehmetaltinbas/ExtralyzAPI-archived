import express from 'express';
import dotenv from 'dotenv';
import { sequelize } from './db/Sequelize';
import fs from 'fs';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true,
    }),
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);
fs.readdir('./Controllers', (err, files) => {
    if (err) {
        console.error('Failed to read Controllers directory:', err);
        return;
    }

    for (const file of files) {
        const route = file.replace('Controller.js', '').toLowerCase();
        void import(`./Controllers/${file.replace('.ts', '.js')}`)
            .then((controller) => {
                console.log(`\nLoaded controller: /api/${route}`);
                app.use(`/api/${route}`, controller.default);
            })
            .catch((err) => console.error(`Error loading ${file}:`, err));
    }
});

sequelize
    .sync({
        alter: true /*force: true*/,
    })
    .catch((err) => console.log('error occured while database sync: ' + err));

app.listen(port, () => {
    console.log('API: Server is running on port: ' + port);
});
