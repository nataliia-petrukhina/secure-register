import mongoose from "mongoose";

const connectDB = async () => { //асинхронная функция  чтобы внутри можно было использовать await для ожидания подключения.
    await mongoose.connection.on('connected', ()=>{
        console.log("Database Connected...");
        
    })
    await mongoose.connect( `${process.env.MONGODB_URL}/mern-register` )
}

export default connectDB;