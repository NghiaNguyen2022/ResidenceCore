'use client';

import { useEffect, useMemo, useState } from "react";
import {
      ArrowDownToLine,
      ArrowUpFromLine,
      CircleDollarSign,
      Clock3,
      LogOut,
      PackagePlus,
      ReceiptText,
      RefreshCw,
      ShieldCheck,
      ShoppingCart,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { FormDateInput } from "@/components/shared";
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
      getPurchasePriceReference,
      getSalePriceReference,
} from "@/lib/storePriceDefaults";
import { trpc } from "@/lib/trpc";

type ResidentStoreAccess = {
      accessToken: string;
      storeShiftId: number;
      ledgerId: number;
      validUntil?: string | null;
};

type StoreTab =
      | "shift"
      | "sales"
      | "purchase"
      | "transactions"
      | "handover"
      | "closing";

type DocumentLine = {
      key: string;
      productId: number;
      quantity: string;
      unitPrice: string;
      unitCost: string;
      priceNote: string;
      usesPurchasePrice: boolean;
};

function makeLine(): DocumentLine {
      return {
            key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            productId: 0,
            quantity: "1",
            unitPrice: "",
            unitCost: "",
            priceNote: "",
            usesPurchasePrice: false,
      };
}

function getStoredAccess(): ResidentStoreAccess | null {
      if (typeof window === "undefined") return null;

      try {
            const raw =
                  window.sessionStorage.getItem("residentStoreAccess");
            if (!raw) return null;

            const parsed = JSON.parse(raw);
            if (
                  !parsed?.accessToken ||
                  !Number(parsed?.storeShiftId)
            ) {
                  return null;
            }

            return {
                  accessToken: String(parsed.accessToken),
                  storeShiftId: Number(parsed.storeShiftId),
                  ledgerId: Number(parsed.ledgerId || 0),
                  validUntil: parsed.validUntil || null,
            };
      } catch {
            return null;
      }
}

function clearStoredAccess() {
      if (typeof window !== "undefined") {
            window.sessionStorage.removeItem("residentStoreAccess");
      }
}

function getTodayYmd() {
      const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Ho_Chi_Minh",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
      }).formatToParts(new Date());

      const value = (type: string) =>
            parts.find((item) => item.type === type)?.value || "";

      return `${value("year")}-${value("month")}-${value("day")}`;
}

function formatMoney(value: unknown) {
      return new Intl.NumberFormat("vi-VN", {
            maximumFractionDigits: 0,
      }).format(Number(value || 0));
}

function parseAmount(value: string) {
      const digits = String(value || "").replace(/[^\d]/g, "");
      return digits ? Number(digits) : 0;
}

function formatInputMoney(value: unknown) {
      const amount = Number(value || 0);
      return amount > 0 ? formatMoney(amount) : "";
}

function formatDateTime(value?: string | null) {
      if (!value) return "—";

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return String(value);

      return new Intl.DateTimeFormat("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
      }).format(date);
}

function isStoreSessionError(error: unknown) {
      const message = String(
            (error as any)?.message ||
                  (error as any)?.data?.message ||
                  error ||
                  "",
      ).toLowerCase();

      return [
            "phiên quyền cửa hàng không hợp lệ",
            "quyền cửa hàng đã hết",
            "phiên cửa hàng đã hết",
            "30 phút không hoạt động",
            "ca trực đã kết thúc",
      ].some((keyword) => message.includes(keyword));
}

export default function ResidentStore() {
      const [, navigate] = useLocation();
      const storeApi = (trpc as any).storeLedger;
      const residentApi = (trpc as any).residentPortal;

      const [access] = useState<ResidentStoreAccess | null>(
            () => getStoredAccess(),
      );
      const [activeTab, setActiveTab] =
            useState<StoreTab>("shift");
      const [documentDate, setDocumentDate] =
            useState(getTodayYmd());
      const [partnerName, setPartnerName] = useState("");
      const [notes, setNotes] = useState("");
      const [saleLines, setSaleLines] = useState<DocumentLine[]>([
            makeLine(),
      ]);
      const [purchaseLines, setPurchaseLines] =
            useState<DocumentLine[]>([makeLine()]);
      const [closingDate, setClosingDate] =
            useState(getTodayYmd());
      const [handoverCountedCash, setHandoverCountedCash] =
            useState("");
      const [
            handoverDifferenceReason,
            setHandoverDifferenceReason,
      ] = useState("");
      const [handoverNotes, setHandoverNotes] = useState("");

      const accessInput = access
            ? {
                    storeShiftId: access.storeShiftId,
                    storeAccessToken: access.accessToken,
              }
            : null;

      const sessionQuery =
            residentApi?.getMyStoreAccessSession?.useQuery?.(
                  access
                        ? {
                                storeShiftId: access.storeShiftId,
                                accessToken: access.accessToken,
                          }
                        : {
                                storeShiftId: 0,
                                accessToken: "",
                          },
                  {
                        enabled: Boolean(access),
                        retry: false,
                        refetchInterval: access ? 60000 : false,
                        refetchOnWindowFocus: true,
                  },
            ) ?? {
                  data: null,
                  isLoading: false,
                  error: null,
                  refetch: () => undefined,
            };

      const shiftSession = sessionQuery.data as any;
      const isAfternoon =
            shiftSession?.shiftType === "afternoon";

      const ledgersQuery =
            storeApi?.listLedgers?.useQuery?.(
                  accessInput
                        ? { isActive: true, ...accessInput }
                        : { isActive: true },
                  {
                        enabled: Boolean(accessInput),
                        retry: false,
                  },
            ) ?? {
                  data: [],
                  isLoading: false,
                  error: null,
                  refetch: () => undefined,
            };

      const ledgers = Array.isArray(ledgersQuery.data)
            ? ledgersQuery.data
            : [];
      const ledgerId = Number(
            access?.ledgerId || ledgers[0]?.id || 0,
      );

      const productsQuery =
            storeApi?.listProducts?.useQuery?.(
                  accessInput
                        ? { isActive: true, ...accessInput }
                        : { isActive: true },
                  {
                        enabled: Boolean(accessInput),
                        retry: false,
                  },
            ) ?? {
                  data: [],
                  isLoading: false,
                  error: null,
                  refetch: () => undefined,
            };

      const products = Array.isArray(productsQuery.data)
            ? productsQuery.data
            : [];

      const transactionsQuery =
            storeApi?.listTransactions?.useQuery?.(
                  accessInput
                        ? {
                                ledgerId: ledgerId || undefined,
                                fromDate: documentDate,
                                toDate: documentDate,
                                direction: "all",
                                limit: 200,
                                ...accessInput,
                          }
                        : { direction: "all" },
                  {
                        enabled: Boolean(accessInput && ledgerId),
                        retry: false,
                  },
            ) ?? {
                  data: [],
                  isLoading: false,
                  error: null,
                  refetch: () => undefined,
            };

      const handoverQuery =
            storeApi?.getMyShiftHandover?.useQuery?.(
                  accessInput
                        ? {
                                storeShiftId:
                                      accessInput.storeShiftId,
                                storeAccessToken:
                                      accessInput.storeAccessToken,
                                businessDate: documentDate,
                          }
                        : {
                                storeShiftId: 0,
                                storeAccessToken: "",
                          },
                  {
                        enabled: Boolean(accessInput),
                        retry: false,
                        refetchOnWindowFocus: true,
                  },
            ) ?? {
                  data: null,
                  isLoading: false,
                  error: null,
                  refetch: () => undefined,
            };

      const handoverData = handoverQuery.data as any;
      const handover = handoverData?.handover;

      const closingPreviewQuery =
            storeApi?.previewDailyClosing?.useQuery?.(
                  accessInput
                        ? {
                                ledgerId,
                                closingDate,
                                ...accessInput,
                          }
                        : {
                                ledgerId: 0,
                                closingDate,
                          },
                  {
                        enabled: Boolean(
                              accessInput &&
                                    ledgerId &&
                                    isAfternoon &&
                                    activeTab === "closing",
                        ),
                        retry: false,
                  },
            ) ?? {
                  data: null,
                  isLoading: false,
                  error: null,
                  refetch: () => undefined,
            };

      useEffect(() => {
            if (!access) navigate("/my-duties");
      }, [access, navigate]);

      useEffect(() => {
            const error =
                  sessionQuery.error ||
                  productsQuery.error ||
                  transactionsQuery.error ||
                  handoverQuery.error;

            if (!error || !isStoreSessionError(error)) return;

            clearStoredAccess();
            toast.error(
                  (error as any)?.message ||
                        "Phiên Cửa hàng đã hết. Vui lòng vào lại.",
            );
            window.location.replace("/my-duties");
      }, [
            sessionQuery.error,
            productsQuery.error,
            transactionsQuery.error,
            handoverQuery.error,
      ]);

      useEffect(() => {
            if (!handover) return;
            setHandoverCountedCash(
                  formatInputMoney(handover.countedCash),
            );
            setHandoverDifferenceReason(
                  handover.differenceReason || "",
            );
            setHandoverNotes(handover.notes || "");
      }, [handover?.id, handover?.updatedAt]);

      const summary = useMemo(() => {
            const rows = Array.isArray(transactionsQuery.data)
                  ? transactionsQuery.data.filter(
                          (item: any) =>
                                item.isActive !== false &&
                                !["cancelled", "void"].includes(
                                      String(
                                            item.status || "",
                                      ).toLowerCase(),
                                ),
                    )
                  : [];

            const totalIn = rows
                  .filter((item: any) => item.direction === "in")
                  .reduce(
                        (sum: number, item: any) =>
                              sum + Number(item.amount || 0),
                        0,
                  );

            const totalOut = rows
                  .filter((item: any) => item.direction === "out")
                  .reduce(
                        (sum: number, item: any) =>
                              sum + Number(item.amount || 0),
                        0,
                  );

            return {
                  totalIn,
                  totalOut,
                  balance: totalIn - totalOut,
                  count: rows.length,
            };
      }, [transactionsQuery.data]);

      const invalidateStoreData = async () => {
            await Promise.allSettled([
                  productsQuery.refetch?.(),
                  transactionsQuery.refetch?.(),
                  sessionQuery.refetch?.(),
                  handoverQuery.refetch?.(),
            ]);
      };

      const createSaleMutation =
            storeApi?.createSaleDocument?.useMutation?.({
                  onSuccess: async () => {
                        toast.success("Đã tạo phiếu bán hàng.");
                        setPartnerName("");
                        setNotes("");
                        setSaleLines([makeLine()]);
                        await invalidateStoreData();
                  },
                  onError: (error: any) =>
                        toast.error(
                              error?.message ||
                                    "Không thể tạo phiếu bán hàng.",
                        ),
            });

      const createPurchaseMutation =
            storeApi?.createStockInDocument?.useMutation?.({
                  onSuccess: async () => {
                        toast.success("Đã tạo phiếu nhập hàng.");
                        setPartnerName("");
                        setNotes("");
                        setPurchaseLines([makeLine()]);
                        await invalidateStoreData();
                  },
                  onError: (error: any) =>
                        toast.error(
                              error?.message ||
                                    "Không thể tạo phiếu nhập hàng.",
                        ),
            });

      const saveHandoverMutation =
            storeApi?.saveMyShiftHandover?.useMutation?.({
                  onSuccess: async () => {
                        toast.success("Đã lưu bàn giao ca.");
                        await handoverQuery.refetch?.();
                  },
                  onError: (error: any) =>
                        toast.error(
                              error?.message ||
                                    "Không thể lưu bàn giao ca.",
                        ),
            });

      const signHandoverMutation =
            storeApi?.signMyShiftHandover?.useMutation?.({
                  onSuccess: async () => {
                        toast.success("Đã ký giao ca.");
                        await Promise.allSettled([
                              handoverQuery.refetch?.(),
                              sessionQuery.refetch?.(),
                        ]);
                  },
                  onError: (error: any) =>
                        toast.error(
                              error?.message ||
                                    "Không thể ký giao ca.",
                        ),
            });

      const receiveHandoverMutation =
            storeApi?.receiveMyShiftHandover?.useMutation?.({
                  onSuccess: async () => {
                        toast.success("Đã xác nhận nhận ca.");
                        await invalidateStoreData();
                  },
                  onError: (error: any) =>
                        toast.error(
                              error?.message ||
                                    "Không thể xác nhận nhận ca.",
                        ),
            });

      const closeDailyMutation =
            storeApi?.closeDaily?.useMutation?.({
                  onSuccess: async (result: any) => {
                        toast.success(
                              result?.message ||
                                    "Đã chốt ngày. Quản lý sẽ review và xác nhận.",
                        );
                        clearStoredAccess();
                        window.location.replace("/my-duties");
                  },
                  onError: (error: any) =>
                        toast.error(
                              error?.message ||
                                    "Không thể chốt ngày.",
                        ),
            });

      const updateLine = (
            setter: React.Dispatch<
                  React.SetStateAction<DocumentLine[]>
            >,
            key: string,
            patch: Partial<DocumentLine>,
      ) => {
            setter((current) =>
                  current.map((line) =>
                        line.key === key
                              ? { ...line, ...patch }
                              : line,
                  ),
            );
      };

      const selectProduct = (
            type: "sale" | "purchase",
            line: DocumentLine,
            productId: number,
      ) => {
            const product = products.find(
                  (item: any) =>
                        Number(item.id) === Number(productId),
            );
            const reference =
                  type === "sale"
                        ? getSalePriceReference(product)
                        : getPurchasePriceReference(product);

            const patch: Partial<DocumentLine> = {
                  productId,
                  priceNote: reference.note,
                  usesPurchasePrice:
                        reference.isPurchaseFallback,
            };

            if (type === "sale") {
                  patch.unitPrice = formatInputMoney(
                        reference.value,
                  );
            } else {
                  patch.unitCost = formatInputMoney(
                        reference.value,
                  );
            }

            updateLine(
                  type === "sale"
                        ? setSaleLines
                        : setPurchaseLines,
                  line.key,
                  patch,
            );
      };

      const submitSale = () => {
            if (!accessInput || !ledgerId) return;

            const lines = saleLines
                  .map((line) => ({
                        productId: Number(line.productId),
                        quantity: Number(line.quantity),
                        unitPrice: parseAmount(line.unitPrice),
                  }))
                  .filter(
                        (line) =>
                              line.productId > 0 &&
                              line.quantity > 0 &&
                              line.unitPrice > 0,
                  );

            if (!lines.length) {
                  toast.error(
                        "Vui lòng chọn hàng hóa, số lượng và đơn giá.",
                  );
                  return;
            }

            createSaleMutation?.mutate?.({
                  ledgerId,
                  documentDate,
                  partnerName: partnerName.trim() || null,
                  paymentMethod: "cash",
                  notes: notes.trim() || null,
                  lines,
                  ...accessInput,
            });
      };

      const submitPurchase = () => {
            if (!accessInput || !ledgerId) return;

            const lines = purchaseLines
                  .map((line) => ({
                        productId: Number(line.productId),
                        quantity: Number(line.quantity),
                        unitCost: parseAmount(line.unitCost),
                  }))
                  .filter(
                        (line) =>
                              line.productId > 0 &&
                              line.quantity > 0 &&
                              line.unitCost > 0,
                  );

            if (!lines.length) {
                  toast.error(
                        "Vui lòng chọn hàng hóa, số lượng và giá mua.",
                  );
                  return;
            }

            createPurchaseMutation?.mutate?.({
                  ledgerId,
                  stockInSource: "purchase",
                  documentDate,
                  partnerName: partnerName.trim() || null,
                  paymentMethod: "cash",
                  notes: notes.trim() || null,
                  lines,
                  ...accessInput,
            });
      };

      if (!access) return null;

      const tabs: Array<{
            key: StoreTab;
            label: string;
            icon: React.ReactNode;
      }> = [
            {
                  key: "shift",
                  label: "Ca hiện tại",
                  icon: <Clock3 className="h-4 w-4" />,
            },
            {
                  key: "sales",
                  label: "Bán hàng",
                  icon: <ShoppingCart className="h-4 w-4" />,
            },
            {
                  key: "purchase",
                  label: "Nhập hàng",
                  icon: <PackagePlus className="h-4 w-4" />,
            },
            {
                  key: "transactions",
                  label: "Giao dịch ca",
                  icon: <ReceiptText className="h-4 w-4" />,
            },
            {
                  key: "handover",
                  label: "Bàn giao ca",
                  icon: <RefreshCw className="h-4 w-4" />,
            },
            ...(isAfternoon
                  ? [
                          {
                                key: "closing" as const,
                                label: "Chốt ngày",
                                icon: (
                                      <ShieldCheck className="h-4 w-4" />
                                ),
                          },
                    ]
                  : []),
      ];

      const currentLines =
            activeTab === "sales"
                  ? saleLines
                  : purchaseLines;
      const currentSetter =
            activeTab === "sales"
                  ? setSaleLines
                  : setPurchaseLines;

      return (
            <ResidenceCareLayout>
                  <div className={residenceMediumStyle.page}>
                        <div
                              className={
                                    residenceMediumStyle.pageAura
                              }
                        />
                        <div
                              className={
                                    residenceMediumStyle.pageShell
                              }
                        >
                              <header className="relative overflow-hidden rounded-[32px] border border-amber-100/80 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.2),transparent_34%),linear-gradient(135deg,rgba(255,251,235,0.98),rgba(255,255,255,0.96))] px-5 py-6 shadow-[0_24px_70px_rgba(120,53,15,0.08)] md:px-8">
                                    <div className="mx-auto max-w-3xl text-center">
                                          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700">
                                                Quyền tạm thời
                                                theo ca
                                          </p>
                                          <h1 className="mt-2 text-[28px] font-black tracking-tight text-slate-950 md:text-[34px]">
                                                Cửa hàng
                                          </h1>
                                          <p className="mx-auto mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                                                Chỉ các nghiệp vụ
                                                được phép trong ca
                                                trực hiện tại.
                                          </p>
                                    </div>

                                    <div className="mt-4 flex justify-center md:absolute md:right-6 md:top-5 md:mt-0">
                                          <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                      clearStoredAccess();
                                                      window.location.replace(
                                                            "/my-duties",
                                                      );
                                                }}
                                                className="rounded-full border-amber-200 bg-white/90"
                                          >
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Rời Cửa hàng
                                          </Button>
                                    </div>
                              </header>

                              <div className="mt-4 flex flex-wrap justify-center gap-2">
                                    {tabs.map((tab) => (
                                          <button
                                                key={tab.key}
                                                type="button"
                                                onClick={() =>
                                                      setActiveTab(
                                                            tab.key,
                                                      )
                                                }
                                                className={[
                                                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition",
                                                      activeTab ===
                                                      tab.key
                                                            ? "border-amber-300 bg-amber-400 text-slate-950 shadow-sm"
                                                            : "border-amber-100 bg-white/90 text-slate-600 hover:bg-amber-50",
                                                ].join(" ")}
                                          >
                                                {tab.icon}
                                                {tab.label}
                                          </button>
                                    ))}
                              </div>

                              <section className="mt-4 grid gap-3 md:grid-cols-4">
                                    {[
                                          [
                                                "Tổng thu ca",
                                                summary.totalIn,
                                                <ArrowDownToLine className="h-5 w-5" />,
                                          ],
                                          [
                                                "Tổng chi ca",
                                                summary.totalOut,
                                                <ArrowUpFromLine className="h-5 w-5" />,
                                          ],
                                          [
                                                "Chênh lệch",
                                                summary.balance,
                                                <CircleDollarSign className="h-5 w-5" />,
                                          ],
                                          [
                                                "Phát sinh",
                                                summary.count,
                                                <ReceiptText className="h-5 w-5" />,
                                          ],
                                    ].map(
                                          ([label, value, icon]) => (
                                                <Card
                                                      key={String(
                                                            label,
                                                      )}
                                                      className="rounded-[24px] border-amber-100/80 bg-white/92 p-4"
                                                >
                                                      <div className="flex items-center justify-between">
                                                            <span className="text-amber-700">
                                                                  {
                                                                        icon
                                                                  }
                                                            </span>
                                                            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                                                  {
                                                                        label
                                                                  }
                                                            </span>
                                                      </div>
                                                      <p className="mt-3 text-xl font-black text-slate-950">
                                                            {label ===
                                                            "Phát sinh"
                                                                  ? String(
                                                                          value,
                                                                    )
                                                                  : `${formatMoney(
                                                                          value,
                                                                    )} đ`}
                                                      </p>
                                                </Card>
                                          ),
                                    )}
                              </section>

                              {activeTab === "shift" ? (
                                    <Card className="mt-4 rounded-[30px] border-amber-100/80 bg-white/92 p-5">
                                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                                                Ca đang hoạt
                                                động
                                          </p>
                                          <h2 className="mt-1 text-xl font-black text-slate-950">
                                                {shiftSession?.ledgerName ||
                                                      ledgers[0]
                                                            ?.ledgerName ||
                                                      "Cửa hàng"}
                                          </h2>
                                          <div className="mt-3 flex flex-wrap gap-2">
                                                <Badge variant="secondary">
                                                      {isAfternoon
                                                            ? "Ca chiều"
                                                            : "Ca sáng"}
                                                </Badge>
                                                <Badge variant="outline">
                                                      Hết quyền:{" "}
                                                      {formatDateTime(
                                                            shiftSession?.validUntil ||
                                                                  access.validUntil,
                                                      )}
                                                </Badge>
                                          </div>
                                    </Card>
                              ) : null}

                              {activeTab === "sales" ||
                              activeTab === "purchase" ? (
                                    <Card className="mt-4 rounded-[30px] border-amber-100/80 bg-white/92 p-5">
                                          <div className="flex flex-col gap-3 border-b border-amber-100 pb-4 md:flex-row md:items-end md:justify-between">
                                                <div>
                                                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                                                            {activeTab ===
                                                            "sales"
                                                                  ? "Phiếu bán hàng"
                                                                  : "Phiếu nhập hàng"}
                                                      </p>
                                                      <h2 className="mt-1 text-xl font-black text-slate-950">
                                                            {activeTab ===
                                                            "sales"
                                                                  ? "Ghi nhận bán hàng"
                                                                  : "Ghi nhận mua hàng nhập kho"}
                                                      </h2>
                                                </div>
                                                <div className="w-full md:w-52">
                                                      <FormDateInput
                                                            value={
                                                                  documentDate
                                                            }
                                                            onChange={
                                                                  setDocumentDate
                                                            }
                                                      />
                                                </div>
                                          </div>

                                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                                                <input
                                                      value={
                                                            partnerName
                                                      }
                                                      onChange={(
                                                            event,
                                                      ) =>
                                                            setPartnerName(
                                                                  event
                                                                        .target
                                                                        .value,
                                                            )
                                                      }
                                                      placeholder={
                                                            activeTab ===
                                                            "sales"
                                                                  ? "Tên khách hàng (không bắt buộc)"
                                                                  : "Tên nhà cung cấp"
                                                      }
                                                      className="rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm"
                                                />
                                                <input
                                                      value={notes}
                                                      onChange={(
                                                            event,
                                                      ) =>
                                                            setNotes(
                                                                  event
                                                                        .target
                                                                        .value,
                                                            )
                                                      }
                                                      placeholder="Ghi chú"
                                                      className="rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm"
                                                />
                                          </div>

                                          <div className="mt-4 space-y-3">
                                                {currentLines.map(
                                                      (line) => (
                                                            <div
                                                                  key={
                                                                        line.key
                                                                  }
                                                                  className="rounded-2xl border border-amber-100 bg-amber-50/35 p-3"
                                                            >
                                                                  <div className="grid gap-3 md:grid-cols-[minmax(260px,1fr)_120px_190px_80px] md:items-start">
                                                                        <select
                                                                              value={
                                                                                    line.productId
                                                                              }
                                                                              onChange={(
                                                                                    event,
                                                                              ) =>
                                                                                    selectProduct(
                                                                                          activeTab ===
                                                                                                "sales"
                                                                                                ? "sale"
                                                                                                : "purchase",
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
                                                                                    Chọn
                                                                                    hàng
                                                                                    hóa
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
                                                                                                }{" "}
                                                                                                ·
                                                                                                tồn{" "}
                                                                                                {formatMoney(
                                                                                                      product.currentStock,
                                                                                                )}{" "}
                                                                                                {product.unit ||
                                                                                                      ""}
                                                                                          </option>
                                                                                    ),
                                                                              )}
                                                                        </select>

                                                                        <input
                                                                              type="number"
                                                                              min="0.01"
                                                                              step="0.01"
                                                                              value={
                                                                                    line.quantity
                                                                              }
                                                                              onChange={(
                                                                                    event,
                                                                              ) =>
                                                                                    updateLine(
                                                                                          currentSetter,
                                                                                          line.key,
                                                                                          {
                                                                                                quantity:
                                                                                                      event
                                                                                                            .target
                                                                                                            .value,
                                                                                          },
                                                                                    )
                                                                              }
                                                                              className="h-11 rounded-xl border border-amber-100 bg-white px-3 text-sm"
                                                                              placeholder="Số lượng"
                                                                        />

                                                                        <div className="min-h-[68px]">
                                                                              <input
                                                                                    inputMode="numeric"
                                                                                    value={
                                                                                          activeTab ===
                                                                                          "sales"
                                                                                                ? line.unitPrice
                                                                                                : line.unitCost
                                                                                    }
                                                                                    onChange={(
                                                                                          event,
                                                                                    ) =>
                                                                                          updateLine(
                                                                                                currentSetter,
                                                                                                line.key,
                                                                                                activeTab ===
                                                                                                      "sales"
                                                                                                      ? {
                                                                                                              unitPrice:
                                                                                                                    event
                                                                                                                          .target
                                                                                                                          .value,
                                                                                                              priceNote:
                                                                                                                    "Giá bán nhập thủ công",
                                                                                                              usesPurchasePrice:
                                                                                                                    false,
                                                                                                        }
                                                                                                      : {
                                                                                                              unitCost:
                                                                                                                    event
                                                                                                                          .target
                                                                                                                          .value,
                                                                                                              priceNote:
                                                                                                                    "Giá mua nhập thủ công",
                                                                                                        },
                                                                                          )
                                                                                    }
                                                                                    className="h-11 w-full rounded-xl border border-amber-100 bg-white px-3 text-right text-sm font-bold"
                                                                                    placeholder={
                                                                                          activeTab ===
                                                                                          "sales"
                                                                                                ? "Đơn giá bán"
                                                                                                : "Giá mua"
                                                                                    }
                                                                              />
                                                                              <p
                                                                                    className={[
                                                                                          "mt-1 min-h-[16px] text-[11px] font-semibold",
                                                                                          line.usesPurchasePrice
                                                                                                ? "text-amber-700"
                                                                                                : "text-slate-500",
                                                                                    ].join(
                                                                                          " ",
                                                                                    )}
                                                                              >
                                                                                    {
                                                                                          line.priceNote
                                                                                    }
                                                                              </p>
                                                                        </div>

                                                                        <Button
                                                                              type="button"
                                                                              variant="outline"
                                                                              disabled={
                                                                                    currentLines.length ===
                                                                                    1
                                                                              }
                                                                              onClick={() =>
                                                                                    currentSetter(
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
                                                                              className="h-11 rounded-xl"
                                                                        >
                                                                              Xóa
                                                                        </Button>
                                                                  </div>
                                                            </div>
                                                      ),
                                                )}
                                          </div>

                                          <div className="mt-4 flex flex-wrap justify-between gap-2">
                                                <Button
                                                      type="button"
                                                      variant="outline"
                                                      onClick={() =>
                                                            currentSetter(
                                                                  (
                                                                        current,
                                                                  ) => [
                                                                        ...current,
                                                                        makeLine(),
                                                                  ],
                                                            )
                                                      }
                                                      className="rounded-full"
                                                >
                                                      Thêm dòng
                                                </Button>

                                                <Button
                                                      type="button"
                                                      onClick={
                                                            activeTab ===
                                                            "sales"
                                                                  ? submitSale
                                                                  : submitPurchase
                                                      }
                                                      disabled={
                                                            activeTab ===
                                                            "sales"
                                                                  ? createSaleMutation?.isPending
                                                                  : createPurchaseMutation?.isPending
                                                      }
                                                      className="rounded-full bg-amber-500 px-6 font-bold text-white hover:bg-amber-600"
                                                >
                                                      {activeTab ===
                                                      "sales" ? (
                                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                                      ) : (
                                                            <PackagePlus className="mr-2 h-4 w-4" />
                                                      )}
                                                      {activeTab ===
                                                      "sales"
                                                            ? "Lưu phiếu bán"
                                                            : "Lưu phiếu nhập"}
                                                </Button>
                                          </div>
                                    </Card>
                              ) : null}

                              {activeTab === "transactions" ? (
                                    <Card className="mt-4 overflow-hidden rounded-[30px] border-amber-100/80 bg-white/92">
                                          <div className="border-b border-amber-100 bg-amber-50/50 px-5 py-4">
                                                <h2 className="text-xl font-black text-slate-950">
                                                      Phát sinh
                                                      của ca
                                                </h2>
                                          </div>
                                          <div className="divide-y divide-amber-100">
                                                {(
                                                      transactionsQuery.data ||
                                                      []
                                                ).map(
                                                      (
                                                            item: any,
                                                      ) => (
                                                            <div
                                                                  key={
                                                                        item.id
                                                                  }
                                                                  className="flex flex-col gap-2 px-5 py-4 md:flex-row md:items-center md:justify-between"
                                                            >
                                                                  <div>
                                                                        <p className="font-bold text-slate-900">
                                                                              {item.title ||
                                                                                    item.transactionCode ||
                                                                                    "Giao dịch"}
                                                                        </p>
                                                                        <p className="mt-1 text-xs text-slate-500">
                                                                              {item.partnerName ||
                                                                                    "Không có đối tác"}{" "}
                                                                              ·{" "}
                                                                              {
                                                                                    item.transactionDate
                                                                              }
                                                                        </p>
                                                                  </div>
                                                                  <p
                                                                        className={
                                                                              item.direction ===
                                                                              "in"
                                                                                    ? "font-black text-emerald-700"
                                                                                    : "font-black text-rose-700"
                                                                        }
                                                                  >
                                                                        {item.direction ===
                                                                        "in"
                                                                              ? "+"
                                                                              : "-"}
                                                                        {formatMoney(
                                                                              item.amount,
                                                                        )}{" "}
                                                                        đ
                                                                  </p>
                                                            </div>
                                                      ),
                                                )}
                                          </div>
                                    </Card>
                              ) : null}

                              {activeTab === "handover" ? (
                                    <Card className="mt-4 rounded-[30px] border-amber-100/80 bg-white/92 p-5">
                                          <div className="border-b border-amber-100 pb-4">
                                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                                                      Bàn giao ca
                                                      Cửa hàng
                                                </p>
                                                <h2 className="mt-1 text-xl font-black text-slate-950">
                                                      {isAfternoon
                                                            ? "Xác nhận nhận từ ca sáng"
                                                            : "Lập bàn giao sang ca chiều"}
                                                </h2>
                                          </div>

                                          {handoverQuery.isLoading ? (
                                                <div className="mt-4 p-8 text-center text-sm text-slate-500">
                                                      Đang tải dữ
                                                      liệu...
                                                </div>
                                          ) : handoverQuery.error ? (
                                                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                                                      {
                                                            handoverQuery
                                                                  .error
                                                                  .message
                                                      }
                                                </div>
                                          ) : !isAfternoon ? (
                                                <>
                                                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                                                            {[
                                                                  [
                                                                        "Tiền đầu ca",
                                                                        handoverData
                                                                              ?.totals
                                                                              ?.openingCash,
                                                                  ],
                                                                  [
                                                                        "Tổng thu",
                                                                        Number(
                                                                              handoverData
                                                                                    ?.totals
                                                                                    ?.totalSales ||
                                                                                    0,
                                                                        ) +
                                                                              Number(
                                                                                    handoverData
                                                                                          ?.totals
                                                                                          ?.totalOtherIncome ||
                                                                                          0,
                                                                              ),
                                                                  ],
                                                                  [
                                                                        "Tổng chi",
                                                                        Number(
                                                                              handoverData
                                                                                    ?.totals
                                                                                    ?.totalPurchases ||
                                                                                    0,
                                                                        ) +
                                                                              Number(
                                                                                    handoverData
                                                                                          ?.totals
                                                                                          ?.totalOtherExpense ||
                                                                                          0,
                                                                              ),
                                                                  ],
                                                                  [
                                                                        "Tiền dự kiến",
                                                                        handoverData
                                                                              ?.totals
                                                                              ?.expectedCash,
                                                                  ],
                                                                  [
                                                                        "Tiền thực tế",
                                                                        handover
                                                                              ?.countedCash,
                                                                  ],
                                                                  [
                                                                        "Chênh lệch",
                                                                        handover
                                                                              ?.differenceAmount,
                                                                  ],
                                                            ].map(
                                                                  ([
                                                                        label,
                                                                        value,
                                                                  ]) => (
                                                                        <div
                                                                              key={String(
                                                                                    label,
                                                                              )}
                                                                              className="rounded-2xl border border-amber-100 bg-amber-50/45 p-4"
                                                                        >
                                                                              <p className="text-xs font-bold text-slate-500">
                                                                                    {
                                                                                          label
                                                                                    }
                                                                              </p>
                                                                              <p className="mt-2 text-lg font-black text-slate-950">
                                                                                    {formatMoney(
                                                                                          value,
                                                                                    )}{" "}
                                                                                    đ
                                                                              </p>
                                                                        </div>
                                                                  ),
                                                            )}
                                                      </div>

                                                      <div className="mt-4 grid gap-3 lg:grid-cols-2">
                                                            <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/35">
                                                                  <div className="flex items-center justify-between border-b border-emerald-100 px-4 py-3">
                                                                        <div>
                                                                              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                                                                                    Chi tiết tổng thu
                                                                              </p>
                                                                              <p className="mt-1 text-xl font-black text-slate-950">
                                                                                    {formatMoney(
                                                                                          Number(
                                                                                                handoverData?.totals?.totalSales ||
                                                                                                      0,
                                                                                          ) +
                                                                                                Number(
                                                                                                      handoverData?.totals?.totalOtherIncome ||
                                                                                                            0,
                                                                                                ),
                                                                                    )}{" "}
                                                                                    đ
                                                                              </p>
                                                                        </div>
                                                                        <ArrowDownToLine className="h-5 w-5 text-emerald-700" />
                                                                  </div>

                                                                  <div className="divide-y divide-emerald-100">
                                                                        <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                                                                              <span className="font-semibold text-slate-600">
                                                                                    Thu bán hàng
                                                                              </span>
                                                                              <span className="font-black text-emerald-700">
                                                                                    {formatMoney(
                                                                                          handoverData?.totals?.totalSales,
                                                                                    )}{" "}
                                                                                    đ
                                                                              </span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                                                                              <span className="font-semibold text-slate-600">
                                                                                    Thu khác
                                                                              </span>
                                                                              <span className="font-black text-emerald-700">
                                                                                    {formatMoney(
                                                                                          handoverData?.totals?.totalOtherIncome,
                                                                                    )}{" "}
                                                                                    đ
                                                                              </span>
                                                                        </div>
                                                                  </div>
                                                            </section>

                                                            <section className="overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/35">
                                                                  <div className="flex items-center justify-between border-b border-rose-100 px-4 py-3">
                                                                        <div>
                                                                              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-700">
                                                                                    Chi tiết tổng chi
                                                                              </p>
                                                                              <p className="mt-1 text-xl font-black text-slate-950">
                                                                                    {formatMoney(
                                                                                          Number(
                                                                                                handoverData?.totals?.totalPurchases ||
                                                                                                      0,
                                                                                          ) +
                                                                                                Number(
                                                                                                      handoverData?.totals?.totalOtherExpense ||
                                                                                                            0,
                                                                                                ),
                                                                                    )}{" "}
                                                                                    đ
                                                                              </p>
                                                                        </div>
                                                                        <ArrowUpFromLine className="h-5 w-5 text-rose-700" />
                                                                  </div>

                                                                  <div className="divide-y divide-rose-100">
                                                                        <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                                                                              <span className="font-semibold text-slate-600">
                                                                                    Chi nhập mua hàng
                                                                              </span>
                                                                              <span className="font-black text-rose-700">
                                                                                    {formatMoney(
                                                                                          handoverData?.totals?.totalPurchases,
                                                                                    )}{" "}
                                                                                    đ
                                                                              </span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                                                                              <span className="font-semibold text-slate-600">
                                                                                    Chi khác
                                                                              </span>
                                                                              <span className="font-black text-rose-700">
                                                                                    {formatMoney(
                                                                                          handoverData?.totals?.totalOtherExpense,
                                                                                    )}{" "}
                                                                                    đ
                                                                              </span>
                                                                        </div>
                                                                  </div>
                                                            </section>
                                                      </div>

                                                      <section className="mt-4 overflow-hidden rounded-2xl border border-amber-100 bg-white">
                                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 bg-amber-50/45 px-4 py-3">
                                                                  <div>
                                                                        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
                                                                              Các khoản phát sinh trong ca
                                                                        </p>
                                                                        <p className="mt-1 text-sm font-semibold text-slate-600">
                                                                              {Number(
                                                                                    handoverData?.totals?.transactionCount ||
                                                                                          0,
                                                                              )}{" "}
                                                                              giao dịch được tính vào bàn giao
                                                                        </p>
                                                                  </div>
                                                                  <Badge variant="outline">
                                                                        Thu{" "}
                                                                        {formatMoney(
                                                                              Number(
                                                                                    handoverData?.totals?.totalSales ||
                                                                                          0,
                                                                              ) +
                                                                                    Number(
                                                                                          handoverData?.totals?.totalOtherIncome ||
                                                                                                0,
                                                                                    ),
                                                                        )}{" "}
                                                                        đ · Chi{" "}
                                                                        {formatMoney(
                                                                              Number(
                                                                                    handoverData?.totals?.totalPurchases ||
                                                                                          0,
                                                                              ) +
                                                                                    Number(
                                                                                          handoverData?.totals?.totalOtherExpense ||
                                                                                                0,
                                                                                    ),
                                                                        )}{" "}
                                                                        đ
                                                                  </Badge>
                                                            </div>

                                                            <div className="max-h-72 divide-y divide-amber-100 overflow-y-auto">
                                                                  {(Array.isArray(
                                                                        transactionsQuery.data,
                                                                  )
                                                                        ? transactionsQuery.data.filter(
                                                                                (
                                                                                      item: any,
                                                                                ) =>
                                                                                      item.isActive !==
                                                                                            false &&
                                                                                      ![
                                                                                            "cancelled",
                                                                                            "void",
                                                                                      ].includes(
                                                                                            String(
                                                                                                  item.status ||
                                                                                                        "",
                                                                                            ).toLowerCase(),
                                                                                      ),
                                                                          )
                                                                        : []
                                                                  ).map((item: any) => (
                                                                        <div
                                                                              key={item.id}
                                                                              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                                                        >
                                                                              <div className="min-w-0">
                                                                                    <p className="truncate text-sm font-bold text-slate-900">
                                                                                          {item.title ||
                                                                                                item.transactionCode ||
                                                                                                "Giao dịch Cửa hàng"}
                                                                                    </p>
                                                                                    <p className="mt-1 text-xs text-slate-500">
                                                                                          {item.partnerName ||
                                                                                                "Không có đối tác"}{" "}
                                                                                          ·{" "}
                                                                                          {item.category ||
                                                                                                "khác"}
                                                                                    </p>
                                                                              </div>
                                                                              <p
                                                                                    className={
                                                                                          item.direction ===
                                                                                          "in"
                                                                                                ? "whitespace-nowrap font-black text-emerald-700"
                                                                                                : "whitespace-nowrap font-black text-rose-700"
                                                                                    }
                                                                              >
                                                                                    {item.direction ===
                                                                                    "in"
                                                                                          ? "+"
                                                                                          : "-"}
                                                                                    {formatMoney(
                                                                                          item.amount,
                                                                                    )}{" "}
                                                                                    đ
                                                                              </p>
                                                                        </div>
                                                                  ))}

                                                                  {!transactionsQuery.isLoading &&
                                                                  !(
                                                                        Array.isArray(
                                                                              transactionsQuery.data,
                                                                        ) &&
                                                                        transactionsQuery.data.length
                                                                  ) ? (
                                                                        <div className="px-4 py-8 text-center text-sm text-slate-500">
                                                                              Chưa có khoản thu hoặc chi trong ca.
                                                                        </div>
                                                                  ) : null}
                                                            </div>
                                                      </section>

                                                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                                                            <input
                                                                  inputMode="numeric"
                                                                  value={
                                                                        handoverCountedCash
                                                                  }
                                                                  onChange={(
                                                                        event,
                                                                  ) =>
                                                                        setHandoverCountedCash(
                                                                              event
                                                                                    .target
                                                                                    .value,
                                                                        )
                                                                  }
                                                                  placeholder="Tiền mặt thực tế cuối ca"
                                                                  className="rounded-2xl border border-amber-100 bg-white px-4 py-3"
                                                            />
                                                            <input
                                                                  value={
                                                                        handoverDifferenceReason
                                                                  }
                                                                  onChange={(
                                                                        event,
                                                                  ) =>
                                                                        setHandoverDifferenceReason(
                                                                              event
                                                                                    .target
                                                                                    .value,
                                                                        )
                                                                  }
                                                                  placeholder="Lý do chênh lệch"
                                                                  className="rounded-2xl border border-amber-100 bg-white px-4 py-3"
                                                            />
                                                      </div>

                                                      <textarea
                                                            value={
                                                                  handoverNotes
                                                            }
                                                            onChange={(
                                                                  event,
                                                            ) =>
                                                                  setHandoverNotes(
                                                                        event
                                                                              .target
                                                                              .value,
                                                                  )
                                                            }
                                                            rows={3}
                                                            placeholder="Ghi chú bàn giao"
                                                            className="mt-3 w-full rounded-2xl border border-amber-100 bg-white px-4 py-3"
                                                      />

                                                      <div className="mt-4 flex justify-end gap-2">
                                                            <Button
                                                                  type="button"
                                                                  variant="outline"
                                                                  disabled={
                                                                        saveHandoverMutation?.isPending
                                                                  }
                                                                  onClick={() =>
                                                                        saveHandoverMutation?.mutate?.(
                                                                              {
                                                                                    ...accessInput,
                                                                                    businessDate:
                                                                                          documentDate,
                                                                                    countedCash:
                                                                                          parseAmount(
                                                                                                handoverCountedCash,
                                                                                          ),
                                                                                    differenceReason:
                                                                                          handoverDifferenceReason.trim() ||
                                                                                          null,
                                                                                    notes:
                                                                                          handoverNotes.trim() ||
                                                                                          null,
                                                                              },
                                                                        )
                                                                  }
                                                                  className="rounded-full"
                                                            >
                                                                  Lưu bản
                                                                  nháp
                                                            </Button>
                                                            {handover ? (
                                                                  <Button
                                                                        type="button"
                                                                        disabled={
                                                                              signHandoverMutation?.isPending
                                                                        }
                                                                        onClick={() =>
                                                                              signHandoverMutation?.mutate?.(
                                                                                    accessInput,
                                                                              )
                                                                        }
                                                                        className="rounded-full bg-amber-500 font-bold text-white"
                                                                  >
                                                                        Ký
                                                                        giao
                                                                  </Button>
                                                            ) : null}
                                                      </div>
                                                </>
                                          ) : (
                                                <div className="mt-4">
                                                      <p className="text-sm text-slate-600">
                                                            {handover
                                                                  ? `Tiền nhận bàn giao: ${formatMoney(
                                                                          handover.countedCash,
                                                                    )} đ`
                                                                  : "Chưa có bàn giao từ ca sáng."}
                                                      </p>
                                                      {handoverData?.canReceive ? (
                                                            <Button
                                                                  type="button"
                                                                  onClick={() =>
                                                                        receiveHandoverMutation?.mutate?.(
                                                                              accessInput,
                                                                        )
                                                                  }
                                                                  className="mt-4 rounded-full bg-amber-500 font-bold text-white"
                                                            >
                                                                  Xác
                                                                  nhận
                                                                  nhận
                                                                  ca
                                                            </Button>
                                                      ) : null}
                                                </div>
                                          )}
                                    </Card>
                              ) : null}

                              {activeTab === "closing" &&
                              isAfternoon ? (
                                    <Card className="mt-4 rounded-[30px] border-amber-100/80 bg-white/92 p-5">
                                          <h2 className="text-xl font-black text-slate-950">
                                                Chốt ngày
                                          </h2>
                                          <div className="mt-4 max-w-xs">
                                                <FormDateInput
                                                      value={
                                                            closingDate
                                                      }
                                                      onChange={
                                                            setClosingDate
                                                      }
                                                />
                                          </div>
                                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                                                {[
                                                      [
                                                            "Tổng thu",
                                                            closingPreviewQuery
                                                                  .data
                                                                  ?.summary
                                                                  ?.totalIn,
                                                      ],
                                                      [
                                                            "Tổng chi",
                                                            closingPreviewQuery
                                                                  .data
                                                                  ?.summary
                                                                  ?.totalOut,
                                                      ],
                                                      [
                                                            "Chênh lệch",
                                                            closingPreviewQuery
                                                                  .data
                                                                  ?.summary
                                                                  ?.balance,
                                                      ],
                                                ].map(
                                                      ([
                                                            label,
                                                            value,
                                                      ]) => (
                                                            <div
                                                                  key={String(
                                                                        label,
                                                                  )}
                                                                  className="rounded-2xl border border-amber-100 bg-amber-50/45 p-4"
                                                            >
                                                                  <p className="text-xs font-bold text-slate-500">
                                                                        {
                                                                              label
                                                                        }
                                                                  </p>
                                                                  <p className="mt-2 text-lg font-black text-slate-950">
                                                                        {formatMoney(
                                                                              value,
                                                                        )}{" "}
                                                                        đ
                                                                  </p>
                                                            </div>
                                                      ),
                                                )}
                                          </div>
                                          <div className="mt-4 flex justify-end">
                                                <Button
                                                      type="button"
                                                      disabled={
                                                            closeDailyMutation?.isPending
                                                      }
                                                      onClick={() =>
                                                            closeDailyMutation?.mutate?.(
                                                                  {
                                                                        ledgerId,
                                                                        closingDate,
                                                                        notes:
                                                                              notes.trim() ||
                                                                              null,
                                                                        ...accessInput,
                                                                  },
                                                            )
                                                      }
                                                      className="rounded-full bg-amber-500 px-6 font-bold text-white"
                                                >
                                                      Chốt ngày
                                                </Button>
                                          </div>
                                    </Card>
                              ) : null}
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}
