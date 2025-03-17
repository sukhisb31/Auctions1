import {User} from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncErrors(async(req, res, next)=>{
    //get token from cookie
    const token = req.cookies.token;
    //check token is valid or not
    if(!token){
        return next (new ErrorHandler("User not Authenticated", 400));
    };
    //if token is found then verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    next();
});

//authorized function
export const isAuthorized = (...roles) =>{
    return(req, res, next) =>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`${req.user.role} not allowed to this resource`, 403));
        };
        next();
    }
};