# Việc 11B — Polish layout Học tập & Lịch học

## Lý do

Sau khi Việc 11 pass, tab Học tập trong hồ sơ học viên vẫn còn vấn đề UI/UX: phần lịch học bị rộng, toolbar chen ngang, dễ tạo scrollbar ngang trong modal và nhìn rối khi mở trong workspace hồ sơ.

## Phạm vi

Chỉ polish layout/style, không đổi nghiệp vụ và không đổi API.

## Đã chỉnh

- Tối ưu layout tab Học tập trong `MemberDetailModal`:
  - thêm `min-w-0` và `overflow-hidden` để không đẩy modal tạo scrollbar ngang ngoài ý muốn;
  - tổ chức lại phần thông tin học tập + lịch học theo bố cục gọn hơn;
  - sidebar thông tin học tập cố định chiều rộng ở màn lớn, lịch học dùng phần còn lại.
- Tối ưu `StudyScheduleSection`:
  - giảm chiều cao ô giờ để vừa khung hơn;
  - giảm min-width lịch tuần để ít tràn hơn;
  - toolbar tự wrap, period title truncate;
  - block lịch học gọn hơn;
  - sửa text lặp trong lịch tháng.

## Không đổi

- Không đổi dữ liệu lịch học.
- Không đổi validate giờ học.
- Không đổi TimePickerInput.
- Không đổi conflict check với DailyRoutine/Duties.

## Runtime cần test

- Mở hồ sơ học viên > tab Học tập.
- Modal không xuất hiện scrollbar ngang toàn màn hình chỉ vì lịch học.
- Lịch tuần vẫn cuộn ngang bên trong khung lịch khi cần.
- Nút Ngày/Tuần/Tháng, Hiện tại, Prev/Next, Mở rộng vẫn dùng được.
- Thêm/sửa/xóa lịch học vẫn chạy như Việc 11.
