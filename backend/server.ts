import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import  otpRoutes  from './routes/sendOtp'; // adjust as needed

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔥 Fix: Add this line BEFORE defining routes
app.use(cors());
app.use(express.json()); // This is crucial!

app.use('/api', otpRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
