# Full Project Context – App Quản Lý Lưu Xá / ResidenceCore

**File:** `Full-Project-context20260612.md`  
**Ngày cập nhật:** 2026-06-12  
**Repo tham chiếu:** `NghiaNguyen2022/ResidenceCore`  
**Tên dự án làm việc:** App Lưu Xá / ResidenceCore / ResidenceCare  
**Mục tiêu tài liệu:** Tổng hợp đầy đủ context dự án, yêu cầu nghiệp vụ, hướng ưu tiên triển khai, checklist 2 level và các lưu ý kỹ thuật/kiến trúc đã thống nhất trong quá trình trao đổi, demo, chỉnh sửa và test.

---

## 1. Tóm tắt dự án

App Lưu Xá là ứng dụng quản lý nội trú/lưu xá dành cho các bạn trẻ/học viên đang sống tại lưu xá để học trung học, cao đẳng, đại học. Hệ thống phục vụ chính cho đội ngũ quản lý lưu xá, các sơ/quản lý nội trú, học viên lưu trú và về sau có thể mở rộng cho phụ huynh.

Trọng tâm giai đoạn hiện tại là **ổn định phần quản lý vận hành nội bộ**, trước khi mở rộng sâu sang cổng học viên/phụ huynh và các phân hệ nâng cao.

### Mục tiêu cốt lõi

- Quản lý học viên lưu trú một cách rõ ràng, chuyên nghiệp.
- Quản lý phòng ở, gán phòng, chuyển phòng, trả phòng.
- Quản lý người dùng và phân quyền theo vai trò đơn giản, dễ dùng.
- Quản lý cơ cấu tổ chức lưu xá: nhiệm kỳ, chức vụ, tổ, ban, bổ nhiệm.
- Quản lý lịch sinh hoạt hằng ngày và công tác trực nhật/công tác chung.
- Chuẩn bị nền cho các module tiếp theo: hoạt động/sự kiện, nội quy/nhắc nhở, tài chính, thông báo, phụ huynh, cổng học viên.

### Nguyên tắc triển khai đã thống nhất

- Làm từng bước nhỏ, có thể test ngay.
- Thứ tự ưu tiên khi triển khai chức năng:
  1. DB script/schema/data.
  2. Backend mapping/service/router.
  3. Frontend page/component.
  4. Test từng case nghiệp vụ.
- Simple Mode là baseline chính: gọn, đủ dùng, dễ hiểu cho người quản lý.
- Detailed Mode giữ lại các phần chi tiết/nâng cao, không làm rối Simple Mode.
- Không đưa các ghi chú kỹ thuật như “đã connect database”, “phase sau...” vào UI người dùng cuối.
- UI nghiệp vụ phải dùng từ tự nhiên, chuyên nghiệp, dễ hiểu.
- Các chức năng quản lý phải ổn định trước khi mở rộng cổng học viên/phụ huynh.

---

## 2. Phạm vi người dùng và vai trò

### 2.1. Quản lý lưu xá / Manager

Người dùng chính trong giai đoạn hiện tại.

Nhu cầu:

- Quản lý danh sách học viên.
- Theo dõi trạng thái học viên: đang ở, đã ngừng, đã rời.
- Gán/chuyển/trả phòng.
- Quản lý phòng và sức chứa.
- Quản lý người dùng đăng nhập.
- Quản lý cơ cấu tổ chức, nhiệm kỳ, bổ nhiệm.
- Quản lý lịch sinh hoạt, công tác hằng ngày.
- Theo dõi công tác chưa làm, quá giờ, đã hoàn thành.
- Thiết lập hệ thống ở Simple Mode hoặc Detailed Mode.

### 2.2. Học viên lưu trú / Resident

Ở giai đoạn tiếp theo, học viên cần có cổng riêng.

Nhu cầu dự kiến:

- Xem hồ sơ cá nhân.
- Xem phòng ở và bạn cùng phòng.
- Xem liên hệ gia đình.
- Xem lịch sinh hoạt hằng ngày.
- Xem công tác được phân công.
- Xem tài chính cá nhân.
- Đổi mật khẩu.
- Nhận thông báo/nội quy/nhắc nhở.

### 2.3. Phụ huynh / Parent/Guardian

Chưa ưu tiên ở giai đoạn hiện tại, nhưng đã có hướng mở rộng.

Nhu cầu dự kiến:

- Xem thông tin liên hệ.
- Theo dõi tình trạng lưu trú/các thông tin cơ bản của con/em.
- Xem thông báo quan trọng.
- Theo dõi các khoản tài chính nếu hệ thống cho phép.

### 2.4. Vai trò bổ nhiệm trong tổ chức

Vai trò quản lý nội bộ theo nhiệm kỳ:

- Trưởng.
- Phó.
- Thư ký.
- Thủ quỹ.
- Tổ trưởng.
- Trưởng ban.

Các vai trò này không nên tạo trực tiếp trong User Management như user role thông thường, mà phải được gán qua nghiệp vụ bổ nhiệm/tổ chức.

---

## 3. Simple Mode và Detailed Mode

### 3.1. Simple Mode

Simple Mode là chế độ chính để triển khai MVP. Mục tiêu là giảm rối, đủ dùng, ưu tiên nghiệp vụ quản lý thường ngày.

Đặc điểm:

- Màn hình gọn.
- Tránh quá nhiều trường cấu hình.
- Không hiển thị những cấu hình kỹ thuật hoặc ít dùng.
- Người quản lý có thể thao tác nhanh.
- Các module nâng cao có thể ẩn khỏi menu.

Ví dụ:

- User Management chỉ quản lý user manager trong Simple Mode.
- Resident/appointment user được tạo qua flow học viên/bổ nhiệm, không tạo thủ công trong User Management.
- Tổ chức lưu xá gom thành một màn hình đơn giản.
- Sinh hoạt hằng ngày gom lịch sinh hoạt và công tác trong một module, nhưng UI tách rõ từng phần.

### 3.2. Detailed Mode

Detailed Mode dành cho cấu hình nâng cao hoặc phần chưa muốn đưa vào Simple Mode.

Có thể giữ:

- Cấu hình cấu trúc vai trò chi tiết.
- Màn hình Duties cũ nếu cần fallback.
- Các màn hình chi tiết về quyền, cấu hình nâng cao.
- Các báo cáo/phân tích sâu hơn.

### 3.3. Global display mode

Chế độ Simple/Detailed là cấu hình toàn hệ thống, không phải mỗi chức năng tự chọn riêng.

Frontend đã có helper:

```ts
useSystemDisplayMode()
```

với:

```ts
isSimple
isDetailed
```

---

## 4. Nguyên tắc nghiệp vụ quan trọng

### 4.1. Học viên và trạng thái lưu trú

Trạng thái cần thể hiện rõ bằng tiếng Việt:

- Đang ở.
- Đã ngừng.
- Đã rời.
- Chưa gán phòng.
- Có phòng.
- Tài khoản đã khóa nếu học viên đã rời/ngừng và user bị khóa.

Khi học viên đã rời/ngừng:

- Không cho gán phòng mới trực tiếp.
- Không cho cập nhật thông tin không cần thiết.
- Không cho thêm liên hệ từ detail nếu đã rời/ngừng.
- Cho phép “Đăng ký lại” nếu quay lại lưu xá.
- Khi đăng ký lại, không tự reuse phòng cũ; phải gán lại theo hiện trạng.
- Nếu có user liên kết thì user phải khóa/deactivate khi rời/ngừng.
- Khi quay lại thì có thể reactivate user theo flow đăng ký lại.

### 4.2. Phòng ở

Phòng có:

- Mã phòng.
- Tên phòng.
- Sức chứa.
- Số đang ở.
- Số còn trống.

Quy tắc:

- Không cho gán quá sức chứa.
- Nếu học viên đã có phòng thì chỉ cho chuyển phòng hoặc trả phòng, không gán phòng mới.
- Khi gán/chuyển/trả phòng phải cập nhật hiện trạng phòng và current room của học viên.
- Lịch sử gán/chuyển phòng cần lưu để truy vết.
- Trong Simple Mode, tác vụ nhanh cần có:
  - Xem danh sách phòng.
  - Thêm phòng.
  - Sửa phòng.
- Sửa phòng chỉ cho sửa tên phòng và sức chứa, không sửa mã phòng.

### 4.3. Liên hệ gia đình/phụ huynh

Quy tắc:

- Cha/mẹ/người giám hộ là một contact riêng, không nhập lẫn.
- Cần validate trùng tên/số điện thoại ở mức phù hợp.
- Có view tổng hợp tất cả phụ huynh.
- Khi thêm từ All Parents phải chọn học viên.
- Contacts list nên truy cập từ Members page/modal, không nhất thiết là menu riêng trong Simple Mode.

### 4.4. Người dùng và phân quyền

Vai trò đã thống nhất:

- `manager`.
- `resident`.
- Appointment roles:
  - `team_leader`.
  - `committee_head`.
  - `house_leader`.
  - `deputy`.
  - `secretary`.
  - `treasurer`.

Quy tắc Simple Mode:

- User Management chỉ cho manager tạo manager user.
- Không tạo resident user trực tiếp từ User Management.
- Resident user được tạo từ flow học viên.
- Appointment role được gán từ flow tổ chức/bổ nhiệm.
- Reset password:
  - Set `mustChangePassword = true`.
  - Trả về mật khẩu mặc định.
  - User bắt buộc đổi mật khẩu khi đăng nhập.
- Update user không được đổi role trong Simple Mode.
- Manager có thể lock/unlock manager user.
- Resident user hiển thị trạng thái và linked profile.
- Không cho link/unlink resident từ User Management trong Simple Mode.

### 4.5. Chính sách mật khẩu

Quy tắc:

- User mặc định admin:
  - Username: `admin`.
  - Role: `manager`.
  - Password default: `admin`.
  - `mustChangePassword = true`.
- Nếu `mustChangePassword = true`:
  - Chặn tất cả màn hình.
  - Hiển thị popup đổi mật khẩu duy nhất.
  - Sau khi đổi thành công, set `mustChangePassword = false`.
  - Force logout.
  - User phải đăng nhập lại.

### 4.6. Tổ chức lưu xá và bổ nhiệm

Menu Simple Mode:

```txt
Tổ chức lưu xá
├── Cơ cấu hiện tại
├── Bổ nhiệm
├── Danh sách Tổ
├── Danh sách Ban
└── Nhiệm kỳ
```

Không hiển thị “Cấu trúc chức vụ” trong Simple Mode.

Quy tắc nghiệp vụ:

- Chỉ học viên đang active mới được bổ nhiệm.
- Một người không được giữ nhiều hơn một chức vụ house-level cùng lúc.
- House-level roles:
  - Trưởng.
  - Phó.
  - Thư ký.
  - Thủ quỹ.
- Tổ trưởng phải gắn với một Tổ active.
- Trưởng ban phải gắn với một Ban active.
- Tổ/Ban inactive thì appointment tương ứng inactive.
- Khi bổ nhiệm:
  - Tự gán role user tương ứng.
- Khi kết thúc bổ nhiệm:
  - Tự remove role user tương ứng.
- Nếu chức vụ max = 1 đã có người, khi bổ nhiệm người khác phải báo:
  - “Chức vụ này đã đủ số lượng tối đa (1).”
- Nếu học viên có bổ nhiệm active mà rời lưu xá:
  - Cần cảnh báo.
  - Nếu chọn bàn giao thì mở flow bàn giao/bổ nhiệm lại.
  - Chỉ sau khi bàn giao thành công mới cho rời/ngừng.

### 4.7. Sinh hoạt hằng ngày và công tác

Module hiện tại đã được gom về `DailyRoutine`, nhưng nghiệp vụ cần tách rõ:

- Lịch sinh hoạt.
- Lịch công tác.

Tab Hôm nay:

- Bên trái: Lịch sinh hoạt trong ngày.
- Bên phải: Lịch công tác trong ngày.
- Không gộp công tác vào timeline sinh hoạt.
- Có thể xem trạng thái:
  - Đã qua giờ.
  - Chưa làm.
  - Đã quá giờ.
  - Hoàn thành.
  - Vắng/Không làm.
  - Đã hủy.

Tab Công tác:

- Có form tạo phân công.
- Có preview khi gán nguyên tuần.
- Có view:
  - Ngày.
  - Tuần.
  - Tháng.
- View ngày để xử lý chi tiết.
- View tuần để kiểm tra nhanh sau khi gán nguyên tuần.
- View tháng để xem tổng quan ngày nào có công tác, số chưa xong/quá giờ.

Tab Lịch sinh hoạt:

- Chỉ quản lý mẫu lịch sinh hoạt và khung giờ sinh hoạt.
- Không có công tác trong tab này.

Quy tắc công tác:

- Gán cho:
  - Học viên.
  - Tổ.
  - Phòng.
  - Ban.
- Nếu gán cho học viên:
  - Check max.
  - Min chỉ cảnh báo/preview, không block khi tạo từng người.
- Nếu gán cho Tổ/Phòng/Ban:
  - Không check min/max.
  - Chỉ check trùng cùng công tác + cùng ngày + cùng đối tượng.
- Nếu công tác loại daily:
  - Default “Gán nguyên tuần” checked.
  - Gán cả tuần từ thứ Hai đến Chúa nhật của ngày chọn.
  - Preview ngày nào tạo được, ngày nào bị bỏ qua.
  - Save batch: tạo ngày hợp lệ, bỏ qua ngày không hợp lệ.
- Không dùng `Date.toISOString()` sai kiểu ở backend; cần đảm bảo insert Drizzle dùng Date object đúng.

---

## 5. Checklist Level 1 – Module chính

| STT | Module / Chức năng chính | Ưu tiên | Trạng thái | Ghi chú |
|---|---|---:|---|---|
| 1 | Nền tảng hệ thống, Simple/Detailed Mode | P0 | Đang làm/đã có nền | Cần tiếp tục chuẩn hóa context và cleanup |
| 2 | Authentication & Password Policy | P0 | Đã làm chính | Cần test lại full flow đổi mật khẩu |
| 3 | User Management Simple Mode | P0 | Đã làm chính | Cần refine UI, test manager-only |
| 4 | Quản lý học viên lưu trú | P0 | Đã làm nhiều phần | Cần ổn định action theo từng dòng/card |
| 5 | Quản lý phòng ở | P0 | Đã làm nhiều phần | Cần test sức chứa/gán/chuyển/trả |
| 6 | Liên hệ gia đình/phụ huynh | P1 | Đã có phần cơ bản | Cần hoàn thiện All Parents |
| 7 | Tổ chức lưu xá / Nhiệm kỳ / Bổ nhiệm | P0 | Đã làm nhiều phần | Cần test bàn giao khi rời |
| 8 | Sinh hoạt hằng ngày / Lịch sinh hoạt / Công tác | P0 | Đang refactor mạnh | Đã tách nhiều component, cần test lại |
| 9 | Cổng học viên lưu trú | P1 | Đã khởi tạo | MyProfile đã có hướng triển khai |
| 10 | Hoạt động & Sự kiện | P2 | Chưa triển khai chính | Nên làm sau DailyRoutine ổn |
| 11 | Nội quy & Nhắc nhở | P2 | Chưa triển khai chính | Nằm trong nhóm Sinh hoạt & Đời sống |
| 12 | Tài chính lưu xá | P2 | Chưa ưu tiên hiện tại | Sau core management |
| 13 | Thông báo | P2 | Có service nền | Cần nghiệp vụ cụ thể |
| 14 | Báo cáo / Dashboard | P2 | Chưa hoàn thiện | Sau khi data core ổn |
| 15 | Kiến trúc component/reuse/cleanup | P0 | Đang làm | Tách DailyRoutine là ví dụ chính |

---

## 6. Checklist Level 2 – Chi tiết từng module nghiệp vụ

## 6.1. Nền tảng hệ thống

### Business requirement

- Hệ thống phải có cấu hình đơn giản để triển khai cho lưu xá nhỏ.
- Người quản lý không cần hiểu cấu hình kỹ thuật vẫn vận hành được.
- Các phần nâng cao không làm rối UI chính.

### Checklist

- [x] Xác định Simple Mode là baseline.
- [x] Xác định Detailed Mode để giữ chức năng nâng cao.
- [x] Tạo helper frontend `useSystemDisplayMode()`.
- [x] Điều chỉnh menu Simple Mode cho gọn.
- [ ] Chuẩn hóa toàn bộ menu Simple/Detailed.
- [ ] Kiểm tra màn hình nào còn hiển thị nội dung kỹ thuật.
- [ ] Xóa các note UI kiểu “đã connect database”, “phase sau...”.
- [ ] Chuẩn hóa label tiếng Việt toàn hệ thống.
- [ ] Chuẩn hóa AppMessageBox thay cho `window.confirm`.

### Risk/impact

- Nếu Simple Mode vẫn lẫn quá nhiều cấu hình thì người dùng cuối sẽ rối.
- Nếu UI có note kỹ thuật, hệ thống trông thiếu chuyên nghiệp.
- Nếu Simple/Detailed không thống nhất, dễ phát sinh logic ẩn/hiện sai.

---

## 6.2. Authentication & Password Policy

### Business requirement

- User mới hoặc user được reset mật khẩu phải đổi mật khẩu trước khi dùng hệ thống.
- Không cho truy cập màn hình nếu chưa đổi mật khẩu.

### Checklist

- [x] Admin mặc định username `admin`.
- [x] Role admin mặc định là `manager`.
- [x] Password default là `admin`.
- [x] `mustChangePassword = true` khi tạo/reset.
- [x] Popup đổi mật khẩu bắt buộc trong layout.
- [x] Sau đổi mật khẩu thành công thì force logout.
- [ ] Test login lần đầu với admin.
- [ ] Test reset password manager user.
- [ ] Test resident user bị bắt đổi mật khẩu.
- [ ] Test user locked không đăng nhập được.
- [ ] Chuẩn hóa message lỗi đăng nhập.

### Risk/impact

- Nếu không chặn màn hình khi `mustChangePassword`, user có thể dùng hệ thống với mật khẩu mặc định.
- Nếu không force logout sau khi đổi mật khẩu, session có thể không đồng bộ.

---

## 6.3. User Management

### Business requirement

- Trong Simple Mode, màn hình User Management chỉ dùng để quản lý user quản lý.
- Resident user và appointment role đi theo nghiệp vụ riêng.

### Checklist

- [x] Simple Mode không cho tạo resident user từ UserManagement.
- [x] Manager chỉ tạo manager user.
- [x] Không cho đổi role khi update user.
- [x] Reset password set `mustChangePassword = true`.
- [x] Reset password trả về password mặc định.
- [x] Resident user chỉ hiển thị status/linked profile.
- [x] Bỏ link/unlink resident trong UserManagement.
- [ ] Test tạo manager user.
- [ ] Test khóa/mở khóa manager user.
- [ ] Test reset password manager.
- [ ] Test resident user hiển thị readonly đúng.
- [ ] Test user không có quyền manager không vào được UserManagement.

### Risk/impact

- Nếu cho tạo role resident tùy ý, dữ liệu user có thể lệch với hồ sơ học viên.
- Nếu role appointment tạo thủ công, dễ lệch với cơ cấu tổ chức.

---

## 6.4. Quản lý học viên lưu trú

### Business requirement

Quản lý toàn bộ vòng đời học viên:

```txt
Tạo hồ sơ → Gán phòng → Theo dõi thông tin → Ngừng/Rời → Đăng ký lại nếu quay lại
```

### Checklist

- [x] Tạo học viên.
- [x] Cập nhật học viên.
- [x] Thêm/sửa liên hệ gia đình.
- [x] Hiển thị trạng thái tiếng Việt.
- [x] Hiển thị phòng hiện tại.
- [x] Backend members.list trả `roomCode`, `roomName`.
- [x] Backend members.list trả contact chính.
- [x] Mark as left khóa/deactivate user liên kết.
- [x] Có flow Ngừng/Rời.
- [x] Có flow Đăng ký lại.
- [x] Contact list modal từ Members page.
- [x] AppMessageBox thay confirm ở Members.
- [x] Action đưa vào từng dòng/card học viên:
  - Xem chi tiết.
  - Đăng ký lại nếu đã rời/ngừng.
  - Gắn phòng nếu chưa có phòng.
  - Chuyển phòng nếu đã có phòng.
- [x] Card học viên rời/ngừng có màu nền khác.
- [x] Sort ưu tiên đang ở trước, rời/ngừng sau.
- [ ] Test tạo học viên với user tự động.
- [ ] Test username tự sinh dạng `ten.ho`, trùng thì thêm số.
- [ ] Test thêm holyName nếu field đã có.
- [ ] Test học viên đã rời không cho cập nhật/gắn phòng.
- [ ] Test đăng ký lại reactive user.
- [ ] Test rời lưu xá khi đang giữ chức vụ active.
- [ ] Test flow bàn giao chức vụ trước khi rời.
- [ ] Kiểm tra pagination page size 5/7/10.
- [ ] Review lại card UI cho đều chiều cao/visual depth.

### Risk/impact

- Nếu dùng room fallback cũ thay vì currentRoom fields, hiển thị/gán phòng có thể sai.
- Nếu học viên rời mà user không khóa, vẫn có thể đăng nhập.
- Nếu đăng ký lại tự reuse phòng cũ, có thể vượt sức chứa hoặc sai hiện trạng.

---

## 6.5. Quản lý phòng ở

### Business requirement

Quản lý phòng theo sức chứa và tình trạng hiện tại.

### Checklist

- [x] Danh sách phòng.
- [x] Thêm phòng.
- [x] Sửa phòng cơ bản.
- [x] Không sửa mã phòng.
- [x] Gán phòng từ member.
- [x] Chuyển phòng nếu đã có phòng.
- [x] Trả phòng nếu cần.
- [x] Không cho gán quá sức chứa.
- [x] Cập nhật current room fields của resident khi gán/chuyển/trả.
- [x] Cập nhật room occupancy/capacity còn trống.
- [x] Lưu roomAssignments.
- [ ] Test gán phòng khi phòng còn trống.
- [ ] Test gán phòng khi phòng full.
- [ ] Test chuyển phòng từ phòng A sang B.
- [ ] Test trả phòng.
- [ ] Test chỉnh sức chứa nhỏ hơn số đang ở.
- [ ] Test danh sách phòng hiển thị số còn trống chính xác.
- [ ] Test không gán phòng cho học viên đã rời/ngừng.

### Risk/impact

- Nếu chỉ ghi roomAssignments mà không update resident currentRoom, UI sẽ sai.
- Nếu không update sức chứa/còn trống, quản lý phòng dễ vượt tải.
- Nếu cho sửa mã phòng, lịch sử có thể bị lệch.

---

## 6.6. Liên hệ gia đình / phụ huynh

### Business requirement

Quản lý người liên hệ của học viên, đặc biệt cha/mẹ/người giám hộ.

### Checklist

- [x] Có contacts list modal.
- [x] Có contact chính hiển thị trên Members list.
- [x] Có view tổng hợp phụ huynh được đưa vào checklist.
- [x] Khi thêm từ All Parents phải chọn học viên.
- [ ] Validate cha/mẹ là một người riêng.
- [ ] Validate trùng tên/số điện thoại.
- [ ] Phân loại contact:
  - Cha.
  - Mẹ.
  - Người giám hộ.
  - Khác.
- [ ] Chọn contact chính.
- [ ] Tìm kiếm theo tên/số điện thoại.
- [ ] Không cho thêm contact cho học viên đã rời/ngừng nếu nghiệp vụ yêu cầu khóa.

### Risk/impact

- Nếu phụ huynh không gắn đúng học viên, báo cáo liên hệ sẽ sai.
- Nếu trùng contact không kiểm soát, dữ liệu bị nhân đôi.

---

## 6.7. Tổ chức lưu xá

### Business requirement

Quản lý cơ cấu tổ chức nội bộ theo nhiệm kỳ, tổ/ban và bổ nhiệm học viên.

### Checklist

- [x] Menu Simple Mode: Tổ chức lưu xá.
- [x] Tab/section:
  - Cơ cấu hiện tại.
  - Bổ nhiệm.
  - Danh sách Tổ.
  - Danh sách Ban.
  - Nhiệm kỳ.
- [x] Ẩn cấu hình chức vụ trong Simple Mode.
- [x] Chỉ active residents được bổ nhiệm.
- [x] Bổ nhiệm tự assign user role.
- [x] Kết thúc bổ nhiệm tự remove role.
- [x] Validate max role = 1.
- [x] Tổ trưởng chỉ chọn Tổ.
- [x] Trưởng ban chỉ chọn Ban.
- [x] Tổ/Ban inactive thì appointment inactive.
- [x] Có org chart:
  - Điều hành ở trên.
  - Các vai trò house-level ở dưới.
  - Tổ và Ban thành hai cột.
  - Card placeholder nếu chưa có người.
- [x] Component split cho OrganizationSimple.
- [x] Flow handover khi học viên có bổ nhiệm active muốn rời.
- [ ] Test bổ nhiệm Trưởng.
- [ ] Test bổ nhiệm Phó nhiều người nếu max cho phép.
- [ ] Test một người không giữ nhiều house-level role.
- [ ] Test Tổ trưởng theo từng Tổ.
- [ ] Test Trưởng ban theo từng Ban.
- [ ] Test inactive Tổ/Ban.
- [ ] Test bàn giao chức vụ khi rời lưu xá.
- [ ] Test organization chart theo nhiệm kỳ hiện tại.
- [ ] Test đổi nhiệm kỳ.

### Risk/impact

- Nếu role user không đồng bộ appointment, phân quyền portal có thể sai.
- Nếu không kiểm soát max role, một chức vụ có thể bị gán nhiều người sai nghiệp vụ.
- Nếu rời lưu xá khi còn appointment, cơ cấu hiện tại sẽ bị hở vị trí hoặc giữ người đã rời.

---

## 6.8. Sinh hoạt hằng ngày / DailyRoutine

### Business requirement

Một màn hình quản lý sinh hoạt và công tác hằng ngày, nhưng UI phải tách rõ:

```txt
Hôm nay
├── Lịch sinh hoạt trong ngày
└── Lịch công tác trong ngày

Công tác
├── Tạo phân công
└── View Ngày/Tuần/Tháng

Lịch sinh hoạt
├── Mẫu lịch sinh hoạt
└── Khung giờ sinh hoạt
```

### Checklist tổng

- [x] Gom DailyRoutine và Duties vào route `/daily-routine`.
- [x] Ẩn `/duties` khỏi Simple Mode.
- [x] Menu Simple Mode có:
  - Sinh hoạt hằng ngày.
  - Hoạt động & Sự kiện.
  - Nội quy & Nhắc nhở.
- [x] Tab Hôm nay tách lịch sinh hoạt và lịch công tác.
- [x] Tab Công tác có form tạo phân công.
- [x] Tab Công tác có view Ngày/Tuần/Tháng.
- [x] Tab Lịch sinh hoạt chỉ còn mẫu lịch và khung giờ sinh hoạt.
- [x] Tách component theo feature:
  - `today/`
  - `duties/`
  - `routine/`
  - `shared/`
- [x] Tách TodayOverviewTab.
- [x] Tách DutiesTab.
- [x] Tách RoutineSetupTab.
- [x] Tách RoutineTemplateModal.
- [x] Tách RoutineItemModal.
- [x] Tách DutyTemplateDialog.
- [x] Dọn một phần DailyRoutine.tsx.
- [ ] Test lại toàn bộ sau refactor.
- [ ] Hoàn thiện cleanup helper sang util file riêng.
- [ ] Kiểm tra không còn lỗi build/Vite.
- [ ] Kiểm tra không còn component dead code/import thừa.

### Checklist Lịch sinh hoạt

- [x] Quản lý mẫu lịch:
  - Tên mẫu.
  - Mã mẫu.
  - Loại ngày.
  - Mô tả.
  - Trạng thái.
  - Thứ tự.
- [x] Quản lý khung giờ:
  - Mẫu lịch.
  - Giờ bắt đầu.
  - Giờ kết thúc.
  - Tên hoạt động.
  - Địa điểm.
  - Ghi chú.
  - Trạng thái.
  - Thứ tự.
- [x] Tìm kiếm mẫu lịch.
- [x] Lọc loại ngày.
- [x] Thêm/sửa/xóa mẫu lịch.
- [x] Thêm/sửa/xóa khung giờ.
- [ ] Validate giờ bắt đầu < giờ kết thúc.
- [ ] Validate trùng khung giờ trong cùng mẫu.
- [ ] Có confirm khi xóa mẫu lịch đã có khung giờ.
- [ ] Có Simple/Detailed cho các field nâng cao nếu cần.

### Checklist Công tác

- [x] Tạo mẫu công tác.
- [x] Quản lý mẫu công tác trong popup riêng.
- [x] Tạo phân công cho:
  - Học viên.
  - Tổ.
  - Phòng.
  - Ban.
- [x] Chọn ngày công tác.
- [x] Gán nguyên tuần cho duty daily.
- [x] Preview batch:
  - Sẽ tạo bao nhiêu ngày.
  - Bỏ qua bao nhiêu ngày.
  - Lý do bỏ qua.
- [x] Save batch:
  - Tạo ngày hợp lệ.
  - Bỏ qua ngày không hợp lệ.
- [x] View ngày.
- [x] View tuần.
- [x] View tháng.
- [x] Hoàn thành công tác.
- [x] Vắng/Không làm.
- [x] Hủy công tác.
- [x] Fix lỗi `value.toISOString is not a function`.
- [x] Fix lỗi `toSqlDateOnly is not defined`.
- [ ] Test gán 1 ngày cho học viên.
- [ ] Test gán nguyên tuần cho học viên.
- [ ] Test gán nguyên tuần cho Tổ.
- [ ] Test gán nguyên tuần cho Phòng.
- [ ] Test gán nguyên tuần cho Ban.
- [ ] Test duplicate cùng ngày/cùng đối tượng.
- [ ] Test max capacity cho resident.
- [ ] Test team/room/committee không check min/max.
- [ ] Test view tuần đủ dữ liệu cả tuần.
- [ ] Test view tháng đủ dữ liệu cả tháng.
- [ ] Test hoàn thành/vắng/hủy sau refactor.
- [ ] Test timezone giờ không bị lệch.
- [ ] Test query range theo tháng không ảnh hưởng performance.

### Risk/impact

- Nếu query theo tháng quá nặng khi dữ liệu lớn, cần phân trang/cache hoặc query theo range view.
- Nếu timezone xử lý sai, công tác 18:00 có thể hiển thị thành 11:00.
- Nếu preview dùng string nhưng insert Drizzle cần Date object, sẽ tái phát lỗi `toISOString`.
- Nếu công tác bị đưa vào lịch sinh hoạt, người dùng hiểu sai hai nghiệp vụ.

---

## 6.9. Cổng học viên lưu trú

### Business requirement

Học viên có một cổng riêng, giao diện đơn giản để xem thông tin của mình.

Menu resident đã thống nhất:

```txt
Hồ sơ của tôi
Hôm nay
Thông tin lưu xá
Tài chính của tôi
```

### Checklist

- [x] Có quyết định sidebar resident 4 mục.
- [x] MyProfile gom:
  - Hồ sơ cá nhân.
  - Tài khoản/mật khẩu.
  - Phòng/bạn cùng phòng.
  - Liên hệ gia đình.
- [x] `residentPortalService.ts` đã được khởi tạo.
- [x] `MyProfile.tsx` đã wrap với `ResidenceCareLayout`.
- [ ] Kiểm tra route vào MyProfile.
- [ ] Kiểm tra menu resident theo role resident.
- [ ] Cho học viên đổi mật khẩu.
- [ ] Cho học viên xem phòng và bạn cùng phòng.
- [ ] Cho học viên xem contacts.
- [ ] Cho học viên xem lịch hôm nay.
- [ ] Cho học viên xem công tác được phân công.
- [ ] Cho học viên xem tài chính cá nhân.

### Risk/impact

- Nếu resident portal dùng dữ liệu manager không filter theo resident hiện tại, có thể lộ dữ liệu.
- Nếu linked resident sai, học viên xem nhầm hồ sơ.

---

## 6.10. Hoạt động & Sự kiện

### Business requirement

Quản lý các hoạt động chung, sự kiện lưu xá, sinh hoạt đặc biệt.

Simple Mode chỉ cần:

- Tên hoạt động/sự kiện.
- Ngày.
- Giờ bắt đầu/kết thúc.
- Địa điểm.
- Người phụ trách.
- Đối tượng tham gia.
- Nội dung/ghi chú.
- Trạng thái.

### Checklist

- [ ] Thiết kế DB schema.
- [ ] Thiết kế service/router.
- [ ] Tạo màn hình Simple Mode.
- [ ] Thêm/sửa/xóa hoạt động.
- [ ] View ngày/tuần/tháng hoặc list đơn giản.
- [ ] Gắn người phụ trách.
- [ ] Chọn đối tượng tham gia.
- [ ] Hiển thị lên tab Hôm nay nếu hoạt động diễn ra trong ngày.
- [ ] Cho resident xem hoạt động liên quan.

### Risk/impact

- Nếu đưa quá nhiều cấu hình ngay từ đầu, module sẽ rối.
- Nên làm sau khi DailyRoutine ổn.

---

## 6.11. Nội quy & Nhắc nhở

### Business requirement

Quản lý nội quy, nhắc nhở, ghi nhận vi phạm đơn giản.

Simple Mode nên có:

- Danh sách nội quy.
- Nhắc nhở chung.
- Ghi nhận nhắc nhở theo học viên nếu cần.
- Trạng thái áp dụng.

### Checklist

- [ ] Thiết kế nghiệp vụ simple.
- [ ] Tạo danh mục nội quy.
- [ ] Tạo nhắc nhở chung.
- [ ] Gửi/hiển thị cho học viên.
- [ ] Ghi nhận học viên đã xem nếu cần.
- [ ] Liên kết với thông báo nếu cần.

### Risk/impact

- Đây là module nhạy cảm về quản lý học viên, cần wording nhẹ nhàng, không quá nặng tính kỷ luật trong Simple Mode.

---

## 6.12. Tài chính lưu xá

### Business requirement

Theo dõi chi phí/khoản thu liên quan học viên lưu trú.

Chưa ưu tiên hiện tại, nhưng cần chuẩn bị.

### Checklist

- [ ] Xác định khoản thu:
  - Phí lưu trú.
  - Ăn uống.
  - Sinh hoạt phí.
  - Khoản khác.
- [ ] Xác định kỳ thu.
- [ ] Tạo khoản phải thu.
- [ ] Ghi nhận thanh toán.
- [ ] Xem công nợ học viên.
- [ ] Resident portal xem tài chính của tôi.
- [ ] Báo cáo tổng hợp tài chính.
- [ ] Phân quyền chỉ quản lý được xem.

### Risk/impact

- Nếu tài chính làm sớm khi member/room chưa ổn, dữ liệu phát sinh sẽ khó chỉnh.
- Cần cân nhắc nghiệp vụ xóa học viên: nếu đã phát sinh phí thì không xóa vật lý, chỉ chuyển trạng thái rời.

---

## 6.13. Thông báo

### Business requirement

Gửi thông báo cho học viên/quản lý/phụ huynh tùy giai đoạn.

### Checklist

- [x] Có nền `notificationService`.
- [ ] Xác định loại thông báo.
- [ ] Gửi thông báo theo role.
- [ ] Gửi thông báo theo Tổ/Phòng/Ban.
- [ ] Hiển thị trong resident portal.
- [ ] Theo dõi đã đọc/chưa đọc.
- [ ] Kết nối với công tác/sinh hoạt/nội quy nếu cần.

### Risk/impact

- Nếu không phân quyền kỹ, thông báo có thể gửi sai đối tượng.
- Chỉ nên mở rộng sau khi role và resident portal ổn.

---

## 6.14. Báo cáo / Dashboard

### Business requirement

Cung cấp cái nhìn tổng quan cho quản lý lưu xá.

### Checklist

- [ ] Dashboard số học viên đang ở.
- [ ] Số phòng còn trống/full.
- [ ] Học viên mới/rời trong kỳ.
- [ ] Công tác hôm nay chưa hoàn thành.
- [ ] Công tác quá giờ.
- [ ] Cơ cấu tổ chức hiện tại.
- [ ] Phụ huynh/liên hệ chưa đầy đủ.
- [ ] Báo cáo tài chính khi module tài chính có data.

### Risk/impact

- Dashboard cần data đã chuẩn. Nếu dữ liệu core chưa ổn, báo cáo sẽ sai.

---

## 7. Checklist kiến trúc/kỹ thuật riêng

Phần này tách riêng, không trộn vào checklist nghiệp vụ.

## 7.1. Repo và cấu trúc kỹ thuật

Repo tham chiếu:

```txt
NghiaNguyen2022/ResidenceCore
```

Cấu trúc đã thấy/đang dùng:

```txt
client/src/pages/
client/src/components/
client/src/components/daily-routine/
server/db/
server/db/schema/
server/routers/modules/
server/services/
```

Công nghệ:

- React.
- Tailwind.
- wouter.
- tRPC.
- Drizzle.
- MySQL.
- TypeScript.

### Checklist

- [x] Có cấu trúc schema theo module.
- [x] Có service/router theo module.
- [x] DailyRoutine đang refactor theo component.
- [ ] Chuẩn hóa import router:
  - `import { router, protectedProcedure } from "../../_core/trpc";`
  - hoặc giữ nhất quán theo project hiện tại.
- [ ] Kiểm tra unused imports sau refactor.
- [ ] Kiểm tra type errors toàn project.
- [ ] Chạy build/test sau mỗi nhóm refactor.
- [ ] Tạo convention đặt tên file component.

---

## 7.2. Component hóa DailyRoutine

Cấu trúc hiện tại đã/đang hướng tới:

```txt
client/src/components/daily-routine/
├── shared/
│   ├── DateNavigator.tsx
│   ├── EmptyState.tsx
│   ├── SectionCard.tsx
│   ├── StatusBadge.tsx
│   ├── TimeBox.tsx
│   ├── dailyRoutineUtils.ts
│   └── index.ts
│
├── today/
│   ├── TodayOverviewTab.tsx
│   ├── TodaySummaryBar.tsx
│   ├── TodayTimeline.tsx
│   ├── TodayDutyPanel.tsx
│   └── index.ts
│
├── duties/
│   ├── DutiesTab.tsx
│   ├── DutyAssignmentForm.tsx
│   ├── DutyPreviewBox.tsx
│   ├── DutyDayView.tsx
│   ├── DutyWeekView.tsx
│   ├── DutyMonthView.tsx
│   ├── DutyViewSwitcher.tsx
│   ├── DutyTemplateDialog.tsx
│   └── index.ts
│
└── routine/
    ├── RoutineSetupTab.tsx
    ├── RoutineTemplateList.tsx
    ├── RoutineItemList.tsx
    ├── RoutineTemplateModal.tsx
    ├── RoutineItemModal.tsx
    └── index.ts
```

### Checklist

- [x] Tạo shared components.
- [x] Tách Today components.
- [x] Tách Duties components.
- [x] Tách Routine components.
- [x] Tách DutyTemplateDialog.
- [x] Tách Routine modals.
- [x] Sửa lỗi cleanup sót `: { ... }`.
- [ ] Tách toàn bộ helper page còn lại sang `dailyRoutinePageUtils.ts`.
- [ ] Tách type dùng chung sang `dailyRoutineTypes.ts`.
- [ ] Kiểm tra file DailyRoutine.tsx còn import gì thừa.
- [ ] Kiểm tra mỗi component chỉ nhận props cần thiết.
- [ ] Kiểm tra component không tự query nếu chưa cần.
- [ ] Chuẩn hóa EmptyState/SectionCard/StatusBadge dùng lại toàn module.

---

## 7.3. Date/time và timezone

Các lỗi đã gặp:

- `value.toISOString is not a function`.
- `toSqlDateOnly is not defined`.
- Giờ DB 18:00 hiển thị 11:00 do dùng UTC sai chỗ.
- Query/insert DATE/DATETIME lẫn string và Date object.

Quy tắc hiện tại:

- Frontend gửi date string dạng `YYYY-MM-DD` cho preview/batch.
- Query/check ngày dùng string `YYYY-MM-DD`.
- Insert vào Drizzle/MySQL field DATE/DATETIME dùng Date object đúng.
- Display time trên frontend dùng local `getHours/getMinutes` khi cần, không dùng `getUTCHours` sai ngữ cảnh.

### Checklist

- [x] Fix `assignDutyBatch` dùng Date object khi insert.
- [x] Fix `assignDuty` dùng `normalizeDutyAssignmentForInsert`.
- [x] Fix `toSqlDateOnly` còn sót trong preview.
- [x] Query công tác theo date range.
- [ ] Test gán công tác nhiều ngày với timezone máy local.
- [ ] Test hiển thị giờ sau reload.
- [ ] Test query date range qua cuối tháng.
- [ ] Test view tháng có dữ liệu đúng ngày.
- [ ] Chuẩn hóa helper date/time dùng chung.

---

## 7.4. Backend Duties

Các function quan trọng:

- `previewDutyAssignment(input)`.
- `assignDutyBatch(input)`.
- `assignDuty(data)`.
- `getAssignmentsByDate(date)`.
- `getAssignmentsByDateRange(startDate, endDate, filters)`.
- `validateResidentDutyCapacity`.

Quy tắc:

- Resident: check max.
- Team/Room/Committee: không check min/max.
- Duplicate: cùng duty + date + assignedToType + assignedToId + status != cancelled.
- Batch save: chỉ insert item canCreate.

### Checklist

- [x] Preview batch.
- [x] Assign batch.
- [x] Duplicate check.
- [x] Resident max check.
- [x] Router previewAssignment.
- [x] Router assignDutyBatch.
- [x] Router getAssignmentsByDateRange.
- [ ] Test status cancelled không tính duplicate.
- [ ] Test assignedToType null legacy.
- [ ] Test assignedToId/residentId backward compatibility.
- [ ] Chuẩn hóa return payload cho frontend enrich.

---

## 7.5. Navigation

Manager Simple Mode đã hướng tới:

```txt
Sinh hoạt & Đời sống
├── Sinh hoạt hằng ngày -> /daily-routine
├── Hoạt động & Sự kiện -> /activity-plans
└── Nội quy & Nhắc nhở -> /discipline-rules
```

Detailed Mode có thể giữ `/duties`.

### Checklist

- [x] DailyRoutine route cho Simple Mode.
- [x] Hide Duties khỏi Simple Mode.
- [ ] Kiểm tra route `/daily-routine` hoạt động.
- [ ] Kiểm tra `/duties` chỉ Detailed/fallback.
- [ ] Kiểm tra resident navigation.
- [ ] Chuẩn hóa icon/label tiếng Việt.

---

## 7.6. UI/UX reusable components

Reusable đã tạo/đề xuất:

- AppMessageBox.
- EmptyState.
- SectionCard.
- DateNavigator.
- TimeBox.
- StatusBadge.
- DutyStatusBadge.
- DutyViewSwitcher.
- Today components.
- Duties components.
- Routine components.

### Checklist

- [x] AppMessageBox dùng cho Members/Duties.
- [x] DailyRoutine shared components.
- [ ] Dùng AppMessageBox thay `window.confirm` còn sót.
- [ ] Chuẩn hóa modal layout chung.
- [ ] Chuẩn hóa button style.
- [ ] Chuẩn hóa badge style.
- [ ] Chuẩn hóa loading/empty states.

---

## 8. Các lỗi/điểm đã xử lý gần đây

### DailyRoutine / Duties

- Lỗi `value.toISOString is not a function` khi lưu phân công:
  - Nguyên nhân: insert Drizzle nhận string thay vì Date object.
  - Fix: tách normalize check và normalize insert.
- Lỗi `toSqlDateOnly is not defined`:
  - Nguyên nhân: helper cũ còn sót trong `previewDutyAssignment`.
  - Fix: đổi sang `toDateOnlyText`.
- Công tác bị add vào phần lịch sinh hoạt:
  - Nguyên nhân: TodayTimeline dùng timelineItems đã gộp routine + duty.
  - Fix: TodayTimeline chỉ nhận routineItems; TodayDutyPanel nhận dutyAssignments.
- View tuần không đủ dữ liệu:
  - Nguyên nhân: chỉ query theo selectedDate.
  - Fix: query date range.
- View tháng ban đầu placeholder:
  - Fix: query range theo tháng và tạo DutyMonthView.
- Vite unexpected token line 316:
  - Nguyên nhân: cleanup xóa tên function nhưng còn sót body type của Badge/SectionEmpty.
  - Fix: xóa block sót.

### Organization

- Tổ trưởng/Trưởng ban picker sai scope:
  - Fix: chọn Tổ trưởng chỉ load Tổ; Trưởng ban chỉ load Ban.
- Validation role max=1:
  - Fix message tại form.
- Handover khi member rời mà đang giữ chức vụ:
  - Fix flow hướng bàn giao.

### Members/Rooms

- Gán phòng nhưng không update room capacity/current room:
  - Fix service cập nhật resident currentRoom và occupancy.
- Học viên có phòng rồi vẫn gán phòng mới:
  - Fix chỉ cho chuyển/trả.
- Rời lưu xá nhưng user vẫn active:
  - Fix markAsLeft khóa/deactivate linked user.
- Actions từ chọn dòng chuyển sang actions trên từng card/dòng.

---

## 9. Roadmap ưu tiên tiếp theo

## P0 – Cần làm ngay

1. Test lại DailyRoutine sau refactor.
   - Hôm nay.
   - Công tác.
   - Lịch sinh hoạt.
   - Modal mẫu công tác.
   - Modal mẫu lịch.
   - Modal khung giờ.
2. Dọn tiếp DailyRoutine:
   - Tách helper sang util.
   - Tách type sang file riêng.
   - Xóa imports thừa.
3. Test backend Duties:
   - Gán 1 ngày.
   - Gán nguyên tuần.
   - Gán resident/team/room/committee.
   - Duplicate.
   - Max resident.
   - Cancelled.
4. Test Members/Rooms:
   - Gán/chuyển/trả phòng.
   - Không vượt sức chứa.
   - Rời/ngừng/đăng ký lại.
5. Test Organization:
   - Bổ nhiệm.
   - Bàn giao khi rời.
   - Org chart theo nhiệm kỳ.

## P1 – Sau khi P0 ổn

1. Resident Portal:
   - MyProfile.
   - Hôm nay.
   - Công tác của tôi.
   - Tài chính của tôi.
2. All Parents:
   - View tổng hợp.
   - Thêm phụ huynh từ danh sách tổng.
   - Chọn học viên bắt buộc.
3. Hoạt động & Sự kiện:
   - Simple CRUD.
   - Hiển thị lên Today.
4. Nội quy & Nhắc nhở:
   - CRUD đơn giản.
   - Hiển thị cho học viên.

## P2 – Mở rộng

1. Tài chính.
2. Thông báo.
3. Dashboard/Báo cáo.
4. Detailed configuration.
5. Export/import dữ liệu.
6. Mobile polish.

---

## 10. Quy tắc khi tiếp tục code

### Trình tự làm việc

Mỗi chức năng mới nên đi theo:

```txt
1. DB/schema
2. Service
3. Router
4. Frontend component
5. Page integration
6. Test case
7. Cleanup
```

### Cách chia việc

- Không refactor quá lớn một lần nếu chưa test.
- Nhưng có thể gom 2-3 bước nhỏ nếu cùng nhóm component.
- Sau mỗi bước phải nói rõ:
  - File nào copy vào đâu.
  - Test case nào cần chạy.
  - Risk nếu có.

### Quy tắc UI

- Không dùng wording kỹ thuật cho user cuối.
- Không hiển thị “đã connect database”.
- Không hiển thị “phase sau sẽ...”.
- Label tiếng Việt rõ ràng.
- Simple Mode phải gọn.
- Detailed Mode mới hiển thị phần phức tạp.

### Quy tắc component

- Feature component nằm trong folder feature.
- Component dùng chung trong `shared`.
- Không để page chính quá dài.
- Page chính nên giữ:
  - state.
  - query.
  - mutation.
  - handler.
  - render tab chính.
- Form/modal/list nên tách riêng.

### Quy tắc date/time

- FE gửi date string cho preview.
- BE query/check bằng `YYYY-MM-DD`.
- Insert Drizzle bằng Date object.
- Display giờ cẩn thận timezone.
- Không mix tùy tiện string Date và Date object.

---

## 11. Trạng thái tổng thể đến 2026-06-12

### Đã định hình tốt

- Phạm vi MVP.
- Simple/Detailed Mode.
- Core roles.
- Member/Room/User flow.
- Organization flow.
- DailyRoutine + Duties hướng mới.
- Component architecture cho DailyRoutine.

### Đang cần ổn định

- DailyRoutine sau refactor.
- Duties date/time/query range.
- Room assignment capacity.
- Organization handover.
- User password reset/force change.

### Chưa nên mở rộng quá nhanh

- Tài chính.
- Thông báo nâng cao.
- Dashboard.
- Phụ huynh portal.
- Detailed configuration.

### Hướng ưu tiên cuối cùng

```txt
Ổn định core quản lý:
Member → Room → User → Organization → DailyRoutine/Duties

Sau đó mới mở:
Resident Portal → Activities/Events → Rules/Reminders → Finance → Reports
```

---

## 12. Checklist kiểm thử tổng hợp

### Smoke test sau mỗi lần pull/copy file

- [ ] App chạy được `pnpm dev`.
- [ ] Login được admin.
- [ ] Nếu mustChangePassword thì hiện popup đổi mật khẩu.
- [ ] Menu manager hiển thị đúng Simple Mode.
- [ ] Members page mở được.
- [ ] Rooms quick actions mở được.
- [ ] Organization page mở được.
- [ ] DailyRoutine page mở được.
- [ ] Tab Hôm nay hiển thị đúng.
- [ ] Tab Công tác hiển thị đúng.
- [ ] Tab Lịch sinh hoạt hiển thị đúng.

### Regression test DailyRoutine

- [ ] Tạo mẫu lịch.
- [ ] Tạo khung giờ.
- [ ] Tab Hôm nay hiển thị lịch sinh hoạt.
- [ ] Tạo mẫu công tác.
- [ ] Tạo phân công 1 ngày.
- [ ] Tạo phân công nguyên tuần.
- [ ] View ngày hiển thị đúng.
- [ ] View tuần hiển thị đúng.
- [ ] View tháng hiển thị đúng.
- [ ] Hoàn thành công tác.
- [ ] Vắng/Không làm.
- [ ] Hủy công tác.

### Regression test Members/Rooms

- [ ] Tạo học viên.
- [ ] Tạo user học viên.
- [ ] Gán phòng.
- [ ] Chuyển phòng.
- [ ] Trả phòng.
- [ ] Không vượt sức chứa.
- [ ] Rời lưu xá.
- [ ] User bị khóa sau khi rời.
- [ ] Đăng ký lại.

### Regression test Organization

- [ ] Tạo nhiệm kỳ.
- [ ] Tạo Tổ.
- [ ] Tạo Ban.
- [ ] Bổ nhiệm house role.
- [ ] Bổ nhiệm Tổ trưởng.
- [ ] Bổ nhiệm Trưởng ban.
- [ ] Validate max role.
- [ ] End appointment.
- [ ] Bàn giao khi rời lưu xá.
- [ ] Org chart hiển thị đúng.

---

## 13. Ghi chú cuối

Tài liệu này là context chuẩn để tiếp tục dự án từ sau ngày 2026-06-12. Khi bắt đầu một session mới hoặc giao việc cho Copilot/AI khác, nên đưa file này vào context trước, sau đó cung cấp thêm file code hiện tại cần sửa.

Mục tiêu tiếp theo gần nhất:

```txt
1. Fix/test DailyRoutine sau cleanup.
2. Tách helper/type còn lại khỏi DailyRoutine.
3. Test toàn bộ công tác ngày/tuần/tháng.
4. Chốt module DailyRoutine.
5. Quay lại test Member/Room/Organization.
```
