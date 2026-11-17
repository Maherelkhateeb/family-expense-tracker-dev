(function testFamilyComparison(){
  "use strict";
  const assert=require("node:assert/strict");
  const fs=require("node:fs");
  const vm=require("node:vm");
  const code=fs.readFileSync(require("node:path").join(__dirname,"..","family-budget-comparison.js"),"utf8");
  const callbacks={};
  const fakeDoc={getElementById:()=>null,createElement:()=>({}),head:{appendChild(){}},addEventListener:(type,fn)=>{callbacks[type]=fn;}};
  const opened=[],fakeWin={state:{currency:"EGP",transactions:[],monthlyBudgets:[]},openOperationsFiltered:opts=>opened.push(opts)};
  const context={window:fakeWin,document:fakeDoc,Date,Intl,Map,Set,Math,Number,String,Object,Array,RegExp};
  vm.runInNewContext(code,context,{timeout:2000,filename:"family-budget-comparison.js"});
  const api=fakeWin.FamilyBudgetComparison;
  assert.ok(api,"Comparison module should register on window");
  assert.ok(api.selfTest().passed,"All reference arithmetic checks should pass");
  const period={months:["2026-11"],categories:[{id:"food",name:"طعام"},{id:"health",name:"صحة"}],
    perMonth:{"2026-11":{food:{est:100,act:130},health:{est:0,act:40}}}};
  const data=api.compute(period,5);
  assert.equal(data.totalEstimated,100);
  assert.equal(data.totalActual,170);
  assert.equal(data.variance,70);
  assert.equal(data.rows.find(x=>x.id==="health").status,"غير مخطط");
  assert.equal(data.rows.find(x=>x.id==="food").status,"تجاوز");
  const root={innerHTML:"",contains:()=>true,isConnected:true};
  api.render(root,fakeWin.state);
  assert.match(root.innerHTML,/جدول الفروقات/);
  assert.match(root.innerHTML,/شلال الفروقات/);
  assert.match(root.innerHTML,/أعمدة الانحراف/);
  assert.match(root.innerHTML,/sectionComparisons/);
  assert.ok(root.innerHTML.includes("ملابس وأحذية"),"All zero-value categories must remain visible");
  if(!root.innerHTML.includes('8. مخطط الميل')) {
    callbacks.click({target:{closest:selector=>selector==="[data-fbc=toggle]"?{}:null}});
  }
  for(let i=1;i<=8;i++)assert.ok(root.innerHTML.includes(i+". "),"Chart "+i+" should render");
  callbacks.change({target:{dataset:{fbc:"sample"},checked:true}});
  for(const number of ["6,100","6,700","+600","+3,700"])assert.ok(root.innerHTML.includes(number),"Sample acceptance number "+number);
  callbacks.click({target:{closest:selector=>selector==="[data-fbc-open]"?{dataset:{fbcOpen:"food"}}:null}});
  assert.equal(opened.length,1);
  assert.equal(opened[0].category,"food");
  assert.equal(opened[0].type,"expense");
  assert.equal(opened[0].returnTitle,"مقارنات الميزانية");
  assert.match(code,/@media\(max-width:700px\)/,"Mobile table must turn into cards");
  assert.ok(!code.includes("linear-gradient"),"Charts should not use gradients");
  console.log("Family budget comparison smoke tests passed (accounting, 8 charts, sample data, mobile styles, drilldown).");
})();
