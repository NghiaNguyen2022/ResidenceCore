# RESIDENCECORE_CHECKLIST_VIEC15_IN_PROGRESS

> Tracking Việc 15 — Portal học viên mở rộng / gom trải nghiệm học viên.  
> Quy tắc: append-only, không ghi đè lịch sử.

## Bối cảnh

Sau Việc 14, các module quản trị đã tương đối đủ cho demo: học viên, phòng, liên hệ, học tập, tổ chức, công tác, tài chính, thông báo, hoạt động/sự kiện. Việc 15 tập trung gom trải nghiệm Portal học viên để demo một vòng từ phía học viên.

## 15A — Portal activities route

- Đã audit portal.
- Phát hiện menu đã có Hoạt động nhưng route `/resident/activities` có nguy cơ thiếu trong App.
- Patch thêm route portal activities.
- Trạng thái: đã patch.

## 15B — Portal Today polish nhẹ

- Patch polish nhẹ trang `ResidentToday.tsx`.
- Kết quả: chưa đủ rõ về style, user phản hồi chưa thấy thay đổi đáng kể.
- Trạng thái: không chốt pass.

## 15C — Portal Today visible premium restyle

- Restyle rõ hơn trang Hôm nay của học viên.
- Hero centered, nền trắng/kem/amber, summary gold cards.
- Giữ logic công tác cá nhân/phòng/tổ/ban.
- User xác nhận: PASS.

## 15D — MyDuties polish

- Có patch polish `MyDuties.tsx` nhưng phát hiện route `/my-duties` chưa nằm rõ trong menu portal.
- Không chốt pass.
- Quyết định: gom lại menu trước rồi mới tiếp tục chuẩn hóa công tác.

## 15E — Gọn menu Portal học viên

- Đưa Công tác vào menu chính, gom một phần các mục portal.
- User vẫn thấy rời rạc, cần gom tiếp.
- Trạng thái: pass bước đầu nhưng chưa đủ tối ưu.

## 15F — Gom tiếp menu Portal học viên

- Menu học viên thường chỉ còn:
  - Hôm nay
  - Lưu xá của tôi
    - Hồ sơ
    - Công tác
    - Tài chính
    - Thông báo
    - Hoạt động
- Nếu có chức vụ thì thêm:
  - Phụ trách
    - Tổng quan
    - Điều hành
    - Tổ phụ trách
    - Ban phụ trách
- Giữ route/page cũ, chỉ đổi navigation.
- User xác nhận: PASS.

## Trạng thái hiện tại

- 15A: đã patch
- 15B: chưa chốt, thay bằng 15C
- 15C: PASS
- 15D: chưa chốt do menu/route chưa rõ
- 15E: pass bước đầu, nhưng cần gom tiếp
- 15F: PASS

## Bước tiếp theo đề xuất

15G — Chuẩn hóa trang Công tác sau khi đã gom vào menu `Lưu xá của tôi`.

Checklist 15G:

- [ ] Rà route Công tác trong menu mới.
- [ ] Trang Công tác dùng style cùng hệ với Portal Today 15C.
- [ ] Giữ logic cá nhân/phòng/tổ/ban từ Việc 12C.
- [ ] Không làm mất badge/notification.
- [ ] Không đổi backend nếu không cần.

## 15G — Chuẩn hóa trang Công tác trong menu mới

- Patch `MyDuties.tsx` để trang Công tác nằm đúng ngữ cảnh `Lưu xá của tôi`.
- Style đồng bộ với Portal Today 15C.
- Giữ nguyên logic công tác cá nhân/phòng/tổ/ban đã pass ở Việc 12C.
- User xác nhận: DONE/PASS.

## 15H — Rà Tài chính của tôi trong Portal

- Audit `ResidentFinance.tsx` từ bộ file portal hiện có.
- Trang đã có style premium tương đối tốt và đủ các khối: khoản cần đóng, lịch sử thanh toán, tạm ứng/thực chi.
- Phát hiện modal cập nhật thực chi tạm ứng còn dùng input `type=date`, không đúng rule picker toàn hệ thống.
- Patch nhỏ đổi trường `Ngày chi` sang `FormDateInput` shared.
- Không đổi backend/API/schema/logic tài chính.
- Trạng thái: đã patch, chờ test.

Checklist test 15H:

- [ ] Login resident có dữ liệu tài chính.
- [ ] Mở `Lưu xá của tôi > Tài chính`.
- [ ] Khoản cần đóng hiển thị đúng.
- [ ] Lịch sử thanh toán hiển thị đúng.
- [ ] Nếu có tạm ứng, mở modal `Cập nhật chi`.
- [ ] Trường `Ngày chi` dùng DatePicker/FormDateInput, không phải input text/date thô.
- [ ] Lưu thực chi vẫn hoạt động.

---

## 15I — Resident Finance currency input — PASS

Status: PASS.

User confirmed 15I pass.

Completed:
- Form field `Số tiền thực chi` in Resident Finance now formats money input using Vietnamese thousand separators.
- Example: `1000000` displays as `1.000.000`.
- Save flow still sends numeric amount to backend.
- No backend/API/schema changes.
- Preserved 15H FormDateInput picker fix for `Ngày chi`.

Next:
- Continue Việc 15 with remaining Portal pages, likely `15J — Polish/verify Hoạt động công khai on resident portal` or final Portal full-flow checklist if no more blockers.

---

## 15J — Portal remaining pages premium polish (Hoạt động + Thông tin)

Status: PATCH READY / PENDING TEST

Scope:
- `client/src/pages/ResidentActivities.tsx`
- `client/src/pages/ResidentInformation.tsx`

Checklist:
- [x] Portal Activities dùng page/header/content style gần FinanceLite/Portal Today hơn.
- [x] Portal Activities bỏ dropdown loại hoạt động, chuyển sang pill filter để tránh overlay/chồng layout.
- [x] Portal Activities giữ public-only data, không đổi API/backend/schema.
- [x] Portal Information đổi sang premium shell, card trắng/kem/amber, CTA gọn.
- [x] Không đổi navigation sau 15F.
- [x] Không đổi logic finance/duty/notification.
- [ ] `pnpm check` pass.
- [ ] `pnpm test` pass.
- [ ] `pnpm build` pass.
- [ ] Runtime: `/resident/activities` hiển thị hoạt động công khai, filter/search hoạt động.
- [ ] Runtime: `/resident/information` nhìn đồng bộ style portal premium.

