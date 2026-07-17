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
      onShowAllProducts,
      onShowLowStock,
      onShowInventoryValue,
      onShowExpectedRevenue,
      onShowCashflowIncome,
      onShowCashflowExpense,
      onShowCashflowNet,
      onShowCashflowTransactions,
      formatMoney,
}: any) {
      const action =
            activeStoreTab === "products"
                  ? { label: "Thêm hàng hóa", icon: <Plus className="h-4 w-4" />, onClick: openCreateProductModal }
                  : activeStoreTab === "sales"
                        ? { label: "Tạo phiếu bán", icon: <Plus className="h-4 w-4" />, onClick: openSaleStockModal }
                        : activeStoreTab === "purchase"
                              ? { label: "Tạo phiếu nhập", icon: <Plus className="h-4 w-4" />, onClick: openPurchaseStockModal }
                              : { label: "Chốt ngày", icon: <ShieldCheck className="h-4 w-4" />, onClick: handleCloseDaily };

      return (
            <>
                  <header className="relative px-4 pb-3 pt-4 sm:px-6">
                        <div className="mx-auto max-w-3xl text-center">
                              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-[30px]">
                                    {pageHeaderMeta.title}
                              </h1>
                              <p className="mx-auto mt-1.5 max-w-2xl text-sm font-medium leading-5 text-slate-500 sm:text-[15px]">
                                    {pageHeaderMeta.description}
                              </p>
                        </div>
                        <div className="mt-3 flex justify-center lg:absolute lg:right-6 lg:top-4 lg:mt-0">
                              <button type="button" onClick={action.onClick} className={residenceMediumStyle.buttonCardPrimary}>
                                    {action.icon}
                                    {action.label}
                              </button>
                        </div>
                  </header>

                  {activeStoreTab === "products" ? (
                        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                              <SummaryCard
                                    icon={<Boxes className="h-5 w-5" />}
                                    label="Tổng mặt hàng"
                                    value={String(productSummary?.totalProducts || 0)}
                                    note="Đang sử dụng"
                                    tone="slate"
                                    onClick={onShowAllProducts}
                                    active={false}
                              />
                              <SummaryCard
                                    icon={<CalendarDays className="h-5 w-5" />}
                                    label="Sắp hết / hết hàng"
                                    value={String(productSummary?.lowStockCount || 0)}
                                    note="Mở danh sách cần chú ý"
                                    tone="amber"
                                    onClick={onShowLowStock}
                                    active={false}
                              />
                              <SummaryCard
                                    icon={<WalletCards className="h-5 w-5" />}
                                    label="Giá trị vốn tồn"
                                    value={`${formatMoney(productSummary?.inventoryValue || 0)} đ`}
                                    note="Theo giá vốn hiện tại"
                                    tone="rose"
                                    onClick={onShowInventoryValue}
                              />
                              <SummaryCard
                                    icon={<CircleDollarSign className="h-5 w-5" />}
                                    label="Doanh thu dự kiến"
                                    value={`${formatMoney(productSummary?.expectedSaleValue || 0)} đ`}
                                    note="Theo giá bán hiện tại"
                                    tone="emerald"
                                    onClick={onShowExpectedRevenue}
                              />
                        </section>
                  ) : activeStoreTab === "purchase" || activeStoreTab === "sales" ? null : (
                        <section className="grid gap-3 md:grid-cols-4">
                              <SummaryCard icon={<CircleDollarSign className="h-5 w-5" />} label="Tổng thu" value={`${formatMoney(summary.totalIn)} đ`} note="Mở cơ cấu thu" tone="emerald" onClick={onShowCashflowIncome} />
                              <SummaryCard icon={<WalletCards className="h-5 w-5" />} label="Tổng chi" value={`${formatMoney(summary.totalOut)} đ`} note="Mở cơ cấu chi" tone="rose" onClick={onShowCashflowExpense} />
                              <SummaryCard icon={<Store className="h-5 w-5" />} label="Chênh lệch" value={`${formatMoney(summary.balance)} đ`} note="Xem kết quả thu chi" tone="amber" onClick={onShowCashflowNet} />
                              <SummaryCard icon={<CalendarDays className="h-5 w-5" />} label="Phát sinh" value={String(summary.transactionCount || 0)} note="Mở sổ theo ngày" tone="slate" onClick={onShowCashflowTransactions} />
                        </section>
                  )}
            </>
      );
}
