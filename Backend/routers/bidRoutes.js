import express from "express";
import{placeBid} from "../controllers/bidController.js";
import {isAuthenticated, isAuthorized} from "../middlewares/auth.js";
import { checkAuctionEndTime } from "../middlewares/checkAuctionEndTime.js";

const userRouter = express.Router();

userRouter.post("/place/:id", isAuthenticated, isAuthorized("Bidder"), checkAuctionEndTime ,placeBid);

export default userRouter;