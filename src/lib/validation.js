import {z} from 'zod';
export const registration=z.object({name:z.string().trim().min(2).max(80),email:z.string().trim().email().max(200).transform(s=>s.toLowerCase()),password:z.string().min(12).max(72).refine(s=>Buffer.byteLength(s,'utf8')<=72,'Password must be at most 72 UTF-8 bytes')});
export const login=z.object({email:registration.shape.email,password:z.string().min(1).max(72)});
export const contact=z.object({name:z.string().trim().min(2).max(80),email:registration.shape.email,message:z.string().trim().min(20).max(3000)});
export const planInput=z.object({planId:z.enum(['monthly','quarterly','annual']),requestKey:z.string().uuid()});
