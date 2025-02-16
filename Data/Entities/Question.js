export default (sequelize, DataTypes) => {
  const Question = sequelize.define('Question', {
    Id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    QuestionText: {
      type: DataTypes.STRING,
    },
    QuestionType: {
      type: DataTypes.STRING,
    },
    Answer: {
      type: DataTypes.STRING,
    },
  });
  return Question;
};
