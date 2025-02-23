import { models } from "../Data/Sequelize.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { errorHandler } from "../Utilities/ErrorHandler.js";

dotenv.config();

const SignUpAsync = errorHandler(async function UserService_SignUpAsync(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await models.User.create({
        Email: userData.email,
        UserName: userData.userName,
        PasswordHash: hashedPassword,
        FirstName: userData.firstName,
        LastName: userData.lastName,
    });
    if (!user) return "Something went wrong.";
    return "User created.";
});

const SignInAsync = errorHandler(async function UserService_SignInAsync(userData) {
    const user = await models.User.findOne({
        where: {
            UserName: userData.userName,
        },
    });
    if (!user) return "Invalid user name.";
    const isMatch = await bcrypt.compare(userData.password, user.PasswordHash);
    if (!isMatch) return "Invalid password.";
    const token = jwt.sign(
        {
            userId: user.Id,
        },
        process.env.JWT_SIGNATURE,
        {
            expiresIn: "1h",
        },
    );
    return {
        message: "Signed in.",
        jwt: token,
    };
});

const GetCurrentUserAsync = errorHandler(async function UserService_GetCurrentUserAsync(authorization) {
    const token = authorization.split(" ")[1];
    if (!token) return "No token.";
    const decoded = jwt.verify(token, process.env.JWT_SIGNATURE);
    const user = await GetByIdAsync(decoded.userId);
    return user;
});

const GetAllAsync = errorHandler(async function UserService_GetAllAsync() {
    const users = await models.User.findAll();
    return users;
});

const GetByIdAsync = errorHandler(async function UserService_GetByIdAsync(id) {
    const user = await models.User.findByPk(id);
    if (!user) return "No user found.";
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
    if (updatedCount === 0) return "No user found.";
    return "User updated.";
});

const DeleteAsync = errorHandler(async function UserService_DeleteAsync(id) {
    const deletedCount = await models.User.destroy({
        where: {
            Id: id,
        },
    });
    if (deletedCount === 0) return "No user found.";
    return "User deleted.";
});

export default {
    SignUpAsync,
    SignInAsync,
    GetCurrentUserAsync,
    GetAllAsync,
    GetByIdAsync,
    UpdateAsync,
    DeleteAsync,
};
