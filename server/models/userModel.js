import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email:{
        type:String,
        required: true,
        unique:true,//unique: true — запрещает дубли,
        lowercase: true,
        trim:true
    },
    password:{
        type:String,
        required:true,
       
        validate:{
            validator: function(pass){
                if(pass == "aaaa"){
                    return false;
                }
            },
       match: [
               /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, 
               'Password must contain at least one letter and one number'
           ]
        },
        
    
    //поля для верификации email.
    },
    verifyOtp: {
        type:String,
        default: '' 
    },
    verifyOtpExpireAt:{
        type:Number,
        default:0
    },
    isAccountVerified:{
        type: Boolean,
        default:false
    },
    //зарезервированы для восстановления пароля.
    resetOtp: {
        type:String,
        default: '' 
    },
    resetOtpExpireAt:{
        type:Number,
        default:0
    }
})

// Перед сохранением документа проверяем, изменился ли пароль.
//Если да — хэшируем его с силой 10 и сохраняем уже захэшённым.


userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
      try {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, 10);
      } catch (error) {
        return next(error);
      }
    }
    next();
  });

// Регистрируем модель user на основе схемы и экспортируем.
const userModel = mongoose.models.user || mongoose.model("user",userSchema)
export default userModel; 