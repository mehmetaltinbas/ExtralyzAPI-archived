import { DataTypes, Sequelize } from 'sequelize';

export function initUserModel(sequelize) {
    User.init(
        {
            Id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            Email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            UserName: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            PasswordHash: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            FirstName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            LastName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'Users',
            modelName: 'User',
        }
    );
    return User;
}
