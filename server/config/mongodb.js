import mongoose from "mongoose";

const connectDB = async () => {
    await mongoose.connection.on('connected', ()=>{
        console.log("Database Connected...");
        
    })
    await mongoose.connect( `${process.env.MONGODB_URL}/mern-register` )
}

export default connectDB;