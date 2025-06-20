import { Router } from 'express';
import { sendOtpHandler } from '../controllers/sendOtpController';
import { monitorRoute } from '../middleware/monitoringWrapper';

const router = Router();

router.post('/send-otp', monitorRoute('send_otp'), sendOtpHandler);

export default router;

