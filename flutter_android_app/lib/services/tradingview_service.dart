import 'dart:convert';
import 'package:http/http.dart' as http;

class MarketRates {
  final double usdEgp;
  final double usdChange;
  final double sarEgp;
  final double sarChange;
  final double goldOunceUsd;
  final double goldOunceChange;
  final double gold24Egp;
  final double gold21Egp;
  final double goldPoundEgp;
  final DateTime lastUpdated;

  MarketRates({
    required this.usdEgp,
    required this.usdChange,
    required this.sarEgp,
    required this.sarChange,
    required this.goldOunceUsd,
    required this.goldOunceChange,
    required this.gold24Egp,
    required this.gold21Egp,
    required this.goldPoundEgp,
    required this.lastUpdated,
  });

  factory MarketRates.defaults() {
    return MarketRates(
      usdEgp: 56.04,
      usdChange: 0.12,
      sarEgp: 14.93,
      sarChange: -0.01,
      goldOunceUsd: 4043.83,
      goldOunceChange: -0.40,
      gold24Egp: 7286.00,
      gold21Egp: 6375.00,
      goldPoundEgp: 51000.00,
      lastUpdated: DateTime.now(),
    );
  }
}

class TradingViewService {
  static const String _forexScannerUrl = 'https://scanner.tradingview.com/forex/scan';
  static const String _cfdScannerUrl = 'https://scanner.tradingview.com/cfd/scan';

  /// Fetches live rates from TradingView Scanner API
  static Future<MarketRates> fetchLiveRates() async {
    try {
      final headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      };

      // 1. Fetch Forex (USD/EGP & USD/SAR)
      final forexBody = jsonEncode({
        'symbols': {
          'tickers': ['FX_IDC:USDEGP', 'FX_IDC:USDSAR']
        },
        'columns': ['close', 'change', 'bid', 'ask']
      });

      // 2. Fetch Gold Ounce (TVC:GOLD)
      final goldBody = jsonEncode({
        'symbols': {
          'tickers': ['TVC:GOLD']
        },
        'columns': ['close', 'change', 'bid', 'ask']
      });

      final forexFuture = http.post(Uri.parse(_forexScannerUrl), headers: headers, body: forexBody);
      final goldFuture = http.post(Uri.parse(_cfdScannerUrl), headers: headers, body: goldBody);

      final responses = await Future.wait([forexFuture, goldFuture]);
      final forexRes = responses[0];
      final goldRes = responses[1];

      double usdRate = 56.04;
      double usdChange = 0.12;
      double sarRate = 14.93;
      double sarChange = -0.01;
      double goldOunce = 4043.83;
      double goldChange = -0.40;

      if (forexRes.statusCode == 200) {
        final data = jsonDecode(forexRes.body);
        final list = data['data'] as List<dynamic>? ?? [];
        for (var item in list) {
          final s = item['s'];
          final d = item['d'] as List<dynamic>;
          if (s == 'FX_IDC:USDEGP' && d.isNotEmpty) {
            usdRate = (d[0] as num).toDouble();
            if (d.length > 1) usdChange = (d[1] as num).toDouble();
          } else if (s == 'FX_IDC:USDSAR' && d.isNotEmpty) {
            final usdsar = (d[0] as num).toDouble();
            sarRate = usdRate / usdsar;
            if (d.length > 1) sarChange = (d[1] as num).toDouble();
          }
        }
      }

      if (goldRes.statusCode == 200) {
        final data = jsonDecode(goldRes.body);
        final list = data['data'] as List<dynamic>? ?? [];
        for (var item in list) {
          final s = item['s'];
          final d = item['d'] as List<dynamic>;
          if (s == 'TVC:GOLD' && d.isNotEmpty) {
            goldOunce = (d[0] as num).toDouble();
            if (d.length > 1) goldChange = (d[1] as num).toDouble();
          }
        }
      }

      // Exact Egyptian Goldsmith formula:
      // Gram 24K = (Ounce in USD * USD/EGP) / 31.1034768
      final double gold24 = (goldOunce * usdRate) / 31.1034768;
      final double gold21 = gold24 * (21.0 / 24.0);
      final double goldPound = gold21 * 8.0;

      return MarketRates(
        usdEgp: usdRate,
        usdChange: usdChange,
        sarEgp: sarRate,
        sarChange: sarChange,
        goldOunceUsd: goldOunce,
        goldOunceChange: goldChange,
        gold24Egp: gold24,
        gold21Egp: gold21,
        goldPoundEgp: goldPound,
        lastUpdated: DateTime.now(),
      );
    } catch (e) {
      // Fallback on network timeout
      return MarketRates.defaults();
    }
  }
}
