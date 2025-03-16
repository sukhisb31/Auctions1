import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        minLength: [3, "userName must contain at least 3 character"],
        maxLength: [32, "userName cannot exceed 32 character"],
    },
    password: {
        type: String,
        selected: false,
        minLength: [6, "password must contain at least 6 character"],
    },
    email: String,
    address: String,
    phone: {
        type: String,
    },
    profileImage: {
        public_id:{
            type: String,
            required: true,
        },
        url:{
            type: String,
            required: true,
        },
    },
    paymentMethods: {
        bankTransfer:{
            bankAccountName: String,
            bankAccountNumber: String,
            bankName: String,  
        },
        ifsc: {
             upi_id: String,
        },
        paypal: {
            paypalEmail: String,
        },
    },
    role: {
        type: String,
        enum: ["Auctioneer", "Bidder", "Admin"],
    },
    unpaidCommission: {
        type: Number,
        default: 0,
    },
    auctionsWon: {
        type: Number,
        default: 0,
    },
    moneySpent: {
        type: Number,
        default: 0,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
});

export const User = mongoose.model("User", userSchema);