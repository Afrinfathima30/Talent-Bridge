import mongoose from 'mongoose';
const userSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true,maxlength:100},
  email:{type:String,required:true,unique:true,lowercase:true,trim:true},
  passwordHash:{type:String,required:true},
  role:{type:String,enum:['candidate','employer','admin'],default:'candidate'},
  headline:{type:String,default:'',maxlength:180},
  location:{type:String,default:'',maxlength:120},
  linkedinUrl:{type:String,default:''},
  isSuspended:{type:Boolean,default:false}
},{timestamps:true});
export default mongoose.model('User',userSchema);
