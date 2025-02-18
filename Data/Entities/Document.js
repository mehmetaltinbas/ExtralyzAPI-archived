export default (sequelize, DataTypes) => {
    const Document = sequelize.define("Document", {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        FilePath: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ExtractedTextPath: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        SummarizedTextPath: {
            type: DataTypes.STRING,
            allowNull: true
        },
        FileName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        FileType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });
    return Document;
};
