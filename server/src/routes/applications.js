import {Router} from 'express';
import multer from 'multer';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import auth,{requireRole} from '../middleware/auth.js';
import {parseResume} from '../utils/parseResume.js';
import {matchResume} from '../utils/resume.js';
const router=Router();
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024},fileFilter:(_req,file,cb)=>{
 const ok=/\.(pdf|docx|txt)$/i.test(file.originalname);
 cb(ok?null:Object.assign(new Error('Only PDF, DOCX, and TXT files are accepted'),{status:400}),ok);
}});
router.use(auth);
router.post('/',requireRole('candidate'),upload.single('resume'),async(req,res,next)=>{
 try{
  const job=await Job.findOne({_id:req.body.jobId,status:'approved'});
  if(!job)return res.status(404).json({message:'Job not found or not accepting applications'});
  if(!req.file)return res.status(400).json({message:'Please attach your resume (PDF, DOCX, or TXT)'});
  const resumeText=(await parseResume(req.file)).slice(0,50000);
  if(!resumeText.trim())return res.status(400).json({message:'No readable text found. Try a text-based PDF or DOCX file.'});
  const match=matchResume(resumeText,job);
  const application=await Application.create({job:job._id,candidate:req.user._id,coverLetter:req.body.coverLetter||'',resumeText,resumeFileName:req.file.originalname,...match});
  res.status(201).json(application);
 }catch(e){if(e.code===11000)return res.status(409).json({message:'You have already applied to this job'});next(e);}
});
router.get('/mine',requireRole('candidate'),async(req,res,next)=>{
 try{res.json(await Application.find({candidate:req.user._id}).populate('job','title company location workMode employmentType status').sort({createdAt:-1}));}catch(e){next(e);}
});
router.get('/received',requireRole('employer','admin'),async(req,res,next)=>{
 try{
  const jobs=await Job.find(req.user.role==='admin'?{}:{employer:req.user._id}).select('_id');
  const apps=await Application.find({job:{$in:jobs.map(j=>j._id)}}).populate('job','title company').populate('candidate','name email headline location').sort({createdAt:-1});
  res.json(apps);
 }catch(e){next(e);}
});
router.patch('/:id',requireRole('employer','admin'),async(req,res,next)=>{
 try{
  const app=await Application.findById(req.params.id).populate('job');
  if(!app)return res.status(404).json({message:'Application not found'});
  if(req.user.role!=='admin'&&String(app.job.employer)!==String(req.user._id))return res.status(403).json({message:'Not your job application'});
  const allowed=['submitted','reviewing','shortlisted','interview','offered','rejected'];
  if(!allowed.includes(req.body.status))return res.status(400).json({message:'Invalid application status'});
  app.status=req.body.status;
  if(typeof req.body.employerNote==='string')app.employerNote=req.body.employerNote.slice(0,3000);
  await app.save();res.json(app);
 }catch(e){next(e);}
});
export default router;
