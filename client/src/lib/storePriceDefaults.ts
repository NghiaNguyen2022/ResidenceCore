export type StorePriceReference = {
      value: number;
      source: "sale" | "latest_purchase" | "average_purchase" | "purchase_fallback" | "none";
      note: string;
      isPurchaseFallback: boolean;
};

function positive(value: unknown) {
      const amount = Number(value || 0);
      return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export function getPurchasePriceReference(product: any): StorePriceReference {
      const latestPurchase = positive(product?.defaultCostPrice);
      if (latestPurchase > 0) {
            return { value: latestPurchase, source: "latest_purchase", note: "Giá mua gần nhất", isPurchaseFallback: false };
      }

      const averagePurchase = positive(product?.averageCostPrice);
      if (averagePurchase > 0) {
            return { value: averagePurchase, source: "average_purchase", note: "Chưa có giá mua gần nhất · dùng giá mua trung bình", isPurchaseFallback: false };
      }

      return { value: 0, source: "none", note: "Chưa có dữ liệu giá mua", isPurchaseFallback: false };
}

export function getSalePriceReference(product: any): StorePriceReference {
      const salePrice = positive(product?.currentSalePrice) || positive(product?.defaultSalePrice);
      if (salePrice > 0) {
            return { value: salePrice, source: "sale", note: "Giá bán hiện hành", isPurchaseFallback: false };
      }

      const purchase = getPurchasePriceReference(product);
      if (purchase.value > 0) {
            return {
                  value: purchase.value,
                  source: "purchase_fallback",
                  note: purchase.source === "latest_purchase"
                        ? "Chưa có giá bán · đang dùng giá mua gần nhất"
                        : "Chưa có giá bán · đang dùng giá mua trung bình",
                  isPurchaseFallback: true,
            };
      }

      return { value: 0, source: "none", note: "Chưa có giá bán hoặc giá mua tham chiếu", isPurchaseFallback: false };
}
