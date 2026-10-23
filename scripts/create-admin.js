import bcrypt from 'bcryptjs';
import {db} from '../src/lib/db.js';
import {User,indexes} from '../src/models/index.js';
import {registration} from '../src/lib/validation.js';
const data=registration.parse({name:process.env.ADMIN_NAME,email:process.env.ADMIN_EMAIL,password:process.env.ADMIN_PASSWORD});
try{await db();await indexes();if(await User.exists({role:'admin'}))throw Error('Initial admin already exists');if(await User.exists({email:data.email}))throw Error('Email already belongs to an account');await User.create({...data,password:await bcrypt.hash(data.password,12),role:'admin'});console.log('Initial admin created. Remove ADMIN_PASSWORD from .env.local.');}finally{const {default:mongoose}=await import('mongoose');await mongoose.disconnect();}
