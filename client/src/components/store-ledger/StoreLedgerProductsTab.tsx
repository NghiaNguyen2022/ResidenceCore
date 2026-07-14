import {
      CircleDollarSign,
      Search,
      Store,
      WalletCards,
      Boxes,
} from "lucide-react";

import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { SummaryCard, inputClass } from "@/components/store-ledger/StoreLedgerShared";
import { formatMoney, productCategoryLabel } from "@/components/store-ledger/storeLedgerUtils";

type StoreLedgerProductsTabProps = {
      productSearch: string;
      setProductSearch: (value: string) => void;
      lowStockOnly: boolean;
      setLowStockOnly: (value: boolean) => void;
      productCategoryFilter: string;
      setProductCategoryFilter: (value: string) => void;
      productCategoryOptions: Array<{ value: string; label: string }>;
      productsQuery: any;
      products: any[];
      productSummary: {
            totalStock: number;
            inventoryValue: number;
            expectedSaleValue: number;
            expectedProfit: number;
      };
      openEditProductModal: (product: any) => void;
      openPriceInfo: (product: any) => void;
      handleDeleteProduct: (product: any) => void;
      deleteProductMutation: any;
};

export function StoreLedgerProductsTab({
      productSearch,
      setProductSearch,
      lowStockOnly,
      setLowStockOnly,
      productCategoryFilter,
      setProductCategoryFilter,
      productCategoryOptions,
      productsQuery,
      products,
      productSummary,
      openEditProductModal,
      openPriceInfo,
      handleDeleteProduct,
      deleteProductMutation,
}: StoreLedgerProductsTabProps) {
      return (
            <>
                  <section className={residenceMediumStyle.section}>
                        <div
                              className={`${residenceMediumStyle.sectionHeader} flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between`}
                        >
                              <div className="min-w-0">
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                                          Danh mục
                                    </p>
                                    <h2 className="mt-1 text-2xl font-black text-slate-950">
                                          Danh sách hàng hóa
                                    </h2>
                                    <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
                                          Tạo hàng hóa, chọn nhóm hàng, đơn vị tính và cập nhật giá bán khi
                                          cần.
                                    </p>
                              </div>
                        </div>
                        <div className={`${residenceMediumStyle.sectionBody} space-y-4`}>
                              <div className="rounded-[1.4rem] border border-amber-100 bg-white/90 p-3 shadow-sm">
                                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                                          <div className="relative min-w-0">
                                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <input
                                                      value={productSearch}
                                                      onChange={(event) => setProductSearch(event.target.value)}
                                                      className={`${inputClass} pl-9`}
                                                      placeholder="Tìm tên hàng hóa hoặc nhóm hàng..."
                                                />
                                          </div>
                                          <label className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-100 bg-amber-50/70 px-4 py-2 text-sm font-black text-amber-800 shadow-sm">
                                                <input
                                                      type="checkbox"
                                                      checked={lowStockOnly}
                                                      onChange={(event) => setLowStockOnly(event.target.checked)}
                                                      className="h-4 w-4 rounded border-amber-300"
                                                />
                                                Sắp hết
                                          </label>
                                    </div>
                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                          <span className="mr-1 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                                                Nhóm hàng
                                          </span>
                                          {productCategoryOptions.map((item) => (
                                                <button
                                                      key={item.value}
                                                      type="button"
                                                      onClick={() => setProductCategoryFilter(item.value)}
                                                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${productCategoryFilter === item.value ? "bg-slate-950 text-white shadow-md" : "border border-amber-100 bg-white text-slate-700 hover:bg-amber-50"}`}
                                                >
                                                      {item.label}
                                                </button>
                                          ))}
                                    </div>
                              </div>
                              {productsQuery.isLoading ? (
                                    <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-semibold text-slate-600">
                                          Đang tải hàng hóa...
                                    </div>
                              ) : products.length ? (
                                    <div className="grid gap-3 xl:grid-cols-2">
                                          {products.slice(0, 12).map((product: any) => {
                                                const stock = Number(product.currentStock || 0);
                                                const minStock = Number(product.minStock || 0);
                                                const cost = Number(
                                                      product.averageCostPrice || product.defaultCostPrice || 0,
                                                );
                                                const sale = Number(
                                                      product.currentSalePrice || product.defaultSalePrice || 0,
                                                );
                                                const lowStock = minStock > 0 && stock <= minStock;
                                                const canDelete = stock <= 0;
                                                return (
                                                      <article
                                                            key={product.id}
                                                            className="rounded-[1.25rem] border border-[#eadfca] bg-white/95 p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-950/5"
                                                      >
                                                            <div className="flex items-start justify-between gap-3">
                                                                  <div className="min-w-0 flex-1">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                              <span className="rounded-full border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600">
                                                                                    {productCategoryLabel(product.category)}
                                                                              </span>
                                                                              {lowStock ? (
                                                                                    <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700 ring-1 ring-rose-100">
                                                                                          Sắp hết
                                                                                    </span>
                                                                              ) : null}
                                                                              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-100">
                                                                                    {product.unit || "cái"}
                                                                              </span>
                                                                        </div>
                                                                        <h3 className="mt-2 truncate text-xl font-black text-slate-950">
                                                                              {product.productName}
                                                                        </h3>
                                                                        <p className="mt-1 text-sm font-semibold text-slate-500">
                                                                              Tồn {formatMoney(stock)} {product.unit || ""}
                                                                              {minStock > 0
                                                                                    ? ` · Tối thiểu ${formatMoney(minStock)}`
                                                                                    : ""}
                                                                        </p>
                                                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-bold">
                                                                              <span className="rounded-full bg-slate-50 px-3 py-1 text-slate-600 ring-1 ring-slate-100">
                                                                                    Giá vốn: {cost > 0 ? `${formatMoney(cost)}đ` : "chưa có"}
                                                                              </span>
                                                                              <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700 ring-1 ring-amber-100">
                                                                                    Giá bán: {sale > 0 ? `${formatMoney(sale)}đ` : "chưa nhập"}
                                                                              </span>
                                                                        </div>
                                                                  </div>
                                                                  <div className="flex shrink-0 flex-col gap-2">
                                                                        <button
                                                                              type="button"
                                                                              onClick={() => openEditProductModal(product)}
                                                                              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50"
                                                                        >
                                                                              Sửa
                                                                        </button>
                                                                        <button
                                                                              type="button"
                                                                              onClick={() => openPriceInfo(product)}
                                                                              className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700 shadow-sm hover:bg-amber-100"
                                                                        >
                                                                              Thông tin giá
                                                                        </button>
                                                                        <button
                                                                              type="button"
                                                                              onClick={() => handleDeleteProduct(product)}
                                                                              disabled={!canDelete || deleteProductMutation?.isPending}
                                                                              className={`rounded-full border px-3 py-1.5 text-xs font-black shadow-sm ${canDelete ? "border-rose-100 bg-white text-rose-600 hover:bg-rose-50" : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"}`}
                                                                        >
                                                                              Xóa
                                                                        </button>
                                                                  </div>
                                                            </div>
                                                      </article>
                                                );
                                          })}
                                    </div>
                              ) : (
                                    <div className="rounded-[1.5rem] border border-dashed border-amber-200 bg-amber-50/60 p-5 text-center text-sm font-semibold text-slate-600">
                                          Chưa có hàng hóa nào. Thêm một vài mặt hàng demo như nông sản,
                                          bánh kẹo, sách, đồ thủ công hoặc sản phẩm tự gia công.
                                    </div>
                              )}
                        </div>
                  </section>

                  <section className={residenceMediumStyle.section}>
                        <div className={residenceMediumStyle.sectionHeader}>
                              <div>
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                                          Báo cáo tồn kho
                                    </p>
                                    <h2 className="mt-1 text-2xl font-black text-slate-950">
                                          Giá trị hàng đang có
                                    </h2>
                                    <p className="mt-1 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
                                          Tổng hợp theo danh sách và bộ lọc hiện tại. Giá vốn dùng giá vốn
                                          trung bình; giá bán dự kiến dùng giá bán hiện hành.
                                    </p>
                              </div>
                        </div>
                        <div className={`${residenceMediumStyle.sectionBody} space-y-4`}>
                              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                    <SummaryCard
                                          icon={<Boxes className="h-5 w-5" />}
                                          label="Tổng lượng tồn"
                                          value={formatMoney(productSummary.totalStock)}
                                          tone="slate"
                                    />
                                    <SummaryCard
                                          icon={<WalletCards className="h-5 w-5" />}
                                          label="Giá trị vốn"
                                          value={`${formatMoney(productSummary.inventoryValue)} đ`}
                                          tone="rose"
                                    />
                                    <SummaryCard
                                          icon={<CircleDollarSign className="h-5 w-5" />}
                                          label="Doanh thu dự kiến"
                                          value={`${formatMoney(productSummary.expectedSaleValue)} đ`}
                                          tone="emerald"
                                    />
                                    <SummaryCard
                                          icon={<Store className="h-5 w-5" />}
                                          label="Lãi gộp dự kiến"
                                          value={`${formatMoney(productSummary.expectedProfit)} đ`}
                                          tone="amber"
                                    />
                              </div>

                              {products.length ? (
                                    <div className="overflow-hidden rounded-[1.5rem] border border-[#eadfca] bg-white shadow-sm">
                                          <div className="overflow-x-auto">
                                                <table className="min-w-full text-left text-sm">
                                                      <thead className="bg-amber-50/80 text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                                                            <tr>
                                                                  <th className="px-4 py-3">Hàng hóa</th>
                                                                  <th className="px-4 py-3 text-right">Tồn</th>
                                                                  <th className="px-4 py-3 text-right">Giá vốn</th>
                                                                  <th className="px-4 py-3 text-right">Giá bán</th>
                                                                  <th className="px-4 py-3 text-right">Giá trị vốn</th>
                                                                  <th className="px-4 py-3 text-right">Doanh thu dự kiến</th>
                                                                  <th className="px-4 py-3 text-right">Lãi dự kiến</th>
                                                            </tr>
                                                      </thead>
                                                      <tbody className="divide-y divide-[#efe5d3]">
                                                            {products.map((product: any) => {
                                                                  const stock = Number(product.currentStock || 0);
                                                                  const minStock = Number(product.minStock || 0);
                                                                  const cost = Number(
                                                                        product.averageCostPrice || product.defaultCostPrice || 0,
                                                                  );
                                                                  const sale = Number(
                                                                        product.currentSalePrice || product.defaultSalePrice || 0,
                                                                  );
                                                                  const costValue = stock * cost;
                                                                  const saleValue = stock * sale;
                                                                  const expectedProfit = saleValue - costValue;
                                                                  const lowStock = minStock > 0 && stock <= minStock;
                                                                  return (
                                                                        <tr key={`inventory-${product.id}`} className="text-slate-700">
                                                                              <td className="px-4 py-3">
                                                                                    <div className="font-black text-slate-950">
                                                                                          {product.productName}
                                                                                    </div>
                                                                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                                                                                          <span>{productCategoryLabel(product.category)}</span>
                                                                                          {lowStock ? (
                                                                                                <span className="rounded-full bg-rose-50 px-2 py-0.5 font-black text-rose-700">
                                                                                                      Sắp hết
                                                                                                </span>
                                                                                          ) : null}
                                                                                    </div>
                                                                              </td>
                                                                              <td className="whitespace-nowrap px-4 py-3 text-right font-black text-slate-950">
                                                                                    {formatMoney(stock)} {product.unit || ""}
                                                                              </td>
                                                                              <td className="whitespace-nowrap px-4 py-3 text-right font-bold">
                                                                                    {cost > 0 ? `${formatMoney(cost)} đ` : "—"}
                                                                              </td>
                                                                              <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-amber-700">
                                                                                    {sale > 0 ? `${formatMoney(sale)} đ` : "—"}
                                                                              </td>
                                                                              <td className="whitespace-nowrap px-4 py-3 text-right font-black">
                                                                                    {formatMoney(costValue)} đ
                                                                              </td>
                                                                              <td className="whitespace-nowrap px-4 py-3 text-right font-black text-emerald-700">
                                                                                    {formatMoney(saleValue)} đ
                                                                              </td>
                                                                              <td
                                                                                    className={`whitespace-nowrap px-4 py-3 text-right font-black ${expectedProfit >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                                                                              >
                                                                                    {formatMoney(expectedProfit)} đ
                                                                              </td>
                                                                        </tr>
                                                                  );
                                                            })}
                                                      </tbody>
                                                </table>
                                          </div>
                                    </div>
                              ) : (
                                    <div className="rounded-[1.5rem] border border-dashed border-amber-200 bg-amber-50/60 p-5 text-center text-sm font-semibold text-slate-600">
                                          Chưa có dữ liệu hàng hóa để lập báo cáo tồn kho.
                                    </div>
                              )}
                              <p className="text-xs font-semibold leading-5 text-slate-500">
                                    Lãi gộp dự kiến chỉ là giá bán hiện tại trừ giá vốn hiện tại của
                                    lượng hàng còn tồn; chưa trừ chi phí vận hành và các khoản chi khác.
                              </p>
                        </div>
                  </section>
            </>
      );
}
