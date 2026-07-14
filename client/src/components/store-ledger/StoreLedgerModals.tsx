import { AlertTriangle, ShieldCheck, Undo2 } from "lucide-react";

import { FormDateInput } from "@/components/shared";
import {
      ErrorText,
      Field,
      MiniStat,
      Modal,
      ModalFooter,
      inputClass,
} from "@/components/store-ledger/StoreLedgerShared";

export function StoreLedgerModals({
      blockingNotice,
      setBlockingNotice,
      deleteProductTarget,
      setDeleteProductTarget,
      confirmDeleteProduct,
      deleteProductMutation,
      productModalOpen,
      editingProduct,
      setProductModalOpen,
      productForm,
      setProductForm,
      defaultProductCategories,
      defaultProductUnits,
      formatCurrencyInput,
      formError,
      handleSaveProduct,
      createProductMutation,
      updateProductMutation,
      priceInfoProduct,
      setPriceInfoProduct,
      productPriceHistoryQuery,
      formatMoney,
      productCostingMethodLabel,
      openSalePriceModal,
      formatDateText,
      salePriceReasonLabel,
      salePriceProduct,
      setSalePriceProduct,
      priceForm,
      setPriceForm,
      salePriceReasonOptions,
      handleUpdateSalePrice,
      updateProductSalePriceMutation,
      ledgerModalOpen,
      setLedgerModalOpen,
      ledgerForm,
      setLedgerForm,
      handleCreateLedger,
      createLedgerMutation,
      purchaseStockModalOpen,
      setPurchaseStockModalOpen,
      purchaseStockForm,
      setPurchaseStockForm,
      products,
      parseCurrencyInput,
      handleCreatePurchaseStock,
      createPurchaseStockMutation,
      saleStockModalOpen,
      setSaleStockModalOpen,
      saleStockForm,
      setSaleStockForm,
      handleCreateSaleStock,
      createSaleStockMutation,
      transactionModalOpen,
      setTransactionModalOpen,
      transactionForm,
      setTransactionForm,
      transactionCategories,
      handleCreateTransaction,
      createTransactionMutation,
      closingPreviewOpen,
      setClosingPreviewOpen,
      closingPreviewQuery,
      directionClass,
      directionLabel,
      categoryLabel,
      confirmCloseDaily,
      closeDailyMutation,
      reviewClosingId,
      setReviewClosingId,
      closingDetailQuery,
      reviewClosing,
      reviewTransactions,
      closingStatusClass,
      closingStatusLabel,
      canCancelClosing,
      cancelDailyClosingMutation,
      canApproveClosing,
      approveDailyClosingMutation,
}: any) {
      return (
            <>
                  {blockingNotice ? (
                        <Modal
                              title={blockingNotice.title}
                              onClose={() => setBlockingNotice(null)}
                              overlayClassName="z-[110]"
                        >
                              <div className="space-y-4">
                                    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900">
                                          <div className="rounded-full bg-white p-2 text-amber-600 shadow-sm">
                                                <AlertTriangle className="h-5 w-5" />
                                          </div>
                                          <div className="min-w-0">
                                                <p className="text-sm font-black text-slate-950">
                                                      Thao tác đang bị khóa
                                                </p>
                                                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                                                      {blockingNotice.message}
                                                </p>
                                          </div>
                                    </div>
                                    <div className="flex justify-end">
                                          <button
                                                type="button"
                                                onClick={() => setBlockingNotice(null)}
                                                className="rounded-full bg-slate-950 px-5 py-2 text-sm font-black text-white shadow-sm hover:bg-slate-800"
                                          >
                                                Đã hiểu
                                          </button>
                                    </div>
                              </div>
                        </Modal>
                  ) : null}

                  {deleteProductTarget ? (
                        <Modal
                              title="Xác nhận xóa hàng hóa"
                              onClose={() => setDeleteProductTarget(null)}
                              overlayClassName="z-[110]"
                        >
                              <div className="space-y-4">
                                    <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/80 p-4 text-rose-900">
                                          <div className="rounded-full bg-white p-2 text-rose-600 shadow-sm">
                                                <AlertTriangle className="h-5 w-5" />
                                          </div>
                                          <div className="min-w-0">
                                                <p className="text-sm font-black text-slate-950">
                                                      Xóa khỏi danh mục đang dùng?
                                                </p>
                                                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                                                      Hàng hóa “{deleteProductTarget.productName}” sẽ được đưa khỏi
                                                      danh mục đang dùng. Chỉ nên xóa khi chưa có tồn kho hoặc phát
                                                      sinh mua bán.
                                                </p>
                                          </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                          <button
                                                type="button"
                                                onClick={() => setDeleteProductTarget(null)}
                                                className="rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50"
                                          >
                                                Hủy
                                          </button>
                                          <button
                                                type="button"
                                                onClick={confirmDeleteProduct}
                                                disabled={deleteProductMutation?.isPending}
                                                className="rounded-full bg-rose-600 px-5 py-2 text-sm font-black text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                                          >
                                                {deleteProductMutation?.isPending ? "Đang xóa..." : "Xác nhận xóa"}
                                          </button>
                                    </div>
                              </div>
                        </Modal>
                  ) : null}

                  {productModalOpen ? (
                        <Modal
                              title={editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
                              onClose={() => setProductModalOpen(false)}
                        >
                              <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Mã sản phẩm">
                                          <input
                                                value={productForm.productCode}
                                                disabled={!!editingProduct}
                                                onChange={(event) =>
                                                      setProductForm((prev: any) => ({
                                                            ...prev,
                                                            productCode: event.target.value,
                                                      }))
                                                }
                                                className={`${inputClass} disabled:bg-slate-50 disabled:text-slate-400`}
                                                placeholder="NUOC_SUOI_500"
                                          />
                                    </Field>
                                    <Field label="Tên sản phẩm">
                                          <input
                                                value={productForm.productName}
                                                onChange={(event) =>
                                                      setProductForm((prev: any) => ({
                                                            ...prev,
                                                            productName: event.target.value,
                                                      }))
                                                }
                                                className={inputClass}
                                                placeholder="Nước suối 500ml"
                                          />
                                    </Field>
                                    <Field label="Nhóm hàng">
                                          <div className="space-y-2">
                                                <select
                                                      value={
                                                            defaultProductCategories.some(
                                                                  (item: any) => item.value === productForm.category,
                                                            )
                                                                  ? productForm.category
                                                                  : "__custom"
                                                      }
                                                      onChange={(event) => {
                                                            const value = event.target.value;
                                                            setProductForm((prev: any) => ({
                                                                  ...prev,
                                                                  category: value === "__custom" ? "" : value,
                                                            }));
                                                      }}
                                                      className={inputClass}
                                                >
                                                      {defaultProductCategories
                                                            .filter((item: any) => item.value !== "all")
                                                            .map((item: any) => (
                                                                  <option key={item.value} value={item.value}>
                                                                        {item.label}
                                                                  </option>
                                                            ))}
                                                      <option value="__custom">+ Nhóm hàng mới</option>
                                                </select>
                                                <input
                                                      value={productForm.category}
                                                      onChange={(event) =>
                                                            setProductForm((prev: any) => ({
                                                                  ...prev,
                                                                  category: event.target.value,
                                                            }))
                                                      }
                                                      className={inputClass}
                                                      placeholder="VD: Nông sản, thủ công, bánh kẹo, sách..."
                                                />
                                          </div>
                                    </Field>
                                    <Field label="Đơn vị tính">
                                          <div className="space-y-2">
                                                <select
                                                      value={
                                                            defaultProductUnits.some(
                                                                  (item: any) => item.value === productForm.unit,
                                                            )
                                                                  ? productForm.unit
                                                                  : "__custom"
                                                      }
                                                      onChange={(event) => {
                                                            const value = event.target.value;
                                                            setProductForm((prev: any) => ({
                                                                  ...prev,
                                                                  unit: value === "__custom" ? "" : value,
                                                            }));
                                                      }}
                                                      className={inputClass}
                                                >
                                                      {defaultProductUnits.map((item: any) => (
                                                            <option key={item.value} value={item.value}>
                                                                  {item.label}
                                                            </option>
                                                      ))}
                                                      <option value="__custom">+ Đơn vị mới</option>
                                                </select>
                                                <input
                                                      value={productForm.unit}
                                                      onChange={(event) =>
                                                            setProductForm((prev: any) => ({
                                                                  ...prev,
                                                                  unit: event.target.value,
                                                            }))
                                                      }
                                                      className={inputClass}
                                                      placeholder="VD: bó, hộp, ký..."
                                                />
                                          </div>
                                    </Field>
                                    <Field label="Tồn tối thiểu">
                                          <input
                                                inputMode="numeric"
                                                value={productForm.minStock}
                                                onChange={(event) =>
                                                      setProductForm((prev: any) => ({
                                                            ...prev,
                                                            minStock: formatCurrencyInput(event.target.value),
                                                      }))
                                                }
                                                className={`${inputClass} text-right font-black`}
                                                placeholder="20"
                                          />
                                    </Field>
                                    <div className="sm:col-span-2 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-xs font-semibold leading-5 text-amber-900">
                                          Chỉ nhập thông tin hàng hóa cơ bản ở đây. Giá vốn và giá bán được quản lý ở nút <b>Thông tin giá</b> để giữ lịch sử thay đổi rõ ràng.
                                    </div>
                                    <Field label="Ghi chú" className="sm:col-span-2">
                                          <textarea
                                                value={productForm.description}
                                                onChange={(event) =>
                                                      setProductForm((prev: any) => ({
                                                            ...prev,
                                                            description: event.target.value,
                                                      }))
                                                }
                                                rows={2}
                                                className={inputClass}
                                          />
                                    </Field>
                              </div>
                              {formError ? <ErrorText>{formError}</ErrorText> : null}
                              <ModalFooter
                                    onClose={() => setProductModalOpen(false)}
                                    onSave={handleSaveProduct}
                                    saveText={editingProduct ? "Lưu hàng hóa" : "Thêm hàng hóa"}
                                    loading={createProductMutation?.isPending || updateProductMutation?.isPending}
                              />
                        </Modal>
                  ) : null}

                  {priceInfoProduct ? (
                        <Modal
                              title={`Thông tin giá - ${priceInfoProduct.productName || "Hàng hóa"}`}
                              onClose={() => setPriceInfoProduct(null)}
                        >
                              {(() => {
                                    const historyData = productPriceHistoryQuery.data as any;
                                    const costHistory = historyData?.costHistory || historyData?.costHistories || [];
                                    const saleHistory = historyData?.salePriceHistory || historyData?.salePriceHistories || [];
                                    const stock = Number(priceInfoProduct.currentStock || 0);
                                    const cost = Number(priceInfoProduct.averageCostPrice || priceInfoProduct.defaultCostPrice || 0);
                                    const sale = Number(priceInfoProduct.currentSalePrice || priceInfoProduct.defaultSalePrice || 0);
                                    return (
                                          <div className="space-y-4">
                                                <div className="grid gap-3 sm:grid-cols-3">
                                                      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                                            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Giá vốn hiện tại</p>
                                                            <p className="mt-1 text-xl font-black text-slate-950">{cost > 0 ? `${formatMoney(cost)}đ` : "Chưa có"}</p>
                                                            <p className="mt-1 text-xs font-semibold text-slate-500">{productCostingMethodLabel(priceInfoProduct.costingMethod)}</p>
                                                      </div>
                                                      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3">
                                                            <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-600">Giá bán hiện tại</p>
                                                            <p className="mt-1 text-xl font-black text-slate-950">{sale > 0 ? `${formatMoney(sale)}đ` : "Chưa nhập"}</p>
                                                            <button
                                                                  type="button"
                                                                  onClick={() => openSalePriceModal(priceInfoProduct)}
                                                                  className="mt-2 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-black text-white"
                                                            >
                                                                  Cập nhật giá bán
                                                            </button>
                                                      </div>
                                                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                                                            <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Giá trị tồn</p>
                                                            <p className="mt-1 text-xl font-black text-slate-950">{formatMoney(stock * cost)}đ</p>
                                                            <p className="mt-1 text-xs font-semibold text-slate-500">Tồn {formatMoney(stock)} {priceInfoProduct.unit || ""}</p>
                                                      </div>
                                                </div>
                                                <div className="rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-600">
                                                      Giá vốn lấy từ các lần nhập hàng hoặc tự gia công. Giá bán có lịch sử riêng để biết vì sao thay đổi: giá nhập tăng, chi phí vận hành tăng, điều chỉnh theo thực tế hoặc khuyến mãi.
                                                </div>
                                                <div className="grid gap-4 lg:grid-cols-2">
                                                      <section className="rounded-2xl border border-slate-100 bg-white p-4">
                                                            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Lịch sử giá vốn</h3>
                                                            <div className="mt-3 space-y-2">
                                                                  {productPriceHistoryQuery.isLoading ? (
                                                                        <p className="text-sm font-semibold text-slate-500">Đang tải lịch sử...</p>
                                                                  ) : costHistory.length ? (
                                                                        costHistory.slice(0, 6).map((item: any) => (
                                                                              <div key={item.id || `${item.effectiveDate}-${item.unitCost}`} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
                                                                                    <p className="font-black text-slate-900">{formatDateText(item.effectiveDate || item.createdAt)} · Giá vào {formatMoney(item.unitCost || item.costPrice || 0)}đ</p>
                                                                                    <p className="text-xs font-semibold text-slate-500">{item.quantity ? `Số lượng ${formatMoney(item.quantity)} · ` : ""}Giá cuối: {formatMoney(item.averageCostAfter || item.averageCostPrice || item.unitCost || 0)}đ</p>
                                                                                    {item.note || item.reason ? <p className="text-xs font-semibold text-amber-700">{item.reason || item.note}</p> : null}
                                                                              </div>
                                                                        ))
                                                                  ) : (
                                                                        <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500">Chưa có lịch sử giá vốn. Khi nhập hàng hoặc ghi nhận gia công, hệ thống sẽ tạo lịch sử ở đây.</p>
                                                                  )}
                                                            </div>
                                                      </section>
                                                      <section className="rounded-2xl border border-amber-100 bg-white p-4">
                                                            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-amber-600">Lịch sử giá bán</h3>
                                                            <div className="mt-3 space-y-2">
                                                                  {productPriceHistoryQuery.isLoading ? (
                                                                        <p className="text-sm font-semibold text-slate-500">Đang tải lịch sử...</p>
                                                                  ) : saleHistory.length ? (
                                                                        saleHistory.slice(0, 6).map((item: any) => (
                                                                              <div key={item.id || `${item.effectiveDate}-${item.salePrice}`} className="rounded-xl bg-amber-50 px-3 py-2 text-sm">
                                                                                    <p className="font-black text-slate-900">{formatDateText(item.effectiveDate || item.createdAt)} · Giá bán {formatMoney(item.salePrice || 0)}đ</p>
                                                                                    <p className="text-xs font-semibold text-amber-700">{salePriceReasonLabel(item.reason)}</p>
                                                                                    {item.note ? <p className="text-xs font-semibold text-slate-500">{item.note}</p> : null}
                                                                              </div>
                                                                        ))
                                                                  ) : (
                                                                        <p className="rounded-xl bg-amber-50 px-3 py-3 text-sm font-semibold text-slate-500">Chưa có lịch sử giá bán. Bấm Cập nhật giá bán để ghi nhận giá đầu tiên.</p>
                                                                  )}
                                                            </div>
                                                      </section>
                                                </div>
                                                <ModalFooter
                                                      onClose={() => setPriceInfoProduct(null)}
                                                      onSave={() => openSalePriceModal(priceInfoProduct)}
                                                      saveText="Cập nhật giá bán"
                                                />
                                          </div>
                                    );
                              })()}
                        </Modal>
                  ) : null}

                  {salePriceProduct ? (
                        <Modal
                              title={`Cập nhật giá bán - ${salePriceProduct.productName || "Hàng hóa"}`}
                              onClose={() => setSalePriceProduct(null)}
                        >
                              <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Giá bán mới">
                                          <input
                                                inputMode="numeric"
                                                value={priceForm.salePrice}
                                                onChange={(event) =>
                                                      setPriceForm((prev: any) => ({
                                                            ...prev,
                                                            salePrice: formatCurrencyInput(event.target.value),
                                                      }))
                                                }
                                                className={`${inputClass} text-right font-black`}
                                                placeholder="5.000"
                                          />
                                    </Field>
                                    <Field label="Ngày áp dụng">
                                          <FormDateInput
                                                value={priceForm.effectiveDate}
                                                onChange={(event: any) =>
                                                      setPriceForm((prev: any) => ({
                                                            ...prev,
                                                            effectiveDate: event.target.value,
                                                      }))
                                                }
                                          />
                                    </Field>
                                    <Field label="Lý do thay đổi" className="sm:col-span-2">
                                          <select
                                                value={priceForm.reason}
                                                onChange={(event) =>
                                                      setPriceForm((prev: any) => ({ ...prev, reason: event.target.value }))
                                                }
                                                className={inputClass}
                                          >
                                                {salePriceReasonOptions.map((item: any) => (
                                                      <option key={item.value} value={item.value}>
                                                            {item.label}
                                                      </option>
                                                ))}
                                          </select>
                                    </Field>
                                    <Field label="Ghi chú" className="sm:col-span-2">
                                          <textarea
                                                value={priceForm.note}
                                                onChange={(event) =>
                                                      setPriceForm((prev: any) => ({ ...prev, note: event.target.value }))
                                                }
                                                rows={3}
                                                className={inputClass}
                                                placeholder="VD: giá nhập tăng, chi phí vận chuyển tăng, điều chỉnh theo thị trường..."
                                          />
                                    </Field>
                              </div>
                              {formError ? <ErrorText>{formError}</ErrorText> : null}
                              <ModalFooter
                                    onClose={() => setSalePriceProduct(null)}
                                    onSave={handleUpdateSalePrice}
                                    saveText="Lưu giá bán"
                                    loading={updateProductSalePriceMutation?.isPending}
                              />
                        </Modal>
                  ) : null}

                  {ledgerModalOpen ? (
                        <Modal
                              title="Khởi tạo cửa hàng"
                              onClose={() => setLedgerModalOpen(false)}
                        >
                              <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Mã cửa hàng">
                                          <input
                                                value={ledgerForm.ledgerCode}
                                                onChange={(event) =>
                                                      setLedgerForm((prev: any) => ({
                                                            ...prev,
                                                            ledgerCode: event.target.value,
                                                      }))
                                                }
                                                className={inputClass}
                                          />
                                    </Field>
                                    <Field label="Tên cửa hàng">
                                          <input
                                                value={ledgerForm.ledgerName}
                                                onChange={(event) =>
                                                      setLedgerForm((prev: any) => ({
                                                            ...prev,
                                                            ledgerName: event.target.value,
                                                      }))
                                                }
                                                className={inputClass}
                                          />
                                    </Field>
                                    <Field label="Vốn/số dư đầu kỳ">
                                          <input
                                                inputMode="numeric"
                                                value={ledgerForm.openingBalance}
                                                onChange={(event) =>
                                                      setLedgerForm((prev: any) => ({
                                                            ...prev,
                                                            openingBalance: formatCurrencyInput(event.target.value),
                                                      }))
                                                }
                                                className={`${inputClass} text-right font-black`}
                                                placeholder="0"
                                          />
                                    </Field>
                                    <Field label="Ghi chú" className="sm:col-span-2">
                                          <textarea
                                                value={ledgerForm.description}
                                                onChange={(event) =>
                                                      setLedgerForm((prev: any) => ({
                                                            ...prev,
                                                            description: event.target.value,
                                                      }))
                                                }
                                                rows={2}
                                                className={inputClass}
                                          />
                                    </Field>
                              </div>
                              {formError ? <ErrorText>{formError}</ErrorText> : null}
                              <ModalFooter
                                    onClose={() => setLedgerModalOpen(false)}
                                    onSave={handleCreateLedger}
                                    saveText="Khởi tạo cửa hàng"
                                    loading={createLedgerMutation?.isPending}
                              />
                        </Modal>
                  ) : null}

                  {purchaseStockModalOpen ? (
                        <Modal
                              title="Tạo phiếu nhập kho"
                              onClose={() => setPurchaseStockModalOpen(false)}
                        >
                              <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Nguồn nhập" className="sm:col-span-2">
                                          <select
                                                value={purchaseStockForm.stockInSource}
                                                onChange={(event) =>
                                                      setPurchaseStockForm((prev: any) => ({
                                                            ...prev,
                                                            stockInSource: event.target.value,
                                                            sourceName: "",
                                                      }))
                                                }
                                                className={inputClass}
                                          >
                                                <option value="purchase">Mua hàng</option>
                                                <option value="production">Sản xuất / gia công nội bộ</option>
                                                <option value="self_supply">Tự cung cấp / được cấp</option>
                                                <option value="other">Nguồn khác</option>
                                          </select>
                                    </Field>
                                    <Field label="Hàng hóa" className="sm:col-span-2">
                                          <select
                                                value={purchaseStockForm.productId}
                                                onChange={(event) => {
                                                      const selectedProduct = products.find(
                                                            (item: any) => String(item.id) === event.target.value,
                                                      );
                                                      setPurchaseStockForm((prev: any) => ({
                                                            ...prev,
                                                            productId: event.target.value,
                                                            unitCost: (selectedProduct?.averageCostPrice || selectedProduct?.defaultCostPrice)
                                                                  ? formatCurrencyInput(selectedProduct.averageCostPrice || selectedProduct.defaultCostPrice)
                                                                  : prev.unitCost,
                                                      }));
                                                }}
                                                className={inputClass}
                                          >
                                                <option value="">Chọn hàng hóa</option>
                                                {products.map((product: any) => (
                                                      <option key={product.id} value={product.id}>
                                                            {product.productName} · tồn {formatMoney(product.currentStock)} {product.unit || ""}
                                                      </option>
                                                ))}
                                          </select>
                                    </Field>
                                    <Field label="Ngày nhập">
                                          <FormDateInput
                                                value={purchaseStockForm.transactionDate}
                                                onChange={(event: any) =>
                                                      setPurchaseStockForm((prev: any) => ({
                                                            ...prev,
                                                            transactionDate: event.target.value,
                                                      }))
                                                }
                                          />
                                    </Field>
                                    <Field
                                          label={
                                                purchaseStockForm.stockInSource === "purchase"
                                                      ? "Nhà cung cấp / nơi mua"
                                                      : purchaseStockForm.stockInSource === "production"
                                                            ? "Bộ phận / mẻ sản xuất"
                                                            : purchaseStockForm.stockInSource === "self_supply"
                                                                  ? "Người / đơn vị cung cấp"
                                                                  : "Nguồn cung cấp"
                                          }
                                    >
                                          <input
                                                value={purchaseStockForm.sourceName}
                                                onChange={(event) =>
                                                      setPurchaseStockForm((prev: any) => ({
                                                            ...prev,
                                                            sourceName: event.target.value,
                                                      }))
                                                }
                                                className={inputClass}
                                                placeholder={
                                                      purchaseStockForm.stockInSource === "purchase"
                                                            ? "VD: Chợ đầu mối / nhà cung cấp"
                                                            : purchaseStockForm.stockInSource === "production"
                                                                  ? "VD: Bếp / nhóm gia công / mẻ số..."
                                                                  : "Tên người, đơn vị hoặc nguồn nhập"
                                                }
                                          />
                                    </Field>
                                    <Field label="Số lượng">
                                          <input
                                                inputMode="numeric"
                                                value={purchaseStockForm.quantity}
                                                onChange={(event) =>
                                                      setPurchaseStockForm((prev: any) => ({
                                                            ...prev,
                                                            quantity: formatCurrencyInput(event.target.value),
                                                      }))
                                                }
                                                className={`${inputClass} text-right font-black`}
                                                placeholder="10"
                                          />
                                    </Field>
                                    <Field label="Giá vốn / đơn vị">
                                          <input
                                                inputMode="numeric"
                                                value={purchaseStockForm.unitCost}
                                                onChange={(event) =>
                                                      setPurchaseStockForm((prev: any) => ({
                                                            ...prev,
                                                            unitCost: formatCurrencyInput(event.target.value),
                                                      }))
                                                }
                                                className={`${inputClass} text-right font-black`}
                                                placeholder="5.000"
                                          />
                                    </Field>
                                    <div className="sm:col-span-2 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm font-bold text-slate-700">
                                          Giá trị nhập kho: <span className="text-slate-950">{formatMoney(parseCurrencyInput(purchaseStockForm.quantity) * parseCurrencyInput(purchaseStockForm.unitCost))}đ</span>
                                          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                                                {purchaseStockForm.stockInSource === "purchase"
                                                      ? "Hệ thống sẽ tăng tồn, cập nhật giá vốn và tự động tạo khoản chi mua hàng."
                                                      : "Hệ thống sẽ tăng tồn và cập nhật giá vốn; không tự động tạo khoản chi cửa hàng."}
                                          </p>
                                    </div>
                                    <Field label="Ghi chú" className="sm:col-span-2">
                                          <textarea
                                                value={purchaseStockForm.description}
                                                onChange={(event) =>
                                                      setPurchaseStockForm((prev: any) => ({
                                                            ...prev,
                                                            description: event.target.value,
                                                      }))
                                                }
                                                rows={2}
                                                className={inputClass}
                                                placeholder="Ghi chú lô hàng, mẻ sản xuất, chất lượng hoặc chứng từ nếu có"
                                          />
                                    </Field>
                              </div>
                              {formError ? <ErrorText>{formError}</ErrorText> : null}
                              <ModalFooter
                                    onClose={() => setPurchaseStockModalOpen(false)}
                                    onSave={handleCreatePurchaseStock}
                                    saveText="Lưu phiếu nhập"
                                    loading={createPurchaseStockMutation?.isPending}
                              />
                        </Modal>
                  ) : null}

                  {saleStockModalOpen ? (
                        <Modal
                              title="Tạo phiếu bán hàng"
                              onClose={() => setSaleStockModalOpen(false)}
                        >
                              <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Hàng hóa" className="sm:col-span-2">
                                          <select
                                                value={saleStockForm.productId}
                                                onChange={(event) => {
                                                      const selectedProduct = products.find(
                                                            (item: any) => String(item.id) === event.target.value,
                                                      );
                                                      setSaleStockForm((prev: any) => ({
                                                            ...prev,
                                                            productId: event.target.value,
                                                            unitPrice: selectedProduct
                                                                  ? formatCurrencyInput(selectedProduct.currentSalePrice || selectedProduct.defaultSalePrice || 0)
                                                                  : "",
                                                      }));
                                                }}
                                                className={inputClass}
                                          >
                                                <option value="">Chọn hàng hóa</option>
                                                {products.map((product: any) => (
                                                      <option key={product.id} value={product.id} disabled={Number(product.currentStock || 0) <= 0}>
                                                            {product.productName} · tồn {formatMoney(product.currentStock)} {product.unit || ""}
                                                      </option>
                                                ))}
                                          </select>
                                    </Field>
                                    <Field label="Ngày bán">
                                          <FormDateInput
                                                value={saleStockForm.transactionDate}
                                                onChange={(event: any) =>
                                                      setSaleStockForm((prev: any) => ({
                                                            ...prev,
                                                            transactionDate: event.target.value,
                                                      }))
                                                }
                                          />
                                    </Field>
                                    <Field label="Khách hàng / người mua">
                                          <input
                                                value={saleStockForm.customerName}
                                                onChange={(event) =>
                                                      setSaleStockForm((prev: any) => ({ ...prev, customerName: event.target.value }))
                                                }
                                                className={inputClass}
                                                placeholder="Để trống nếu bán khách lẻ"
                                          />
                                    </Field>
                                    <Field label="Số lượng bán">
                                          <input
                                                inputMode="numeric"
                                                value={saleStockForm.quantity}
                                                onChange={(event) =>
                                                      setSaleStockForm((prev: any) => ({
                                                            ...prev,
                                                            quantity: formatCurrencyInput(event.target.value),
                                                      }))
                                                }
                                                className={`${inputClass} text-right font-black`}
                                                placeholder="1"
                                          />
                                    </Field>
                                    <Field label="Giá bán / đơn vị">
                                          <input
                                                inputMode="numeric"
                                                value={saleStockForm.unitPrice}
                                                onChange={(event) =>
                                                      setSaleStockForm((prev: any) => ({
                                                            ...prev,
                                                            unitPrice: formatCurrencyInput(event.target.value),
                                                      }))
                                                }
                                                className={`${inputClass} text-right font-black`}
                                                placeholder="10.000"
                                          />
                                    </Field>
                                    <Field label="Phương thức thanh toán">
                                          <select
                                                value={saleStockForm.paymentMethod}
                                                onChange={(event) =>
                                                      setSaleStockForm((prev: any) => ({ ...prev, paymentMethod: event.target.value }))
                                                }
                                                className={inputClass}
                                          >
                                                <option value="cash">Tiền mặt</option>
                                                <option value="bank_transfer">Chuyển khoản</option>
                                                <option value="other">Khác</option>
                                          </select>
                                    </Field>
                                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm font-bold text-slate-700">
                                          Thành tiền: <span className="text-emerald-800">{formatMoney(parseCurrencyInput(saleStockForm.quantity) * parseCurrencyInput(saleStockForm.unitPrice))}đ</span>
                                          <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                                                Hệ thống sẽ giảm tồn kho và tự động ghi khoản thu bán hàng.
                                          </p>
                                    </div>
                                    <Field label="Ghi chú" className="sm:col-span-2">
                                          <textarea
                                                value={saleStockForm.description}
                                                onChange={(event) =>
                                                      setSaleStockForm((prev: any) => ({ ...prev, description: event.target.value }))
                                                }
                                                rows={2}
                                                className={inputClass}
                                                placeholder="Ghi chú đơn bán, người nhận hoặc thông tin liên quan"
                                          />
                                    </Field>
                              </div>
                              {formError ? <ErrorText>{formError}</ErrorText> : null}
                              <ModalFooter
                                    onClose={() => setSaleStockModalOpen(false)}
                                    onSave={handleCreateSaleStock}
                                    saveText="Lưu phiếu bán"
                                    loading={createSaleStockMutation?.isPending}
                              />
                        </Modal>
                  ) : null}

                  {transactionModalOpen ? (
                        <Modal
                              title={transactionForm.direction === "in" ? "Thu bán hàng" : "Chi cửa hàng"}
                              onClose={() => setTransactionModalOpen(false)}
                        >
                              <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Loại phát sinh">
                                          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-amber-100 bg-amber-50/70 p-1">
                                                {([
                                                      { value: "in", label: "Thu" },
                                                      { value: "out", label: "Chi" },
                                                ] as const).map((item) => (
                                                      <button
                                                            key={item.value}
                                                            type="button"
                                                            onClick={() =>
                                                                  setTransactionForm((prev: any) => ({
                                                                        ...prev,
                                                                        direction: item.value,
                                                                        category: item.value === "in" ? "sales" : "purchase",
                                                                  }))
                                                            }
                                                            className={`rounded-xl px-3 py-2 text-sm font-black ${transactionForm.direction === item.value ? "bg-slate-950 text-white shadow" : "text-slate-600"}`}
                                                      >
                                                            {item.label}
                                                      </button>
                                                ))}
                                          </div>
                                    </Field>
                                    <Field label="Ngày phát sinh">
                                          <FormDateInput
                                                value={transactionForm.transactionDate}
                                                onChange={(event: any) =>
                                                      setTransactionForm((prev: any) => ({
                                                            ...prev,
                                                            transactionDate: event.target.value,
                                                      }))
                                                }
                                          />
                                    </Field>
                                    <Field label="Số tiền">
                                          <input
                                                inputMode="numeric"
                                                value={transactionForm.amount}
                                                onChange={(event) =>
                                                      setTransactionForm((prev: any) => ({
                                                            ...prev,
                                                            amount: formatCurrencyInput(event.target.value),
                                                      }))
                                                }
                                                className={`${inputClass} text-right text-base font-black`}
                                                placeholder="1.000.000"
                                          />
                                    </Field>
                                    <Field label="Nhóm khoản">
                                          <select
                                                value={transactionForm.category}
                                                onChange={(event) =>
                                                      setTransactionForm((prev: any) => ({
                                                            ...prev,
                                                            category: event.target.value,
                                                      }))
                                                }
                                                className={inputClass}
                                          >
                                                {transactionCategories.map((item: any) => (
                                                      <option key={item.value} value={item.value}>
                                                            {item.label}
                                                      </option>
                                                ))}
                                          </select>
                                    </Field>
                                    <Field label="Nội dung" className="sm:col-span-2">
                                          <input
                                                value={transactionForm.title}
                                                onChange={(event) =>
                                                      setTransactionForm((prev: any) => ({
                                                            ...prev,
                                                            title: event.target.value,
                                                      }))
                                                }
                                                className={inputClass}
                                                placeholder="Ví dụ: Bán nước uống / Mua vật tư cửa hàng"
                                          />
                                    </Field>
                                    <Field label="Người nộp/nhận">
                                          <input
                                                value={transactionForm.partnerName}
                                                onChange={(event) =>
                                                      setTransactionForm((prev: any) => ({
                                                            ...prev,
                                                            partnerName: event.target.value,
                                                      }))
                                                }
                                                className={inputClass}
                                          />
                                    </Field>
                                    <Field label="Phương thức">
                                          <select
                                                value={transactionForm.paymentMethod}
                                                onChange={(event) =>
                                                      setTransactionForm((prev: any) => ({
                                                            ...prev,
                                                            paymentMethod: event.target.value,
                                                      }))
                                                }
                                                className={inputClass}
                                          >
                                                <option value="cash">Tiền mặt</option>
                                                <option value="bank_transfer">Chuyển khoản</option>
                                                <option value="other">Khác</option>
                                          </select>
                                    </Field>
                                    <Field label="Ghi chú" className="sm:col-span-2">
                                          <textarea
                                                value={transactionForm.description}
                                                onChange={(event) =>
                                                      setTransactionForm((prev: any) => ({
                                                            ...prev,
                                                            description: event.target.value,
                                                      }))
                                                }
                                                rows={2}
                                                className={inputClass}
                                          />
                                    </Field>
                              </div>
                              {formError ? <ErrorText>{formError}</ErrorText> : null}
                              <ModalFooter
                                    onClose={() => setTransactionModalOpen(false)}
                                    onSave={handleCreateTransaction}
                                    saveText="Lưu phát sinh"
                                    loading={createTransactionMutation?.isPending}
                              />
                        </Modal>
                  ) : null}

                  {closingPreviewOpen ? (
                        <Modal
                              title="Xem trước chốt ngày"
                              onClose={() => setClosingPreviewOpen(false)}
                              overlayClassName="z-[95]"
                        >
                              {closingPreviewQuery.isLoading ? (
                                    <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-semibold text-slate-600">
                                          Đang tổng hợp phát sinh trong ngày...
                                    </div>
                              ) : closingPreviewQuery.error ? (
                                    <ErrorText>{(closingPreviewQuery.error as any)?.message || "Không thể tải dữ liệu xem trước."}</ErrorText>
                              ) : (closingPreviewQuery.data as any)?.summary ? (
                                    <div className="space-y-4">
                                          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                                                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
                                                      Ngày {formatDateText((closingPreviewQuery.data as any).closingDate)}
                                                </p>
                                                <h3 className="mt-1 text-lg font-black text-slate-950">Kiểm tra trước khi chốt</h3>
                                                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                                                      Đây chỉ là bản xem trước. Dữ liệu chưa bị khóa và chưa tạo lịch sử chốt cho đến khi bấm Xác nhận chốt ngày.
                                                </p>
                                                <div className="mt-4 grid gap-2 sm:grid-cols-4">
                                                      <MiniStat label="Phát sinh" value={String((closingPreviewQuery.data as any).summary.transactionCount || 0)} />
                                                      <MiniStat label="Tổng thu" value={`${formatMoney((closingPreviewQuery.data as any).summary.totalIn)} đ`} />
                                                      <MiniStat label="Tổng chi" value={`${formatMoney((closingPreviewQuery.data as any).summary.totalOut)} đ`} />
                                                      <MiniStat label="Chênh lệch" value={`${formatMoney((closingPreviewQuery.data as any).summary.balance)} đ`} />
                                                </div>
                                          </div>
                                          <div className="max-h-[34vh] space-y-2 overflow-y-auto pr-1">
                                                {((closingPreviewQuery.data as any).transactions || []).map((item: any) => (
                                                      <div key={item.id} className="rounded-2xl border border-[#eadfca] bg-white px-4 py-3 shadow-sm">
                                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                                  <div className="min-w-0">
                                                                        <div className="flex flex-wrap items-center gap-2">
                                                                              <span className={`rounded-full border px-2.5 py-1 text-xs font-black ${directionClass(item.direction)}`}>{directionLabel(item.direction)}</span>
                                                                              <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">{categoryLabel(item.category)}</span>
                                                                        </div>
                                                                        <p className="mt-1 text-sm font-black text-slate-950">{item.title}</p>
                                                                        <p className="mt-0.5 text-xs font-semibold text-slate-500">{item.partnerName || item.transactionCode}</p>
                                                                  </div>
                                                                  <p className={`text-base font-black ${item.direction === "in" ? "text-emerald-700" : "text-rose-700"}`}>
                                                                        {item.direction === "in" ? "+" : "-"}{formatMoney(item.amount)} đ
                                                                  </p>
                                                            </div>
                                                      </div>
                                                ))}
                                          </div>
                                          <div className="flex justify-end gap-2 border-t border-[#eadfca] pt-4">
                                                <button type="button" onClick={() => setClosingPreviewOpen(false)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700">Quay lại</button>
                                                <button type="button" onClick={confirmCloseDaily} disabled={closeDailyMutation?.isPending} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white disabled:opacity-60">
                                                      <ShieldCheck className="h-4 w-4" />
                                                      {closeDailyMutation?.isPending ? "Đang chốt..." : "Xác nhận chốt ngày"}
                                                </button>
                                          </div>
                                    </div>
                              ) : null}
                        </Modal>
                  ) : null}

                  {reviewClosingId ? (
                        <Modal
                              title="Kiểm tra và xác nhận ngày chốt"
                              onClose={() => setReviewClosingId(null)}
                              overlayClassName="z-[95]"
                        >
                              {closingDetailQuery.isLoading ? (
                                    <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-semibold text-slate-600">
                                          Đang tải chi tiết ngày chốt...
                                    </div>
                              ) : reviewClosing ? (
                                    <div className="space-y-4">
                                          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                      <div>
                                                            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">
                                                                  {formatDateText(reviewClosing.closingDate)} · {reviewClosing.closingCode}
                                                            </p>
                                                            <h3 className="mt-1 text-lg font-black text-slate-950">
                                                                  Kiểm tra chi tiết trước khi xác nhận
                                                            </h3>
                                                            <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                                                                  Người lập đã thực hiện Chốt ngày. Trước khi xác nhận có thể bỏ chốt để bổ sung; khi xác nhận, dữ liệu khóa chính thức và được đẩy sang sổ tài chính chung.
                                                            </p>
                                                      </div>
                                                      <span
                                                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-black ring-1 ${closingStatusClass(reviewClosing.status)}`}
                                                      >
                                                            {closingStatusLabel(reviewClosing.status)}
                                                      </span>
                                                </div>
                                                <div className="mt-4 grid gap-2 sm:grid-cols-4">
                                                      <MiniStat label="Phát sinh" value={String(reviewClosing.transactionCount || 0)} />
                                                      <MiniStat label="Tổng thu" value={`${formatMoney(reviewClosing.totalIn)} đ`} />
                                                      <MiniStat label="Tổng chi" value={`${formatMoney(reviewClosing.totalOut)} đ`} />
                                                      <MiniStat label="Dòng tiền" value={`${formatMoney(reviewClosing.netAmount)} đ`} />
                                                </div>
                                          </div>

                                          <div className="max-h-[34vh] space-y-2 overflow-y-auto pr-1">
                                                {reviewTransactions.length ? (
                                                      reviewTransactions.map((item: any) => (
                                                            <div
                                                                  key={item.id}
                                                                  className="rounded-2xl border border-[#eadfca] bg-white px-4 py-3 shadow-sm"
                                                            >
                                                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                                        <div className="min-w-0">
                                                                              <div className="flex flex-wrap items-center gap-2">
                                                                                    <span
                                                                                          className={`rounded-full border px-2.5 py-1 text-xs font-black ${directionClass(item.direction)}`}
                                                                                    >
                                                                                          {directionLabel(item.direction)}
                                                                                    </span>
                                                                                    <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                                                                                          {categoryLabel(item.category)}
                                                                                    </span>
                                                                                    <span className="text-xs font-bold text-slate-400">
                                                                                          {formatDateText(item.transactionDate)}
                                                                                    </span>
                                                                              </div>
                                                                              <p className="mt-1 truncate text-sm font-black text-slate-950">
                                                                                    {item.title}
                                                                              </p>
                                                                              <p className="mt-0.5 text-xs font-semibold text-slate-500">
                                                                                    {item.partnerName || item.transactionCode}
                                                                              </p>
                                                                        </div>
                                                                        <p
                                                                              className={`text-base font-black ${item.direction === "in" ? "text-emerald-700" : "text-rose-700"}`}
                                                                        >
                                                                              {item.direction === "in" ? "+" : "-"}
                                                                              {formatMoney(item.amount)} đ
                                                                        </p>
                                                                  </div>
                                                            </div>
                                                      ))
                                                ) : (
                                                      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 p-4 text-center text-sm font-semibold text-slate-600">
                                                            Không có phát sinh trong ngày chốt này.
                                                      </div>
                                                )}
                                          </div>

                                          <div className="flex flex-col gap-2 border-t border-[#eadfca] pt-4 sm:flex-row sm:justify-end">
                                                {canCancelClosing(reviewClosing.status) ? (
                                                      <button
                                                            type="button"
                                                            onClick={() =>
                                                                  cancelDailyClosingMutation?.mutate?.({
                                                                        id: Number(reviewClosing.id),
                                                                  })
                                                            }
                                                            disabled={cancelDailyClosingMutation?.isPending}
                                                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-white px-4 py-2.5 text-sm font-black text-rose-700 shadow-sm hover:bg-rose-50 disabled:opacity-60"
                                                      >
                                                            <Undo2 className="h-4 w-4" />
                                                            Bỏ chốt để bổ sung
                                                      </button>
                                                ) : null}
                                                {canApproveClosing(reviewClosing.status) ? (
                                                      <button
                                                            type="button"
                                                            onClick={() =>
                                                                  approveDailyClosingMutation?.mutate?.({
                                                                        id: Number(reviewClosing.id),
                                                                  })
                                                            }
                                                            disabled={approveDailyClosingMutation?.isPending}
                                                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-slate-950/20 disabled:opacity-60"
                                                      >
                                                            <ShieldCheck className="h-4 w-4" />
                                                            Xác nhận & đẩy sổ chung
                                                      </button>
                                                ) : null}
                                          </div>
                                    </div>
                              ) : (
                                    <ErrorText>Không tải được chi tiết ngày chốt.</ErrorText>
                              )}
                        </Modal>
                  ) : null}
            </>
      );
}
