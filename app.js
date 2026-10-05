const KEY='meu-diario-v2';
const state=JSON.parse(localStorage.getItem(KEY)||'null')||{
  goal:2100,proteinGoal:150,carbsGoal:220,fatGoal:70,days:{},settings:{name:'',weekAdjustment:true}
};
const todayKey=()=>new Date().toISOString().slice(0,10);
const today=todayKey(); state.days[today] ||= {meals:[]};
const $=id=>document.getElementById(id);
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function totals(day=today){
 return (state.days[day]?.meals||[]).reduce((a,m)=>({
  cal:a.cal+m.cal,protein:a.protein+m.protein,carbs:a.carbs+m.carbs,fat:a.fat+m.fat
 }),{cal:0,protein:0,carbs:0,fat:0});
}
function weekDates(){
 const d=new Date(today+'T12:00'), day=d.getDay(), diff=day===0?-6:1-day;
 d.setDate(d.getDate()+diff); const out=[];
 for(let i=0;i<7;i++){out.push(d.toISOString().slice(0,10));d.setDate(d.getDate()+1)}
 return out;
}
function weekly(){
 const ds=weekDates(), vals=ds.map(d=>totals(d));
 return {days:ds,consumed:vals.reduce((x,v)=>x+v.cal,0),target:state.goal*7,avg:vals.reduce((x,v)=>x+v.cal,0)/7,logged:vals.filter((_,i)=>state.days[ds[i]]?.meals?.length).length};
}
function render(){
 const t=totals(), pct=Math.min(100,Math.round(t.cal/state.goal*100)), w=weekly();
 $('calories').textContent=Math.round(t.cal); $('goal').textContent=state.goal;
 $('protein').textContent=Math.round(t.protein)+'g'; $('carbs').textContent=Math.round(t.carbs)+'g'; $('fat').textContent=Math.round(t.fat)+'g';
 $('percent').textContent=pct+'%'; $('progress').style.width=pct+'%';
 $('dateLabel').textContent=new Date(today+'T12:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});
 $('weekly').textContent=Math.round(w.avg)+' kcal/dia';
 $('logged').textContent=w.logged+'/7 dias';
 $('weekBalance').textContent=(Math.round(w.consumed-w.target)>0?'+':'')+Math.round(w.consumed-w.target)+' kcal';
 $('meals').innerHTML=state.days[today].meals.length?state.days[today].meals.map((m,i)=>`<div class="meal"><div><b>${escapeHtml(m.name)}</b><small>${escapeHtml(m.items.join(', '))}</small></div><strong>${Math.round(m.cal)} kcal</strong><button class="delete" data-i="${i}">×</button></div>`).join(''):'<div class="empty">Nenhuma refeição registrada ainda.</div>';
 document.querySelectorAll('.delete').forEach(b=>b.onclick=()=>{state.days[today].meals.splice(+b.dataset.i,1);save();render()});
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function addMessage(text,who){const d=document.createElement('div');d.className='bubble '+who;d.textContent=text;$('messages').appendChild(d);$('messages').scrollTop=9999}
function parseQuantity(s,name,defaultQty=1){
 const rx=new RegExp('(\\d+(?:[,.]\\d+)?)\\s*(g|gramas?|ml|kg|unidades?|x)?\\s*'+name);
 const m=s.match(rx); return m?{q:parseFloat(m[1].replace(',','.')),unit:m[2]||'un'}:{q:defaultQty,unit:'un'};
}
function estimate(text){
 const s=text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const foods=[
  ['ovo',78,6.3,.6,5.3],['arroz',130,2.7,28,.3],['feijao',76,4.8,14,.5],['frango',165,31,0,3.6],
  ['carne',250,26,0,17],['bife',250,26,0,17],['pao',130,5,24,1.5],['banana',90,1,23,.3],
  ['maca',80,.4,21,.2],['queijo',100,7,1,8],['leite',120,6,9,5],['iogurte',100,5,12,3],
  ['aveia',150,5,27,3],['macarrao',220,8,43,1.5],['pizza',280,12,35,10],['salada',50,2,8,1],
  ['cafe',20,1,3,0],['refrigerante',140,0,39,0],['coca',140,0,39,0],['chocolate',130,2,15,7]
 ];
 let t={cal:0,p:0,c:0,f:0},items=[];
 for(const [name,cal,p,c,f] of foods) if(s.includes(name)){
   const q=parseQuantity(s,name).q;
   const multiplier = q>=20 && (s.includes('g '+name)||s.includes('g de '+name)) ? q/100 : q;
   t.cal+=cal*multiplier;t.p+=p*multiplier;t.c+=c*multiplier;t.f+=f*multiplier;
   items.push((q!==1?q+'x ':'')+name);
 }
 if(!items.length)return null;
 return {t,items};
}
function smartAnswer(){
 const t=totals(), remain=Math.max(0,state.goal-t.cal),w=weekly();
 return `Hoje você está em ${Math.round(t.cal)} kcal. Restam aproximadamente ${Math.round(remain)} kcal da meta de ${state.goal}. Sua média semanal está em ${Math.round(w.avg)} kcal/dia.`;
}
$('chatForm').onsubmit=e=>{
 e.preventDefault();const text=$('input').value.trim();if(!text)return;
 addMessage(text,'user'); const low=text.toLowerCase();
 if(/quanto|resta|posso comer|calorias hoje|como estou/.test(low)){addMessage(smartAnswer(),'ai');$('input').value='';return}
 if(/meta|objetivo/.test(low)){addMessage(`Sua meta atual é ${state.goal} kcal/dia, com ${state.proteinGoal}g de proteína, ${state.carbsGoal}g de carboidratos e ${state.fatGoal}g de gordura.`,'ai');$('input').value='';return}
 const r=estimate(text);
 if(!r){addMessage('Ainda não reconheci um alimento nessa frase. Tente algo como “comi 2 ovos e 100g de arroz”. Na próxima fase, a IA online fará essa interpretação sem depender dessa lista.','ai');$('input').value='';return}
 state.days[today].meals.push({name:'Refeição',items:r.items,cal:r.t.cal,protein:r.t.p,carbs:r.t.c,fat:r.t.f});
 save();render();$('input').value='';
 addMessage(`Registrado: ${r.items.join(', ')} — ~${Math.round(r.t.cal)} kcal. ${smartAnswer()}`,'ai');
};
$('clearBtn').onclick=()=>{if(confirm('Apagar as refeições de hoje?')){state.days[today].meals=[];save();render()}};
$('settingsBtn').onclick=()=>{$('settings').classList.toggle('hidden')};
$('saveSettings').onclick=()=>{
 state.goal=+$('goalInput').value||2100;state.proteinGoal=+$('proteinInput').value||150;state.carbsGoal=+$('carbsInput').value||220;state.fatGoal=+$('fatInput').value||70;save();render();$('settings').classList.add('hidden')
};
$('weekBtn').onclick=()=>{$('weekPanel').classList.toggle('hidden');renderWeek()};
function renderWeek(){
 const w=weekly();$('weekAvg').textContent=Math.round(w.avg)+' kcal/dia';$('weekTarget').textContent=Math.round(state.goal)+' kcal/dia';
 $('weekList').innerHTML=w.days.map(d=>{const t=totals(d),label=new Date(d+'T12:00').toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit'});return `<div><span>${label}</span><b>${Math.round(t.cal)} kcal</b></div>`}).join('');
}
render();
