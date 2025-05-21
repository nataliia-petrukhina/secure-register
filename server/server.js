import express from "express";
import cors from "cors"
import 'dotenv/config';
import connectDB from "./config/mongodb.js"
import authRouter from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoutes.js";
const app = express()
const port = process.env.PORT || 4000
connectDB()



app.use(express.json())
app.use(cookieParser())// Подключаем middleware для чтения куки из запросов. Без него мы не сможем получить куки в req.cookies.

app.use(cors({origin:"http://localhost:5173",credentials: true}))// Разрешаем кросс-доменные запросы (например, от фронтенда, который работает на другом порту). credentials: true — значит разрешаем куки и авторизацию.

app.get('/', (req, res)=> {res.send("API Working  *__* ")})
app.use('/api/auth' ,authRouter)
app.use('/api/user/', userRouter)



app.listen(port, ()=> console.log(`The server listen on port : ${port}`))