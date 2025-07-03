export default (sequelize, DataTypes) => {
    const Question = sequelize.define('Question', {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        QuestionType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        QuestionNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        QuestionContent: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        Answer: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    });
    return Question;
};
