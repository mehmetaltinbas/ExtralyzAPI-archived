export default (sequelize, DataTypes) => {
    const RearrangedContent = sequelize.define('RearrangedContent', {
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
    });
    return RearrangedContent;
};
