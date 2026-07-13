# Việc 16D — Chốt sổ cửa hàng theo ngày

## Nguyên tắc
Cửa hàng có sổ chi tiết riêng. Các phát sinh nhỏ như bán hàng, mua hàng, vận hành được ghi trong sổ cửa hàng. Sổ chung chỉ nên nhận dữ liệu tổng hợp sau khi chốt ngày, không nhận từng giao dịch nhỏ.

## Luồng demo
1. Manager mở `/store-ledger`.
2. Chọn sổ `CUA_HANG`.
3. Ghi một khoản thu bán hàng.
4. Ghi một khoản chi mua hàng/vận hành.
5. Chọn ngày chốt.
6. Bấm `Chốt ngày`.
7. Hệ thống tạo một dòng chốt ngày, tổng hợp thu/chi/net.
8. Các phát sinh đã chốt không được sửa/hủy/xóa trực tiếp.
9. Việc đẩy tổng hợp sang sổ chung làm ở bước sau.
