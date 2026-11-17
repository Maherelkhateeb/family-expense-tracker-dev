(function comparisonModule(){
  "use strict";
  const COLORS={estimated:"#888780",actual:"#378ADD",over:"#E24B4A",save:"#639922"};
  const REFS={food:"#2a78d6",education:"#eb6834",transport:"#1baf7a",entertainment:"#eda100",bills:"#e87ba4",health:"#008300"};
  const DEFAULT_CATS=[
    {id:"daily",name:"مصروف يومي"},{id:"food",name:"طعام ومشتريات"},{id:"bills",name:"فواتير والتزامات"},
    {id:"house",name:"مستلزمات منزل"},{id:"education",name:"تعليم ودروس"},{id:"transport",name:"مواصلات وبنزين"},
    {id:"health",name:"صحة وعلاج"},{id:"other",name:"أخرى ومشتريات"},{id:"clothes",name:"ملابس وأحذية"}];
  const HEAT_REF={food:[5,12,18,20,25,20],education:[-3,-3,0,-3,-5,-3],transport:[-8,-10,-5,2,-12,-13],
    entertainment:[-15,-25,-10,5,-20,-29],bills:[0,4,25,30,10,25],health:[10,-20,35,15,5,80]};
  const SAMPLE_CATS=[
    {id:"food",name:"طعام",est:2000,act:2400},{id:"education",name:"تعليم",est:1500,act:1450},
    {id:"transport",name:"مواصلات",est:800,act:700},{id:"entertainment",name:"ترفيه",est:700,act:500},
    {id:"bills",name:"فواتير",est:600,act:750},{id:"health",name:"صحة",est:500,act:900}];
  const SAMPLE_TOTALS=[5900,6300,6900,7200,7300,6700];
  const SAMPLE_CUM_E=[6100,12200,18300,24400,30500,36600],SAMPLE_CUM_A=[5900,12200,19100,26300,33600,40300];
  const ui={span:6,end:"",tolerance:5,sample:false,advanced:true};
  let appState=null, target=null, mounted=false;

  function esc(v){return String(v===undefined||v===null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function num(v){const n=Number(v);return Number.isFinite(n)?n:0;}
  function n0(v){return Math.round(num(v)).toLocaleString("en-US",{maximumFractionDigits:0});}
  function n1(v){return num(v).toLocaleString("en-US",{minimumFractionDigits:1,maximumFractionDigits:1});}
  function sign(v,dec=0){return (v>0?"+":v<0?"−":"")+ (dec===1?n1(Math.abs(v)):n0(Math.abs(v)));}
  function bidi(v){return '<bdi dir="ltr">'+esc(v)+'</bdi>';}
  function pct(v,dec=0){return v===null?"—":sign(v,dec)+"%";}
  function monthShift(m,delta){let [y,mm]=String(m).split("-").map(Number);const d=new Date(Date.UTC(y,mm-1+delta,1));return d.toISOString().slice(0,7);}
  function monthsFor(end,span){return Array.from({length:span},(_,i)=>monthShift(end,i-span+1));}
  function validMonth(m){return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(m));}
  function labelMonth(m){const d=new Date(m+"-01T00:00:00Z");return d.toLocaleDateString("ar-EG",{month:"short",year:"numeric",timeZone:"UTC"}).replace(/[٠-٩]/g,ch=>String("٠١٢٣٤٥٦٧٨٩".indexOf(ch)));}
  function currency(){return (appState&&appState.currency)||"EGP";}
  function val(v){return bidi(n0(v))+' <small>'+esc(currency())+'</small>';}
  function typeName(t){return ({fixed:"ثابت",variable:"متغير",emergency:"طارئ"})[t]||"غير محدد";}
  function causeName(t){return ({price:"فرق سعر",quantity:"فرق كمية",unplanned:"بند غير مخطط",timing:"اختلاف توقيت الدفع"})[t]||"غير محدد";}
  function barColor(v){return v>0?COLORS.over:v<0?COLORS.save:COLORS.estimated;}
  function css(){
    if(document.getElementById("familyComparisonStyles"))return;
    const style=document.createElement("style");style.id="familyComparisonStyles";
    style.textContent=`
#panelBudgetComparisons{padding:10px!important;background:transparent!important;border:0!important;box-shadow:none!important;max-width:100%;min-width:0;overflow-x:clip}
.fbc{--fbc-edge:rgba(127,137,153,.32);--fbc-bg:rgba(127,137,153,.055);--fbc-muted:var(--text-muted,#8492a5);direction:rtl;color:inherit;font-size:12px;line-height:1.5;width:100%;min-width:0;max-width:100%;overflow-wrap:anywhere;box-sizing:border-box}
.fbc *{box-sizing:border-box}.fbc h2,.fbc h3,.fbc h4{font-weight:800;color:inherit;margin:0 0 6px}.fbc h2{font-size:17px}.fbc h3{font-size:14px}.fbc p{margin:4px 0 10px}.fbc small{font-size:12px}.fbc-intro{margin-bottom:10px}.fbc-muted{color:var(--fbc-muted)}
.fbc-controls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:10px;border:1px solid var(--fbc-edge);border-radius:12px;background:var(--fbc-bg);margin-bottom:10px}
.fbc-controls label{display:flex;flex-direction:column;gap:3px;min-width:0;font-weight:700}.fbc-controls input,.fbc-controls select{min-width:0;width:100%;font-family:inherit;min-height:34px;padding:5px;border-radius:8px;border:1px solid var(--fbc-edge);color:inherit;background:var(--fbc-bg);font-size:13px}
.fbc-controls input[type="checkbox"]{width:auto;min-height:auto}.fbc-controls .fbc-switch{display:flex;align-items:center;flex-direction:row;gap:7px}
.fbc-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin:10px 0}.fbc-kpi,.fbc-card{background:var(--fbc-bg);border:1px solid var(--fbc-edge);border-radius:11px;padding:10px;min-width:0}
.fbc-kpi strong{display:block;font-size:17px;white-space:nowrap;direction:ltr;text-align:right;font-variant-numeric:tabular-nums}
.fbc-kpi span{display:block;color:var(--fbc-muted);font-weight:700;margin-bottom:2px}
.fbc-card{margin-bottom:10px}.fbc-card>p{color:var(--fbc-muted)}
.fbc button{font:inherit;font-size:12px;font-weight:800;border:1px solid var(--fbc-edge);background:var(--fbc-bg);color:inherit;border-radius:8px;padding:8px 10px;cursor:pointer}
.fbc button:focus-visible,.fbc input:focus-visible,.fbc select:focus-visible{outline:2px solid ${COLORS.actual};outline-offset:2px}
.fbc-table{width:100%;border-collapse:collapse;direction:rtl;min-width:860px}.fbc-table th,.fbc-table td{border-bottom:1px solid var(--fbc-edge);padding:7px 5px;text-align:right;font-size:12px;vertical-align:middle}.fbc-table th{font-weight:800}
.fbc-table-box{max-width:100%;overflow-x:auto}.fbc-table tfoot{font-weight:800}.fbc-table td button{background:none;text-decoration:underline;border:0;padding:0;text-align:right}
.fbc-mobile-items{display:none}.fbc-mobile-item{border:1px solid var(--fbc-edge);border-radius:10px;padding:8px;margin:6px 0;background:var(--fbc-bg)}
.fbc-mobile-title{display:flex;align-items:center;justify-content:space-between;gap:8px;font-weight:800;font-size:13px}.fbc-mobile-stat{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;margin-top:7px}
.fbc-mobile-stat>span{font-size:11px;min-width:0}.fbc-mobile-stat b{font-size:12px;display:block;direction:ltr;text-align:right;font-variant-numeric:tabular-nums}
.fbc details{margin:5px 0}.fbc summary{cursor:pointer;font-weight:800}.fbc details[open]>summary{margin-bottom:6px}
.fbc-legend{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin:6px 0 8px;font-size:12px}
.fbc-legend span:before{content:"";display:inline-block;width:11px;height:11px;background:var(--swatch);margin-left:5px;border-radius:2px}
.fbc-pairs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}
.fbc-pair{background:var(--fbc-bg);border:1px solid var(--fbc-edge);padding:7px;border-radius:8px;min-width:0}
.fbc-pair strong{display:block;font-size:12px;min-height:29px}.fbc-pair .fbc-pair-diff{font-weight:800;direction:ltr;text-align:center;font-variant-numeric:tabular-nums}
.fbc-two-cols{display:flex;align-items:end;justify-content:center;height:105px;gap:9px;border-bottom:1px solid var(--fbc-edge);margin:5px 0}
.fbc-two-cols span{width:min(24px,22%);min-height:1px;max-height:100%;display:block;border-radius:2px 2px 0 0}
.fbc-pair-values{display:flex;justify-content:space-between;gap:4px;font-variant-numeric:tabular-nums}
.fbc-svg{display:block;width:100%;height:auto;max-width:100%;overflow:visible;color:inherit}
.fbc-rowbar{display:grid;grid-template-columns:94px minmax(0,1fr);gap:5px;align-items:center;margin:9px 0}
.fbc-rowbar-label{font-weight:700;overflow-wrap:anywhere}.fbc-rowbar-visual{min-width:0}.fbc-bars-center{display:grid;grid-template-columns:1fr 1fr;direction:ltr;height:16px;position:relative;border-left:1px solid var(--fbc-edge);border-right:1px solid var(--fbc-edge);background:var(--fbc-bg)}
.fbc-bars-center:after{position:absolute;content:"";width:1px;background:currentColor;opacity:.6;top:0;bottom:0;left:50%}
.fbc-bar-left{display:flex;justify-content:flex-end}.fbc-bar-right{display:flex;justify-content:flex-start}
.fbc-bars-center i{display:block;height:100%;max-width:100%;font-style:normal}.fbc-rowbar-value{display:block;direction:ltr;text-align:left;font-weight:700;font-variant-numeric:tabular-nums}
.fbc-bullet{height:17px;position:relative;border:1px solid var(--fbc-edge);background:rgba(226,75,74,.12);border-radius:2px}
.fbc-bullet:before{content:"";position:absolute;left:0;top:0;bottom:0;width:var(--target);background:rgba(136,135,128,.14)}.fbc-bullet .fbc-bullet-fill{position:absolute;left:0;top:4px;bottom:4px;background:${COLORS.actual}}
.fbc-bullet .fbc-bullet-target{position:absolute;left:var(--target);top:-2px;bottom:-2px;width:2px;background:currentColor}
.fbc-heatmap-desktop{overflow-x:auto;max-width:100%}.fbc-heatmap-desktop table{width:100%;border-collapse:separate;border-spacing:3px;min-width:0}
.fbc-heatmap-desktop td,.fbc-heatmap-desktop th{text-align:center;padding:4px 2px;font-size:12px}.fbc-heatmap-desktop th:first-child{text-align:right;max-width:90px;overflow-wrap:anywhere}
.fbc-heat-cell{border-radius:3px;font-variant-numeric:tabular-nums;font-weight:800;min-width:29px}
.fbc-heatmap-mobile{display:none}.fbc-heat-month{padding:8px;border:1px solid var(--fbc-edge);border-radius:8px;margin-bottom:7px}
.fbc-heat-month>strong{display:block;margin-bottom:6px}.fbc-heat-tiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}.fbc-heat-tiles div{padding:4px;border-radius:5px;display:flex;justify-content:space-between;gap:2px}
.fbc-stack{display:flex;width:100%;height:28px;border-radius:3px;overflow:hidden;direction:ltr;border:1px solid var(--fbc-edge);margin:3px 0 11px}.fbc-stack span{height:100%;display:flex;align-items:center;justify-content:center;font-size:12px;color:white;font-weight:800;min-width:0}
.fbc-stack-key{display:flex;flex-wrap:wrap;gap:6px}.fbc-stack-key span:before{content:"";display:inline-block;width:9px;height:9px;margin-left:4px;background:var(--swatch)}
.fbc-raw table{width:100%;border-collapse:collapse}.fbc-raw th,.fbc-raw td{border-bottom:1px solid var(--fbc-edge);text-align:right;padding:4px;font-size:12px}.fbc-raw{max-width:100%;overflow-wrap:anywhere}
.fbc-chart-grid{display:grid;grid-template-columns:1fr;gap:0}.fbc-sep{border-top:1px dashed var(--fbc-edge);margin:10px 0}.fbc-error{border:1px solid ${COLORS.over};padding:8px;border-radius:7px}
.fbc svg text{fill:currentColor;font-family:inherit;font-size:12px}.fbc svg line.fbc-grid{stroke:currentColor;stroke-width:.5;stroke-dasharray:3 4;opacity:.23}
.fbc .fbc-data-note{font-size:12px;color:var(--fbc-muted)}
@media(min-width:700px){.fbc-controls{grid-template-columns:repeat(4,minmax(0,1fr))}.fbc-kpis{grid-template-columns:repeat(5,minmax(0,1fr))}.fbc-pairs{grid-template-columns:repeat(3,minmax(0,1fr))}.fbc-chart-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.fbc-chart-grid>.fbc-card{min-width:0}}
@media(max-width:700px){.fbc-table-box{display:none}.fbc-mobile-items{display:block}.fbc-heatmap-desktop{display:block}.fbc-heatmap-mobile{display:none}.fbc-heatmap-desktop td,.fbc-heatmap-desktop th{padding:3px 1px}.fbc-heatmap-desktop th:first-child{width:75px;max-width:75px}}
@media(max-width:379px){.fbc-pairs{grid-template-columns:1fr 1fr}.fbc-rowbar{grid-template-columns:77px minmax(0,1fr)}.fbc-heat-tiles{grid-template-columns:1fr}}
`;
    document.head.appendChild(style);
  }
  function sampleData(){
    const months=monthsFor("2026-06",6),perMonth={};
    months.forEach((m,i)=>{
      const target=SAMPLE_TOTALS[i],buckets={};
      const weights=SAMPLE_CATS.map(c=>Math.max(1,c.est*(1+HEAT_REF[c.id][i]/100))),ws=weights.reduce((a,b)=>a+b,0);
      let tally=0;
      SAMPLE_CATS.forEach((c,j)=>{
        let a=i===5?c.act:j===SAMPLE_CATS.length-1?target-tally:Math.round(target*weights[j]/ws);
        tally+=a;
        buckets[c.id]={est:c.est,act:a,kind:"variable",cause:undefined};
      });
      perMonth[m]=buckets;
    });
    return {months,perMonth,categories:SAMPLE_CATS.map(c=>({id:c.id,name:c.name})),referenceHeatmap:HEAT_REF};
  }
  function actualData(months){
    const st=appState||{}, cats=DEFAULT_CATS.map(c=>({...c}));
    const known=new Map(cats.map(c=>[c.id,c.name]));
    if(Array.isArray(window.EXPENSE_CATEGORIES))window.EXPENSE_CATEGORIES.forEach(c=>{if(c&&c.id){known.set(String(c.id),String(c.name||c.id));}});
    const perMonth={};months.forEach(m=>perMonth[m]={});
    const hit=(m,id)=>{if(!perMonth[m]||!id)return null;if(!perMonth[m][id])perMonth[m][id]={est:0,act:0,kind:undefined,cause:undefined};return perMonth[m][id];};
    for(const plan of (Array.isArray(st.monthlyBudgets)?st.monthlyBudgets:[])){
      if(!plan||plan.project||!perMonth[plan.month])continue;
      const items=Array.isArray(plan.items)&&plan.items.length?plan.items:Object.entries(plan.categories||{}).map(([category,amount])=>({category,amount}));
      for(const item of items){
        if(!item)continue;
        const id=String(item.category||item.categoryId||item.id||"other");
        const cell=hit(plan.month,id);if(!cell)continue;
        cell.est+=num(item.amount===undefined?item.estimated:item.amount);
        cell.kind=item.item_type||item.itemType||(item.isFixed===true?"fixed":cell.kind);
        cell.cause=item.cause||item.varianceCause||cell.cause;
        if(!known.has(id))known.set(id,String(item.title||id));
      }
    }
    for(const tx of (Array.isArray(st.transactions)?st.transactions:[])){
      if(!tx||tx.type!=="expense")continue;
      const m=String(tx.date||"").slice(0,7),id=String(tx.category||"other");
      const cell=hit(m,id);if(cell)cell.act+=num(tx.amount);
      if(!known.has(id))known.set(id,id);
    }
    return {months,perMonth,categories:Array.from(known,([id,name])=>({id,name})),referenceHeatmap:null};
  }
  function compute(data,tolerance){
    const rows=data.categories.map(cat=>{
      const monthly=data.months.map(m=>{const c=(data.perMonth[m]||{})[cat.id]||{};return {month:m,est:num(c.est),act:num(c.act)};});
      const estimated=monthly.reduce((s,x)=>s+x.est,0),actual=monthly.reduce((s,x)=>s+x.act,0);
      const variance=actual-estimated,percentage=estimated===0?null:variance/estimated*100;
      const cell=data.months.map(m=>(data.perMonth[m]||{})[cat.id]||{}).find(x=>x.kind||x.cause)||{};
      return {...cat,monthly,estimated,actual,variance,percentage,kind:cell.kind,cause:cell.cause};
    }).sort((a,b)=>b.estimated-a.estimated||a.name.localeCompare(b.name,"ar"));
    const totalEstimated=rows.reduce((s,r)=>s+r.estimated,0),totalActual=rows.reduce((s,r)=>s+r.actual,0);
    const totals=data.months.map((m,i)=>{
      const estimated=rows.reduce((s,r)=>s+r.monthly[i].est,0),actual=rows.reduce((s,r)=>s+r.monthly[i].act,0);
      return {month:m,estimated,actual};
    });
    let ae=0,aa=0;totals.forEach(t=>{ae+=t.estimated;aa+=t.actual;t.cumEstimated=ae;t.cumActual=aa;t.cumVariance=aa-ae;});
    const now=new Date(),nowMonth=[now.getFullYear(),String(now.getMonth()+1).padStart(2,"0")].join("-");
    const elapsed=data.months.filter(m=>m<=nowMonth).length||0,remainingMonths=data.months.length-elapsed;
    const ytdActual=totals.filter(t=>t.month<=nowMonth).reduce((s,t)=>s+t.actual,0);
    const forecast=elapsed?ytdActual+(ytdActual/elapsed)*remainingMonths:0;
    for(const r of rows){
      r.status=r.percentage===null?"غير مخطط":r.percentage>tolerance?"تجاوز":r.percentage < -tolerance?"توفير":"ضمن الحد";
      r.shareEstimated=totalEstimated?r.estimated/totalEstimated*100:0;r.shareActual=totalActual?r.actual/totalActual*100:0;
      const rYtd=r.monthly.filter(x=>x.month<=nowMonth).reduce((s,x)=>s+x.act,0);
      r.ytdVariance=rYtd-r.monthly.filter(x=>x.month<=nowMonth).reduce((s,x)=>s+x.est,0);
      r.remaining=r.estimated-rYtd;
      r.forecast=elapsed?rYtd+(rYtd/elapsed)*remainingMonths:0;
    }
    const variance=totalActual-totalEstimated;
    return {rows,totals,totalEstimated,totalActual,variance,percentage:totalEstimated?variance/totalEstimated*100:null,
      remaining:totalEstimated-ytdActual,forecast,elapsed,remainingMonths,referenceHeatmap:data.referenceHeatmap};
  }
  function statusColor(s){return s==="تجاوز"?COLORS.over:s==="توفير"?COLORS.save:"inherit";}
  function cellsLine(r){return `<tr><td>${esc(r.name)}</td><td>${bidi(n0(r.estimated))}</td><td>${bidi(n0(r.actual))}</td><td style="color:${barColor(r.variance)}">${bidi(sign(r.variance))}</td></tr>`;}
  function simpleAlt(rows,heads=["البند","التقديري","الفعلي","الفرق"]){
    return `<details class="fbc-raw"><summary>عرض البيانات البديلة للجدول</summary><div class="fbc-table-box" style="display:block"><table><thead><tr>${heads.map(h=>"<th>"+esc(h)+"</th>").join("")}</tr></thead><tbody>${rows.map(cellsLine).join("")}</tbody></table></div></details>`;
  }
  function chartCard(title,desc,body,alt){
    return `<section class="fbc-card"><h3>${esc(title)}</h3><p>${esc(desc)}</p>${body}${alt||""}</section>`;
  }
  function summary(d){
    const entries=[["التقديري للفترة",d.totalEstimated],["الفعلي للفترة",d.totalActual],["فرق الفترة",d.variance],["المتبقي من الميزانية",d.remaining],["التوقع لنهاية الفترة",d.forecast]];
    return `<div class="fbc-kpis">${entries.map(([k,v],i)=>`<div class="fbc-kpi"><span>${esc(k)}</span><strong style="${i===2?"color:"+barColor(v):""}">${i===2?bidi(sign(v)):bidi(n0(v))}</strong><small>${esc(currency())}</small></div>`).join("")}</div>`;
  }
  function reportTable(d){
    const headings=["البند","التقديري","الفعلي","فرق المبلغ","الانحراف","الحالة","حصة ت / ف","YTD","المتبقي","التوقع","النوع","السبب"];
    const row=r=>{
      return `<tr><td>${r.id?`<button type="button" data-fbc-open="${esc(r.id)}">${esc(r.name)}</button>`:esc(r.name)}</td><td>${bidi(n0(r.estimated))}</td><td>${r.id?`<button type="button" data-fbc-open="${esc(r.id)}" aria-label="عرض عمليات ${esc(r.name)}">${bidi(n0(r.actual))}</button>`:bidi(n0(r.actual))}</td>
<td style="color:${barColor(r.variance)}">${bidi(sign(r.variance))}</td><td>${bidi(pct(r.percentage,1))}</td>
<td style="color:${statusColor(r.status)}">${esc(r.status)}</td><td>${bidi(n1(r.shareEstimated)+"% / "+n1(r.shareActual)+"%")}</td>
<td>${bidi(sign(r.ytdVariance===undefined?r.variance:r.ytdVariance))}</td><td>${bidi(n0(r.remaining===undefined?r.estimated-r.actual:r.remaining))}</td><td>${bidi(n0(r.forecast))}</td><td>${typeName(r.kind)}</td><td>${causeName(r.cause)}</td></tr>`;
    };
    const total={name:"إجمالي الفترة",estimated:d.totalEstimated,actual:d.totalActual,variance:d.variance,
      percentage:d.percentage,status:d.percentage===null?"غير مخطط":d.percentage>ui.tolerance?"تجاوز":d.percentage < -ui.tolerance?"توفير":"ضمن الحد",
      shareEstimated:100,shareActual:100,forecast:d.forecast,ytdVariance:d.totals.filter(t=>t.month<=[new Date().getFullYear(),String(new Date().getMonth()+1).padStart(2,"0")].join("-")).reduce((a,t)=>a+t.actual-t.estimated,0),remaining:d.remaining,kind:"",cause:""};
    const desktop=`<div class="fbc-table-box"><table class="fbc-table"><thead><tr>${headings.map(h=>"<th>"+h+"</th>").join("")}</tr></thead><tbody>${d.rows.map(row).join("")}</tbody><tfoot>${row(total)}</tfoot></table></div>`;
    const mobile=`<div class="fbc-mobile-items">${d.rows.map(r=>`<div class="fbc-mobile-item"><div class="fbc-mobile-title"><button type="button" data-fbc-open="${esc(r.id)}">${esc(r.name)}</button><span style="color:${statusColor(r.status)}">${esc(r.status)}</span></div>
<div class="fbc-mobile-stat"><span>التقديري<b>${bidi(n0(r.estimated))}</b></span><span>الفعلي<b><button type="button" data-fbc-open="${esc(r.id)}" aria-label="عرض عمليات ${esc(r.name)}">${bidi(n0(r.actual))}</button></b></span><span>الفرق<b style="color:${barColor(r.variance)}">${bidi(sign(r.variance))}</b></span></div>
<div class="fbc-mobile-stat"><span>الانحراف<b>${bidi(pct(r.percentage,1))}</b></span><span>المتبقي<b>${bidi(n0(r.remaining))}</b></span><span>التوقع<b>${bidi(n0(r.forecast))}</b></span></div>
<details><summary>الحصص والسبب والنوع</summary><p>حصة التقديري: ${bidi(n1(r.shareEstimated)+"%")}، حصة الفعلي: ${bidi(n1(r.shareActual)+"%")}، فرق الفترة التراكمي: ${bidi(sign(r.ytdVariance))}</p><p>نوع البند: ${typeName(r.kind)}، سبب الانحراف: ${causeName(r.cause)}</p>${r.kind==="fixed"&&r.variance!==0?"<p>تنبيه: تقدير البند الثابت يحتاج مراجعة.</p>":r.kind==="variable"&&r.variance!==0?"<p>انحراف بند متغير قابل للتحكم.</p>":""}</details></div>`).join("")}
<div class="fbc-mobile-item"><div class="fbc-mobile-title">إجمالي الفترة <b style="color:${barColor(d.variance)}">${bidi(sign(d.variance))} ${esc(currency())}</b></div><div class="fbc-mobile-stat"><span>التقديري<b>${bidi(n0(d.totalEstimated))}</b></span><span>الفعلي<b>${bidi(n0(d.totalActual))}</b></span><span>الانحراف<b>${bidi(pct(d.percentage,1))}</b></span></div></div></div>`;
    return chartCard("جدول الفروقات التفصيلي","الفرق = الفعلي − التقديري. لا تُخفى البنود الصفرية؛ جميع النسب محسوبة من الإجماليات.",desktop+mobile);
  }
  function pairedColumns(d){
  const rows=d.rows,W=365,H=288,top=50,bottom=228,l=28,r=361,plot=bottom-top;
  const maxVal=Math.max(1,...rows.flatMap(x=>[x.estimated,x.actual]));
  const max=Math.ceil(maxVal/500)*500 || 500;
  const spacing=(r-l)/Math.max(1,rows.length),bar=Math.min(23,spacing*.31);
  const coord=value=>bottom-Math.max(0,value)/max*plot;
  let svg=`<svg class="fbc-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="أعمدة متجاورة: التقديري الرمادي والفعلي الأزرق">
    <title>مقارنة الموازنة التقديرية بالفعلية لكل بند</title>
    <desc>تقديري ${n0(d.totalEstimated)} وفعلي ${n0(d.totalActual)}. تبدأ جميع الأعمدة من الصفر ويظهر فرق كل بند فوقه.</desc>`;
  for(let j=0;j<=4;j++){
    const value=max*j/4,y=coord(value);
    svg+=`<line class="fbc-grid" x1="${l}" y1="${y}" x2="${r}" y2="${y}"/><text x="${l-3}" y="${y+4}" text-anchor="end" font-size="12">${n0(value)}</text>`;
  }
  rows.forEach((row,i)=>{
    const x=l+spacing*(i+.5),estY=coord(row.estimated),actY=coord(row.actual);
    const heading=rows.length<=6 ? row.name : String(i+1);
    svg+=`<text x="${x}" y="27" text-anchor="middle" fill="${barColor(row.variance)}">${sign(row.variance)}</text>`;
    svg+=`<rect x="${x-bar-2}" y="${estY}" width="${bar}" height="${Math.max(0,bottom-estY)}" fill="${COLORS.estimated}">
       <title>${esc(row.name)} التقديري: ${n0(row.estimated)}</title></rect>`;
    svg+=`<rect x="${x+2}" y="${actY}" width="${bar}" height="${Math.max(0,bottom-actY)}" fill="${COLORS.actual}">
       <title>${esc(row.name)} الفعلي: ${n0(row.actual)}</title></rect>`;
    svg+=`<text x="${x}" y="250" text-anchor="middle">${esc(heading)}</text>`;
  });
  svg+=`<text x="${l}" y="281" text-anchor="start">0</text></svg>`;
  const legend=`<div class="fbc-legend"><span style="--swatch:${COLORS.estimated}">تقديري</span><span style="--swatch:${COLORS.actual}">فعلي</span></div>`;
  const labels=rows.length>6?`<div class="fbc-legend">${rows.map((x,i)=>`<span>${i+1}. ${esc(x.name)}</span>`).join("")}</div>`:"";
  return chartCard("1. أعمدة متجاورة","الفرق لكل بند بأعلى الرسم؛ عمود رمادي للتقديري وعمود أزرق للفعلي، ومحور رأسي يبدأ من الصفر.",
    legend+svg+labels,simpleAlt(rows));
}
    function waterfall(d){
    const nonzero=d.rows.filter(r=>r.variance!==0);
    const levels=[d.totalEstimated];let s=d.totalEstimated;
    nonzero.forEach(r=>{s+=r.variance;levels.push(s)});
    const exact=Math.abs(s-d.totalActual)<0.001;
    if(!exact)return chartCard("2. شلال الفروقات","فشل التحقق المحاسبي.",`<p class="fbc-error" role="alert">خطأ: إجمالي التقديري + مجموع الفروق لا يساوي إجمالي الفعلي؛ رُفض رسم الشلال.</p>`);
    const min=Math.min(...levels,d.totalActual),max=Math.max(...levels,d.totalActual);
    const margin=Math.max(200,(max-min)*.18),start=Math.floor((min-margin)/100)*100,end=Math.max(max+margin,start+100);
    const W=350,H=276,top=25,base=212,plot=base-top,map=v=>base-(v-start)/(end-start)*plot;
    const bars=[{name:"التقديري",from:start,to:d.totalEstimated,val:d.totalEstimated,color:COLORS.estimated,full:true},...nonzero.map((r,i)=>({name:r.name,from:levels[i],to:levels[i+1],val:r.variance,color:barColor(r.variance)})),{name:"الفعلي",from:start,to:d.totalActual,val:d.totalActual,color:COLORS.actual,full:true}];
    const cell=(W-20)/bars.length;let svg=`<svg class="fbc-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="شلال الفروقات من التقديري إلى الفعلي"><title>شلال الفروقات</title><desc>الإجمالي التقديري ${n0(d.totalEstimated)} يليه فروق البنود حتى الإجمالي الفعلي ${n0(d.totalActual)}. يبدأ المحور من ${n0(start)}.</desc>`;
    for(let i=0;i<=3;i++){const y=top+(plot/3)*i;svg+=`<line class="fbc-grid" x1="3" y1="${y}" x2="347" y2="${y}"/>`;}
    bars.forEach((b,i)=>{
      const x=10+i*cell+cell*.22,width=cell*.56,y=Math.min(map(b.from),map(b.to)),h=Math.max(1,Math.abs(map(b.from)-map(b.to)));
      svg+=`<rect x="${x}" y="${y}" width="${width}" height="${h}" fill="${b.color}"><title>${esc(b.name)}: ${esc(sign(b.val))}</title></rect>`;
      svg+=`<text x="${x+width/2}" y="232" text-anchor="middle">${i+1}</text>`;
      if(i<bars.length-1){let connector=map(b.to);svg+=`<line x1="${x+width}" y1="${connector}" x2="${10+(i+1)*cell+cell*.22}" y2="${connector}" stroke="currentColor" opacity=".45" stroke-dasharray="3 3" stroke-width="1"/>`;}
    });
    svg+=`<text x="175" y="257" text-anchor="middle">بداية المحور: ${n0(start)}</text></svg>`;
    const legend=`<div class="fbc-legend">${bars.map((b,i)=>`<span style="--swatch:${b.color}">${i+1}. ${esc(b.name)} ${b.full?bidi(n0(b.val)):bidi(sign(b.val))}</span>`).join("")}</div>`;
    return chartCard("2. شلال الفروقات","الفروق الصفرية مستبعدة من الرسم فقط، مع خطوط ربط متقطعة والمحور المقطوع موضح.",svg+legend,simpleAlt(d.rows));
  }
  function varianceBars(d){
    const rows=[...d.rows].sort((a,b)=>b.variance-a.variance);
    const scale=Math.max(1,...rows.map(r=>Math.abs(r.variance)));
    const html=`<div role="img" aria-label="أعمدة الانحراف حول محور الصفر">${rows.map(r=>`<div class="fbc-rowbar"><span class="fbc-rowbar-label">${esc(r.name)}</span><div class="fbc-rowbar-visual"><div class="fbc-bars-center">
<div class="fbc-bar-left"><i style="width:${Math.abs(Math.min(0,r.variance))/scale*100}%;background:${COLORS.save}"></i></div>
<div class="fbc-bar-right"><i style="width:${Math.max(0,r.variance)/scale*100}%;background:${COLORS.over}"></i></div></div>
<span class="fbc-rowbar-value" style="color:${barColor(r.variance)}">${bidi(sign(r.variance)+" ("+pct(r.percentage)+")")}</span></div></div>`).join("")}</div>`;
    return chartCard("3. أعمدة الانحراف","التجاوز إلى اليمين بالأحمر، والتوفير إلى اليسار بالأخضر؛ البنود مرتبة حسب فرق المبلغ.",html,simpleAlt(rows));
  }
  function bulletChart(d){
    const maxRatio=Math.max(200,...d.rows.map(r=>r.estimated>0?100*r.actual/r.estimated:200));
    const max=Math.ceil(maxRatio/50)*50;
    const html=`<div role="img" aria-label="رصاصة الميزانية: خط الهدف عند 100 بالمئة">${d.rows.map(r=>{
      const ratio=r.estimated>0?r.actual/r.estimated*100:(r.actual>0?max:0);
      return `<div class="fbc-rowbar"><span class="fbc-rowbar-label">${esc(r.name)}</span><div class="fbc-rowbar-visual">
<div class="fbc-bullet" style="--target:${100/max*100}%"><span class="fbc-bullet-fill" style="width:${Math.min(100,ratio/max*100)}%"></span><span class="fbc-bullet-target"></span></div>
<span class="fbc-rowbar-value">${bidi(pct(r.percentage))}</span></div></div>`;}).join("")}</div><p class="fbc-data-note">النطاق الموحد: ${bidi("0% إلى "+max+"%")}؛ الخط الأسود يمثل التقديري 100%.</p>`;
    return chartCard("4. مخطط الرصاصة","نسبة الفعلي إلى التقديري، مع نطاق رمادي حتى 100% وأحمر بعده.",html,simpleAlt(d.rows));
  }
  function svgCum(d){
    const t=d.totals,W=350,H=240,x0=29,x1=334,y0=16,y1=196;
    const max=Math.max(1,...t.flatMap(v=>[v.cumEstimated,v.cumActual]))*1.1;
    const X=i=>x0+(t.length===1?(x1-x0)/2:i*(x1-x0)/(t.length-1)),Y=v=>y1-v/max*(y1-y0);
    let svg=`<svg class="fbc-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="خطان تراكميان للتقديري والفعلي"><title>التراكم الشهري</title><desc>القيمة النهائية للتقديري ${n0(t[t.length-1].cumEstimated)} والفعلي ${n0(t[t.length-1].cumActual)}.</desc>`;
    for(let i=0;i<=4;i++){let y=y0+(y1-y0)*i/4;svg+=`<line class="fbc-grid" x1="${x0}" y1="${y}" x2="${x1}" y2="${y}"/>`;}
    for(let i=0;i<t.length-1;i++){
      const a=t[i],b=t[i+1],pts=`${X(i)},${Y(a.cumEstimated)} ${X(i+1)},${Y(b.cumEstimated)} ${X(i+1)},${Y(b.cumActual)} ${X(i)},${Y(a.cumActual)}`;
      svg+=`<polygon points="${pts}" fill="${((a.cumVariance+b.cumVariance)/2)>0?COLORS.over:COLORS.save}" opacity=".16"/>`;
    }
    for(const [k,color,dash] of [["cumEstimated",COLORS.estimated,'stroke-dasharray="5 4"'],["cumActual",COLORS.actual,""]]){
      svg+=`<polyline points="${t.map((v,i)=>X(i)+","+Y(v[k])).join(" ")}" fill="none" stroke="${color}" stroke-width="2" ${dash}/>`;
    }
    t.forEach((a,i)=>{svg+=`<text x="${X(i)}" y="222" text-anchor="middle">${esc(a.month.slice(5))}</text>`;});
    svg+=`<text x="330" y="${Math.max(12,Y(t[t.length-1].cumEstimated)-9)}" text-anchor="end" fill="${COLORS.estimated}">${n0(t[t.length-1].cumEstimated)}</text>
<text x="330" y="${Math.min(204,Y(t[t.length-1].cumActual)+13)}" text-anchor="end" fill="${COLORS.actual}">${n0(t[t.length-1].cumActual)}</text></svg>`;
    const alt=`<details class="fbc-raw"><summary>عرض الجدول الشهري البديل</summary><table><tr><th>الشهر</th><th>تقديري تراكمي</th><th>فعلي تراكمي</th><th>الفجوة</th></tr>${t.map(v=>`<tr><td>${esc(v.month)}</td><td>${bidi(n0(v.cumEstimated))}</td><td>${bidi(n0(v.cumActual))}</td><td>${bidi(sign(v.cumVariance))}</td></tr>`).join("")}</table></details>`;
    return chartCard("5. الخطان التراكميان","رمادي متقطع للتقديري وأزرق للفعلي؛ الأحمر للتجاوز والأخضر للتوفير. محور الوقت من اليسار إلى اليمين.",svg,alt);
  }
  function heatVal(v){
    if(v===null)return {background:"rgba(136,135,128,.15)",text:"—"};
    const a=Math.abs(v),alpha=a===0?.15:a<5?.20:a<15?.40:a<30?.62:.85;
    const hex=v>0?"226,75,74":v<0?"99,153,34":"136,135,128";
    return {background:`rgba(${hex},${alpha})`,text:pct(v)};
  }
  function heatmap(d){
    const rows=d.rows,m=d.totals.map(x=>x.month);
    const get=(r,i)=>d.referenceHeatmap&&d.referenceHeatmap[r.id]?d.referenceHeatmap[r.id][i]:
      (r.monthly[i].est>0?(r.monthly[i].act-r.monthly[i].est)/r.monthly[i].est*100:null);
    const monthNames=["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
    const head=`<tr><th>البند</th>${m.map(x=>`<th>${monthNames[Number(x.slice(5))-1]||esc(x.slice(5))}</th>`).join("")}</tr>`;
    const table=`<div class="fbc-heatmap-desktop" role="img" aria-label="خريطة حرارية لنسب الانحراف لكل بند وشهر"><table><thead>${head}</thead><tbody>${rows.map(r=>`<tr><th>${esc(r.name)}</th>${m.map((x,i)=>{let v=heatVal(get(r,i));return `<td class="fbc-heat-cell" style="background:${v.background}">${bidi(v.text)}</td>`;}).join("")}</tr>`).join("")}</tbody></table></div>`;
    const mobile=`<div class="fbc-heatmap-mobile">${m.map((x,i)=>`<div class="fbc-heat-month"><strong>${esc(labelMonth(x))}</strong><div class="fbc-heat-tiles">${rows.map(r=>{let v=heatVal(get(r,i));return `<div style="background:${v.background}"><span>${esc(r.name)}</span><b>${bidi(v.text)}</b></div>`;}).join("")}</div></div>`).join("")}</div>`;
    const alt=`<details class="fbc-raw"><summary>عرض جدول النسب البديل</summary><table>${head}${rows.map(r=>`<tr><td>${esc(r.name)}</td>${m.map((x,i)=>`<td>${bidi(pct(get(r,i)))}</td>`).join("")}</tr>`).join("")}</table></details>`;
    const note=d.referenceHeatmap?'<p class="fbc-data-note">في وضع العينة، نسب الأشهر السابقة مرجعية توضيحية كما وردت بالمرفق، وليست مشتقة من المجاميع التراكمية.</p>':"";
    return chartCard("6. الخريطة الحرارية","صفوف للبنود وأعمدة للأشهر، وتدرج الشفافية بحسب حجم الانحراف.",table+mobile+note,alt);
  }
  function largestRemainder(values){
    const total=values.reduce((s,v)=>s+Math.max(0,v),0);if(!total)return values.map(()=>0);
    const exact=values.map(v=>Math.max(0,v)/total*100),res=exact.map(Math.floor),left=100-res.reduce((a,b)=>a+b,0);
    exact.map((x,i)=>({i,f:x-res[i]})).sort((a,b)=>b.f-a.f||a.i-b.i).slice(0,left).forEach(x=>res[x.i]++);
    return res;
  }
  function stack100(d){
  const estimates=largestRemainder(d.rows.map(x=>x.estimated)),actuals=largestRemainder(d.rows.map(x=>x.actual));
  const palette=["#2a78d6","#eb6834","#1baf7a","#eda100","#e87ba4","#008300","#7c3aed","#64748b","#b45309"];
  const color=(row,i)=>REFS[row.id]||palette[i%palette.length];
  const W=365,x=8,full=W-16,h=30,y1=16,y2=87;
  let svg=`<svg class="fbc-svg" viewBox="0 0 ${W} 140" role="img" aria-label="مجموعتا أعمدة مكدسة بالنسب المئوية وتغير الحصص بينهما">
    <title>مقارنة تغير حصص الميزانية حسب البند</title>
    <desc>الشريط العلوي يمثل التقديري والسفلي الفعلي، ومجموع حصص كل منهما 100 بالمئة.</desc>`;
  let prevE=0,prevA=0;
  d.rows.forEach((r,i)=>{
    const a=estimates[i]/100*full,b=actuals[i]/100*full,xe=x+prevE,xa=x+prevA,c=color(r,i);
    svg+=`<polygon points="${xe},${y1+h} ${xe+a},${y1+h} ${xa+b},${y2} ${xa},${y2}" fill="${c}" opacity=".22"/>`;
    prevE+=a;prevA+=b;
  });
  prevE=0;prevA=0;
  d.rows.forEach((r,i)=>{
    const a=estimates[i]/100*full,b=actuals[i]/100*full,xe=x+prevE,xa=x+prevA,c=color(r,i);
    if(a>0)svg+=`<rect x="${xe}" y="${y1}" width="${a}" height="${h}" rx="2" fill="${c}"><title>${esc(r.name)} تقديري ${estimates[i]}%</title></rect>`;
    if(b>0)svg+=`<rect x="${xa}" y="${y2}" width="${b}" height="${h}" rx="2" fill="${c}"><title>${esc(r.name)} فعلي ${actuals[i]}%</title></rect>`;
    if(estimates[i]>=7)svg+=`<text x="${xe+a/2}" y="${y1+20}" text-anchor="middle" fill="#fff">${estimates[i]}%</text>`;
    if(actuals[i]>=7)svg+=`<text x="${xa+b/2}" y="${y2+20}" text-anchor="middle" fill="#fff">${actuals[i]}%</text>`;
    prevE+=a;prevA+=b;
  });
  svg+=`<text x="${x}" y="10" text-anchor="start">التقديري</text><text x="${x}" y="133" text-anchor="start">الفعلي</text></svg>`;
  const legend=`<div class="fbc-stack-key">${d.rows.map((r,i)=>`<span style="--swatch:${color(r,i)}">${esc(r.name)} ${bidi(estimates[i]+"/"+actuals[i]+"%")}</span>`).join("")}</div>`;
  const alt=`<details class="fbc-raw"><summary>عرض نسب الحصص في جدول</summary><table><tr><th>البند</th><th>التقديري %</th><th>الفعلي %</th></tr>${d.rows.map((r,i)=>`<tr><td>${esc(r.name)}</td><td>${bidi(estimates[i])}</td><td>${bidi(actuals[i])}</td></tr>`).join("")}</table></details>`;
  return chartCard("7. المكدس النسبي 100%","شرائط تربط توزيع كل بند في التقديري بالفعلي؛ جميع الحصص تجمع إلى 100% بدقة.",svg+legend,alt);
}
    function spreadLabels(vals,minSpace,H){
    const order=vals.map((v,i)=>({i,y:v})).sort((a,b)=>a.y-b.y);if(!order.length)return [];
    order[0].y=Math.max(22,order[0].y);
    for(let i=1;i<order.length;i++)order[i].y=Math.max(order[i].y,order[i-1].y+minSpace);
    if(order[order.length-1].y>H-19){
      let overflow=order[order.length-1].y-(H-19);
      order.forEach(x=>x.y-=overflow);
      if(order[0].y<22){const gap=22-order[0].y;order.forEach(x=>x.y+=gap);}
    }
    const out=[];order.forEach(x=>out[x.i]=x.y);return out;
  }
  function slope(d){
    const rows=d.rows,W=350,H=Math.max(330,rows.length*31+45),max=Math.max(1,...rows.flatMap(r=>[r.estimated,r.actual]))*1.2;
    const Y=v=>H-45-v/max*(H-87),l=100,r=245;
    const leftY=spreadLabels(rows.map(x=>Y(x.estimated)),14,H),rightY=spreadLabels(rows.map(x=>Y(x.actual)),14,H);
    let svg=`<svg class="fbc-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="مخطط الميل بين التقديري والفعلي لكل بند"><title>مخطط الميل</title><desc>المقياس الرأسي موحد، الأخضر للانخفاض والأحمر للارتفاع.</desc>
<text x="${l}" y="15" text-anchor="middle">التقديري</text><text x="${r}" y="15" text-anchor="middle">الفعلي</text>`;
    for(let i=0;i<=4;i++){const y=Y(i*max/4);svg+=`<line class="fbc-grid" x1="${l}" y1="${y}" x2="${r}" y2="${y}"/>`;}
    rows.forEach((row,i)=>{
      const ya=Y(row.estimated),yb=Y(row.actual),c=barColor(row.variance);
      svg+=`<line x1="${l}" y1="${ya}" x2="${r}" y2="${yb}" stroke="${c}" stroke-width="2"/><circle cx="${l}" cy="${ya}" r="3" fill="${COLORS.estimated}"/><circle cx="${r}" cy="${yb}" r="3" fill="${COLORS.actual}"/>
<line x1="${l}" x2="${l-6}" y1="${ya}" y2="${leftY[i]}" stroke="currentColor" opacity=".28"/><line x1="${r}" x2="${r+6}" y1="${yb}" y2="${rightY[i]}" stroke="currentColor" opacity=".28"/>
<text x="${l-8}" y="${leftY[i]+4}" text-anchor="end">${n0(row.estimated)}</text><text x="${r+8}" y="${rightY[i]+4}" text-anchor="start">${n0(row.actual)}</text>`;
    });
    svg+="</svg>";
    const legend=`<div class="fbc-legend">${rows.map((x,i)=>`<span style="--swatch:${barColor(x.variance)}">${i+1}. ${esc(x.name)} ${bidi(sign(x.variance))}</span>`).join("")}</div>`;
    return chartCard("8. مخطط الميل","محوران بصريان على مقياس واحد دون محور قياس ثانوي، مع فصل التسميات المتقاربة 14px.",svg+legend,simpleAlt(rows));
  }
  function render(root,state){
    if(!root)return;appState=state||window.state||{};target=root;
    if(typeof document==="undefined")return;css();
    let current=[new Date().getFullYear(),String(new Date().getMonth()+1).padStart(2,"0")].join("-");
    if(!ui.end)ui.end=current;
    if(ui.sample)ui.end="2026-06";
    const months=monthsFor(ui.end,ui.sample?6:ui.span),data=ui.sample?sampleData():actualData(months),all=compute(data,ui.tolerance);
    const display=ui.sample?compute({months:["2026-06"],perMonth:data.perMonth,categories:data.categories,referenceHeatmap:null},ui.tolerance):all;
    const monthVal=ui.sample?"2026-06":ui.end;
    root.innerHTML=`<div id="sectionComparisons" class="fbc" dir="rtl"><div class="fbc-intro"><h2>مقارنة الميزانية الفعلية بالتقديرية</h2>
<p class="fbc-muted">جدول الفروقات، شلال التغير، أولويات التجاوز، واتجاه الإنفاق حسب الشهر والبند.</p></div>
<div class="fbc-controls">
<label>حتى شهر <input aria-label="الشهر الأخير" type="month" min="2020-01" max="2099-12" data-fbc="end" value="${monthVal}" ${ui.sample?"disabled":""}></label>
<label>عدد الأشهر <select aria-label="الفترة" data-fbc="span" ${ui.sample?"disabled":""}>${[1,3,6,12].map(n=>`<option value="${n}" ${ui.span===n?"selected":""}>${n} ${n===1?"شهر":"أشهر"}</option>`).join("")}</select></label>
<label>حد السماح <select aria-label="حد الانحراف المسموح" data-fbc="tolerance">${[0,3,5,10,15,20].map(n=>`<option value="${n}" ${ui.tolerance===n?"selected":""}>${n}%</option>`).join("")}</select></label>
<label class="fbc-switch"><input type="checkbox" data-fbc="sample" ${ui.sample?"checked":""}> عرض بيانات اختبار المستند</label></div>
${ui.sample?'<p class="fbc-data-note">عينة الاختبار: جدول ورسوم البنود لشهر يونيو 2026، والتراكمي والخريطة الحرارية من يناير إلى يونيو. لا يعدّل بيانات الأسرة.</p>':`<p class="fbc-data-note">الفترة: ${esc(months[0])} إلى ${esc(months[months.length-1])} · جميع المصروفات المسجلة، بصرف النظر عن وجود بند تقديري لها.</p>`}
${summary(display)}${reportTable(display)}${pairedColumns(display)}${waterfall(display)}${varianceBars(display)}
<div class="fbc-card"><button type="button" data-fbc="toggle" aria-expanded="${ui.advanced}">${ui.advanced?"إخفاء الرسوم الإضافية":"عرض الرسوم الخمسة الإضافية"}</button>
<p class="fbc-muted">الرصاصة، التراكمي، الخريطة الحرارية، المكدس النسبي، ومخطط الميل.</p></div>
${ui.advanced?`<div class="fbc-chart-grid">${bulletChart(display)}${svgCum(all)}${heatmap(all)}${stack100(display)}${slope(display)}</div>`:""}
</div>`;
    if(!mounted){mounted=true;document.addEventListener("change",event=>{
      if(!target||!target.contains(event.target))return;
      const t=event.target,a=t.dataset?.fbc;if(!a)return;
      if(a==="end"&&validMonth(t.value))ui.end=t.value;
      if(a==="span")ui.span=Number(t.value)||6;
      if(a==="tolerance")ui.tolerance=Number(t.value)||5;
      if(a==="sample"){ui.sample=t.checked;if(!ui.sample)ui.end=current;}
      render(target,window.state||appState);
    });document.addEventListener("click",event=>{
      const open=event.target.closest?.("[data-fbc-open]");
      if(open&&target?.contains(open)){
        const id=open.dataset.fbcOpen;
        if(typeof window.openOperationsFiltered==="function"){
          window.OperationsReturnHub?.stageOrigin?.();
          const endDate=new Date(Date.UTC(Number(ui.end.slice(0,4)),Number(ui.end.slice(5,7)),0)).toISOString().slice(0,10);
          window.openOperationsFiltered({category:id,type:"expense",dateFrom:monthsFor(ui.end,ui.sample?6:ui.span)[0]+"-01",dateTo:endDate,resetFilters:true,returnTitle:"مقارنات الميزانية"});
        }
        return;
      }
      const btn=event.target.closest?.("[data-fbc=toggle]");if(!btn||!target?.contains(btn))return;
      ui.advanced=!ui.advanced;render(target,window.state||appState);
    });}
  }
  function selfTest(){
    const d=compute(sampleData(),5);
    const last=d.totals[d.totals.length-1];
    const june=SAMPLE_CATS.map(x=>x.act-x.est),sums=SAMPLE_CATS.reduce((s,r)=>s+r.est,0);
    const single={months:["2026-11"],categories:[{id:"x",name:"غير مخطط"}],perMonth:{"2026-11":{x:{est:0,act:50}}}};
    const z=compute(single,5);
    const res={juneBudget:sums===6100,juneActual:SAMPLE_CATS.reduce((s,r)=>s+r.act,0)===6700,
      juneVariance:june.reduce((s,x)=>s+x,0)===600,juneWaterfall:[6100,6500,6450,6350,6150,6300,6700].every((v,i)=>v===[6100,...SAMPLE_CATS.reduce((a,x)=>{a.push((a.length?a[a.length-1]:6100)+x.act-x.est);return a},[])][i]),
      cumulativeJune:last.cumEstimated===36600&&last.cumActual===40300&&last.cumVariance===3700,
      stackEstimated:largestRemainder(SAMPLE_CATS.map(c=>c.est)).join(",")==="33,25,13,11,10,8",
      stackActual:largestRemainder(SAMPLE_CATS.map(c=>c.act)).join(",")==="36,22,10,8,11,13",
      zeroBudget:z.rows[0].percentage===null&&z.rows[0].status==="غير مخطط"};
    return {passed:Object.values(res).every(Boolean),tests:res};
  }
  const api={render,compute,sampleData,selfTest,version:"1.0.0"};
  if(typeof window!=="undefined")window.FamilyBudgetComparison=api;
  return api;
})();
