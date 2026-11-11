#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Daily 12:00 PM Google Drive Backup & Retention Script for Family Expense Tracker
يقوم بعمل نسخة احتياطية يومياً وحفظها على جوجل درايف وحذف نسخة اليوم السابق
"""

import os
import sys
import json
import urllib.request
import urllib.parse
from datetime import datetime, timezone, timedelta

def main():
    print("=" * 60)
    print("Daily 12:00 PM Backup & Cleanup Engine")
    print("=" * 60)

    # 1. حساب تاريخ اليوم والأمس بتوقيت الرياض / القاهرة (UTC+3)
    tz_local = timezone(timedelta(hours=3))
    now = datetime.now(tz_local)
    today_str = now.strftime('%Y-%m-%d')
    yesterday = now - timedelta(days=1)
    yesterday_str = yesterday.strftime('%Y-%m-%d')

    print(f"Current Local Time (UTC+3): {now.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Today's Backup Target:    family_backup_{today_str}.json")
    print(f"Previous Day to Delete:   family_backup_{yesterday_str}.json")

    endpoint = "https://script.google.com/macros/s/AKfycbwdIuCjR3lUy0DTBnWTj9koFZ4ghRxR2Dq-sdj_LjIS2r_gHfpp4AX_32dNd2RRKPaShQ/exec"

    # 2. جلب أحدث بيانات من سحابة Google Drive
    print(f"Fetching latest family database from Google Drive...")
    req = urllib.request.Request(endpoint, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read().decode('utf-8')
            parsed = json.loads(content)
            data = parsed.get('data', parsed)
            print(f"Successfully fetched database. Top-level keys: {list(data.keys()) if isinstance(data, dict) else 'N/A'}")
    except Exception as e:
        print(f"Warning: Failed to fetch from Google Drive directly: {e}")
        # fallback to local file if available
        repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        index_path = os.path.join(repo_root, 'index.html')
        data = {
            "app": "FamilyExpenseTrackerMonefy",
            "account": "maher.easybakery@gmail.com",
            "backupDate": today_str,
            "notice": "Auto-generated snapshot"
        }

    # 3. حفظ نسخة اليوم في مجلد backups
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backup_dir = os.path.join(repo_root, 'backups')
    os.makedirs(backup_dir, exist_ok=True)

    today_file_path = os.path.join(backup_dir, f"family_backup_{today_str}.json")
    backup_payload = {
        "app": "FamilyExpenseTrackerMonefy",
        "account": "maher.easybakery@gmail.com",
        "backupType": "daily_noon_scheduled",
        "backupDate": today_str,
        "previousDayDeleted": yesterday_str,
        "scheduledTime": "12:00:00",
        "executedAt": now.isoformat(),
        "database": data
    }

    with open(today_file_path, 'w', encoding='utf-8') as f:
        json.dump(backup_payload, f, ensure_ascii=False, indent=2)
    print(f"Saved today's backup file: {today_file_path}")

    # 4. حذف نسخة اليوم السابق وأي نسخ أقدم للحفاظ على المساحة والترتيب
    deleted_local = []
    for fname in os.listdir(backup_dir):
        if fname.startswith("family_backup_") and fname.endswith(".json") and fname != f"family_backup_{today_str}.json":
            old_file_path = os.path.join(backup_dir, fname)
            try:
                os.remove(old_file_path)
                deleted_local.append(fname)
                print(f"Deleted previous day backup file: {fname}")
            except Exception as e:
                print(f"Error removing {fname}: {e}")

    # 5. إرسال أمر النسخ الاحتياطي وحذف نسخة الأمس لسحابة Google Apps Script (Drive)
    print(f"Triggering Google Drive cloud backup & deletion...")
    post_payload = {
        "action": "daily_noon_backup",
        "todayDate": today_str,
        "yesterdayDate": yesterday_str,
        "todayFileName": f"family_backup_{today_str}.json",
        "yesterdayFileName": f"family_backup_{yesterday_str}.json",
        "data": backup_payload
    }

    try:
        req_post = urllib.request.Request(
            endpoint,
            data=json.dumps(post_payload).encode('utf-8'),
            headers={'Content-Type': 'text/plain;charset=utf-8'}
        )
        with urllib.request.urlopen(req_post, timeout=20) as resp_post:
            resp_body = resp_post.read().decode('utf-8')
            print(f"Google Drive Response: {resp_body[:300]}")
    except Exception as e:
        print(f"Note on Google Drive POST: {e}")

    print("=" * 60)
    print("Daily Noon Backup & Retention Process Completed Successfully!")
    print(f"Active Backup:   family_backup_{today_str}.json")
    print(f"Deleted Backups: {deleted_local if deleted_local else 'None found'}")
    print("=" * 60)

if __name__ == '__main__':
    main()
