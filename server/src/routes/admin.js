import {Router} from 'express';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import auth,{requireRole} from '../middleware/auth.js';
const router=Router();
router.use(auth,requireRole('admin'));
router.get('/overview',async(_req,res,next)=>{
 try{
  const [users,jobs,applications,pendingJobs,candidates,employers]=await Promise.all([
   User.countDocuments(),Job.countDocuments(),Application.countDocuments(),Job.countDocuments({status:'pending'}),
   User.countDocuments({role:'candidate'}),User.countDocuments({role:'employer'})
  ]);
  res.json({users,jobs,applications,pendingJobs,candidates,employers});
 }catch(e){next(e);}
});
router.get('/jobs',async(_req,res,next)=>{
 try{res.json(await Job.find({status:'pending'}).populate('employer','name email').sort({createdAt:1}));}catch(e){next(e);}
});
router.patch('/jobs/:id',async(req,res,next)=>{
 try{
  if(!['approved','rejected'].includes(req.body.status))return res.status(400).json({message:'Status must be approved or rejected'});
  const job=await Job.findByIdAndUpdate(req.params.id,{status:req.body.status,moderationNote:(req.body.moderationNote||'').slice(0,1000)},{new:true,runValidators:true});
  if(!job)return res.status(404).json({message:'Job not found'});
  res.json(job);
 }catch(e){next(e);}
});
router.get('/users',async(_req,res,next)=>{
 try{res.json(await User.find().select('name email role isSuspended createdAt').sort({createdAt:-1}).limit(500));}catch(e){next(e);}
});
router.patch('/users/:id/suspension',async(req,res,next)=>{
 try{
  if(String(req.params.id)===String(req.user._id))return res.status(400).json({message:'You cannot suspend your own admin account'});
  const user=await User.findByIdAndUpdate(req.params.id,{isSuspended:Boolean(req.body.isSuspended)},{new:true}).select('name email role isSuspended');
  if(!user)return res.status(404).json({message:'User not found'});
  res.json(user);
 }catch(e){next(e);}
});
export default router;
