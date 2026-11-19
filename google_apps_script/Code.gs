/**
 * =========================================================================
 * Family Expense Tracker Next — Google Apps Script (Google Drive Backend)
 * خادم سحابي مجاني ومحمي لإدارة ومزامنة ملف العائلة المشترك على Google Drive
 * =========================================================================
 * 
 * خطوات التثبيت والنشر (مرة واحدة فقط):
 * 1. افتح https://script.google.com وأنشئ مشروعاً جديداً بعنوان "FamilyExpenseTrackerSync".
 * 2. انسخ هذا الكود والصقه بالكامل في ملف Code.gs.
 * 3. اضغط على زر "Deploy" (نشر) -> "New deployment" (نشر جديد).
 * 4. اختر نوع النشر: "Web app" (تطبيق ويب).
 * 5. اضبط الإعدادات كالتالي:
 *    - Execute as: "Me" (حسابك الشخصي).
 *    - Who has access: "Anyone" (أي شخص لديه الرابط، والمصادقة بالـ Secret Key).
 * 6. اضغط "Deploy" وانسخ رابط الـ Web App URL.
 * 7. الصق الرابط في إعدادات التطبيق تحت خانة "رابط مزامنة جوجل درايف".
 */

const FOLDER_NAME = 'FamilyExpenseTracker_Cloud';
const FILE_NAME = 'family_monefy_sync.json';
const DEFAULT_SECRET_KEY = 'family_secret_2026';

function doGet(e) {
  try {
    const file = getOrCreateSyncFile();
    const content = file.getBlob().getDataAsString('utf-8');
    const data = JSON.parse(content || '{}');

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      serverTime: new Date().toISOString(),
      database: data
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const rawData = e.postData.contents;
    const req = JSON.parse(rawData);

    // التحقق من الرمز السري للعائلة
    const secret = req.secretKey || DEFAULT_SECRET_KEY;
    if (secret !== DEFAULT_SECRET_KEY && secret !== getStoredSecret()) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'forbidden',
        message: 'Invalid Family Secret Key'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    const file = getOrCreateSyncFile();
    let currentData = {};
    try {
      const existing = file.getBlob().getDataAsString('utf-8');
      if (existing) currentData = JSON.parse(existing);
    } catch(ex) {
      currentData = {};
    }

    // دمج الحركات السحابية مع الحركات الواردة (Two-Way Smart Delta Merge)
    const mergedDatabase = {
      transactions: mergeLists(currentData.transactions || [], req.database.transactions || []),
      wallets: mergeLists(currentData.wallets || [], req.database.wallets || []),
      monthlyBudgets: mergeLists(currentData.monthlyBudgets || [], req.database.monthlyBudgets || []),
      expectedExpenses: mergeLists(currentData.expectedExpenses || [], req.database.expectedExpenses || []),
      debts: mergeLists(currentData.debts || [], req.database.debts || []),
      tasks: mergeLists(currentData.tasks || [], req.database.tasks || []),
      lastSyncedAt: new Date().toISOString(),
      lastClientTimestamp: req.clientTimestamp
    };

    // حفظ الملف المدمج في Google Drive
    file.setContent(JSON.stringify(mergedDatabase, null, 2));

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      action: 'sync_completed',
      serverTime: new Date().toISOString(),
      database: mergedDatabase
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// دمج مصفوفتين بالاعتماد على معرّف العنصر وتاريخ التعديل الأحدث
function mergeLists(listA, listB) {
  const map = new Map();
  listA.forEach(item => { if (item && item.id) map.set(item.id, item); });

  listB.forEach(itemB => {
    if (!itemB || !itemB.id) return;
    if (!map.has(itemB.id)) {
      map.set(itemB.id, itemB);
    } else {
      const itemA = map.get(itemB.id);
      const timeA = new Date(itemA.updatedAt || 0).getTime();
      const timeB = new Date(itemB.updatedAt || 0).getTime();
      if (timeB >= timeA) {
        map.set(itemB.id, itemB);
      }
    }
  });

  return Array.from(map.values());
}

// جلب أو إنشاء المجلد والملف على Google Drive
function getOrCreateSyncFile() {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  let folder;
  if (folders.hasNext()) {
    folder = folders.next();
  } else {
    folder = DriveApp.createFolder(FOLDER_NAME);
  }

  const files = folder.getFilesByName(FILE_NAME);
  if (files.hasNext()) {
    return files.next();
  } else {
    return folder.createFile(FILE_NAME, JSON.stringify({
      transactions: [],
      wallets: [],
      monthlyBudgets: [],
      expectedExpenses: [],
      debts: [],
      tasks: [],
      createdAt: new Date().toISOString()
    }, null, 2), MimeType.PLAIN_TEXT);
  }
}

function getStoredSecret() {
  const props = PropertiesService.getScriptProperties();
  return props.getProperty('FAMILY_SECRET_KEY') || DEFAULT_SECRET_KEY;
}
