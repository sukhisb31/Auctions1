import {User} from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./error.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = catchAsyncErrors(async(req, res, next)=>{
    //get token from cookie
    const token = req.cookie.token;
    //check token is valid or not
    if(!token){
        return next (new ErrorHandler("User not Authenticated", 400));
    };
    //if token is found then verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    next();
})