import bcrypt from 'bcryptjs';
import {db} from '@/lib/db';
import {User} from '@/models';
import {registration} from '@/lib/validation';
import {endpoint,origin,body,rate} from '@/lib/security';
export const POST=endpoint(async req=>{origin(req);const data=registration.parse(await body(req));await rate('register:'+data.email,4);await db();await User.create({...data,password:await bcrypt.hash(data.password,12),role:'customer'});return Response.json({ok:true},{status:201});});
