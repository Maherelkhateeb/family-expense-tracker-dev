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
