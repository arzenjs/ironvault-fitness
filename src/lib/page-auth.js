import {redirect} from 'next/navigation';
import {currentUser} from './auth.js';
export async function pageUser(roles){try{return await currentUser(roles);}catch(e){if(e.status===401)redirect('/login');if(e.status===403)redirect('/account?denied=1');throw e;}}
