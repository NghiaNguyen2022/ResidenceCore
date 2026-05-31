-- ============================================
-- DUTY TEMPLATES SEED DATA
-- 16 Công Tác Mẫu cho Ký Túc Xá
-- ============================================

-- HÀNG NGÀY (11 công tác)

-- 1. Đi chợ
INSERT INTO dutyTemplates (templateCode, templateName, dutyType, startTime, endTime, minPersons, maxPersons, description, isActive, createdAt, updatedAt)
VALUES ('di_cho', 'Đi chợ', 'daily', '04:00', '06:00', 1, 2, 'Mua hàng tươi sống cho bữa ăn trong ngày', true, NOW(), NOW());

-- 2. Nấu ăn sáng
INSERT INTO dutyTemplates (templateCode, templateName, dutyType, startTime, endTime, minPersons, maxPersons, description, isActive, createdAt, updatedAt)
VALUES ('nau_sang', 'Nấu ăn sáng', 'daily', '05:00', '07:00', 2, 3, 'Chuẩn bị bữa sáng cho tất cả học viên', true, NOW(), NOW());

-- 3. Nấu ăn trưa
INSERT INTO dutyTemplates (templateCode, templateName, dutyType, startTime, endTime, minPersons, maxPersons, description, isActive, createdAt, updatedAt)
VALUES ('nau_trua', 'Nấu ăn trưa', 'daily', '10:30', '12:30', 2, 3, 'Chuẩn bị bữa trưa cho tất cả học viên', true, NOW(), NOW());

-- 4. Nấu ăn tối
INSERT INTO dutyTemplates (templateCode, templateName, dutyType, startTime, endTime, minPersons, maxPersons, description, isActive, createdAt, updatedAt)
VALUES ('nau_toi', 'Nấu ăn tối', 'daily', '16:30', '18:30', 2, 3, 'Chuẩn bị bữa tối cho tất cả học viên', true, NOW(), NOW());

-- 5. Rửa chén ca sáng
INSERT INTO dutyTemplates (templateCode, templateName, dutyType, startTime, endTime, minPersons, maxPersons, description, isActive, createdAt, updatedAt)
VALUES ('rua_chen_sang', 'Rửa chén ca sáng', 'daily', '07:30', '08:30', 2, 2, 'Rửa chén sau bữa sáng', true, NOW(), NOW());

-- 6. Rửa chén ca trưa
INSERT INTO dutyTemplates (templateCode, templateName, dutyType, startTime, endTime, minPersons, maxPersons, description, isActive, createdAt, updatedAt)
VALUES ('rua_chen_trua', 'Rửa chén ca trưa', 'daily', '13:00', '14:00', 2, 2, 'Rửa chén sau bữa trưa', true, NOW(), NOW());

-- 7. Rửa chén ca tối
INSERT INTO dutyTemplates (templateCode, templateName, dutyType, startTime, endTime, minPersons, maxPersons, description, isActive, createdAt, updatedAt)
VALUES ('rua_chen_toi', 'Rửa chén ca tối', 'daily', '19:00', '20:00', 2, 2, 'Rửa chén sau bữa tối', true, NOW(), NOW());

-- 8. Dọn phòng chung ca sáng
INSERT INTO dutyTemplates (templateCode, templateName, dutyType, startTime, endTime, minPersons, maxPersons, description, isActive, createdAt, updatedAt)
VALUES ('don_phong_sang', 'Dọn phòng chung ca sáng', 'daily', '06:30', '07:30', 2, 3, 'Dọn dẹp phòng chung, hành lang, sân vào buổi sáng', true, NOW(), NOW());

-- 9. Dọn phòng chung ca chiều
INSERT INTO dutyTemplates (templateCode, templateName, dutyType, startTime, endTime, minPersons, maxPersons, description, isActive, createdAt, updatedAt)
VALUES ('don_phong_chieu', 'Dọn phòng chung ca chiều', 'daily', '17:00', '18:00', 2, 3, 'Dọn dẹp phòng chung, hành lang, sân vào buổi chiều', true, NOW(), NOW());

-- 10. Trực thư viện ca sáng
INSERT INTO dutyTemplates (templateCode, templateName, dutyType, startTime, endTime, minPersons, maxPersons, description, isActive, createdAt, updatedAt)
VALUES ('truc_thu_vien_sang', 'Trực thư viện ca sáng', 'daily', '08:00', '12:00', 1, 1, 'Tiếp đón, hỗ trợ độc giả tại thư viện', true, NOW(), NOW());

-- 11. Trực thư viện ca chiều
INSERT INTO dutyTemplates (templateCode, templateName, dutyType, startTime, endTime, minPersons, maxPersons, description, isActive, createdAt, updatedAt)
VALUES ('truc_thu_vien_chieu', 'Trực thư viện ca chiều', 'daily', '13:30', '17:00', 1, 1, 'Tiếp đón, hỗ trợ độc giả tại thư viện', true, NOW(), NOW());

-- HÀNG TUẦN (5 công tác)

-- 12. Vệ sinh chung tuần
INSERT INTO dutyTemplates (templateCode, templateName, dutyType, startTime, endTime, minPersons, maxPersons, description, isActive, createdAt, updatedAt)
VALUES ('ve_sinh_tuan', 'Vệ sinh chung tuần', 'weekly', '08:00', '12:00', 3, 5, 'Vệ sinh toàn bộ khu lưu trú (Chủ Nhật)', true, NOW(), NOW());

-- 13. Tổng vệ sinh
INSERT INTO dutyTemplates (templateCode, templateName, dutyType, startTime, endTime, minPersons, maxPersons, description, isActive, createdAt, updatedAt)
VALUES ('tong_ve_sinh', 'Tổng vệ sinh', 'weekly', '07:00', '17:00', 5, 8, 'Vệ sinh sâu toàn bộ khu lưu trú (Chủ Nhật cuối tháng)', true, NOW(), NOW());

-- 14. Tập hát
INSERT INTO dutyTemplates (templateCode, templateName, dutyType, startTime, endTime, minPersons, maxPersons, description, isActive, createdAt, updatedAt)
VALUES ('tap_hat', 'Tập hát', 'weekly', '19:00', '20:30', 2, 3, 'Tập hát ca khúc truyền thống (Thứ 5 hoặc 6)', true, NOW(), NOW());

-- 15. Sinh hoạt chung
INSERT INTO dutyTemplates (templateCode, templateName, dutyType, startTime, endTime, minPersons, maxPersons, description, isActive, createdAt, updatedAt)
VALUES ('sinh_hoat_chung', 'Sinh hoạt chung', 'weekly', '18:00', '20:00', 3, 5, 'Tổ chức sinh hoạt, giao lưu (Thứ 7 hoặc Chủ Nhật)', true, NOW(), NOW());

-- 16. Trực lễ tuần
INSERT INTO dutyTemplates (templateCode, templateName, dutyType, startTime, endTime, minPersons, maxPersons, description, isActive, createdAt, updatedAt)
VALUES ('truc_le_tuan', 'Trực lễ tuần', 'weekly', '07:00', '09:00', 2, 2, 'Chuẩn bị, dọn dẹp trước/sau lễ (Chủ Nhật)', true, NOW(), NOW());

-- ============================================
-- VERIFY DATA
-- ============================================
SELECT COUNT(*) as total_templates FROM dutyTemplates;
SELECT templateCode, templateName, dutyType, startTime, endTime FROM dutyTemplates ORDER BY dutyType, templateCode;
