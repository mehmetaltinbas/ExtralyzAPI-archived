export default (sequelize, DataTypes) => {
    const Document = sequelize.define(
        'Document', 
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            UserId: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        }
    );
    return Document;
};