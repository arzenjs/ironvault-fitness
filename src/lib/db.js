import mongoose from 'mongoose';
let pending;
export async function db(){
 if(!process.env.MONGODB_URI) throw Error('Database configuration missing');
 if(mongoose.connection.readyState===1) return mongoose;
 pending ??= mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:8000}).catch(e=>{pending=null;throw e;});
 await pending; return mongoose;
}
