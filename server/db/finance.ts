import { sql } from 'drizzle-orm';
import { getDb } from './connection';

type ListChargesInput = {
      search?: string;
      status?: string;
      residentId?: number;
      limit?: number;
      offset?: number;
};

type CreateChargeBatchInput = {
      feeTypeId: number;
      residentIds: number[];
      amount: number;
      dueDate?: string | null;
      billingMonth?: string | null;
      periodStartDate?: string | null;
      periodEndDate?: string | null;
      periodChargeMode?: string | null;
      periodMultiplier?: number | null;
      description?: string | null;
      createdBy?: number | null;
};

type UpdateChargeInput = {
      id: number;
      feeTypeId?: number | null;
      amount?: number | null;
      dueDate?: string | null;
      billingMonth?: string | null;
      periodStartDate?: string | null;
      periodEndDate?: string | null;
      periodChargeMode?: string | null;
      periodMultiplier?: number | null;
      status?: string | null;
      targetName?: string | null;
      description?: string | null;
};

type RecordPaymentInput = {
      chargeId: number;
      residentId: number;
      amount: number;
      paymentDate?: string | null;
      method?: string | null;
      note?: string | null;
      createdBy?: number | null;
};

function todayText() {
      const date = new Date();

      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
            date.getDate()
      ).padStart(2, '0')}`;
}

function getRows(result: any) {
      if (Array.isArray(result)) {
            if (Array.isArray(result[0])) return result[0];
            return result;
      }

      return result?.rows || [];
}

function normalizeNullableText(value?: string | null) {
      const text = String(value || '').trim();
      return text.length > 0 ? text : null;
}

function formatDuplicateChargeMessage(rows: any[]) {
      const names = rows
            .map((item) => item.residentName || item.residentCode || `Học viên #${item.residentId}`)
            .filter(Boolean);
      const preview = names.slice(0, 5).join(', ');
      const moreText = names.length > 5 ? ` và ${names.length - 5} học viên khác` : '';

      return `Khoản thu này đã tồn tại cùng loại phí, cùng kỳ thu cho ${preview}${moreText}. Vui lòng sửa khoản đã có hoặc hủy khoản cũ trước khi tạo lại.`;
}

async function findDuplicateFinanceCharges(
      db: any,
      input: {
            residentIds: number[];
            feeTypeId?: number | null;
            billingMonth?: string | null;
            periodStartDate?: string | null;
            periodEndDate?: string | null;
            excludeId?: number | null;
      }
) {
      const residentIds = input.residentIds.map((id) => Number(id)).filter(Boolean);
      const feeTypeId = Number(input.feeTypeId || 0);
      const billingMonth = normalizeNullableText(input.billingMonth);
      const periodStartDate = normalizeNullableText(input.periodStartDate);
      const periodEndDate = normalizeNullableText(input.periodEndDate);

      if (residentIds.length === 0 || !feeTypeId) {
            return [];
      }

      const duplicates: any[] = [];

      for (const residentId of residentIds) {
            const periodClause = billingMonth
                  ? sql`c.billing_month = ${billingMonth}`
                  : sql`(
                              (c.billing_month IS NULL OR c.billing_month = '')
                              AND (c.period_start_date <=> ${periodStartDate})
                              AND (c.period_end_date <=> ${periodEndDate})
                        )`;
            const excludeClause = input.excludeId ? sql`AND c.id <> ${Number(input.excludeId)}` : sql``;

            const result = await db.execute(sql`
                  SELECT
                        c.id,
                        c.resident_id AS residentId,
                        c.fee_type_id AS feeTypeId,
                        c.billing_month AS billingMonth,
                        c.period_start_date AS periodStartDate,
                        c.period_end_date AS periodEndDate,
                        c.status,
                        r.fullName AS residentName,
                        r.residentCode AS residentCode
                  FROM finance_charges c
                  LEFT JOIN residents r ON r.id = c.resident_id
                  WHERE c.resident_id = ${residentId}
                        AND c.fee_type_id = ${feeTypeId}
                        AND c.status <> 'cancelled'
                        AND ${periodClause}
                        ${excludeClause}
                  LIMIT 1
            `);

            const rows = getRows(result);
            if (rows?.[0]) {
                  duplicates.push(rows[0]);
            }
      }

      return duplicates;
}

let financeSchemaReady = false;

async function columnExists(db: any, tableName: string, columnName: string) {
      const result = await db.execute(sql`
            SELECT COUNT(*) AS countValue
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ${tableName}
                  AND COLUMN_NAME = ${columnName}
      `);
      const rows = getRows(result);
      return Number(rows?.[0]?.countValue || rows?.[0]?.COUNT_VALUE || rows?.[0]?.['COUNT(*)'] || 0) > 0;
}

async function ensureFinanceSchema(db: any) {
      if (financeSchemaReady) return;

      await db.execute(sql`
            CREATE TABLE IF NOT EXISTS finance_fee_types (
                  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                  fee_code VARCHAR(50) NOT NULL UNIQUE,
                  fee_name VARCHAR(255) NOT NULL,
                  default_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
                  cycle VARCHAR(40) NOT NULL DEFAULT 'monthly',
                  is_active TINYINT(1) NOT NULL DEFAULT 1,
                  sort_order INT NOT NULL DEFAULT 10,
                  description TEXT NULL,
                  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
      `);

      await db.execute(sql`
            CREATE TABLE IF NOT EXISTS finance_charges (
                  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                  charge_code VARCHAR(100) NOT NULL UNIQUE,
                  resident_id INT NOT NULL,
                  fee_type_id INT NULL,
                  amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
                  paid_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
                  remaining_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
                  due_date DATE NULL,
                  status VARCHAR(40) NOT NULL DEFAULT 'open',
                  source VARCHAR(60) NOT NULL DEFAULT 'student_fee',
                  fee_mode VARCHAR(60) NULL,
                  target_type VARCHAR(60) NULL,
                  target_name VARCHAR(255) NULL,
                  billing_month VARCHAR(7) NULL,
                  period_start_date DATE NULL,
                  period_end_date DATE NULL,
                  period_charge_mode VARCHAR(40) NULL,
                  period_multiplier DECIMAL(10, 2) NOT NULL DEFAULT 1,
                  description TEXT NULL,
                  created_by INT NULL,
                  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_finance_charges_resident (resident_id),
                  INDEX idx_finance_charges_status (status),
                  INDEX idx_finance_charges_period (resident_id, fee_type_id, billing_month, period_start_date, period_end_date)
            )
      `);

      await db.execute(sql`
            CREATE TABLE IF NOT EXISTS finance_payments (
                  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                  charge_id INT NOT NULL,
                  resident_id INT NOT NULL,
                  amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
                  payment_date DATE NOT NULL,
                  method VARCHAR(40) NOT NULL DEFAULT 'cash',
                  note TEXT NULL,
                  created_by INT NULL,
                  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_finance_payments_charge (charge_id),
                  INDEX idx_finance_payments_resident (resident_id)
            )
      `);

      await db.execute(sql`
            CREATE TABLE IF NOT EXISTS finance_transactions (
                  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                  source VARCHAR(60) NOT NULL,
                  direction VARCHAR(20) NOT NULL,
                  amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
                  transaction_date DATE NOT NULL,
                  target_type VARCHAR(60) NULL,
                  target_name VARCHAR(255) NULL,
                  description TEXT NULL,
                  created_by INT NULL,
                  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_finance_transactions_date (transaction_date),
                  INDEX idx_finance_transactions_source (source, direction)
            )
      `);

      const chargeColumns = [
            ['billing_month', "ALTER TABLE finance_charges ADD COLUMN billing_month VARCHAR(7) NULL AFTER target_name"],
            ['period_start_date', "ALTER TABLE finance_charges ADD COLUMN period_start_date DATE NULL AFTER billing_month"],
            ['period_end_date', "ALTER TABLE finance_charges ADD COLUMN period_end_date DATE NULL AFTER period_start_date"],
            ['period_charge_mode', "ALTER TABLE finance_charges ADD COLUMN period_charge_mode VARCHAR(40) NULL AFTER period_end_date"],
            ['period_multiplier', "ALTER TABLE finance_charges ADD COLUMN period_multiplier DECIMAL(10, 2) NOT NULL DEFAULT 1 AFTER period_charge_mode"],
      ] as const;

      for (const [columnName, alterSql] of chargeColumns) {
            if (!(await columnExists(db, 'finance_charges', columnName))) {
                  await db.execute(sql.raw(alterSql));
            }
      }

      const feeTypesResult = await db.execute(sql`SELECT COUNT(*) AS countValue FROM finance_fee_types`);
      const feeTypeRows = getRows(feeTypesResult);
      const feeTypeCount = Number(feeTypeRows?.[0]?.countValue || 0);

      if (feeTypeCount === 0) {
            await db.execute(sql`
                  INSERT INTO finance_fee_types (fee_code, fee_name, default_amount, cycle, is_active, sort_order, description)
                  VALUES
                        ('monthly_boarding_fee', 'Phí lưu trú hằng tháng', 0, 'monthly', 1, 10, 'Khoản phí lưu trú theo tháng'),
                        ('electric_water_fee', 'Điện nước', 0, 'monthly', 1, 20, 'Khoản thu điện nước'),
                        ('activity_fee', 'Sinh hoạt chung', 0, 'monthly', 1, 30, 'Khoản thu sinh hoạt chung'),
                        ('other_student_fee', 'Khoản thu khác của học viên', 0, 'once', 1, 90, 'Khoản thu phát sinh')
            `);
      }

      financeSchemaReady = true;
}

async function getFinanceDb() {
      const db = await getDb();
      await ensureFinanceSchema(db);
      return db;
}

export async function listFinanceFeeTypes(filters?: { isActive?: boolean }) {
      const db = await getFinanceDb();

      const activeClause = filters?.isActive === undefined
            ? sql`1 = 1`
            : sql`is_active = ${filters.isActive ? 1 : 0}`;

      const result = await db.execute(sql`
            SELECT
                  id,
                  fee_code AS feeCode,
                  fee_name AS feeName,
                  fee_name AS name,
                  default_amount AS defaultAmount,
                  cycle,
                  is_active AS isActive,
                  description
            FROM finance_fee_types
            WHERE ${activeClause}
            ORDER BY sort_order ASC, fee_name ASC
      `);

      return getRows(result);
}

export async function createFinanceFeeType(data: {
      feeCode: string;
      feeName: string;
      defaultAmount?: number | null;
      cycle?: string | null;
      description?: string | null;
}) {
      const db = await getFinanceDb();

      await db.execute(sql`
            INSERT INTO finance_fee_types (
                  fee_code,
                  fee_name,
                  default_amount,
                  cycle,
                  description,
                  is_active,
                  sort_order,
                  created_at,
                  updated_at
            )
            VALUES (
                  ${data.feeCode},
                  ${data.feeName},
                  ${Number(data.defaultAmount || 0)},
                  ${data.cycle || 'monthly'},
                  ${data.description || null},
                  1,
                  10,
                  NOW(),
                  NOW()
            )
      `);

      return { success: true };
}

export async function listFinanceCharges(input: ListChargesInput = {}) {
      const db = await getFinanceDb();

      const searchValue = `%${input.search || ''}%`;
      const limit = Number(input.limit || 100);
      const offset = Number(input.offset || 0);

      const statusClause = input.status ? sql`AND c.status = ${input.status}` : sql``;
      const residentClause = input.residentId ? sql`AND c.resident_id = ${input.residentId}` : sql``;
      const searchClause = input.search
            ? sql`AND (
                  r.fullName LIKE ${searchValue}
                  OR r.residentCode LIKE ${searchValue}
                  OR ft.fee_name LIKE ${searchValue}
                  OR c.charge_code LIKE ${searchValue}
            )`
            : sql``;

      const result = await db.execute(sql`
            SELECT
                  c.id,
                  c.charge_code AS chargeCode,
                  c.resident_id AS residentId,
                  c.fee_type_id AS feeTypeId,
                  c.amount,
                  c.paid_amount AS paidAmount,
                  c.remaining_amount AS remainingAmount,
                  c.due_date AS dueDate,
                  c.status,
                  c.source,
                  c.fee_mode AS feeMode,
                  c.target_type AS targetType,
                  c.target_name AS targetName,
                  c.billing_month AS billingMonth,
                  c.period_start_date AS periodStartDate,
                  c.period_end_date AS periodEndDate,
                  c.period_charge_mode AS periodChargeMode,
                  c.period_multiplier AS periodMultiplier,
                  c.description,
                  c.created_at AS createdAt,
                  r.fullName AS residentName,
                  r.residentCode AS residentCode,
                  ft.fee_name AS feeName,
                  ft.fee_name AS feeTypeName
            FROM finance_charges c
            LEFT JOIN residents r ON r.id = c.resident_id
            LEFT JOIN finance_fee_types ft ON ft.id = c.fee_type_id
            WHERE 1 = 1
                  ${statusClause}
                  ${residentClause}
                  ${searchClause}
            ORDER BY c.due_date DESC, c.id DESC
            LIMIT ${limit}
            OFFSET ${offset}
      `);

      return getRows(result);
}

export async function createFinanceChargeBatch(input: CreateChargeBatchInput) {
      const db = await getFinanceDb();

      const residentIds = input.residentIds.map((id) => Number(id)).filter(Boolean);
      const duplicateRows = await findDuplicateFinanceCharges(db, {
            residentIds,
            feeTypeId: input.feeTypeId,
            billingMonth: input.billingMonth,
            periodStartDate: input.periodStartDate,
            periodEndDate: input.periodEndDate,
      });

      if (duplicateRows.length > 0) {
            throw new Error(formatDuplicateChargeMessage(duplicateRows));
      }

      const created: number[] = [];

      for (const residentId of residentIds) {
            const chargeCode = `RC-FEE-${residentId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            await db.execute(sql`
                  INSERT INTO finance_charges (
                        charge_code,
                        resident_id,
                        fee_type_id,
                        amount,
                        paid_amount,
                        remaining_amount,
                        due_date,
                        status,
                        source,
                        fee_mode,
                        target_type,
                        target_name,
                        billing_month,
                        period_start_date,
                        period_end_date,
                        period_charge_mode,
                        period_multiplier,
                        description,
                        created_by,
                        created_at,
                        updated_at
                  )
                  VALUES (
                        ${chargeCode},
                        ${residentId},
                        ${input.feeTypeId},
                        ${Number(input.amount || 0)},
                        0,
                        ${Number(input.amount || 0)},
                        ${input.dueDate || null},
                        'open',
                        ${(input as any).source || 'student_fee'},
                        ${(input as any).feeMode || null},
                        ${(input as any).targetType || null},
                        ${(input as any).targetName || null},
                        ${input.billingMonth || null},
                        ${input.periodStartDate || null},
                        ${input.periodEndDate || null},
                        ${input.periodChargeMode || null},
                        ${Number(input.periodMultiplier || 1)},
                        ${input.description || null},
                        ${input.createdBy || null},
                        NOW(),
                        NOW()
                  )
            `);

            created.push(residentId);
      }

      return { success: true, createdCount: created.length };
}


export async function updateFinanceCharge(input: UpdateChargeInput) {
      const db = await getFinanceDb();
      const amount = Number(input.amount || 0);

      if (!input.id) {
            throw new Error('Thiếu mã khoản phải thu.');
      }

      if (amount <= 0) {
            throw new Error('Số tiền khoản thu phải lớn hơn 0.');
      }

      const currentResult = await db.execute(sql`
            SELECT
                  id,
                  resident_id AS residentId,
                  fee_type_id AS feeTypeId,
                  billing_month AS billingMonth,
                  period_start_date AS periodStartDate,
                  period_end_date AS periodEndDate,
                  paid_amount AS paidAmount
            FROM finance_charges
            WHERE id = ${input.id}
            LIMIT 1
      `);
      const currentRows = getRows(currentResult);
      const currentCharge = currentRows?.[0];

      if (!currentCharge) {
            throw new Error('Không tìm thấy khoản phải thu.');
      }

      const nextFeeTypeId = input.feeTypeId === undefined ? currentCharge.feeTypeId : input.feeTypeId;
      const nextBillingMonth = input.billingMonth === undefined ? currentCharge.billingMonth : input.billingMonth;
      const nextPeriodStartDate = input.periodStartDate === undefined ? currentCharge.periodStartDate : input.periodStartDate;
      const nextPeriodEndDate = input.periodEndDate === undefined ? currentCharge.periodEndDate : input.periodEndDate;
      const duplicateRows = await findDuplicateFinanceCharges(db, {
            residentIds: [Number(currentCharge.residentId)],
            feeTypeId: Number(nextFeeTypeId || 0),
            billingMonth: nextBillingMonth || null,
            periodStartDate: nextPeriodStartDate || null,
            periodEndDate: nextPeriodEndDate || null,
            excludeId: input.id,
      });

      if (duplicateRows.length > 0) {
            throw new Error(formatDuplicateChargeMessage(duplicateRows));
      }

      const paidAmount = Number(currentCharge.paidAmount || 0);
      const baseRemainingAmount = Math.max(amount - paidAmount, 0);
      const resolvedStatus = input.status === 'cancelled'
            ? 'cancelled'
            : input.status === 'paid'
                  ? 'paid'
                  : paidAmount <= 0
                        ? 'open'
                        : baseRemainingAmount <= 0
                              ? 'paid'
                              : 'partial';
      const remainingAmount = resolvedStatus === 'cancelled' || resolvedStatus === 'paid'
            ? 0
            : baseRemainingAmount;

      await db.execute(sql`
            UPDATE finance_charges
            SET
                  fee_type_id = ${input.feeTypeId || null},
                  amount = ${amount},
                  remaining_amount = ${remainingAmount},
                  due_date = ${input.dueDate || null},
                  status = ${resolvedStatus},
                  target_name = ${input.targetName || null},
                  billing_month = ${input.billingMonth || null},
                  period_start_date = ${input.periodStartDate || null},
                  period_end_date = ${input.periodEndDate || null},
                  period_charge_mode = ${input.periodChargeMode || null},
                  period_multiplier = ${Number(input.periodMultiplier || 1)},
                  description = ${input.description || null},
                  updated_at = NOW()
            WHERE id = ${input.id}
      `);

      return { success: true };
}


export async function recordFinancePayment(input: RecordPaymentInput) {
      const db = await getFinanceDb();

      const paymentDate = input.paymentDate || todayText();
      const amount = Number(input.amount || 0);

      if (!input.chargeId) {
            throw new Error('Vui lòng chọn khoản phải thu.');
      }

      if (amount <= 0) {
            throw new Error('Số tiền thu phải lớn hơn 0.');
      }

      const chargeResult = await db.execute(sql`
            SELECT
                  c.id,
                  c.resident_id AS residentId,
                  c.amount,
                  c.paid_amount AS paidAmount,
                  c.remaining_amount AS remainingAmount,
                  c.status,
                  c.target_name AS targetName,
                  r.fullName AS residentName,
                  ft.fee_name AS feeName
            FROM finance_charges c
            LEFT JOIN residents r ON r.id = c.resident_id
            LEFT JOIN finance_fee_types ft ON ft.id = c.fee_type_id
            WHERE c.id = ${input.chargeId}
            LIMIT 1
      `);
      const chargeRows = getRows(chargeResult);
      const charge = chargeRows?.[0];

      if (!charge) {
            throw new Error('Không tìm thấy khoản phải thu.');
      }

      if (charge.status === 'cancelled') {
            throw new Error('Khoản thu đã hủy, không thể ghi nhận thanh toán.');
      }

      if (charge.status === 'paid') {
            throw new Error('Khoản thu đã thu đủ.');
      }

      const remainingAmount = Number(charge.remainingAmount || 0);

      if (remainingAmount <= 0) {
            throw new Error('Khoản thu không còn số tiền phải thu.');
      }

      if (amount > remainingAmount) {
            throw new Error(`Số tiền thu không được lớn hơn số tiền còn lại (${remainingAmount}).`);
      }

      const residentId = Number(input.residentId || charge.residentId || 0);

      if (!residentId) {
            throw new Error('Khoản thu chưa có học viên hợp lệ.');
      }

      await db.execute(sql`
            INSERT INTO finance_payments (
                  charge_id,
                  resident_id,
                  amount,
                  payment_date,
                  method,
                  note,
                  created_by,
                  created_at,
                  updated_at
            )
            VALUES (
                  ${input.chargeId},
                  ${residentId},
                  ${amount},
                  ${paymentDate},
                  ${input.method || 'cash'},
                  ${input.note || null},
                  ${input.createdBy || null},
                  NOW(),
                  NOW()
            )
      `);

      await db.execute(sql`
            UPDATE finance_charges
            SET
                  paid_amount = paid_amount + ${amount},
                  remaining_amount = GREATEST(finance_charges.amount - (paid_amount + ${amount}), 0),
                  status = CASE
                        WHEN GREATEST(finance_charges.amount - (paid_amount + ${amount}), 0) <= 0 THEN 'paid'
                        WHEN (paid_amount + ${amount}) > 0 THEN 'partial'
                        ELSE 'open'
                  END,
                  updated_at = NOW()
            WHERE id = ${input.chargeId}
      `);

      await db.execute(sql`
            INSERT INTO finance_transactions (
                  source,
                  direction,
                  amount,
                  transaction_date,
                  target_type,
                  target_name,
                  description,
                  created_by,
                  created_at,
                  updated_at
            )
            VALUES (
                  'student_fee_payment',
                  'in',
                  ${amount},
                  ${paymentDate},
                  'resident',
                  ${charge.residentName || charge.targetName || 'Học viên'},
                  ${input.note || `Thu ${charge.feeName || 'khoản học viên'}`},
                  ${input.createdBy || null},
                  NOW(),
                  NOW()
            )
      `);

      return { success: true };
}


export async function cancelFinanceCharge(input: { id: number; reason?: string | null }) {
      const db = await getFinanceDb();

      if (!input.id) {
            throw new Error('Thiếu mã khoản phải thu cần hủy.');
      }

      const currentResult = await db.execute(sql`
            SELECT
                  id,
                  paid_amount AS paidAmount,
                  status
            FROM finance_charges
            WHERE id = ${input.id}
            LIMIT 1
      `);
      const currentRows = getRows(currentResult);
      const currentCharge = currentRows?.[0];

      if (!currentCharge) {
            throw new Error('Không tìm thấy khoản phải thu.');
      }

      if (currentCharge.status === 'cancelled') {
            throw new Error('Khoản thu này đã được hủy trước đó.');
      }

      if (Number(currentCharge.paidAmount || 0) > 0) {
            throw new Error('Khoản thu đã phát sinh thanh toán, không nên hủy trực tiếp.');
      }

      await db.execute(sql`
            UPDATE finance_charges
            SET
                  remaining_amount = 0,
                  status = 'cancelled',
                  description = CASE
                        WHEN ${input.reason || null} IS NULL OR ${input.reason || null} = '' THEN description
                        WHEN description IS NULL OR description = '' THEN ${input.reason || null}
                        ELSE CONCAT(description, ' | Hủy: ', ${input.reason || null})
                  END,
                  updated_at = NOW()
            WHERE id = ${input.id}
      `);

      return { success: true };
}


export async function listFinanceTransactions(input: {
      search?: string;
      source?: string;
      direction?: string;
      limit?: number;
      offset?: number;
} = {}) {
      const db = await getFinanceDb();

      const searchValue = `%${input.search || ''}%`;
      const limit = Number(input.limit || 100);
      const offset = Number(input.offset || 0);
      const sourceClause = input.source ? sql`AND source = ${input.source}` : sql``;
      const directionClause = input.direction ? sql`AND direction = ${input.direction}` : sql``;
      const searchClause = input.search
            ? sql`AND (
                  target_name LIKE ${searchValue}
                  OR target_type LIKE ${searchValue}
                  OR description LIKE ${searchValue}
            )`
            : sql``;

      const result = await db.execute(sql`
            SELECT
                  id,
                  source,
                  direction,
                  amount,
                  transaction_date AS transactionDate,
                  target_type AS targetType,
                  target_name AS targetName,
                  description,
                  created_by AS createdBy,
                  created_at AS createdAt
            FROM finance_transactions
            WHERE 1 = 1
                  ${sourceClause}
                  ${directionClause}
                  ${searchClause}
            ORDER BY transaction_date DESC, id DESC
            LIMIT ${limit}
            OFFSET ${offset}
      `);

      return getRows(result);
}

export async function createFinanceTransaction(input: {
      source: string;
      direction: string;
      amount: number;
      transactionDate?: string | null;
      targetType?: string | null;
      targetName?: string | null;
      description?: string | null;
      createdBy?: number | null;
}) {
      const db = await getFinanceDb();

      await db.execute(sql`
            INSERT INTO finance_transactions (
                  source,
                  direction,
                  amount,
                  transaction_date,
                  target_type,
                  target_name,
                  description,
                  created_by,
                  created_at,
                  updated_at
            )
            VALUES (
                  ${input.source},
                  ${input.direction},
                  ${Number(input.amount || 0)},
                  ${input.transactionDate || todayText()},
                  ${input.targetType || null},
                  ${input.targetName || null},
                  ${input.description || null},
                  ${input.createdBy || null},
                  NOW(),
                  NOW()
            )
      `);

      return { success: true };
}


export async function getFinanceSummary() {
      const db = await getFinanceDb();

      const result = await db.execute(sql`
            SELECT
                  COALESCE(SUM(CASE WHEN status IN ('open', 'partial') THEN remaining_amount ELSE 0 END), 0) AS totalOpenAmount,
                  COALESCE(SUM(paid_amount), 0) AS totalPaidAmount,
                  COALESCE(SUM(CASE WHEN status IN ('open', 'partial') THEN 1 ELSE 0 END), 0) AS openChargeCount,
                  COALESCE(SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END), 0) AS paidChargeCount
            FROM finance_charges
      `);

      const rows = getRows(result);
      const baseSummary = rows[0] || {
            totalOpenAmount: 0,
            totalPaidAmount: 0,
            openChargeCount: 0,
            paidChargeCount: 0,
      };

      const transactionSummaryResult = await db.execute(sql`
            SELECT
                  COALESCE(SUM(CASE WHEN direction = 'in' THEN amount ELSE 0 END), 0) AS totalCashIn,
                  COALESCE(SUM(CASE WHEN direction = 'out' THEN amount ELSE 0 END), 0) AS totalCashOut
            FROM finance_transactions
      `);

      const transactionRows = getRows(transactionSummaryResult);
      const transactionSummary = transactionRows[0] || {
            totalCashIn: 0,
            totalCashOut: 0,
      };

      return {
            ...baseSummary,
            ...transactionSummary,
      };
}
