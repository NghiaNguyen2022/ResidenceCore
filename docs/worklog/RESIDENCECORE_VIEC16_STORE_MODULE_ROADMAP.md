# Việc 16 — Roadmap Cửa hàng lite

## Nguyên tắc
- Cửa hàng có sổ riêng để ghi chi tiết.
- Không đẩy từng giao dịch bán hàng/mua hàng sang sổ chung.
- Chỉ chốt theo ngày và đẩy dòng tổng hợp sang sổ chung ở bước sau.

## Luồng demo cuối
1. Tạo sản phẩm.
2. Nhập hàng / chi mua hàng, tăng tồn kho.
3. Ghi chi vận hành.
4. Bán hàng theo sản phẩm, giảm tồn kho.
5. Kiểm tồn / điều chỉnh tồn nếu cần.
6. Xem báo cáo tồn kho.
7. Xem báo cáo dòng tiền cửa hàng.
8. Chốt ngày cửa hàng.
9. Đẩy tổng hợp ngày sang sổ chung.

## Các bước triển khai tiếp
- 16F: Product lite.
- 16G: Purchase stock / operating expense.
- 16H: Sale invoice lite.
- 16I: Inventory report and stock check.
- 16J: Store cashflow report.
- 16K: Daily closing → common ledger posting.
- 16L: Final demo script.
