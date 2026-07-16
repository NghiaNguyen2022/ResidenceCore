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
      activeStoreTab,
      openCreateProductModal,
      openSaleStockModal,
      openPurchaseStockModal,
      handleCloseDaily,
      stockInSummary,
      saleSummary,
      summary,
      productSummary,
      lowStockOnly,
      onShowAllProducts,
      onShowLowStock,
      onShowInventoryReport,
      formatMoney,
}: any) {
      return (
            <>
                  <section className="relative overflow-hidden rounded-[1.7rem] border border-[#eadfca] bg-[linear-gradient(135deg,rgba(255,255,255,.98)_0%,rgba(255,250,238,.94)_58%,rgba(255,244,207,.86)_100%)] px-5 py-5 shadow-[0_16px_46px_rgba(120,80,20,.07)] sm:px-6">
                        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl" />
                        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div className="min-w-0">
                                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">
                                          {pageHeaderMeta.eyebrow}
                                    </p>
                                    <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-[30px]">
                                          {pageHeaderMeta.title}
                                    </h1>
                                    <p className="mt-1.5 max-w-3xl text-sm font-medium leading-6 text-slate-600">
                                          {pageHeaderMeta.description}
                                    </p>
                              </div>

                              <div className="shrink-0">
                                    {activeStoreTab === "products" ? (
                                          <button
                                                type="button"
                                                onClick={openCreateProductModal}
                                                className={residenceMediumStyle.buttonCardPrimary}
                                          >
                                                <Plus className="h-4 w-4" />
                                                Thêm hàng hóa
                                          </button>
                                    ) : activeStoreTab === "sales" ? (
                                          <button type="button" onClick={openSaleStockModal} className={residenceMediumStyle.buttonCardPrimary}>
                                                <Plus className="h-4 w-4" />
                                                Tạo phiếu bán
                                          </button>
                                    ) : activeStoreTab === "purchase" ? (
                                          <button type="button" onClick={openPurchaseStockModal} className={residenceMediumStyle.buttonCardPrimary}>
                                                <Plus className="h-4 w-4" />
                                                Tạo phiếu nhập
                                          </button>
                                    ) : (
                                          <button type="button" onClick={handleCloseDaily} className={residenceMediumStyle.buttonCardPrimary}>
                                                <ShieldCheck className="h-4 w-4" />
                                                Chốt ngày
                                          </button>
                                    )}
                              </div>
                        </div>
                  </section>

                  {activeStoreTab === "products" ? (
                        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                              <SummaryCard
                                    icon={<Boxes className="h-5 w-5" />}
                                    label="Tổng mặt hàng"
                                    value={String(productSummary?.totalProducts || 0)}
                                    note="Đang sử dụng"
                                    tone="slate"
                                    onClick={onShowAllProducts}
                                    active={!lowStockOnly}
                              />
                              <SummaryCard
                                    icon={<CalendarDays className="h-5 w-5" />}
                                    label="Sắp hết / hết hàng"
                                    value={String(productSummary?.lowStockCount || 0)}
                                    note="Nhấn để lọc danh sách"
                                    tone="amber"
                                    onClick={onShowLowStock}
                                    active={Boolean(lowStockOnly)}
                              />
                              <SummaryCard
                                    icon={<WalletCards className="h-5 w-5" />}
                                    label="Giá trị vốn tồn"
                                    value={`${formatMoney(productSummary?.inventoryValue || 0)} đ`}
                                    note="Theo giá vốn hiện tại"
                                    tone="rose"
                                    onClick={onShowInventoryReport}
                              />
                              <SummaryCard
                                    icon={<CircleDollarSign className="h-5 w-5" />}
                                    label="Doanh thu dự kiến"
                                    value={`${formatMoney(productSummary?.expectedSaleValue || 0)} đ`}
                                    note="Theo giá bán hiện tại"
                                    tone="emerald"
                                    onClick={onShowInventoryReport}
                              />
                        </section>
                  ) : activeStoreTab === "purchase" ? (
                        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                              <SummaryCard icon={<PackagePlus className="h-5 w-5" />} label="Phiếu nhập" value={String(stockInSummary.receiptCount)} tone="amber" />
                              <SummaryCard icon={<Boxes className="h-5 w-5" />} label="Số lượng nhập" value={formatMoney(stockInSummary.totalQuantity)} tone="emerald" />
                              <SummaryCard icon={<Layers3 className="h-5 w-5" />} label="Mặt hàng đã nhập" value={String(stockInSummary.productCount)} tone="slate" />
                              <SummaryCard icon={<ShoppingCart className="h-5 w-5" />} label="Phiếu mua hàng" value={String(stockInSummary.purchaseCount)} tone="rose" />
                        </section>
                  ) : activeStoreTab === "sales" ? (
                        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                              <SummaryCard icon={<PackageMinus className="h-5 w-5" />} label="Phiếu bán" value={String(saleSummary.receiptCount)} tone="amber" />
                              <SummaryCard icon={<Boxes className="h-5 w-5" />} label="Số lượng bán" value={formatMoney(saleSummary.totalQuantity)} tone="emerald" />
                              <SummaryCard icon={<Layers3 className="h-5 w-5" />} label="Mặt hàng đã bán" value={String(saleSummary.productCount)} tone="slate" />
                              <SummaryCard icon={<BadgeDollarSign className="h-5 w-5" />} label="Doanh thu bán" value={`${formatMoney(saleSummary.revenue)} đ`} tone="rose" />
                        </section>
                  ) : (
                        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                              <SummaryCard icon={<CircleDollarSign className="h-5 w-5" />} label="Tổng thu" value={`${formatMoney(summary.totalIn)} đ`} tone="emerald" />
                              <SummaryCard icon={<WalletCards className="h-5 w-5" />} label="Tổng chi" value={`${formatMoney(summary.totalOut)} đ`} tone="rose" />
                              <SummaryCard icon={<Store className="h-5 w-5" />} label="Số dư" value={`${formatMoney(summary.balance)} đ`} tone="amber" />
                              <SummaryCard icon={<CalendarDays className="h-5 w-5" />} label="Phát sinh" value={String(summary.transactionCount || 0)} tone="slate" />
                        </section>
                  )}
            </>
      );
}
