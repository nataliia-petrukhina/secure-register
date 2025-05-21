import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
/* import cookieParser from "cookie-parser"; */
import transporter from "../config/nodemailer.js";
import { OTP_EMAIL_TEMPLATE }from "../config/emailTemplate.js";


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
      await user.save();
      const token = jwt.sign( { id: user._id }, process.env.JWT_SECRET, { expiresIn: "1y"} )
      res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",  
          sameSite: process.env.NODE_ENV === "production" ? "none" :  "strict", // für Cors error
          maxAge: 1000 * 60 * 60 * 24 * 365 //604800000 (nach dem 7 dage lösch das token)
      })
      // '"Maddison Foo Koch" <maddison53@ethereal.email>'
      const mailOptions = {
          from: process.env.SENDER_EMAIL,
          to: email,
          subject: "Account verification ✅",
          text: `Hello ${name} your account has been created`,
      }

      await transporter.sendMail( mailOptions );

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
  if (!email || !password) {
    return res.json({ success: false, message: "All field are required!" });
  }
  try {
    const user = await userModel.findOne({ email }); // Ищем пользователя по email в базе данных.

    if (!user) {
      return res.json({ success: false, message: "User is not exist" });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    //   compare   123     , $2b$10$3qo0ChbiOTnXX0iWRl3RUOV6S/wmmKa5d3Yh.8srfv6FQcUkWt2TW
    if (!isPasswordMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    // zweite token für login
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", //für cors error
      maxAge: 1000 * 60 * 60 * 24 * 7, //686868686 (nach dem 7 tage )
    });

    return res
      .status(200)
      .json({ success: true, message: "User logged in 🎉🎊" });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.json({
      success: true,
      message: "You have successfully logged out.",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


export const verifyOtp = async (req,res) =>{
  const  userId  = req.user;
  try {
      const user = await userModel.findById(userId)
      if(user.isAccountVerified){
          return res.json({success:false,message: "User is already verified!" })
      }
      const generateOtp = () => Math.floor(100000 + Math.random() * 900000);
      const otp = String(generateOtp())
      user.verifyOtp = otp;
      user.verifyOtpExpireAt = Date.now() + 1000 * 60 * 15

                            // 100 + 900000 = 900100
console.log( new Date(user.verifyOtpExpireAt))

       await user.save()
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: `your otp : ${otp} ✅`,
       /*  text: `Hello ${user.name} here is your ${otp}. You can use it to verifyy your account ^__^ `, */
       html: OTP_EMAIL_TEMPLATE.replace("{{otp}}", otp)
    }
await transporter.sendMail(mailOptions)
      return res.json({success:true, message:"OTP succesfully send!", otp:otp, user:user })
  } catch (error) {
      return res.json({success:false, message: error.message })  
  }
}
export const verifyEmail = async (req,res) => {
  const userId = req.user;
const  {otp} = req.body;
if(!userId || !otp ) {
  return res.status(401).json({success:false, message: "All field are required"})
}

  try {
const user = await userModel.findById(userId)
if(!user){
  return res.json({success: false, message: "user not found!"})
}
if(user.verifyOtp == "" || user.verifyOtp !== otp ){
  return res.json({success:false, message:" OTP is invalid"})
}
   //699                 701
if(user.verifyOtpExpireAt < Date.now()){
  return res.json({succes: false, message: "OTP is expired, try send new one"})
     //100 + 600 = 700          now = 800
    // dedline >> 699
} 
    user.verifyOtp = ""
    user.verifyOtpExpireAt= 0;
    user.isAccountVerified = true
    user.save()

    res.json({success: true, message: "Email verified", userId: user.verifyOtp})
  } catch(error) {
    res.json({success:false, message:error.message})
  }
}
// Она асинхронная (async), потому что может использовать await
// Эта функция  говорит: да, пользователь авторизован (если сюда дошёл — значит, middleware пропустил токен и всё в порядке)
export  const isAuthenticated = async (req,res) => {
  try {
    return res.json({succes:true, message: "Authenticed"})
  } catch (error) {
    res.json({succes:false, message: error.message})
  }
}

//sendResetOtp — отправка кода для сброса пароля OTP
export const sendResetOtp = async (req,res)=>{
  //Мы достаём из тела запроса email. Это то, что пользователь ввёл (например, в форме "забыли пароль")
  const { email } = req.body;
  if(!email){
    return res.json({succes:false, message:"email is required"})
  }
  try {
    const user = await userModel.findOne({email})
    if(!user){
      return res.json({succes:false, message: "User not found"})
    }
    if(!user.isAccountVerified){
      return res.json({succes:false, message: " You must verify your account"})
    }


    ///!!!!!
    const generateOtp = () => Math.floor(100000 + Math.random() * 900000);
    const otp = String(generateOtp())
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 1000 * 60 * 15

                          // 100 + 900000 = 900100


     await user.save()
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: `your otp : ${otp} ✅`,
      text: `Hello ${user.name} here is your reset code: ${otp}. *__*`,
     
  }
await transporter.sendMail(mailOptions)
return res.json({success:true, message: "Reset  code sent to your email"})
  } catch (error) {
    res.json({success:false, message:error.message})
  }
}

export const resetPassword = async (req,res) => {
  const {email,otp, newPassword} = req.body;

  if(!email || !otp || !newPassword){
    return res.json({succes:false, message:"All fields are required"})
  }
  try {
    const user = await userModel.findOne({email})
    if(!user){
      return res.json({succes:false, message:"User is not found"})
    }
    if(user.resetOtp === "" || !user.resetOtp === otp){
      return res.json({succes:false, message:"Invalid Code"})
    }
    if(user.resetOtpExpireAt < Date.now()){
      return res.json({succes:false, message: "Code is expired, try send another one"})
    }
user.resetOtp = "";
user.resetOtpExpireAt= 0;
user.password = newPassword;
await user.save();




////
const token = jwt.sign( { id: user._id }, process.env.JWT_SECRET, { expiresIn: "1y"} )
res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",  
    sameSite: process.env.NODE_ENV === "production" ? "none" :  "strict", // für Cors error
    maxAge: 1000 * 60 * 60 * 24 * 365 //604800000 (nach dem 7 dage lösch das token)
})
///////


const mailOptions = {
  from: process.env.SENDER_EMAIL,
  to: user.email,
  subject: `Password changed!`,
  text: `Hello ${user.name}! Your password successfully changed.🤗`,
}
await transporter.sendMail( mailOptions );
return res.json({success:true, message: "Password successfully changed!"})
} catch (error) {
res.json({success: false, message:error.message})
}
}