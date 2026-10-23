import {db} from '../src/lib/db.js';
import {Payment,Mail,indexes} from '../src/models/index.js';
import {reconcile} from '../src/services/payments.js';
import {deliverMail} from '../src/lib/email.js';
try{await db();await indexes();const cursor=Payment.find({$or:[{status:{$ne:'successful'}},{processedAt:{$exists:false}}]}).cursor();for await(const p of cursor){try{await reconcile(p);}catch{console.error('Purchase requires retry:',String(p._id));}}const keys=await Mail.find({status:'pending'}).select('key');for(const m of keys)await deliverMail(m.key);}finally{const {default:mongoose}=await import('mongoose');await mongoose.disconnect();}
