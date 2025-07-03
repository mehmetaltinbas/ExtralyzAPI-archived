import { Sequelize } from 'sequelize';
import dbConfig from '../config.js';

const sequelize = new Sequelize(dbConfig);

import  { Document, initDocumentModel } from './Entities/Document.js';
import { User, initUserModel } from './Entities/User.js';
import { RearrangedContent, initRearrangedContentModel } from './Entities/RearrangedContent.js';
import { Question, initQuestionModel } from './Entities/Question.js';

initDocumentModel(sequelize);
initUserModel(sequelize);
initRearrangedContentModel(sequelize);
initQuestionModel(sequelize);
const models = {
    User,
    Document,
    RearrangedContent,
    Question,
};

models.User.hasMany(models.Document, {
    foreignKey: 'UserId',
    onDelete: 'CASCADE',
});
models.Document.belongsTo(models.User, {
    foreignKey: 'UserId',
});

models.Document.hasMany(models.RearrangedContent, {
    foreignKey: 'DocumentId',
    onDelete: 'CASCADE',
});
models.RearrangedContent.belongsTo(models.Document, {
    foreignKey: 'DocumentId',
});

models.RearrangedContent.hasMany(models.Question, {
    foreignKey: 'RearrangedContentId',
    onDelete: 'CASCADE',
});
models.Question.belongsTo(models.RearrangedContent, {
    foreignKey: 'RearrangedContentId',
});

export { sequelize, models };
