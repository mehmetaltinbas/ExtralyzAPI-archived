import express from 'express';
import userService from '../Services/UserService.js';
import UserService from '../Services/UserService.js';

const router = express.Router();


router.post('/signup', async function SignUp(req, res) {
    const message = await userService.SignUpAsync(req.body);
    res.send(message);
});

router.post('/signin', async function SignIn(req, res) {
    const message = await userService.SignInAsync(req.body);
    res.send(message);
});

router.get('/', async function GetAllUsers(req, res) {
    const users = await userService.GetAllAsync();
    res.send(users);
});

router.get('/:id', async function GetUserById(req, res) {
    const user = await userService.GetByIdAsync(req.params.id);
    res.send(user);
});

router.patch('/update/:id', async function UpdateUser(req, res) {
    req.body.id = req.params.id;
    const message = await UserService.UpdateAsync(req.body);
    res.send(message);
});

router.delete('/delete/:id', async function DeleteUser(req, res) {
    const message = await userService.DeleteAsync(req.params.id);
    res.send(message);
});


export default router;