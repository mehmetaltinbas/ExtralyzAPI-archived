import { Sequelize, DataTypes } from 'sequelize';
import dbConfig from '../config.js';


const sequelize = new Sequelize(dbConfig);

import Document from './Entities/Document.js';
import User from './Entities/User.js';

const models = {
    Document: Document(sequelize, DataTypes),
    User: User(sequelize, DataTypes)
};

models.User.hasMany(models.Document);
models.Document.belongsTo(models.User);

export { sequelize, models };