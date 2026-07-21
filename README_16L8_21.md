# 16L8.21 — Rà soát lại bàn giao và giá mua/bán

Bản trước chưa tác động vì form học viên nằm trong `ResidentStore.tsx`, không dùng modal quản lý. Đồng thời bàn giao lọc thêm `storeShiftId`, khác nguồn dữ liệu với card Tổng thu/Tổng chi.

Áp dụng:
1. Replace `server/services/storeShiftHandoverService.ts`.
2. Thêm `client/src/lib/storePriceDefaults.ts`.
3. Chạy `python tools/apply_16L8_21.py`.
4. Chạy `pnpm check` và `pnpm dev`.

Giá mua: giá mua gần nhất (`defaultCostPrice`), fallback giá mua trung bình (`averageCostPrice`).
Giá bán: `currentSalePrice`, fallback `defaultSalePrice`; chưa có thì dùng giá mua và hiện ghi chú màu vàng.
Bàn giao: dùng toàn bộ giao dịch hợp lệ đúng cửa hàng + đúng ngày, cùng nguồn với card Tổng thu/Tổng chi.
