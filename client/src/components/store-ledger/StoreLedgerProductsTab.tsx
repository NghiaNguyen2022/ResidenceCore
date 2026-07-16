import {
      AlertTriangle,
      Grid2X2,
      ImageIcon,
      List,
      Search,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { inputClass } from "@/components/store-ledger/StoreLedgerShared";
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
      const [viewMode, setViewMode] = useState<"list" | "grid">("list");

      const lowStockProducts = useMemo(
            () =>
                  products.filter((product: any) => {
                        const stock = Number(product.currentStock || 0);
                        const minStock = Number(product.minStock || 0);
                        return stock <= 0 || (minStock > 0 && stock <= minStock);
                  }),
            [products],
      );

      const categorySummary = useMemo(() => {
            const counts = new Map<string, number>();
            products.forEach((product: any) => {
                  const key = String(product.category || "general");
                  counts.set(key, (counts.get(key) || 0) + 1);
            });
            return Array.from(counts.entries())
                  .map(([category, count]) => ({ category, count }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5);
      }, [products]);

      const maxCategoryCount = Math.max(1, ...categorySummary.map((item) => item.count));

      return (
            <div className="space-y-4">
                  <section id="store-product-list" className="overflow-hidden rounded-[1.7rem] border border-[#eadfca] bg-white/88 shadow-[0_16px_48px_rgba(71,51,22,.07)] backdrop-blur">
                        <div className="border-b border-[#eee3cf] bg-[linear-gradient(135deg,#fffdf8_0%,#fff8e8_100%)] p-4">
                              <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-center">
                                    <div className="relative min-w-0">
                                          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                          <input
                                                value={productSearch}
                                                onChange={(event) => setProductSearch(event.target.value)}
                                                className={`${inputClass} h-11 pl-10`}
                                                placeholder="Tìm tên hàng, mã hàng hoặc nhóm hàng..."
                                          />
                                    </div>

                                    <button
                                          type="button"
                                          onClick={() => setLowStockOnly(!lowStockOnly)}
                                          className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-black shadow-sm transition ${
                                                lowStockOnly
                                                      ? "border-amber-300 bg-amber-100 text-amber-900"
                                                      : "border-slate-200 bg-white text-slate-600 hover:border-amber-200"
                                          }`}
                                    >
                                          <span className={`h-2.5 w-2.5 rounded-full ${lowStockOnly ? "bg-amber-500" : "bg-slate-300"}`} />
                                          Sắp hết
                                    </button>

                                    <div className="inline-flex h-11 rounded-2xl border border-slate-200 bg-slate-50 p-1">
                                          <button
                                                type="button"
                                                onClick={() => setViewMode("list")}
                                                className={`rounded-xl px-3 ${viewMode === "list" ? "bg-white text-amber-700 shadow-sm" : "text-slate-400"}`}
                                                title="Dạng danh sách"
                                          >
                                                <List className="h-4 w-4" />
                                          </button>
                                          <button
                                                type="button"
                                                onClick={() => setViewMode("grid")}
                                                className={`rounded-xl px-3 ${viewMode === "grid" ? "bg-white text-amber-700 shadow-sm" : "text-slate-400"}`}
                                                title="Dạng thẻ"
                                          >
                                                <Grid2X2 className="h-4 w-4" />
                                          </button>
                                    </div>
                              </div>

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <span className="mr-1 text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">
                                          Nhóm hàng
                                    </span>
                                    {productCategoryOptions.map((item) => (
                                          <button
                                                key={item.value}
                                                type="button"
                                                onClick={() => setProductCategoryFilter(item.value)}
                                                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                                                      productCategoryFilter === item.value
                                                            ? "bg-slate-950 text-white shadow-md"
                                                            : "border border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50"
                                                }`}
                                          >
                                                {item.label}
                                          </button>
                                    ))}
                              </div>
                        </div>

                        <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                              <section className="min-w-0 overflow-hidden rounded-[1.35rem] border border-[#eadfca] bg-white shadow-sm">
                                    <div className="flex items-center justify-between border-b border-[#efe5d3] px-4 py-3">
                                          <div>
                                                <h2 className="text-base font-black text-slate-950">Danh sách hàng hóa</h2>
                                                <p className="mt-0.5 text-xs font-semibold text-slate-500">
                                                      {products.length} mặt hàng theo bộ lọc hiện tại
                                                </p>
                                          </div>
                                    </div>

                                    {productsQuery.isLoading ? (
                                          <div className="p-6 text-sm font-semibold text-slate-500">Đang tải hàng hóa...</div>
                                    ) : products.length ? (
                                          <div className={viewMode === "grid" ? "grid gap-3 p-3 lg:grid-cols-2" : "divide-y divide-[#efe5d3]"}>
                                                {products.slice(0, 30).map((product: any) => (
                                                      <ProductItem
                                                            key={product.id}
                                                            product={product}
                                                            viewMode={viewMode}
                                                            openEditProductModal={openEditProductModal}
                                                            openPriceInfo={openPriceInfo}
                                                            handleDeleteProduct={handleDeleteProduct}
                                                            deleteProductMutation={deleteProductMutation}
                                                      />
                                                ))}
                                          </div>
                                    ) : (
                                          <div className="p-8 text-center">
                                                <ImageIcon className="mx-auto h-8 w-8 text-amber-400" />
                                                <p className="mt-2 text-sm font-black text-slate-800">Không có hàng hóa phù hợp</p>
                                                <p className="mt-1 text-xs font-semibold text-slate-500">Thử bỏ bớt bộ lọc hoặc tìm bằng từ khóa khác.</p>
                                          </div>
                                    )}
                              </section>

                              <aside className="space-y-3 xl:sticky xl:top-4 xl:self-start">
                                    <PremiumPanel title="Tóm tắt tồn kho">
                                          <div className="space-y-2 text-sm">
                                                <StatLine label="Mặt hàng đang xem" value={formatMoney(products.length)} />
                                                <StatLine label="Tổng số lượng tồn" value={formatMoney(productSummary.totalStock)} />
                                                <StatLine label="Sắp hết / hết" value={formatMoney(lowStockProducts.length)} tone="warning" />
                                          </div>
                                    </PremiumPanel>

                                    <PremiumPanel title="Phân bổ nhóm hàng">
                                          <div className="space-y-3">
                                                {categorySummary.map((item) => (
                                                      <div key={item.category}>
                                                            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                                                                  <span>{productCategoryLabel(item.category)}</span>
                                                                  <span>{item.count}</span>
                                                            </div>
                                                            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                                                                  <div
                                                                        className="h-full rounded-full bg-[linear-gradient(90deg,#f59e0b,#f3c767)]"
                                                                        style={{ width: `${Math.max(8, (item.count / maxCategoryCount) * 100)}%` }}
                                                                  />
                                                            </div>
                                                      </div>
                                                ))}
                                          </div>
                                    </PremiumPanel>

                                    <section className="rounded-[1.25rem] border border-amber-200 bg-[linear-gradient(145deg,#fffdf5_0%,#fff4ce_100%)] p-4 shadow-sm">
                                          <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-amber-800">Giá trị hàng đang có</h3>
                                          <div className="mt-3 space-y-2">
                                                <StatLine label="Giá trị vốn" value={`${formatMoney(productSummary.inventoryValue)} đ`} />
                                                <StatLine label="Doanh thu dự kiến" value={`${formatMoney(productSummary.expectedSaleValue)} đ`} />
                                                <StatLine
                                                      label="Lãi gộp dự kiến"
                                                      value={`${formatMoney(productSummary.expectedProfit)} đ`}
                                                      tone={productSummary.expectedProfit < 0 ? "danger" : "success"}
                                                />
                                          </div>
                                    </section>

                                    {lowStockProducts.length ? (
                                          <section className="rounded-[1.25rem] border border-rose-100 bg-white p-4 shadow-sm">
                                                <div className="flex items-center gap-2">
                                                      <div className="rounded-xl bg-rose-50 p-2 text-rose-600">
                                                            <AlertTriangle className="h-4 w-4" />
                                                      </div>
                                                      <div>
                                                            <h3 className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">Sản phẩm cần chú ý</h3>
                                                            <p className="text-[11px] font-semibold text-slate-400">Nhấn để mở chi tiết</p>
                                                      </div>
                                                </div>
                                                <div className="mt-3 space-y-2">
                                                      {lowStockProducts.slice(0, 4).map((product: any) => (
                                                            <button
                                                                  key={product.id}
                                                                  type="button"
                                                                  onClick={() => openEditProductModal(product)}
                                                                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-transparent bg-rose-50/60 px-3 py-2 text-left transition hover:border-rose-100 hover:bg-rose-50"
                                                            >
                                                                  <span className="min-w-0">
                                                                        <span className="block truncate text-sm font-black text-slate-900">{product.productName}</span>
                                                                        <span className="text-xs font-semibold text-slate-500">
                                                                              Tồn {formatMoney(product.currentStock)} {product.unit || ""}
                                                                        </span>
                                                                  </span>
                                                                  <span className="shrink-0 text-xs font-black text-rose-600">Xem</span>
                                                            </button>
                                                      ))}
                                                </div>
                                          </section>
                                    ) : null}
                              </aside>
                        </div>
                  </section>

                  <section id="store-inventory-report" className={residenceMediumStyle.section}>
                        <div className={residenceMediumStyle.sectionHeader}>
                              <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-700">Báo cáo tồn kho nhanh</p>
                                    <h2 className="mt-1 text-lg font-black text-slate-950">Top hàng hóa theo giá trị tồn</h2>
                                    <p className="mt-1 text-sm font-medium text-slate-500">Bảng tóm tắt để xem nhanh, không thay thế báo cáo chi tiết.</p>
                              </div>
                        </div>
                        <div className={residenceMediumStyle.sectionBody}>
                              <div className="overflow-hidden rounded-[1.25rem] border border-[#eadfca] bg-white shadow-sm">
                                    <div className="overflow-x-auto">
                                          <table className="min-w-full text-left text-sm">
                                                <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-[0.1em] text-slate-500">
                                                      <tr>
                                                            <th className="px-4 py-3">Hàng hóa</th>
                                                            <th className="px-4 py-3">Nhóm</th>
                                                            <th className="px-4 py-3 text-right">Tồn</th>
                                                            <th className="px-4 py-3 text-right">Giá vốn</th>
                                                            <th className="px-4 py-3 text-right">Giá bán</th>
                                                            <th className="px-4 py-3 text-right">Giá trị vốn</th>
                                                      </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                      {[...products]
                                                            .sort(
                                                                  (a: any, b: any) =>
                                                                        Number(b.currentStock || 0) * Number(b.averageCostPrice || b.defaultCostPrice || 0) -
                                                                        Number(a.currentStock || 0) * Number(a.averageCostPrice || a.defaultCostPrice || 0),
                                                            )
                                                            .slice(0, 8)
                                                            .map((product: any) => {
                                                                  const stock = Number(product.currentStock || 0);
                                                                  const cost = Number(product.averageCostPrice || product.defaultCostPrice || 0);
                                                                  const sale = Number(product.currentSalePrice || product.defaultSalePrice || 0);
                                                                  return (
                                                                        <tr key={`quick-${product.id}`} className="hover:bg-amber-50/30">
                                                                              <td className="px-4 py-3 font-black text-slate-900">{product.productName}</td>
                                                                              <td className="px-4 py-3 text-slate-500">{productCategoryLabel(product.category)}</td>
                                                                              <td className="px-4 py-3 text-right font-bold">{formatMoney(stock)} {product.unit || ""}</td>
                                                                              <td className="px-4 py-3 text-right">{cost > 0 ? `${formatMoney(cost)} đ` : "—"}</td>
                                                                              <td className="px-4 py-3 text-right text-amber-700">{sale > 0 ? `${formatMoney(sale)} đ` : "—"}</td>
                                                                              <td className="px-4 py-3 text-right font-black">{formatMoney(stock * cost)} đ</td>
                                                                        </tr>
                                                                  );
                                                            })}
                                                </tbody>
                                          </table>
                                    </div>
                              </div>
                        </div>
                  </section>
            </div>
      );
}

function ProductItem({
      product,
      viewMode,
      openEditProductModal,
      openPriceInfo,
      handleDeleteProduct,
      deleteProductMutation,
}: any) {
      const stock = Number(product.currentStock || 0);
      const minStock = Number(product.minStock || 0);
      const cost = Number(product.averageCostPrice || product.defaultCostPrice || 0);
      const sale = Number(product.currentSalePrice || product.defaultSalePrice || 0);
      const lowStock = stock <= 0 || (minStock > 0 && stock <= minStock);
      const outOfStock = stock <= 0;
      const canDelete = stock <= 0;
      const image = product.imageData || product.imageUrl;

      const imageBox = (
            <div className={`${viewMode === "grid" ? "h-20 w-20" : "h-14 w-14"} flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-amber-100 bg-amber-50/60`}>
                  {image ? (
                        <img src={image} alt={product.productName} className="h-full w-full object-cover" />
                  ) : (
                        <ImageIcon className="h-5 w-5 text-amber-500" />
                  )}
            </div>
      );

      const badges = (
            <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-black text-sky-700">{productCategoryLabel(product.category)}</span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-700">{product.unit || "cái"}</span>
                  {lowStock ? (
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${outOfStock ? "bg-rose-50 text-rose-700" : "bg-orange-50 text-orange-700"}`}>
                              {outOfStock ? "Hết hàng" : "Sắp hết"}
                        </span>
                  ) : null}
            </div>
      );

      const prices = (
            <div className="grid grid-cols-2 gap-2">
                  <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2">
                        <p className="text-[11px] font-bold text-slate-400">Giá vốn</p>
                        <p className="mt-0.5 truncate text-xs font-black text-slate-800">{cost > 0 ? `${formatMoney(cost)}đ` : "—"}</p>
                  </div>
                  <div className="min-w-0 rounded-xl bg-amber-50 px-3 py-2">
                        <p className="text-[11px] font-bold text-amber-500">Giá bán</p>
                        <p className="mt-0.5 truncate text-xs font-black text-amber-800">{sale > 0 ? `${formatMoney(sale)}đ` : "—"}</p>
                  </div>
            </div>
      );

      const actions = (
            <div className={`grid gap-2 ${viewMode === "grid" ? "grid-cols-3" : "grid-cols-3 lg:w-[250px]"}`}>
                  <button type="button" onClick={() => openEditProductModal(product)} className="min-w-0 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50">
                        Sửa
                  </button>
                  <button type="button" onClick={() => openPriceInfo(product)} className="min-w-0 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs font-black text-amber-700 shadow-sm hover:bg-amber-100">
                        Giá
                  </button>
                  <button
                        type="button"
                        onClick={() => handleDeleteProduct(product)}
                        disabled={!canDelete || deleteProductMutation?.isPending}
                        className={`min-w-0 rounded-xl border px-2.5 py-2 text-xs font-black shadow-sm ${
                              canDelete
                                    ? "border-rose-100 bg-white text-rose-600 hover:bg-rose-50"
                                    : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                        }`}
                  >
                        Xóa
                  </button>
            </div>
      );

      if (viewMode === "grid") {
            return (
                  <article className="min-w-0 rounded-[1.25rem] border border-[#eadfca] bg-[linear-gradient(145deg,#ffffff_0%,#fffdf8_100%)] p-3 shadow-sm">
                        <div className="flex min-w-0 items-start gap-3">
                              {imageBox}
                              <button type="button" onClick={() => openPriceInfo(product)} className="min-w-0 flex-1 text-left">
                                    {badges}
                                    <h3 className="mt-2 line-clamp-2 text-base font-black leading-5 text-slate-950">{product.productName}</h3>
                                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                                          Tồn {formatMoney(stock)} {product.unit || ""}
                                          {minStock > 0 ? ` · Tối thiểu ${formatMoney(minStock)}` : ""}
                                    </p>
                              </button>
                        </div>
                        <div className="mt-3">{prices}</div>
                        <div className="mt-3">{actions}</div>
                  </article>
            );
      }

      return (
            <article className="px-4 py-3 transition hover:bg-amber-50/25">
                  <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_220px_250px] lg:items-center">
                        <div className="flex min-w-0 items-center gap-3">
                              {imageBox}
                              <button type="button" onClick={() => openPriceInfo(product)} className="min-w-0 flex-1 text-left">
                                    {badges}
                                    <h3 className="mt-1.5 truncate text-base font-black text-slate-950">{product.productName}</h3>
                                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                                          Tồn {formatMoney(stock)} {product.unit || ""}
                                          {minStock > 0 ? ` · Tối thiểu ${formatMoney(minStock)}` : ""}
                                    </p>
                              </button>
                        </div>
                        {prices}
                        {actions}
                  </div>
            </article>
      );
}

function PremiumPanel({ title, children }: { title: string; children: ReactNode }) {
      return (
            <section className="rounded-[1.25rem] border border-[#eadfca] bg-white p-4 shadow-sm">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500">{title}</h3>
                  <div className="mt-3">{children}</div>
            </section>
      );
}

function StatLine({
      label,
      value,
      tone = "default",
}: {
      label: string;
      value: string;
      tone?: "default" | "warning" | "danger" | "success";
}) {
      const valueClass =
            tone === "warning"
                  ? "text-amber-700"
                  : tone === "danger"
                        ? "text-rose-700"
                        : tone === "success"
                              ? "text-emerald-700"
                              : "text-slate-950";
      return (
            <div className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-slate-500">{label}</span>
                  <span className={`font-black ${valueClass}`}>{value}</span>
            </div>
      );
}
