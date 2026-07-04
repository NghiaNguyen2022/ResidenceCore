## Update — Việc 11D Member Detail UX Polish v2

Trạng thái: đang chờ user apply/test.

Bối cảnh: Patch 11C chưa đạt vì tab Học tập bị cảm giác revert về layout cũ, các tab còn lại chưa hài hòa. Việc 11D làm lại từ đúng 3 file hiện tại do user gửi sau 11C.

Thay đổi:
- Chuẩn hóa shell tab con trong MemberDetailModal bằng `TabPanel` dùng chung.
- Giữ tab Học tập theo layout 2 cột: thông tin học tập + lịch học.
- Bỏ `AppSection` wrapper trong StudyScheduleSection để tránh lồng card cũ và đồng bộ với tab shell mới.
- Giảm min-width lịch tuần, giữ scroll nội bộ trong khung lịch.
- Đồng bộ card EducationInfoSection theo tone trắng/kem/vàng nhẹ.

Bảo vệ:
- Không đổi backend/API/business logic.
- Không đổi validation lịch học.
- Không bỏ TimePicker.
- Không revert DatePicker portal fix.
