import mongoose from 'mongoose';
const jobSchema = new mongoose.Schema({
  title:{type:String,required:true,trim:true,maxlength:160},
  company:{type:String,required:true,trim:true,maxlength:160},
  description:{type:String,required:true,maxlength:12000},
  requirements:{type:String,default:'',maxlength:6000},
  skills:{type:[String],default:[]},
  location:{type:String,default:'Remote'},
  workMode:{type:String,enum:['Remote','Hybrid','On-site'],default:'Remote'},
  employmentType:{type:String,enum:['Full-time','Part-time','Contract','Internship'],default:'Full-time'},
  salaryMin:{type:Number,default:null},salaryMax:{type:Number,default:null},
  status:{type:String,enum:['pending','approved','rejected','closed'],default:'pending'},
  moderationNote:{type:String,default:''},
  employer:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}
},{timestamps:true});
jobSchema.index({title:'text',company:'text',description:'text',requirements:'text',skills:'text',location:'text'});
export default mongoose.model('Job',jobSchema);
