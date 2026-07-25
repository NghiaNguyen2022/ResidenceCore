from __future__ import annotations

from pathlib import Path

from docx import Document

from build_project_documents import (
    AMBER,
    CALLOUT,
    DOCS,
    GREEN,
    BLUE_GRAY,
    bullet,
    callout,
    h1,
    h2,
    h3,
    header_footer,
    matrix,
    number,
    para,
    process_table,
    save,
    style_document,
    title_block,
)


OUTPUT = DOCS / "ResidenceCore_Implementation_Deployment_Standard.docx"


def build_document() -> Path:
    doc = Document()
    style_document(doc)
    header_footer(
        doc,
        "Implementation & Deployment Standard",
        "Implementation standard for ResidenceCore demo and production rollout",
    )
    title_block(
        doc,
        "Implementation & Deployment Standard",
        "Tài liệu chuẩn triển khai dự án, deploy demo, kiểm thử và vận hành",
        "Project Implementation Standard",
        "Dùng làm tài liệu chuẩn khi triển khai ResidenceCore cho demo hoặc môi trường thật",
    )

    callout(
        doc,
        "Mục tiêu tài liệu",
        "Tài liệu này mô tả tiêu chuẩn triển khai ResidenceCore từ chuẩn bị mã nguồn, cấu hình môi trường, database, seed dữ liệu, kiểm thử, deploy, nghiệm thu đến vận hành sau triển khai. Nội dung viết cho cả đội kỹ thuật, quản lý dự án và người phụ trách demo.",
    )

    h1(doc, "1. Mục tiêu triển khai")
    para(doc, "ResidenceCore cần được triển khai theo một quy trình có kiểm soát để đảm bảo ba điều: ứng dụng chạy ổn định, dữ liệu demo hoặc dữ liệu thật nhất quán, và người dùng có thể đi hết main flow mà không gặp lỗi cản trở.")
    bullet(doc, "Chuẩn hóa các bước từ source code đến môi trường chạy.")
    bullet(doc, "Giảm rủi ro sai cấu hình database, env, quyền truy cập và seed dữ liệu.")
    bullet(doc, "Tạo checklist nghiệm thu rõ ràng trước khi đưa demo cho người dùng.")
    bullet(doc, "Tách rõ phần bắt buộc P0 và phần có thể làm sau P1/P2.")

    h1(doc, "2. Phạm vi áp dụng")
    matrix(
        doc,
        ["Môi trường", "Mục đích", "Tiêu chuẩn tối thiểu"],
        [
            ["Local development", "Lập trình, kiểm tra nhanh, sửa lỗi.", "Chạy được dev server, kết nối DB local, có tài khoản manager."],
            ["Demo", "Trình diễn sản phẩm cho người dùng hoặc stakeholder.", "Có seed demo đầy đủ, simple menu gọn, smoke test pass."],
            ["Staging", "Kiểm thử gần production.", "Dữ liệu giống demo/production, có checklist UAT và rollback."],
            ["Production", "Vận hành thật.", "Backup, bảo mật env, monitoring, phân quyền thật, không dùng seed demo."],
        ],
        [1.45, 2.45, 2.6],
    )

    h1(doc, "3. Vai trò và trách nhiệm")
    matrix(
        doc,
        ["Vai trò", "Trách nhiệm chính", "Khi nào tham gia"],
        [
            ["Project Owner", "Chốt phạm vi demo, quyết định module P0/P1, nghiệm thu nghiệp vụ.", "Trước và sau mỗi đợt deploy."],
            ["Business Analyst", "Mô tả quy trình, dữ liệu mẫu, kịch bản UAT.", "Trước khi build seed và user guide."],
            ["Developer", "Sửa code, migration, seed, test, build.", "Trong suốt quá trình triển khai."],
            ["QA/UAT", "Chạy test script, ghi nhận lỗi, xác nhận acceptance criteria.", "Sau khi deploy lên demo/staging."],
            ["DevOps/Operator", "Cấu hình server, database, env, backup, start service.", "Khi chuẩn bị môi trường và release."],
            ["End User", "Dùng thử theo guide, phản hồi nghiệp vụ.", "Trong UAT hoặc demo review."],
        ],
        [1.45, 3.0, 2.05],
    )

    h1(doc, "4. Nguyên tắc triển khai")
    bullet(doc, "Không deploy khi typecheck hoặc test đang lỗi.")
    bullet(doc, "Không deploy demo bằng database trống nếu mục tiêu là trình diễn nghiệp vụ.")
    bullet(doc, "Không đưa module chưa chốt vào Simple mode.")
    bullet(doc, "Không chạy script reset dữ liệu trên production nếu chưa backup và chưa có phê duyệt.")
    bullet(doc, "Mọi migration và seed cần chạy được lặp lại hoặc có hướng dẫn rollback rõ ràng.")
    bullet(doc, "Tài khoản demo phải thống nhất với nội dung hiển thị trên màn hình login và tài liệu hướng dẫn.")

    h1(doc, "5. Chuẩn bị trước triển khai")
    h2(doc, "5.1 Kiểm tra mã nguồn")
    process_table(doc, [
        ["1", "Developer", "Kiểm tra working tree và các file thay đổi.", "Biết rõ thay đổi nào sẽ đi vào bản deploy."],
        ["2", "Developer", "Chạy npm run check.", "TypeScript không còn lỗi compile."],
        ["3", "Developer", "Chạy npm test.", "Unit test pass."],
        ["4", "Developer", "Chạy npm run build.", "Build frontend/backend thành công."],
        ["5", "Owner/QA", "Xem danh sách thay đổi nghiệp vụ.", "Không có thay đổi ngoài phạm vi deploy."],
    ])

    h2(doc, "5.2 Yêu cầu môi trường")
    matrix(
        doc,
        ["Thành phần", "Khuyến nghị", "Ghi chú"],
        [
            ["Node.js", "v18+; ưu tiên v22+", "Dùng để chạy server và build frontend."],
            ["Package manager", "npm hoặc pnpm theo lock/packageManager", "Không trộn nhiều package manager nếu không cần."],
            ["Database", "MySQL/MariaDB/TiDB tương thích schema hiện tại", "Cần quyền tạo bảng, migrate và insert seed."],
            ["Runtime", "Server Node chạy dist/index.js", "Production dùng npm run build rồi npm start."],
            ["Browser", "Chrome/Edge mới", "Dùng cho smoke test và demo."],
            ["LibreOffice", "Khuyến nghị nếu cần render QA tài liệu DOCX", "Không bắt buộc để chạy app."],
        ],
        [1.6, 2.35, 2.55],
    )

    h2(doc, "5.3 Biến môi trường bắt buộc")
    matrix(
        doc,
        ["Biến", "Bắt buộc", "Mục đích"],
        [
            ["DATABASE_URL hoặc DATABASE_HOST/USER/PASSWORD/NAME", "Có", "Kết nối database."],
            ["JWT_SECRET", "Có", "Ký và xác thực session/token."],
            ["STORE_ACCESS_SECRET", "Nên có", "Bảo vệ luồng cửa hàng nếu bật module này."],
            ["PORT", "Tuỳ chọn", "Port chạy server, mặc định 3000."],
            ["NODE_ENV", "Có", "development hoặc production."],
            ["VITE_APP_TITLE", "Tuỳ chọn", "Tên hiển thị ứng dụng."],
            ["VITE_ANALYTICS_ENDPOINT", "Tuỳ chọn", "Analytics; không trỏ localhost trong demo nếu không có service thật."],
            ["BUILT_IN_FORGE_API_URL / KEY", "Tuỳ chọn", "Chỉ cần nếu dùng storage ngoài."],
        ],
        [2.35, 1.0, 3.15],
    )
    callout(
        doc,
        "Quy tắc env",
        "Không commit .env.local hoặc secret thật. Demo có thể dùng env riêng, nhưng phải đủ DATABASE và JWT_SECRET. Analytics là optional và đã được chặn khi trỏ localhost để tránh lỗi console.",
        fill=AMBER,
    )

    h1(doc, "6. Database, migration và seed")
    h2(doc, "6.1 Migration")
    number(doc, "Backup database nếu môi trường đã có dữ liệu quan trọng.")
    number(doc, "Chạy migration theo quy trình của dự án.")
    number(doc, "Kiểm tra các bảng chính đã tồn tại: users, roles, residents, rooms, organization, finance, duties, daily routine.")
    number(doc, "Không sửa tay schema production nếu chưa ghi lại migration.")

    h2(doc, "6.2 Seed manager")
    para(doc, "Seed manager đảm bảo hệ thống luôn có tài khoản quản lý để đăng nhập vào demo hoặc môi trường ban đầu.")
    matrix(
        doc,
        ["Tài khoản", "Giá trị chuẩn demo"],
        [
            ["Username", "admin"],
            ["Password", "Admin@123"],
            ["Role chính", "manager"],
            ["Trạng thái", "active"],
            ["mustChangePassword", "true hoặc theo quyết định demo"],
        ],
        [1.9, 4.6],
    )

    h2(doc, "6.3 Seed demo nghiệp vụ")
    para(doc, "Seed demo cần tạo dữ liệu đủ để main flow không bị trống. Đây là điểm quan trọng nhất trước khi deploy demo sạch.")
    matrix(
        doc,
        ["Nhóm dữ liệu", "Tối thiểu cần có", "Kiểm tra sau seed"],
        [
            ["Học viên", "8-15 hồ sơ, có phòng và trạng thái khác nhau", "Danh sách Học viên có dữ liệu."],
            ["Phòng/Tổ", "3-5 phòng, 2 Tổ", "Dashboard có chỉ số phòng/học viên."],
            ["Tổ chức", "1 nhiệm kỳ active, Tổ/Ban, chức vụ", "Trang Tổ chức có sơ đồ và bổ nhiệm."],
            ["Tài chính", "1 kỳ thu, khoản đã thu/còn nợ", "Trang Tài chính có số liệu phải thu."],
            ["Sinh hoạt", "Mẫu lịch ngày và công tác hôm nay", "Trang Sinh hoạt có lịch/công tác."],
            ["Portal", "Ít nhất 1 resident user liên kết hồ sơ", "Đăng nhập portal học viên được."],
            ["Thông báo", "2-3 thông báo mẫu", "Portal có nội dung thông báo."],
        ],
        [1.55, 2.65, 2.3],
    )

    h2(doc, "6.4 Quy tắc an toàn dữ liệu")
    bullet(doc, "Script reset demo chỉ dùng cho local/demo/staging, không dùng production nếu chưa có phê duyệt.")
    bullet(doc, "Trước khi chạy reset, phải xác định đúng DATABASE_URL hoặc database name.")
    bullet(doc, "Nếu seed có xóa dữ liệu, tên script và log phải ghi rõ hành động xóa.")
    bullet(doc, "Sau seed phải chạy smoke test ngay, không chỉ dựa vào log thành công.")

    h1(doc, "7. Build và deploy")
    h2(doc, "7.1 Build chuẩn")
    process_table(doc, [
        ["1", "Developer", "Cài dependencies theo package manager của dự án.", "node_modules sẵn sàng."],
        ["2", "Developer", "Chạy npm run check.", "Không còn lỗi type."],
        ["3", "Developer", "Chạy npm test.", "Unit test pass."],
        ["4", "Developer", "Chạy npm run build.", "Sinh thư mục dist."],
        ["5", "Operator", "Copy/source deploy bản build lên server.", "Server có artifact mới."],
        ["6", "Operator", "Chạy npm start hoặc process manager tương ứng.", "Ứng dụng chạy production."],
    ])

    h2(doc, "7.2 Deploy demo đề xuất")
    number(doc, "Tạo database demo riêng.")
    number(doc, "Cấu hình env demo.")
    number(doc, "Chạy migration.")
    number(doc, "Chạy seed manager.")
    number(doc, "Chạy seed demo nghiệp vụ.")
    number(doc, "Build ứng dụng.")
    number(doc, "Start server.")
    number(doc, "Chạy smoke test browser.")
    number(doc, "Gửi link demo và tài khoản cho người test.")

    h1(doc, "8. Kiểm thử sau triển khai")
    h2(doc, "8.1 Smoke test kỹ thuật")
    matrix(
        doc,
        ["Mục", "Cách kiểm tra", "Đạt khi"],
        [
            ["Server", "Mở URL ứng dụng.", "Trang home/login load được."],
            ["Login", "Đăng nhập admin / Admin@123.", "Vào dashboard hoặc modal đổi mật khẩu."],
            ["Console", "Mở browser devtools nếu cần.", "Không có lỗi runtime lặp lại."],
            ["API", "Mở các trang main flow.", "Không báo lỗi tRPC cản trở."],
            ["Build", "Kiểm tra log server.", "Không crash sau start."],
        ],
        [1.3, 2.7, 2.5],
    )

    h2(doc, "8.2 Smoke test nghiệp vụ manager")
    matrix(
        doc,
        ["Route", "Nội dung cần thấy", "Ghi chú"],
        [
            ["/dashboard", "Tổng quan học viên, phòng, công tác.", "Màn hình mở đầu demo."],
            ["/members", "Danh sách học viên dạng thẻ/list.", "Có ít nhất vài hồ sơ demo."],
            ["/organization", "Nhiệm kỳ, Tổ/Ban, chức vụ.", "Có cơ cấu đang hiệu lực."],
            ["/finance", "Kỳ thu, khoản phải thu, thanh toán.", "Có số liệu thu/còn nợ."],
            ["/daily-routine", "Lịch ngày, công tác hôm nay.", "Không trống."],
            ["/duties", "Danh sách phân công và mẫu công tác.", "Có thể cập nhật trạng thái."],
            ["/settings/users", "Danh sách user và role.", "Dùng detailed mode nếu cần."],
        ],
        [1.45, 3.05, 2.0],
    )

    h2(doc, "8.3 Smoke test portal học viên")
    matrix(
        doc,
        ["Màn hình", "Nội dung cần kiểm tra"],
        [
            ["Hôm nay", "Công tác, lịch hoặc thông báo trong ngày."],
            ["Hồ sơ", "Thông tin học viên đúng với hồ sơ liên kết."],
            ["Công tác", "Danh sách việc được giao cho học viên."],
            ["Tài chính", "Khoản cần đóng, đã đóng hoặc trạng thái thanh toán."],
            ["Thông báo", "Thông báo nội bộ liên quan."],
            ["Hoạt động", "Danh sách hoạt động nếu có seed."],
        ],
        [1.7, 4.8],
    )

    h1(doc, "9. UAT và nghiệm thu")
    h2(doc, "9.1 Tiêu chí nghiệm thu P0")
    bullet(doc, "Người quản lý đăng nhập và đi hết 6 màn hình chính không gặp lỗi chặn.")
    bullet(doc, "Dữ liệu demo đủ để giải thích nghiệp vụ, không trống hàng loạt.")
    bullet(doc, "Học viên demo đăng nhập portal và xem được dữ liệu cá nhân.")
    bullet(doc, "Simple mode không lộ module chưa chốt.")
    bullet(doc, "Tài liệu user guide và blueprint đã được lưu trong docs.")
    bullet(doc, "Có checklist deploy và rollback.")

    h2(doc, "9.2 Biên bản UAT đề xuất")
    matrix(
        doc,
        ["Thông tin", "Nội dung cần ghi"],
        [
            ["Ngày test", "Ngày giờ chạy UAT."],
            ["Người test", "Tên người test và vai trò."],
            ["Môi trường", "URL, database, branch/build."],
            ["Kịch bản", "Manager flow, resident flow, finance, duties."],
            ["Kết quả", "Pass/Fail từng kịch bản."],
            ["Lỗi còn lại", "Mô tả, mức độ, người phụ trách."],
            ["Kết luận", "Đủ demo, cần sửa, hoặc chưa đạt."],
        ],
        [1.5, 5.0],
    )

    h1(doc, "10. Bảo mật và phân quyền")
    bullet(doc, "Manager chỉ cấp cho người phụ trách vận hành hoặc demo.")
    bullet(doc, "Resident chỉ xem dữ liệu liên kết với hồ sơ của chính mình.")
    bullet(doc, "JWT_SECRET và database password phải là secret riêng của từng môi trường.")
    bullet(doc, "Không dùng tài khoản demo trong production thật.")
    bullet(doc, "Khi demo public, không đưa dữ liệu cá nhân thật nếu chưa được phép.")
    bullet(doc, "Tắt hoặc cấu hình đúng analytics; không để endpoint sai tạo lỗi console.")

    h1(doc, "11. Vận hành sau deploy")
    matrix(
        doc,
        ["Hoạt động", "Tần suất", "Người phụ trách"],
        [
            ["Kiểm tra server còn chạy", "Hằng ngày hoặc trước demo", "Operator"],
            ["Backup database", "Trước mỗi reset/seed lớn", "Operator"],
            ["Kiểm tra lỗi người dùng báo", "Khi phát sinh", "Developer/QA"],
            ["Cập nhật tài liệu", "Sau mỗi thay đổi nghiệp vụ đáng kể", "BA/Developer"],
            ["Review quyền user", "Trước demo public hoặc production", "Project Owner"],
        ],
        [2.2, 1.6, 2.7],
    )

    h1(doc, "12. Rollback và xử lý sự cố")
    h2(doc, "12.1 Rollback code")
    number(doc, "Xác định version/build đang lỗi.")
    number(doc, "Dừng process hoặc chuyển traffic khỏi build lỗi.")
    number(doc, "Khôi phục build trước đó hoặc branch/tag ổn định.")
    number(doc, "Start lại server và smoke test login/dashboard.")
    number(doc, "Ghi nhận nguyên nhân và cách phòng tránh.")

    h2(doc, "12.2 Rollback database")
    number(doc, "Chỉ rollback database nếu có backup trước đó.")
    number(doc, "Dừng app hoặc khóa thao tác ghi trong lúc restore.")
    number(doc, "Restore backup vào đúng database.")
    number(doc, "Chạy kiểm tra schema và dữ liệu chính.")
    number(doc, "Smoke test lại main flow.")
    callout(
        doc,
        "Cảnh báo rollback",
        "Không rollback database bằng cách chạy ngược SQL thủ công nếu chưa hiểu quan hệ khóa ngoại. Với demo, cách an toàn hơn thường là reset DB demo rồi seed lại từ script chuẩn.",
        fill=AMBER,
    )

    h1(doc, "13. Checklist release")
    matrix(
        doc,
        ["Nhóm", "Checklist", "Trạng thái"],
        [
            ["Code", "npm run check pass; npm test pass; npm run build pass.", "Bắt buộc"],
            ["DB", "Migration chạy xong; seed manager/demo chạy xong.", "Bắt buộc"],
            ["Auth", "admin / Admin@123 đăng nhập được.", "Bắt buộc"],
            ["Menu", "Simple mode chỉ hiện main flow P0.", "Bắt buộc"],
            ["Manager flow", "7 route P0 mở được.", "Bắt buộc"],
            ["Resident flow", "Ít nhất 1 resident demo đăng nhập được.", "Bắt buộc cho portal demo"],
            ["Docs", "Blueprint, User Guide, Business Process, Implementation Standard có trong docs.", "Bắt buộc"],
            ["Backup", "Có backup nếu môi trường đã có dữ liệu.", "Bắt buộc trước reset"],
            ["Rollback", "Biết build/DB backup để quay lại.", "Bắt buộc"],
        ],
        [1.25, 4.0, 1.25],
        fill=GREEN,
    )

    h1(doc, "14. Cấu trúc tài liệu dự án")
    matrix(
        doc,
        ["Tài liệu", "Mục đích sử dụng"],
        [
            ["ResidenceCore_Business_Process_Document.docx", "Mô tả quy trình nghiệp vụ theo module và readiness."],
            ["ResidenceCore_Blueprint.docx", "Bản thiết kế tổng quan sản phẩm, module và roadmap."],
            ["ResidenceCore_User_Guide.docx", "Hướng dẫn dễ hiểu cho người dùng demo."],
            ["ResidenceCore_Implementation_Deployment_Standard.docx", "Chuẩn triển khai dự án, deploy, test, vận hành và rollback."],
            ["RESIDENCECORE_CHECKLIST.md", "Checklist tiến độ kỹ thuật và nghiệp vụ đang cập nhật."],
        ],
        [2.65, 3.85],
    )

    h1(doc, "15. Kết luận")
    para(doc, "Một bản triển khai ResidenceCore đạt chuẩn không chỉ là build chạy được. Bản triển khai cần có dữ liệu demo đúng, menu gọn, test pass, quy trình seed/migration rõ, tài liệu hướng dẫn đầy đủ và phương án rollback. Khi các checklist P0 trong tài liệu này đạt, dự án đã đủ điều kiện để deploy demo có kiểm soát.")

    save(
        doc,
        OUTPUT,
        "ResidenceCore Implementation and Deployment Standard",
        "Implementation, deployment, testing, operations, and rollback standard",
    )
    return OUTPUT


if __name__ == "__main__":
    print(build_document())
