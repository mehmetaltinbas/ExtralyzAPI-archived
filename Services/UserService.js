import { models } from '../Data/Sequelize.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SignUpAsync = async (userData) => {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await models.User.create({
      Email: userData.email,
      UserName: userData.userName,
      PasswordHash: hashedPassword,
      FirstName: userData.firstName,
      LastName: userData.lastName,
    });
    if (!user) return 'Something went wrong.';
    return 'User created.';
  } catch (error) {
    return `Error --> ${error}`;
  }
};

const SignInAsync = async (userData) => {
  try {
    const user = await models.User.findOne({
      where: { UserName: userData.userName },
    });
    if (!user) return 'Invalid user name.';
    const isMatch = await bcrypt.compare(userData.password, user.PasswordHash);
    if (!isMatch) return 'Invalid password.';
    const token = jwt.sign({ userId: user.Id }, process.env.JWT_SIGNATURE, {
      expiresIn: '1h',
    });
    return { message: 'Signed in.', jwt: token };
  } catch (error) {
    return `Error --> ${error}`;
  }
};

const GetCurrentUserAsync = async (authorization) => {
  try {
    console.log('Authorization --> ' + authorization);
    const token = authorization.split(' ')[1];
    if (!token) return 'No token.';
    const decoded = jwt.verify(token, process.env.JWT_SIGNATURE);
    const user = await GetByIdAsync(decoded.userId);
    console.log('User --> ' + JSON.stringify(user));
    return user;
  } catch (error) {
    return `Error --> ${error}`;
  }
};

const GetAllAsync = async () => {
  try {
    const users = await models.User.findAll();
    return users;
  } catch (error) {
    return `Error --> ${error}`;
  }
};

const GetByIdAsync = async (id) => {
  try {
    const user = await models.User.findByPk(id);
    if (!user) return 'No user found.';
    return user;
  } catch (error) {
    return `Error --> ${error}`;
  }
};

const UpdateAsync = async (userData) => {
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const updatedCount = await models.User.update(
      {
        Email: userData.email,
        UserName: userData.userName,
        PasswordHash: hashedPassword,
        FirstName: userData.firstName,
        LastName: userData.lastName,
      },
      { where: { Id: userData.id } },
    );
    if (updatedCount === 0) return 'No user found.';
    return 'User updated.';
  } catch (error) {
    return `Error --> ${error}`;
  }
};

const DeleteAsync = async (id) => {
  try {
    const deletedCount = await models.User.destroy({ where: { Id: id } });
    if (deletedCount === 0) return 'No user found.';
    return 'User deleted.';
  } catch (error) {
    return `Error --> ${error}`;
  }
};

export default {
  SignUpAsync,
  SignInAsync,
  GetCurrentUserAsync,
  GetAllAsync,
  GetByIdAsync,
  UpdateAsync,
  DeleteAsync,
};
