import {
      BadgeDollarSign,
      Boxes,
      CalendarDays,
      CircleDollarSign,
      Layers3,
      PackageMinus,
      PackagePlus,
      Plus,
      ShieldCheck,
      ShoppingCart,
      Store,
      WalletCards,
} from "lucide-react";

import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { SummaryCard } from "@/components/store-ledger/StoreLedgerShared";

export function StoreLedgerHeaderSummary({
      pageHeaderMeta,
      activeLedgerId,
      activeStoreTab,
      setFormError,
      setLedgerModalOpen,
      openCreateProductModal,
      openSaleStockModal,
      openPurchaseStockModal,
      handleCloseDaily,
      stockInSummary,
      saleSummary,
      summary,
      formatMoney,
}: any) {
      return (
            <>
                  <section className="relative overflow-hidden px-5 pb-7 pt-8 text-slate-900 sm:px-6">
                        <div className="pointer-events-none absolute inset-0 opacity-90 [background-image:radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.96),transparent_28%),radial-gradient(circle_at_72%_0%,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_18%_2%,rgba(217,119,6,0.10),transparent_24%)]" />
                        <div className="relative min-h-[118px]">
                              <div className="mx-auto flex max-w-4xl flex-col items-center pt-4 text-center lg:pt-3">
                                    <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-[40px]">
                                          {pageHeaderMeta.title}
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                                          {pageHeaderMeta.description}
                                    </p>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:absolute lg:right-0 lg:top-0 lg:mt-0 lg:justify-end">
                                    {!activeLedgerId ? (
                                          <button
                                                type="button"
                                                onClick={() => {
                                                      setFormError("");
                                                      setLedgerModalOpen(true);
                                                }}
                                                className={residenceMediumStyle.buttonCardPrimary}
                                          >
                                                <Plus className="h-4 w-4" />
                                                Khởi tạo cửa hàng
                                          </button>
                                    ) : activeStoreTab === "products" ? (
                                          <button
                                                type="button"
                                                onClick={openCreateProductModal}
                                                className={residenceMediumStyle.buttonCardPrimary}
                                          >
                                                <Plus className="h-4 w-4" />
                                                Thêm hàng hóa
                                          </button>
                                    ) : activeStoreTab === "sales" ? (
                                          <button
                                                type="button"
                                                onClick={openSaleStockModal}
                                                className={residenceMediumStyle.buttonCardPrimary}
                                          >
                                                <Plus className="h-4 w-4" />
                                                Tạo phiếu bán
                                          </button>
                                    ) : activeStoreTab === "purchase" ? (
                                          <button
                                                type="button"
                                                onClick={openPurchaseStockModal}
                                                className={residenceMediumStyle.buttonCardPrimary}
                                          >
                                                <Plus className="h-4 w-4" />
                                                Tạo phiếu nhập
                                          </button>
                                    ) : (
                                          <button
                                                type="button"
                                                onClick={handleCloseDaily}
                                                className={residenceMediumStyle.buttonCardPrimary}
                                          >
                                                <ShieldCheck className="h-4 w-4" />
                                                Chốt ngày
                                          </button>
                                    )}
                              </div>
                        </div>
                  </section>

                  {activeStoreTab === "purchase" ? (
                        <section className="grid gap-3 md:grid-cols-4">
                              <SummaryCard
                                    icon={<PackagePlus className="h-5 w-5" />}
                                    label="Phiếu nhập"
                                    value={String(stockInSummary.receiptCount)}
                                    tone="amber"
                              />
                              <SummaryCard
                                    icon={<Boxes className="h-5 w-5" />}
                                    label="Số lượng nhập"
                                    value={formatMoney(stockInSummary.totalQuantity)}
                                    tone="emerald"
                              />
                              <SummaryCard
                                    icon={<Layers3 className="h-5 w-5" />}
                                    label="Mặt hàng đã nhập"
                                    value={String(stockInSummary.productCount)}
                                    tone="slate"
                              />
                              <SummaryCard
                                    icon={<ShoppingCart className="h-5 w-5" />}
                                    label="Phiếu mua hàng"
                                    value={String(stockInSummary.purchaseCount)}
                                    tone="rose"
                              />
                        </section>
                  ) : activeStoreTab === "sales" ? (
                        <section className="grid gap-3 md:grid-cols-4">
                              <SummaryCard
                                    icon={<PackageMinus className="h-5 w-5" />}
                                    label="Phiếu bán"
                                    value={String(saleSummary.receiptCount)}
                                    tone="amber"
                              />
                              <SummaryCard
                                    icon={<Boxes className="h-5 w-5" />}
                                    label="Số lượng bán"
                                    value={formatMoney(saleSummary.totalQuantity)}
                                    tone="emerald"
                              />
                              <SummaryCard
                                    icon={<Layers3 className="h-5 w-5" />}
                                    label="Mặt hàng đã bán"
                                    value={String(saleSummary.productCount)}
                                    tone="slate"
                              />
                              <SummaryCard
                                    icon={<BadgeDollarSign className="h-5 w-5" />}
                                    label="Doanh thu bán"
                                    value={`${formatMoney(saleSummary.revenue)} đ`}
                                    tone="rose"
                              />
                        </section>
                  ) : activeStoreTab !== "products" ? (
                        <section className="grid gap-3 md:grid-cols-4">
                              <SummaryCard
                                    icon={<CircleDollarSign className="h-5 w-5" />}
                                    label="Tổng thu"
                                    value={`${formatMoney(summary.totalIn)} đ`}
                                    tone="emerald"
                              />
                              <SummaryCard
                                    icon={<WalletCards className="h-5 w-5" />}
                                    label="Tổng chi"
                                    value={`${formatMoney(summary.totalOut)} đ`}
                                    tone="rose"
                              />
                              <SummaryCard
                                    icon={<Store className="h-5 w-5" />}
                                    label="Số dư"
                                    value={`${formatMoney(summary.balance)} đ`}
                                    tone="amber"
                              />
                              <SummaryCard
                                    icon={<CalendarDays className="h-5 w-5" />}
                                    label="Phát sinh"
                                    value={String(summary.transactionCount || 0)}
                                    tone="slate"
                              />
                        </section>
                  ) : null}

                  {!activeLedgerId ? (
                        <section className="rounded-[1.75rem] border border-dashed border-amber-200 bg-amber-50/70 p-5 text-center shadow-sm">
                              <p className="text-sm font-black text-slate-900">Chưa khởi tạo cửa hàng</p>
                              <p className="mt-1 text-sm font-semibold text-slate-500">
                                    Khởi tạo một lần để quản lý sản phẩm, mua hàng, bán hàng và chốt ngày.
                              </p>
                              <button
                                    type="button"
                                    onClick={() => setLedgerModalOpen(true)}
                                    className="mt-4 rounded-2xl bg-slate-950 px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-950/10"
                              >
                                    Khởi tạo cửa hàng
                              </button>
                        </section>
                  ) : null}
            </>
      );
}
