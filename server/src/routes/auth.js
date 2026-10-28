import {Router} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
const router=Router();
const publicUser=u=>({id:u._id,name:u.name,email:u.email,role:u.role,headline:u.headline,location:u.location,linkedinUrl:u.linkedinUrl});
const tokenFor=u=>jwt.sign({userId:u._id},process.env.JWT_SECRET || 'development-only-secret',{expiresIn:'7d'});
router.post('/register',async(req,res,next)=>{
 try{
  const {name,email,password,role}=req.body;
  if(!name?.trim()||!email?.trim()||!password)return res.status(400).json({message:'Name, email and password are required'});
  if(password.length<8)return res.status(400).json({message:'Password must be at least 8 characters'});
  if(role && !['candidate','employer'].includes(role))return res.status(400).json({message:'Choose candidate or employer'});
  const normalized=email.toLowerCase().trim();
  if(await User.findOne({email:normalized}))return res.status(409).json({message:'Email is already registered'});
  const user=await User.create({name:name.trim(),email:normalized,passwordHash:await bcrypt.hash(password,12),role:role||'candidate'});
  res.status(201).json({token:tokenFor(user),user:publicUser(user)});
 }catch(e){next(e);}
});
router.post('/login',async(req,res,next)=>{
 try{
  const user=await User.findOne({email:req.body.email?.toLowerCase().trim()});
  if(!user||!(await bcrypt.compare(req.body.password||'',user.passwordHash))||user.isSuspended)return res.status(401).json({message:'Invalid credentials or account unavailable'});
  res.json({token:tokenFor(user),user:publicUser(user)});
 }catch(e){next(e);}
});
router.get('/me',auth,(req,res)=>res.json({user:publicUser(req.user)}));
router.patch('/me',auth,async(req,res,next)=>{
 try{
  const allowed=['name','headline','location','linkedinUrl'];
  const updates=Object.fromEntries(Object.entries(req.body).filter(([k])=>allowed.includes(k)));
  const user=await User.findByIdAndUpdate(req.user._id,updates,{new:true,runValidators:true});
  res.json({user:publicUser(user)});
 }catch(e){next(e);}
});
export default router;
