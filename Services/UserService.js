import { models } from '../Data/Sequelize.js';
import bcrypt from 'bcrypt';


const test = () => {
    console.log("service is working");
};

const GetUserById = (request) => {
    console.log(request);
}

const SignUp = async (userData) => {
    try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await models.User.create({
            Email: userData.email,
            UserName: userData.userName,
            PasswordHash: hashedPassword,
            FirstName: userData.firstName,
            LastName: userData.lastName
        });
        return "User created.";
    } catch (error) {
        return `Error --> ${error}`;
    }
}

const SignIn = async (email, enteredPassword) => {
    
}

const Delete = async (id) => {
    try {
        const deletedCount = await models.User.destroy({ where: { Id: id}});
        if (deletedCount === 0) return "No user found with that ID.";
        return "User deleted.";
    } catch (error) {
        return `Error --> ${error}`;
    }
}

export default { test,GetUserById, SignUp, SignIn, Delete }