import { Sequelize } from 'sequelize';
import dbConfig from '../config.js';

const sequelize = new Sequelize(dbConfig);

import  Document from './entities/Document.js';
import User from './entities/User.js';
import RearrangedContent from './entities/RearrangedContent.js';
import initQuestionModel from './entities/Question.js';

const models = {
    User: User(sequelize, DataTypes),
    Document: Document(sequelize, DataTypes),
    RearrangedContent: RearrangedContent(sequelize, DataTypes),
    Question: Question(sequelize, DataTypes),
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
