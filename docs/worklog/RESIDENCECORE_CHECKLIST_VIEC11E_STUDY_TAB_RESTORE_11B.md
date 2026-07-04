# ResidenceCore - Việc 11E: Restore tab Học tập theo layout 11B

## Mục tiêu

Đưa tab Học tập trong Member Detail trở lại cảm giác layout của Việc 11B, nhưng giữ bản `MemberDetailModal.tsx` hiện tại đã sửa lỗi JSX.

## Phạm vi

- `client/src/components/members/MemberDetailModal.tsx`
- `client/src/components/members/StudyScheduleSection.tsx`

## Checklist

- [ ] Tab Học tập dùng header gradient riêng như 11B.
- [ ] Mô tả tab Học tập trở lại đầy đủ như 11B.
- [ ] Bố cục học tập dùng trái/phải ở breakpoint rộng hơn, tránh ép layout quá sớm.
- [ ] `StudyScheduleSection` trở lại wrapper `AppSection` và spacing của 11B.
- [ ] Lịch tuần/tháng cuộn trong khung lịch, không kéo ngang modal.
- [ ] Không đổi API/backend/business logic.
- [ ] Không đổi validate lịch học/TimePicker.
- [ ] `pnpm check`, `pnpm test`, `pnpm build` pass.
