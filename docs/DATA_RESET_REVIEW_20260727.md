# Đề xuất reset dữ liệu để test chức năng — 27/07/2026

> Trạng thái: **CHỜ NGƯỜI DÙNG XÁC NHẬN — CHƯA XÓA DỮ LIỆU**

## Quy ước

- **GIỮ**: không xóa và không thay đổi.
- **XÓA PHÁT SINH**: giữ danh mục/cấu hình, xóa dữ liệu vận hành và liên kết đã tạo.
- **XÓA SẠCH**: xóa toàn bộ dữ liệu trong nhóm để test tạo mới từ đầu.
- Trước khi xóa thật phải backup database và ghi nhận số dòng trước/sau.

## 1. Tài khoản và phân quyền

### GIỮ

- [ ] Tài khoản quản lý lưu xá trong `users` (role `manager`).
- [ ] `roles`.
- [ ] `rolePermissions`.
- [ ] Liên kết `userRoles` của tài khoản quản lý.
- [ ] Cấu hình `appSettings`, `moduleDisplayModes`.

### XÓA

- [ ] Tài khoản portal của học viên/resident trong `users`.
- [ ] `userRoles` của các tài khoản resident bị xóa.
- [ ] Phiên đăng nhập resident trong `sessions`.

### Cần xác nhận

- [ ] Giữ **tất cả** user manager hay chỉ giữ user manager dùng để test?
- [ ] Có xóa session của manager để bắt buộc đăng nhập lại hay không?

## 2. Phân cấp và cơ cấu tổ chức

### GIỮ

- [ ] `organizationRoles` — danh mục chức vụ.
- [ ] `organizationTerms` — nhiệm kỳ.
- [ ] `organizationUnits` — Tổ/Ban/cơ cấu phân cấp.

### XÓA PHÁT SINH

- [ ] `organizationAssignments` — người đang/đã được bổ nhiệm.
- [ ] `organizationUnitMembers` — thành viên được gán vào Tổ/Ban.

Kết quả mong muốn: còn nguyên khung cơ cấu, nhiệm kỳ và chức vụ; không còn người được assign.

## 3. Học viên và liên hệ

### XÓA SẠCH

- [ ] `residents`.
- [ ] `parents`.
- [ ] `residentEducation`.
- [ ] `residentAcademicInfo`.
- [ ] `residentStudySchedules`.
- [ ] `scheduleConflicts` liên quan học viên.
- [ ] Tài khoản portal resident tương ứng.

Kết quả mong muốn: danh sách học viên, phụ huynh và lịch học trống hoàn toàn.

## 4. Phòng và phân phòng

### XÓA SẠCH

- [ ] `roomAssignments`.
- [ ] `roomAssignmentHistory`.
- [ ] `roomLeaders`.
- [ ] `rooms`.

### Cần xác nhận

- [ ] `groups` (khu/tổ phòng): đề xuất **GIỮ** vì là danh mục phân cấp phòng.
- [ ] Nếu muốn test tạo khu/tổ phòng từ đầu thì chuyển `groups` sang **XÓA SẠCH**.

## 5. Khung công tác, công tác mẫu và phát sinh công tác

### GIỮ

- [ ] `dutyTemplates` — công tác mẫu.
- [ ] `dutyConfigs` — khung/cấu hình công tác.
- [ ] `dutyChecklists` — checklist thuộc khung công tác.
- [ ] `dutySchedules` — quy luật/lịch cấu hình của công tác.

### XÓA PHÁT SINH

- [ ] `dutyEvaluations`.
- [ ] `dutyAssignments`.
- [ ] `scheduleConflicts`.
- [ ] Mọi phân công Trực cửa hàng liên kết từ công tác.

Kết quả mong muốn: vẫn chọn được mẫu/khung công tác, nhưng không còn công tác đã phân cho học viên.

## 6. Sinh hoạt hằng ngày

### Đề xuất GIỮ CẤU HÌNH

- [ ] `dailyRoutineTemplates`.
- [ ] `dailyRoutineTemplateItems`.

### XÓA PHÁT SINH

- [ ] `dailyRoutines`/các lịch sinh hoạt đã tạo theo ngày.

### Cần xác nhận

- [ ] Có giữ mẫu lịch sinh hoạt và các mục trong mẫu hay xóa để test tạo mẫu từ đầu?

## 7. Điểm danh

### Đề xuất GIỮ CẤU HÌNH

- [ ] `attendanceSchedule` — lịch/khung điểm danh.

### XÓA PHÁT SINH

- [ ] `attendance` — toàn bộ kết quả điểm danh.

### Cần xác nhận

- [ ] Giữ lịch điểm danh hay xóa cả `attendanceSchedule` để test CRUD lịch từ đầu?

## 8. Tài chính học viên và tài chính lưu xá

### Đề xuất GIỮ DANH MỤC

- [ ] `finance_fee_types`.
- [ ] `residentFeeTypes`.
- [ ] `feeTypes`.
- [ ] `expenseCategories`.

### XÓA PHÁT SINH

- [ ] `finance_payments`.
- [ ] `finance_charges`.
- [ ] `finance_transactions` không phải nguồn cửa hàng.
- [ ] `payments`, `debts`.
- [ ] `residentFeeAssignments`.
- [ ] `feeChangeHistory`.
- [ ] `additionalFees`.
- [ ] `borrowedFees`.
- [ ] `revenuePayments`, `revenueHistory`, `revenues`.
- [ ] `expenseHistory`, `expenses`.

### Cần xác nhận

- [ ] Giữ danh mục loại phí hay xóa để test tạo loại phí từ đầu?
- [ ] Có xóa toàn bộ thu/chi không gắn học viên hay chỉ phần dữ liệu test?

## 9. Cửa hàng

### Đề xuất GIỮ DANH MỤC

- [ ] `storeLedgers` — giữ một cửa hàng/sổ chính.
- [ ] `storeProducts`.
- [ ] `storeProductCostHistories`.
- [ ] `storeProductSalePriceHistories`.
- [ ] Ảnh sản phẩm.

### XÓA PHÁT SINH

- [ ] `storePreorderLines`, `storePreorders`.
- [ ] `storeDocumentLines`, `storeDocuments`.
- [ ] `storeStockMovements`.
- [ ] `storeShiftHandovers`.
- [ ] `storeDutyAccessSessions`.
- [ ] `storeDutyMembers`.
- [ ] `storeShifts`.
- [ ] `storeDutyAssignments`.
- [ ] `storeDailyClosings`.
- [ ] `storeLedgerTransactions`.
- [ ] Các dòng `finance_transactions` có nguồn từ cửa hàng.

### Cần xác nhận

- [ ] Giữ sản phẩm và lịch sử giá hay xóa sạch để test nhập sản phẩm từ đầu?
- [ ] Tồn kho sản phẩm sau reset phải về `0` hay giữ tồn hiện tại?
- [ ] Giữ một `storeLedger` chính hay xóa cả sổ để test tạo mới?

## 10. Hoạt động, thông báo và nội quy

### Đề xuất XÓA PHÁT SINH

- [ ] `activityParticipants`.
- [ ] `activities`.
- [ ] `notifications`.
- [ ] Dữ liệu nhắc nhở/vi phạm nếu các bảng thực tế đã tồn tại.

### Cần xác nhận

- [ ] Có giữ hoạt động mẫu nào để kiểm tra portal hay xóa sạch?
- [ ] Có giữ nội quy hiện tại như dữ liệu danh mục hay xóa để test CRUD?

## 11. Câu lạc bộ và kỹ năng

### Đề xuất XÓA SẠCH ĐỂ TEST MODULE MỚI

- [ ] `clubs`.
- [ ] `skills`.
- [ ] Các bảng lớp kỹ năng/kết quả kỹ năng sau khi migration được bổ sung.

### Cần xác nhận

- [ ] Xóa sạch để test tạo mới hay giữ danh mục mẫu?

## 12. Log và dữ liệu kỹ thuật

### Đề xuất XÓA

- [ ] `cronJobLogs`.
- [ ] Session hết hạn.

### GIỮ

- [ ] Migration history.
- [ ] Cấu hình hệ thống.
- [ ] Role/permission.

## 13. Thứ tự thực hiện an toàn sau khi được xác nhận

1. [ ] Backup database có timestamp.
2. [ ] Ghi số dòng từng bảng trước reset.
3. [ ] Xác định chính xác ID/email/username của user manager phải giữ.
4. [ ] Xóa bảng con/phát sinh cửa hàng, tài chính, điểm danh và công tác.
5. [ ] Xóa liên kết tổ chức và phân phòng.
6. [ ] Xóa dữ liệu học tập, phụ huynh và học viên.
7. [ ] Xóa tài khoản resident và role/session liên quan.
8. [ ] Xóa phòng và các danh mục được người dùng xác nhận xóa.
9. [ ] Reset `AUTO_INCREMENT` cho các bảng test nếu được xác nhận.
10. [ ] Kiểm tra user manager vẫn đăng nhập được.
11. [ ] Kiểm tra cơ cấu tổ chức và khung công tác vẫn còn.
12. [ ] Xuất báo cáo số dòng sau reset.

## 14. Xác nhận tổng

- [ ] Tôi xác nhận **GIỮ** user manager.
- [ ] Tôi xác nhận **GIỮ** vai trò/quyền.
- [ ] Tôi xác nhận **GIỮ** cơ cấu/phân cấp, nhiệm kỳ và chức vụ.
- [ ] Tôi xác nhận **XÓA** người được assign trong cơ cấu.
- [ ] Tôi xác nhận **GIỮ** khung công tác, công tác mẫu và checklist mẫu.
- [ ] Tôi xác nhận **XÓA** công tác/phân công/đánh giá chi tiết.
- [ ] Tôi xác nhận **XÓA SẠCH** học viên, phụ huynh, lịch học và phòng.
- [ ] Tôi đã trả lời các mục “Cần xác nhận” về phòng, sinh hoạt, điểm danh, tài chính, cửa hàng, hoạt động, CLB và kỹ năng.
- [ ] Tôi cho phép tạo backup và chạy script reset.
