import {
      AlertTriangle,
      ChevronLeft,
      ChevronRight,
      Grid2X2,
      ImageIcon,
      List,
      Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { residenceMediumStyle } from "@/components/shared/styleMedium";
import { inputClass } from "@/components/store-ledger/StoreLedgerShared";
import { formatMoney, productCategoryLabel } from "@/components/store-ledger/storeLedgerUtils";

type StoreLedgerProductsTabProps = {
      productSearch: string;
      setProductSearch: (value: string) => void;
      lowStockOnly: boolean;
      setLowStockOnly: (value: boolean) => void;
      showInactiveProducts: boolean;
      setShowInactiveProducts: (value: boolean) => void;
      productCategoryFilter: string;
      setProductCategoryFilter: (value: string) => void;
      productCategoryOptions: Array<{ value: string; label: string }>;
      productsQuery: any;
      products: any[];
      allProducts: any[];
      productSummary: {
            totalStock: number;
            inventoryValue: number;
            expectedSaleValue: number;
            expectedProfit: number;
      };
      openEditProductModal: (product: any) => void;
      openPriceInfo: (product: any) => void;
      handleDeleteProduct: (product: any) => void;
      handleToggleProductActive: (product: any) => void;
      deleteProductMutation: any;
      updateProductMutation: any;
};

export function StoreLedgerProductsTab({
      productSearch,
      setProductSearch,
      lowStockOnly,
      setLowStockOnly,
      showInactiveProducts,
      setShowInactiveProducts,
      productCategoryFilter,
      setProductCategoryFilter,
      productCategoryOptions,
      productsQuery,
      products,
      allProducts,
      productSummary,
      openEditProductModal,
      openPriceInfo,
      handleDeleteProduct,
      handleToggleProductActive,
      deleteProductMutation,
      updateProductMutation,
}: StoreLedgerProductsTabProps) {
      const [viewMode, setViewMode] = useState<"list" | "grid">("list");
      const [pageSize, setPageSize] = useState<7 | 10>(7);
      const [page, setPage] = useState(1);

      const lowStockProducts = useMemo(
            () => allProducts.filter((product: any) => {
                  const stock = Number(product.currentStock || 0);
                  const minStock = Number(product.minStock || 0);
                  return stock <= 0 || (minStock > 0 && stock <= minStock);
            }),
            [allProducts],
      );

      const categorySummary = useMemo(() => {
            const counts = new Map<string, number>();
            allProducts.forEach((product: any) => {
                  const key = String(product.category || "general");
                  counts.set(key, (counts.get(key) || 0) + 1);
            });
            return Array.from(counts.entries())
                  .map(([category, count]) => ({ category, count }))
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5);
      }, [allProducts]);

      const maxCategoryCount = Math.max(1, ...categorySummary.map((item) => item.count));
      const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
      const safePage = Math.min(page, totalPages);
      const pageStart = (safePage - 1) * pageSize;
      const pagedProducts = products.slice(pageStart, pageStart + pageSize);

      useEffect(() => setPage(1), [productSearch, productCategoryFilter, lowStockOnly, showInactiveProducts, pageSize]);
      useEffect(() => {
            if (page > totalPages) setPage(totalPages);
      }, [page, totalPages]);

      return (
            <div className="space-y-4">
                  <section id="store-product-list" tabIndex={-1} className="scroll-mt-24 space-y-4 outline-none transition focus:ring-4 focus:ring-amber-100/80">
                        <div className="rounded-[1.4rem] border border-[#eadfca] bg-white/95 p-3.5 shadow-sm">
                              <div className="space-y-3">
                                    <div className="relative min-w-0">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                          <input
                                                value={productSearch}
                                                onChange={(event) => setProductSearch(event.target.value)}
                                                className={`${inputClass} h-11 pl-9`}
                                                placeholder="Tìm tên hàng, mã hàng hoặc nhóm hàng..."
                                          />
                                    </div>

                                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                                          <button
                                                type="button"
                                                onClick={() => setLowStockOnly(!lowStockOnly)}
                                                aria-pressed={lowStockOnly}
                                                className={`inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-3 text-xs font-black transition ${lowStockOnly ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50/60"}`}
                                          >
                                                <span className={`flex h-4 w-4 items-center justify-center rounded border ${lowStockOnly ? "border-amber-500 bg-amber-500 text-white" : "border-slate-300 bg-white"}`}>
                                                      {lowStockOnly ? "✓" : ""}
                                                </span>
                                                Sắp hết
                                          </button>
                                          <button
                                                type="button"
                                                onClick={() => setShowInactiveProducts(!showInactiveProducts)}
                                                aria-pressed={showInactiveProducts}
                                                className={`inline-flex h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border px-3 text-xs font-black transition ${showInactiveProducts ? "border-slate-300 bg-slate-100 text-slate-800" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}
                                          >
                                                <span className={`flex h-4 w-4 items-center justify-center rounded border ${showInactiveProducts ? "border-slate-700 bg-slate-700 text-white" : "border-slate-300 bg-white"}`}>
                                                      {showInactiveProducts ? "✓" : ""}
                                                </span>
                                                Hiện hàng ngừng bán
                                          </button>
                                          <div className="ml-auto inline-flex h-9 shrink-0 items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                                                <button
                                                      type="button"
                                                      onClick={() => setViewMode("list")}
                                                      className={`flex h-7 w-8 items-center justify-center rounded-lg transition ${viewMode === "list" ? "bg-white text-amber-700 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
                                                      title="Xem dạng danh sách"
                                                      aria-label="Xem dạng danh sách"
                                                >
                                                      <List className="h-4 w-4" />
                                                </button>
                                                <button
                                                      type="button"
                                                      onClick={() => setViewMode("grid")}
                                                      className={`flex h-7 w-8 items-center justify-center rounded-lg transition ${viewMode === "grid" ? "bg-white text-amber-700 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
                                                      title="Xem dạng lưới"
                                                      aria-label="Xem dạng lưới"
                                                >
                                                      <Grid2X2 className="h-4 w-4" />
                                                </button>
                                          </div>
                                    </div>
                              </div>
                              <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2 border-t border-[#efe5d3] pt-3">
                                    <span className="mr-1 text-xs font-bold text-slate-500">Nhóm hàng</span>
                                    {productCategoryOptions.map((item) => (
                                          <button
                                                key={item.value}
                                                type="button"
                                                onClick={() => setProductCategoryFilter(item.value)}
                                                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${productCategoryFilter === item.value ? "bg-slate-950 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:border-amber-200 hover:bg-amber-50"}`}
                                          >
                                                {item.label}
                                          </button>
                                    ))}
                              </div>
                        </div>

                        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_260px] xl:grid-cols-[minmax(0,1fr)_280px]">
                              <section className="min-w-0 overflow-hidden rounded-[1.4rem] border border-[#eadfca] bg-white/95 shadow-sm">
                                    <div className="flex flex-col gap-3 border-b border-[#efe5d3] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                          <div>
                                                <h2 className="text-base font-black text-slate-950">Danh sách hàng hóa</h2>
                                                <p className="mt-0.5 text-xs font-semibold text-slate-500">
                                                      {products.length ? `Hiển thị ${pageStart + 1}–${Math.min(pageStart + pageSize, products.length)} trong ${products.length} mặt hàng` : "Không có mặt hàng"}
                                                </p>
                                          </div>
                                          <label className="inline-flex items-center">
                                                <span className="sr-only">Số sản phẩm mỗi trang</span>
                                                <select
                                                      aria-label="Số sản phẩm mỗi trang"
                                                      value={pageSize}
                                                      onChange={(event) => setPageSize(Number(event.target.value) as 7 | 10)}
                                                      className="min-w-[132px] rounded-xl border border-[#e5d8bd] bg-white px-3 py-2 text-xs font-black text-slate-800 outline-none focus:border-amber-300"
                                                >
                                                      <option value={7}>7 sản phẩm</option>
                                                      <option value={10}>10 sản phẩm</option>
                                                </select>
                                          </label>
                                    </div>

                                    {productsQuery.isLoading ? (
                                          <div className="p-5 text-sm font-semibold text-slate-500">Đang tải hàng hóa...</div>
                                    ) : products.length ? (
                                          <div className={viewMode === "grid" ? "grid gap-3 p-3 lg:grid-cols-2" : "divide-y divide-[#efe5d3]"}>
                                                {pagedProducts.map((product: any) => (
                                                      viewMode === "grid" ? (
                                                            <ProductGridCard
                                                                  key={product.id}
                                                                  product={product}
                                                                  onEdit={openEditProductModal}
                                                                  onPrice={openPriceInfo}
                                                                  onDelete={handleDeleteProduct}
                                                                  onToggleActive={handleToggleProductActive}
                                                                  deleting={deleteProductMutation?.isPending}
                                                                  updating={updateProductMutation?.isPending}
                                                            />
                                                      ) : (
                                                            <ProductListRow
                                                                  key={product.id}
                                                                  product={product}
                                                                  onEdit={openEditProductModal}
                                                                  onPrice={openPriceInfo}
                                                                  onDelete={handleDeleteProduct}
                                                                  onToggleActive={handleToggleProductActive}
                                                                  deleting={deleteProductMutation?.isPending}
                                                                  updating={updateProductMutation?.isPending}
                                                            />
                                                      )
                                                ))}
                                          </div>
                                    ) : (
                                          <div className="p-6 text-center text-sm font-semibold text-slate-500">Không có hàng hóa phù hợp bộ lọc.</div>
                                    )}

                                    {products.length ? (
                                          <div className="flex flex-col gap-3 border-t border-[#efe5d3] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                                <p className="text-xs font-semibold text-slate-500">Trang {safePage}/{totalPages}</p>
                                                <div className="flex items-center gap-2">
                                                      <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={safePage <= 1} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Trước</button>
                                                      <div className="flex items-center gap-1">
                                                            {Array.from({ length: totalPages }, (_, index) => index + 1).slice(Math.max(0, safePage - 2), Math.max(0, safePage - 2) + 5).map((item) => (
                                                                  <button key={item} type="button" onClick={() => setPage(item)} className={`h-9 min-w-9 rounded-xl px-2 text-xs font-black ${safePage === item ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{item}</button>
                                                            ))}
                                                      </div>
                                                      <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={safePage >= totalPages} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">Sau <ChevronRight className="h-4 w-4" /></button>
                                                </div>
                                          </div>
                                    ) : null}
                              </section>

                              <aside className="min-w-0 space-y-3 lg:sticky lg:top-4 lg:self-start">
                                    <section className="rounded-[1.35rem] border border-[#eadfca] bg-white/95 p-4 shadow-sm">
                                          <div className="flex items-center justify-between gap-3">
                                                <h3 className="text-sm font-black text-slate-950">Phân bổ nhóm hàng</h3>
                                                <span className="text-xs font-bold text-slate-400">{products.length} mặt hàng</span>
                                          </div>
                                          <div className="mt-3 space-y-3">
                                                {categorySummary.length ? categorySummary.map((item) => (
                                                      <div key={item.category}>
                                                            <div className="flex items-center justify-between text-xs font-bold text-slate-600"><span>{productCategoryLabel(item.category)}</span><span>{item.count}</span></div>
                                                            <div className="mt-1.5 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${Math.max(8, (item.count / maxCategoryCount) * 100)}%` }} /></div>
                                                      </div>
                                                )) : <p className="text-sm font-semibold text-slate-500">Chưa có dữ liệu nhóm hàng.</p>}
                                          </div>
                                    </section>

                                    <section id="store-low-stock-panel" tabIndex={-1} className="scroll-mt-24 rounded-[1.35rem] border border-rose-100 bg-[linear-gradient(145deg,#ffffff_0%,#fff8f6_100%)] p-4 shadow-sm outline-none transition focus:ring-4 focus:ring-rose-100">
                                          <div className="flex items-center gap-2">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-500"><AlertTriangle className="h-4 w-4" /></div>
                                                <div>
                                                      <h3 className="text-sm font-black text-slate-950">Sản phẩm cần chú ý</h3>
                                                      <p className="text-xs font-semibold text-slate-500">Sắp hết hoặc đã hết hàng</p>
                                                </div>
                                          </div>
                                          <div className="mt-3 space-y-2">
                                                {lowStockProducts.length ? lowStockProducts.slice(0, 5).map((product: any) => {
                                                      const stock = Number(product.currentStock || 0);
                                                      return (
                                                            <button key={product.id} type="button" onClick={() => openEditProductModal(product)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-rose-100 bg-white px-3 py-2.5 text-left transition hover:bg-rose-50/70">
                                                                  <span className="min-w-0">
                                                                        <span className="block truncate text-sm font-black text-slate-900">{product.productName}</span>
                                                                        <span className="text-xs font-semibold text-slate-500">Tồn {formatMoney(stock)} {product.unit || ""}</span>
                                                                  </span>
                                                                  <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-black ${stock <= 0 ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{stock <= 0 ? "Hết" : "Sắp hết"}</span>
                                                            </button>
                                                      );
                                                }) : <p className="rounded-xl bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-700">Không có sản phẩm cần cảnh báo.</p>}
                                          </div>
                                    </section>
                              </aside>
                        </div>
                  </section>

                  <section id="store-inventory-report" tabIndex={-1} className={`${residenceMediumStyle.section} scroll-mt-24 outline-none transition focus:ring-4 focus:ring-amber-100/80`}>
                        <div className={residenceMediumStyle.sectionHeader}>
                              <div>
                                    <h2 className="text-base font-black text-slate-950">Báo cáo tồn kho nhanh</h2>
                                    <p className="mt-1 text-sm font-semibold text-slate-500">Xem nhanh những mặt hàng có giá trị tồn lớn nhất.</p>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-right">
                                    <QuickValue id="store-inventory-value" label="Giá trị vốn" value={`${formatMoney(productSummary.inventoryValue)} đ`} />
                                    <QuickValue id="store-expected-revenue" label="Doanh thu dự kiến" value={`${formatMoney(productSummary.expectedSaleValue)} đ`} />
                                    <QuickValue label="Lãi gộp dự kiến" value={`${formatMoney(productSummary.expectedProfit)} đ`} negative={productSummary.expectedProfit < 0} />
                              </div>
                        </div>
                        <div className={residenceMediumStyle.sectionBody}>
                              <div className="overflow-hidden rounded-[1.25rem] border border-[#eadfca] bg-white shadow-sm">
                                    <div className="overflow-x-auto">
                                          <table className="min-w-full text-left text-sm">
                                                <thead className="bg-slate-50 text-xs font-black text-slate-500"><tr><th className="px-4 py-3">Hàng hóa</th><th className="px-4 py-3">Nhóm</th><th className="px-4 py-3 text-right">Tồn</th><th className="px-4 py-3 text-right">Giá vốn</th><th className="px-4 py-3 text-right">Giá bán</th><th className="px-4 py-3 text-right">Giá trị vốn</th></tr></thead>
                                                <tbody className="divide-y divide-slate-100">
                                                      {[...products]
                                                            .sort((a: any, b: any) => Number(b.currentStock || 0) * Number(b.averageCostPrice || b.defaultCostPrice || 0) - Number(a.currentStock || 0) * Number(a.averageCostPrice || a.defaultCostPrice || 0))
                                                            .slice(0, 7)
                                                            .map((product: any) => {
                                                                  const stock = Number(product.currentStock || 0);
                                                                  const cost = Number(product.averageCostPrice || product.defaultCostPrice || 0);
                                                                  const sale = Number(product.currentSalePrice || product.defaultSalePrice || 0);
                                                                  return <tr key={`quick-${product.id}`}><td className="px-4 py-3 font-black text-slate-900">{product.productName}</td><td className="px-4 py-3 text-slate-500">{productCategoryLabel(product.category)}</td><td className="px-4 py-3 text-right font-bold">{formatMoney(stock)} {product.unit || ""}</td><td className="px-4 py-3 text-right">{cost > 0 ? `${formatMoney(cost)} đ` : "—"}</td><td className="px-4 py-3 text-right text-amber-700">{sale > 0 ? `${formatMoney(sale)} đ` : "—"}</td><td className="px-4 py-3 text-right font-black">{formatMoney(stock * cost)} đ</td></tr>;
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

function ProductListRow({ product, onEdit, onPrice, onDelete, onToggleActive, deleting, updating }: any) {
      const stock = Number(product.currentStock || 0);
      const minStock = Number(product.minStock || 0);
      const cost = Number(product.averageCostPrice || product.defaultCostPrice || 0);
      const sale = Number(product.currentSalePrice || product.defaultSalePrice || 0);
      const lowStock = stock <= 0 || (minStock > 0 && stock <= minStock);
      const image = product.imageData || product.imageUrl;
      const inactive = product.isActive === false;
      return (
            <article className={`px-4 py-3 transition ${inactive ? "bg-slate-50/80 opacity-80" : "hover:bg-amber-50/25"}`}>
                  <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-100 bg-amber-50/60">
                              {image ? <img src={image} alt={product.productName} className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-amber-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                    <button type="button" onClick={() => onPrice(product)} className="max-w-full truncate text-left text-base font-black text-slate-950 hover:text-amber-700">{product.productName}</button>
                                    <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-black text-sky-700">{productCategoryLabel(product.category)}</span>
                                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-black text-amber-700">{product.unit || "cái"}</span>
                                    {lowStock && !inactive ? <span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${stock <= 0 ? "bg-rose-50 text-rose-700" : "bg-orange-50 text-orange-700"}`}>{stock <= 0 ? "Hết hàng" : "Sắp hết"}</span> : null}
                                    {inactive ? <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-black text-slate-600">Ngừng kinh doanh</span> : null}
                              </div>
                              <p className="mt-1 text-xs font-semibold text-slate-500">Tồn {formatMoney(stock)} {product.unit || ""}{minStock > 0 ? ` · Tối thiểu ${formatMoney(minStock)}` : ""}</p>
                        </div>
                  </div>

                  <div className="mt-3 flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                        <div className="grid w-full max-w-[300px] grid-cols-2 gap-2 text-xs">
                              <PriceBox label="Giá vốn" value={cost > 0 ? `${formatMoney(cost)}đ` : "—"} />
                              <PriceBox label="Giá bán" value={sale > 0 ? `${formatMoney(sale)}đ` : "—"} amber />
                        </div>
                        <div className="flex min-w-0 flex-wrap gap-2 xl:justify-end">
                              <ActionButton label="Sửa" onClick={() => onEdit(product)} />
                              <ActionButton label="Thông tin giá" onClick={() => onPrice(product)} amber />
                              <ActionButton label={inactive ? "Kinh doanh lại" : "Ngừng kinh doanh"} onClick={() => onToggleActive(product)} muted={!inactive} success={inactive} disabled={updating} />
                              <ActionButton label="Xóa" onClick={() => onDelete(product)} danger disabled={stock > 0 || deleting} />
                        </div>
                  </div>
            </article>
      );
}

function ProductGridCard({ product, onEdit, onPrice, onDelete, onToggleActive, deleting, updating }: any) {
      const stock = Number(product.currentStock || 0);
      const minStock = Number(product.minStock || 0);
      const cost = Number(product.averageCostPrice || product.defaultCostPrice || 0);
      const sale = Number(product.currentSalePrice || product.defaultSalePrice || 0);
      const lowStock = stock <= 0 || (minStock > 0 && stock <= minStock);
      const image = product.imageData || product.imageUrl;
      const inactive = product.isActive === false;
      return (
            <article className={`overflow-hidden rounded-[1.25rem] border border-[#eadfca] shadow-sm ${inactive ? "bg-slate-50 opacity-80" : "bg-white"}`}>
                  <div className="flex gap-3 p-3">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-100 bg-amber-50/60">
                              {image ? <img src={image} alt={product.productName} className="h-full w-full object-cover" /> : <ImageIcon className="h-6 w-6 text-amber-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                              <button type="button" onClick={() => onPrice(product)} className="line-clamp-2 text-left text-base font-black text-slate-950 hover:text-amber-700">{product.productName}</button>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                    <span className="rounded-full bg-sky-50 px-2 py-1 text-[11px] font-black text-sky-700">{productCategoryLabel(product.category)}</span>
                                    <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-black text-amber-700">{product.unit || "cái"}</span>
                                    {lowStock && !inactive ? <span className={`rounded-full px-2 py-1 text-[11px] font-black ${stock <= 0 ? "bg-rose-50 text-rose-700" : "bg-orange-50 text-orange-700"}`}>{stock <= 0 ? "Hết hàng" : "Sắp hết"}</span> : null}
                                    {inactive ? <span className="rounded-full bg-slate-200 px-2 py-1 text-[11px] font-black text-slate-600">Ngừng kinh doanh</span> : null}
                              </div>
                              <p className="mt-2 text-xs font-semibold text-slate-500">Tồn {formatMoney(stock)} {product.unit || ""}{minStock > 0 ? ` · Tối thiểu ${formatMoney(minStock)}` : ""}</p>
                        </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 px-3 pb-3 text-xs">
                        <PriceBox label="Giá vốn" value={cost > 0 ? `${formatMoney(cost)}đ` : "—"} />
                        <PriceBox label="Giá bán" value={sale > 0 ? `${formatMoney(sale)}đ` : "—"} amber />
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t border-[#efe5d3] bg-slate-50/60 p-3 sm:grid-cols-4">
                        <ActionButton label="Sửa" onClick={() => onEdit(product)} />
                        <ActionButton label="Giá" onClick={() => onPrice(product)} amber />
                        <ActionButton label={inactive ? "Kinh doanh lại" : "Ngừng KD"} onClick={() => onToggleActive(product)} muted={!inactive} success={inactive} disabled={updating} />
                        <ActionButton label="Xóa" onClick={() => onDelete(product)} danger disabled={stock > 0 || deleting} />
                  </div>
            </article>
      );
}

function PriceBox({ label, value, amber = false }: { label: string; value: string; amber?: boolean }) {
      return <div className={`rounded-xl px-3 py-2 ${amber ? "bg-amber-50" : "bg-slate-50"}`}><p className={`font-bold ${amber ? "text-amber-500" : "text-slate-400"}`}>{label}</p><p className={`mt-0.5 font-black ${amber ? "text-amber-800" : "text-slate-800"}`}>{value}</p></div>;
}

function ActionButton({ label, onClick, amber = false, danger = false, muted = false, success = false, disabled = false }: { label: string; onClick: () => void; amber?: boolean; danger?: boolean; muted?: boolean; success?: boolean; disabled?: boolean }) {
      const tone = danger ? "border-rose-100 text-rose-600 hover:bg-rose-50" : success ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : muted ? "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100" : amber ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" : "border-slate-200 text-slate-700 hover:bg-slate-50";
      return <button type="button" onClick={onClick} disabled={disabled} className={`rounded-xl border bg-white px-3 py-2 text-xs font-black shadow-sm disabled:cursor-not-allowed disabled:opacity-35 ${tone}`}>{label}</button>;
}

function QuickValue({ id, label, value, negative = false }: { id?: string; label: string; value: string; negative?: boolean }) {
      return <div id={id} tabIndex={id ? -1 : undefined} className="hidden min-w-[130px] scroll-mt-24 rounded-xl border border-amber-100 bg-white px-3 py-2 outline-none transition focus:ring-4 focus:ring-amber-100 md:block"><p className="text-[11px] font-bold text-slate-400">{label}</p><p className={`mt-0.5 text-xs font-black ${negative ? "text-rose-700" : "text-slate-900"}`}>{value}</p></div>;
}
