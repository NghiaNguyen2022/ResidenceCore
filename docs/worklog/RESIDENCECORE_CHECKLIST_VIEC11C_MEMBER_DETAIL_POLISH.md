# ResidenceCore - Việc 11C: Chuẩn hóa tab con Member Detail

## Trạng thái

- Trạng thái: Patch ready
- Phạm vi: UI/layout/style cho `MemberDetailModal` và tab Học tập.
- Không đổi API.
- Không đổi business rule.
- Không đổi flow Members/Rooms/Organization/Finance/DailyRoutine đã pass.

## Mục tiêu

Chuẩn hóa 6 tab con trong hồ sơ học viên theo hướng:

- đủ thông tin nghiệp vụ;
- mỗi tab có tiêu đề và hành động chính rõ;
- layout gọn hơn, ít bị kéo ngang;
- thống nhất style card/section;
- tab Học tập & lịch học không làm modal bị quá rộng;
- giữ DatePicker/TimePicker theo rule đã chốt.

## Đã rà soát theo tab

### 1. Tổng quan

- Giữ khối tóm tắt đầu tab.
- Bổ sung mini stat Tài khoản.
- Chuyển mini stat sang 4 ô gọn.
- Card thông tin cá nhân giữ đầy đủ field cần thiết.
- Card lưu trú, liên hệ chính, tổ chức giữ ở cột phụ.

### 2. Liên hệ

- Giữ `ParentsSection`.
- Header gọn lại, mô tả ngắn hơn.
- Nút thêm liên hệ giữ làm hành động chính.

### 3. Phòng ở

- Header gọn lại.
- Giữ thông tin lưu trú và thao tác trạng thái.
- Không đổi rule gán/chuyển/trả phòng.

### 4. Học tập

- Giữ `EducationInfoSection`.
- Giữ `StudyScheduleSection`.
- Bố cục cột trái/cột phải chỉ áp dụng từ màn rộng.
- Giảm mô tả dài.
- Lịch học được bọc trong khung riêng, tránh kéo ngang modal cha.
- Toolbar lịch học gọn hơn và dễ wrap.

### 5. Tổ chức

- Header gọn lại.
- Giữ Unit/Role display hiện tại.
- Không đổi rule Tổ trưởng/Trưởng ban.
- Không đụng OrgChart module Organization.

### 6. Tài khoản

- Header gọn lại.
- Giữ trạng thái tài khoản và flow tạo tài khoản.

## File thay đổi

- `client/src/components/members/MemberDetailModal.tsx`
- `client/src/components/members/EducationInfoSection.tsx`
- `client/src/components/members/StudyScheduleSection.tsx`

## Runtime checklist sau khi apply

- [ ] `pnpm check` pass.
- [ ] `pnpm test` pass.
- [ ] `pnpm build` pass.
- [ ] Mở hồ sơ học viên không lỗi JSX.
- [ ] Chuyển qua đủ 6 tab không lỗi.
- [ ] Modal không bị scrollbar ngang ngoài ý muốn.
- [ ] Tab Học tập hiển thị đủ thông tin học tập và lịch học.
- [ ] Thêm/sửa/xóa lịch học vẫn hoạt động.
- [ ] TimePicker vẫn hoạt động trong form lịch học.
- [ ] Học viên đã rời/ngừng vẫn khóa thao tác đúng.
