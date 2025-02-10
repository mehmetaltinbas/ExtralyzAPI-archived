import express from 'express';
import userService from '../Services/UserService.js';

const router = express.Router();


router.get('/test', async function Test(req, res) {
    userService.test();
    res.send("hello");
}); 

router.get('/', async function GetUserById(req, res) {
    userService.GetUserById(req.body);
    res.send("hello");
});

router.post('/signup', async function SignUp(req, res) {
    const message = await userService.SignUp(req.body);
    res.send(message);
});

router.post('/signin', async function SignIn(req, res) {
    res.send("signin");
});

router.patch('/update', async function Update(req, res) {
    res.send("update");
});

router.delete('/delete', async function Delete(req, res) {
    const message = await userService.Delete(req.body.id);
    res.send(message);
});


export default router;