import express from "express";

const router = express.Router();

router.post("", function Test(req, res) {
    res.send("hello");
});

export default router;
