import 'package:flutter/material.dart';
import '../services/tradingview_service.dart';

class GoldMarketDrawer extends StatefulWidget {
  final Function(double amount, String label, String category)? onApplyToExpense;

  const GoldMarketDrawer({Key? key, this.onApplyToExpense}) : super(key: key);

  @override
  State<GoldMarketDrawer> createState() => _GoldMarketDrawerState();
}

class _GoldMarketDrawerState extends State<GoldMarketDrawer> {
  late Future<MarketRates> _ratesFuture;
  final TextEditingController _qtyController = TextEditingController(text: '10');
  String _selectedAsset = 'gold21';

  @override
  void initState() {
    super.initState();
    _ratesFuture = TradingViewService.fetchLiveRates();
  }

  void _refresh() {
    setState(() {
      _ratesFuture = TradingViewService.fetchLiveRates();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: const Color(0xFF0F172A),
      child: SafeArea(
        child: FutureBuilder<MarketRates>(
          future: _ratesFuture,
          builder: (context, snapshot) {
            final rates = snapshot.data ?? MarketRates.defaults();
            final isLoading = snapshot.connectionState == ConnectionState.waiting;

            return Column(
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: Color(0xFF1E293B),
                    border: Border(bottom: BorderSide(color: Color(0xFFF59E0B), width: 2)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.monetization_on, color: Color(0xFFF59E0B)),
                          SizedBox(width: 8),
                          Text(
                            'بورصة الذهب والعملات',
                            style: TextStyle(
                              color: Color(0xFFFEF08A),
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white70),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                ),

                // TradingView Status
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  color: const Color(0xFF1E293B).withOpacity(0.5),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF2962FF),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'TradingView',
                              style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            'بيانات حية مباشرة',
                            style: TextStyle(color: Color(0xFF34D399), fontSize: 11, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: isLoading
                            ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.amber))
                            : const Icon(Icons.refresh, color: Colors.amber, size: 18),
                        onPressed: _refresh,
                      ),
                    ],
                  ),
                ),

                // Scrollable Content
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.all(12),
                    children: [
                      // Gold Section Title
                      _buildSectionHeader('أسعار الذهب في الصاغة (مصر)', Icons.workspace_premium),

                      // Gold 21K & 24K Grid
                      Row(
                        children: [
                          Expanded(
                            child: _buildPriceCard(
                              title: 'عيار 21 (الأكثر طلباً)',
                              price: '${rates.gold21Egp.toStringAsFixed(0)} ج.م',
                              change: '${rates.goldOunceChange >= 0 ? '+' : ''}${rates.goldOunceChange.toStringAsFixed(2)}%',
                              isUp: rates.goldOunceChange >= 0,
                              highlight: true,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _buildPriceCard(
                              title: 'عيار 24 (السبائك)',
                              price: '${rates.gold24Egp.toStringAsFixed(0)} ج.م',
                              change: '${rates.goldOunceChange >= 0 ? '+' : ''}${rates.goldOunceChange.toStringAsFixed(2)}%',
                              isUp: rates.goldOunceChange >= 0,
                              highlight: false,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),

                      // Gold Pound Card
                      _buildWideCard(
                        title: 'جنيه الذهب (BTC لازوردي - 8 جرام)',
                        price: '${rates.goldPoundEgp.toStringAsFixed(0)} ج.م',
                        sub: 'عيار 21 صافي',
                        icon: Icons.military_tech,
                      ),
                      const SizedBox(height: 14),

                      // Currencies Section
                      _buildSectionHeader('أسعار العملات مقابل الجنيه (TradingView FX)', Icons.currency_exchange),
                      Row(
                        children: [
                          Expanded(
                            child: _buildPriceCard(
                              title: 'الدولار (USDEGP)',
                              price: '${rates.usdEgp.toStringAsFixed(2)} ج.م',
                              change: '${rates.usdChange >= 0 ? '+' : ''}${rates.usdChange.toStringAsFixed(2)}%',
                              isUp: rates.usdChange >= 0,
                              highlight: false,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: _buildPriceCard(
                              title: 'الريال (SAREGP)',
                              price: '${rates.sarEgp.toStringAsFixed(2)} ج.م',
                              change: '${rates.sarChange >= 0 ? '+' : ''}${rates.sarChange.toStringAsFixed(2)}%',
                              isUp: rates.sarChange >= 0,
                              highlight: false,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),

                      // Calculator
                      _buildCalculator(rates),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0, top: 4.0),
      child: Row(
        children: [
          Icon(icon, color: Colors.amber, size: 16),
          const SizedBox(width: 6),
          Text(
            title,
            style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceCard({
    required String title,
    required String price,
    required String change,
    required bool isUp,
    required bool highlight,
  }) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: highlight ? const Color(0xFFF59E0B) : const Color(0xFF334155),
          width: highlight ? 1.5 : 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          Text(price, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                change,
                style: TextStyle(
                  color: isUp ? const Color(0xFF10B981) : const Color(0xFFEF4444),
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWideCard({required String title, required String price, required String sub, required IconData icon}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.amber.withOpacity(0.5)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(icon, color: Colors.amber),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
                  Text(sub, style: const TextStyle(color: Colors.white54, fontSize: 10)),
                ],
              ),
            ],
          ),
          Text(price, style: const TextStyle(color: Color(0xFFFEF08A), fontSize: 15, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildCalculator(MarketRates rates) {
    double qty = double.tryParse(_qtyController.text) ?? 0.0;
    double unitPrice = 0.0;

    if (_selectedAsset == 'gold21') unitPrice = rates.gold21Egp;
    else if (_selectedAsset == 'gold24') unitPrice = rates.gold24Egp;
    else if (_selectedAsset == 'goldPound') unitPrice = rates.goldPoundEgp;
    else if (_selectedAsset == 'usd') unitPrice = rates.usdEgp;
    else if (_selectedAsset == 'sar') unitPrice = rates.sarEgp;

    double total = qty * unitPrice;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFF334155)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'حاسبة الذهب والعملات لمصروفات العائلة',
            style: TextStyle(color: Color(0xFFFDE047), fontSize: 12, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                flex: 1,
                child: TextField(
                  controller: _qtyController,
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: Colors.white, fontSize: 12),
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                    filled: true,
                    fillColor: const Color(0xFF0F172A),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onChanged: (v) => setState(() {}),
                ),
              ),
              const SizedBox(width: 6),
              Expanded(
                flex: 2,
                child: DropdownButtonFormField<String>(
                  value: _selectedAsset,
                  dropdownColor: const Color(0xFF0F172A),
                  style: const TextStyle(color: Colors.white, fontSize: 11),
                  decoration: InputDecoration(
                    contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                    filled: true,
                    fillColor: const Color(0xFF0F172A),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  items: const [
                    DropdownMenuItem(value: 'gold21', child: Text('جرام عيار 21')),
                    DropdownMenuItem(value: 'gold24', child: Text('جرام عيار 24')),
                    DropdownMenuItem(value: 'goldPound', child: Text('جنيه ذهب')),
                    DropdownMenuItem(value: 'usd', child: Text('دولار أمريكي')),
                    DropdownMenuItem(value: 'sar', child: Text('ريال سعودي')),
                  ],
                  onChanged: (val) {
                    if (val != null) setState(() => _selectedAsset = val);
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.amber.withOpacity(0.15),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('الإجمالي:', style: TextStyle(color: Colors.white70, fontSize: 12)),
                Text(
                  '${total.toStringAsFixed(2)} ج.م',
                  style: const TextStyle(color: Color(0xFFFDE047), fontSize: 14, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFF59E0B),
              foregroundColor: Colors.black87,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            icon: const Icon(Icons.add_shopping_cart, size: 16),
            label: const Text('إضافة المبلغ لمصروفات العائلة', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
            onPressed: () {
              Navigator.of(context).pop();
              if (widget.onApplyToExpense != null) {
                widget.onApplyToExpense!(total, 'شراء ${_qtyController.text} $_selectedAsset (TradingView)', 'bills');
              }
            },
          ),
        ],
      ),
    );
  }
}
