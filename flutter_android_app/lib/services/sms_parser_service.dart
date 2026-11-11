class ParsedBankSms {
  final double amount;
  final String merchant;
  final String category;
  final DateTime date;
  final String rawText;

  ParsedBankSms({
    required this.amount,
    required this.merchant,
    required this.category,
    required this.date,
    required this.rawText,
  });
}

class SmsParserService {
  /// Parses SMS alerts from Banque Misr, CIB, NBE, QNB, etc.
  static ParsedBankSms? parseSms(String body) {
    if (body.isEmpty) return null;

    // 1. Amount Extraction (Egyptian Banks)
    // Examples: "بمبلغ 850.50 جم", "مبلغ 420.00 EGP", "بقيمة 290.00 جنيه"
    final amountRegex = RegExp(
      r'(?:بمبلغ|مبلغ|بقيمة|خصم)\s*([0-9,.]+)\s*(?:جم|جنيه|EGP|LE)',
      caseSensitive: false,
    );
    final match = amountRegex.firstMatch(body);

    double? extractedAmount;
    if (match != null && match.group(1) != null) {
      final cleanStr = match.group(1)!.replaceAll(',', '');
      extractedAmount = double.tryParse(cleanStr);
    } else {
      // Fallback number matching
      final numRegex = RegExp(r'([0-9]+\.[0-9]{2})');
      final numMatch = numRegex.firstMatch(body);
      if (numMatch != null) {
        extractedAmount = double.tryParse(numMatch.group(1)!);
      }
    }

    if (extractedAmount == null || extractedAmount <= 0) {
      return null;
    }

    // 2. Merchant Extraction
    final merchantRegex = RegExp(
      r'(?:لدى|في|at)\s+([A-Za-z0-9\u0600-\u06FF\s]+?)(?:\s+بتاريخ|\s+كارت|\s+رقم|\.|$)',
      caseSensitive: false,
    );
    final mMatch = merchantRegex.firstMatch(body);
    String merchant = 'مشتريات بطاقة بنك';
    if (mMatch != null && mMatch.group(1) != null) {
      merchant = mMatch.group(1)!.trim();
    }

    // 3. Category Heuristic
    final lower = (body + ' ' + merchant).toLowerCase();
    String category = 'others';
    if (lower.contains('carrefour') || lower.contains('spinneys') || lower.contains('سوبرماركت') || lower.contains('خضار')) {
      category = 'food';
    } else if (lower.contains('صيدلية') || lower.contains('عزبي') || lower.contains('مستشفى') || lower.contains('دكتور')) {
      category = 'health';
    } else if (lower.contains('بنزين') || lower.contains('وطنية') || lower.contains('شل') || lower.contains('uber') || lower.contains('أوبر')) {
      category = 'transport';
    } else if (lower.contains('مطعم') || lower.contains('كافيه') || lower.contains('mcdonalds') || lower.contains('starbucks')) {
      category = 'eating_out';
    }

    return ParsedBankSms(
      amount: extractedAmount,
      merchant: merchant,
      category: category,
      date: DateTime.now(),
      rawText: body,
    );
  }
}
