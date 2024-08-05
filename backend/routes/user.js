const express = require("express");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config"); // Correctly destructure the secret key from the config module
const zod = require("zod");
const { User, Account } = require("../db");
const { authMiddleware } = require("../middleware");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
        msg: "hi from user file"
    });
});

const zodSignUpSchema = zod.object({
    username: zod.string().email(),
    password: zod.string().min(6),
    firstName: zod.string(),
    lastName: zod.string(),
});

router.post("/signup", async (req, res) => {
    const body = req.body;
    const parsed = zodSignUpSchema.safeParse(body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Incorrect inputs"
        });
    }

    const user = await User.findOne({
        username: body.username
    });

    if (user) {
        return res.status(409).json({
            message: "Email already taken/Incorrect inputs"
        });
    }

    const dbUser = await User.create(body);
    const token = jwt.sign({
        userId: dbUser._id
    }, JWT_SECRET);

    await Account.create({
        userId: dbUser._id,
        balance: 1 + Math.random() * 10000
    });

    res.json({
        message: "User created successfully",
        token: token
    });
});

const zodSignInSchema = zod.object({
    username: zod.string().email(),
    password: zod.string().min(6)
});

router.post("/signin", async (req, res) => {
    const parsed = zodSignInSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Incorrect Input"
        });
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });

    if (user) {
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);
        return res.json({
            token: token
        });
    }

    res.status(401).json({
        message: "Error while logging in"
    });
});

const zodUpdateSchema = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
});

router.put("/", authMiddleware, async (req, res) => {
    const parsed = zodUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Error while updating information"
        });
    }
    
    await User.updateOne({ _id: req.userId }, req.body);

    res.json({
        message: "Updated successfully"
    });
});

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";
    const users = await User.find({
        $or: [
            { username: { "$regex": filter, "$options": "i" } },
            { lastName: { "$regex": filter, "$options": "i" } }
        ]
    });

    res.json({
        users: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id,
        }))
    });
});

module.exports = router;
