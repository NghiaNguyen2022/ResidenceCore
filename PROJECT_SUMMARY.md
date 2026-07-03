# ResidenceCore Project Summary

## 1. Tổng quan sản phẩm và bối cảnh

ResidenceCore là ứng dụng quản lý nội trú / lưu xá dành cho học viên, quản lý lưu xá và đội ngũ vận hành. Dự án không chỉ là một giao diện demo, mà là nền tảng để vận hành một cơ sở lưu xá thực tế: quản lý cư dân, phòng ở, người dùng, tổ chức, duties, lịch sinh hoạt, tài chính và sẵn sàng mở rộng cho phụ huynh và cổng học viên ở giai đoạn sau.

Tài liệu [Full-Project-context20260612.md](Full-Project-context20260612.md) là nguồn ngữ cảnh nghiệp vụ chính. Nội dung đó cho thấy dự án đang tập trung vào việc ổn định phần vận hành nội bộ trước khi mở rộng sang các phân hệ lớn hơn.

### Mục tiêu cốt lõi

- quản lý học viên lưu trú một cách rõ ràng, chuyên nghiệp
- quản lý phòng ở, gán phòng, chuyển phòng, trả phòng
- quản lý người dùng và phân quyền theo vai trò đơn giản, dễ dùng
- quản lý cơ cấu tổ chức lưu xá: nhiệm kỳ, chức vụ, tổ, ban, bổ nhiệm
- quản lý lịch sinh hoạt hằng ngày và công tác trực nhật/công tác chung
- chuẩn bị nền cho các module tiếp theo: hoạt động/sự kiện, nội quy, thông báo, tài chính, phụ huynh, cổng học viên

### Nguyên tắc triển khai đã thống nhất

- làm từng bước nhỏ, có thể test ngay
- ưu tiên triển khai theo thứ tự: schema/database -> backend/router/service -> frontend page/component -> test nghiệp vụ
- Simple Mode là baseline chính: gọn, đủ dùng, dễ hiểu cho người quản lý
- Detailed Mode giữ lại phần nâng cao, không làm rối Simple Mode
- UI nghiệp vụ phải dùng từ tự nhiên, chuyên nghiệp, dễ hiểu
- các chức năng quản lý phải ổn định trước khi mở rộng cho học viên/phụ huynh

## 2. Phạm vi người dùng và vai trò

### 2.1. Quản lý lưu xá / Manager

Đây là vai trò chính trong giai đoạn hiện tại. Người quản lý cần:

- quản lý danh sách học viên
- theo dõi trạng thái học viên: đang ở, đã ngừng, đã rời
- gán/chuyển/trả phòng
- quản lý phòng và sức chứa
- quản lý người dùng đăng nhập
- quản lý cơ cấu tổ chức, nhiệm kỳ, bổ nhiệm
- quản lý lịch sinh hoạt, công tác hằng ngày
- theo dõi công việc chưa làm, quá giờ, đã hoàn thành
- điều chỉnh hệ thống ở Simple Mode hoặc Detailed Mode

### 2.2. Học viên lưu trú / Resident

Ở giai đoạn tiếp theo, học viên cần có cổng riêng để:

- xem hồ sơ cá nhân
- xem phòng ở và bạn cùng phòng
- xem liên hệ gia đình
- xem lịch sinh hoạt hằng ngày
- xem công tác được phân công
- xem tài chính cá nhân
- đổi mật khẩu
- nhận thông báo và nhắc nhở

### 2.3. Phụ huynh / Guardian

Chưa là ưu tiên đầu tiên, nhưng đã có hướng mở rộng cho:

- xem thông tin liên hệ
- theo dõi tình trạng lưu trú và các thông tin cơ bản của con/em
- xem thông báo quan trọng
- theo dõi các khoản tài chính nếu hệ thống cho phép

### 2.4. Vai trò bổ nhiệm trong tổ chức

Vai trò quản lý nội bộ theo nhiệm kỳ có thể bao gồm:

- trưởng
- phó
- thư ký
- thủ quỹ
- tổ trưởng
- trưởng ban

Các vai trò này không nên được tạo như role thông thường trong User Management, mà nên được gán qua nghiệp vụ bổ nhiệm / tổ chức.

## 3. Simple Mode và Detailed Mode

### 3.1. Simple Mode

Simple Mode là chế độ chính để triển khai MVP. Mục tiêu là giảm rối, đủ dùng, ưu tiên nghiệp vụ quản lý thường ngày.

Đặc điểm:

- màn hình gọn
- tránh quá nhiều trường cấu hình
- không hiển thị cấu hình kỹ thuật hoặc ít dùng
- người quản lý có thể thao tác nhanh
- các module nâng cao có thể ẩn khỏi menu

Ví dụ:

- User Management chỉ quản lý user manager trong Simple Mode
- Resident user được tạo qua flow học viên/bổ nhiệm, không tạo thủ công từ User Management
- Tổ chức lưu xá gom thành một màn hình đơn giản
- Sinh hoạt hằng ngày gom lịch sinh hoạt và duties trong một module, nhưng UI tách rõ từng phần

### 3.2. Detailed Mode

Detailed Mode dành cho cấu hình nâng cao hoặc phần chưa muốn đưa vào Simple Mode. Có thể giữ:

- cấu hình vai trò chi tiết
- màn hình duties cũ nếu cần fallback
- các màn hình chi tiết về quyền và cấu hình nâng cao
- báo cáo và phân tích sâu hơn

### 3.3. Global display mode

Chế độ Simple/Detailed là cấu hình toàn hệ thống, không phải mỗi chức năng tự chọn riêng. Frontend có thể dùng cơ chế như `useSystemDisplayMode()` để lấy `isSimple` và `isDetailed`.

## 4. Nguyên tắc nghiệp vụ quan trọng

### 4.1. Học viên và trạng thái lưu trú

Trạng thái cần thể hiện rõ bằng tiếng Việt:

- Đang ở
- Đã ngừng
- Đã rời
- Chưa gán phòng
- Có phòng

Khi học viên đã rời/ngừng:

- không cho gán phòng mới trực tiếp
- không cho cập nhật thông tin không cần thiết
- không cho thêm liên hệ từ detail nếu đã rời/ngừng
- cho phép đăng ký lại nếu quay lại lưu xá
- khi đăng ký lại, không tự reuse phòng cũ; phải gán lại theo hiện trạng
- nếu có user liên kết thì user phải khóa/deactivate khi rời/ngừng
- khi quay lại thì có thể reactivate user theo flow đăng ký lại

### 4.2. Phòng ở

Phòng có các thuộc tính cơ bản:

- mã phòng
- tên phòng
- sức chứa
- số đang ở
- số còn trống

Quy tắc:

- không cho gán quá sức chứa
- nếu học viên đã có phòng thì chỉ cho chuyển phòng hoặc trả phòng, không gán phòng mới
- khi gán/chuyển/trả phòng phải cập nhật hiện trạng phòng và current room của học viên
- lịch sử gán/chuyển phòng cần được lưu để truy vết
- trong Simple Mode, tác vụ nhanh cần có: xem danh sách phòng, thêm phòng, sửa phòng
- sửa phòng chỉ cho sửa tên phòng và sức chứa, không sửa mã phòng

### 4.3. Liên hệ gia đình / phụ huynh

Quy tắc:

- cha/mẹ/người giám hộ là một contact riêng, không nhập lẫn
- cần validate trùng tên/số điện thoại ở mức phù hợp
- có view tổng hợp tất cả phụ huynh
- khi thêm từ All Parents phải chọn học viên
- contacts list nên truy cập từ Members page/modal, không nhất thiết là menu riêng trong Simple Mode

### 4.4. Người dùng và phân quyền

Vai trò đã thống nhất gồm:

- manager
- resident
- appointment roles: team_leader, committee_head, house_leader, deputy, secretary, treasurer

Quy tắc Simple Mode:

- User Management chỉ cho manager tạo manager user
- không tạo resident user trực tiếp từ User Management
- resident user được tạo từ flow học viên
- appointment role được gán từ flow tổ chức/bổ nhiệm
- reset password: set `mustChangePassword = true`, trả về mật khẩu mặc định, user bắt buộc đổi mật khẩu khi đăng nhập
- update user không được đổi role trong Simple Mode
- manager có thể lock/unlock manager user
- resident user hiển thị trạng thái và linked profile
- không cho link/unlink resident từ User Management trong Simple Mode

### 4.5. Chính sách mật khẩu

Quy tắc:

- user mặc định admin: username `admin`, role `manager`, password default `admin`, `mustChangePassword = true`
- nếu `mustChangePassword = true`:
  - chặn tất cả màn hình
  - hiển thị popup đổi mật khẩu duy nhất
  - sau khi đổi thành công, set `mustChangePassword = false`
  - force logout
  - user phải đăng nhập lại

### 4.6. Tổ chức lưu xá và bổ nhiệm

Menu Simple Mode nên bao gồm:

- Cơ cấu hiện tại
- Bổ nhiệm
- Danh sách Tổ
- Danh sách Ban
- Danh sách Chức vụ

Các phần này nên được tổ chức rõ để người quản lý hiểu nhanh ai đang giữ vai trò gì, nhiệm kỳ nào, và tổ/ban nào đang phụ trách gì.

## 5. Kiến trúc hệ thống và flow code thực tế

Để đọc hiểu dự án nhanh nhất, hãy đi theo đúng đường đi dữ liệu sau:

1. Người dùng vào app qua [client/src/App.tsx](client/src/App.tsx)
   - nơi khai báo route chính và lazy load các page

2. App render layout chung qua [client/src/components/ResidenceCareLayout.tsx](client/src/components/ResidenceCareLayout.tsx)
   - layout chịu trách nhiệm shell, navigation, phân quyền và context chung

3. Mỗi chức năng đi vào một page trong [client/src/pages](client/src/pages)
   - page chứa logic nghiệp vụ chính của một module

4. Page gọi component và hook trong [client/src/components](client/src/components) và [client/src/hooks](client/src/hooks)
   - component dùng để tách UI và logic thành các khối nhỏ

5. Dữ liệu được lấy qua server layer trong [server](server)
   - router, service, storage, db layer nối lên database

6. Schema và migration nằm trong [drizzle](drizzle) và [server/db.ts](server/db.ts)
   - đây là nguồn chân lý cho dữ liệu nghiệp vụ

Một flow điển hình nên được hiểu theo mẫu:

- route -> page -> component -> hook/context -> API/router -> database

Nếu chỉ đọc theo kiểu “đọc file ngẫu nhiên”, người mới sẽ khó hiểu hệ thống. Cách đúng là đi theo một user journey cụ thể, ví dụ: tạo/hiện cư dân -> gán phòng -> xem duties -> xem finance.

## 6. Kiến trúc frontend hiện tại

Frontend đang đi theo hướng module-based, chia rõ các tầng:

- routing layer: [client/src/App.tsx](client/src/App.tsx)
- layout layer: [client/src/components/ResidenceCareLayout.tsx](client/src/components/ResidenceCareLayout.tsx)
- page layer: [client/src/pages](client/src/pages)
- shared component layer: [client/src/components](client/src/components)
- helper và util layer: [client/src/lib](client/src/lib)
- context/hook layer: [client/src/contexts](client/src/contexts) và [client/src/hooks](client/src/hooks)

Điểm mạnh của cách tổ chức này là:

- dễ thêm module mới
- dễ giữ UI thống nhất
- dễ tách logic nghiệp vụ khỏi giao diện
- dễ thay đổi hoặc refactor một phần mà không làm ảnh hưởng toàn bộ app

## 7. Style và UI system

Dự án có một hệ thống style rõ ràng, tập trung vào shared foundation trong [client/src/components/shared/styleMedium.ts](client/src/components/shared/styleMedium.ts).

Phong cách hiện tại có các đặc điểm:

- nền nhẹ, ấm và có cảm giác premium
- card/section/panel có viền, bóng và khoảng cách rõ ràng
- button và action area có sự thống nhất
- layout có cấu trúc nguyên tắc: header, toolbar, filter/search, content area, action footer

Điều này cho thấy UI không phải là “random styling”, mà là một hệ thống có nguyên tắc. Khi thêm page mới, nên ưu tiên dùng lại foundation style hiện có thay vì viết style ad-hoc rải rác.

## 8. Các module nghiệp vụ chính cần hiểu

### 8.1. Quản lý cư dân và phòng ở

Các quy tắc nghiệp vụ quan trọng:

- học viên có trạng thái rõ ràng: đang ở, đã ngừng, đã rời, chưa gán phòng
- phòng có sức chứa và số người đang ở
- không cho gán quá sức chứa
- gán/chuyển/trả phòng phải cập nhật trạng thái phòng và current room
- trạng thái rời/ngừng cần xử lý khác với hồ sơ bình thường

### 8.2. Người dùng và phân quyền

Vai trò chính đã thống nhất gồm:

- manager
- resident
- appointment roles như team leader, committee head, house leader, deputy, secretary, treasurer

Quy tắc quan trọng:

- Simple Mode không nên tạo resident user thủ công từ User Management
- resident user nên được tạo từ flow học viên
- appointment role nên gán từ flow tổ chức/bổ nhiệm
- reset password và mustChangePassword là một flow riêng, không nên bỏ qua

### 8.3. Tổ chức và bổ nhiệm

Module tổ chức cần hiểu:

- cơ cấu hiện tại
- bổ nhiệm theo nhiệm kỳ
- chức vụ và vai trò
- tổ/ban và trách nhiệm phân công

### 8.4. Duties và lịch sinh hoạt

Đây là phần vận hành thường ngày của lưu xá:

- công việc được giao
- công việc đã làm/chưa làm/quá giờ
- lịch sinh hoạt hằng ngày
- nhiệm vụ trực nhật và chung

### 8.5. Finance-lite

Finance module là một trong những module đã có mức độ hoàn thiện khá cao. Cần hiểu các khái niệm:

- kỳ thu
- khoản phí
- thu chi
- tạm ứng
- chứng từ

## 9. Component và module nên đọc trước

Nếu muốn nắm dự án nhanh, nên đọc theo thứ tự sau:

1. [client/src/App.tsx](client/src/App.tsx)
   - hiểu route và các module chính

2. [client/src/components/ResidenceCareLayout.tsx](client/src/components/ResidenceCareLayout.tsx)
   - hiểu layout chung, navigation, role context

3. [client/src/components/shared/styleMedium.ts](client/src/components/shared/styleMedium.ts)
   - hiểu phong cách UI chuẩn của dự án

4. [client/src/pages](client/src/pages)
   - hiểu các module nghiệp vụ chính

5. [client/src/components](client/src/components)
   - hiểu các block UI dùng lại

6. [server/routers.ts](server/routers.ts) và [server/storage.ts](server/storage.ts)
   - hiểu API và tầng dữ liệu

7. [drizzle](drizzle) và [server/db.ts](server/db.ts)
   - hiểu cấu trúc dữ liệu thật sự

## 10. Cách nắm vững dự án nhất có thể

Để hiểu sâu và không bị lạc khỏi bối cảnh, hãy làm theo 5 bước sau:

1. Đọc trước bối cảnh nghiệp vụ từ [Full-Project-context20260612.md](Full-Project-context20260612.md)
   - hiểu mục tiêu sản phẩm và các rule nghiệp vụ cốt lõi

2. Đọc route và layout trước
   - xem [client/src/App.tsx](client/src/App.tsx) và [client/src/components/ResidenceCareLayout.tsx](client/src/components/ResidenceCareLayout.tsx)

3. Chọn 1 module duy nhất để đi từ đầu đến cuối
   - ví dụ: cư dân -> phòng -> user -> duties

4. Theo dõi từ frontend xuống backend
   - page -> component -> hook/context -> router/service -> db schema

5. Luôn hỏi 3 câu khi đọc một file:
   - file này phục vụ mục đích gì?
   - nó thuộc module nào?
   - nó ảnh hưởng tới flow nào của người dùng?

## 11. Nguyên tắc làm việc khi tiếp tục phát triển

- ưu tiên main flow trước, không làm quá nhiều module nhỏ trước khi flow chính ổn
- giữ UI đơn giản nhưng đủ nghiệp vụ
- dùng shared style và shared helper thay vì lặp code
- khi refactor, giữ logic nghiệp vụ nguyên vẹn
- khi thêm feature mới, nên xây theo pattern: page -> component -> shared util/style -> API

## 12. Tiến độ hiện tại, checklist và độ ưu tiên

### 12.1. Tình trạng tổng thể

Dự án đã đi được khá xa về mặt nền tảng và khung chức năng. Hiện tại có thể nhìn nhận theo 3 mức:

- Đã có nền tảng: routing, layout, page chính, shared style và một số module nghiệp vụ cơ bản
- Đã hình thành các flow chính: cư dân, phòng, tổ chức, duties, finance-lite
- Còn cần củng cố: chuẩn hóa code, kiểm tra lỗi, làm sạch tài liệu và tăng độ ổn định của các flow chính

### 12.2. Checklist công việc

| Hạng mục | Trạng thái | Ưu tiên | Ghi chú |
|---|---|---|---|
| Xây dựng route chính và layout chung | [x] Đã làm | P0 | Đã có khung app và navigation cơ bản |
| Xây dựng page chính cho module quản lý | [x] Đã làm | P0 | Các page nghiệp vụ đã hình thành |
| Module cư dân và phòng ở | [x] Đã làm | P0 | Flow cơ bản đã có |
| Module tổ chức, bổ nhiệm và duties | [x] Đã làm | P1 | Cần kiểm tra lại tính nhất quán và trải nghiệm |
| Module finance-lite | [x] Đã làm | P1 | Có mức độ hoàn thiện khá tốt, cần rà soát logic và dữ liệu |
| Shared style foundation | [x] Đã làm | P1 | UI đã có hệ thống chung, cần tiếp tục dùng thống nhất |
| Gom helper/shared util | [ ] Chưa đầy đủ | P1 | Cần tiếp tục chuẩn hóa |
| Cleanup tài liệu và file thừa | [ ] Chưa đầy đủ | P2 | Cần rà soát thêm để gọn và dễ đọc |
| Làm sạch lỗi TypeScript / build issues | [ ] Chưa đầy đủ | P1 | Cần ưu tiên để tăng độ ổn định |
| Kiểm tra full flow nghiệp vụ từ frontend đến backend | [ ] Chưa đầy đủ | P0 | Đây là việc cần làm ngay trước khi mở rộng |
| Chuẩn hóa business rules trạng thái cư dân, phòng, user | [ ] Chưa đầy đủ | P0 | Rất quan trọng để tránh logic sai |
| Kiểm thử end-to-end cho flow chính | [ ] Chưa đầy đủ | P0 | Cần có kiểm thử thực tế hơn |

### 12.3. Độ ưu tiên

- P0: ưu tiên cao nhất
  - flow chính vận hành: cư dân, phòng, user, duties, finance
  - logic nghiệp vụ và trạng thái dữ liệu
  - kiểm thử và sửa lỗi nghiêm trọng

- P1: ưu tiên trung bình
  - chuẩn hóa UI và shared components
  - gom helper và cấu trúc code
  - làm sạch TypeScript và lỗi nhỏ hơn

- P2: ưu tiên thấp hơn
  - tài liệu, cleanup, file thừa, refactor không ảnh hưởng nghiệp vụ

### 12.4. Cách đọc tiến độ đúng nhất

Khi xem tiến độ của dự án, nên đánh giá theo 3 lớp:

1. Lớp nghiệp vụ: chức năng có chạy đúng không?
2. Lớp kỹ thuật: code có rõ ràng, có dùng chung, có ổn định không?
3. Lớp vận hành: người quản lý có dùng được nhanh, rõ ràng và ít lỗi không?

Nếu một module đã có UI nhưng chưa ổn về logic hoặc chưa test đầy đủ, thì vẫn chưa nên xem là “xong”.

### 12.5. Checklist 5 việc làm trước

- [ ] 1) Chuẩn hóa business rules cư dân - phòng - user (P0)
   - Chốt rule cho trạng thái Đang ở / Đã ngừng / Đã rời.
   - Khóa gán phòng và cập nhật không hợp lệ khi cư dân đã rời/ngừng.
   - Đảm bảo deactivate/reactivate user đúng theo flow rời và đăng ký lại.

- [ ] 2) Kiểm tra full flow nghiệp vụ chính từ frontend đến backend (P0)
   - Đi theo flow: tạo cư dân -> gán/chuyển/trả phòng -> user -> duties -> finance-lite.
   - Ghi lại các điểm mismatch giữa UI, router và DB để sửa dứt điểm.

- [ ] 3) Bổ sung test cho các case nghiệp vụ trọng yếu (P0)
   - Ưu tiên test các case dễ sai: phòng đầy, cư dân đã rời, reset password, khóa user.
   - Bổ sung test hồi quy cho duties và finance-lite sau các thay đổi business rule.

- [ ] 4) Hoàn tất làm sạch lỗi TypeScript/build và giữ xanh pipeline (P1)
   - Duy trì `pnpm check`, `pnpm test`, `pnpm build` luôn pass sau mỗi nhóm chỉnh sửa.
   - Xử lý cảnh báo/chunk lớn theo từng bước nếu ảnh hưởng vận hành.

- [ ] 5) Gom helper/shared util còn phân tán (P1)
   - Chuẩn hóa nhóm util format/date/money dùng chung để giảm lặp logic giữa page.
   - Ưu tiên module Members, DailyRoutine, FinanceLite để tăng tính nhất quán.

## 13. Review theo code hiện tại (cập nhật 2026-07-03)

Phần này bám theo code đang có trong repo, không bám theo tài liệu bối cảnh cũ.

### 13.1. Frontend route đang chạy thực tế

- Router chính hiện khai báo 25 route trong `client/src/App.tsx`.
- Có 59 page trong `client/src/pages`, nhưng chỉ 26 page được import/lazy load từ App.
- Có 33 page chưa nằm trong luồng route chính (unrouted/not imported), cần phân loại rõ:
   - nhóm giữ lại để triển khai sau
   - nhóm cần nối route/menu
   - nhóm cần archive/xóa nếu đã obsolete

### 13.2. Navigation và route chưa đồng bộ hoàn toàn

- Một số menu path trong navigation chưa có route tương ứng trong App (ví dụ các path báo cáo/cấu hình chi tiết).
- Có path không thống nhất giữa menu và route hiện có (ví dụ route user management).
- Hệ quả: người dùng có thể gặp màn hình 404 hoặc không đi được đúng flow từ menu.

### 13.3. Backend module hiện có

- App router đã tách theo module: auth, dashboard, members, rooms, duties, organization, roles, users, dailyRoutine, residentPortal, activities, finance.
- Mặt backend đã có coverage chức năng chính tương đối tốt cho main flow.

### 13.4. Test coverage hiện tại

- Đang có 3 file mang tên test trong `server/`.
- 2 file test thực sự đang chạy ổn: auth logout và duties resident permission.
- File `server/routers.test.ts` hiện chứa code helper DB legacy, không phải test Vitest thuần, cần xử lý để tránh gây hiểu nhầm khi bảo trì.
- Chưa có test e2e cho flow liên module.

### 13.5. Kết luận ngắn theo hiện trạng code

- Main flow đã có nền vận hành.
- Điểm nghẽn hiện tại là đồng bộ route/menu/page, sau đó mới đến mở rộng tính năng.
- Checklist tiếp theo phải ưu tiên “ổn định luồng đang có” thay vì thêm module mới.

## 14. Checklist hành động theo code hiện tại

### 14.1. Snapshot đối soát Route-Menu-Page (đã chạy ngày 2026-07-03)

- Tổng route trong App: 25
- Tổng path trong navigation: 37
- Menu có path nhưng chưa có route tương ứng: 15
- Route có trong App nhưng không nằm trong menu: 3

Menu có path nhưng chưa có route tương ứng (cần xử lý trước):

- /activity-plans
- /common-categories
- /daily-life-reports
- /discipline-cases
- /fees
- /financial
- /liturgy-schedule
- /parents
- /reports
- /settings
- /skill-classes
- /skill-results
- /skills
- /smart-assignment
- /users

Route có trong App nhưng không nằm trong menu:

- /
- /login
- /my-duties

- [x] 1) Lập bảng đối soát Route-Menu-Page (P0)
   - Đã liệt kê path từ App và navigation.
   - Đã có snapshot mismatch để triển khai sửa ở bước 2.

- [ ] 2) Sửa các mismatch điều hướng gây 404 (P0)
   - Đồng bộ các path user management, reports, parents và các mục chi tiết chỉ có menu.
   - Chốt nguyên tắc: có menu thì phải có route rõ ràng hoặc disabled có chủ đích.

- [ ] 3) Phân loại 33 page chưa vào luồng chính (P0)
   - Keep: sẽ đưa vào roadmap gần.
   - Connect: cần thêm route/menu ngay.
   - Archive: tách khỏi luồng chính để giảm nhiễu codebase.

- [ ] 4) Dọn và chuẩn hóa test baseline (P1)
   - Tách hoặc đổi tên `server/routers.test.ts` nếu không phải test.
   - Bổ sung test cho members/rooms/users/finance theo business rule trọng yếu.

- [ ] 5) Chốt “định nghĩa done” cho mỗi module chính (P1)
   - Module chỉ được xem là xong khi: route chạy, menu tới được, API khớp, test cơ bản pass.
   - Áp dụng trước cho Members, Rooms, Organization, DailyRoutine, FinanceLite.

## 15. Compare tiến độ theo checklist (đã làm/chưa làm)

### 15.1. Snapshot số liệu hiện tại

- Frontend route khai báo trong App: 25
- Navigation path khai báo: 37
- Page được import/lazy trong App: 26
- Tổng page trong `client/src/pages`: 59
- Page chưa vào luồng route chính: 33
- Menu có path nhưng chưa có route: 15
- Route có nhưng không nằm trong menu: 3
- Backend router module đang active: 12
- Tổng procedure marker (public/protected): 189
- Server test file: 3 (đang chạy pass: 2 file, 5 test)

### 15.2. Trạng thái checklist hành động (mục 14)

| Bước | Trạng thái | Tiến độ | Ghi chú compare |
|---|---|---:|---|
| 1) Đối soát Route-Menu-Page | Done | 100% | Đã có snapshot mismatch chi tiết (15 menu thiếu route, 3 route không có menu). |
| 2) Sửa mismatch điều hướng | Not started | 0% | Chưa sửa route/menu trong code, mới dừng ở bước audit. |
| 3) Phân loại 33 page chưa vào luồng chính | Done | 100% | Đã chốt nhãn Keep/Connect/Archive cho toàn bộ 33 page ở mục 15.6. |
| 4) Dọn và chuẩn hóa test baseline | In progress | 35% | `pnpm check` pass, `pnpm test` pass; nhưng `server/routers.test.ts` vẫn là legacy helper cần xử lý. |
| 5) Chốt định nghĩa done theo module | Not started | 0% | Chưa có tài liệu DoD theo module và chưa áp dụng đồng bộ. |

### 15.3. Đã làm gì

- Đã fix lỗi TypeScript blocking trong flow FinanceLite.
- Đã xác nhận baseline kỹ thuật hiện tại: check/test/build pass.
- Đã hoàn tất đối soát Route-Menu-Page bằng script và lưu snapshot vào tài liệu.
- Đã xác định rõ điểm nghẽn hiện tại là mismatch điều hướng và page orphan.

### 15.4. Chưa làm gì (phần còn thiếu)

- Chưa đồng bộ 15 menu path đang thiếu route thực tế.
- Chưa xử lý dứt điểm file test legacy `server/routers.test.ts`.
- Chưa có định nghĩa done chính thức cho từng module trọng yếu.

### 15.5. Next checklist để chạy ngay

- [x] A) Chốt phân loại 33 page orphan theo 3 nhãn Keep/Connect/Archive.
- [ ] B) Áp policy route/menu: path có trong menu phải có route hoặc disabled có chủ đích.
- [ ] C) Thực hiện batch sửa mismatch đầu tiên (ưu tiên: `/users`, `/reports`, `/parents`, `/settings`).
- [ ] D) Tách/đổi tên file test legacy để test baseline rõ ràng.
- [ ] E) Viết bảng DoD 5 module chính: Members, Rooms, Organization, DailyRoutine, FinanceLite.

### 15.6. Phân loại 33 page orphan (Keep/Connect/Archive)

Connect (12) - Có nhu cầu nghiệp vụ rõ và đã có menu hoặc gần main flow:

- ActivityPlans.tsx
- AdminSettings.tsx
- DisciplineCases.tsx
- Fees.tsx
- Financial.tsx
- LiturgySchedule.tsx
- Parents.tsx
- Reports.tsx
- SkillClasses.tsx
- SkillResults.tsx
- Skills.tsx
- SmartAssignment.tsx

Keep (17) - Giữ cho roadmap gần/trung hạn, chưa cần nối route ngay:

- AcademicEvaluations.tsx
- AcademicInfo.tsx
- Attendance.tsx
- Clubs.tsx
- EducationReferences.tsx
- LiturgyAssignments.tsx
- LiturgyAttendance.tsx
- NotificationPreferences.tsx
- OrganizationRoles.tsx
- OrganizationStructure.tsx
- OrganizationTerms.tsx
- OrganizationUnits.tsx
- ResidentLeadershipOverview.tsx
- ResidentRoleDutiesScopePage.tsx
- RoomDetail.tsx
- Schedule.tsx
- Tasks.tsx

Archive (4) - Trùng ý nghĩa hoặc thiên về dev/demo, nên tách khỏi luồng chính:

- ComponentShowcase.tsx
- ResidentRolePlaceholderPage.tsx
- Residents.tsx
- Schedules.tsx

---

> File này được dùng như bản tóm tắt kiến trúc, nghiệp vụ, style, component và cách đọc dự án của ResidenceCore, nhằm giúp người mới hiểu được mục tiêu, cấu trúc và hướng đi tiếp theo một cách có hệ thống.