import { DataTypes, Sequelize } from 'sequelize';

export function initQuestionModel(sequelize) {
    Question.init(
        {
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
        },
        {
            sequelize,
            tableName: 'Questions',
            modelName: 'Question',
        }
    );
    return Question;
}
