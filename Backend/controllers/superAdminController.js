import mongoose from "mongoose";
import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import {User} from "../models/userSchema.js";
import { Commission } from "../models/commissionSchema.js";
import {Auction} from "../models/auctionSchema.js";
import {PaymentProof} from "../models/commissionProofSchema.js"

export const deleteAuctionItem = catchAsyncErrors(async(req, res, next) => {
    const {id} = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Invalid id format",400));
    };

    const auctionItem = await Auction.findById(id);
    if(!auctionItem){
        return next(new ErrorHandler("Auction not found",400));
    };
    await auctionItem.deleteOne();
    res.status(200).json({
        success: true,
        message: "Auction Item deleted successfully",
    });
});

 //get all payment proofs
 export const getAllPaymentProofs = catchAsyncErrors(async(req, res, next)=>{
    let paymentProof = await PaymentProof.find();
    res.status(200).json({
        success: true,
        paymentProof,
    });
});

//get payment proof details
export const getAllPaymentProofDetails = catchAsyncErrors(async(req, res, next)=>{
    const {id} = req.params;
    const paymentProofDetail = await PaymentProof.findById(id);
    res.status(200).json({
        success: true,
        paymentProofDetail,
    })
});

//update payment proof
export const updateProofStatus = catchAsyncErrors(async(req, res, next) =>{
    const {id} = req.params;
    const {amount, status} = req.body;
    if(!mongoose.Types.ObjectId.isValid(id)){
        return next(new ErrorHandler("Invalid id format", 400));
    };
    let proof = await PaymentProof.findById(id);
    if(!proof){
        return next(new ErrorHandler("Proof not found", 400));
    };
    proof = await PaymentProof.findByIdAndUpdate(id, {status, amount},{
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.status(200).json({
        success: true,
        message: "payment proof and status updated",
        proof,
    });
});
//delete payment proof
export const deletePaymentProof = catchAsyncErrors(async(req, res, next)=>{
     const {id} = req.params;
     const proof = await PaymentProof.findById(id);
     if(!proof){
        return next(new ErrorHandler("Payment proof not found", 400));
     };
     await proof.deleteOne();
     res.status(200).json({
        success: true,
        message: "Payment proof deleted successfully",
     })
})