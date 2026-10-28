import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import adminRoutes from './routes/admin.js';
import linkedinRoutes from './routes/linkedin.js';

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }), authRoutes);
app.use('/api/linkedin', linkedinRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/health', (_req,res)=>res.json({status:'ok',service:'TalentBridge API'}));
app.use((err,_req,res,_next)=>{
  console.error(err);
  res.status(err.status || 500).json({message:err.message || 'Internal server error'});
});
const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/talentbridge')
  .then(()=>app.listen(port,()=>console.log(`TalentBridge API listening on ${port}`)))
  .catch(err=>{console.error('MongoDB connection failed:',err.message);process.exit(1);});
