import { config } from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { connection } from "./database/connection.js";
import { errorMiddleware } from "./middlewares/error.js";
import userRouter from "./routers/userRouter.js";
import auctionItemRouter from "./routers/auctionItemRoutes.js";
import bidRouter from "./routers/bidRoutes.js";
import commissionRouter from "./routers/commissionRouter.js";
import superAdminRouter from "./routers/superAdminRoutes.js"; 

const app = express();
config({
    path: "./config/.env"
});

app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auctionitem", auctionItemRouter);
app.use("/api/v1/bid", bidRouter);
app.use("/api/v1/commission", commissionRouter);
app.use("/api/v1/superadmin", superAdminRouter);


connection();
app.use(errorMiddleware);
export default app;