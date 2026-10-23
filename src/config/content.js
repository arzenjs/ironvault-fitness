export const facilities=[
{title:'Strength & free weights',image:'strength',text:'Purposeful barbell stations, racks and dumbbells for progressive, technique-led training.'},
{title:'Resistance training',image:'equipment',text:'Guided resistance stations for controlled movement and a balanced training routine.'},
{title:'Cardio conditioning',image:'cardio',text:'A dedicated conditioning area for warm-ups, intervals and steady-paced sessions.'},
{title:'Functional movement',image:'functional',text:'Open-floor space for mobility, carries and practical movement patterns.'},
{title:'Locker & changing facilities',image:'interior',text:'A considered arrival and changing experience, with lockers for use during training.'}
];
export const trainers=[{name:'Arjun â€” demo coach',specialty:'Strength foundations',text:'A fictional coach profile focused on sound technique, manageable progression and confidence under the bar.',image:'strength'},{name:'Meera â€” demo coach',specialty:'Conditioning & movement',text:'A fictional coach profile focused on conditioning, movement quality and sustainable training routines.',image:'functional'},{name:'Kabir â€” demo coach',specialty:'Resistance training',text:'A fictional coach profile focused on exercise selection, controlled movement and consistent effort.',image:'equipment'}];
export const faqs=[
{category:'Getting started',q:'Is IronVault a real gym?',a:'No. This is a fictional portfolio project. Address, coaches, facilities, prices and testimonials are sample content. No physical gym access is supplied.'},
{category:'Getting started',q:'Do I need previous gym experience?',a:'The demo membership includes an orientation. The intended member experience welcomes beginners and encourages asking for help with unfamiliar equipment.'},
{category:'Memberships',q:'Does my membership renew automatically?',a:'No. Each purchase is a fixed-duration, one-time payment. This application does not store card information or create recurring subscriptions.'},
{category:'Memberships',q:'What happens when I purchase another plan?',a:'A verified second purchase is scheduled after your already-paid membership period. Your dashboard distinguishes queued access from current access.'},
{category:'Memberships',q:'How are expiry dates calculated?',a:'Calendar months are added on the server. Month-end dates are clamped to the last valid day. The displayed expiry timestamp is exclusive.'},
{category:'Payments',q:'Are these real-money payments?',a:'The application accepts only Razorpay test keys. Do not enter real card details while testing. Test purchases do not provide real services.'},
{category:'Payments',q:'Why does a purchase show pending?',a:'Checkout completion is not proof of capture. The server waits for verified provider state. Use Check payment in your account, or allow the webhook and reconciliation worker to finish.'},
{category:'Payments',q:'What if I close checkout?',a:'Closing the window does not mean payment failure. Your attempt remains pending until provider verification confirms capture, failure or non-completion.'},
{category:'Support',q:'Can I book classes or personal training here?',a:'No. Class booking, trainer appointments and workout tracking are outside the scope of this demonstration.'},
{category:'Support',q:'Can I request a refund?',a:'This demo has no real-money refund workflow. A production business would need an explicit refund policy and verified refund handling before launch.'}
];
export const gallery=[['hero','Strength','Barbell training environment'],['interior','Space','Gym floor and training stations'],['strength','Strength','Free-weight training'],['cardio','Conditioning','Fitness conditioning space'],['equipment','Strength','Resistance equipment'],['functional','Conditioning','Functional training environment']].map(([id,category,alt])=>({id,category,alt}));
