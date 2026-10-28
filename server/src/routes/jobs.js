import {Router} from 'express';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import auth,{requireRole} from '../middleware/auth.js';
const router=Router();
router.get('/',async(req,res,next)=>{
 try{
  const filter={status:'approved'};
  if(req.query.q)filter.$text={$search:req.query.q};
  if(req.query.location)filter.location={$regex:req.query.location.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),$options:'i'};
  if(req.query.workMode)filter.workMode=req.query.workMode;
  if(req.query.employmentType)filter.employmentType=req.query.employmentType;
  const jobs=await Job.find(filter).populate('employer','name headline').sort({createdAt:-1}).limit(100);
  res.json(jobs);
 }catch(e){next(e);}
});
router.get('/mine',auth,requireRole('employer','admin'),async(req,res,next)=>{
 try{res.json(await Job.find({employer:req.user._id}).sort({createdAt:-1}));}catch(e){next(e);}
});
router.post('/',auth,requireRole('employer'),async(req,res,next)=>{
 try{
  const {title,company,description,requirements,skills,location,workMode,employmentType,salaryMin,salaryMax}=req.body;
  if(!title?.trim()||!company?.trim()||!description?.trim())return res.status(400).json({message:'Title, company, and description are required'});
  const job=await Job.create({title,company,description,requirements,skills:Array.isArray(skills)?skills:[],location,workMode,employmentType,salaryMin:salaryMin||null,salaryMax:salaryMax||null,employer:req.user._id});
  res.status(201).json(job);
 }catch(e){next(e);}
});
router.patch('/:id',auth,requireRole('employer','admin'),async(req,res,next)=>{
 try{
  const filter=req.user.role==='admin'?{_id:req.params.id}:{_id:req.params.id,employer:req.user._id};
  const allowed=['title','company','description','requirements','skills','location','workMode','employmentType','salaryMin','salaryMax','status'];
  const updates=Object.fromEntries(Object.entries(req.body).filter(([k])=>allowed.includes(k)));
  if(req.user.role!=='admin' && 'status' in updates && !['closed','pending'].includes(updates.status))return res.status(403).json({message:'Only admins can approve or reject jobs'});
  if(req.user.role!=='admin' && !['closed'].includes(updates.status)) updates.status='pending';
  const job=await Job.findOneAndUpdate(filter,updates,{new:true,runValidators:true});
  if(!job)return res.status(404).json({message:'Job not found'});
  res.json(job);
 }catch(e){next(e);}
});
router.delete('/:id',auth,requireRole('employer','admin'),async(req,res,next)=>{
 try{
  const filter=req.user.role==='admin'?{_id:req.params.id}:{_id:req.params.id,employer:req.user._id};
  const job=await Job.findOneAndDelete(filter);
  if(!job)return res.status(404).json({message:'Job not found'});
  await Application.deleteMany({job:job._id});
  res.json({message:'Job deleted'});
 }catch(e){next(e);}
});
router.get('/:id',async(req,res,next)=>{
 try{
  const job=await Job.findOne({_id:req.params.id,status:'approved'}).populate('employer','name headline');
  if(!job)return res.status(404).json({message:'Job not found'});
  res.json(job);
 }catch(e){next(e);}
});
export default router;
