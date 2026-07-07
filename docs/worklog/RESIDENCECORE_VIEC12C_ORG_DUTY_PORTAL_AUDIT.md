# ResidenceCore - Việc 12C Audit

## Mục tiêu

Audit/test luồng demo xuyên suốt:

```txt
Tổ/Ban → Bổ nhiệm → Công tác → Portal học viên → Portal theo chức vụ
```

## Kết quả audit nhanh

Nền hiện tại sau 12A/12B đã ổn các phần:

- Organization đã có Tổ/Ban, bổ nhiệm, OrgChart và modal error đúng chỗ.
- Duties đã có phân công theo `resident`, `room`, `team`, `committee`.
- Resident portal service đã có `getTodayOverview`, `getMyDutyScope`, `completeTodayDuty`.
- Navigation đã có nhóm menu theo chức vụ: Tổng quan, Tổ, Ban, công tác theo vai trò.

## Demo blocker phát hiện

### 1. Portal học viên thường chưa gom công tác theo phòng/tổ/ban

`getTodayOverview` trước đó chỉ lấy công tác trực tiếp theo học viên qua `getAssignmentsByResident`.

Vì vậy nếu manager phân công công tác cho:

- Phòng
- Tổ
- Ban

thì học viên thường có thể không thấy công tác liên quan trong portal hôm nay, dù về nghiệp vụ đây là công tác của phạm vi mình thuộc về.

### 2. Hoàn thành công tác chỉ cho assignment trực tiếp

`completeTodayDuty` trước đó chỉ cho hoàn thành công tác nếu assignment có `residentId` hoặc `assignedToType = resident` trỏ đúng học viên.

Vì vậy công tác theo phòng/tổ/ban không thể được hoàn thành từ portal học viên.

### 3. UI MyDuties chưa phân biệt công tác cá nhân/phòng/tổ/ban

Danh sách công tác chưa có nhãn phạm vi nên khi đã gom thêm các loại assignment, cần hiện rõ:

- Cá nhân
- Phòng hiện tại
- Tổ: tên tổ
- Ban: tên ban

## Patch 12C

Patch 12C xử lý đúng phạm vi demo lite, không đổi schema và không đổi business rule phân công.

File ảnh hưởng:

```txt
server/services/residentPortalAccessService.ts
client/src/pages/MyDuties.tsx
```

Nội dung chính:

- Thêm helper xác định duty target của học viên:
  - cá nhân;
  - phòng hiện tại;
  - tổ đang là thành viên;
  - ban đang là thành viên.
- `getTodayOverview` lấy công tác hôm nay theo tất cả target hợp lệ của học viên.
- Dedupe assignment theo id để tránh lặp nếu một công tác bị query qua nhiều scope.
- Gắn nhãn `assignmentScopeLabel` để UI biết công tác thuộc phạm vi nào.
- Cho phép học viên hoàn thành công tác hôm nay nếu assignment thuộc cá nhân/phòng/tổ/ban của mình.
- MyDuties hiển thị nhãn phạm vi: `Cá nhân`, `Phòng hiện tại`, `Tổ: ...`, `Ban: ...`.

## Không thay đổi

- Không đổi OrgChart.
- Không đổi rule bổ nhiệm.
- Không đổi router duties manager flow.
- Không đổi schema.
- Không đổi conflict lịch học/công tác.
- Không mở rộng module notification/activities.

## Runtime test sau patch

```txt
[ ] Manager phân công công tác cho 1 học viên.
[ ] Học viên đó login thấy công tác trên portal hôm nay.
[ ] Học viên đánh dấu hoàn thành được.
[ ] Manager phân công công tác cho Phòng.
[ ] Học viên đang ở phòng đó login thấy công tác với nhãn Phòng hiện tại.
[ ] Học viên đánh dấu hoàn thành được.
[ ] Manager phân công công tác cho Tổ.
[ ] Thành viên tổ login thấy công tác với nhãn Tổ.
[ ] Tổ trưởng login thấy thêm scope công tác tổ ở portal theo chức vụ.
[ ] Manager phân công công tác cho Ban.
[ ] Thành viên ban login thấy công tác với nhãn Ban.
[ ] Trưởng ban login thấy thêm scope công tác ban ở portal theo chức vụ.
[ ] Học viên ngoài phòng/tổ/ban không thấy assignment không thuộc phạm vi mình.
```
