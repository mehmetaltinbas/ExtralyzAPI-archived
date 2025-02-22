import { Sequelize, DataTypes } from "sequelize";
import dbConfig from "../config.js";

const sequelize = new Sequelize(dbConfig);

import Document from "./Entities/Document.js";
import User from "./Entities/User.js";
import RearrangedContent from "./Entities/RearrangedContent.js";
import Question from "./Entities/Question.js";

const models = {
    User: User(sequelize, DataTypes),
    Document: Document(sequelize, DataTypes),
    RearrangedContent: RearrangedContent(sequelize, DataTypes),
    Question: Question(sequelize, DataTypes),
};

models.User.hasMany(models.Document, {
    foreignKey: "UserId",
    onDelete: "CASCADE",
});
models.Document.belongsTo(models.User, {
    foreignKey: "UserId",
});

models.Document.hasMany(models.RearrangedContent, {
    foreignKey: "DocumentId",
    onDelete: "CASCADE",
});
models.RearrangedContent.belongsTo(models.Document, {
    foreignKey: "DocumentId",
});

models.Document.hasMany(models.Question, {
    foreignKey: "DocumentId",
    onDelete: "CASCADE",
});
models.Question.belongsTo(models.Document, {
    foreignKey: "DocumentId",
});

export { sequelize, models };
