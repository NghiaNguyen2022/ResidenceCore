# ResidenceCore / App Lưu Xá
# Kế hoạch đơn giản hóa giao diện: Simple Mode & Student View

**Phiên bản:** 1.0  
**Ngày cập nhật:** 02/06/2026  
**Phạm vi:** Điều chỉnh trải nghiệm sử dụng theo hướng đơn giản, dễ hiểu, phù hợp cho cả người quản lý và học viên lưu trú.

---

## 1. Bối cảnh yêu cầu

Khách hàng phản hồi rằng một số màn hình hiện đang có nhiều mục, nhiều trường thông tin và khá chi tiết, khiến người dùng cảm thấy rối khi sử dụng hằng ngày.

Ví dụ với **Công tác / Trực nhật**, học viên chỉ cần biết các thông tin cơ bản:

- Ngày nào làm?
- Làm công tác gì?
- Làm ở đâu?
- Ai / nhóm nào phụ trách?
- Đã hoàn thành hay chưa hoàn thành?

Ngoài ra, khách hàng cũng mong muốn học viên có thể đăng nhập để xem các công việc hằng ngày, vì mọi công tác liên quan đến học viên cần được công khai đủ rõ để các em ý thức thực hiện.

Tuy nhiên, các phần quản lý nội bộ như hồ sơ học viên, nhân sự, tài chính, phụ huynh, báo cáo quản trị vẫn chỉ nên dành cho các sơ hoặc người quản lý.

---

## 2. Mục tiêu điều chỉnh

- Giao diện học viên thật đơn giản, dễ xem mỗi ngày.
- Các sơ / quản lý vẫn có giao diện quản trị đầy đủ khi cần.
- Có thể cấu hình chế độ **Simple** hoặc **Detailed** khi setup hệ thống ban đầu.
- Không làm mất logic hiện có của các module đã làm.
- Mỗi module có thể dần hỗ trợ hai cách hiển thị:
  - **Simple View:** dùng nhanh, ít trường, dễ hiểu.
  - **Detailed View:** quản trị chi tiết, có thêm trường nâng cao.

---

## 3. Nguyên tắc thiết kế mới

### 3.1. Một hệ thống, hai lớp giao diện

#### A. Giao diện cho học viên

Dùng để xem nhanh những việc liên quan hằng ngày:

- Hôm nay có lịch gì?
- Có công tác nào cần làm?
- Có lịch học nào?
- Có phụng vụ / kinh tối không?
- Có sự kiện hoặc thông báo nào?
- Công tác của mình đã hoàn thành chưa?

Giao diện này cần tối giản, ưu tiên card ngắn, trạng thái rõ ràng, ít thao tác.

#### B. Giao diện cho quản lý / các sơ

Dùng để nhập liệu, cấu hình, phân công, kiểm tra, báo cáo:

- Quản lý học viên.
- Quản lý phòng ở.
- Quản lý phụ huynh.
- Quản lý công tác / trực nhật.
- Quản lý học vụ.
- Quản lý tài chính.
- Báo cáo.
- Thiết lập hệ thống.

Giao diện này có thể chi tiết hơn, nhưng vẫn nên có chế độ hiển thị gọn mặc định.


---

## 4. Phân nhóm người dùng

### 4.1. Học viên

Học viên chỉ nên thấy những nội dung liên quan đến bản thân hoặc sinh hoạt chung.

#### Học viên được xem

- Hôm nay của tôi.
- Công tác của tôi.
- Lịch sinh hoạt.
- Lịch học của tôi.
- Lịch phụng vụ / kinh tối.
- Sự kiện.
- Thông báo.
- Nội quy.
- Kết quả cá nhân nếu hệ thống cho phép.

#### Học viên có thể thao tác

- Xem chi tiết công tác.
- Đánh dấu hoàn thành công tác nếu được bật quyền.
- Gửi ghi chú ngắn nếu có vấn đề.
- Xem lịch và thông báo.

#### Học viên không nên thấy

- Quản lý học viên.
- Quản lý phụ huynh.
- Tài chính tổng quan.
- Cơ cấu tổ chức chi tiết.
- Báo cáo quản trị.
- Thiết lập hệ thống.
- Dữ liệu nội bộ.

### 4.2. Tổ trưởng / Trưởng ban / Người phụ trách nhóm

Nhóm này có quyền trung gian.

#### Được xem và cập nhật

- Công tác của nhóm phụ trách.
- Điểm danh nhóm được giao.
- Lịch sinh hoạt.
- Phụng vụ / sự kiện.
- Ghi chú kết quả công tác.
- Theo dõi tình trạng hoàn thành của nhóm.

#### Không nên thấy

- Tài chính tổng quan.
- Báo cáo nhạy cảm.
- Thông tin cá nhân nhạy cảm của học viên nếu không được phân quyền.

### 4.3. Các sơ / Quản lý

Nhóm này có quyền quản trị cao nhất.

#### Được quản lý

- Học viên.
- Phòng ở.
- Phụ huynh.
- Tài chính.
- Tổ chức lưu xá.
- Sinh hoạt & Đời sống.
- Học vụ & Phát triển.
- Báo cáo.
- Thiết lập hệ thống.
- Cấu hình Simple / Detailed Mode.
- Cấu hình phân quyền.


---

## 5. Cấu hình Simple / Detailed Mode

### 5.1. Cấu hình toàn hệ thống

Khi setup ban đầu, hệ thống nên có tùy chọn:

```txt
System Display Mode:
- Simple
- Detailed
```

#### Simple Mode

Dành cho lưu xá muốn dùng nhanh, ít nhập liệu, ít trường thông tin.

Đặc điểm:

- Ít tab.
- Ít field.
- Ít thống kê.
- Ít nút thao tác.
- Mỗi màn hình chỉ giữ thông tin cần thiết.
- Phù hợp cho học viên và người dùng phổ thông.

#### Detailed Mode

Dành cho lưu xá muốn quản trị kỹ hơn.

Đặc điểm:

- Có thêm field nâng cao.
- Có checklist.
- Có phân công tự động.
- Có cấu hình lặp lại.
- Có người xác nhận.
- Có báo cáo chi tiết.
- Phù hợp cho quản lý / các sơ.

### 5.2. Cấu hình theo module

Ngoài cấu hình toàn hệ thống, từng module có thể có chế độ riêng:

```txt
Module Display Mode:
- Công tác / Trực nhật: Simple hoặc Detailed
- Lịch sinh hoạt: Simple hoặc Detailed
- Điểm danh: Simple hoặc Detailed
- Lịch học: Simple hoặc Detailed
- Phụng vụ: Simple hoặc Detailed
- Hoạt động / Sự kiện: Simple hoặc Detailed
- Kỹ năng: Simple hoặc Detailed
- Tài chính: thường là Detailed
- Quản lý học viên: thường là Detailed
```


---

## 6. Màn hình cần tạo mới

## 6.1. MyToday.tsx — Hôm nay của tôi

### Mục tiêu

Đây là màn hình chính cho học viên khi mở app. Màn hình trả lời câu hỏi:

> Hôm nay tôi cần xem gì và làm gì?

### Route đề xuất

```txt
/my-today
```

### Menu đề xuất

```txt
Trang của tôi > Hôm nay của tôi
```

### Đối tượng sử dụng

- Học viên.
- Có thể cho tổ trưởng xem thêm công việc của nhóm nếu cần.

### Nội dung hiển thị

- Lịch sinh hoạt hôm nay.
- Công tác của tôi hôm nay.
- Lịch học của tôi hôm nay.
- Phụng vụ / kinh tối hôm nay.
- Sự kiện / thông báo hôm nay.
- Nội quy hoặc nhắc nhở quan trọng nếu có.

### UI đề xuất

Dạng card ngắn:

```txt
Hôm nay, Thứ Ba 02/06

[ Lịch sinh hoạt ]
06:00  Thức dậy
06:30  Cầu nguyện sáng
19:30  Giờ học tối
21:00  Kinh tối

[ Công tác của tôi ]
☐ Vệ sinh phòng học chung
   Nơi làm: Phòng học chung

☑ Chuẩn bị nhà nguyện
   Nơi làm: Nhà nguyện

[ Lịch học ]
07:30 - 11:00  Lập trình cơ bản
13:00 - 16:30  Kinh tế vi mô

[ Thông báo ]
Tối nay có sinh hoạt chung lúc 20:00
```

### Hành động cơ bản

- Xem chi tiết.
- Đánh dấu hoàn thành.
- Gửi ghi chú.

---

## 6.2. MyDuties.tsx — Công tác của tôi

### Mục tiêu

Cho học viên xem các công tác được giao cho bản thân hoặc nhóm của mình.

### Route đề xuất

```txt
/my-duties
```

### Menu đề xuất

```txt
Trang của tôi > Công tác của tôi
```

### Thông tin hiển thị basic

- Ngày.
- Tên công tác.
- Nơi làm.
- Người / nhóm phụ trách.
- Trạng thái.
- Ghi chú ngắn.

### Trạng thái

- Chưa hoàn thành.
- Đã hoàn thành.
- Có vấn đề.

### Hành động

- Xem chi tiết.
- Đánh dấu hoàn thành.
- Gửi ghi chú.

### UI mô phỏng

```txt
Công tác hôm nay

1. Vệ sinh phòng học chung
   Ngày: 02/06/2026
   Nơi làm: Phòng học chung
   Phụ trách: Tổ 1
   Trạng thái: Chưa hoàn thành

2. Chuẩn bị nhà nguyện
   Ngày: 02/06/2026
   Nơi làm: Nhà nguyện
   Phụ trách: Ban phụng vụ
   Trạng thái: Đã hoàn thành
```


---

## 7. Các module cần rút gọn theo Basic View

## 7.1. Công tác / Trực nhật

### Basic View

Chỉ cần:

- Ngày.
- Tên công tác.
- Nơi làm.
- Người / nhóm phụ trách.
- Trạng thái.
- Ghi chú ngắn.

### Detailed View

Có thể bật thêm:

- Loại công tác.
- Giờ bắt đầu / kết thúc.
- Checklist.
- Lặp lại định kỳ.
- Người xác nhận.
- Phân công tự động.
- Kiểm tra trùng lịch học.
- Ghi nhận kết quả.

### Màn hình quản lý basic

```txt
Công tác / Trực nhật

Bộ lọc:
Ngày | Trạng thái | Nhóm phụ trách

Bảng:
Ngày        Công tác                 Nơi làm          Phụ trách     Trạng thái
02/06       Vệ sinh phòng học        Phòng học        Tổ 1          Chưa hoàn thành
02/06       Chuẩn bị nhà nguyện      Nhà nguyện       Ban PV        Đã hoàn thành
03/06       Trực nhà ăn              Nhà ăn           Tổ 2          Chưa hoàn thành
```

## 7.2. Lịch sinh hoạt

### Basic View

- Giờ.
- Hoạt động.
- Địa điểm.
- Bắt buộc / không bắt buộc.

### Detailed View

- Nhóm áp dụng.
- Người phụ trách.
- Ghi chú.
- Lặp lại.
- Trạng thái áp dụng.

## 7.3. Điểm danh

### Basic View

- Ngày.
- Buổi / hoạt động.
- Học viên.
- Có mặt.
- Vắng.
- Trễ.
- Có phép.
- Ghi chú ngắn.

### Detailed View

- Lý do.
- Người ghi nhận.
- Lịch liên quan.
- Báo cáo vắng / trễ.
- Thống kê chi tiết.

## 7.4. Lịch học

### Basic View

- Học viên.
- Ngày trong tuần.
- Giờ học.
- Môn / nội dung học.
- Trường.
- Địa điểm.

### Detailed View

- Học kỳ.
- Hình thức học.
- Trạng thái.
- Ghi chú.
- Dùng để kiểm tra trùng công tác.

## 7.5. Phụng vụ

### Basic View

- Ngày.
- Giờ.
- Nội dung.
- Địa điểm.
- Nhóm phụ trách.

### Detailed View

- Người chủ sự.
- Vai trò phụng vụ.
- Điểm danh.
- Phân công.
- Ghi chú.

## 7.6. Hoạt động / Sự kiện

### Basic View

- Ngày.
- Tên hoạt động.
- Địa điểm.
- Phụ trách.
- Trạng thái.

### Detailed View

- Kế hoạch.
- Ngân sách.
- Số người tham gia.
- Nội dung chi tiết.
- Báo cáo sau sự kiện.

## 7.7. Kỹ năng

### Basic View

- Tên kỹ năng.
- Lớp / buổi học.
- Ngày học.
- Học viên.
- Đạt / Chưa đạt / Cần rèn thêm.

### Detailed View

- Tiêu chí đánh giá.
- Điểm.
- Minh chứng.
- Nhận xét.
- Đề xuất tiếp theo.


---

## 8. Cấu hình field theo vai trò

Cần thiết kế cơ chế cấu hình field:

```txt
Field Visibility:
- Hiển thị cho tất cả
- Chỉ quản lý
- Chỉ học viên liên quan
- Ẩn
```

Ví dụ với module **Công tác / Trực nhật**:

```txt
Tên công tác          Hiển thị cho tất cả
Ngày                 Hiển thị cho tất cả
Nơi làm              Hiển thị cho tất cả
Trạng thái           Hiển thị cho tất cả
Ghi chú ngắn         Hiển thị cho tất cả
Người kiểm tra       Chỉ quản lý
Checklist chi tiết   Chỉ quản lý / Detailed Mode
Phân công tự động    Chỉ quản lý
```

---

## 9. Đề xuất menu sau khi đơn giản hóa

## 9.1. Menu cho học viên

```txt
Trang của tôi
- Hôm nay của tôi
- Công tác của tôi
- Lịch sinh hoạt
- Lịch học
- Phụng vụ
- Sự kiện
- Thông báo
- Nội quy
```

## 9.2. Menu cho quản lý

Giữ menu hiện tại nhưng có thể rút gọn tên:

```txt
Dashboard
Quản lý lưu trú
Tổ chức lưu xá
Sinh hoạt & Đời sống
Học vụ & Phát triển
Tài chính
Báo cáo & Thiết lập
```


---

## 10. Yêu cầu chức năng

## 10.1. Yêu cầu chung

- Hệ thống phải hỗ trợ chế độ Simple / Detailed.
- Hệ thống phải hỗ trợ menu theo vai trò.
- Học viên chỉ thấy chức năng phù hợp.
- Quản lý vẫn có thể vào các màn hình chi tiết.
- Mỗi màn hình operational cần ưu tiên bản simple trước.
- Không hiển thị ghi chú kỹ thuật trên UI người dùng cuối.
- Không dùng từ như "mock", "backend", "database", "phase sau" trên giao diện.

## 10.2. Yêu cầu cho học viên

- Có màn hình "Hôm nay của tôi".
- Có màn hình "Công tác của tôi".
- Có thể xem lịch sinh hoạt.
- Có thể xem lịch học.
- Có thể xem phụng vụ.
- Có thể xem sự kiện / thông báo.
- Có thể xem nội quy.
- Có thể đánh dấu hoàn thành công tác nếu được bật quyền.
- Có thể gửi ghi chú ngắn khi công tác có vấn đề.

## 10.3. Yêu cầu cho quản lý

- Có thể cấu hình Simple / Detailed Mode.
- Có thể phân quyền menu theo vai trò.
- Có thể tạo / sửa / phân công công tác.
- Có thể xem trạng thái hoàn thành.
- Có thể xem báo cáo.
- Có thể bật hoặc tắt trường nâng cao.
- Có thể cấu hình field hiển thị theo vai trò.


---

## 11. Checklist triển khai code

## Bước 1 — Thêm cấu hình hiển thị

```txt
⏳ Tạo type DisplayMode = 'simple' | 'detailed'
⏳ Tạo cấu hình globalDisplayMode
⏳ Tạo moduleDisplayModes
⏳ Tạo helper useDisplayMode(moduleKey)
⏳ Tạm thời có thể hard-code simple/detailed trước
```

## Bước 2 — Tạo Student Layout

```txt
⏳ Tạo StudentLayout.tsx
⏳ Tạo menu riêng cho học viên
⏳ Tạo header đơn giản
⏳ Ẩn các menu quản trị
⏳ Đảm bảo giao diện mobile-first
```

## Bước 3 — Tạo MyToday.tsx

```txt
⏳ Tạo client/src/pages/MyToday.tsx
⏳ Gồm card Lịch sinh hoạt hôm nay
⏳ Gồm card Công tác của tôi
⏳ Gồm card Lịch học của tôi
⏳ Gồm card Phụng vụ / Kinh tối
⏳ Gồm card Thông báo
⏳ Có trạng thái rõ ràng
⏳ Có nút xem chi tiết
```

## Bước 4 — Tạo MyDuties.tsx

```txt
⏳ Tạo client/src/pages/MyDuties.tsx
⏳ Danh sách công tác dạng đơn giản
⏳ Chi tiết công tác dạng đơn giản
⏳ Nút đánh dấu hoàn thành
⏳ Nút gửi ghi chú
⏳ Lọc theo hôm nay / tuần này / đã hoàn thành
```

## Bước 5 — Rút gọn Duties.tsx

```txt
⏳ Giữ logic DB/tRPC hiện có
⏳ Mặc định hiển thị bảng đơn giản
⏳ Thêm nút "Xem chi tiết"
⏳ Ẩn các trường nâng cao vào form mở rộng
⏳ Không làm màn hình quá dài
⏳ Giữ chia công tác tự động nhưng đưa vào khu vực quản lý
```

## Bước 6 — Áp dụng Simple Mode cho các module khác

```txt
⏳ DailyRoutine.tsx
⏳ Attendance.tsx
⏳ Schedule.tsx
⏳ LiturgySchedule.tsx
⏳ Activities.tsx
⏳ SkillClasses.tsx
⏳ SkillResults.tsx
```

## Bước 7 — Phân quyền

```txt
⏳ Xác định role: admin, manager, group_leader, student
⏳ Tạo menu theo role
⏳ Ẩn route không được phép
⏳ Tạo guard cơ bản cho route
⏳ Sau này kết nối permission DB
```

## Bước 8 — Cấu hình field

```txt
⏳ Tạo field visibility config
⏳ Tạo helper isFieldVisible(moduleKey, fieldKey, role)
⏳ Tạo helper isActionVisible(moduleKey, actionKey, role)
⏳ Áp dụng trước cho Duties
⏳ Sau đó áp dụng cho DailyRoutine, Attendance, Schedule
```


---

## 12. Ưu tiên triển khai

## Ưu tiên 1

```txt
⏳ MyToday.tsx
⏳ StudentLayout.tsx
⏳ MyDuties.tsx
```

## Ưu tiên 2

```txt
⏳ Simple/Detailed config helper
⏳ Rút gọn Duties.tsx
⏳ Rút gọn DailyRoutine.tsx
⏳ Rút gọn Schedule.tsx
```

## Ưu tiên 3

```txt
⏳ Role-based menu
⏳ Field visibility config
⏳ Permission guard
```

## Ưu tiên 4

```txt
⏳ Áp dụng Simple Mode toàn hệ thống
⏳ Setup wizard chọn Simple/Detailed khi triển khai ban đầu
```

---

## 13. Đầu ra mong muốn

Sau khi hoàn thành phần này, ứng dụng cần đạt:

- Học viên có thể mở app mỗi ngày và biết hôm nay cần làm gì.
- Giao diện học viên cực kỳ đơn giản.
- Quản lý vẫn có màn hình chi tiết khi cần.
- Mỗi module có thể chạy Simple hoặc Detailed.
- App linh hoạt cho nhiều lưu xá khác nhau.
- Không làm mất logic hiện có.
- Không biến ứng dụng thành quá phức tạp với người dùng phổ thông.
- Công tác, lịch sinh hoạt, lịch học, phụng vụ, sự kiện đều có bản basic để dùng được ngay.

---

## 14. Mô tả ngắn để trình bày với khách hàng

Ứng dụng sẽ được điều chỉnh theo hướng đơn giản hơn cho người dùng hằng ngày. Học viên sẽ có một giao diện riêng để xem lịch sinh hoạt, công tác, lịch học và thông báo cần thực hiện mỗi ngày. Các phần quản lý chi tiết như hồ sơ học viên, tài chính, phụ huynh, cơ cấu tổ chức và báo cáo sẽ chỉ dành cho người quản lý hoặc các sơ.

Để ứng dụng linh hoạt, hệ thống sẽ có chế độ Simple và Detailed. Khi dùng Simple Mode, mỗi màn hình chỉ hiển thị các thông tin cần thiết nhất như ngày, nội dung, nơi thực hiện và trạng thái. Khi cần quản lý sâu hơn, người quản lý có thể bật Detailed Mode để sử dụng thêm checklist, phân công tự động, xác nhận hoàn thành, báo cáo và các thông tin mở rộng.
