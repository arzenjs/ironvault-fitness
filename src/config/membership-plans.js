export const plans=[
{id:'monthly',name:'Vault Monthly',pricePaise:149900,months:1,benefits:['One month of gym-floor access','Strength and cardio equipment','Locker access','Standard gym orientation']},
{id:'quarterly',name:'Vault Quarterly',pricePaise:399900,months:3,recommended:true,benefits:['Three months of gym access','All standard gym-floor benefits','One fitness assessment','Priority access to selected group sessions']},
{id:'annual',name:'Vault Annual',pricePaise:1399900,months:12,benefits:['Twelve months of gym access','All standard gym-floor benefits','Two fitness assessments','Priority registration for selected group sessions']}
];
export function getPlan(id){return plans.find(p=>p.id===id);}
export const money=paise=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(paise/100);
