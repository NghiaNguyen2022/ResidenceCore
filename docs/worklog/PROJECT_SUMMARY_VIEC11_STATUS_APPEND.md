# PROJECT_SUMMARY append - Việc 11

## Việc 11 - Học tập / Lịch học

Trạng thái: Patch ready, chờ pass.

### Đã review

- Tab Học tập trong chi tiết học viên.
- Thông tin học tập cơ bản.
- Lịch học theo tuần.
- TimePicker cho giờ học.
- Backend member education/study schedule APIs.
- DB tables `residentEducation` và `residentStudySchedules`.

### Patch 11A

- Guard manager cho query học tập/lịch học trong `membersRouter`.
- Chặn cập nhật học tập/lịch học nếu học viên đã inactive/transferred_out/left.
- Validate giờ học đúng định dạng HH:mm ở service/db.
- Không đổi UI/UX chính, chỉ vá bảo vệ backend.

### Runtime cần xác nhận

- Tạo/sửa/xóa lịch học.
- Chặn trùng giờ trong cùng ngày.
- Chặn giờ kết thúc <= giờ bắt đầu.
- DailyRoutine conflict với lịch học còn hoạt động.
- check/test/build pass.
