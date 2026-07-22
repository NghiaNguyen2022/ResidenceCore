import { TRPCError } from "@trpc/server";
import { sql } from "drizzle-orm";

import { getDb } from "../db";
import * as storeDb from "../db/storeLedger";
import { storeDutyAccessService } from "./storeDutyAccessService";
import { storeLedgerService } from "./storeLedgerService";

function ensureDate(value: string, message: string) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
            throw new TRPCError({ code: "BAD_REQUEST", message });
      }
      return value;
}

function money(value: unknown) {
      const amount = Number(value || 0);
      return Number.isFinite(amount) ? Number(amount.toFixed(2)) : 0;
}

async function dbOrThrow() {
      const db = await getDb();
      if (!db) {
            throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: "Không thể kết nối cơ sở dữ liệu.",
            });
      }
      return db;
}

function rowsOf(result: any): any[] {
      if (Array.isArray(result?.[0])) return result[0];
      if (Array.isArray(result)) return result;
      return [];
}

function insertIdOf(result: any) {
      return Number(
            result?.[0]?.insertId ??
                  result?.insertId ??
                  result?.[0]?.[0]?.insertId ??
                  0,
      );
}

async function getPreorder(id: number) {
      const db = await dbOrThrow();
      const headerResult: any = await db.execute(sql`
            SELECT *
            FROM storePreorders
            WHERE id = ${id}
            LIMIT 1
      `);
      const header = rowsOf(headerResult)[0];
      if (!header) return null;

      const lineResult: any = await db.execute(sql`
            SELECT
                  l.*,
                  p.productName,
                  p.unit AS productUnit
            FROM storePreorderLines l
            LEFT JOIN storeProducts p ON p.id = l.productId
            WHERE l.preorderId = ${id}
            ORDER BY l.lineNo, l.id
      `);

      return {
            ...header,
            lines: rowsOf(lineResult),
      };
}

export const storePreorderService = {
      async list(input: {
            user: any;
            ledgerId: number;
            storeShiftId?: number | null;
            storeAccessToken?: string | null;
            status?: string | null;
      }) {
            await storeDutyAccessService.authorizeStoreAction({
                  user: input.user,
                  ledgerId: input.ledgerId,
                  storeShiftId: input.storeShiftId,
                  accessToken: input.storeAccessToken,
                  touchActivity: false,
            });

            const db = await dbOrThrow();
            const result: any = input.status
                  ? await db.execute(sql`
                              SELECT *
                              FROM storePreorders
                              WHERE ledgerId = ${input.ledgerId}
                                AND status = ${input.status}
                              ORDER BY
                                    CASE
                                          WHEN status IN ('pending','confirmed','preparing','ready') THEN 0
                                          ELSE 1
                                    END,
                                    requestedDate,
                                    id DESC
                              LIMIT 200
                        `)
                  : await db.execute(sql`
                              SELECT *
                              FROM storePreorders
                              WHERE ledgerId = ${input.ledgerId}
                              ORDER BY
                                    CASE
                                          WHEN status IN ('pending','confirmed','preparing','ready') THEN 0
                                          ELSE 1
                                    END,
                                    requestedDate,
                                    id DESC
                              LIMIT 200
                        `);

            return rowsOf(result);
      },

      async get(input: {
            user: any;
            id: number;
            storeShiftId?: number | null;
            storeAccessToken?: string | null;
      }) {
            const preorder = await getPreorder(input.id);
            if (!preorder) {
                  throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Không tìm thấy đơn đặt trước.",
                  });
            }

            await storeDutyAccessService.authorizeStoreAction({
                  user: input.user,
                  ledgerId: Number(preorder.ledgerId),
                  storeShiftId: input.storeShiftId,
                  accessToken: input.storeAccessToken,
                  touchActivity: false,
            });

            return preorder;
      },

      async create(input: {
            user: any;
            ledgerId: number;
            storeShiftId: number;
            storeAccessToken?: string | null;
            orderDate: string;
            customerName: string;
            customerPhone: string;
            deliveryAddress?: string | null;
            fulfillmentType: "pickup" | "delivery";
            requestedDate: string;
            depositAmount?: number | null;
            notes?: string | null;
            lines: Array<{
                  productId: number;
                  quantity: number;
                  unitPrice: number;
                  notes?: string | null;
            }>;
      }) {
            await storeDutyAccessService.authorizeStoreAction({
                  user: input.user,
                  ledgerId: input.ledgerId,
                  storeShiftId: input.storeShiftId,
                  accessToken: input.storeAccessToken,
                  touchActivity: true,
            });

            const orderDate = ensureDate(
                  input.orderDate,
                  "Ngày đặt hàng không hợp lệ.",
            );
            const requestedDate = ensureDate(
                  input.requestedDate,
                  "Ngày nhận hoặc giao hàng không hợp lệ.",
            );

            if (requestedDate < orderDate) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Ngày cần nhận/giao không được trước ngày đặt.",
                  });
            }

            if (!input.customerName?.trim()) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Vui lòng nhập tên khách hàng.",
                  });
            }

            const phone = input.customerPhone?.trim();
            if (!/^[0-9+][0-9 .-]{7,19}$/.test(phone || "")) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Số điện thoại không hợp lệ.",
                  });
            }

            if (
                  input.fulfillmentType === "delivery" &&
                  !input.deliveryAddress?.trim()
            ) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Vui lòng nhập địa chỉ giao hàng.",
                  });
            }

            if (!input.lines?.length) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Đơn đặt trước phải có ít nhất một mặt hàng.",
                  });
            }

            const prepared: any[] = [];
            for (const line of input.lines) {
                  const product = await storeDb.getStoreProductById(
                        Number(line.productId),
                  );
                  if (!product || !product.isActive) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: "Có hàng hóa không hợp lệ hoặc đã ngừng kinh doanh.",
                        });
                  }

                  const quantity = money(line.quantity);
                  const unitPrice = money(line.unitPrice);
                  if (quantity <= 0 || unitPrice <= 0) {
                        throw new TRPCError({
                              code: "BAD_REQUEST",
                              message: "Số lượng và đơn giá phải lớn hơn 0.",
                        });
                  }

                  prepared.push({
                        productId: Number(product.id),
                        quantity,
                        unitPrice,
                        lineAmount: money(quantity * unitPrice),
                        notes: line.notes?.trim() || null,
                  });
            }

            const totalAmount = money(
                  prepared.reduce((sum, item) => sum + item.lineAmount, 0),
            );
            const depositAmount = money(input.depositAmount);
            if (depositAmount > totalAmount) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Tiền cọc không được lớn hơn tổng giá trị đơn.",
                  });
            }

            const orderCode = `DH-${orderDate.replace(/-/g, "")}-${Date.now()
                  .toString()
                  .slice(-6)}`;

            const db = await dbOrThrow();
            const headerResult: any = await db.execute(sql`
                  INSERT INTO storePreorders (
                        ledgerId,
                        storeShiftId,
                        orderCode,
                        orderDate,
                        customerName,
                        customerPhone,
                        deliveryAddress,
                        fulfillmentType,
                        requestedDate,
                        depositAmount,
                        totalAmount,
                        status,
                        notes
                  ) VALUES (
                        ${input.ledgerId},
                        ${input.storeShiftId},
                        ${orderCode},
                        ${orderDate},
                        ${input.customerName.trim()},
                        ${phone},
                        ${
                              input.fulfillmentType === "delivery"
                                    ? input.deliveryAddress?.trim() || null
                                    : null
                        },
                        ${input.fulfillmentType},
                        ${requestedDate},
                        ${depositAmount.toFixed(2)},
                        ${totalAmount.toFixed(2)},
                        'pending',
                        ${input.notes?.trim() || null}
                  )
            `);

            const preorderId = insertIdOf(headerResult);
            if (!preorderId) {
                  throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "Không thể tạo đơn đặt trước.",
                  });
            }

            for (let index = 0; index < prepared.length; index += 1) {
                  const item = prepared[index];
                  await db.execute(sql`
                        INSERT INTO storePreorderLines (
                              preorderId,
                              productId,
                              lineNo,
                              quantity,
                              unitPrice,
                              lineAmount,
                              notes
                        ) VALUES (
                              ${preorderId},
                              ${item.productId},
                              ${index + 1},
                              ${item.quantity.toFixed(2)},
                              ${item.unitPrice.toFixed(2)},
                              ${item.lineAmount.toFixed(2)},
                              ${item.notes}
                        )
                  `);
            }

            return getPreorder(preorderId);
      },

      async updateStatus(input: {
            user: any;
            id: number;
            storeShiftId?: number | null;
            storeAccessToken?: string | null;
            status:
                  | "pending"
                  | "confirmed"
                  | "preparing"
                  | "ready"
                  | "cancelled";
      }) {
            const preorder = await getPreorder(input.id);
            if (!preorder) {
                  throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Không tìm thấy đơn đặt trước.",
                  });
            }

            await storeDutyAccessService.authorizeStoreAction({
                  user: input.user,
                  ledgerId: Number(preorder.ledgerId),
                  storeShiftId: input.storeShiftId,
                  accessToken: input.storeAccessToken,
                  touchActivity: true,
            });

            if (["completed", "cancelled"].includes(String(preorder.status))) {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Đơn đã hoàn tất hoặc đã hủy.",
                  });
            }

            const db = await dbOrThrow();
            await db.execute(sql`
                  UPDATE storePreorders
                  SET status = ${input.status}
                  WHERE id = ${input.id}
            `);

            return getPreorder(input.id);
      },

      async complete(input: {
            user: any;
            id: number;
            storeShiftId: number;
            storeAccessToken?: string | null;
            completionDate: string;
            paymentMethod?: string | null;
      }) {
            const preorder = await getPreorder(input.id);
            if (!preorder) {
                  throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Không tìm thấy đơn đặt trước.",
                  });
            }

            await storeDutyAccessService.authorizeStoreAction({
                  user: input.user,
                  ledgerId: Number(preorder.ledgerId),
                  storeShiftId: input.storeShiftId,
                  accessToken: input.storeAccessToken,
                  touchActivity: true,
            });

            if (String(preorder.status) === "completed") {
                  return preorder;
            }
            if (String(preorder.status) === "cancelled") {
                  throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Đơn đã hủy, không thể giao hàng.",
                  });
            }

            const document = await storeLedgerService.createSaleDocument({
                  ledgerId: Number(preorder.ledgerId),
                  documentDate: ensureDate(
                        input.completionDate,
                        "Ngày giao hàng không hợp lệ.",
                  ),
                  partnerName: preorder.customerName,
                  paymentMethod: input.paymentMethod || "cash",
                  notes: [
                        `Đơn đặt trước ${preorder.orderCode}`,
                        preorder.customerPhone,
                        preorder.deliveryAddress,
                        preorder.notes,
                  ]
                        .filter(Boolean)
                        .join(" · "),
                  lines: preorder.lines.map((line: any) => ({
                        productId: Number(line.productId),
                        quantity: Number(line.quantity),
                        unitPrice: Number(line.unitPrice),
                        notes: line.notes,
                  })),
                  createdBy: null,
            });

            const documentId = Number((document as any)?.id || 0);
            const db = await dbOrThrow();
            await db.execute(sql`
                  UPDATE storePreorders
                  SET
                        status = 'completed',
                        saleDocumentId = ${documentId || null},
                        completedAt = CURRENT_TIMESTAMP
                  WHERE id = ${input.id}
            `);

            return getPreorder(input.id);
      },
};
