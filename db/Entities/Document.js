import { DataTypes, Sequelize } from 'sequelize';

export function initDocumentModel(sequelize) {
    Document.init(
        {
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
        },
        {
            sequelize,
            tableName: 'Documents',
            modelName: 'Document',
        }
    );
    return Document;
}
