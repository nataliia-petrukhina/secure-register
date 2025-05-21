import express from 'express';
import { register, login, logout, verifyOtp, verifyEmail, isAuthenticated, sendResetOtp, resetPassword} from '../controllers/authController.js';
import userAuth from '../middleware/authmiddleware.js';
const authRouter = express();


// wenn ich post request dchike zu  api/auth/register soll register controller reagieen 
authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.post('/send-verify-otp', userAuth, verifyOtp )// ОТПРАВЛЯЕТ ОТП НА ПОЧТУ userAuth — middleware, он проверяет, есть ли у пользователя действующий JWT-токен. cначала проверяет токен
authRouter.post('/verify-email', userAuth, verifyEmail ) //verifyEmail получает userId и otp из запроса, находим userId  в базе,сверяет введённый код otp с тем, что сохранён в user.verifyOtp,если всё совпадает и срок действия ещё не прошёл, то можно считать почту подтверждённой.
authRouter.get('/is-auth', userAuth,isAuthenticated)///!!!! GET
authRouter.post('/send-reset-otp', sendResetOtp)// после логаута. ввожу имеил и забыла пароль
authRouter.post('/reset-password', resetPassword)
export default authRouter;


//verifyOTP —  функция, которая:генерирует OTP (одноразовый код),сохраняет его в базу (user.verifyOtp),отправляет на почту.

/*
1) создаем юзера в temp mail --- nidajew796@bamsrad.com

2) http://localhost:4000/api/auth/register : { 
 "name": "Vano",
"email": "nidajew796@bamsrad.com",
"password": "Natali123"
} !!POST

3)http://localhost:4000/api/auth/login
{ 
    "name": "Vano",
    "email": "nidajew796@bamsrad.com",
   "password": "Natali123"}

4)http://localhost:4000/api/auth/send-verify-otp 
 { 
    "name": "Vano",
     "email": "nidajew796@bamsrad.com",
     "password": "Natali123"

     должен прийти код на имеил 
 } 


 5) http://localhost:4000/api/auth/verify-email

{ 
  "otp": "856236"
}


6)  GET
http://localhost:4000/api/auth/is-auth

{ 
  "email":"nidajew796@bamsrad.com"
}


7) POST

http://localhost:4000/api/auth/send-reset-otp
{ 
  "email":"nidajew796@bamsrad.com"
}

снова пришел отп на имеий



8) http://localhost:4000/api/auth/reset-password

{ "password":"Natali777",
  "email":"nidajew796@bamsrad.com",
  "otp":" 603377"
} 

!! новый пароль

9)
GET
http://localhost:4000/api/user/data

{ "password":"Natali777",
  "email":"nidajew796@bamsrad.com",
  
}
плучили данные нашего юзера
 */