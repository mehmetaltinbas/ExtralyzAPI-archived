import { models } from '../Data/Sequelize.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { errorHandler } from '../Utilities/ErrorHandler.js';

dotenv.config();

const SignUpAsync = errorHandler(async function UserService_SignUpAsync(userData) {
    const existingUser = await models.User.findOne({
        where: {
            [Op.or]: [{ Email: userData.email }, { UserName: userData.userName }],
        },
    });
    if (existingUser) return 'Email or username already exists!';

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await models.User.create({
        Email: userData.email,
        UserName: userData.userName,
        PasswordHash: hashedPassword,
        FirstName: userData.firstName,
        LastName: userData.lastName,
    });
    if (!user) return 'Database error: User not created.';
    return 'User created.';
});

const SignInAsync = errorHandler(async function UserService_SignInAsync(userData) {
    const user = await models.User.findOne({
        where: {
            UserName: userData.userName,
        },
    });
    if (!user) return { isSuccess: false, message: 'Invalid user name.' };
    const isMatch = await bcrypt.compare(userData.password, user.PasswordHash);
    if (!isMatch) return { isSuccess: false, message: 'Invalid password.' };
    const token = jwt.sign(
        {
            userId: user.Id,
        },
        process.env.JWT_SIGNATURE,
        {
            expiresIn: '1h',
        },
    );
    return {
        isSuccess: true,
        message: 'Signed in.',
        jwt: token,
    };
});

const AuthorizeAsync = errorHandler(async function UserService_VerifyUserAsync() {
    return { isSuccess: true, message: 'Authorized.' };
});

const GetAllAsync = errorHandler(async function UserService_GetAllAsync() {
    const users = await models.User.findAll();
    return users;
});

const GetByIdAsync = errorHandler(async function UserService_GetByIdAsync(id) {
    const user = await models.User.findByPk(id);
    if (!user) return 'No user found.';
    return user;
});

const UpdateAsync = errorHandler(async function UserService_UpdateAsync(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const updatedCount = await models.User.update(
        {
            Email: userData.email,
            UserName: userData.userName,
            PasswordHash: hashedPassword,
            FirstName: userData.firstName,
            LastName: userData.lastName,
        },
        {
            where: {
                Id: userData.id,
            },
        },
    );
    if (updatedCount === 0) return 'No user found.';
    return 'User updated.';
});

const DeleteAsync = errorHandler(async function UserService_DeleteAsync(id) {
    const deletedCount = await models.User.destroy({
        where: {
            Id: id,
        },
    });
    if (deletedCount === 0) return 'No user found.';
    return 'User deleted.';
});

export default {
    SignUpAsync,
    SignInAsync,
    AuthorizeAsync,
    GetAllAsync,
    GetByIdAsync,
    UpdateAsync,
    DeleteAsync,
};
