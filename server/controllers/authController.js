import userModel from "../models/userModel.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

export const register = async (req, res) =>  {
    /**
     * Was brauchen wir???
     * Name
     * Email
     * Password
     */
    const {name, email, password } = req.body; 
    if(!name|| !email || !password){
        return res.json({success: false, message: "All field are required"})
    }
    
    try {
        const user = new userModel({name, email, password})
        await user.save()
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn : "7d"})
        res.cookie('token',token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production",
            sameSite : process.env.NODE_ENV === "production" ? "none" : "strict", //für cors error
            maxAge : 1000 * 60 * 60 * 24 * 7 //686868686 (nach dem 7 tage )
        })
                            //hfhvkjxvhkxchvkx
     
        return res.status(200).json({
            success: true,
            message:"User created!",
            user:{
                name:name,
                email:email
            }
        })
    } catch (error) {
        res.json({
            success:false,
            error: "register catch",
            message:error.message
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body; 
    if(!email || !password){
        return res.json( { success: false, message: "All field are required!"})
    }
    try {
        const user = await userModel.findOne( { email } )// Ищем пользователя по email в базе данных.



        if(!user){
            return res.json({success:false, message: "User is not exist"})
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password )
                                        //   compare   123     , $2b$10$3qo0ChbiOTnXX0iWRl3RUOV6S/wmmKa5d3Yh.8srfv6FQcUkWt2TW
        if(!isPasswordMatch){
            return res.json({success:false, message: "Invalid credentials" })
        }
        return res.status(200).json({success:true, message: "User logged in 🎉🎊"})
    } catch (error) {
        res.json({
            success:false,
            message: error.message
        })
    }

}