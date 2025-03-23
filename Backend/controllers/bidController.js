import {Bid} from "../models/bidSchema.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import {Auction} from "../models/auctionSchema.js";
import {User} from "../models/userSchema.js";


export const placeBid = catchAsyncErrors(async(req, res, next)=>{
    //get id from body
    const {id} = req.params;
    //get auction id
    const auctionItem = await Auction.findById(id);
    if(!auctionItem){
        return next(new ErrorHandler("Auction item not found", 400));
    };
    //get auction amount
    const {amount} = req.body;
    if(!amount){
        return next (new ErrorHandler("Please place your bid", 400));
    };
    //check auction item bid amount do not less than current bid
    if(amount <= auctionItem.currentBid){
        return next(new ErrorHandler("Bid amount must be greater than current bid amount",400));
    };
    if(amount < auctionItem.startingBid){
        return next(new ErrorHandler("Bid amount greater than starting bid", 400));
    };
    
    try {
        //check existing bid and check user place bid already or no
        const existingBid = await Bid.findOne({
            "bidder.id": req.user._id,
            auctionItem: auctionItem._id,
        });
        //check user bid placed or not and compare
        const existingBidInAuction = auctionItem.bids.find((bid) => bid.userId.toString() == req.user._id.toString());
        //check existing bid
        if(existingBid && existingBidInAuction){
            existingBidInAuction.amount = amount;
            existingBid.amount = amount;
            //save bids
            await existingBidInAuction.save();
            await existingBid.save();
            auctionItem.currentBid = amount;
        }
        else{
            const bidderDetail = await User.findById(req.user._id);
            //create Bid
            const bid = await Bid.create({
                  amount,
                  bidder:{
                    id: bidderDetail._id,
                    userName: bidderDetail.userName,
                    profileImage: bidderDetail.profileImage?.url,
                  },
                  auctionItem: auctionItem._id,
            });
            auctionItem.bids.push({
                userId: req.user._id,
                userName: bidderDetail.userName,
                profileImage: bidderDetail.profileImage?.url,
                amount,
            });
            auctionItem.currentBid = amount;
        }
        await auctionItem.save();
        res.status(201).json({
            success: true,
            message: "Bid placed",
            currentBid: auctionItem.currentBid,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message ||"Failed to place bid", 500));
    }
});