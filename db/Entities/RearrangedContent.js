import { DataTypes, Sequelize } from 'sequelize';

export function initRearrangedContentModel(sequelize) {
    RearrangedContent.init(
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Version: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            FormattedType: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            FormattedContent: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'RearrangedContents',
            modelName: 'RearrangedContent',
        }
    );
    return RearrangedContent;
}
