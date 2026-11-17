/* Stable deep-link to the unified budget comparisons workspace. */
(function () {
  'use strict';
  function openComparison(options) {
    const opts=options||{};
    if(typeof window.switchAppPage!=='function'||typeof window.switchBudgetSubTab!=='function'||
       !window.BudgetCompareEngine) return false;
    const page=document.getElementById('viewBudgets');
    const workspace=document.getElementById('cmpPeriodChart');
    if(!page||!workspace) return false;
    window.activeBudgetSubTab='comparisons';
    window.switchAppPage('budgets',false);
    window.switchBudgetSubTab('comparisons');
    if(!workspace.querySelector('.budget-spec')&&
       typeof window.BudgetCompareEngine.render==='function'){
      window.BudgetCompareEngine.render();
    }
    requestAnimationFrame(()=>{
      if(opts.scroll!==false && page.classList.contains('active')){
        workspace.scrollIntoView({block:'start',behavior:'instant'});
      }else if(opts.scroll===false){
        const area=document.getElementById('appScrollBody');
        if(area) area.scrollTop=0;
      }
    });
    return true;
  }
  window.openBudgetComparisonDashboard=openComparison;

  function wantsDirectLink(){
    const search=new URLSearchParams(location.search);
    return search.get('view')==='comparisons'||
      search.get('view')==='budget-comparisons'||
      search.get('comparison')==='1';
  }
  if(!wantsDirectLink()) return;
  let attempts=0;
  function navigate(){
    if(openComparison({scroll:false}))return;
    if(++attempts<80)setTimeout(navigate,100);
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>setTimeout(navigate,0),{once:true});
  }else setTimeout(navigate,0);
})();


/* One clear, mobile-first budget audit. Read-only: never edits saved transactions or budgets. */
(function familyComparisonAudit20261117(){
  'use strict';
  const ITEMS=[
    ['daily','مصروف يومي'],['food','طعام ومشتريات'],['bills','فواتير والتزامات'],
    ['house','مستلزمات منزل'],['education','تعليم ودروس'],['transport','مواصلات وبنزين'],
    ['health','صحة وعلاج'],['other','أخرى ومشتريات'],['clothes','ملابس وأحذية']
  ];
  const names=new Map(ITEMS);
  const settings={month:'',span:1};
  const money=n=>Number(n||0).toLocaleString('en-US',{maximumFractionDigits:2});
  const safe=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n=val=>{const a=Number(val);return Number.isFinite(a)?a:0;};
  const signed=val=>(val>0?'+':val<0?'−':'')+money(Math.abs(val));
  const monthShift=(m,d)=>{const p=String(m).split('-').map(Number);const z=new Date(p[0],p[1]-1+d,1);return z.getFullYear()+'-'+String(z.getMonth()+1).padStart(2,'0');};
  const monthLabel=m=>{const parts=m.split('-').map(Number);return new Date(parts[0],parts[1]-1,1).toLocaleDateString('ar-EG',{month:'long',year:'numeric'});};
  const dateTo=m=>{const p=m.split('-').map(Number);return new Date(p[0],p[1],0).getFullYear()+'-'+String(p[1]).padStart(2,'0')+'-'+String(new Date(p[0],p[1],0).getDate()).padStart(2,'0');};
  const currentMonth=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');};
  const st=()=>{try{if(typeof state!=='undefined'&&state)return state;}catch(_err){}return window.state||{};};
  const currency=()=>safe(st().currency||'EGP');
  function calculate(source,months){
    const list=ITEMS.map(([id,name])=>({id,name,estimated:0,actual:0,count:0,hasPlan:false}));
    const byId=new Map(list.map(r=>[r.id,r]));
    const period=new Set(months),s=source||{};
    const getRow=(id,title)=>{
      id=String(id||'other');
      if(!byId.has(id)){
        const r={id,name:String(title||names.get(id)||id),estimated:0,actual:0,count:0,hasPlan:false};
        byId.set(id,r);list.push(r);
      }
      return byId.get(id);
    };
    let planMonths=0,actualCount=0;
    const plans=Array.isArray(s.monthlyBudgets)?s.monthlyBudgets:[];
    for(const m of months){
      const monthPlans=plans.filter(b=>b&&b.month===m&&!b.project&&b.type!=='project');
      if(monthPlans.length)planMonths++;
      for(const plan of monthPlans){
        const items=Array.isArray(plan.items)&&plan.items.length
          ? plan.items
          : Object.entries(plan.categories||{}).map(([category,amount])=>({category,amount}));
        for(const item of items){
          if(!item)continue;
          const category=item.category||item.categoryId||'other';
          const row=getRow(category,item.title);
          row.estimated+=n(item.amount!==undefined?item.amount:item.estimated);
          row.hasPlan=true;
        }
      }
    }
    for(const t of (Array.isArray(s.transactions)?s.transactions:[])){
      if(!t||t.type!=='expense'||!period.has(String(t.date||'').slice(0,7)))continue;
      const row=getRow(t.category||'other');
      row.actual+=n(t.amount);
      row.count++;
      actualCount++;
    }
    for(const row of list){
      row.difference=row.actual-row.estimated;
      row.percent=row.estimated>0?100*row.difference/row.estimated:null;
      row.usage=row.estimated>0?100*row.actual/row.estimated:null;
    }
    const estimated=list.reduce((sum,row)=>sum+row.estimated,0);
    const actual=list.reduce((sum,row)=>sum+row.actual,0);
    return {rows:list,estimated,actual,difference:actual-estimated,
      percent:estimated>0?(actual-estimated)*100/estimated:null,
      planMonths,actualCount,months:months.slice()};
  }
  function relative(num){return num==null?'غير متاح':(num>0?'+':num<0?'−':'')+money(Math.abs(num))+'%';}
  function tone(row){return row.estimated<=0?(row.actual>0?'unplanned':'neutral'):(row.difference>0?'over':row.difference<0?'under':'neutral');}
  function status(row){return row.estimated<=0?(row.actual>0?'بدون موازنة':'لا يوجد تقدير'):row.difference>0?'تجاوز':row.difference<0?'أقل من المقدر':'مطابق للمقدر';}
  function barHeight(value,max){return Math.max(2,Math.min(100,Math.abs(value)/Math.max(1,max)*100));}
  function render(){
    const panel=document.getElementById('cmpPeriodChart');
    if(!panel)return false;
    if(!settings.month)settings.month=currentMonth();
    const months=Array.from({length:settings.span},(_,i)=>monthShift(settings.month,i-settings.span+1));
    const report=calculate(st(),months);
    let root=document.getElementById('cmpAuditApp');
    if(!root){root=document.createElement('section');root.id='cmpAuditApp';root.className='cmp-audit-app';root.dir='rtl';panel.appendChild(root);}
    const c=currency(),current=settings.month===currentMonth();
    const note=report.planMonths===0?'مفيش موازنة تقديرية محفوظة للفترة دي. الفعلي ظاهر، لكن مفيش أساس صحيح لحساب نسبة الفرق.':
      report.planMonths<months.length?'مفيش موازنة محفوظة لكل الشهور المختارة؛ الفرق محسوب مقابل الموازنات الموجودة بس.':
      current?'المقدر للشهر بالكامل، والفعلي حسب العمليات المسجلة لحد دلوقتي.':'البيانات من الموازنات والعمليات المسجلة للفترة المحددة.';
    const headline=report.estimated<=0?'بدون تقدير':report.difference>0?'زيادة عن المقدر':report.difference<0?'أقل من المقدر':'مطابق للمقدر';
    const summary=[
      ['الموازنة المقدرة',money(report.estimated), 'neutral'],
      ['المصروف الفعلي',money(report.actual),'blue'],
      ['الفرق (فعلي − مقدر)',signed(report.difference), report.estimated<=0?'neutral':report.difference>0?'over':report.difference<0?'under':'neutral'],
      ['نسبة الفرق',relative(report.percent),report.estimated<=0?'neutral':report.difference>0?'over':report.difference<0?'under':'neutral']
    ];
    const biggest=Math.max(1,...report.rows.flatMap(r=>[r.estimated,r.actual]));
    root.innerHTML='<header class="cmp-audit-head"><div><h2>الرقابة على الميزانية</h2><p>مقارنة واضحة بين الميزانية التقديرية والمصروف الفعلي.</p></div></header>'+
      '<div class="cmp-audit-filter"><label for="cmpAuditMonth">الشهر</label><input id="cmpAuditMonth" type="month" value="'+safe(settings.month)+'" aria-label="الشهر المستهدف">'+
      '<label for="cmpAuditSpan">الفترة</label><select id="cmpAuditSpan" aria-label="عدد الشهور">'+
      [1,3,6,12].map(x=>'<option value="'+x+'"'+(x===settings.span?' selected':'')+'>'+x+(x===1?' شهر':' شهور')+'</option>').join('')+'</select></div>'+
      '<p class="cmp-audit-period">'+safe(monthLabel(months[0]))+(months.length>1?' — '+safe(monthLabel(months[months.length-1])):'')+'</p>'+
      '<div class="cmp-audit-summary">'+summary.map(e=>'<div class="cmp-audit-kpi" data-tone="'+e[2]+'"><span>'+e[0]+'</span><strong dir="ltr">'+safe(e[1])+'</strong><small>'+((e[0]==='نسبة الفرق')?'':c)+'</small></div>').join('')+'</div>'+
      '<div class="cmp-audit-verdict" data-tone="'+(report.estimated<=0?'neutral':report.difference>0?'over':report.difference<0?'under':'neutral')+'"><strong>'+headline+'</strong><span>'+safe(note)+'</span></div>'+
      '<div class="cmp-audit-section-head"><div><h3>الفروق حسب بنود المصروفات</h3><p>الفرق الموجب زيادة في الصرف، والسالب توفير. كل البنود ظاهرة حتى لو قيمتها صفر.</p></div><small>'+report.actualCount+' عملية صرف</small></div>'+
      '<div class="cmp-audit-rows">'+report.rows.map((r,i)=>{
        const state=tone(r),max=Math.max(1,r.estimated,r.actual);
        return '<article class="cmp-audit-row" data-tone="'+state+'">'+
          '<div class="cmp-audit-row-title"><strong>'+(i+1)+'. '+safe(r.name)+'</strong><span>'+status(r)+'</span></div>'+
          '<div class="cmp-audit-row-body"><div class="cmp-audit-values">'+
          '<div><small>المقدر</small><b dir="ltr">'+money(r.estimated)+'</b></div>'+
          '<div><small>الفعلي</small><b dir="ltr">'+money(r.actual)+'</b></div>'+
          '<div class="cmp-audit-variance"><small>الفرق</small><b dir="ltr">'+signed(r.difference)+'</b><em dir="ltr">'+relative(r.percent)+'</em></div>'+
          '</div><div class="cmp-audit-pair" role="img" aria-label="عمود رمادي للتقديري وعمود أزرق للفعلي">'+
          '<div><i style="height:'+barHeight(r.estimated,max)+'%"></i><small>مقدر</small></div>'+
          '<div><i style="height:'+barHeight(r.actual,max)+'%"></i><small>فعلي</small></div></div></div>'+
          '<div class="cmp-audit-row-foot"><span>'+r.count+' عملية · '+c+'</span>'+
          (r.count?'<button type="button" data-audit-category="'+safe(r.id)+'">عرض العمليات</button>':'')+
          '</div></article>';
      }).join('')+'</div>'+
      '<details class="cmp-audit-help"><summary>طريقة حساب الفرق والنِّسب</summary>'+
      '<p>الفرق = المصروف الفعلي − الميزانية التقديرية. نسبة الفرق = (الفرق ÷ الميزانية التقديرية) × 100. لو المقدر صفر، النسبة بتظهر «غير متاح» بدل نسبة مضللة. الأزرق للفعلي، والرمادي للمقدر، والأحمر للتجاوز، والأخضر لأقل من المقدر.</p></details>';
    return true;
  }
  function hideOldTab(){
    const labels=['المقارنات الجديدة','مقارنات جديدة'];
    document.querySelectorAll('button,a,[role="tab"]').forEach(el=>{
      const label=(el.textContent||'').replace(/\s+/g,' ').trim();
      if(labels.some(x=>label.includes(x))){el.hidden=true;el.style.setProperty('display','none','important');el.setAttribute('aria-hidden','true');}
    });
    const legacy=document.getElementById('panelBudgetComparisons');
    if(legacy){legacy.hidden=true;legacy.style.setProperty('display','none','important');}
  }
  function sync(){
    hideOldTab();
    const panel=document.getElementById('cmpPeriodChart');
    if(panel&&!document.getElementById('cmpAuditApp'))render();
  }
  let pending=false;
  function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;sync();});}
  document.addEventListener('change',event=>{
    if(event.target.id==='cmpAuditMonth'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(event.target.value)){
      settings.month=event.target.value;render();
    }else if(event.target.id==='cmpAuditSpan'){
      settings.span=[1,3,6,12].includes(Number(event.target.value))?Number(event.target.value):1;render();
    }
  });
  document.addEventListener('click',event=>{
    const btn=event.target.closest?.('[data-audit-category]');
    if(!btn)return;
    const id=btn.getAttribute('data-audit-category');
    if(typeof window.openOperationsFiltered!=='function')return;
    const start=monthShift(settings.month,1-settings.span)+'-01',end=dateTo(settings.month);
    window.OperationsReturnHub?.stageOrigin?.();
    window.openOperationsFiltered({category:id,type:'expense',dateFrom:start,dateTo:end,
      resetFilters:true,returnTitle:'الرقابة على الميزانية'});
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
  window.addEventListener('focus',()=>render());
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
  else schedule();
  if(document.documentElement) new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.FamilyComparisonAudit={render,calculate,version:'2026-11-17-mobile-1'};
})();
