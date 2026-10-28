import pdf from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
export async function parseResume(file){
 const name=file.originalname.toLowerCase();
 if(name.endsWith('.pdf')){
  const result=await pdf(file.buffer);
  return result.text || '';
 }
 if(name.endsWith('.docx')){
  const result=await mammoth.extractRawText({buffer:file.buffer});
  return result.value || '';
 }
 if(name.endsWith('.txt')) return file.buffer.toString('utf8');
 const error=new Error('Unsupported file type. Upload PDF, DOCX, or TXT.');
 error.status=400;throw error;
}
