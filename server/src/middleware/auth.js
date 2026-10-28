import jwt from 'jsonwebtoken';
import User from '../models/User.js';
export default async function auth(req,res,next){
 try{
  const token=req.headers.authorization?.replace(/^Bearer\s+/i,'');
  if(!token)return res.status(401).json({message:'Authentication required'});
  const payload=jwt.verify(token,process.env.JWT_SECRET || 'development-only-secret');
  const user=await User.findById(payload.userId).select('_id name email role headline location linkedinUrl isSuspended');
  if(!user || user.isSuspended)return res.status(401).json({message:'Account unavailable'});
  req.user=user;next();
 }catch{return res.status(401).json({message:'Invalid or expired token'});}
}
export const requireRole=(...roles)=>(req,res,next)=>roles.includes(req.user?.role)?next():res.status(403).json({message:'You do not have permission to perform this action'});
