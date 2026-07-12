# ResidenceCore - Business Process Document (BPD)

Ngay cap nhat: 2026-07-12  
Pham vi tai lieu: tong hop chuc nang va quy trinh nghiep vu theo hien trang da phat trien, uu tien nguon su that tu code va cac file tracking hien hanh.

## 1. Muc tieu tai lieu

- Chuan hoa mo ta nghiep vu theo goc nhin van hanh luu xa.
- Tong hop cac chuc nang da trien khai va trang thai hien tai.
- Dinh nghia checklist de quan ly cong viec, chuc nang va gate pass.
- Lam tai lieu tham chieu de demo, ban giao noi bo, va lap ke hoach tiep theo.

## 2. Nguon su that duoc uu tien

1. PROJECT_SUMMARY.md (tracking append cac Viec moi nhat)
2. RESIDENCECORE_CHECKLIST.md va cac file worklog Viec 14
3. MODULE_DONE_DEFINITION_20260704.md
4. Route frontend App.tsx va appRouter backend server/routers.ts

Ghi chu: mot so tai lieu legacy trong docs/legacy-manus-v1 chi dung de tham khao, khong dung lam nguon su that khi xung dot voi code hien tai.

## 3. Tong quan nghiep vu he thong

ResidenceCore ho tro van hanh luu xa theo mo hinh Simple Mode (gon, de van hanh hang ngay), voi cac nhom nghiep vu chinh:

- Quan ly hoc vien va trang thai luu tru.
- Quan ly phong o va lich su gan/chuyen/tra phong.
- Quan ly to chuc noi bo theo nhiem ky va bo nhiem.
- Quan ly sinh hoat hang ngay va cong tac/truc nhat.
- Quan ly tai chinh lite: ky thu, khoan thu, thanh toan, tong quan.
- Resident Portal: thong tin ca nhan, hom nay, cong tac, tai chinh, thong bao, hoat dong.
- Hoat dong/Su kien lite cho manager va resident portal (public activities).
- Thong bao noi bo lite (popup + badge + inbox thong bao).

## 4. Doi tuong su dung va vai tro

- Manager:
  - Quan ly cac module chinh (members, rooms, organization, daily routine, finance, activities).
  - Co quyen tao/cap nhat/huy cac doi tuong nghiep vu trong pham vi duoc guard.
- Resident:
  - Truy cap resident portal de xem thong tin lien quan ban than.
  - Thuc hien mot so thao tac ca nhan nhu danh dau thong bao da doc, cap nhat cong tac cua minh.

## 5. Danh muc module va trang thai hien tai

### 5.1 Module da pass o muc main flow

- Members / Rooms / Organization: Done/Pass.
- FinanceLite minimum flow: Done/Pass.
- DailyRoutine demo flow: Done/Pass.
- Resident Portal theo du lieu that: Done/Pass.
- Notification Lite (Viec 13): Done/Pass.

### 5.2 Module dang o giai doan hoan thien tiep

- Activities / Events Lite (Viec 14):
  - Da co backend router/service/db + manager page + resident page.
  - Da qua nhieu vong polish UI/UX (14A den 14I).
  - Trang thai tracking: patch da tao theo tung buoc; can chot runtime check/check/test/build theo checklist Viec 14 de dong viec.

## 6. Quy trinh nghiep vu chuan theo module

## 6.1 Quy trinh tiep nhan hoc vien va bo tri cho o

Muc tieu: dua hoc vien vao he thong va bo tri phong dung quy tac suc chua.

Buoc nghiep vu:

1. Tao ho so hoc vien (Members).
2. Cap nhat thong tin lien he gia dinh (neu co).
3. Gan phong lan dau (Rooms).
4. He thong kiem tra dieu kien:
   - Hoc vien dang active.
   - Chua co phong hien tai.
   - Phong con cho.
5. Luu current room va lich su room assignments.

Ket qua:

- Hoc vien co trang thai luu tru ro rang.
- Phong cap nhat dung so nguoi dang o.
- Co du lieu truy vet lich su gan/chuyen/tra phong.

## 6.2 Quy trinh chuyen phong/tra phong

1. Chon hoc vien da co phong hien tai.
2. Chuyen phong hoac tra phong.
3. He thong chan cac truong hop sai:
   - Chuyen cung phong.
   - Phong dich da day.
4. Dong assignment cu, mo assignment moi (neu chuyen phong).

Ket qua:

- currentRoomId va roomAssignments dong bo.
- Khong vuot suc chua phong.

## 6.3 Quy trinh bo nhiem to chuc noi bo

1. Chon hoc vien dang active.
2. Chon nhiem ky/chuc vu/to hoac ban (neu role yeu cau scope).
3. He thong kiem tra rang buoc:
   - Gioi han so luong role co max = 1.
   - Khong duplicate bo nhiem sai quy tac.
4. Luu appointment va cap nhat role duoc gan theo bo nhiem.
5. Khi ket thuc bo nhiem, role duoc thu hoi theo flow.

Ket qua:

- Co cau hien tai ro rang.
- Role user dong bo voi nghiep vu bo nhiem.

## 6.4 Quy trinh cong tac hang ngay (DailyRoutine)

1. Manager tao mau lich/tao cong tac.
2. Preview phan cong (ngay/tuan/thang) truoc khi ghi.
3. Ghi phan cong.
4. Theo doi va cap nhat trang thai thuc hien:
   - Hoan thanh.
   - Vang/khong lam.
   - Huy.
5. Resident cap nhat cong tac cua chinh minh tren portal.

Ket qua:

- Luong phan cong va theo doi cong tac chay xuyen suot manager -> resident.

## 6.5 Quy trinh tai chinh lite

1. Tao loai khoan thu va ky thu.
2. Preview danh sach hoc vien ap dung theo thang.
3. Apply ky thu -> sinh khoan phai thu.
4. Ghi nhan thanh toan (toan phan hoac mot phan).
5. He thong cap nhat trang thai no va tong quan tai chinh.
6. Khong cho phep cac tinh huong sai:
   - Amount <= 0.
   - Thu vuot so con lai.
   - Tao trung khoan thu theo rang buoc nghiep vu.

Ket qua:

- Tong quan tai chinh cap nhat dung theo bien dong thu/chi/no.

## 6.6 Quy trinh thong bao noi bo lite (Viec 13 - DONE/PASS)

1. He thong phat sinh thong bao tu cac su kien nghiep vu (cong tac, tai chinh).
2. Resident nhan thong bao ca nhan trong portal.
3. Hien thi theo 3 diem cham:
   - Popup thong bao moi trong layout.
   - Badge so luong chua doc tren menu.
   - Trang inbox thong bao de loc/xu ly.
4. Resident danh dau da doc.
5. Badge/popup duoc dong bo lai sau mark-read (invalidate + polling nhe).

Pham vi gioi han:

- Khong realtime websocket.
- Khong push mobile/email/SMS/Zalo.

## 6.7 Quy trinh hoat dong/su kien lite (Viec 14 - dang hoan thien)

1. Manager tao/sua/huy/xoa mem hoat dong.
2. Hoat dong co thuoc tinh trang thai, loai, ngay-gio, dia diem, phu trach, cong khai portal.
3. Neu bat isPublicOnPortal thi resident thay tren resident activities.
4. Neu tat isPublicOnPortal thi chi noi bo manager thay.
5. UI duoc polish theo premium style dong bo he thong qua cac vong 14C-14I.

Trang thai:

- Nguon luc ky thuat da day du cho flow lite.
- Can gate runtime + check/test/build theo checklist Viec 14 de chot pass cuoi.

## 7. RBAC va kiem soat truy cap

- Cac router quan ly chinh yeu cau manager access (members, rooms, organization, daily routine management, finance, activities).
- Resident portal API hoat dong theo user dang nhap va boi canh resident cua user do.
- Notification resident chi xem/mark-read du lieu cua chinh minh.

## 8. Checklist chuc nang (Functional Checklist)

## 8.1 Core operation checklist

- [x] Quan ly hoc vien (tao/sua/trang thai luu tru).
- [x] Quan ly phong (gan/chuyen/tra + suc chua).
- [x] Quan ly to chuc (to/ban/nhiem ky/bo nhiem).
- [x] DailyRoutine + cong tac demo flow.
- [x] FinanceLite minimum flow.
- [x] Resident Portal core pages.
- [x] Notification Lite end-to-end (Viec 13).
- [~] Activities Lite manager + resident public (Viec 14 dang can gate pass cuoi).

## 8.2 Route/menu integrity checklist

- [x] Cac route chinh manager va resident da map tren App.tsx.
- [x] App router backend da dang ky module core.
- [x] Notification resident route co menu va trang thuc.
- [ ] Chot lai danh muc trang legacy/orphan de tranh nham voi main flow (nen audit dinh ky).

## 9. Checklist cong viec van hanh va release

## 9.1 Checklist truoc khi chot mot Viec

- [ ] Doi chieu checklist Viec va update append-only vao file tracking.
- [ ] Chay pnpm check.
- [ ] Chay pnpm test.
- [ ] Chay pnpm build.
- [ ] Runtime test theo user journey manager va resident.
- [ ] Khong phat sinh 404 tren route/menu trong luong chinh.
- [ ] Neu doi business rule: cap nhat PROJECT_SUMMARY.md va tai lieu lien quan.

## 9.2 Checklist QA nghiep vu toi thieu

- [ ] Members: them/sua/trang thai hoc vien + lien he.
- [ ] Rooms: gan/chuyen/tra phong, khong vuot suc chua.
- [ ] Organization: bo nhiem dung scope, dung rang buoc.
- [ ] DailyRoutine: tao va cap nhat cong tac, resident thao tac duoc duty cua minh.
- [ ] Finance: apply ky thu va ghi thanh toan khong sai so du.
- [ ] Notifications: popup + badge + inbox + mark-read dong bo.
- [ ] Activities: manager CRUD + resident chi thay hoat dong public.

## 10. Cong viec uu tien tiep theo

1. Dong Viec 14 bang gate check/test/build + runtime checklist day du.
2. Sau khi Viec 14 pass, update PROJECT_SUMMARY.md theo append-only.
3. Tao bo test regression ngan cho cac flow da pass (Members/Rooms/Organization/Finance/DailyRoutine/Portal/Notifications).
4. Lap tai lieu User SOP ngan gon cho Manager va Resident dua tren BPD nay.

## 11. Dinh dang su dung tai lieu

Tai lieu nay dung de:

- Trinh bay tong the du an cho stakeholder.
- Lam baseline cho buoi demo nghiep vu.
- Lam gate review truoc khi dong Viec.
- Lam dau vao cho tai lieu SOP/User Manual ban moi (khong dung tai lieu legacy cu).
