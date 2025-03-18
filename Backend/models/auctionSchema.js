import mongoose from "mongoose";

const auctionSchema = new mongoose.Schema({
    title:String,
    description:{
        type:String
    },
    startingBid:Number,
    currentBid:{
        type: Number,
        default: 0
    },
    startTime:{
        type:String,
        
    },
    endTime:String,
    category:String,
    condition:{
        type: String,
        enum: ["New", "Used"],
    },
    image: {
        public_id:{
            type: String,
            required: true,
        },
        url: {
            type:String,
            required: true,
        },
    },    
        createdBy:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        bids: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Bidder",
                },
                userName: String,
                profileImage: String,
                amount:Number,
            },
        ],
        highestBidder:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        commissionCalculated: {
            type: Boolean,
            default: 0,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    });

    export const Auction = mongoose.model("Auction", auctionSchema);