import express from 'express';
import { userRoute } from './routes/userRoute';
import { authRoute } from './routes/auth/authRoute';
import { qrFlowRoute } from './routes/qr-flow/qrFlowRoute';
import { adminRoute } from './routes/admin/adminRoute';
import { salesmanRoute } from './routes/salesman/salesmanRoute';
import { forwardCall, sendVoiceReason ,sendRtoRequest ,initiateCallConnect} from './controllers/call-text/callTextController';

export const apiRouter = express.Router();

apiRouter.use('/user', userRoute);
apiRouter.use('/auth', authRoute);
apiRouter.use('/qr-flow', qrFlowRoute);
apiRouter.use('/admin', adminRoute);
apiRouter.use('/salesman', salesmanRoute);
// apiRouter.use('/video', videoRoute);
apiRouter.post('/qr/send-voice-reason', sendVoiceReason);
apiRouter.post('/rtoapi', sendRtoRequest);
apiRouter.post('/call-connect', initiateCallConnect);
