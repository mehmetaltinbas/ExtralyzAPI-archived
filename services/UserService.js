import { models } from '../db/Sequelize.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { errorHandler } from '../utilities/ErrorHandler.js';

dotenv.config();

const SignUpAsync = errorHandler(async function UserService_SignUpAsync(data) {
    const existingUser = await models.User.findOne({
        where: {
            [Op.or]: [{ Email: data.email }, { UserName: data.userName }],
        },
    });
    if (existingUser) return 'Email or username already exists!';

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await models.User.create({
        Email: data.email,
        UserName: data.userName,
        PasswordHash: hashedPassword,
        FirstName: data.firstName,
        LastName: data.lastName,
    });
    if (!user) return 'Database error: User not created.';
    return 'User created.';
});

const SignInAsync = errorHandler(async function UserService_SignInAsync(data) {
    const user = await models.User.findOne({
        where: {
            UserName: data.userName,
        },
    });
    if (!user) return { isSuccess: false, message: 'Invalid user name.' };
    const isMatch = await bcrypt.compare(data.password, user.PasswordHash);
    if (!isMatch) return { isSuccess: false, message: 'Invalid password.' };
    const jwtSecret = process.env.JWT_SIGNATURE;
    if (!jwtSecret) throw new Error('JWT_SIGNATURE is not defined.');
    const token = jwt.sign(
        {
            userId: user.Id,
        },
        jwtSecret,
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

const UpdateAsync = errorHandler(async function UserService_UpdateAsync(data ) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const updatedCount = await models.User.update(
        {
            Email: data.email,
            UserName: data.userName,
            PasswordHash: hashedPassword,
            FirstName: data.firstName,
            LastName: data.lastName,
        },
        {
            where: {
                Id: data.id,
            },
        },
    );
    if (updatedCount[0] == 0) return 'No user found.';
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
