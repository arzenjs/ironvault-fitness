export const date=value=>value?new Intl.DateTimeFormat('en-IN',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kolkata'}).format(new Date(value)):'Awaiting activation';
export const daysRemaining=end=>Math.max(0,Math.ceil((new Date(end)-new Date())/86400000));
