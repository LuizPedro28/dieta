const KEY='meu-diario-v1';
const state=JSON.parse(localStorage.getItem(KEY)||'null')||{goal:2100,days:{}};
const today=new Date().toISOString().slice(0,10);
state.days[today] ||= {meals:[]};

const $=id=>document.getElementById(id);
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function totals(){
  return state.days[today].meals.reduce((a,m)=>({cal:a.cal+m.cal,protein:a.protein+m.protein,carbs:a.carbs+m.carbs,fat:a.fat+m.fat}),{cal:0,protein:0,carbs:0,fat:0})
}
function render(){
  const t=totals(), pct=Math.min(100,Math.round(t.cal/state.goal*100));
  $('calories').textContent=Math.round(t.cal); $('goal').textContent=state.goal;
  $('protein').textContent=Math.round(t.protein)+'g'; $('carbs').textContent=Math.round(t.carbs)+'g'; $('fat').textContent=Math.round(t.fat)+'g';
  $('percent').textContent=pct+'%'; $('progress').style.width=pct+'%';
  $('dateLabel').textContent=new Date(today+'T12:00').toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});
  $('meals').innerHTML=state.days[today].meals.length?state.days[today].meals.map((m,i)=>`<div class="meal"><div><b>${m.name}</b><small>${m.items.join(', ')}</small></div><strong>${Math.round(m.cal)} kcal</strong></div>`).join(''):'<div class="empty">Nenhuma refeição registrada ainda.</div>';
}
function addMessage(text,who){const d=document.createElement('div');d.className='bubble '+who;d.textContent=text;$('messages').appendChild(d);$('messages').scrollTop=9999}
function estimate(text){
  const s=text.toLowerCase(), items=[], add=(name,cal,p,c,f)=>{items.push(name);return{cal,p,c,f}};
  let t={cal:0,p:0,c:0,f:0};
  const foods=[
    ['ovo',78,6.3,0.6,5.3],['arroz',205,4.3,45,0.4],['feijão',110,7,20,0.5],['frango',165,31,0,3.6],
    ['carne',250,26,0,17],['pão',130,5,24,1.5],['banana',90,1,23,0.3],['maçã',80,0.4,21,0.2],
    ['queijo',100,7,1,8],['leite',120,6,9,5],['iogurte',100,5,12,3],['aveia',150,5,27,3],
    ['macarrão',220,8,43,1.5],['pizza',280,12,35,10],['salada',50,2,8,1],['café',20,1,3,0]
  ];
  for(const [name,cal,p,c,f] of foods){
    if(s.includes(name)){
      let qty=1;
      const m=s.match(new RegExp('(\\d+)\\s*(?:unidades?|x)?\\s*'+name));
      if(m) qty=+m[1];
      t.cal+=cal*qty;t.p+=p*qty;t.c+=c*qty;t.f+=f*qty;items.push((qty>1?qty+'x ':'')+name);
    }
  }
  if(!items.length){t={cal:0,p:0,c:0,f:0};items.push(text)}
  return {t,items};
}
$('chatForm').onsubmit=e=>{
  e.preventDefault();const text=$('input').value.trim();if(!text)return;
  addMessage(text,'user');
  const r=estimate(text);
  if(!r.t.cal){addMessage('Entendi o registro, mas ainda não reconheci os alimentos para estimar calorias. Na próxima etapa a IA fará essa interpretação com muito mais precisão.','ai')}
  state.days[today].meals.push({name:'Refeição',items:r.items,cal:r.t.cal,protein:r.t.p,carbs:r.t.c,fat:r.t.f});
  save();render();$('input').value='';
  if(r.t.cal)addMessage(`Registrado: ${r.items.join(', ')} — aproximadamente ${Math.round(r.t.cal)} kcal.`,'ai');
};
$('clearBtn').onclick=()=>{if(confirm('Apagar as refeições de hoje?')){state.days[today].meals=[];save();render()}};
$('todayBtn').onclick=()=>render();
render();
