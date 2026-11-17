/* End-to-end regression for navigation, alerts and tasks, in disposable browser profiles.
 * Never points to a user's browser or modifies a real finance database.
 */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const URL=process.env.APP_URL || 'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  for(const width of [360,1365]){
   const ctx=await browser.newContext({viewport:{width,height:850},locale:'ar-EG',serviceWorkers:'block'});
   const page=await ctx.newPage();
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const resp=await page.goto(URL+'?qa_e2e=1',{waitUntil:'domcontentloaded',timeout:60000});
   assert.ok(resp?.ok(),'Application HTTP status');
   await page.waitForFunction(()=>typeof renderUI==='function' &&
     typeof switchAppPage==='function' && typeof familyAlerts==='object' &&
     typeof openTasksFullScreenModal==='function' &&
     typeof getTodoTasks==='function',null,{timeout:30000});

   // Navigate via genuine navigation buttons, not simply by invoking renderers.
   const navs=['navTabExpenses','navTabOperations','navTabRequests','navTabExpected','navTabBudgets'];
   for(const id of navs){
     const node=page.locator('#'+id);
     assert.equal(await node.count(),1,'Missing navigation button '+id);
     await node.click({timeout:10000});
     await page.waitForTimeout(75);
   }
   console.log('NAVIGATION_OK '+width+' '+navs.join(','));

   const alerts=await page.evaluate(()=>{
     const keys=['family_alerts_store_v2','family_alerts_read_v2'];
     keys.forEach(k=>localStorage.removeItem(k));
     state.transactions=[]; state.expectedExpenses=[];
     familyAlerts.observe([],null,true);
     const tx={id:'qa-e2e-notify',date:'2026-11-17',time:'15:34',
       author:'اية',member:'اية',type:'expense',category:'daily',
       amount:100,label:'مصروف يومى',walletId:state.wallets?.[0]?.id||'cash',
       createdAt:'2026-11-17T12:34:00.000Z'};
     state.transactions=[tx];
     familyAlerts.observe(state.transactions,'اية');
     const load=()=>JSON.parse(localStorage.getItem('family_alerts_store_v2')||'[]');
     const added=load().find(a=>a.txId===tx.id && a.kind==='expense');
     tx.amount=150;
     familyAlerts.observe(state.transactions,'اية');
     const edited=load().find(a=>a.txId===tx.id && a.kind==='edit');
     state.transactions=[];
     familyAlerts.observe(state.transactions,'اية');
     const deleted=load().find(a=>a.txId===tx.id && a.kind==='delete');
     familyAlerts.created('request',{id:'qa-request',member:'اية',amount:550,reason:'احتياج'});
     familyAlerts.created('budget',{id:'qa-budget',month:'2026-11'});
     familyAlerts.created('task',{id:'qa-task',title:'تجربة التنبيهات',assignedMember:'ماهر'});
     const before=load();
     familyAlerts.mark(added?.id);
     const read=JSON.parse(localStorage.getItem('family_alerts_read_v2')||'[]').includes(added?.id);
     familyAlerts.toggleRead(added?.id);
     const unread=!JSON.parse(localStorage.getItem('family_alerts_read_v2')||'[]').includes(added?.id);
     familyAlerts.open();
     const rendered=document.querySelectorAll('#notificationsListContainer .family-alert').length;
     if(typeof closeModal==='function')closeModal('notificationsModal');
     localStorage.setItem('__qa_keep','preserved');
     return {
       added:!!added,edited:!!edited,deleted:!!deleted,read,unread,
       body:added?.body||'',modifiedBody:edited?.body||'',
       kinds:[...new Set(before.map(a=>a.kind))],
       alerts:before.length,rendered
     };
   });
   console.log('ALERT_QA '+width+' '+JSON.stringify(alerts));
   for(const k of ['added','edited','deleted','read','unread'])assert.equal(alerts[k],true,'Alert regression '+k);
   assert.ok(alerts.body.includes('١٠٠')&&alerts.body.includes('٣:٣٤'),
     'Alert amount or timestamp missing: '+alerts.body);
   assert.ok(alerts.modifiedBody.includes('١٥٠'),'Edited amount not reflected');
   for(const k of ['expense','edit','delete','request','budget','task']) assert.ok(alerts.kinds.includes(k),'Missing kind '+k);
   assert.ok(alerts.alerts>=6 && alerts.rendered>=6,'Alert list did not render every event');

   await page.evaluate(()=>{
     openTasksFullScreenModal();
     if(typeof switchTasksViewMode==='function')switchTasksViewMode('list');
   });
   // The creator is intentionally collapsed until the user presses Add Task.
   await page.locator('#btnHeroAddTaskBar').click({timeout:10000});
   await page.locator('#tasksUnifiedCreatorCard').waitFor({state:'visible',timeout:10000});
   const taskDiag=await page.evaluate(()=>{
     const title=document.getElementById('quickTaskTitleInput');
     const parents=[];let el=title;
     for(let i=0;i<8&&el;i++,el=el.parentElement){
       const cs=getComputedStyle(el),rect=el.getBoundingClientRect();
       parents.push({id:el.id,cls:String(el.className).slice(0,80),
         display:cs.display,visibility:cs.visibility,hidden:el.hidden,
         width:Math.round(rect.width),height:Math.round(rect.height)});
     }
     return {parents,activeModal:document.querySelector('.modal.active')?.id||'',
       taskModal:document.getElementById('tasksFullScreenModal')?.className||''};
   });
   console.log('TASK_VISIBILITY_DIAGNOSTIC '+width+' '+JSON.stringify(taskDiag));
   const title=page.locator('#quickTaskTitleInput');
   assert.equal(await title.count(),1,'Quick task creator missing');
   await title.fill('تجربة QA شاملة '+width);
   // Dates and times are selected through the visible preset chips.
   // The underlying date/time inputs are intentionally hidden.
   const datePreset=page.locator('#inlineDatePresetGroup [data-preset="tomorrow"]');
   if(await datePreset.count()) await datePreset.click();
   const timePreset=page.locator('#inlineTimePresetGroup [data-time="17:00"]');
   if(await timePreset.count()) await timePreset.click();
   const member=page.locator('#inlineTaskMemberGroup [data-member="ماهر"]');
   if(await member.count())await member.click();
   const submit=page.locator('#btnSubmitUnifiedTask');
   assert.equal(await submit.count(),1,'Unified task submit button missing');
   await submit.click();
   await page.waitForFunction(name=>getTodoTasks().some(t=>t.title===name),
      'تجربة QA شاملة '+width,{timeout:15000});
   const taskBefore=await page.evaluate(name=>({
     found:getTodoTasks().some(t=>t.title===name),
     stored:localStorage.getItem('family_monefy_tasks')?.includes(name)||false
   }),'تجربة QA شاملة '+width);
   assert.ok(taskBefore.found && taskBefore.stored,'Task not saved through actual UI');
   await page.reload({waitUntil:'domcontentloaded',timeout:60000});
   await page.waitForFunction(()=>typeof getTodoTasks==='function',null,{timeout:20000});
   const persisted=await page.evaluate(name=>({
     task:getTodoTasks().some(t=>t.title===name),
     sentinel:localStorage.getItem('__qa_keep'),
     alerts:JSON.parse(localStorage.getItem('family_alerts_store_v2')||'[]').length,
     width:document.documentElement.scrollWidth,
     viewport:innerWidth
   }),'تجربة QA شاملة '+width);
   console.log('TASK_AND_PERSIST '+width+' '+JSON.stringify({taskBefore,persisted}));
   assert.equal(persisted.task,true,'Task lost on reload');
   assert.equal(persisted.sentinel,'preserved','Other local storage was corrupted');
   assert.ok(persisted.alerts>=6,'Alerts lost on reload');
   assert.ok(persisted.width<=persisted.viewport+4,'Horizontal page overflow after reload');
   // Deleting every task must remain an empty list; demo tasks must not respawn.
   const emptyCount=await page.evaluate(()=>{
     const previous=localStorage.getItem('family_monefy_tasks');
     localStorage.setItem('family_monefy_tasks','[]');
     const result=getTodoTasks().length;
     if(previous===null)localStorage.removeItem('family_monefy_tasks');
     else localStorage.setItem('family_monefy_tasks',previous);
     return result;
   });
   assert.equal(emptyCount,0,'Deleted tasks were silently re-seeded');
   assert.deepEqual(errors,[],'Uncaught JS exceptions '+JSON.stringify(errors));
   await ctx.close();
  }
  console.log('PASS end-to-end nav/alerts create-edit-delete/read/task creation/persistence/mobile-desktop');
 }finally{await browser.close();}
})().catch(e=>{console.error('END_TO_END_QA_FAILED',e.stack||e);process.exitCode=1});
