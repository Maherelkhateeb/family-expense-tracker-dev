/* Simulated microphone browser QA for real voice -> confirm -> native persistence. */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const URL=process.env.APP_URL||'http://127.0.0.1:8765/';
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const context=await browser.newContext({locale:'ar-EG',serviceWorkers:'block'});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try {
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>!!window.VoiceAssistantEngine && typeof renderUI==='function',null,{timeout:20000});
  const result=await page.evaluate(()=>{
    const st=state;
    st.transactions=[];st.expectedExpenses=[];
    class FakeRecognition {
      constructor(){window.__qaMic=this;}
      start(){this.onstart?.();}
      stop(){this.onend?.();}
    }
    window.SpeechRecognition=FakeRecognition;
    const test=(segments)=>{
      window.VoiceAssistantEngine.toggleListening();
      const recognition=window.__qaMic;
      if(!recognition)throw Error('Recognition not initialized');
      recognition.onresult({
        resultIndex:0,
        results:segments.map(transcript=>Object.assign([{transcript}],{isFinal:true}))
      });
      const sentence=document.getElementById('voiceLiveText')?.textContent;
      window.VoiceAssistantEngine.toggleListening();
      const opened=document.getElementById('voiceConfirmDrawer')?.classList.contains('open');
      window.VoiceAssistantEngine.commitTransaction();
      return {opened,sentence,closed:!document.getElementById('voiceConfirmDrawer')?.classList.contains('open')};
    };
    const items=[
      test(['صرفت مية','وخمسين جنيه على الاكل']),
      test(['أودعت ٣٥٠ جنيه']),
      test(['سلفت أحمد ميتين جنيه']),
      test(['تسلفت من أحمد ٢٥٠ جنيه']),
      test(['فاتورة الكهرباء 400 جنيه'])
    ];
    const savedTx=JSON.parse(localStorage.getItem('family_monefy_v2_tx')||'[]');
    const savedExpected=JSON.parse(localStorage.getItem('family_monefy_expected')||'[]');
    return {items,
      txCount:st.transactions.length,expectedCount:st.expectedExpenses.length,
      expense:st.transactions.find(t=>t.type==='expense')?.amount,
      income:st.transactions.find(t=>t.type==='income')?.amount,
      debt:st.expectedExpenses.find(t=>t.type==='debt_for_us')?.amount,
      borrowedDebt:st.expectedExpenses.find(t=>t.type==='debt_on_us')?.amount,
      bill:st.expectedExpenses.find(t=>t.type==='upcoming_bill')?.amount,
      persistedTx:savedTx.length,persistedExpected:savedExpected.length
    };
  });
  console.log('VOICE_MIC_SIMULATION '+JSON.stringify(result));
  assert.ok(result.items.every(x=>x.opened&&x.closed&&x.sentence),'Speech recognition did not complete confirmation flow');
  assert.deepEqual([result.txCount,result.expectedCount,result.expense,result.income,result.debt,result.borrowedDebt,result.bill],
    [2,3,150,350,200,250,400]);
  assert.equal(result.persistedTx,2,'Native transaction storage missing');
  assert.equal(result.persistedExpected,3,'Native commitment storage missing');
  assert.deepEqual(errors,[],'Browser errors');
  console.log('PASS: microphone event simulation, Arabic multi-segment transcription, expenses/deposits/debts/bills confirmation and persistent storage');
 }finally{await context.close();await browser.close();}
})().catch(e=>{console.error('VOICE_MIC_TEST_FAILED',e.stack||e);process.exitCode=1});
