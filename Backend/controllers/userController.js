import {User} from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";
import {v2 as cloudinary} from "cloudinary"
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { generateToken } from "../utils/jwtToken.js";

export const register = catchAsyncErrors(async(req, res, next) => {
    //check files in data 
    if(!req.files || Object.keys(req.files).length === 0){
        return next (new ErrorHandler ("Profile image required",400));
    };
    //get profile image
    const{profileImage} = req.files;
    //allow image formats
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if(!allowedFormats.includes(profileImage.mimetype)){
        return next(new ErrorHandler("File format not supported",400));
    };
    //get all data 
    const {
        userName,
        email,
        password,
        phone,
        address,
        role,
        bankAccountNumber,
        bankAccountName,
        bankName,
        upi_id,
        paypalEmail
    } = req.body;
    //check fields are fill or not
    if(!userName || !email || !phone || !password || !address || !role){
        return next (new ErrorHandler("please fill full form", 400));
    };
    //if fill full form then
    if(role === "Auctioneer"){
        //check auctioneer fields those are required by auctioneer
        if(!bankAccountName || !bankAccountNumber || !bankName){
            new next(new ErrorHandler("Please provide your full bank detail",400));
        };
        //provide you upi id
        if(!upi_id){
            new next(new ErrorHandler("Please provide your Upi Id",400));
        };
        //provide your paypal
        if(!paypalEmail){
            new next(new ErrorHandler("Please provide your paypal email",400));
        };
    };
    // first get registered user and then check user are registered or not
    const isRegistered = await User.findOne({email});
    if(isRegistered){
        return next(new ErrorHandler("User already registered",400));
    };

    //upload your image at cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(
        profileImage.tempFilePath,
        {
            folder: "MERN_AUCTION_PLATFORM_USERS"
        },
    );
    //check if cloudinary not response
    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error(
            "cloudinary error :", cloudinaryResponse.error || "cloudinary error"
        );
        return next (new ErrorHandler('Failed to upload profile image to cloudinary', 500));
    };
    //save user details
    const user = await User.create({
        userName,
        email,
        password,
        phone,
        address,
        role,
        profileImage: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
        paymentMethods: {
            bankTransfer:{
                bankAccountName,
                bankAccountNumber,
                bankName,  
            },
            ifsc: {
                 upi_id,
            },
            paypal: {
                paypalEmail,
            },
        },
    });
    generateToken(user, "User registered successfully", 201, res);
   
    //generate token

});