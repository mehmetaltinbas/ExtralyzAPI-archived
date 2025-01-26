import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import { sequelize } from './Data/Sequelize.js';


dotenv.config();
const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
fs.readdir('./Controllers', (err, files) => {
    for (let i = 0; i < files.length; i++) {
        import(`./Controllers/${files[i]}`)
            .then(controller => app.use('/api', controller.default))
            .catch(err => console.log(err));
    }
});

sequelize.sync({ force: false })
    .catch((err) => console.log('error occured while database sync: ' + err));

app.listen(port, () => {
    console.log("Server is running on port: " + port);
});