import express from 'express';

const router = express.Router();

router.get('/document', (req, res) => {
    console.log("memoli");
    const div = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <div style="background-color: pink;">${"memoli"}</div>
        </body>
        </html>
        `;
    res.send(div);
}); 

export default router;