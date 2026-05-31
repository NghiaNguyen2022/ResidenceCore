"use client";

import type { Control, FieldValues } from "react-hook-form";
import { TextField, TextareaField } from "@/components/ui/formFields";

export function ResidentFormFields<TFieldValues extends FieldValues>({
  control,
}: {
  control: Control<TFieldValues>;
}) {
  return (
    <>
      <TextField control={control} name="fullName" label="Họ tên" placeholder="Nhập họ tên" />
      <TextField control={control} name="phoneNumber" label="Số điện thoại" placeholder="Nhập số điện thoại" />
      <TextField control={control} name="idNumber" label="Số CMND/CCCD" placeholder="Nhập số CMND/CCCD" />
      <TextField control={control} name="permanentAddress" label="Địa chỉ thường trú" placeholder="Nhập địa chỉ thường trú" />
      <TextareaField control={control} name="notes" label="Ghi chú" placeholder="Ghi chú thêm..." rows={4} />
    </>
  );
}
