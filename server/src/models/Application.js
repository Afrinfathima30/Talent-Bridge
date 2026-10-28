import mongoose from 'mongoose';
const applicationSchema = new mongoose.Schema({
  job:{type:mongoose.Schema.Types.ObjectId,ref:'Job',required:true},
  candidate:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
  coverLetter:{type:String,default:'',maxlength:5000},
  resumeText:{type:String,default:''},
  resumeFileName:{type:String,default:''},
  extractedSkills:{type:[String],default:[]},
  matchScore:{type:Number,default:0,min:0,max:100},
  matchedSkills:{type:[String],default:[]},
  missingSkills:{type:[String],default:[]},
  status:{type:String,enum:['submitted','reviewing','shortlisted','interview','offered','rejected'],default:'submitted'},
  employerNote:{type:String,default:'',maxlength:3000}
},{timestamps:true});
applicationSchema.index({job:1,candidate:1},{unique:true});
export default mongoose.model('Application',applicationSchema);
