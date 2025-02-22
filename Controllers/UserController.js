import express from "express";
import userService from "../Services/UserService.js";

const router = express.Router();

router.post("/signup", async function SignUp(req, res) {
    const message = await userService.SignUpAsync(req.body);
    res.json(message);
});

router.post("/signin", async function SignIn(req, res) {
    const message = await userService.SignInAsync(req.body);
    res.json(message);
});

router.get("/", async function GetAllUsers(req, res) {
    const users = await userService.GetAllAsync();
    res.json(users);
});

router.get("/:id", async function GetUserById(req, res) {
    const user = await userService.GetByIdAsync(req.params.id);
    res.json(user);
});

router.patch("/update/:id", async function UpdateUser(req, res) {
    req.body.id = req.params.id;
    const message = await userService.UpdateAsync(req.body);
    res.json(message);
});

router.delete("/delete/:id", async function DeleteUser(req, res) {
    const message = await userService.DeleteAsync(req.params.id);
    res.json(message);
});

export default router;
