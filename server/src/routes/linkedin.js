import {Router} from 'express';
import auth from '../middleware/auth.js';
const router=Router();
router.get('/connect',auth,(req,res)=>{
 if(!process.env.LINKEDIN_CLIENT_ID||!process.env.LINKEDIN_CLIENT_SECRET)return res.status(503).json({message:'LinkedIn integration is not configured. Add approved LinkedIn OAuth app credentials to server/.env.'});
 const state=crypto.randomUUID();
 // Production implementation should persist and validate state per user/session.
 const params=new URLSearchParams({response_type:'code',client_id:process.env.LINKEDIN_CLIENT_ID,redirect_uri:process.env.LINKEDIN_REDIRECT_URI,scope:'openid profile email',state});
 res.json({authorizationUrl:`https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`,state});
});
router.get('/callback',async(req,res)=>{
 if(!req.query.code)return res.status(400).send('LinkedIn authorization was not completed.');
 // Deliberately not exchanging tokens until the app has configured the approved product/permissions.
 res.status(501).send('OAuth callback scaffold is ready. Configure the approved LinkedIn product, state storage/validation, token exchange, and permitted profile fields before enabling import.');
});
export default router;
