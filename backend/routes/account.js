const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { User, Account } = require("../db");
const { authMiddleware } = require("../middleware");

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    try {
        const account = await Account.findOne({
            userId: req.userId
        });

        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        res.json({
            balance: account.balance
        });
    } catch (error) {
        console.error("Error retrieving balance:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();
        const { amount, to } = req.body;

        const account = await Account.findOne({ userId: req.userId }).session(session);

        if (!account || account.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const toAccount = await Account.findOne({ userId: to }).session(session);
        if (!toAccount) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Invalid account" });
        }

        // Perform the balance updates
        account.balance -= amount;
        await account.save({ session });

        toAccount.balance += amount;
        await toAccount.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.json({ message: "Transfer successful" });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error during transfer:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
