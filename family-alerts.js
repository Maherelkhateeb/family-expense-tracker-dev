const familyAlerts = (() => {
  const prefix = 'family_alerts_v1';
  let previous = null;
  let openDetail = null;
  const person = name => ['آية','اية','أية'].includes(name) ? 'أية' : (name || 'البيت');
  const clock = new Intl.DateTimeFormat('ar-EG', {hour:'numeric',minute:'2-digit',day:'numeric',month:'long',year:'numeric'});
  const number = new Intl.NumberFormat('ar-EG', {maximumFractionDigits:2});
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { console.warn('Notification storage', error); } };
  const profile = () => person(state.currentUser || 'ماهر');
  const readKey = () => prefix + '_read_' + profile();
  const rows = () => read(prefix, []);
  const dateOf = tx => operationDate(tx);
  const amount = value => number.format(Number(value) || 0) + ' جنيه';
  const snapshot = transactions => new Map((transactions || []).filter(tx => tx?.id && !tx.deleted).map(tx => [tx.id, {
    id:tx.id, type:tx.type, amount:tx.amount, label:tx.label || tx.description || tx.note || '',
    category:tx.category, walletId:tx.walletId || tx.wallet, date:dateOf(tx), time:tx.time,
    member:tx.member, author:tx.author, receiptVersion:tx.alertReceiptVersion, project:getTransactionProjectName(tx),
    from:tx.fromWalletId || tx.fromWallet, to:tx.toWalletId || tx.toWallet
  }]));
  const soundKey = prefix+'_sound';
  let audio;
  function ring() {
    if (!read(soundKey,false) || !audio || audio.state !== 'running') return;
    for (const [index, frequency] of [660,880].entries()) {
      const oscillator=audio.createOscillator(), gain=audio.createGain(), start=audio.currentTime+index*.15;
      oscillator.frequency.value=frequency; gain.gain.setValueAtTime(.17,start); gain.gain.exponentialRampToValueAtTime(.001,start+.16);
      oscillator.connect(gain).connect(audio.destination); oscillator.start(start); oscillator.stop(start+.17);
    }
  }
  async function toggleSound() {
    if (read(soundKey,false) && audio?.state === 'running') {write(soundKey,false);render();return;}
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      await audio.resume(); write(soundKey,true); ring(); render();
    } catch {showToast('تعذر تشغيل الصوت في هذا المتصفح');}
  }
  function store(events) {
    if (!events.length) return;
    const saved = rows();
    const known = new Set(saved.map(item => item.id));
    const added = events.filter(item => !known.has(item.id) && known.add(item.id));
    if (added.length) { write(prefix, [...added, ...saved].sort((a,b) => b.at-a.at).slice(0,1500)); ring(); }
  }
  function observe(transactions, actor, baseline = false) {
    const next = snapshot(transactions);
    if (!previous || baseline) { previous = next; refresh(); return; }
    const at = Date.now();
    const events = [];
    const record = (kind, tx, old) => {
      const who = person(kind === 'add' ? tx.author || actor || tx.member : actor || tx.author);
      const verb = who === 'أية' ? 'قامت' : 'قام';
      const action = kind === 'edit' ? 'بتعديل عملية' : kind === 'delete' ? 'بحذف عملية' :
        tx.type === 'transfer' || tx.category === 'transfer' ? 'بتسجيل تحويل' : tx.type === 'income' ? 'بإيداع' : 'بصرف';
      events.push({id:[kind,tx.id,at].join(':'),at,title:kind === 'edit' ? 'تعديل عملية' : kind === 'delete' ? 'حذف عملية' : tx.type === 'income' && tx.category !== 'transfer' ? 'إيداع مبلغ' : 'عملية جديدة',
        body:verb+' '+who+' '+action+' '+amount(tx.amount)+' · '+(getCategoryName(tx.category,tx.type) || 'بدون بند'),
        tx, old, kind});
    };
    for (const [id, tx] of next) {
      const old = previous.get(id);
      if (!old) record('add',tx);
      else if (JSON.stringify(tx) !== JSON.stringify(old)) record('edit',tx,old);
    }
    for (const [id, tx] of previous) if (!next.has(id)) record('delete',tx);
    previous = next;
    store(events);
    refresh();
  }
  function reminders(now = new Date()) {
    const today = getLocalDateStr(now);
    const at = now.getTime();
    const events = [];
    const push = (id,title,body,target) => events.push({id,title,body,target,at});
    const expenses = (state.transactions || []).filter(tx => tx && !tx.deleted && tx.type === 'expense' && tx.category !== 'transfer');
    if (!expenses.some(tx => dateOf(tx) === today && person(tx.author || tx.member) === 'أية')) {
      const slot = [12,17,21].filter(hour => now.getHours() >= hour).at(-1);
      if (slot !== undefined) push('expense:'+today+':'+slot,'تذكير لأية بتسجيل المصروفات','لو فيه مصروفات اليوم، سجّليها في صفحة المصاريف.','أية');
    }
    const daysUntil = date => (Date.parse(date+'T00:00:00Z')-Date.parse(today+'T00:00:00Z'))/86400000;
    const obligations = new Map();
    for (const item of [...(state.debts || []), ...(state.expectedExpenses || [])]) if (item?.id) obligations.set(item.id,item);
    for (const item of obligations.values()) {
      if (String(item.id).startsWith('alert-demo-') || !item.dueDate || item.paid || item.deleted || ['paid','settled','cancelled','archived'].includes(item.status)) continue;
      const remaining = Number(item.amount)-Number(item.paidAmount || 0);
      const days = daysUntil(item.dueDate);
      if (!(remaining > 0) || ![7,3,1,0,-1].includes(days)) continue;
      const timing = days < 0 ? 'متأخر عن موعده' : days === 0 ? 'يستحق اليوم' : 'يستحق خلال '+number.format(days)+' يوم';
      push('due:'+item.id+':'+item.dueDate+':'+days,'تذكير استحقاق', (item.title || item.label || 'فاتورة أو دين')+' · '+timing+' · '+item.dueDate+' · المتبقي '+amount(remaining));
    }
    for (const plan of state.monthlyBudgets || []) {
      if (String(plan.id).startsWith('alert-demo-') || plan.month !== today.slice(0,7)) continue;
      const scoped = expenses.filter(tx => dateOf(tx).slice(0,7) === plan.month &&
        (!plan.project || getTransactionProjectName(tx).toLocaleLowerCase() === plan.project.trim().toLocaleLowerCase()));
      const items = (plan.items || []).filter(item => Number(item.amount) > 0);
      const limits = new Map();
      const add = (key,label,limit,test) => {
        const current = limits.get(key);
        if (current) current.limit += Number(limit);
        else limits.set(key,{label,limit:Number(limit),test});
      };
      for (const item of items) {
        add('total',plan.project || plan.name || 'إجمالي الموازنة',item.amount,()=>true);
        if (item.category) {
          const category = getCategoryObj(item.category,'expense').id;
          add('category:'+category,getCategoryName(category,'expense'),item.amount,tx=>getCategoryObj(tx.category,'expense').id === category);
        }
        const members = [...new Set((Array.isArray(item.members) ? item.members : item.member ? [item.member] : []).map(person))];
        for (const member of members) add('person:'+member,'مصروف '+member,Number(item.amount)/members.length,tx=>person(tx.member) === member);
      }
      for (const [key,limit] of limits) {
        const spent = scoped.filter(limit.test).reduce((total,tx)=>total+(Number(tx.amount)||0),0);
        if (spent < limit.limit*.8) continue;
        const level = spent >= limit.limit ? 100 : 80;
        push(['budget',plan.id || plan.name || plan.project,plan.month,key,level].join(':'),level === 100 ? (spent > limit.limit ? 'تجاوز حد الموازنة' : 'بلوغ حد الموازنة') : 'اقتراب من حد الموازنة',
          limit.label+' · '+amount(spent)+' من '+amount(limit.limit)+' · '+plan.month);
      }
    }
    store(events);
    render();
  }
  function created(kind, record) {
    const who = person(state.currentUser);
    const title = {request:'طلب مبلغ', budget:'موازنة جديدة', task:'مهمة جديدة'}[kind];
    const fields = kind === 'request'
      ? [record.reason, amount(record.amount), 'مقدم الطلب: '+person(record.member), 'التاريخ: '+record.date]
      : kind === 'budget'
        ? [record.name, 'الشهر: '+record.month, record.project ? 'المشروع: '+record.project : '', 'المصروف المقدّر: '+amount((record.items || []).reduce((sum,item)=>sum+(Number(item.amount)||0),0))]
        : [record.title, 'المسؤول: '+person(record.assignedMember), 'الموعد: '+[record.dueDate,record.dueTime,record.dueTimeZone].filter(Boolean).join(' · '),
          'التصنيفات: '+getTaskTags(record).map(tag=>({general:'عامة',important:'عاجلة',shopping:'مشتريات',bills:'فواتير',health:'صحة',work:'عمل',home:'منزلية',my_day:'يومي',planned:'مجدولة'})[tag]||tag).join('، ')];
    store([{id:kind+':'+record.id,title,body:who+' · '+(fields[0] || title),at:Date.now(),details:[title, ...fields, 'سجّلها: '+who].filter(Boolean)}]);
    render();
  }
  const visible = () => rows().filter(item => !item.target || item.target === profile());
  function mark(id) {
    const key = readKey();
    const seen = new Set(read(key,[]));
    for (const item of visible()) if (!id || item.id === id) seen.add(item.id);
    const retained = new Set(rows().map(item=>item.id));
    write(key,[...seen].filter(item=>retained.has(item)));
    render();
  }
  function render() {
    const sound = document.getElementById('alertSoundButton');
    if (sound) sound.textContent = audio?.state === 'running' && read(soundKey,false) ? 'إيقاف الصوت' : 'تشغيل الصوت';
    const items = visible();
    const seen = new Set(read(readKey(),[]));
    const count = items.filter(item => !seen.has(item.id)).length;
    const badge = document.getElementById('headerNotifBadge');
    if (badge) { badge.hidden = count === 0; badge.textContent = number.format(count); }
    const bell = document.getElementById('btnNotificationsBell');
    if (bell) bell.setAttribute('aria-label','التنبيهات · '+number.format(count)+' غير مقروء');
    const list = document.getElementById('notificationsListContainer');
    if (!list || !document.getElementById('notificationsModal')?.classList.contains('active')) return;
    list.replaceChildren();
    if (openDetail && items.some(item => item.id === openDetail.id)) {
      const back = document.createElement('button');
      back.textContent = 'العودة إلى التنبيهات';
      back.onclick = () => { openDetail = null; render(); };
      list.append(back);
      if (openDetail.details) {
        const detail=document.createElement('article');
        detail.className='family-alert';
        for(const field of [...openDetail.details,clock.format(openDetail.at)]) {
          const p=document.createElement('p'); p.textContent=field; detail.append(p);
        }
        list.append(detail);
        return;
      }
      const live = (state.transactions || []).find(tx=>tx.id===openDetail.tx.id && !tx.deleted);
      const tx = live ? snapshot([live]).get(live.id) : openDetail.tx;
      const detail = document.createElement('article');
      detail.className = 'family-alert';
      const fields = [openDetail.kind === 'delete' ? 'تفاصيل العملية المحذوفة' : 'تفاصيل العملية', tx.label,
        amount(tx.amount)+' · '+getCategoryName(tx.category,tx.type),
        [tx.date,tx.time].filter(Boolean).join(' · '), 'الفرد: '+person(tx.member),
        tx.walletId ? 'المحفظة: '+getWalletName(tx.walletId) : '',
        tx.to ? 'من '+getWalletName(tx.from || tx.walletId)+' إلى '+getWalletName(tx.to) : '',
        tx.project ? 'المشروع: '+tx.project : '',
        openDetail.old ? 'وقت التعديل: '+clock.format(openDetail.at)+' · المبلغ قبل التعديل: '+amount(openDetail.old.amount) : 'وقت التنبيه: '+clock.format(openDetail.at)];
      for (const field of fields.filter(Boolean)) {const p=document.createElement('p');p.textContent=field;detail.append(p);}
      if (live?.receipt) {const receipt=document.createElement('button');receipt.textContent='عرض الإيصال';receipt.onclick=()=>{closeModal('notificationsModal');viewReceiptImage(live.receipt);};detail.append(receipt);}
      list.append(detail);
      return;
    }
    if (!items.length) list.textContent='لا توجد تنبيهات حتى الآن.';
    for (const item of items) {
      const card = document.createElement('article');
      card.className = 'family-alert';
      card.dataset.unread = String(!seen.has(item.id));
      const main = document.createElement(item.tx || item.details ? 'button' : 'div');
      main.className = 'family-alert-main';
      if (item.tx || item.details) main.onclick = () => { openDetail=item; mark(item.id); };
      for (const [tag,value] of [['strong',item.title],['span',item.body],['small',clock.format(item.at)]]) {
        const element = document.createElement(tag); element.textContent=value; main.append(element);
      }
      card.append(main);
      if (!seen.has(item.id)) {
        const button=document.createElement('button'); button.textContent='✓'; button.setAttribute('aria-label','تحديد كمقروء'); button.title='تحديد كمقروء'; button.onclick=()=>mark(item.id); card.append(button);
      }
      list.append(card);
    }
  }
  function demo() {
    if (rows().some(row=>row.demo)) { showToast('الحالات التجريبية مسجلة بالفعل'); return; }
    const at=Date.now(), today=getLocalDateStr(new Date(at)), month=today.slice(0,7);
    const wallet=state.wallets?.[0]?.id;
    if (!wallet) { showToast('أنشئ محفظة أولًا لتسجيل بيانات الاختبار'); return; }
    const events=[];
    const add=(title, body, extra={})=>{
      const n=events.length+1;
      events.push({id:'alert-demo:'+n,at:at+n,demo:true,title,body:'اختبار التنبيهات '+n+' · '+body,...extra});
    };
    const tx=(id,type,value,author,category='daily')=>({id:'alert-demo-tx-'+at+'-'+id,type,amount:value,author,member:author,category,date:today,walletId:wallet,label:'اختبار التنبيهات · '+id,createdAt:new Date(at).toISOString()});
    const actors=['أية','ماهر','محمد','مريم'];
    for (const [kind,count] of [['expense',12],['income',6],['transfer',4],['edit',4],['delete',4]]) {
      for(let i=0;i<count;i++) {
        const author=actors[i%actors.length], item=tx(events.length+1,kind==='income'?'income':kind==='transfer'&&state.wallets.length>1?'transfer':'expense',50+i*15,author,kind==='income'?'salary':kind==='transfer'?'transfer':'daily');
        if(item.type==='transfer'){item.fromWalletId=wallet;item.toWalletId=state.wallets[1].id;}
        if(kind!=='delete' && (kind!=='transfer' || item.type==='transfer')) state.transactions.unshift(item);
        const titles={expense:'مصروف جديد',income:'إيداع مبلغ',transfer:'تحويل بين المحافظ',edit:'تعديل عملية',delete:'حذف عملية'};
        const snapshotItem=snapshot([item]).get(item.id);
        add(titles[kind],author+' · '+amount(item.amount)+' · '+getCategoryName(item.category,item.type),{tx:snapshotItem,kind,old:kind==='edit'?{...snapshotItem,amount:item.amount-10}:undefined});
      }
    }
    for(let i=0;i<4;i++) {
      const member=actors[i], value=200+50*i, reason='اختبار التنبيهات · طلب '+(i+1);
      state.moneyRequests.unshift({id:'alert-demo-request-'+at+'-'+i,member,amount:value,reason,date:today,status:'pending',allocations:[{amount:value,category:'daily',member}],createdBy:member});
      add('طلب مبلغ',member+' · '+amount(value),{details:[reason,member,amount(value),today]});
    }
    for(let i=0;i<3;i++) {
      const name='اختبار التنبيهات · موازنة '+(i+1), value=400+i*50;
      state.monthlyBudgets.unshift({id:'alert-demo-budget-'+at+'-'+i,name,month,project:'مشروع اختبار '+(i+1),items:[{amount:value,category:'daily',members:['أية']}],incomes:[],categories:{}});
      add('موازنة جديدة',name,{details:[name,month,amount(value)]});
    }
    const tasks=getTodoTasks();
    for(let i=0;i<3;i++) {
      const title='اختبار التنبيهات · مهمة '+(i+1);
      tasks.unshift({id:'alert-demo-task-'+at+'-'+i,title,dueDate:today,assignedMember:actors[i],tag:'general',completed:false,subtasks:[]});
      add('مهمة جديدة',title,{details:[title,actors[i],today]});
    }
    for(const [offset,timing] of [[7,'قبل ٧ أيام'],[3,'قبل ٣ أيام'],[1,'قبل يوم'],[0,'يوم الاستحقاق'],[-1,'بعد الاستحقاق']]) {
      const date=new Date(at); date.setDate(date.getDate()+offset);
      const dueDate=getLocalDateStr(date), title='اختبار التنبيهات · '+(offset%2?'دين':'فاتورة')+' '+timing;
      state.expectedExpenses.unshift({id:'alert-demo-due-'+at+'-'+offset,title,amount:250,paidAmount:0,dueDate,status:'upcoming',type:offset%2?'debt_on_us':'upcoming_bill'});
      add('تذكير استحقاق',title,{details:[title,dueDate,amount(250)]});
    }
    for(const [scope,spent,limit] of [['بند مصروف يومي',85,100],['مصروف أية',125,100],['مشروع اختبار',445,500],['إجمالي الموازنة',590,500]]) {
      add(spent>=limit?'تجاوز حد الموازنة':'اقتراب من حد الموازنة',scope,{details:[scope,amount(spent)+' من '+amount(limit),month]});
    }
    add('تذكير لأية بتسجيل المصروفات','مثال على التذكير اليومي',{details:['سجّلي مصروفات اليوم إذا لم تسجّليها بعد.',today]});
    saveTodoTasks(tasks);
    saveMoneyRequests();
    localStorage.setItem('family_monefy_monthly_budgets',JSON.stringify(state.monthlyBudgets));
    localStorage.setItem('family_monefy_expected',JSON.stringify(state.expectedExpenses));
    previous=snapshot(state.transactions);
    saveTx();
    store(events);
    openDetail=null;
    render();
    showToast('تم تسجيل ٥٠ حالة تجريبية');
  }
  function refresh() { reminders(); }
  function open() { openDetail=null; openModal('notificationsModal'); refresh(); }
  window.addEventListener('storage',event=>{ if(event.key?.startsWith(prefix)) render(); });
  document.addEventListener('visibilitychange',()=>{ if(previous && !document.hidden) refresh(); });
  window.addEventListener('focus',()=>{ if(previous) refresh(); });
  setInterval(()=>{ if(previous && !document.hidden) refresh(); },60000);
  return {observe,refresh,open,mark,created,demo,toggleSound};
})();
