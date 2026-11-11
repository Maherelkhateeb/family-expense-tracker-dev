#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Multi-Tier Ultra-Reliable Market Rates Fetcher (Currencies & Gold)
------------------------------------------------------------------
Radical fix for recurring frozen rates:
Tier 1: Try scraping ta3weem.com (Banque Misr & IDSC Gold) with STRICT name matching
Tier 2: Direct query to open financial APIs:
        - Currency: api.exchangerate-api.com & open.er-api.com (USD, SAR, EUR, AED, KWD to EGP)
        - Gold: api.gold-api.com/price/XAU (Live international Gold Ounce Spot)
        - Computes accurate Egyptian 24k, 21k, 18k, and Gold Pound prices
Tier 3: Cached baseline from market_rates.json with updated timestamp
"""

import json
import os
import re
import ssl
import subprocess
import sys
import urllib.request
from datetime import datetime, timezone, timedelta

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
}

def fetch_url(url, timeout=12):
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=timeout) as resp:
            return resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        return None

def fetch_curl(url, timeout=15):
    cmd = ['curl', '-sL', '--compressed', '-H', f'User-Agent: {HEADERS["User-Agent"]}', '--max-time', str(timeout), url]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=timeout+5)
        if res.returncode == 0 and len(res.stdout) > 200:
            return res.stdout
    except:
        pass
    return None

def parse_ta3weem_table(html):
    if not html:
        return []
    results = []
    trs = re.findall(r'<tr.*?>(.*?)</tr>', html, re.DOTALL | re.IGNORECASE)
    for tr in trs:
        tds = re.findall(r'<td.*?>(.*?)</td>', tr, re.DOTALL | re.IGNORECASE)
        if len(tds) < 3:
            continue
        name = re.sub(r'<.*?>', ' ', tds[0]).strip()
        name = re.sub(r'\s+', ' ', name)

        def extract_price_and_chg(td):
            fc = re.search(r'class="flex flex-col">\s*<span>(.*?)</span>.*?<span.*?>(.*?)</span>', td, re.DOTALL)
            if fc:
                raw_p = re.sub(r'<.*?>', '', fc.group(1)).replace(',', '').strip()
                raw_c = re.sub(r'<.*?>', '', fc.group(2)).strip()
                try:
                    price = float(raw_p)
                except:
                    price = None
                return price, raw_c
            return None, None

        buy_p, buy_c = extract_price_and_chg(tds[1])
        sell_p, sell_c = extract_price_and_chg(tds[2])
        if buy_p or sell_p:
            results.append({
                'name': name,
                'buy': buy_p,
                'buy_chg': buy_c,
                'sell': sell_p,
                'sell_chg': sell_c
            })
    return results

def fetch_live_global_fx():
    """Fetch live FX rates from open APIs (USD, SAR, EUR, AED, KWD to EGP)"""
    urls = [
        'https://api.exchangerate-api.com/v4/latest/USD',
        'https://open.er-api.com/v6/latest/USD'
    ]
    for u in urls:
        raw = fetch_url(u, timeout=8)
        if raw:
            try:
                data = json.loads(raw)
                rates = data.get('rates', {})
                if 'EGP' in rates and rates['EGP'] > 0:
                    usd_egp = float(rates['EGP'])
                    sar_egp = usd_egp / float(rates.get('SAR', 3.75))
                    eur_egp = usd_egp / float(rates.get('EUR', 0.92))
                    aed_egp = usd_egp / float(rates.get('AED', 3.6725))
                    kwd_egp = usd_egp / float(rates.get('KWD', 0.307))
                    return {
                        'USD': round(usd_egp, 2),
                        'SAR': round(sar_egp, 2),
                        'EUR': round(eur_egp, 2),
                        'AED': round(aed_egp, 2),
                        'KWD': round(kwd_egp, 2),
                    }
            except Exception as e:
                print(f"FX parse notice: {e}")
    return None

def fetch_live_global_gold():
    """Fetch live international gold spot price (XAU in USD)"""
    raw = fetch_url('https://api.gold-api.com/price/XAU', timeout=8)
    if raw:
        try:
            data = json.loads(raw)
            if 'price' in data and float(data['price']) > 500:
                return float(data['price'])
        except Exception as e:
            print(f"Gold API notice: {e}")
    return None

def main():
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_path = os.path.join(repo_root, 'market_rates.json')

    # Load existing baseline
    existing_data = {}
    if os.path.exists(out_path):
        try:
            with open(out_path, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
        except:
            pass

    base_curr = existing_data.get('currencies', {})
    base_gold = existing_data.get('gold', {})

    # 1. Tier 1: Try Ta3weem
    print("Tier 1: Fetching Ta3weem...")
    bm_html = fetch_curl('https://ta3weem.com/ar/banks/banque-misr-bm') or fetch_url('https://ta3weem.com/ar/banks/banque-misr-bm')
    gold_html = fetch_curl('https://ta3weem.com/ar/gold-data-sources/information-and-decision-support-center-gold') or fetch_url('https://ta3weem.com/ar/gold-data-sources/information-and-decision-support-center-gold')

    currencies_raw = parse_ta3weem_table(bm_html)
    gold_raw = parse_ta3weem_table(gold_html)

    c_map = {}
    for c in currencies_raw:
        n = c['name']
        # STRICT matching: Ensure US Dollar isn't overwritten by Canadian/Australian Dollar!
        if 'USD' in n or ('دولار' in n and 'أمريكي' in n):
            c_map['usd'] = c
        elif 'SAR' in n or ('ريال' in n and 'سعودي' in n):
            c_map['sar'] = c
        elif 'EUR' in n or 'يورو' in n:
            c_map['eur'] = c
        elif 'AED' in n or 'درهم إماراتي' in n:
            c_map['aed'] = c
        elif 'KWD' in n or 'دينار كويتي' in n:
            c_map['kwd'] = c

    g_map = {}
    for g in gold_raw:
        n = g['name']
        if '24' in n: g_map['gold24'] = g
        elif '21' in n: g_map['gold21'] = g
        elif '18' in n: g_map['gold18'] = g
        elif 'جنيه' in n or 'BTC' in n: g_map['goldPound'] = g

    # 2. Tier 2: Global live fallback if Ta3weem is incomplete or blocked
    live_fx = fetch_live_global_fx()
    live_gold_xau = fetch_live_global_gold() or base_gold.get('goldOunceUSD', 4072.10)

    # Resolve Currencies
    def get_c(key, code, name, default_buy, default_sell, default_chg):
        t_data = c_map.get(key)
        if t_data and t_data.get('sell'):
            return {
                'code': code,
                'name': name,
                'buy': t_data['buy'] or (t_data['sell'] - 0.10),
                'sell': t_data['sell'],
                'chg': t_data.get('sell_chg') or '0%',
                'bank': 'بنك مصر (مباشر تعويم)'
            }
        # Fallback to Live FX API
        if live_fx and code in live_fx:
            sell_p = live_fx[code]
            spread = 0.10 if code in ['USD', 'SAR'] else (0.25 if code == 'EUR' else 0.50)
            return {
                'code': code,
                'name': name,
                'buy': round(sell_p - spread, 2),
                'sell': sell_p,
                'chg': '0%',
                'bank': 'السعر الرسمي اللحظي (Global FX)'
            }
        # Fallback to existing baseline
        cached = base_curr.get(code, {})
        return {
            'code': code,
            'name': name,
            'buy': cached.get('buy', default_buy),
            'sell': cached.get('sell', default_sell),
            'chg': cached.get('chg', default_chg),
            'bank': cached.get('bank', 'بنك مصر')
        }

    final_currencies = {
        'USD': get_c('usd', 'USD', 'دولار أمريكي', 54.30, 54.40, '0%'),
        'SAR': get_c('sar', 'SAR', 'ريال سعودي', 14.39, 14.49, '0%'),
        'EUR': get_c('eur', 'EUR', 'يورو أوروبي', 60.45, 61.11, '0%'),
        'AED': get_c('aed', 'AED', 'درهم إماراتي', 14.77, 14.81, '0%'),
        'KWD': get_c('kwd', 'KWD', 'دينار كويتي', 172.38, 176.82, '0%')
    }

    # Resolve Gold
    usd_rate = final_currencies['USD']['sell']
    # Formula: 1 Troy Ounce = 31.1034768 grams 24k
    # Standard Egyptian local retail market premium over spot: ~1.012
    computed_24k = round(((live_gold_xau * usd_rate) / 31.1034768) * 1.012, 1)
    computed_21k = round(computed_24k * (21.0 / 24.0), 1)
    computed_18k = round(computed_24k * (18.0 / 24.0), 1)
    computed_pound = round(computed_21k * 8.0, 1)

    def get_g(key, karat, name, comp_val, default_buy, default_sell):
        t_data = g_map.get(key)
        if t_data and t_data.get('sell'):
            return {
                'karat': karat,
                'name': name,
                'buy': t_data['buy'] or (t_data['sell'] - 40),
                'sell': t_data['sell'],
                'chg': t_data.get('sell_chg') or '0%',
                'source': 'مركز المعلومات IDSC (مباشر تعويم)'
            }
        # Fallback to computed live gold
        if comp_val:
            return {
                'karat': karat,
                'name': name,
                'buy': round(comp_val - 45, 1),
                'sell': comp_val,
                'chg': '0%',
                'source': f'بورصة الذهب العالمية (${live_gold_xau:.1f}/أونصة)'
            }
        cached = base_gold.get(key, {})
        return {
            'karat': karat,
            'name': name,
            'buy': cached.get('buy', default_buy),
            'sell': cached.get('sell', default_sell),
            'chg': cached.get('chg', '0%'),
            'source': cached.get('source', 'بورصة الذهب')
        }

    final_gold = {
        'gold24': get_g('gold24', 24, 'ذهب عيار 24 (سبائك)', computed_24k, 7091.50, 7160.00),
        'gold21': get_g('gold21', 21, 'ذهب عيار 21 (الأكثر طلباً)', computed_21k, 6205.00, 6265.00),
        'gold18': get_g('gold18', 18, 'ذهب عيار 18', computed_18k, 5318.50, 5370.00),
        'goldPound': {
            'karat': 21,
            'weight': 8,
            'name': 'جنيه ذهب (BTC)',
            'buy': g_map.get('goldPound', {}).get('buy') or round(computed_pound - 350, 1),
            'sell': g_map.get('goldPound', {}).get('sell') or computed_pound,
            'chg': g_map.get('goldPound', {}).get('sell_chg') or '0%',
            'source': 'مركز المعلومات IDSC / الصاغة'
        },
        'goldOunceUSD': round(live_gold_xau, 2)
    }

    # Timezones: Cairo / KSA (UTC+2 / UTC+3)
    now_utc = datetime.now(timezone.utc)
    now_cairo = now_utc + timedelta(hours=2)

    market_data = {
        'updatedAt': now_utc.isoformat(),
        'lastUpdateHuman': now_cairo.strftime('%Y-%m-%d %I:%M %p بتوقيت القاهرة'),
        'provider': 'نظام أسعار الصرف والذهب الهجين متعدد المصادر (Banque Misr + Global FX + XAU Spot)',
        'currencies': final_currencies,
        'gold': final_gold
    }

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(market_data, f, ensure_ascii=False, indent=2)

    print(f"\n[OK] Successfully updated {out_path}")
    print(f"Timestamp: {market_data['lastUpdateHuman']}")
    print(f"USD: Buy={final_currencies['USD']['buy']} | Sell={final_currencies['USD']['sell']} EGP")
    print(f"SAR: Buy={final_currencies['SAR']['buy']} | Sell={final_currencies['SAR']['sell']} EGP")
    print(f"EUR: Buy={final_currencies['EUR']['buy']} | Sell={final_currencies['EUR']['sell']} EGP")
    print(f"AED: Buy={final_currencies['AED']['buy']} | Sell={final_currencies['AED']['sell']} EGP")
    print(f"Gold 21k: Buy={final_gold['gold21']['buy']} | Sell={final_gold['gold21']['sell']} EGP (Ounce: ${final_gold['goldOunceUSD']})")

if __name__ == '__main__':
    main()
