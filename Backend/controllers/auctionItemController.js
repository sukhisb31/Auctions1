import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import {User} from "../models/userSchema.js";
import {Auction} from "../models/auctionSchema.js";
import {v2 as cloudinary} from "cloudinary";
import mongoose from "mongoose";

export const addNewAuctionItem = catchAsyncErrors(async(req, res, next)=>{
    //check requested files by user
    if(!req.files || Object.keys(req.files).length === 0){
        return next (new ErrorHandler("Auction item image required", 400));
    };
    //get image
    const { image } = req.files;
    //format allowed
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    //if image format wrong and not supported
    if(!allowedFormats.includes(image.mimetype)){
        return next(new ErrorHandler("image format not supported"));
    };

    //get item/detail from body
    const {
        title,
        description,
        category,
        condition,
        startingBid,
        startTime,
        endTime,
    } = req.body;
    //check all fields are fills 
    if(!title || !description || !category || !condition || !startingBid || !startTime || !endTime){
        return next(new ErrorHandler("Please provide all details", 400));
    };
    //check time
    if(new Date(startTime) < Date.now()){
        return next(new ErrorHandler("Auction starting time must be greater than present time", 400));
    };

    if(new Date(startTime) >= new Date(endTime)){
        return next(new ErrorHandler("Auction starting time must be less then ending time",400))
    };

    // check one user auction is active or not
    const alreadyActiveOneAuction = await Auction.find({
        createdBy: req.user._id,
        endTime: {$gt: Date.now()},
    });
    if(alreadyActiveOneAuction.length > 0){
        return next(new ErrorHandler("You already active one auction", 400));
    };
    //cloudinary errors
    try {
        const cloudinaryResponse = await cloudinary.uploader.upload(
            image.tempFilePath,
            {
                folder: "MERN_AUCTION_PLATFORM_AUCTIONS",
            }
        );
        if(!cloudinaryResponse || cloudinaryResponse.error){
            console.error(
                "Cloudinary Error :", cloudinaryResponse.error || "Unknown cloudinary error",
            );
            return next(new ErrorHandler("Failed to upload auction image to cloudinary",500));
        };

        //create auction
        const auctionItem = await Auction.create({
        title,
        description,
        category,
        condition,
        startingBid,
        startTime,
        endTime,
        image: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
        createdBy: req.user._id
        });
        return res.status(201).json({
            success: true,
            message: `Auction item created and will be listed on auction page at ${startTime}`,
            auctionItem,
        })

    } catch (error) {
        return next(new ErrorHandler(error.message || "Failed to created auction", 500))
        
    }
});

//get all items
export const getAllItems = catchAsyncErrors(async(req, res, next)=>{
    let items = await Auction.find();
    res.status(200).json({
        success: true,
        items,
    });
});

//get my all auction item
export const getMyAuctionItems = catchAsyncErrors(async(req, res, next)=>{
   //find who`s created auction
   const items = await Auction.find({createdBy: req.user._id});
   res.status(200).json({
    success: true,
    items,
   })
});
//auction details
export const getAuctionDetails = catchAsyncErrors(async(req, res, next)=>{
     //find my auction item 
     const{id} = req.params;
     //first check object valid id
     if(!mongoose.Types.ObjectId.isValid(id)){
         return next(new ErrorHandler("Invalid id format",400));
     };
     // find auction item
     const auctionItem = await Auction.findById(id);
     if(!auctionItem){
         return next(new ErrorHandler("Auction not found", 400));
     };
     //if auction item present
     const bidders = auctionItem.bids.sort((a,b)=> b.bid - a.bid);
     res.status(200).json({
         success: true,
         bidders,
         auctionItem,
     })
});
//remove auction item
export const removeFromAuction = catchAsyncErrors(async(req, res, next)=>{
     //find my auction item 
     const{id} = req.params;
     //first check object valid id
     if(!mongoose.Types.ObjectId.isValid(id)){
         return next(new ErrorHandler("Invalid id format",400));
     };
     // find auction item
     const auctionItem = await Auction.findById(id);
     if(!auctionItem){
         return next(new ErrorHandler("Auction not found", 400));
     };
     //if auction found
     await auctionItem.deleteOne();
     res.status(200).json({
        success: true,
        message: "Auction item deleted successfully"
     })
});
//auction item republish
export const republishItem = catchAsyncErrors(async(req, res, next)=>{
     //find my auction item 
     const{id} = req.params;
     //first check object valid id
     if(!mongoose.Types.ObjectId.isValid(id)){
         return next(new ErrorHandler("Invalid id format",400));
     };
     // find auction item
     let auctionItem = await Auction.findById(id);
     if(!auctionItem){
         return next(new ErrorHandler("Auction not found", 400));
     };
     //startTime And time needed for republish
     if(!req.body.startTime || !req.body.endTime){
        return next(new ErrorHandler("StartTime and EndTime for republish compulsory",400))
     }
     if(new Date(auctionItem.endTime) > Date.now()){
        return next(new ErrorHandler("Auction is already active, cannot republish",400))
     };
     let data = {
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
     };
     if(data.startTime < Date.now()){
        return next(new ErrorHandler("Auction starting time must be greater than present time", 400));
     };
     if(data.startTime >= data.endTime){
        return next(new ErrorHandler("Auction starting time must be less than ending time", 400));
     };
     //after ending some values need reset so make function for reset values

     if(auctionItem.highestBidder){
        const highestBidder = await User.findById(auctionItem.highestBidder);
        highestBidder.moneySpent -= auctionItem.currentBid;
        highestBidder.auctionsWon -= 1;
        await highestBidder.save();
     }

     data.bids = [];
     data.commissionCalculated = false;
    data.currentBid = 0;
    data.highestBidder = null;
     auctionItem = await User.findByIdAndUpdate(req.user._id,
        {unpaidCommission: 0},
        {
            new: true,
            runValidators: false,
            useFindAndModify: false,
        }
     )
     const createdBy = await User.findById(req.user._id);
     createdBy.unpaidCommission = 0,
     await createdBy.save();
     res.status(200).json({
        success: true,
        auctionItem,
        message: `Auction republished and will be active on ${req.body.startTime}`,
        createdBy,
     })
});


