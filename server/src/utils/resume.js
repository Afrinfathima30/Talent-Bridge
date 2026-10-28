const SKILLS = [
'javascript','typescript','python','java','c++','c#','react','node.js','express','mongodb','sql','mysql',
'postgresql','html','css','tailwind','aws','azure','docker','kubernetes','git','linux','cybersecurity',
'penetration testing','nmap','wireshark','osint','machine learning','data analysis','excel','power bi',
'tableau','communication','project management','rest api','graphql','django','flask','fastapi',
'figma','ui/ux','testing','jest','playwright','salesforce','seo','digital marketing'
];
export function extractSkills(text=''){
 const lower=text.toLowerCase();
 return SKILLS.filter(skill=>{
  const escaped=skill.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return new RegExp(`(^|[^a-z0-9+#.])${escaped}([^a-z0-9+#.]|$)`,'i').test(lower);
 });
}
export function matchResume(resumeText, job){
 const resumeSkills=extractSkills(resumeText);
 const jobText=[job.title,job.description,job.requirements,...(job.skills||[])].join(' ').toLowerCase();
 const targetSkills=[...new Set([...(job.skills||[]).map(s=>s.toLowerCase()),...extractSkills(jobText)])];
 const matchedSkills=targetSkills.filter(s=>resumeSkills.includes(s));
 const missingSkills=targetSkills.filter(s=>!resumeSkills.includes(s));
 const skillScore=targetSkills.length?matchedSkills.length/targetSkills.length:0;
 const words=s=>new Set(s.toLowerCase().match(/[a-z][a-z+#.]{2,}/g)||[]);
 const resumeWords=words(resumeText), jobWords=words(`${job.title} ${job.description} ${job.requirements}`);
 const keywordOverlap=[...jobWords].filter(w=>resumeWords.has(w)).length/Math.max(jobWords.size,1);
 const rawScore = targetSkills.length
  ? skillScore * 0.8 + keywordOverlap * 0.2
  : keywordOverlap;
 const matchScore = Math.max(0, Math.min(100, Math.round(rawScore * 100)));
 return {matchScore,matchedSkills,missingSkills,extractedSkills:resumeSkills};
}
