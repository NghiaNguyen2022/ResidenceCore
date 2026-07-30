-- Kiểm tra liên kết tài khoản học viên và thông báo mã Cửa hàng

SELECT
      r.id AS residentId,
      r.fullName,
      r.userId,
      u.id AS linkedUserId,
      u.username,
      u.role
FROM residents r
LEFT JOIN users u ON u.id = r.userId
ORDER BY r.id DESC;

SELECT
      n.id,
      n.title,
      n.content,
      n.recipientId,
      u.username,
      n.relatedEntityId,
      n.relatedEntityType,
      n.isRead,
      n.sentAt,
      n.createdAt
FROM notifications n
LEFT JOIN users u ON u.id = n.recipientId
WHERE n.title = 'Mã vào Cửa hàng'
ORDER BY n.id DESC
LIMIT 50;
