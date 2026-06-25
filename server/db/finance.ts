import { sql } from 'drizzle-orm';
import { getDb } from './connection';

type ListChargesInput = {
      search?: string;
      status?: string;
      residentId?: number;
      periodId?: number;
      billingMonth?: string;
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
      source?: string | null;
      feeMode?: string | null;
      targetType?: string | null;
      targetName?: string | null;
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
      residentId?: number | null;
      amount: number;
      paymentDate?: string | null;
      method?: string | null;
      note?: string | null;
      createdBy?: number | null;
};

type CreateChargePeriodInput = {
      periodName: string;
      year: number;
      fromMonth: number;
      toMonth: number;
      lodgingAmount: number;
      mealLivingAmount: number;
      otherAmount: number;
      description?: string | null;
      createdBy?: number | null;
};

type UpdateChargePeriodInput = CreateChargePeriodInput & {
      id: number;
      status?: string | null;
};

type ApplyChargePeriodInput = {
      periodId: number;
      billingMonth: string;
      lines: Array<{
            residentId: number;
            items: Array<{
                  periodItemId: number;
                  selected: boolean;
                  amount?: number | null;
            }>;
      }>;
      createdBy?: number | null;
};

function todayText() {
      const date = new Date();

      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
            date.getDate()
      ).padStart(2, '0')}`;
}

function monthStart(monthValue?: string | null) {
      if (!monthValue) return null;
      return `${monthValue}-01`;
}

function monthEnd(monthValue?: string | null) {
      if (!monthValue) return null;
      const [yearText, monthText] = monthValue.split('-');
      const year = Number(yearText);
      const month = Number(monthText);
      if (!year || !month) return null;
      return new Date(year, month, 0).toISOString().slice(0, 10);
}

function periodCode(year: number, fromMonth: number, toMonth: number) {
      return `PERIOD-${year}-${String(fromMonth).padStart(2, '0')}-${String(toMonth).padStart(2, '0')}-${Date.now()}`;
}

function chargeCode(residentId: number, feeTypeId: number | null, billingMonth?: string | null) {
      return `RC-FEE-${residentId}-${feeTypeId || 'X'}-${billingMonth || 'NA'}-${Date.now()}-${Math.floor(
            Math.random() * 10000
      )}`;
}

function getRows(result: any) {
      if (Array.isArray(result)) {
            if (Array.isArray(result[0])) return result[0];
            return result;
      }

      return result?.rows || [];
}

function getFirstId(result: any) {
      const rows = getRows(result);
      return Number(rows?.[0]?.id || rows?.[0]?.insertId || 0);
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

async function ensureColumn(db: any, tableName: string, columnName: string, alterSql: string) {
      if (!(await columnExists(db, tableName, columnName))) {
            await db.execute(sql.raw(alterSql));
      }
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
            CREATE TABLE IF NOT EXISTS finance_charge_periods (
                  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                  period_code VARCHAR(100) NOT NULL UNIQUE,
                  period_name VARCHAR(255) NOT NULL,
                  year INT NOT NULL,
                  from_month INT NOT NULL DEFAULT 1,
                  to_month INT NOT NULL DEFAULT 12,
                  status VARCHAR(40) NOT NULL DEFAULT 'draft',
                  description TEXT NULL,
                  created_by INT NULL,
                  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_finance_charge_periods_year (year),
                  INDEX idx_finance_charge_periods_status (status)
            )
      `);

      await db.execute(sql`
            CREATE TABLE IF NOT EXISTS finance_charge_period_items (
                  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                  period_id INT NOT NULL,
                  fee_type_id INT NULL,
                  fee_type_code VARCHAR(50) NOT NULL,
                  fee_type_name VARCHAR(255) NOT NULL,
                  amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
                  is_default_checked TINYINT(1) NOT NULL DEFAULT 0,
                  sort_order INT NOT NULL DEFAULT 10,
                  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_finance_period_items_period (period_id),
                  INDEX idx_finance_period_items_fee_type (fee_type_id)
            )
      `);

      await db.execute(sql`
            CREATE TABLE IF NOT EXISTS finance_charges (
                  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                  charge_code VARCHAR(100) NOT NULL UNIQUE,
                  resident_id INT NOT NULL,
                  fee_type_id INT NULL,
                  period_id INT NULL,
                  period_item_id INT NULL,
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
                  INDEX idx_finance_charges_period (resident_id, fee_type_id, billing_month, period_start_date, period_end_date),
                  INDEX idx_finance_charges_charge_period (period_id, period_item_id)
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
            ['period_id', 'ALTER TABLE finance_charges ADD COLUMN period_id INT NULL AFTER fee_type_id'],
            ['period_item_id', 'ALTER TABLE finance_charges ADD COLUMN period_item_id INT NULL AFTER period_id'],
            ['billing_month', 'ALTER TABLE finance_charges ADD COLUMN billing_month VARCHAR(7) NULL AFTER target_name'],
            ['period_start_date', 'ALTER TABLE finance_charges ADD COLUMN period_start_date DATE NULL AFTER billing_month'],
            ['period_end_date', 'ALTER TABLE finance_charges ADD COLUMN period_end_date DATE NULL AFTER period_start_date'],
            ['period_charge_mode', 'ALTER TABLE finance_charges ADD COLUMN period_charge_mode VARCHAR(40) NULL AFTER period_end_date'],
            ['period_multiplier', 'ALTER TABLE finance_charges ADD COLUMN period_multiplier DECIMAL(10, 2) NOT NULL DEFAULT 1 AFTER period_charge_mode'],
      ] as const;

      for (const [columnName, alterSql] of chargeColumns) {
            await ensureColumn(db, 'finance_charges', columnName, alterSql);
      }

      await ensureDefaultFeeType(db, 'lodging_fee', 'Phí lưu trú', 1200000, 'monthly', 10);
      await ensureDefaultFeeType(db, 'meal_living_fee', 'Ăn uống sinh hoạt', 1800000, 'monthly', 20);
      await ensureDefaultFeeType(db, 'other_student_fee', 'Khoản thu khác của học viên', 500000, 'monthly', 30);

      financeSchemaReady = true;
}

async function getFinanceDb() {
      const db = await getDb();
      await ensureFinanceSchema(db);
      return db;
}

async function ensureDefaultFeeType(
      db: any,
      feeCode: string,
      feeName: string,
      defaultAmount: number,
      cycle: string,
      sortOrder: number
) {
      const existingResult = await db.execute(sql`
            SELECT id
            FROM finance_fee_types
            WHERE fee_code = ${feeCode}
            LIMIT 1
      `);
      const existing = getRows(existingResult)?.[0];

      if (existing?.id) {
            await db.execute(sql`
                  UPDATE finance_fee_types
                  SET
                        fee_name = ${feeName},
                        default_amount = ${defaultAmount},
                        cycle = ${cycle},
                        is_active = 1,
                        sort_order = ${sortOrder},
                        updated_at = NOW()
                  WHERE id = ${Number(existing.id)}
            `);
            return Number(existing.id);
      }

      await db.execute(sql`
            INSERT INTO finance_fee_types (
                  fee_code,
                  fee_name,
                  default_amount,
                  cycle,
                  is_active,
                  sort_order,
                  description,
                  created_at,
                  updated_at
            )
            VALUES (
                  ${feeCode},
                  ${feeName},
                  ${defaultAmount},
                  ${cycle},
                  1,
                  ${sortOrder},
                  ${feeName},
                  NOW(),
                  NOW()
            )
      `);

      const idResult = await db.execute(sql`SELECT id FROM finance_fee_types WHERE fee_code = ${feeCode} LIMIT 1`);
      return Number(getRows(idResult)?.[0]?.id || 0);
}

async function readPeriodItems(db: any, periodId: number) {
      const result = await db.execute(sql`
            SELECT
                  id,
                  period_id AS periodId,
                  fee_type_id AS feeTypeId,
                  fee_type_code AS feeTypeCode,
                  fee_type_name AS feeTypeName,
                  amount,
                  is_default_checked AS isDefaultChecked,
                  sort_order AS sortOrder
            FROM finance_charge_period_items
            WHERE period_id = ${periodId}
            ORDER BY sort_order ASC, id ASC
      `);
      return getRows(result);
}

async function readPeriod(db: any, periodId: number) {
      const result = await db.execute(sql`
            SELECT
                  id,
                  period_code AS periodCode,
                  period_name AS periodName,
                  year,
                  from_month AS fromMonth,
                  to_month AS toMonth,
                  status,
                  description,
                  created_at AS createdAt,
                  updated_at AS updatedAt
            FROM finance_charge_periods
            WHERE id = ${periodId}
            LIMIT 1
      `);
      return getRows(result)?.[0] || null;
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

export async function listFinanceChargePeriods() {
      const db = await getFinanceDb();

      const result = await db.execute(sql`
            SELECT
                  p.id,
                  p.period_code AS periodCode,
                  p.period_name AS periodName,
                  p.year,
                  p.from_month AS fromMonth,
                  p.to_month AS toMonth,
                  p.status,
                  p.description,
                  p.created_at AS createdAt,
                  p.updated_at AS updatedAt,
                  COUNT(DISTINCT i.id) AS itemCount,
                  COUNT(DISTINCT c.id) AS chargeCount,
                  COALESCE(SUM(CASE WHEN c.status IN ('open', 'partial') THEN c.remaining_amount ELSE 0 END), 0) AS openAmount,
                  COALESCE(SUM(CASE WHEN c.status = 'paid' THEN c.paid_amount ELSE 0 END), 0) AS paidAmount
            FROM finance_charge_periods p
            LEFT JOIN finance_charge_period_items i ON i.period_id = p.id
            LEFT JOIN finance_charges c ON c.period_id = p.id AND c.status <> 'cancelled'
            GROUP BY p.id, p.period_code, p.period_name, p.year, p.from_month, p.to_month, p.status, p.description, p.created_at, p.updated_at
            ORDER BY p.year DESC, p.from_month ASC, p.id DESC
      `);

      return getRows(result);
}

export async function getFinanceChargePeriodDetail(periodId: number) {
      const db = await getFinanceDb();
      const period = await readPeriod(db, periodId);

      if (!period) {
            throw new Error('Không tìm thấy kỳ thu.');
      }

      const items = await readPeriodItems(db, periodId);

      const months: Array<{ value: string; label: string }> = [];
      const fromMonth = Number(period.fromMonth || 1);
      const toMonth = Number(period.toMonth || 12);
      const year = Number(period.year);

      for (let month = fromMonth; month <= toMonth; month += 1) {
            const value = `${year}-${String(month).padStart(2, '0')}`;
            months.push({ value, label: `Tháng ${String(month).padStart(2, '0')} / ${year}` });
      }

      return { period, items, months };
}

export async function createFinanceChargePeriod(input: CreateChargePeriodInput) {
      const db = await getFinanceDb();

      if (!input.periodName?.trim()) {
            throw new Error('Vui lòng nhập tên kỳ thu.');
      }

      const year = Number(input.year || new Date().getFullYear());
      const fromMonth = Number(input.fromMonth || 1);
      const toMonth = Number(input.toMonth || 12);

      if (fromMonth < 1 || fromMonth > 12 || toMonth < 1 || toMonth > 12 || fromMonth > toMonth) {
            throw new Error('Khoảng tháng áp dụng không hợp lệ.');
      }

      const lodgingFeeTypeId = await ensureDefaultFeeType(db, 'lodging_fee', 'Phí lưu trú', 1200000, 'monthly', 10);
      const mealFeeTypeId = await ensureDefaultFeeType(db, 'meal_living_fee', 'Ăn uống sinh hoạt', 1800000, 'monthly', 20);
      const otherFeeTypeId = await ensureDefaultFeeType(db, 'other_student_fee', 'Khoản thu khác của học viên', 500000, 'monthly', 30);

      await db.execute(sql`
            INSERT INTO finance_charge_periods (
                  period_code,
                  period_name,
                  year,
                  from_month,
                  to_month,
                  status,
                  description,
                  created_by,
                  created_at,
                  updated_at
            )
            VALUES (
                  ${periodCode(year, fromMonth, toMonth)},
                  ${input.periodName.trim()},
                  ${year},
                  ${fromMonth},
                  ${toMonth},
                  'draft',
                  ${input.description || null},
                  ${input.createdBy || null},
                  NOW(),
                  NOW()
            )
      `);

      const periodId = getFirstId(await db.execute(sql`SELECT LAST_INSERT_ID() AS id`));

      const items = [
            {
                  feeTypeId: lodgingFeeTypeId,
                  code: 'lodging_fee',
                  name: 'Phí lưu trú',
                  amount: Number(input.lodgingAmount || 0),
                  checked: 1,
                  sort: 10,
            },
            {
                  feeTypeId: mealFeeTypeId,
                  code: 'meal_living_fee',
                  name: 'Ăn uống sinh hoạt',
                  amount: Number(input.mealLivingAmount || 0),
                  checked: 1,
                  sort: 20,
            },
            {
                  feeTypeId: otherFeeTypeId,
                  code: 'other_student_fee',
                  name: 'Khoản thu khác của học viên',
                  amount: Number(input.otherAmount || 0),
                  checked: 0,
                  sort: 30,
            },
      ];

      for (const item of items) {
            await db.execute(sql`
                  INSERT INTO finance_charge_period_items (
                        period_id,
                        fee_type_id,
                        fee_type_code,
                        fee_type_name,
                        amount,
                        is_default_checked,
                        sort_order,
                        created_at,
                        updated_at
                  )
                  VALUES (
                        ${periodId},
                        ${item.feeTypeId || null},
                        ${item.code},
                        ${item.name},
                        ${item.amount},
                        ${item.checked},
                        ${item.sort},
                        NOW(),
                        NOW()
                  )
            `);
      }

      return { success: true, periodId };
}

export async function updateFinanceChargePeriod(input: UpdateChargePeriodInput) {
      const db = await getFinanceDb();

      const current = await readPeriod(db, input.id);
      if (!current) {
            throw new Error('Không tìm thấy kỳ thu.');
      }

      const year = Number(input.year || current.year);
      const fromMonth = Number(input.fromMonth || current.fromMonth);
      const toMonth = Number(input.toMonth || current.toMonth);

      await db.execute(sql`
            UPDATE finance_charge_periods
            SET
                  period_name = ${input.periodName.trim()},
                  year = ${year},
                  from_month = ${fromMonth},
                  to_month = ${toMonth},
                  status = ${input.status || current.status || 'draft'},
                  description = ${input.description || null},
                  updated_at = NOW()
            WHERE id = ${input.id}
      `);

      const itemAmounts = [
            ['lodging_fee', Number(input.lodgingAmount || 0)],
            ['meal_living_fee', Number(input.mealLivingAmount || 0)],
            ['other_student_fee', Number(input.otherAmount || 0)],
      ] as const;

      for (const [code, amount] of itemAmounts) {
            await db.execute(sql`
                  UPDATE finance_charge_period_items
                  SET amount = ${amount}, updated_at = NOW()
                  WHERE period_id = ${input.id}
                        AND fee_type_code = ${code}
            `);
      }

      return { success: true };
}

// Finance Simple currently should not fail if the resident start/end-date
// column is different between local databases. The start/end-date rule will be
// re-enabled after the resident residence-date field is standardized.
async function getResidentDateColumns(_db: any) {
      return { startColumn: '', leftColumn: '' };
}

export async function previewFinanceChargePeriodResidents(input: { periodId: number; billingMonth: string }) {
      const db = await getFinanceDb();
      const period = await readPeriod(db, input.periodId);

      if (!period) throw new Error('Không tìm thấy kỳ thu.');
      if (!input.billingMonth) throw new Error('Vui lòng chọn tháng áp dụng.');

      const startDate = monthStart(input.billingMonth);
      const endDate = monthEnd(input.billingMonth);
      const { startColumn, leftColumn } = await getResidentDateColumns(db);

      // Important: do not select optional resident date columns directly here.
      // Some DBs do not have admissionDate/residenceStartDate yet; selecting a
      // missing column makes the whole preview fail and hides all residents.
      const result = await db.execute(sql`
            SELECT
                  r.id,
                  r.fullName,
                  r.residentCode,
                  r.status,
                  r.currentRoomId,
                  NULL AS residenceStartDate,
                  NULL AS residenceEndDate,
                  NULL AS roomName,
                  NULL AS roomCode
            FROM residents r
            ORDER BY r.fullName ASC
      `);

      const rows = getRows(result);
      const inactiveStatuses = new Set([
            'left',
            'transferred_out',
            'inactive',
            'archived',
            'deleted',
            'stopped',
            'removed',
            'suspended',
            'left_residence',
            'da_roi',
            'da_ngung',
            'ngung_luu_tru',
            'roi_luu_xa',
            'đã rời',
            'da roi',
            'đã rời lưu xá',
            'da roi luu xa',
            'ngừng lưu trú',
            'ngung luu tru',
            'tạm ngưng',
            'tam ngung',
      ]);

      return rows.map((resident: any) => {
            const residentStart = resident.residenceStartDate ? String(resident.residenceStartDate).slice(0, 10) : null;
            const residentEnd = resident.residenceEndDate ? String(resident.residenceEndDate).slice(0, 10) : null;
            const statusText = String(resident.status || '').trim().toLowerCase();
            let eligible = true;
            let reason = '';

            if (statusText && inactiveStatuses.has(statusText)) {
                  eligible = false;
                  reason = 'Học viên đã rời/ngừng lưu trú';
            }

            if (eligible && residentStart && endDate && residentStart > endDate) {
                  eligible = false;
                  reason = 'Chưa vào lưu trú trong tháng này';
            }

            if (eligible && residentEnd && startDate && residentEnd < startDate) {
                  eligible = false;
                  reason = 'Đã rời lưu xá trước tháng này';
            }

            return {
                  id: Number(resident.id),
                  fullName: resident.fullName,
                  residentCode: resident.residentCode,
                  status: resident.status,
                  currentRoomId: resident.currentRoomId,
                  roomName: resident.roomName,
                  roomCode: resident.roomCode,
                  residenceStartDate: residentStart,
                  residenceEndDate: residentEnd,
                  eligible,
                  reason,
            };
      });
}

async function findDuplicateCharge(db: any, residentId: number, feeTypeId: number | null, billingMonth: string, excludeId?: number) {
      const excludeClause = excludeId ? sql`AND id <> ${excludeId}` : sql``;
      const feeTypeClause = feeTypeId ? sql`AND fee_type_id = ${feeTypeId}` : sql`AND fee_type_id IS NULL`;
      const result = await db.execute(sql`
            SELECT id, status, paid_amount AS paidAmount
            FROM finance_charges
            WHERE resident_id = ${residentId}
                  ${feeTypeClause}
                  AND billing_month = ${billingMonth}
                  AND status <> 'cancelled'
                  ${excludeClause}
            LIMIT 1
      `);
      return getRows(result)?.[0] || null;
}

export async function applyFinanceChargePeriod(input: ApplyChargePeriodInput) {
      const db = await getFinanceDb();
      const period = await readPeriod(db, input.periodId);
      if (!period) throw new Error('Không tìm thấy kỳ thu.');
      if (!input.billingMonth) throw new Error('Vui lòng chọn tháng áp dụng.');

      const items = await readPeriodItems(db, input.periodId);
      const itemMap = new Map(items.map((item: any) => [Number(item.id), item]));
      const startDate = monthStart(input.billingMonth);
      const endDate = monthEnd(input.billingMonth);

      let createdCount = 0;
      let skippedCount = 0;
      const duplicated: Array<string> = [];

      for (const line of input.lines || []) {
            const residentId = Number(line.residentId || 0);
            if (!residentId) continue;

            const residentResult = await db.execute(sql`
                  SELECT id, fullName, residentCode
                  FROM residents
                  WHERE id = ${residentId}
                  LIMIT 1
            `);
            const resident = getRows(residentResult)?.[0];
            if (!resident) continue;

            for (const requestedItem of line.items || []) {
                  if (!requestedItem.selected) continue;
                  const item = itemMap.get(Number(requestedItem.periodItemId));
                  if (!item) continue;

                  const feeTypeId = Number((item as any).feeTypeId || 0) || null;
                  const amount = Number(requestedItem.amount ?? (item as any).amount ?? 0);
                  if (amount <= 0) continue;

                  const duplicate = await findDuplicateCharge(db, residentId, feeTypeId, input.billingMonth);
                  if (duplicate) {
                        skippedCount += 1;
                        duplicated.push(`${resident.fullName || resident.residentCode || residentId} - ${(item as any).feeTypeName}`);
                        continue;
                  }

                  await db.execute(sql`
                        INSERT INTO finance_charges (
                              charge_code,
                              resident_id,
                              fee_type_id,
                              period_id,
                              period_item_id,
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
                              ${chargeCode(residentId, feeTypeId, input.billingMonth)},
                              ${residentId},
                              ${feeTypeId},
                              ${input.periodId},
                              ${Number((item as any).id)},
                              ${amount},
                              0,
                              ${amount},
                              NULL,
                              'open',
                              'student_fee',
                              'period_monthly',
                              'resident',
                              ${resident.fullName || resident.residentCode || null},
                              ${input.billingMonth},
                              ${startDate},
                              ${endDate},
                              'full_month',
                              1,
                              ${`Kỳ: ${period.periodName} - ${input.billingMonth} - ${(item as any).feeTypeName}`},
                              ${input.createdBy || null},
                              NOW(),
                              NOW()
                        )
                  `);
                  createdCount += 1;
            }
      }

      return {
            success: true,
            createdCount,
            skippedCount,
            duplicated: duplicated.slice(0, 20),
      };
}

export async function listFinanceCharges(input: ListChargesInput = {}) {
      const db = await getFinanceDb();

      const searchValue = `%${input.search || ''}%`;
      const limit = Number(input.limit || 100);
      const offset = Number(input.offset || 0);

      const statusClause = input.status ? sql`AND c.status = ${input.status}` : sql``;
      const residentClause = input.residentId ? sql`AND c.resident_id = ${input.residentId}` : sql``;
      const periodClause = input.periodId ? sql`AND c.period_id = ${input.periodId}` : sql``;
      const monthClause = input.billingMonth ? sql`AND c.billing_month = ${input.billingMonth}` : sql``;
      const searchClause = input.search
            ? sql`AND (
                  r.fullName LIKE ${searchValue}
                  OR r.residentCode LIKE ${searchValue}
                  OR ft.fee_name LIKE ${searchValue}
                  OR c.charge_code LIKE ${searchValue}
                  OR c.target_name LIKE ${searchValue}
            )`
            : sql``;

      const result = await db.execute(sql`
            SELECT
                  c.id,
                  c.charge_code AS chargeCode,
                  c.resident_id AS residentId,
                  c.fee_type_id AS feeTypeId,
                  c.period_id AS periodId,
                  c.period_item_id AS periodItemId,
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
                  c.updated_at AS updatedAt,
                  r.fullName AS residentName,
                  r.residentCode AS residentCode,
                  ft.fee_name AS feeName,
                  ft.fee_name AS feeTypeName,
                  p.period_name AS periodName,
                  pi.fee_type_name AS periodItemName
            FROM finance_charges c
            LEFT JOIN residents r ON r.id = c.resident_id
            LEFT JOIN finance_fee_types ft ON ft.id = c.fee_type_id
            LEFT JOIN finance_charge_periods p ON p.id = c.period_id
            LEFT JOIN finance_charge_period_items pi ON pi.id = c.period_item_id
            WHERE 1 = 1
                  ${statusClause}
                  ${residentClause}
                  ${periodClause}
                  ${monthClause}
                  ${searchClause}
            ORDER BY c.billing_month DESC, c.due_date DESC, c.id DESC
            LIMIT ${limit}
            OFFSET ${offset}
      `);

      return getRows(result);
}

export async function createFinanceChargeBatch(input: CreateChargeBatchInput) {
      const db = await getFinanceDb();
      const created: number[] = [];
      const duplicated: string[] = [];

      for (const residentId of input.residentIds) {
            if (input.billingMonth) {
                  const duplicate = await findDuplicateCharge(db, residentId, input.feeTypeId, input.billingMonth);
                  if (duplicate) {
                        duplicated.push(String(residentId));
                        continue;
                  }
            }

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
                        ${chargeCode(residentId, input.feeTypeId, input.billingMonth)},
                        ${residentId},
                        ${input.feeTypeId},
                        ${Number(input.amount || 0)},
                        0,
                        ${Number(input.amount || 0)},
                        ${input.dueDate || null},
                        'open',
                        ${input.source || 'student_fee'},
                        ${input.feeMode || null},
                        ${input.targetType || null},
                        ${input.targetName || null},
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

      if (created.length === 0 && duplicated.length > 0) {
            throw new Error('Các khoản thu đã tồn tại cho kỳ này. Vui lòng sửa khoản đã có hoặc hủy khoản cũ trước khi tạo lại.');
      }

      return { success: true, createdCount: created.length, skippedCount: duplicated.length };
}

export async function updateFinanceCharge(input: UpdateChargeInput) {
      const db = await getFinanceDb();
      if (!input.id) throw new Error('Thiếu mã khoản phải thu.');

      const currentResult = await db.execute(sql`
            SELECT
                  id,
                  resident_id AS residentId,
                  fee_type_id AS feeTypeId,
                  amount,
                  paid_amount AS paidAmount,
                  status
            FROM finance_charges
            WHERE id = ${input.id}
            LIMIT 1
      `);
      const current = getRows(currentResult)?.[0];
      if (!current) throw new Error('Không tìm thấy khoản phải thu.');

      const feeTypeId = input.feeTypeId === undefined ? Number(current.feeTypeId || 0) || null : Number(input.feeTypeId || 0) || null;
      const amount = input.amount === undefined || input.amount === null ? Number(current.amount || 0) : Number(input.amount || 0);
      const paidAmount = Number(current.paidAmount || 0);
      const remainingAmount = Math.max(amount - paidAmount, 0);
      let resolvedStatus = input.status || current.status || 'open';

      if (resolvedStatus !== 'cancelled') {
            if (remainingAmount <= 0 && amount > 0) resolvedStatus = 'paid';
            else if (paidAmount > 0) resolvedStatus = 'partial';
            else resolvedStatus = 'open';
      }

      if (input.billingMonth && feeTypeId) {
            const duplicate = await findDuplicateCharge(db, Number(current.residentId), feeTypeId, input.billingMonth, input.id);
            if (duplicate) {
                  throw new Error('Khoản thu này đã tồn tại cùng loại phí, cùng kỳ thu cho học viên.');
            }
      }

      await db.execute(sql`
            UPDATE finance_charges
            SET
                  fee_type_id = ${feeTypeId},
                  amount = ${amount},
                  remaining_amount = ${resolvedStatus === 'cancelled' ? 0 : remainingAmount},
                  due_date = ${input.dueDate || null},
                  billing_month = ${input.billingMonth || null},
                  period_start_date = ${input.periodStartDate || null},
                  period_end_date = ${input.periodEndDate || null},
                  period_charge_mode = ${input.periodChargeMode || null},
                  period_multiplier = ${Number(input.periodMultiplier || 1)},
                  status = ${resolvedStatus},
                  target_name = ${input.targetName || null},
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

      if (!input.chargeId) throw new Error('Vui lòng chọn khoản phải thu.');
      if (amount <= 0) throw new Error('Số tiền thu phải lớn hơn 0.');

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
      const charge = getRows(chargeResult)?.[0];

      if (!charge) throw new Error('Không tìm thấy khoản phải thu.');
      if (charge.status === 'cancelled') throw new Error('Khoản thu đã hủy, không thể ghi nhận thanh toán.');
      if (charge.status === 'paid') throw new Error('Khoản thu đã thu đủ.');

      const remainingAmount = Number(charge.remainingAmount || 0);
      if (remainingAmount <= 0) throw new Error('Khoản thu không còn số tiền phải thu.');
      if (amount > remainingAmount) throw new Error(`Số tiền thu không được lớn hơn số tiền còn lại (${remainingAmount}).`);

      const residentId = Number(input.residentId || charge.residentId || 0);
      if (!residentId) throw new Error('Khoản thu chưa có học viên hợp lệ.');

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
      if (!input.id) throw new Error('Thiếu mã khoản phải thu cần hủy.');

      const currentResult = await db.execute(sql`
            SELECT id, paid_amount AS paidAmount, status
            FROM finance_charges
            WHERE id = ${input.id}
            LIMIT 1
      `);
      const currentCharge = getRows(currentResult)?.[0];

      if (!currentCharge) throw new Error('Không tìm thấy khoản phải thu.');
      if (currentCharge.status === 'cancelled') throw new Error('Khoản thu này đã được hủy trước đó.');
      if (Number(currentCharge.paidAmount || 0) > 0) throw new Error('Khoản thu đã phát sinh thanh toán, không nên hủy trực tiếp.');

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

      const baseSummary = getRows(result)?.[0] || {
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

      const transactionSummary = getRows(transactionSummaryResult)?.[0] || {
            totalCashIn: 0,
            totalCashOut: 0,
      };

      return { ...baseSummary, ...transactionSummary };
}
