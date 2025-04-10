import express from 'express';
import userService from '../Services/UserService.js';
import authMiddleware from '../Middlewares/AuthMiddleware.js';

const router = express.Router();

router.get('/test', authMiddleware, async function Test(req, res) {
    res.json(req.user.userId);
});

router.post('/signup', async function SignUp(req, res) {
    const message = await userService.SignUpAsync(req.body);
    if (message.isSuccess == false) return res.json(message);
    res.json({ isSuccess: true, message: message });
});

router.post('/signin', async function SignIn(req, res) {
    const result = await userService.SignInAsync(req.body);
    res.json(result);
});

router.post('/signout', authMiddleware, async function SignOut(req, res) {
    res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'strict' });
    res.json({ isSuccess: true, message: 'Signed out successfuly' });
});

router.get('/authorize', authMiddleware, async function AuthorizeUser(req, res) {
    const result = await userService.AuthorizeAsync();
    res.json(result);
});

router.get('/', async function GetAllUsers(req, res) {
    const users = await userService.GetAllAsync();
    res.json(users);
});

router.get('/:id', async function GetUserById(req, res) {
    const user = await userService.GetByIdAsync(req.params.id);
    res.json(user);
});

router.patch('/update/:id', authMiddleware, async function UpdateUser(req, res) {
    req.body.id = req.params.id;
    const message = await userService.UpdateAsync(req.body);
    res.json(message);
});

router.delete('/delete/:id', authMiddleware, async function DeleteUser(req, res) {
    const message = await userService.DeleteAsync(req.params.id);
    res.json(message);
});

export default router;
