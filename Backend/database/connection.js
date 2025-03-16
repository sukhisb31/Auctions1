import mongoose from "mongoose";

export const connection = () => {
    mongoose.connect(process.env.MONGODB_URI, {
        dbName: "MERN_AUCTION_PLATFORM"
    }).then(()=>{
        console.log("Connected to DB");
        
    }).catch((err)=>{
        console.log(`Some error occurred while connecting DB : ${err}`);
        
    });
}

