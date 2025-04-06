import express from "express";
import {
  deleteAuctionItem,
  deletePaymentProof,
  getAllPaymentProofs,
  getAllPaymentProofDetails,
  updateProofStatus,
  fetchAllUsers,
  monthlyRevenue,
} from "../controllers/superAdminController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.delete(
  "/auctionitem/delete/:id",
  isAuthenticated,
  isAuthorized("Super Admin"),
  deleteAuctionItem
);
userRouter.get(
  "/paymentproofs/getall",
  isAuthenticated,
  isAuthorized("Super Admin"),
  getAllPaymentProofs
);
userRouter.get(
  "/paymentproof/:id",
  isAuthenticated,
  isAuthorized("Super Admin"),
  getAllPaymentProofDetails
);
userRouter.put(
  "/paymentproof/status/update/:id",
  isAuthenticated,
  isAuthorized("Super Admin"),
  updateProofStatus
);
userRouter.delete(
  "/paymentproof/delete/:id",
  isAuthenticated,
  isAuthorized("Super Admin"),
  deletePaymentProof
);

userRouter.get("/users/getall", isAuthenticated, isAuthorized("Super Admin"), fetchAllUsers);
userRouter.get("/monthlyincome", isAuthenticated, isAuthorized("Super Admin"), monthlyRevenue);


export default userRouter;
 