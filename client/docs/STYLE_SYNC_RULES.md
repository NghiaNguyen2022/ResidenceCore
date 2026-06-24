# ResidenceCore / App Lưu Xá — Style Sync Rules

## Rule chung

Tất cả trang mới hoặc khi chỉnh trang cũ phải dùng chung style foundation theo `src/components/shared/styleMedium.ts`.

Không tự tạo style riêng cho từng trang nếu style đó đã có trong config.

## Chuẩn trang

Mỗi trang quản trị nên dùng:

```tsx
<ResidenceCareLayout>
  <div className={residenceMediumStyle.page}>
    <span className={residenceMediumStyle.pageAura} />
    <div className={residenceMediumStyle.standardPageContent}>
      ...
    </div>
  </div>
</ResidenceCareLayout>
```

Header chuẩn:

```tsx
<div className={residenceMediumStyle.standardHeader}>
  <div className={residenceMediumStyle.standardHeaderAura} />
  <div className={residenceMediumStyle.standardHeaderInner}>
    <div className={residenceMediumStyle.standardHeaderTextWrap}>
      <h1 className={residenceMediumStyle.standardHeaderTitle}>Title</h1>
      <p className={residenceMediumStyle.standardHeaderSubtitle}>Subtitle</p>
    </div>

    <div className={residenceMediumStyle.standardHeaderActions}>
      <button className={residenceMediumStyle.buttonCard}>Tác vụ nhanh</button>
      <button className={residenceMediumStyle.buttonCardPrimary}>Thêm mới</button>
    </div>
  </div>
</div>
```

## Header

- Header chỉ có 2 dòng: title + subtitle.
- Không thêm label/pill/breadcrumb thành dòng thứ 3.
- Title/subtitle canh giữa.
- Action nằm bên phải trên desktop, xuống giữa ở mobile.
- Action dùng `buttonCard` hoặc `buttonCardPrimary`.

## Nền trang

- Dùng `page` và `pageAura`.
- Không tự tạo nền quá sáng, bóng, hoặc lệch màu.
- Tone chung: trắng / kem / amber nhẹ / slate text.

## Tabs / Filters

- Tab chính dùng `standardTabRail`, `standardTabGrid`, `standardTabButton`.
- Không làm tab giống 2 nút rời.
- Tab phụ/header phụ phải gọn, nhẹ, không chiếm nhiều không gian.

## Cards

- Card dữ liệu dùng nền trắng/kem nhẹ.
- Không dùng nền xanh/đỏ toàn card.
- Trạng thái nên dùng badge hoặc accent mảnh.
- Card không quá thô/to; padding vừa phải.

## Modal

- Modal dùng `standardModalOverlay`, `standardModalShell`, `standardModalHeader`.
- Nếu modal chồng modal, phải set z-index rõ theo ngữ cảnh.
- Không dùng nền đen quá đậm hoặc panel style lệch tone.

## Không dùng

- Không dùng nút đen mặc định.
- Không dùng xanh dương Tailwind mặc định.
- Không tự tạo gradient/nền riêng nếu chưa kiểm tra style config.
- Không dùng shadow quá bóng hoặc viền quá sáng.
- Không để mỗi trang một kiểu header.

## Trang tham chiếu chuẩn

- Học viên lưu trú
- Tổ chức lưu xá
- DailyRoutine sau package `residencecore-duty-style-unify-members-update.zip`

## Ghi nhớ cho các module sau

Các module sau bắt buộc theo rule này:

- Công tác / Sinh hoạt
- Tài chính
- Nội quy
- Thông báo
- Resident Portal
- User Management
- Rooms
- Organization sub-pages
