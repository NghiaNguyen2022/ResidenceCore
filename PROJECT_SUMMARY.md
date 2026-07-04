# ResidenceCore / App Lưu Xá — Project Summary cập nhật đầy đủ

**Cập nhật:** 2026-07-04  
**Trạng thái:** Sau chuỗi việc 1 → 11, chuẩn bị Việc 12  
**Mục tiêu hiện tại:** Hoàn thiện demo full flow vận hành lưu xá với UI/UX đơn giản, đầy đủ nghiệp vụ cốt lõi.

---

## 1. Tổng quan sản phẩm

ResidenceCore / App Lưu Xá là ứng dụng quản lý nội trú / lưu xá dành cho học viên, quản lý lưu xá và đội ngũ vận hành. Dự án hướng tới vận hành thực tế, không chỉ là giao diện demo.

Các mảng chính:

- Quản lý học viên lưu trú.
- Quản lý phòng ở, gán phòng, chuyển phòng, trả phòng.
- Quản lý liên hệ gia đình / phụ huynh.
- Quản lý thông tin học tập và lịch học.
- Quản lý tổ chức lưu xá: nhiệm kỳ, chức vụ, tổ, ban, bổ nhiệm.
- Quản lý công tác / trực nhật / nhiệm vụ hằng ngày.
- Quản lý tài chính cơ bản: kỳ thu, khoản thu, thanh toán, trạng thái công nợ.
- Resident Portal: học viên xem hồ sơ, công tác, tài chính, lịch sinh hoạt và thông tin cá nhân.
- Chuẩn bị mở rộng: thông báo, hoạt động/sự kiện, cửa hàng/quỹ riêng, phụ huynh, báo cáo.

Nguyên tắc triển khai đã thống nhất:

- Làm từng việc một, có checklist rõ.
- Không mở rộng module mới khi main flow chưa ổn.
- Mỗi bước pass phải cập nhật checklist và PROJECT_SUMMARY.
- File nào người dùng đã gửi/sửa xong thì xem là bản mới nhất nếu người dùng không nói có thay đổi thêm.
- Khi patch nhiều file, ưu tiên gửi file `.zip` có cấu trúc thư mục giống repo để giải nén chồng vào root project.
- Không dùng code cũ làm base nếu không chắc là mới nhất.
- Không revert các bug/rule đã fix.

---

## 2. Kiến trúc source hiện tại

```text
ResidenceCore/
├─ client/
│  ├─ src/
│  │  ├─ App.tsx
│  │  ├─ main.tsx
│  │  ├─ index.css
│  │  ├─ pages/
│  │  ├─ components/
│  │  ├─ navigation/
│  │  ├─ contexts/
│  │  ├─ hooks/
│  │  ├─ lib/
│  │  ├─ config/
│  │  └─ _core/
│  ├─ public/
│  └─ docs/
├─ server/
│  ├─ routers/
│  │  ├─ modules/
│  │  └─ financial.ts
│  ├─ services/
│  ├─ db/
│  ├─ seeds/
│  ├─ _core/
│  ├─ routers.ts
│  ├─ db.ts
│  └─ storage.ts
├─ drizzle/
│  ├─ schema.ts
│  ├─ relations.ts
│  ├─ core.ts
│  ├─ residents.ts
│  ├─ dailyRoutine.ts
│  ├─ activities.ts
│  ├─ *.sql
│  └─ meta/
├─ shared/
├─ docs/
├─ scripts/
├─ patches/
└─ package.json
```

Luồng phát triển chuẩn:

```text
Frontend route: client/src/App.tsx
→ Page: client/src/pages/*
→ Component: client/src/components/*
→ tRPC client: client/src/lib/trpc.ts
→ Router: server/routers/modules/*
→ Service: server/services/*
→ DB helper: server/db/*
→ Schema: drizzle/schema.ts / drizzle/*.ts
```

---

## 3. Simple Mode / Detailed Mode

Simple Mode là baseline chính:

- Ít tab, ít field, ít thao tác.
- Ngôn ngữ nghiệp vụ tự nhiên, dễ hiểu.
- Phù hợp người quản lý vận hành hằng ngày.
- Học viên chỉ thấy những phần liên quan đến bản thân.
- Không đưa cấu hình kỹ thuật ra UI.

Detailed Mode dùng cho phần nâng cao:

- Cấu hình chi tiết.
- Báo cáo sâu.
- Phân công nâng cao.
- Smart assignment / dashboard nâng cao / field visibility nâng cao.

Protected UI principle:

```text
Date / Time / Datetime input phải có picker.
Không để người dùng chỉ nhập text thủ công.
DatePickerInput đã dùng portal để tránh bị modal/card cắt dropdown.
TimePickerInput đã được thêm và dùng cho các field giờ quan trọng.
```

---

## 4. Vai trò và phân quyền

Vai trò chính:

- `manager`: quản trị vận hành.
- `resident`: học viên.
- Appointment roles:
  - `house_leader` — Trưởng nhà.
  - `deputy` — Phó.
  - `secretary` — Thư ký.
  - `treasurer` — Thủ quỹ.
  - `team_leader` — Tổ trưởng.
  - `committee_head` — Trưởng ban.

Nguyên tắc:

- User Management Simple Mode chỉ tạo/quản lý manager user.
- Resident user không tạo thủ công từ User Management, mà đi qua flow học viên.
- Appointment role không gán như role user thường, mà qua nghiệp vụ tổ chức/bổ nhiệm.
- Reset password phải set `mustChangePassword = true`.
- Khi `mustChangePassword = true`, user bị chặn bởi popup đổi mật khẩu, đổi xong force logout/login lại.
- Resident rời/ngừng lưu xá phải bị khóa/deactivate user liên kết.
- Resident quay lại lưu xá có thể reactivate user theo flow đăng ký lại.

---

## 5. Protected business rules

### 5.1. Học viên / phòng / user

- Học viên đã rời/ngừng không được gán phòng trực tiếp.
- Học viên đã có phòng thì không được gán phòng mới, chỉ được chuyển/trả phòng.
- Chuyển phòng phải đóng assignment cũ và cập nhật `currentRoomId`.
- Trả phòng phải đóng assignment và set `currentRoomId = null`.
- Phòng đầy phải chặn gán/chuyển.
- Đăng ký lại không tự reuse phòng cũ.
- Khi rời/ngừng phải release phòng và deactivate user liên kết.

### 5.2. Tổ chức / bổ nhiệm

- `Tổ trưởng` phải scoped theo từng Tổ, không check global.
- `Trưởng ban` phải scoped theo từng Ban, không check global.
- Trưởng/Phó/Thư ký/Thủ quỹ là fixed role singleton theo nhiệm kỳ.
- Tổ trưởng tự là thành viên của Tổ tương ứng.
- Trưởng ban tự là thành viên của Ban tương ứng.
- Nếu học viên còn appointment active thì flow rời lưu xá phải yêu cầu bàn giao trước.
- OrgChart layout phải giữ: Trưởng trên cùng; Phó/Thư ký/Thủ quỹ hàng hai; Tổ/Ban bên dưới.

### 5.3. Công tác / lịch sinh hoạt

- Công tác demo chỉ cần rõ: ngày, nơi làm, người/nhóm phụ trách, trạng thái hoàn thành.
- Conflict với lịch học phải hoạt động.
- Buffer lịch học 60 phút phải giữ.
- Cancel rồi reassign phải được phép.
- Resident chỉ được xem/cập nhật công tác của mình bằng endpoint riêng.
- API quản lý duties phải guard manager.

### 5.4. FinanceLite

- Flow tối thiểu: tạo kỳ thu → áp dụng khoản thu → ghi nhận thanh toán → cập nhật tổng quan/trạng thái.
- Không tạo khoản thu cho học viên đã rời/ngừng.
- Không tạo amount <= 0.
- Không cho thu vượt số còn lại.
- Không cho sửa amount nhỏ hơn paid amount.
- Summary phải phản ánh đúng sau apply/payment/cancel.
- Finance router phải guard manager.

### 5.5. Học tập / lịch học

- Tab Học tập có thông tin học tập và lịch học.
- Giờ học phải dùng TimePicker.
- Backend validate HH:mm.
- End time phải lớn hơn start time.
- Không cho lịch trùng giờ cùng ngày.
- Học viên inactive/transferred_out/left không được cập nhật học tập/lịch học.
- DailyRoutine conflict với lịch học vẫn phải hoạt động.

---

## 6. Trạng thái 10 việc nền đã hoàn tất

| Việc | Nội dung | Trạng thái |
|---|---|---|
| 1 | Đồng bộ Route / Menu / Page | Done / Pass |
| 2 | Audit page orphan | Done |
| 3 | Members / Rooms / Organization main flow | Done / Pass |
| 4 | FinanceLite minimum flow | Done / Pass |
| 5 | DailyRoutine / Công tác mức demo | Done / Pass |
| 6 | Resident Portal theo dữ liệu thật | Done / Pass |
| 7 | Dọn test baseline | Done / Pass |
| 8 | Definition of Done cho module chính | Done |
| 9 | Helper / Style / Picker standardization | Done / Pass |
| 10 | Docs cleanup / file thừa | Done / Pass |

### 6.1. Việc 1 — Route/Menu/Page

Đã xử lý route/menu mismatch:

- `/users` trỏ đúng về route thật `/settings/users`.
- Các menu chưa có route được disabled/ẩn có chủ đích để tránh 404.
- Policy: có menu thì phải có route thật hoặc disabled có chủ đích.

### 6.2. Việc 2 — Page orphan audit

Đã audit 59 page:

- 26 page đã được import/lazy route trong `App.tsx`.
- 33 page orphan đã phân loại `Connect / Keep / Archive`.

Nhóm Archive:

- `ComponentShowcase.tsx`
- `ResidentRolePlaceholderPage.tsx`
- `Residents.tsx`
- `Schedules.tsx`

### 6.3. Việc 3 — Members / Rooms / Organization

Đã pass main flow:

- Tạo/cập nhật học viên.
- Liên hệ gia đình.
- Gán/chuyển/trả phòng.
- Rời/ngừng/đăng ký lại.
- Tổ/Ban/bổ nhiệm.
- Guard legacy endpoint room assignment.
- Guard rooms router mutation theo manager.

### 6.4. Việc 4 — FinanceLite

Đã pass minimum flow:

- RBAC finance router.
- Guard DB finance.
- Create charge batch skip resident inactive.
- Validate amount.
- Payment partial/paid đúng.
- Summary cập nhật đúng.

### 6.5. Việc 5 — DailyRoutine / Công tác

Đã pass demo flow:

- Manager tạo lịch sinh hoạt/công tác.
- Preview phân công.
- Ghi phân công.
- Cập nhật hoàn thành/vắng/hủy.
- Resident xem/cập nhật công tác của mình.
- Guard duties router cho các endpoint quản lý.

### 6.6. Việc 6 — Resident Portal

Đã pass:

- Resident active vào portal.
- Resident inactive/transferred_out bị guard.
- Resident thường không thấy menu manager.
- Resident có chức vụ thấy menu/phạm vi phù hợp.
- Portal đọc dữ liệu profile/today/finance đúng.

### 6.7. Việc 7 — Test baseline

Đã đổi:

```text
server/routers.test.ts → server/routers.legacy.ts
```

Mục tiêu:

- Không để Vitest collect nhầm legacy helper.
- `pnpm check`, `pnpm test`, `pnpm build` pass.

### 6.8. Việc 8 — Definition of Done

Đã tạo/chốt DoD cho 5 module chính:

- Members
- Rooms
- Organization
- DailyRoutine
- FinanceLite

Một module chỉ xem là done khi:

- Có route/menu đúng.
- API khớp UI.
- Business rule đúng.
- Có loading/error/empty state tối thiểu.
- Check/test/build pass.
- Runtime demo pass.

### 6.9. Việc 9 — Helper / Style / Picker

Đã chuẩn hóa:

- Shared helper foundation trong `client/src/lib/format.ts` và `client/src/lib/utils.ts`.
- FinanceLite utility reuse helper chung.
- Thêm `TimePickerInput`.
- Chuyển các time field quan trọng sang TimePicker.
- Fix `DatePickerInput` bị cắt dưới bằng portal.

Protected rule:

```text
Date/time/datetime input không được chỉ là input text trần.
```

### 6.10. Việc 10 — Docs cleanup

Đã cleanup:

- Xóa `.temp_tsc_out*.txt`.
- Archive tài liệu cũ/legacy Manus v1.
- Archive `.docx` trình bày.
- Cập nhật README / STYLE_SYNC_RULES / PROJECT_SUMMARY / documentation status.

---

## 7. Việc 11 — Học tập / Lịch học

**Trạng thái:** Done / Pass.

Mục tiêu:

- Review và hoàn thiện tab Học tập trong chi tiết học viên.
- Đảm bảo thông tin học tập/lịch học dùng được cho demo.
- Đảm bảo công tác conflict với lịch học.

Đã pass:

- Thông tin học tập.
- Tạo/sửa/xóa lịch học.
- TimePicker cho giờ học.
- Validate HH:mm.
- Chặn end <= start.
- Chặn trùng lịch cùng ngày.
- Guard học viên inactive/transferred_out/left.
- DailyRoutine conflict với lịch học vẫn hoạt động.

### 7.1. Việc 11B — Polish layout tab Học tập

Đã quay lại polish UI/layout tab Học tập do modal bị kéo ngang và toolbar lịch học chen chúc.

Lưu ý:

- Patch 11B từng gây lỗi JSX adjacent elements trong `MemberDetailModal.tsx` quanh line ~673.
- Người dùng đã xử lý/revert/fix xong.
- Khi chỉnh lại `MemberDetailModal.tsx`, phải đọc bản mới nhất hiện tại trong repo và rất cẩn thận với wrapper JSX.
- Ưu tiên polish `StudyScheduleSection.tsx` nếu có thể, tránh sửa sâu `MemberDetailModal.tsx` nếu không cần.

---

## 8. Demo full flow cần đạt

Người dùng đang muốn bổ sung để demo full:

| Nhóm | Nội dung | Trạng thái hiện tại |
|---|---|---|
| 1 | Tạo học viên | Done |
| 2 | Gán/chuyển phòng | Done |
| 3 | Tạo liên hệ | Done |
| 4 | Tạo lịch học/thông tin học tập | Done / cần polish UI nếu còn rối |
| 5 | Cơ cấu tổ chức, bổ nhiệm, phân nhiệm, Tổ, Ban | Done / cần review demo |
| 6 | Công tác | Done / cần review demo |
| 7 | Tài chính | Done |
| 8 | Link portal học viên theo chức vụ | Done / cần review demo |
| 9 | Thông báo | Need build/review |
| 10 | Hoạt động khác | Need build/review |
| 11 | Portal học viên: công tác, hoàn thành, tạm ứng/chi | Need expand |
| 12 | Hoạt động cửa hàng: thu chi riêng/sổ riêng | Need lite module |

Yêu cầu chung:

```text
Chức năng đầy đủ, UI/UX đơn giản.
```

---

## 9. Việc 12 — Bước tiếp theo

**Tên việc:** Review Organization + Công tác + Portal theo chức vụ thành một kịch bản demo.

Mục tiêu:

```text
Tổ/Ban → Bổ nhiệm → Phân công công tác → Portal học viên → Portal người có chức vụ
```

Checklist Việc 12:

- [ ] Tạo/chọn nhiệm kỳ demo.
- [ ] Tạo Tổ.
- [ ] Tạo Ban.
- [ ] Thêm học viên vào Tổ.
- [ ] Thêm học viên vào Ban.
- [ ] Bổ nhiệm Trưởng/Phó/Thư ký/Thủ quỹ.
- [ ] Bổ nhiệm Tổ trưởng theo từng Tổ.
- [ ] Bổ nhiệm Trưởng ban theo từng Ban.
- [ ] Kiểm tra OrgChart layout.
- [ ] Tạo công tác theo học viên.
- [ ] Tạo công tác theo phòng.
- [ ] Tạo công tác theo Tổ.
- [ ] Tạo công tác theo Ban.
- [ ] Resident thường thấy công tác của mình.
- [ ] Tổ trưởng thấy phạm vi tổ nếu có.
- [ ] Trưởng ban thấy phạm vi ban nếu có.
- [ ] Resident không thấy menu/API quản lý.
- [ ] Appointed resident không thấy dữ liệu ngoài phạm vi.
- [ ] Có checklist demo 10–15 phút.

File cần cho Việc 12:

```text
client/src/pages/OrganizationSimple.tsx
client/src/components/organization-simple/*
client/src/pages/DailyRoutine.tsx
client/src/components/daily-routine/*
client/src/pages/MyDuties.tsx
client/src/pages/resident/*
client/src/navigation/*
client/src/components/ResidenceCareLayout.tsx
server/routers/modules/organization.ts
server/services/organizationService.ts
server/routers/modules/duties.ts
server/routers/modules/dailyRoutine.ts
server/services/dailyRoutineService.ts
server/db/duty.ts
server/routers/modules/residentPortal.ts
server/services/residentPortalService.ts
server/services/residentPortalAccessService.ts
drizzle/schema.ts
drizzle/residents.ts
drizzle/dailyRoutine.ts
```

Không cần gửi lại file đã có nếu không đổi, nhưng nếu có chỉnh sau patch thì gửi bản mới.

---

## 10. Roadmap sau Việc 12

### Việc 13 — Thông báo nội bộ lite

Scope demo:

- Icon chuông.
- Danh sách thông báo.
- Đã đọc/chưa đọc.
- Tạo thông báo khi giao công tác.
- Tạo thông báo khi tạo khoản thu.
- Resident thấy thông báo của mình.
- Manager thấy thông báo quản trị nếu cần.
- Không cần realtime trong demo.

### Việc 14 — Hoạt động / sự kiện lite

Scope demo:

- Tên hoạt động.
- Ngày/giờ.
- Địa điểm.
- Người/Ban phụ trách.
- Ghi chú.
- Trạng thái: dự kiến / đã diễn ra / hủy.
- Hiển thị portal nếu công khai.

### Việc 15 — Portal học viên mở rộng

Scope:

- Lịch học.
- Thông báo.
- Hoạt động.
- Tài chính cá nhân.
- Công tác và hoàn thành.
- Xem tạm ứng/chi hộ nếu có.

Tạm thời không cho học viên tự tạo đề nghị tạm ứng trong demo, trừ khi chốt nghiệp vụ.

### Việc 16 — Cửa hàng / quỹ riêng lite

Scope demo:

- Sổ thu chi riêng.
- Khoản thu.
- Khoản chi.
- Ngày phát sinh.
- Người ghi nhận.
- Nội dung.
- Số tiền.
- Tổng thu / tổng chi / số dư.
- Lọc theo tháng.
- Không trộn với khoản thu học viên.

### Việc 17 — Demo script 15 phút

Tạo kịch bản thao tác cố định:

```text
Tạo học viên → gán phòng → liên hệ → học tập/lịch học → tổ chức/bổ nhiệm → công tác → tài chính → portal học viên → thông báo/hoạt động nếu có
```

### Việc 18 — Polish UI/UX demo

- Rút gọn màn rối.
- Ưu tiên Simple view.
- Chống overflow ngang.
- Thống nhất picker/date/time.
- Không hiển thị thuật ngữ kỹ thuật.

---

## 11. Checklist trạng thái hiện tại

- [x] Việc 1 Route/Menu/Page
- [x] Việc 2 Page orphan audit
- [x] Việc 3 Members/Rooms/Organization main flow
- [x] Việc 4 FinanceLite
- [x] Việc 5 DailyRoutine/Công tác
- [x] Việc 6 Resident Portal
- [x] Việc 7 Test baseline
- [x] Việc 8 Definition of Done
- [x] Việc 9 Helper/Style/Picker
- [x] Việc 10 Docs cleanup
- [x] Việc 11 Học tập/Lịch học
- [ ] Việc 12 Organization + Công tác + Portal theo chức vụ demo review
- [ ] Việc 13 Thông báo nội bộ lite
- [ ] Việc 14 Hoạt động / sự kiện lite
- [ ] Việc 15 Portal học viên mở rộng
- [ ] Việc 16 Cửa hàng / quỹ riêng lite
- [ ] Việc 17 Demo script 15 phút
- [ ] Việc 18 UI/UX polish demo

---

## 12. Ghi chú vận hành cho các lần làm tiếp

- Làm từng việc một.
- Mỗi việc có audit/checklist/runtime checklist.
- Patch nên gửi dạng zip theo cấu trúc repo.
- Sau pass phải cập nhật checklist và PROJECT_SUMMARY.
- Không hỏi lại file đã gửi nếu người dùng không nói có chỉnh thêm.
- Nếu thiếu file thật sự thì hỏi đúng file thiếu, không hỏi lại cả nhóm.
- Không patch từ file cũ.
- Không làm lan sang module khác nếu scope không yêu cầu.
- Không reintroduce các bug đã fix.

