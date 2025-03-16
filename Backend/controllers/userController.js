import {User} from "../models/userSchema.js";
import ErrorHandler from "../middlewares/error.js";

export const register = async(req, res, next) => {
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
}