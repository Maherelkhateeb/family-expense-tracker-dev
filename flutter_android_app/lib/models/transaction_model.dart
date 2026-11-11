class ExpenseTransaction {
  final String id;
  final String type; // 'expense' or 'income'
  final double amount;
  final String label; // Mandatory: "لا يتم قبول إضافة بند المصروف الا بتسجيل بيان المصروف"
  final String category;
  final String member; // 'ماهر', 'أية', 'محمد', 'مريم', 'الحاجة'
  final DateTime date;
  final String? createdBy;

  ExpenseTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.label,
    required this.category,
    required this.member,
    required this.date,
    this.createdBy,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'type': type,
      'amount': amount,
      'label': label,
      'category': category,
      'member': member,
      'date': date.toIso8601String(),
      'createdBy': createdBy,
    };
  }

  factory ExpenseTransaction.fromMap(Map<String, dynamic> map, String docId) {
    return ExpenseTransaction(
      id: docId,
      type: map['type'] ?? 'expense',
      amount: (map['amount'] as num?)?.toDouble() ?? 0.0,
      label: map['label'] ?? '',
      category: map['category'] ?? 'others',
      member: map['member'] ?? 'ماهر',
      date: map['date'] != null ? DateTime.parse(map['date']) : DateTime.now(),
      createdBy: map['createdBy'],
    );
  }
}
