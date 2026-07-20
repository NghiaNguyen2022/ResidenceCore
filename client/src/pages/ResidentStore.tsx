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
      Store,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { FormDateInput } from "@/components/shared";
import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

type ResidentStoreAccess = {
      accessToken: string;
      storeShiftId: number;
      ledgerId: number;
      validUntil?: string | null;
};

type StoreTab = "shift" | "sales" | "purchase" | "transactions" | "handover" | "closing";

type DocumentLine = {
      productId: number;
      quantity: string;
      unitPrice?: string;
      unitCost?: string;
};

function getStoredAccess(): ResidentStoreAccess | null {
      if (typeof window === "undefined") return null;

      try {
            const raw = window.sessionStorage.getItem("residentStoreAccess");
            if (!raw) return null;

            const parsed = JSON.parse(raw);
            if (!parsed?.accessToken || !Number(parsed?.storeShiftId)) return null;

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
      const digits = value.replace(/[^\d]/g, "");
      return digits ? Number(digits) : 0;
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

function emptyLine(): DocumentLine {
      return {
            productId: 0,
            quantity: "1",
            unitPrice: "",
            unitCost: "",
      };
}

export default function ResidentStore() {
      const [, navigate] = useLocation();
      const storeApi = (trpc as any).storeLedger;
      const residentApi = (trpc as any).residentPortal;

      const [access] = useState<ResidentStoreAccess | null>(() => getStoredAccess());
      const [activeTab, setActiveTab] = useState<StoreTab>("shift");
      const [documentDate, setDocumentDate] = useState(getTodayYmd());
      const [partnerName, setPartnerName] = useState("");
      const [notes, setNotes] = useState("");
      const [saleLines, setSaleLines] = useState<DocumentLine[]>([emptyLine()]);
      const [purchaseLines, setPurchaseLines] = useState<DocumentLine[]>([emptyLine()]);
      const [closingDate, setClosingDate] = useState(getTodayYmd());
      const [handoverCountedCash, setHandoverCountedCash] = useState("");
      const [handoverDifferenceReason, setHandoverDifferenceReason] = useState("");
      const [handoverNotes, setHandoverNotes] = useState("");

      const accessInput = access
            ? {
                  storeShiftId: access.storeShiftId,
                  storeAccessToken: access.accessToken,
            }
            : null;

      const sessionQuery = residentApi?.getMyStoreAccessSession?.useQuery?.(
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
      ) ?? { data: null, isLoading: false, error: null, refetch: () => undefined };

      const shiftSession = sessionQuery.data as any;
      const isAfternoon = shiftSession?.shiftType === "afternoon";

      const ledgersQuery = storeApi?.listLedgers?.useQuery?.(
            accessInput ? { isActive: true, ...accessInput } : { isActive: true },
            {
                  enabled: Boolean(accessInput),
                  retry: false,
            },
      ) ?? { data: [], isLoading: false, error: null, refetch: () => undefined };

      const ledgers = Array.isArray(ledgersQuery.data) ? ledgersQuery.data : [];
      const ledgerId = Number(access?.ledgerId || ledgers[0]?.id || 0);

      const productsQuery = storeApi?.listProducts?.useQuery?.(
            accessInput ? { isActive: true, ...accessInput } : { isActive: true },
            {
                  enabled: Boolean(accessInput),
                  retry: false,
            },
      ) ?? { data: [], isLoading: false, error: null, refetch: () => undefined };

      const products = Array.isArray(productsQuery.data) ? productsQuery.data : [];

      const transactionsQuery = storeApi?.listTransactions?.useQuery?.(
            accessInput
                  ? {
                        ledgerId: ledgerId || undefined,
                        fromDate: documentDate,
                        toDate: documentDate,
                        direction: "all",
                        limit: 200,
                        ...accessInput,
                  }
                  : {
                        direction: "all",
                  },
            {
                  enabled: Boolean(accessInput && ledgerId),
                  retry: false,
            },
      ) ?? { data: [], isLoading: false, error: null, refetch: () => undefined };

      const saleDocumentsQuery = storeApi?.listDocuments?.useQuery?.(
            accessInput
                  ? {
                        ledgerId: ledgerId || undefined,
                        documentType: "sale",
                        fromDate: documentDate,
                        toDate: documentDate,
                        limit: 100,
                        ...accessInput,
                  }
                  : {},
            {
                  enabled: Boolean(accessInput && ledgerId),
                  retry: false,
            },
      ) ?? { data: [], isLoading: false, error: null, refetch: () => undefined };

      const purchaseDocumentsQuery = storeApi?.listDocuments?.useQuery?.(
            accessInput
                  ? {
                        ledgerId: ledgerId || undefined,
                        documentType: "stock_in",
                        fromDate: documentDate,
                        toDate: documentDate,
                        limit: 100,
                        ...accessInput,
                  }
                  : {},
            {
                  enabled: Boolean(accessInput && ledgerId),
                  retry: false,
            },
      ) ?? { data: [], isLoading: false, error: null, refetch: () => undefined };

      const handoverQuery = storeApi?.getMyShiftHandover?.useQuery?.(
            accessInput
                  ? {
                        storeShiftId: accessInput.storeShiftId,
                        storeAccessToken: accessInput.storeAccessToken,
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
      ) ?? { data: null, isLoading: false, error: null, refetch: () => undefined };

      const handoverData = handoverQuery.data as any;
      const handover = handoverData?.handover;

      useEffect(() => {
            if (!handover) return;
            setHandoverCountedCash(String(Number(handover.countedCash || 0)));
            setHandoverDifferenceReason(handover.differenceReason || "");
            setHandoverNotes(handover.notes || "");
      }, [handover?.id, handover?.updatedAt]);

      const saveHandoverMutation = storeApi?.saveMyShiftHandover?.useMutation?.({
            onSuccess: async () => {
                  toast.success("Đã lưu bàn giao ca.");
                  await handoverQuery.refetch?.();
            },
            onError: (error: any) =>
                  toast.error(error?.message || "Không thể lưu bàn giao ca."),
      });

      const signHandoverMutation = storeApi?.signMyShiftHandover?.useMutation?.({
            onSuccess: async () => {
                  toast.success("Đã ký giao ca.");
                  await Promise.allSettled([
                        handoverQuery.refetch?.(),
                        sessionQuery.refetch?.(),
                  ]);
            },
            onError: (error: any) =>
                  toast.error(error?.message || "Không thể ký giao ca."),
      });

      const receiveHandoverMutation = storeApi?.receiveMyShiftHandover?.useMutation?.({
            onSuccess: async () => {
                  toast.success("Đã xác nhận nhận ca.");
                  await Promise.allSettled([
                        handoverQuery.refetch?.(),
                        sessionQuery.refetch?.(),
                        transactionsQuery.refetch?.(),
                  ]);
            },
            onError: (error: any) =>
                  toast.error(error?.message || "Không thể xác nhận nhận ca."),
      });

      const summary = useMemo(() => {
            const transactions = Array.isArray(transactionsQuery.data)
                  ? transactionsQuery.data
                  : [];

            const totalIn = transactions
                  .filter((item: any) => item.direction === "in")
                  .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);

            const totalOut = transactions
                  .filter((item: any) => item.direction === "out")
                  .reduce((sum: number, item: any) => sum + Number(item.amount || 0), 0);

            return {
                  totalIn,
                  totalOut,
                  balance: totalIn - totalOut,
                  count: transactions.length,
            };
      }, [transactionsQuery.data]);

      const invalidateStoreData = async () => {
            await Promise.allSettled([
                  productsQuery.refetch?.(),
                  transactionsQuery.refetch?.(),
                  saleDocumentsQuery.refetch?.(),
                  purchaseDocumentsQuery.refetch?.(),
                  sessionQuery.refetch?.(),
            ]);
      };

      const createSaleMutation = storeApi?.createSaleDocument?.useMutation?.({
            onSuccess: async () => {
                  toast.success("Đã tạo phiếu bán hàng.");
                  setPartnerName("");
                  setNotes("");
                  setSaleLines([emptyLine()]);
                  await invalidateStoreData();
            },
            onError: (error: any) => {
                  toast.error(error?.message || "Không thể tạo phiếu bán hàng.");
            },
      });

      const createPurchaseMutation = storeApi?.createStockInDocument?.useMutation?.({
            onSuccess: async () => {
                  toast.success("Đã tạo phiếu nhập hàng.");
                  setPartnerName("");
                  setNotes("");
                  setPurchaseLines([emptyLine()]);
                  await invalidateStoreData();
            },
            onError: (error: any) => {
                  toast.error(error?.message || "Không thể tạo phiếu nhập hàng.");
            },
      });

      const closingPreviewQuery = storeApi?.previewDailyClosing?.useQuery?.(
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
                  enabled: Boolean(accessInput && ledgerId && isAfternoon && activeTab === "closing"),
                  retry: false,
            },
      ) ?? { data: null, isLoading: false, error: null, refetch: () => undefined };

      const closeDailyMutation = storeApi?.closeDaily?.useMutation?.({
            onSuccess: async () => {
                  toast.success("Đã chốt ngày. Quản lý sẽ review và xác nhận.");
                  await invalidateStoreData();
            },
            onError: (error: any) => {
                  toast.error(error?.message || "Không thể chốt ngày.");
            },
      });

      useEffect(() => {
            if (!access) {
                  navigate("/my-duties");
            }
      }, [access, navigate]);

      useEffect(() => {
            if (!sessionQuery.error) return;

            clearStoredAccess();
            toast.error(sessionQuery.error.message || "Quyền Cửa hàng đã hết hiệu lực.");
            window.location.href = "/my-duties";
      }, [sessionQuery.error]);

      const exitStore = () => {
            clearStoredAccess();
            window.location.href = "/my-duties";
      };

      const updateLine = (
            setter: React.Dispatch<React.SetStateAction<DocumentLine[]>>,
            index: number,
            patch: Partial<DocumentLine>,
      ) => {
            setter((current) =>
                  current.map((line, lineIndex) =>
                        lineIndex === index ? { ...line, ...patch } : line,
                  ),
            );
      };

      const submitSale = () => {
            if (!accessInput || !ledgerId) return;

            const lines = saleLines
                  .map((line) => ({
                        productId: Number(line.productId),
                        quantity: Number(line.quantity),
                        unitPrice: parseAmount(line.unitPrice || ""),
                  }))
                  .filter(
                        (line) =>
                              line.productId > 0 &&
                              line.quantity > 0 &&
                              line.unitPrice > 0,
                  );

            if (!lines.length) {
                  toast.error("Vui lòng chọn hàng hóa, số lượng và đơn giá.");
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
                        unitCost: parseAmount(line.unitCost || ""),
                  }))
                  .filter(
                        (line) =>
                              line.productId > 0 &&
                              line.quantity > 0 &&
                              line.unitCost > 0,
                  );

            if (!lines.length) {
                  toast.error("Vui lòng chọn hàng hóa, số lượng và giá nhập.");
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

      const tabs: Array<{ key: StoreTab; label: string; icon: React.ReactNode }> = [
            { key: "shift", label: "Ca hiện tại", icon: <Clock3 className="h-4 w-4" /> },
            { key: "sales", label: "Bán hàng", icon: <ShoppingCart className="h-4 w-4" /> },
            { key: "purchase", label: "Nhập hàng", icon: <PackagePlus className="h-4 w-4" /> },
            { key: "transactions", label: "Giao dịch ca", icon: <ReceiptText className="h-4 w-4" /> },
            { key: "handover", label: "Bàn giao ca", icon: <RefreshCw className="h-4 w-4" /> },
            ...(isAfternoon
                  ? [{
                        key: "closing" as const,
                        label: "Chốt ngày",
                        icon: <ShieldCheck className="h-4 w-4" />,
                  }]
                  : []),
      ];

      if (!access) return null;

      return (
            <ResidenceCareLayout>
                  <div className={residenceMediumStyle.page}>
                        <div className={residenceMediumStyle.pageAura} />
                        <div className={residenceMediumStyle.pageShell}>
                              <header className="relative overflow-hidden rounded-[32px] border border-amber-100/80 bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.2),transparent_34%),linear-gradient(135deg,rgba(255,251,235,0.98),rgba(255,255,255,0.96))] px-5 py-6 shadow-[0_24px_70px_rgba(120,53,15,0.08)] md:px-8">
                                    <div className="mx-auto max-w-3xl text-center">
                                          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-700">
                                                Quyền tạm thời theo ca
                                          </p>
                                          <h1 className="mt-2 text-[28px] font-black tracking-tight text-slate-950 md:text-[34px]">
                                                Cửa hàng
                                          </h1>
                                          <p className="mx-auto mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-500">
                                                Chỉ các nghiệp vụ được phép trong ca trực hiện tại. Quyền sẽ tự hết sau 30 phút không thao tác hoặc khi ca kết thúc.
                                          </p>
                                    </div>

                                    <div className="mt-4 flex justify-center md:absolute md:right-6 md:top-5 md:mt-0">
                                          <Button
                                                type="button"
                                                variant="outline"
                                                onClick={exitStore}
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
                                                onClick={() => setActiveTab(tab.key)}
                                                className={[
                                                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition",
                                                      activeTab === tab.key
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
                                          {
                                                label: "Tổng thu ca",
                                                value: `${formatMoney(summary.totalIn)} đ`,
                                                icon: <ArrowDownToLine className="h-5 w-5" />,
                                          },
                                          {
                                                label: "Tổng chi ca",
                                                value: `${formatMoney(summary.totalOut)} đ`,
                                                icon: <ArrowUpFromLine className="h-5 w-5" />,
                                          },
                                          {
                                                label: "Chênh lệch",
                                                value: `${formatMoney(summary.balance)} đ`,
                                                icon: <CircleDollarSign className="h-5 w-5" />,
                                          },
                                          {
                                                label: "Phát sinh",
                                                value: String(summary.count),
                                                icon: <ReceiptText className="h-5 w-5" />,
                                          },
                                    ].map((item) => (
                                          <Card
                                                key={item.label}
                                                className="rounded-[24px] border-amber-100/80 bg-white/92 p-4 shadow-[0_14px_34px_rgba(120,53,15,0.055)]"
                                          >
                                                <div className="flex items-center justify-between">
                                                      <span className="text-amber-700">{item.icon}</span>
                                                      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                                            {item.label}
                                                      </span>
                                                </div>
                                                <p className="mt-3 text-xl font-black text-slate-950">
                                                      {item.value}
                                                </p>
                                          </Card>
                                    ))}
                              </section>

                              {activeTab === "shift" ? (
                                    <Card className="mt-4 rounded-[30px] border-amber-100/80 bg-white/92 p-5 shadow-[0_18px_48px_rgba(120,53,15,0.06)]">
                                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                                                            Ca đang hoạt động
                                                      </p>
                                                      <h2 className="mt-1 text-xl font-black text-slate-950">
                                                            {shiftSession?.ledgerName || ledgers[0]?.ledgerName || "Cửa hàng"}
                                                      </h2>
                                                      <div className="mt-3 flex flex-wrap gap-2">
                                                            <Badge variant="secondary">
                                                                  {isAfternoon ? "Ca chiều" : "Ca sáng"}
                                                            </Badge>
                                                            <Badge variant="outline">
                                                                  Hết quyền: {formatDateTime(shiftSession?.validUntil || access.validUntil)}
                                                            </Badge>
                                                      </div>
                                                </div>
                                                <Button
                                                      type="button"
                                                      variant="outline"
                                                      onClick={() => sessionQuery.refetch?.()}
                                                      className="rounded-full"
                                                >
                                                      <RefreshCw className="mr-2 h-4 w-4" />
                                                      Kiểm tra quyền
                                                </Button>
                                          </div>

                                          <div className="mt-5 grid gap-3 md:grid-cols-3">
                                                <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                                                      <p className="text-xs font-bold text-amber-700">Được phép</p>
                                                      <p className="mt-1 text-sm text-slate-600">Bán hàng, nhập hàng và xem giao dịch của ca.</p>
                                                </div>
                                                <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                                                      <p className="text-xs font-bold text-amber-700">Không được phép</p>
                                                      <p className="mt-1 text-sm text-slate-600">Sửa sản phẩm, giá bán, review, xác nhận hoặc bỏ chốt.</p>
                                                </div>
                                                <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                                                      <p className="text-xs font-bold text-amber-700">Chốt ngày</p>
                                                      <p className="mt-1 text-sm text-slate-600">
                                                            {isAfternoon
                                                                  ? "Ca chiều được phép chốt ngày."
                                                                  : "Ca sáng không được chốt ngày."}
                                                      </p>
                                                </div>
                                          </div>
                                    </Card>
                              ) : null}

                              {(activeTab === "sales" || activeTab === "purchase") ? (
                                    <Card className="mt-4 rounded-[30px] border-amber-100/80 bg-white/92 p-5 shadow-[0_18px_48px_rgba(120,53,15,0.06)]">
                                          <div className="flex flex-col gap-3 border-b border-amber-100 pb-4 md:flex-row md:items-end md:justify-between">
                                                <div>
                                                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                                                            {activeTab === "sales" ? "Phiếu bán hàng" : "Phiếu nhập hàng"}
                                                      </p>
                                                      <h2 className="mt-1 text-xl font-black text-slate-950">
                                                            {activeTab === "sales" ? "Ghi nhận bán hàng" : "Ghi nhận mua hàng nhập kho"}
                                                      </h2>
                                                </div>
                                                <div className="w-full md:w-52">
                                                      <FormDateInput
                                                            value={documentDate}
                                                            onChange={setDocumentDate}
                                                      />
                                                </div>
                                          </div>

                                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                                                <input
                                                      value={partnerName}
                                                      onChange={(event) => setPartnerName(event.target.value)}
                                                      placeholder={activeTab === "sales" ? "Tên khách hàng (không bắt buộc)" : "Tên nhà cung cấp"}
                                                      className="rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                                                />
                                                <input
                                                      value={notes}
                                                      onChange={(event) => setNotes(event.target.value)}
                                                      placeholder="Ghi chú"
                                                      className="rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100"
                                                />
                                          </div>

                                          <div className="mt-4 space-y-3">
                                                {(activeTab === "sales" ? saleLines : purchaseLines).map((line, index) => (
                                                      <div
                                                            key={index}
                                                            className="grid gap-3 rounded-2xl border border-amber-100 bg-amber-50/35 p-3 md:grid-cols-[1fr_140px_180px_auto]"
                                                      >
                                                            <select
                                                                  value={line.productId}
                                                                  onChange={(event) =>
                                                                        updateLine(
                                                                              activeTab === "sales" ? setSaleLines : setPurchaseLines,
                                                                              index,
                                                                              { productId: Number(event.target.value) },
                                                                        )
                                                                  }
                                                                  className="rounded-xl border border-amber-100 bg-white px-3 py-2.5 text-sm"
                                                            >
                                                                  <option value={0}>Chọn hàng hóa</option>
                                                                  {products.map((product: any) => (
                                                                        <option key={product.id} value={product.id}>
                                                                              {product.productName} · tồn {Number(product.currentStock || 0)}
                                                                        </option>
                                                                  ))}
                                                            </select>

                                                            <input
                                                                  type="number"
                                                                  min="0.01"
                                                                  step="0.01"
                                                                  value={line.quantity}
                                                                  onChange={(event) =>
                                                                        updateLine(
                                                                              activeTab === "sales" ? setSaleLines : setPurchaseLines,
                                                                              index,
                                                                              { quantity: event.target.value },
                                                                        )
                                                                  }
                                                                  placeholder="Số lượng"
                                                                  className="rounded-xl border border-amber-100 bg-white px-3 py-2.5 text-sm"
                                                            />

                                                            <input
                                                                  inputMode="numeric"
                                                                  value={activeTab === "sales" ? line.unitPrice : line.unitCost}
                                                                  onChange={(event) =>
                                                                        updateLine(
                                                                              activeTab === "sales" ? setSaleLines : setPurchaseLines,
                                                                              index,
                                                                              activeTab === "sales"
                                                                                    ? { unitPrice: event.target.value }
                                                                                    : { unitCost: event.target.value },
                                                                        )
                                                                  }
                                                                  placeholder={activeTab === "sales" ? "Đơn giá bán" : "Giá nhập"}
                                                                  className="rounded-xl border border-amber-100 bg-white px-3 py-2.5 text-sm"
                                                            />

                                                            <Button
                                                                  type="button"
                                                                  variant="outline"
                                                                  disabled={(activeTab === "sales" ? saleLines : purchaseLines).length === 1}
                                                                  onClick={() =>
                                                                        (activeTab === "sales" ? setSaleLines : setPurchaseLines)(
                                                                              (current) => current.filter((_, itemIndex) => itemIndex !== index),
                                                                        )
                                                                  }
                                                                  className="rounded-xl"
                                                            >
                                                                  Xóa
                                                            </Button>
                                                      </div>
                                                ))}
                                          </div>

                                          <div className="mt-4 flex flex-wrap justify-between gap-2">
                                                <Button
                                                      type="button"
                                                      variant="outline"
                                                      onClick={() =>
                                                            (activeTab === "sales" ? setSaleLines : setPurchaseLines)(
                                                                  (current) => [...current, emptyLine()],
                                                            )
                                                      }
                                                      className="rounded-full"
                                                >
                                                      Thêm dòng
                                                </Button>

                                                <Button
                                                      type="button"
                                                      onClick={activeTab === "sales" ? submitSale : submitPurchase}
                                                      disabled={
                                                            activeTab === "sales"
                                                                  ? createSaleMutation?.isPending
                                                                  : createPurchaseMutation?.isPending
                                                      }
                                                      className="rounded-full bg-amber-500 px-6 font-bold text-white hover:bg-amber-600"
                                                >
                                                      {activeTab === "sales"
                                                            ? <ShoppingCart className="mr-2 h-4 w-4" />
                                                            : <PackagePlus className="mr-2 h-4 w-4" />}
                                                      {activeTab === "sales" ? "Lưu phiếu bán" : "Lưu phiếu nhập"}
                                                </Button>
                                          </div>
                                    </Card>
                              ) : null}

                              {activeTab === "transactions" ? (
                                    <Card className="mt-4 overflow-hidden rounded-[30px] border-amber-100/80 bg-white/92 shadow-[0_18px_48px_rgba(120,53,15,0.06)]">
                                          <div className="border-b border-amber-100 bg-amber-50/50 px-5 py-4">
                                                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                                                      Giao dịch trong ngày
                                                </p>
                                                <h2 className="mt-1 text-xl font-black text-slate-950">
                                                      Phát sinh của ca
                                                </h2>
                                          </div>
                                          <div className="divide-y divide-amber-100">
                                                {(transactionsQuery.data || []).map((item: any) => (
                                                      <div
                                                            key={item.id}
                                                            className="flex flex-col gap-2 px-5 py-4 md:flex-row md:items-center md:justify-between"
                                                      >
                                                            <div>
                                                                  <p className="font-bold text-slate-900">
                                                                        {item.title || item.transactionCode || "Giao dịch"}
                                                                  </p>
                                                                  <p className="mt-1 text-xs text-slate-500">
                                                                        {item.partnerName || "Không có đối tác"} · {item.transactionDate}
                                                                  </p>
                                                            </div>
                                                            <p className={item.direction === "in" ? "font-black text-emerald-700" : "font-black text-rose-700"}>
                                                                  {item.direction === "in" ? "+" : "-"}{formatMoney(item.amount)} đ
                                                            </p>
                                                      </div>
                                                ))}
                                                {!transactionsQuery.isLoading && !(transactionsQuery.data || []).length ? (
                                                      <div className="p-8 text-center text-sm text-slate-500">
                                                            Chưa có giao dịch trong ngày.
                                                      </div>
                                                ) : null}
                                          </div>
                                    </Card>
                              ) : null}

                              {activeTab === "handover" ? (
                                    <Card className="mt-4 rounded-[30px] border-amber-100/80 bg-white/92 p-5 shadow-[0_18px_48px_rgba(120,53,15,0.06)]">
                                          <div className="flex flex-col gap-3 border-b border-amber-100 pb-4 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                                                            Bàn giao ca Cửa hàng
                                                      </p>
                                                      <h2 className="mt-1 text-xl font-black text-slate-950">
                                                            {isAfternoon ? "Xác nhận nhận từ ca sáng" : "Lập bàn giao sang ca chiều"}
                                                      </h2>
                                                      <p className="mt-2 text-sm leading-6 text-slate-500">
                                                            Tiền dự kiến = tiền đầu ca + tổng thu − tổng chi. Sau khi hai bên ký, biên bản bị khóa.
                                                      </p>
                                                </div>
                                                <Badge variant={handover?.status === "completed" ? "default" : "secondary"}>
                                                      {handover?.status === "completed"
                                                            ? "Đã hoàn tất"
                                                            : handover?.status === "giver_signed"
                                                                  ? "Chờ ca chiều nhận"
                                                                  : handover
                                                                        ? "Bản nháp"
                                                                        : "Chưa lập"}
                                                </Badge>
                                          </div>

                                          {handoverQuery.isLoading ? (
                                                <div className="mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 p-8 text-center text-sm text-slate-500">
                                                      Đang tải dữ liệu bàn giao...
                                                </div>
                                          ) : handoverQuery.error ? (
                                                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                                                      {handoverQuery.error.message}
                                                </div>
                                          ) : !isAfternoon ? (
                                                <>
                                                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                                                            {[
                                                                  ["Tiền đầu ca", handoverData?.totals?.openingCash],
                                                                  ["Tổng thu", Number(handoverData?.totals?.totalSales || 0) + Number(handoverData?.totals?.totalOtherIncome || 0)],
                                                                  ["Tổng chi", Number(handoverData?.totals?.totalPurchases || 0) + Number(handoverData?.totals?.totalOtherExpense || 0)],
                                                                  ["Tiền dự kiến", handoverData?.totals?.expectedCash],
                                                                  ["Tiền thực tế", handover?.countedCash],
                                                                  ["Chênh lệch", handover?.differenceAmount],
                                                            ].map(([label, value]) => (
                                                                  <div key={String(label)} className="rounded-2xl border border-amber-100 bg-amber-50/45 p-4">
                                                                        <p className="text-xs font-bold text-slate-500">{label}</p>
                                                                        <p className="mt-2 text-lg font-black text-slate-950">
                                                                              {formatMoney(value)} đ
                                                                        </p>
                                                                  </div>
                                                            ))}
                                                      </div>

                                                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                                                            <label className="space-y-1.5">
                                                                  <span className="text-xs font-bold text-slate-600">Tiền mặt thực tế cuối ca</span>
                                                                  <input
                                                                        inputMode="numeric"
                                                                        disabled={!handoverData?.canEdit}
                                                                        value={handoverCountedCash}
                                                                        onChange={(event) => setHandoverCountedCash(event.target.value)}
                                                                        className="w-full rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100 disabled:bg-slate-50"
                                                                        placeholder="Nhập số tiền thực tế"
                                                                  />
                                                            </label>
                                                            <label className="space-y-1.5">
                                                                  <span className="text-xs font-bold text-slate-600">Lý do chênh lệch</span>
                                                                  <input
                                                                        disabled={!handoverData?.canEdit}
                                                                        value={handoverDifferenceReason}
                                                                        onChange={(event) => setHandoverDifferenceReason(event.target.value)}
                                                                        className="w-full rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100 disabled:bg-slate-50"
                                                                        placeholder="Không bắt buộc nếu không chênh lệch"
                                                                  />
                                                            </label>
                                                      </div>

                                                      <label className="mt-3 block space-y-1.5">
                                                            <span className="text-xs font-bold text-slate-600">Ghi chú bàn giao</span>
                                                            <textarea
                                                                  disabled={!handoverData?.canEdit}
                                                                  value={handoverNotes}
                                                                  onChange={(event) => setHandoverNotes(event.target.value)}
                                                                  rows={3}
                                                                  className="w-full rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm outline-none focus:border-amber-300 focus:ring-4 focus:ring-amber-100 disabled:bg-slate-50"
                                                            />
                                                      </label>

                                                      <div className="mt-5 flex flex-wrap justify-end gap-2">
                                                            {handoverData?.canEdit ? (
                                                                  <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        disabled={saveHandoverMutation?.isPending}
                                                                        onClick={() =>
                                                                              saveHandoverMutation?.mutate?.({
                                                                                    ...accessInput,
                                                                                    countedCash: parseAmount(handoverCountedCash),
                                                                                    differenceReason: handoverDifferenceReason.trim() || null,
                                                                                    notes: handoverNotes.trim() || null,
                                                                              })
                                                                        }
                                                                        className="rounded-full"
                                                                  >
                                                                        Lưu bản nháp
                                                                  </Button>
                                                            ) : null}

                                                            {handoverData?.canGiverSign ? (
                                                                  <Button
                                                                        type="button"
                                                                        disabled={signHandoverMutation?.isPending}
                                                                        onClick={() =>
                                                                              signHandoverMutation?.mutate?.({
                                                                                    ...accessInput,
                                                                              })
                                                                        }
                                                                        className="rounded-full bg-amber-500 px-6 font-bold text-white hover:bg-amber-600"
                                                                  >
                                                                        Ký và giao ca
                                                                  </Button>
                                                            ) : null}
                                                      </div>
                                                </>
                                          ) : !handover ? (
                                                <div className="mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50/40 p-8 text-center">
                                                      <p className="font-bold text-slate-900">Ca sáng chưa gửi bàn giao</p>
                                                      <p className="mt-2 text-sm text-slate-500">Dữ liệu sẽ xuất hiện sau khi người giao ký.</p>
                                                </div>
                                          ) : (
                                                <>
                                                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                                                            {[
                                                                  ["Tiền đầu ca sáng", handover.openingCash],
                                                                  ["Tổng thu", Number(handover.totalSales || 0) + Number(handover.totalOtherIncome || 0)],
                                                                  ["Tổng chi", Number(handover.totalPurchases || 0) + Number(handover.totalOtherExpense || 0)],
                                                                  ["Tiền dự kiến", handover.expectedCash],
                                                                  ["Tiền thực nhận", handover.countedCash],
                                                                  ["Chênh lệch", handover.differenceAmount],
                                                            ].map(([label, value]) => (
                                                                  <div key={String(label)} className="rounded-2xl border border-amber-100 bg-amber-50/45 p-4">
                                                                        <p className="text-xs font-bold text-slate-500">{label}</p>
                                                                        <p className="mt-2 text-lg font-black text-slate-950">
                                                                              {formatMoney(value)} đ
                                                                        </p>
                                                                  </div>
                                                            ))}
                                                      </div>

                                                      {handover.differenceReason ? (
                                                            <div className="mt-3 rounded-2xl border border-amber-100 bg-white p-4 text-sm text-slate-600">
                                                                  <strong>Lý do chênh lệch:</strong> {handover.differenceReason}
                                                            </div>
                                                      ) : null}

                                                      <div className="mt-5 flex justify-end">
                                                            {handoverData?.canReceive ? (
                                                                  <Button
                                                                        type="button"
                                                                        disabled={receiveHandoverMutation?.isPending}
                                                                        onClick={() =>
                                                                              receiveHandoverMutation?.mutate?.({
                                                                                    ...accessInput,
                                                                              })
                                                                        }
                                                                        className="rounded-full bg-amber-500 px-6 font-bold text-white hover:bg-amber-600"
                                                                  >
                                                                        Xác nhận đã nhận ca
                                                                  </Button>
                                                            ) : (
                                                                  <Badge variant="outline">
                                                                        {handover.status === "completed"
                                                                              ? "Hai bên đã xác nhận"
                                                                              : "Đang chờ người giao ký"}
                                                                  </Badge>
                                                            )}
                                                      </div>
                                                </>
                                          )}
                                    </Card>
                              ) : null}

                              {activeTab === "closing" && isAfternoon ? (
                                    <Card className="mt-4 rounded-[30px] border-amber-100/80 bg-white/92 p-5 shadow-[0_18px_48px_rgba(120,53,15,0.06)]">
                                          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                                <div>
                                                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700">
                                                            Chốt ngày
                                                      </p>
                                                      <h2 className="mt-1 text-xl font-black text-slate-950">
                                                            Xem trước trước khi chốt
                                                      </h2>
                                                </div>
                                                <div className="w-full md:w-52">
                                                      <FormDateInput
                                                            value={closingDate}
                                                            onChange={setClosingDate}
                                                      />
                                                </div>
                                          </div>

                                          <div className="mt-4 grid gap-3 md:grid-cols-4">
                                                {[
                                                      ["Tổng thu", closingPreviewQuery.data?.totalIn],
                                                      ["Tổng chi", closingPreviewQuery.data?.totalOut],
                                                      ["Chênh lệch", closingPreviewQuery.data?.balance],
                                                      ["Phát sinh", closingPreviewQuery.data?.transactionCount],
                                                ].map(([label, value]) => (
                                                      <div key={String(label)} className="rounded-2xl border border-amber-100 bg-amber-50/45 p-4">
                                                            <p className="text-xs font-bold text-slate-500">{label}</p>
                                                            <p className="mt-2 text-lg font-black text-slate-950">
                                                                  {label === "Phát sinh" ? String(value || 0) : `${formatMoney(value)} đ`}
                                                            </p>
                                                      </div>
                                                ))}
                                          </div>

                                          <div className="mt-5 flex justify-end">
                                                <Button
                                                      type="button"
                                                      disabled={closeDailyMutation?.isPending || !ledgerId}
                                                      onClick={() =>
                                                            closeDailyMutation?.mutate?.({
                                                                  ledgerId,
                                                                  closingDate,
                                                                  notes: "Học viên trực ca chiều chốt ngày.",
                                                                  ...accessInput,
                                                            })
                                                      }
                                                      className="rounded-full bg-amber-500 px-6 font-bold text-white hover:bg-amber-600"
                                                >
                                                      <ShieldCheck className="mr-2 h-4 w-4" />
                                                      Xác nhận chốt ngày
                                                </Button>
                                          </div>
                                    </Card>
                              ) : null}
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}
