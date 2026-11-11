import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../models/transaction_model.dart';
import 'gold_market_drawer.dart';

class MonefyHomeScreen extends StatefulWidget {
  const MonefyHomeScreen({Key? key}) : super(key: key);

  @override
  State<MonefyHomeScreen> createState() => _MonefyHomeScreenState();
}

class _MonefyHomeScreenState extends State<MonefyHomeScreen> {
  String _selectedMember = 'ماهر';
  String _period = 'month'; // 'today', 'week', 'month', 'all'
  String _currentUser = 'ماهر'; // Maher (Owner)

  final List<ExpenseTransaction> _transactions = [
    ExpenseTransaction(
      id: 'tx-1',
      type: 'income',
      amount: 35000,
      label: 'راتب ماهر الشهري',
      category: 'others',
      member: 'ماهر',
      date: DateTime.now().subtract(const Duration(days: 10)),
    ),
    ExpenseTransaction(
      id: 'tx-2',
      type: 'expense',
      amount: 3200,
      label: 'طلبات سوبرماركت الشهر (أية)',
      category: 'food',
      member: 'أية',
      date: DateTime.now().subtract(const Duration(days: 5)),
    ),
    ExpenseTransaction(
      id: 'tx-3',
      type: 'expense',
      amount: 850,
      label: 'مصاريف مدرسة وباص محمد',
      category: 'education',
      member: 'محمد',
      date: DateTime.now().subtract(const Duration(days: 3)),
    ),
    ExpenseTransaction(
      id: 'tx-4',
      type: 'expense',
      amount: 620,
      label: 'علاج وأدوية للحاجة',
      category: 'health',
      member: 'الحاجة',
      date: DateTime.now().subtract(const Duration(days: 2)),
    ),
    ExpenseTransaction(
      id: 'tx-5',
      type: 'expense',
      amount: 450,
      label: 'ملابس شتوية لمريم',
      category: 'clothes',
      member: 'مريم',
      date: DateTime.now().subtract(const Duration(days: 1)),
    ),
  ];

  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  Widget build(BuildContext context) {
    final filtered = _getFilteredTransactions();
    double totalIncome = 0;
    double totalExpense = 0;
    for (var tx in filtered) {
      if (tx.type == 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }
    }
    double balance = totalIncome - totalExpense;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: const Color(0xFF0F172A),
      endDrawer: GoldMarketDrawer(
        onApplyToExpense: (amount, label, category) {
          _addNewTransaction(amount, label, category, 'expense');
        },
      ),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        elevation: 0,
        title: Row(
          children: const [
            Icon(Icons.account_balance_wallet, color: Color(0xFF38BDF8), size: 22),
            SizedBox(width: 8),
            Text(
              'مصروفات العيلة ماهر ❤️ أية',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          // Button to open TradingView Gold & Currencies Drawer
          IconButton(
            icon: Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFFF59E0B).withOpacity(0.2),
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFFF59E0B)),
              ),
              child: const Icon(Icons.monetization_on, color: Color(0xFFFBBF24), size: 18),
            ),
            tooltip: 'أسعار الذهب والعملات (TradingView)',
            onPressed: () {
              _scaffoldKey.currentState?.openEndDrawer();
            },
          ),
          IconButton(
            icon: const Icon(Icons.sms, color: Color(0xFF60A5FA), size: 20),
            tooltip: 'قارئ رسائل البنك',
            onPressed: _showSmsReaderDialog,
          ),
          IconButton(
            icon: const Icon(Icons.admin_panel_settings, color: Color(0xFFF59E0B), size: 20),
            tooltip: 'صلاحيات العائلة',
            onPressed: _showPermissionsDialog,
          ),
        ],
      ),
      body: Column(
        children: [
          // Top Family Avatars Row (Required)
          _buildFamilyAvatarsBar(),

          // Period Selector Bar
          _buildPeriodBar(),

          // Monefy Donut Wheel & Balance
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(12),
              child: Column(
                children: [
                  // Donut Wheel Card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Column(
                      children: [
                        // Donut Chart with Center Balance
                        SizedBox(
                          height: 220,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              PieChart(
                                PieChartData(
                                  sectionsSpace: 3,
                                  centerSpaceRadius: 65,
                                  sections: _buildPieSections(filtered),
                                ),
                              ),
                              Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Text('الرصيد المتبقي', style: TextStyle(color: Colors.white60, fontSize: 11)),
                                  Text(
                                    '${balance.toStringAsFixed(2)} ج.م',
                                    style: TextStyle(
                                      color: balance >= 0 ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                                      fontWeight: FontWeight.bold,
                                      fontSize: 18,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '~ ${(balance * 0.067).toStringAsFixed(1)} ر.س | ~ ${(balance * 0.0178).toStringAsFixed(1)} \$',
                                    style: const TextStyle(color: Colors.white38, fontSize: 10),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Totals Row
                        Row(
                          children: [
                            Expanded(
                              child: _buildSummaryBox('الدخل', '+${totalIncome.toStringAsFixed(2)} ج.م', Colors.green),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: _buildSummaryBox('المصروف', '-${totalExpense.toStringAsFixed(2)} ج.م', Colors.redAccent),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Recent Transactions List
                  _buildTransactionsSection(filtered),
                ],
              ),
            ),
          ),
        ],
      ),

      // Bottom Bar with + and - Buttons (Iconic Monefy Style)
      bottomNavigationBar: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          border: Border(top: BorderSide(color: Color(0xFF334155))),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Expense Button (-)
            FloatingActionButton(
              heroTag: 'btnExpense',
              backgroundColor: const Color(0xFFEF4444),
              onPressed: () => _openTransactionModal('expense'),
              child: const Icon(Icons.remove, size: 28),
            ),

            // Active User Switcher
            TextButton.icon(
              style: TextButton.styleFrom(
                backgroundColor: const Color(0xFF0F172A),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
              icon: const Icon(Icons.people, color: Colors.amber, size: 16),
              label: Text(
                'أنا: $_currentUser',
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
              ),
              onPressed: () {
                setState(() {
                  _currentUser = _currentUser == 'ماهر' ? 'أية' : 'ماهر';
                });
              },
            ),

            // Income Button (+)
            FloatingActionButton(
              heroTag: 'btnIncome',
              backgroundColor: const Color(0xFF10B981),
              onPressed: () => _openTransactionModal('income'),
              child: const Icon(Icons.add, size: 28),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFamilyAvatarsBar() {
    final members = [
      {'id': 'ماهر', 'name': 'ماهر (الرجل)', 'emoji': '👨', 'color': 0xFF1E3A8A},
      {'id': 'أية', 'name': 'أية (الزوجة)', 'emoji': '👩', 'color': 0xFF831843},
      {'id': 'محمد', 'name': 'محمد (الولد)', 'emoji': '👦', 'color': 0xFF164E63},
      {'id': 'مريم', 'name': 'مريم (البنت)', 'emoji': '👧', 'color': 0xFF701A75},
      {'id': 'الحاجة', 'name': 'الحاجة (الأم)', 'emoji': '👵', 'color': 0xFF713F12},
      {'id': 'الكل', 'name': 'الكل (العائلة)', 'emoji': '👨‍👩‍👧‍👦', 'color': 0xFF065F46},
    ];

    return Container(
      color: const Color(0xFF1E293B),
      padding: const EdgeInsets.symmetric(vertical: 8),
      height: 84,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: members.length,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        itemBuilder: (context, index) {
          final m = members[index];
          final isSelected = m['id'] == _selectedMember;
          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedMember = m['id'] as String;
              });
            },
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 6),
              child: Column(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Color(m['color'] as int),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isSelected ? const Color(0xFF38BDF8) : Colors.transparent,
                        width: isSelected ? 2.5 : 0,
                      ),
                      boxShadow: isSelected
                          ? [const BoxShadow(color: Color(0xFF38BDF8), blurRadius: 8)]
                          : [],
                    ),
                    alignment: Alignment.center,
                    child: Text(m['emoji'] as String, style: const TextStyle(fontSize: 20)),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    m['name'] as String,
                    style: TextStyle(
                      color: isSelected ? const Color(0xFF38BDF8) : Colors.white60,
                      fontSize: 10,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildPeriodBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      color: const Color(0xFF0F172A),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              _buildPeriodTab('اليوم', 'today'),
              const SizedBox(width: 4),
              _buildPeriodTab('الأسبوع', 'week'),
              const SizedBox(width: 4),
              _buildPeriodTab('الشهر', 'month'),
              const SizedBox(width: 4),
              _buildPeriodTab('الكل', 'all'),
            ],
          ),
          InkWell(
            onTap: () => _scaffoldKey.currentState?.openEndDrawer(),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.amber.withOpacity(0.15),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.amber),
              ),
              child: Row(
                children: const [
                  Icon(Icons.trending_up, color: Colors.amber, size: 14),
                  SizedBox(width: 4),
                  Text('TradingView', style: TextStyle(color: Colors.amber, fontSize: 10, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPeriodTab(String label, String value) {
    final active = _period == value;
    return GestureDetector(
      onTap: () => setState(() => _period = value),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: active ? const Color(0xFF27AE60) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: active ? Colors.white : Colors.white60,
            fontSize: 11,
            fontWeight: active ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryBox(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(color: color, fontSize: 14, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  List<PieChartSectionData> _buildPieSections(List<ExpenseTransaction> list) {
    final expenseMap = <String, double>{};
    for (var tx in list) {
      if (tx.type == 'expense') {
        expenseMap[tx.category] = (expenseMap[tx.category] ?? 0) + tx.amount;
      }
    }

    if (expenseMap.isEmpty) {
      return [
        PieChartSectionData(color: Colors.white24, value: 1, title: '', radius: 24),
      ];
    }

    final colors = [
      Colors.green,
      Colors.amber,
      Colors.blue,
      Colors.purple,
      Colors.redAccent,
      Colors.pink,
      Colors.cyan,
      Colors.orange,
    ];
    int colorIdx = 0;

    return expenseMap.entries.map((e) {
      final color = colors[colorIdx % colors.length];
      colorIdx++;
      return PieChartSectionData(
        color: color,
        value: e.value,
        title: '',
        radius: 28,
      );
    }).toList();
  }

  Widget _buildTransactionsSection(List<ExpenseTransaction> list) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'سجل الحركات (${_selectedMember == 'الكل' ? 'العائلة' : _selectedMember})',
                style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
              ),
              Row(
                children: [
                  _buildIconBtn(Icons.table_view, 'إكسيل', Colors.green, () {}),
                  const SizedBox(width: 6),
                  _buildIconBtn(Icons.picture_as_pdf, 'PDF', Colors.redAccent, () {}),
                ],
              ),
            ],
          ),
          const SizedBox(height: 8),
          if (list.isEmpty)
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Center(
                child: Text('لا توجد حركات لهذه الفترة', style: TextStyle(color: Colors.white38, fontSize: 12)),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: list.length,
              separatorBuilder: (_, __) => const Divider(color: Color(0xFF334155)),
              itemBuilder: (context, index) {
                final tx = list[index];
                final isExp = tx.type == 'expense';
                return ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: CircleAvatar(
                    backgroundColor: isExp ? Colors.red.withOpacity(0.2) : Colors.green.withOpacity(0.2),
                    child: Icon(
                      isExp ? Icons.arrow_downward : Icons.arrow_upward,
                      color: isExp ? Colors.redAccent : Colors.green,
                      size: 18,
                    ),
                  ),
                  title: Text(tx.label, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                  subtitle: Text('${tx.member} • ${tx.date.toString().substring(0, 10)}', style: const TextStyle(color: Colors.white54, fontSize: 11)),
                  trailing: Text(
                    '${isExp ? '-' : '+'}${tx.amount.toStringAsFixed(2)} ج.م',
                    style: TextStyle(
                      color: isExp ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildIconBtn(IconData icon, String label, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
        decoration: BoxDecoration(
          color: color.withOpacity(0.15),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 12),
            const SizedBox(width: 4),
            Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  List<ExpenseTransaction> _getFilteredTransactions() {
    return _transactions.where((tx) {
      if (_selectedMember != 'الكل' && tx.member != _selectedMember) {
        return false;
      }
      return true;
    }).toList();
  }

  void _openTransactionModal(String type) {
    final amountController = TextEditingController();
    final labelController = TextEditingController();
    String selectedCat = 'food';
    String member = _selectedMember == 'الكل' ? _currentUser : _selectedMember;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1E293B),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 16,
          left: 16,
          right: 16,
          top: 16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              type == 'expense' ? 'تسجيل مصروف جديد' : 'تسجيل دخل جديد',
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: amountController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'المبلغ (ج.م) *',
                labelStyle: TextStyle(color: Colors.white70),
                filled: true,
                fillColor: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: labelController,
              style: const TextStyle(color: Colors.white),
              decoration: const InputDecoration(
                labelText: 'بيان المصروف (إلزامي) *',
                labelStyle: TextStyle(color: Colors.white70),
                filled: true,
                fillColor: Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 14),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: type == 'expense' ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                padding: const EdgeInsets.all(12),
              ),
              onPressed: () {
                final amt = double.tryParse(amountController.text) ?? 0.0;
                final lbl = labelController.text.trim();
                // STRICT RULE VALIDATION:
                // "لا يتم قبول إضافة بند المصروف الا بتسجيل بيان المصروف"
                if (lbl.isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('عفواً، لا يمكن إضافة بند المصروف الا بتسجيل بيان المصروف!')),
                  );
                  return;
                }
                if (amt <= 0) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('الرجاء إدخال مبلغ صحيح أكبر من صفر')),
                  );
                  return;
                }

                _addNewTransaction(amt, lbl, selectedCat, type);
                Navigator.of(ctx).pop();
              },
              child: const Text('حفظ الحركة فوراً', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  void _addNewTransaction(double amount, String label, String category, String type) {
    setState(() {
      _transactions.add(
        ExpenseTransaction(
          id: 'tx-${DateTime.now().millisecondsSinceEpoch}',
          type: type,
          amount: amount,
          label: label,
          category: category,
          member: _selectedMember == 'الكل' ? _currentUser : _selectedMember,
          date: DateTime.now(),
        ),
      );
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('✅ تم حفظ المصروف بنجاح لحساب ${_selectedMember == 'الكل' ? _currentUser : _selectedMember}')),
    );
  }

  void _showSmsReaderDialog() {
    // SMS Reader Dialog
  }

  void _showPermissionsDialog() {
    // Permissions Dialog
  }
}
