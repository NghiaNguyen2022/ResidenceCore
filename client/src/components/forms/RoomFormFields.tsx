"use client";

import type { Control, FieldValues } from "react-hook-form";
import { TextField, TextareaField, SelectField, type OptionItem } from "@/components/ui/formFields";

export function RoomFormFields({
  control,
  capacityOptions,
  groupOptions,
}: {
  control: Control<FieldValues>;
  capacityOptions: OptionItem[];
  groupOptions: OptionItem[];
}) {
  return (
    <>
      <TextField control={control} name="roomCode" label="Mã phòng" placeholder="VD: A101, B201..." />
      <SelectField
        control={control}
        name="capacity"
        label="Sức chứa"
        placeholder="Chọn sức chứa"
        options={capacityOptions}
      />
      <SelectField
        control={control}
        name="groupId"
        label="Tổ (Optional)"
        placeholder="Chọn tổ"
        options={groupOptions}
      />
      <TextareaField control={control} name="notes" label="Ghi chú" placeholder="Ghi chú thêm..." rows={4} />
    </>
  );
}
