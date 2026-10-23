import {getServerSession} from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import {db} from './db.js';
import {User} from '../models/index.js';
import {login} from './validation.js';
import {rate,SafeError} from './security.js';
// v4 reads NEXTAUTH_URL; keep one documented deployment origin.
process.env.NEXTAUTH_URL=process.env.AUTH_URL;
const Provider=Credentials.default||Credentials;
export const authOptions={secret:process.env.AUTH_SECRET,session:{strategy:'jwt',maxAge:86400},pages:{signIn:'/login'},providers:[Provider({credentials:{email:{type:'email'},password:{type:'password'}},async authorize(input){const parsed=login.safeParse(input);if(!parsed.success)return null;await rate('login:'+parsed.data.email,10);await db();const user=await User.findOne({email:parsed.data.email,enabled:true}).select('+password');if(!user||!await bcrypt.compare(parsed.data.password,user.password))return null;return {id:String(user._id),name:user.name,email:user.email};}})],callbacks:{async jwt({token,user}){if(user)token.id=user.id;return token;},async session({session,token}){session.user.id=token.id;return session;}}};
export async function currentUser(roles=['customer','staff','admin']){const session=await getServerSession(authOptions);if(!session?.user?.id)throw new SafeError('Please log in',401);await db();const user=await User.findById(session.user.id);if(!user?.enabled||!roles.includes(user.role))throw new SafeError('Access denied',403);return user;}
