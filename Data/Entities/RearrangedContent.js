export default (sequelize, DataTypes) => {
    const RearrangedContent = sequelize.define(
        'RearrangedContent', 
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            FormattedContent: {
                type: DataTypes.STRING
            },
            FormattedType: {
                type: DataTypes.STRING
            }
        }
    );
    return RearrangedContent;
};