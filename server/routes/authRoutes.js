import express from 'express';
import { register, login} from '../controllers/authController.js';

const authRouter = express();


// wenn ich post request dchike zu  api/auth/register soll register controller reagieen 
authRouter.post('/register', register)
authRouter.post('/login', login)


export default authRouter;