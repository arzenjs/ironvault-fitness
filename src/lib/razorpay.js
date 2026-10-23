import Razorpay from 'razorpay';
export function provider(){const key=process.env.RAZORPAY_KEY_ID;if(!key?.startsWith('rzp_test_')||!process.env.RAZORPAY_KEY_SECRET)throw Error('Razorpay test credentials missing');return new Razorpay({key_id:key,key_secret:process.env.RAZORPAY_KEY_SECRET});}
