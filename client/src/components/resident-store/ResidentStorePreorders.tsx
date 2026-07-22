import { useMemo, useState } from "react";
import { PackageCheck, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FormDateInput } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
      getSalePriceReference,
} from "@/lib/storePriceDefaults";
import { trpc } from "@/lib/trpc";

type AccessInput = {
      storeShiftId: number;
      storeAccessToken?: string | null;
};

type Line = {
      key: string;
      productId: number;
      quantity: string;
      unitPrice: string;
};

function makeLine(): Line {
      return {
            key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            productId: 0,
            quantity: "1",
            unitPrice: "",
      };
}

function parseMoney(value: string) {
      const digits = String(value || "").replace(/[^\d]/g, "");
      return digits ? Number(digits) : 0;
}

function formatMoney(value: unknown) {
      return new Intl.NumberFormat("vi-VN", {
            maximumFractionDigits: 0,
      }).format(Number(value || 0));
}

function getTodayYmd() {
      const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Ho_Chi_Minh",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
      }).formatToParts(new Date());

      const value = (type: string) =>
            parts.find((part) => part.type === type)?.value || "";

      return `${value("year")}-${value("month")}-${value("day")}`;
}

const statusLabel: Record<string, string> = {
      pending: "Chờ xử lý",
      confirmed: "Đã xác nhận",
      preparing: "Đang chuẩn bị",
      ready: "Sẵn sàng giao/nhận",
      completed: "Đã giao",
      cancelled: "Đã hủy",
};

export function ResidentStorePreorders({
      ledgerId,
      accessInput,
      products,
      businessDate,
}: {
      ledgerId: number;
      accessInput: AccessInput;
      products: any[];
      businessDate: string;
}) {
      const storeApi = (trpc as any).storeLedger;
      const [customerName, setCustomerName] = useState("");
      const [customerPhone, setCustomerPhone] = useState("");
      const [fulfillmentType, setFulfillmentType] =
            useState<"pickup" | "delivery">("pickup");
      const [deliveryAddress, setDeliveryAddress] = useState("");
      const [requestedDate, setRequestedDate] =
            useState(businessDate);
      const [depositAmount, setDepositAmount] = useState("");
      const [notes, setNotes] = useState("");
      const [lines, setLines] = useState<Line[]>([makeLine()]);

      const listQuery =
            storeApi?.listPreorders?.useQuery?.(
                  {
                        ledgerId,
                        ...accessInput,
                  },
                  {
                        enabled: Boolean(ledgerId),
                        retry: false,
                  },
            ) ?? {
                  data: [],
                  isLoading: false,
                  refetch: () => undefined,
            };

      const createMutation =
            storeApi?.createPreorder?.useMutation?.({
                  onSuccess: async () => {
                        toast.success(
                              "Đã ghi nhận đơn đặt hàng trước.",
                        );
                        setCustomerName("");
                        setCustomerPhone("");
                        setDeliveryAddress("");
                        setDepositAmount("");
                        setNotes("");
                        setLines([makeLine()]);
                        await listQuery.refetch?.();
                  },
                  onError: (error: any) =>
                        toast.error(
                              error?.message ||
                                    "Không thể tạo đơn đặt trước.",
                        ),
            });

      const statusMutation =
            storeApi?.updatePreorderStatus?.useMutation?.({
                  onSuccess: async () => {
                        await listQuery.refetch?.();
                  },
                  onError: (error: any) =>
                        toast.error(error?.message),
            });

      const completeMutation =
            storeApi?.completePreorder?.useMutation?.({
                  onSuccess: async () => {
                        toast.success(
                              "Đã giao hàng và sinh phiếu bán.",
                        );
                        await listQuery.refetch?.();
                  },
                  onError: (error: any) =>
                        toast.error(error?.message),
            });

      const totalAmount = useMemo(
            () =>
                  lines.reduce(
                        (sum, line) =>
                              sum +
                              Number(line.quantity || 0) *
                                    parseMoney(line.unitPrice),
                        0,
                  ),
            [lines],
      );

      function updateLine(
            key: string,
            patch: Partial<Line>,
      ) {
            setLines((current) =>
                  current.map((line) =>
                        line.key === key
                              ? { ...line, ...patch }
                              : line,
                  ),
            );
      }

      function selectProduct(
            line: Line,
            productId: number,
      ) {
            const product = products.find(
                  (item: any) =>
                        Number(item.id) === productId,
            );
            const reference =
                  getSalePriceReference(product);

            updateLine(line.key, {
                  productId,
                  unitPrice:
                        reference.value > 0
                              ? formatMoney(reference.value)
                              : "",
            });
      }

      function submit() {
            const prepared = lines
                  .map((line) => ({
                        productId: Number(line.productId),
                        quantity: Number(line.quantity),
                        unitPrice: parseMoney(line.unitPrice),
                  }))
                  .filter(
                        (line) =>
                              line.productId > 0 &&
                              line.quantity > 0 &&
                              line.unitPrice > 0,
                  );

            if (!customerName.trim()) {
                  toast.error("Vui lòng nhập tên khách hàng.");
                  return;
            }
            if (!customerPhone.trim()) {
                  toast.error("Vui lòng nhập số điện thoại.");
                  return;
            }
            if (
                  fulfillmentType === "delivery" &&
                  !deliveryAddress.trim()
            ) {
                  toast.error("Vui lòng nhập địa chỉ giao hàng.");
                  return;
            }
            if (!prepared.length) {
                  toast.error(
                        "Vui lòng chọn hàng hóa, số lượng và đơn giá.",
                  );
                  return;
            }

            createMutation?.mutate?.({
                  ledgerId,
                  orderDate: businessDate,
                  customerName: customerName.trim(),
                  customerPhone: customerPhone.trim(),
                  fulfillmentType,
                  deliveryAddress:
                        fulfillmentType === "delivery"
                              ? deliveryAddress.trim()
                              : null,
                  requestedDate,
                  depositAmount:
                        parseMoney(depositAmount),
                  notes: notes.trim() || null,
                  lines: prepared,
                  ...accessInput,
            });
      }

      const orders = Array.isArray(listQuery.data)
            ? listQuery.data
            : [];

      return (
            <div className="space-y-4">
                  <Card className="rounded-[30px] border-amber-100/80 bg-white/92 p-5">
                        <div className="border-b border-amber-100 pb-4">
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                                    Đơn đặt hàng trước
                              </p>
                              <h2 className="mt-1 text-xl font-black text-slate-950">
                                    Ghi nhận lịch nhận hoặc giao hàng
                              </h2>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                              <input
                                    value={customerName}
                                    onChange={(event) =>
                                          setCustomerName(
                                                event.target.value,
                                          )
                                    }
                                    placeholder="Tên khách hàng"
                                    className="rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm"
                              />
                              <input
                                    value={customerPhone}
                                    onChange={(event) =>
                                          setCustomerPhone(
                                                event.target.value,
                                          )
                                    }
                                    placeholder="Số điện thoại"
                                    className="rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm"
                              />
                              <select
                                    value={fulfillmentType}
                                    onChange={(event) =>
                                          setFulfillmentType(
                                                event.target.value as
                                                      | "pickup"
                                                      | "delivery",
                                          )
                                    }
                                    className="rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm"
                              >
                                    <option value="pickup">
                                          Khách đến nhận
                                    </option>
                                    <option value="delivery">
                                          Giao tận nơi
                                    </option>
                              </select>
                              <FormDateInput
                                    value={requestedDate}
                                    onChange={(event: any) =>
                                          setRequestedDate(
                                                event.target.value,
                                          )
                                    }
                              />
                              {fulfillmentType === "delivery" ? (
                                    <input
                                          value={deliveryAddress}
                                          onChange={(event) =>
                                                setDeliveryAddress(
                                                      event.target.value,
                                                )
                                          }
                                          placeholder="Địa chỉ giao hàng"
                                          className="rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm md:col-span-2"
                                    />
                              ) : null}
                              <input
                                    inputMode="numeric"
                                    value={depositAmount}
                                    onChange={(event) =>
                                          setDepositAmount(
                                                event.target.value,
                                          )
                                    }
                                    placeholder="Tiền cọc (không bắt buộc)"
                                    className="rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm"
                              />
                              <input
                                    value={notes}
                                    onChange={(event) =>
                                          setNotes(
                                                event.target.value,
                                          )
                                    }
                                    placeholder="Ghi chú"
                                    className="rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm"
                              />
                        </div>

                        <div className="mt-4 space-y-3">
                              {lines.map((line) => (
                                    <div
                                          key={line.key}
                                          className="grid gap-3 rounded-2xl border border-amber-100 bg-amber-50/35 p-3 md:grid-cols-[minmax(260px,1fr)_120px_180px_48px]"
                                    >
                                          <select
                                                value={line.productId}
                                                onChange={(event) =>
                                                      selectProduct(
                                                            line,
                                                            Number(
                                                                  event
                                                                        .target
                                                                        .value,
                                                            ),
                                                      )
                                                }
                                                className="h-11 rounded-xl border border-amber-100 bg-white px-3 text-sm"
                                          >
                                                <option value="0">
                                                      Chọn hàng hóa
                                                </option>
                                                {products.map(
                                                      (
                                                            product: any,
                                                      ) => (
                                                            <option
                                                                  key={
                                                                        product.id
                                                                  }
                                                                  value={
                                                                        product.id
                                                                  }
                                                            >
                                                                  {
                                                                        product.productName
                                                                  }
                                                            </option>
                                                      ),
                                                )}
                                          </select>
                                          <input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={line.quantity}
                                                onChange={(event) =>
                                                      updateLine(
                                                            line.key,
                                                            {
                                                                  quantity:
                                                                        event
                                                                              .target
                                                                              .value,
                                                            },
                                                      )
                                                }
                                                placeholder="Số lượng"
                                                className="h-11 rounded-xl border border-amber-100 bg-white px-3 text-sm"
                                          />
                                          <input
                                                inputMode="numeric"
                                                value={line.unitPrice}
                                                onChange={(event) =>
                                                      updateLine(
                                                            line.key,
                                                            {
                                                                  unitPrice:
                                                                        event
                                                                              .target
                                                                              .value,
                                                            },
                                                      )
                                                }
                                                placeholder="Đơn giá"
                                                className="h-11 rounded-xl border border-amber-100 bg-white px-3 text-right text-sm font-bold"
                                          />
                                          <button
                                                type="button"
                                                disabled={
                                                      lines.length === 1
                                                }
                                                onClick={() =>
                                                      setLines(
                                                            (
                                                                  current,
                                                            ) =>
                                                                  current.filter(
                                                                        (
                                                                              item,
                                                                        ) =>
                                                                              item.key !==
                                                                              line.key,
                                                                  ),
                                                      )
                                                }
                                                className="flex h-11 items-center justify-center rounded-xl border border-rose-100 bg-white text-rose-600 disabled:opacity-40"
                                          >
                                                <Trash2 className="h-4 w-4" />
                                          </button>
                                    </div>
                              ))}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                              <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                          setLines((current) => [
                                                ...current,
                                                makeLine(),
                                          ])
                                    }
                                    className="rounded-full"
                              >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Thêm dòng
                              </Button>
                              <div className="flex items-center gap-3">
                                    <span className="text-sm font-black text-amber-700">
                                          {formatMoney(totalAmount)} đ
                                    </span>
                                    <Button
                                          type="button"
                                          disabled={
                                                createMutation?.isPending
                                          }
                                          onClick={submit}
                                          className="rounded-full bg-amber-500 px-6 font-black text-white hover:bg-amber-600"
                                    >
                                          Lưu đơn đặt trước
                                    </Button>
                              </div>
                        </div>
                  </Card>

                  <Card className="overflow-hidden rounded-[30px] border-amber-100/80 bg-white/92">
                        <div className="border-b border-amber-100 bg-amber-50/50 px-5 py-4">
                              <h2 className="text-xl font-black text-slate-950">
                                    Đơn đang theo dõi
                              </h2>
                        </div>
                        <div className="divide-y divide-amber-100">
                              {orders.map((item: any) => (
                                    <div
                                          key={item.id}
                                          className="px-5 py-4"
                                    >
                                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                <div>
                                                      <p className="font-black text-slate-900">
                                                            {
                                                                  item.orderCode
                                                            }{" "}
                                                            ·{" "}
                                                            {
                                                                  item.customerName
                                                            }
                                                      </p>
                                                      <p className="mt-1 text-xs text-slate-500">
                                                            {
                                                                  item.customerPhone
                                                            }{" "}
                                                            · cần{" "}
                                                            {
                                                                  item.requestedDate
                                                            }{" "}
                                                            ·{" "}
                                                            {item.fulfillmentType ===
                                                            "delivery"
                                                                  ? "Giao tận nơi"
                                                                  : "Khách đến nhận"}
                                                      </p>
                                                      {item.deliveryAddress ? (
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                  {
                                                                        item.deliveryAddress
                                                                  }
                                                            </p>
                                                      ) : null}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                      <Badge variant="outline">
                                                            {statusLabel[
                                                                  item
                                                                        .status
                                                            ] ||
                                                                  item.status}
                                                      </Badge>
                                                      <span className="font-black text-amber-700">
                                                            {formatMoney(
                                                                  item.totalAmount,
                                                            )}{" "}
                                                            đ
                                                      </span>
                                                      {![
                                                            "completed",
                                                            "cancelled",
                                                      ].includes(
                                                            item.status,
                                                      ) ? (
                                                            <>
                                                                  <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                              statusMutation?.mutate?.(
                                                                                    {
                                                                                          id: item.id,
                                                                                          status:
                                                                                                item.status ===
                                                                                                "pending"
                                                                                                      ? "confirmed"
                                                                                                      : item.status ===
                                                                                                          "confirmed"
                                                                                                        ? "preparing"
                                                                                                        : "ready",
                                                                                          ...accessInput,
                                                                                    },
                                                                              )
                                                                        }
                                                                  >
                                                                        Tiếp tục
                                                                  </Button>
                                                                  <Button
                                                                        size="sm"
                                                                        disabled={
                                                                              completeMutation?.isPending
                                                                        }
                                                                        onClick={() =>
                                                                              completeMutation?.mutate?.(
                                                                                    {
                                                                                          id: item.id,
                                                                                          completionDate:
                                                                                                getTodayYmd(),
                                                                                          paymentMethod:
                                                                                                "cash",
                                                                                          ...accessInput,
                                                                                    },
                                                                              )
                                                                        }
                                                                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                                                                  >
                                                                        <PackageCheck className="mr-1 h-4 w-4" />
                                                                        Đã giao
                                                                  </Button>
                                                                  <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() =>
                                                                              statusMutation?.mutate?.(
                                                                                    {
                                                                                          id: item.id,
                                                                                          status:
                                                                                                "cancelled",
                                                                                          ...accessInput,
                                                                                    },
                                                                              )
                                                                        }
                                                                  >
                                                                        Hủy
                                                                  </Button>
                                                            </>
                                                      ) : null}
                                                </div>
                                          </div>
                                    </div>
                              ))}
                              {!orders.length ? (
                                    <div className="px-5 py-10 text-center text-sm text-slate-500">
                                          Chưa có đơn đặt trước.
                                    </div>
                              ) : null}
                        </div>
                  </Card>
            </div>
      );
}
