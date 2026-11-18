/* Universal return from transaction details, preserving the source screen and draft. */
(function(){
'use strict';
const PAGE={expenses:'viewExpenses',operations:'viewOperations',requests:'viewRequests',expected:'viewExpected',budgets:'viewBudgets'};
const LABEL={expenses:'المصاريف',operations:'المؤشرات',requests:'الطلبات',expected:'الالتزامات',budgets:'الموازنات'};
const STATE=['period','customDateRange','currentMemberFilter','selectedMember','currentWalletId','projectFilter','searchQuery','currency','activeOpsSubTab','activeBudgetId'];
const INPUTS='input:not([type="file"]):not([type="password"]),textarea,select,[contenteditable="true"]';
const el=id=>document.getElementById(id);
const copy=x=>{try{return JSON.parse(JSON.stringify(x));}catch{return x;}};
let context=null, pending=null, returning=false;
const currentPage=()=>Object.keys(PAGE).find(k=>el(PAGE[k])?.classList.contains('active'))||
  ((typeof state==='object' && state.activePage)||'expenses');
const isSummaryOpen=()=>!!el('summaryLeftDrawer')?.classList.contains('open');
function snapshot(){
 const page=currentPage(),root=el(PAGE[page]);
 const modals=[...document.querySelectorAll('[id].open')].filter(e=>/modal/i.test(e.id) &&
   e.getBoundingClientRect().width>0 && getComputedStyle(e).display!=='none');
 const summary=isSummaryOpen(),roots=[{key:'page',node:root}];
 if(summary)roots.push({key:'summary',node:el('summaryLeftDrawer')});
 modals.forEach(node=>roots.push({key:'modal:'+node.id,node}));
 const fields=[],details=[],scrolls=[],seen=new Set();
 roots.forEach(({key,node})=>{
  if(!node)return;
  [...node.querySelectorAll(INPUTS)].forEach((input,index)=>{
   if(seen.has(input))return;seen.add(input);
   fields.push({key,node:input,index,id:input.id,name:input.name,tag:input.tagName,
    value:input.isContentEditable?input.textContent:input.tagName==='SELECT'&&input.multiple?
     [...input.selectedOptions].map(o=>o.value):input.value,
    checked:(input.type==='checkbox'||input.type==='radio')?input.checked:null});
  });
  [...node.querySelectorAll('details')].forEach((d,index)=>details.push({key,node:d,index,id:d.id,open:d.open}));
  [node,...node.querySelectorAll('[id]')].forEach(n=>{
   if(n.scrollTop>0&&n.scrollHeight>n.clientHeight+8)scrolls.push({node:n,id:n.id,top:n.scrollTop,left:n.scrollLeft});
  });
 });
 const body=el('appScrollBody');
 const stateCopy={};
 if(typeof state==='object')STATE.forEach(k=>stateCopy[k]=copy(state[k]));
 const budgetTab=[['current','btnBudgetSubCurrent'],['projects','btnBudgetSubProjects'],
  ['comparisons','btnBudgetSubComparisons'],['history','btnBudgetSubHistory']]
  .find(([,id])=>el(id)?.classList.contains('active'))?.[0]||null;
 return {page,fields,details,scrolls,stateCopy,bodyTop:body?.scrollTop||0,windowTop:window.scrollY,
  summary,summaryTop:el('summaryLeftDrawer')?.scrollTop||0,
  summaryState:copy(window.summaryReturnState),modals:modals.map(n=>n.id),focus:document.activeElement,
  budgetTab,budgetView:el('btnBudgetInnerArchive')?.getAttribute('aria-pressed')==='true'?'archive':'compare',
  projectView:el('panelProjectArchiveView')?.style.display!=='none'?'archive':'compare',
  budgetChartMode:document.querySelector('#cmpPeriodChart [data-mode][aria-pressed="true"]')?.dataset.mode,
  time:Date.now()};
}
const rootFor=(e,ctx)=>e.key==='page'?el(PAGE[ctx.page]):e.key==='summary'?el('summaryLeftDrawer'):
 e.key.startsWith('modal:')?el(e.key.slice(6)):null;
function resolve(e,ctx,selector){
 if(e.node?.isConnected)return e.node;
 const root=rootFor(e,ctx);if(!root)return null;
 if(e.id){const by=el(e.id);if(by&&root.contains(by))return by;}
 const list=[...root.querySelectorAll(selector)];
 if(list[e.index]?.tagName===e.tag || !e.tag&&list[e.index])return list[e.index];
 return e.name?list.find(n=>n.name===e.name&&n.tagName===e.tag):null;
}
function restoreFields(ctx){
 ctx.fields.forEach(e=>{
  const n=resolve(e,ctx,INPUTS);if(!n)return;
  if(n.isContentEditable)n.textContent=e.value||'';
  else if(n.tagName==='SELECT'&&Array.isArray(e.value)){
   const selected=new Set(e.value);[...n.options].forEach(o=>o.selected=selected.has(o.value));
  }else if(e.value!==undefined&&n.value!==e.value)n.value=e.value;
  if(e.checked!==null)n.checked=e.checked;
 });
 ctx.details.forEach(e=>{const n=resolve(e,ctx,'details');if(n)n.open=e.open;});
}
function restoreScroll(ctx){
 const body=el('appScrollBody');if(body)body.scrollTop=ctx.bodyTop;
 ctx.scrolls.forEach(e=>{const n=e.node?.isConnected?e.node:e.id?el(e.id):null;
  if(n){n.scrollTop=e.top;n.scrollLeft=e.left;}});
 if(ctx.summary && el('summaryLeftDrawer'))el('summaryLeftDrawer').scrollTop=ctx.summaryTop;
 // Some layouts scroll the document, others the page pane or app body.
 if(window.scrollY!==ctx.windowTop)window.scrollTo(0,ctx.windowTop);
}
function installUI(){
 if(!el('opsUniversalReturnBar')&&el('viewOperations')){
  const bar=document.createElement('div');bar.id='opsUniversalReturnBar';
  bar.setAttribute('role','navigation');bar.setAttribute('aria-label','الرجوع من تفاصيل العمليات');
  bar.innerHTML='<span id="opsUniversalReturnText"></span><button type="button" id="btnOpsReturnToSource">رجوع إلى الصفحة السابقة <i class="fa-solid fa-arrow-right"></i></button>';
  el('viewOperations').prepend(bar);bar.querySelector('button').addEventListener('click',returnToSource);
 }
 if(!el('opsUniversalReturnFloat')){
  const btn=document.createElement('button');btn.id='opsUniversalReturnFloat';btn.type='button';
  btn.textContent='رجوع إلى المصدر';btn.addEventListener('click',returnToSource);document.body.append(btn);
 }
 if(!el('opsUniversalReturnStyles')){
  const style=document.createElement('style');style.id='opsUniversalReturnStyles';
  style.textContent=[
   '#opsUniversalReturnBar{display:none;direction:rtl;align-items:center;justify-content:space-between;gap:8px;padding:8px 11px;margin:4px 6px 10px;border:1px solid #50b9fc;border-radius:12px;background:linear-gradient(110deg,#edfaff,#d9f1ff);color:#0b4d83;font:850 12px Tahoma,Arial,sans-serif}',
   '#opsUniversalReturnBar span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
   '#btnOpsReturnToSource{border:0;border-radius:8px;padding:7px 12px;background:#077ec7;color:white;font:900 12px Tahoma,Arial,sans-serif;white-space:nowrap;cursor:pointer}',
   '#opsUniversalReturnFloat{display:none;position:fixed;left:12px;bottom:90px;z-index:1009;background:linear-gradient(#098bdc,#065b9d);color:white;border:1px solid #9be3ff;border-radius:100px;padding:10px 15px;box-shadow:0 4px 14px #064b8759;font:850 12px Tahoma,Arial,sans-serif;cursor:pointer}',
   'body.ops-return-context #opsUniversalReturnBar{display:flex}',
   'body.ops-return-context #opsUniversalReturnFloat{display:block}',
   'body.ops-return-context :is(#opsReturnToIndicatorsBanner,#opsReturnToSummaryBanner,#opsFloatingReturnToSummary,#opsFloatingReturnToIndicators){display:none !important}',
   '@media(max-width:350px){#opsUniversalReturnBar{font-size:10px}#btnOpsReturnToSource{padding:6px;font-size:10px}}'
  ].join('\n');document.head.append(style);
 }
}
function sync(){
 installUI();
 const on=!!context&&!returning&&currentPage()==='operations';
 document.body.classList.toggle('ops-return-context',on);
 if(on){
  const destination=context.summary?'الملخص':LABEL[context.page]||'الصفحة السابقة';
  el('opsUniversalReturnText').textContent='الرجوع إلى '+destination+' بنفس الموضع والترتيب';
  el('opsUniversalReturnFloat').textContent='رجوع إلى '+destination;
 }
}
function stageOrigin(){
 // Summary drawers may close before openOperationsFiltered is called.
 // Capture at the moment a summary amount is selected, while draft fields exist.
 if(returning)return false;
 const page=currentPage();
 pending={time:Date.now(),page,capture:snapshot()};
 return true;
}
function beforeNavigate(opts={}){
 if(returning)return false;
 const page=currentPage();
 const ev=window.event;
 if(opts.kind==='page'&&ev?.target?.closest?.('#navTabOperations,#appBottomNav'))return false;
 if(page==='operations' && ((typeof state==='object'?state.activeOpsSubTab:'registered')||'registered')==='registered')return false;
 if(context)return true;
 context=(pending && Date.now()-pending.time<5000&&pending.page===page)?pending.capture:snapshot();
 pending=null;sync();return true;
}
function onLeavePage(to){
 if(!returning&&context&&currentPage()==='operations'&&to!=='operations'){
  context=null;pending=null;sync();
 }
}
function returnToSource(){
 if(!context||returning)return false;
 const saved=context;context=null;pending=null;returning=true;
 document.body.classList.remove('ops-return-context');
 try{
  if(typeof state==='object')Object.entries(saved.stateCopy).forEach(([k,v])=>{state[k]=copy(v);});
  if(typeof switchAppPage==='function')switchAppPage(saved.page,false);
  if(saved.page==='operations'&&typeof switchOperationsSubTab==='function')
   switchOperationsSubTab(saved.stateCopy.activeOpsSubTab||'analytics');
  if(saved.page==='budgets'){
   if(saved.budgetTab&&typeof switchBudgetSubTab==='function')switchBudgetSubTab(saved.budgetTab);
   if(saved.budgetTab==='current'&&typeof switchBudgetMonthView==='function')switchBudgetMonthView(saved.budgetView);
   if(saved.budgetTab==='projects'&&typeof switchProjectView==='function')switchProjectView(saved.projectView);
  }
  if(saved.summary && typeof openSummaryDrawer==='function')
   openSummaryDrawer(null,saved.summaryState||window.summaryReturnState||null);
  saved.modals.forEach(id=>{if(el(id)&&!el(id).classList.contains('open')&&typeof openModal==='function')openModal(id);});
  const again=()=>{restoreFields(saved);restoreScroll(saved);};
  again();
  // Rebuild comparison once the original sort and period controls are restored.
  if(saved.page==='budgets' && saved.budgetTab==='current' &&
     saved.budgetView==='compare' && window.BudgetCompareEngine?.render){
    try{window.BudgetCompareEngine.render();}catch(e){console.warn('Budget restore:',e);}
    again();
  }
  requestAnimationFrame(()=>{again();requestAnimationFrame(again);});
  setTimeout(again,75);
  setTimeout(()=>{again();if(saved.focus?.isConnected){try{saved.focus.focus({preventScroll:true});}catch{}}restoreScroll(saved);},180);
  return true;
 }finally{returning=false;sync();}
}
function initialize(){
 installUI();
 document.addEventListener('click',e=>{
  if(returning || e.target.closest('#appBottomNav,#opsUniversalReturnBar,#opsUniversalReturnFloat'))return;
  if(!e.target.closest('button,a,[onclick],[role="button"],[data-budget-category]'))return;
  const page=currentPage();
  if(page==='operations'&&((typeof state==='object'?state.activeOpsSubTab:'registered')||'registered')==='registered')return;
  pending={time:Date.now(),page,capture:snapshot()};
 },true);
 sync();
}
window.OperationsReturnHub={stageOrigin,beforeNavigate,onLeavePage,returnToSource,sync,
 getState:()=>context?{page:context.page,summary:context.summary,scrollTop:context.bodyTop,fields:context.fields.length}:null};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
else initialize();
})();
