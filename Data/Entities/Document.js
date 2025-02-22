export default (sequelize, DataTypes) => {
    const Document = sequelize.define("Document", {
        Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        FileName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        FileType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        FilePath: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        FileContent: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    });
    return Document;
};