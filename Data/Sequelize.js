import { Sequelize, DataTypes } from 'sequelize';
import dbConfig from '../config.js';

const sequelize = new Sequelize(dbConfig);

import Document from './Entities/Document.js';
import User from './Entities/User.js';
import RearrangedContent from './Entities/RearrangedContent.js';
import Question from './Entities/Question.js';

const models = {
  User: User(sequelize, DataTypes),
  Document: Document(sequelize, DataTypes),
  RearrangedContent: RearrangedContent(sequelize, DataTypes),
  Question: Question(sequelize, DataTypes),
};

models.User.hasMany(models.Document, { foreignkey: 'DocumentId' });
models.Document.belongsTo(models.User, { foreignkey: 'UserId' });

models.Document.hasMany(models.RearrangedContent, {
  foreignkey: 'RearrangedContentId',
});
models.RearrangedContent.belongsTo(models.Document, {
  foreignkey: 'DocumentId',
});

models.Document.hasMany(models.Question, { foreignkey: 'QuestionId' });
models.Question.belongsTo(models.Document, { foreignkey: 'DocumentId' });

export { sequelize, models };
