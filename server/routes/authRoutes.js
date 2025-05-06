import express from 'express';
import { register, login, logout} from '../controllers/authController.js';

const authRouter = express();


// wenn ich post request dchike zu  api/auth/register soll register controller reagieen 
authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)


export default authRouter;