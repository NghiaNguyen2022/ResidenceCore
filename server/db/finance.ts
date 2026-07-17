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
      const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
      }).formatToParts(new Date());
      const value = (type: string) => parts.find((part) => part.type === type)?.value || '';

      return `${value('year')}-${value('month')}-${value('day')}`;
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

const inactiveResidentStatuses = new Set([
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

function isInactiveResidentStatus(status?: string | null) {
      const statusText = String(status || '').trim().toLowerCase();
      return Boolean(statusText && inactiveResidentStatuses.has(statusText));
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

async function tableExists(db: any, tableName: string) {
      const result = await db.execute(sql`
            SELECT COUNT(*) AS countValue
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = ${tableName}
      `);
      const rows = getRows(result);
      return Number(rows?.[0]?.countValue || rows?.[0]?.COUNT_VALUE || rows?.[0]?.['COUNT(*)'] || 0) > 0;
}

function ident(name: string) {
      return `\`${String(name).replace(/`/g, '``')}\``;
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
                  external_ref VARCHAR(160) NULL,
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
                  target_type VARCHAR(160) NULL,
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
                  target_type VARCHAR(160) NULL,
                  target_name VARCHAR(255) NULL,
                  description TEXT NULL,
                  created_by INT NULL,
                  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  INDEX idx_finance_transactions_date (transaction_date),
                  INDEX idx_finance_transactions_source (source, direction)
            )
      `);

      await db.execute(sql`ALTER TABLE finance_transactions MODIFY COLUMN target_type VARCHAR(160) NULL`).catch(() => undefined);
      await ensureColumn(db, 'finance_transactions', 'external_ref', 'ALTER TABLE finance_transactions ADD COLUMN external_ref VARCHAR(160) NULL AFTER description');
      await db.execute(sql`CREATE UNIQUE INDEX uq_finance_transactions_external_ref ON finance_transactions (external_ref)`).catch(() => undefined);
      await db.execute(sql`ALTER TABLE finance_charges MODIFY COLUMN target_type VARCHAR(160) NULL`).catch(() => undefined);

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

async function firstExistingColumn(db: any, tableName: string, candidates: string[]) {
      for (const column of candidates) {
            if (await columnExists(db, tableName, column)) return column;
      }

      return '';
}

async function getResidentDateSelects(db: any) {
      const residentStartCandidates = [
            'residenceStartDate',
            'residence_start_date',
            'moveInDate',
            'move_in_date',
            'admissionDate',
            'admission_date',
            'joinDate',
            'join_date',
            'entryDate',
            'entry_date',
            'checkInDate',
            'check_in_date',
            'startDate',
            'start_date',
      ];
      const residentEndCandidates = [
            'residenceEndDate',
            'residence_end_date',
            'moveOutDate',
            'move_out_date',
            'leftDate',
            'left_date',
            'transferredOutDate',
            'transferred_out_date',
            'leaveDate',
            'leave_date',
            'endDate',
            'end_date',
      ];

      const residentStartColumn = await firstExistingColumn(db, 'residents', residentStartCandidates);
      const residentEndColumn = await firstExistingColumn(db, 'residents', residentEndCandidates);

      let startSql = residentStartColumn ? `r.${ident(residentStartColumn)}` : 'NULL';
      let endSql = residentEndColumn ? `r.${ident(residentEndColumn)}` : 'NULL';

      // Fallback: if the resident table does not have a standardized move-in date,
      // derive it from room assignment history/current assignment when those tables exist.
      if (startSql === 'NULL') {
            const historyTables = ['roomAssignmentHistory', 'room_assignment_history', 'roomAssignments', 'room_assignments'];
            const residentColumns = ['residentId', 'resident_id'];
            const startColumns = ['assignedDate', 'assignmentDate', 'startDate', 'assigned_at', 'assignedAt', 'createdAt', 'created_at'];

            for (const tableName of historyTables) {
                  if (startSql !== 'NULL') break;
                  if (!(await tableExists(db, tableName))) continue;
                  const residentColumn = await firstExistingColumn(db, tableName, residentColumns);
                  const startColumn = await firstExistingColumn(db, tableName, startColumns);
                  if (residentColumn && startColumn) {
                        startSql = `(SELECT MIN(${ident(startColumn)}) FROM ${ident(tableName)} rah WHERE rah.${ident(residentColumn)} = r.id)`;
                  }
            }
      }

      if (endSql === 'NULL') {
            const historyTables = ['roomAssignmentHistory', 'room_assignment_history', 'roomAssignments', 'room_assignments'];
            const residentColumns = ['residentId', 'resident_id'];
            const endColumns = ['endDate', 'end_date', 'leftDate', 'left_date', 'moveOutDate', 'move_out_date'];

            for (const tableName of historyTables) {
                  if (endSql !== 'NULL') break;
                  if (!(await tableExists(db, tableName))) continue;
                  const residentColumn = await firstExistingColumn(db, tableName, residentColumns);
                  const endColumn = await firstExistingColumn(db, tableName, endColumns);
                  if (residentColumn && endColumn) {
                        endSql = `(SELECT MAX(${ident(endColumn)}) FROM ${ident(tableName)} rah WHERE rah.${ident(residentColumn)} = r.id)`;
                  }
            }
      }

      return { startSql, endSql };
}

export async function previewFinanceChargePeriodResidents(input: { periodId: number; billingMonth: string }) {
      const db = await getFinanceDb();
      const period = await readPeriod(db, input.periodId);

      if (!period) throw new Error('Không tìm thấy kỳ thu.');
      if (!input.billingMonth) throw new Error('Vui lòng chọn tháng áp dụng.');

      const startDate = monthStart(input.billingMonth);
      const endDate = monthEnd(input.billingMonth);
      const { startSql, endSql } = await getResidentDateSelects(db);

      const result = await db.execute(sql`
            SELECT
                  r.id,
                  r.fullName,
                  r.residentCode,
                  r.status,
                  r.currentRoomId,
                  ${sql.raw(startSql)} AS residenceStartDate,
                  ${sql.raw(endSql)} AS residenceEndDate,
                  NULL AS roomName,
                  NULL AS roomCode
            FROM residents r
            ORDER BY r.fullName ASC
      `);

      const rows = getRows(result);

      const existingChargeResult = await db.execute(sql`
            SELECT
                  resident_id AS residentId,
                  period_item_id AS periodItemId,
                  fee_type_id AS feeTypeId,
                  status
            FROM finance_charges
            WHERE billing_month = ${input.billingMonth}
                  AND resident_id IS NOT NULL
                  AND status <> 'cancelled'
      `);
      const existingMap = new Map<string, any>();
      for (const charge of getRows(existingChargeResult)) {
            const residentId = Number(charge.residentId || 0);
            const periodItemId = Number(charge.periodItemId || 0);
            const feeTypeId = Number(charge.feeTypeId || 0);
            if (residentId && periodItemId) existingMap.set(`${residentId}:${periodItemId}`, charge);
            if (residentId && feeTypeId) existingMap.set(`${residentId}:fee:${feeTypeId}`, charge);
      }

      const items = await readPeriodItems(db, input.periodId);
      const existingItemIdsByResident = new Map<number, number[]>();
      for (const resident of rows) {
            const residentId = Number(resident.id || 0);
            const existingItemIds = items
                  .filter((item: any) => {
                        const periodItemId = Number(item.id || 0);
                        const feeTypeId = Number(item.feeTypeId || 0);
                        return Boolean(existingMap.get(`${residentId}:${periodItemId}`) || existingMap.get(`${residentId}:fee:${feeTypeId}`));
                  })
                  .map((item: any) => Number(item.id));
            existingItemIdsByResident.set(residentId, existingItemIds);
      }

      return rows.map((resident: any) => {
            const residentStart = resident.residenceStartDate ? String(resident.residenceStartDate).slice(0, 10) : null;
            const residentEnd = resident.residenceEndDate ? String(resident.residenceEndDate).slice(0, 10) : null;
            const statusText = String(resident.status || '').trim().toLowerCase();
            let eligible = true;
            let reason = '';

            if (isInactiveResidentStatus(statusText)) {
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
                  existingPeriodItemIds: existingItemIdsByResident.get(Number(resident.id)) || [],
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
      const previewResidents = await previewFinanceChargePeriodResidents({ periodId: input.periodId, billingMonth: input.billingMonth });
      const residentEligibility = new Map<number, any>(previewResidents.map((resident: any) => [Number(resident.id), resident]));

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

            const eligibility = residentEligibility.get(residentId);
            if (eligibility && !eligibility.eligible) {
                  skippedCount += 1;
                  duplicated.push(`${resident.fullName || resident.residentCode || residentId} - ${eligibility.reason || 'Không đủ điều kiện trong tháng này'}`);
                  continue;
            }

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
      const skipped: string[] = [];

      const amount = Number(input.amount || 0);
      if (!input.feeTypeId) throw new Error('Vui lòng chọn loại khoản thu.');
      if (!Array.isArray(input.residentIds) || input.residentIds.length === 0) {
            throw new Error('Vui lòng chọn học viên cần tạo khoản thu.');
      }
      if (amount <= 0) throw new Error('Số tiền khoản thu phải lớn hơn 0.');

      for (const residentId of input.residentIds) {
            const residentResult = await db.execute(sql`
                  SELECT id, fullName, residentCode, status
                  FROM residents
                  WHERE id = ${residentId}
                  LIMIT 1
            `);
            const resident = getRows(residentResult)?.[0];

            if (!resident) {
                  skipped.push(`${residentId} - Không tìm thấy học viên`);
                  continue;
            }

            if (isInactiveResidentStatus(resident.status)) {
                  skipped.push(`${resident.fullName || resident.residentCode || residentId} - Học viên đã rời/ngừng lưu trú`);
                  continue;
            }

            if (input.billingMonth) {
                  const duplicate = await findDuplicateCharge(db, residentId, input.feeTypeId, input.billingMonth);
                  if (duplicate) {
                        skipped.push(`${resident.fullName || resident.residentCode || residentId} - Khoản thu đã tồn tại trong tháng này`);
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
                        ${amount},
                        0,
                        ${amount},
                        ${input.dueDate || null},
                        'open',
                        ${input.source || 'student_fee'},
                        ${input.feeMode || null},
                        ${input.targetType || 'resident'},
                        ${input.targetName || resident.fullName || resident.residentCode || null},
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

      if (created.length === 0 && skipped.length > 0) {
            throw new Error(skipped.length === 1 ? skipped[0] : `Không tạo được khoản thu nào. ${skipped.slice(0, 3).join('; ')}`);
      }

      return { success: true, createdCount: created.length, skippedCount: skipped.length, skipped };
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
                  billing_month AS billingMonth,
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
      const resolvedBillingMonth = input.billingMonth === undefined ? current.billingMonth || null : input.billingMonth || null;

      if (amount <= 0) throw new Error('Số tiền khoản thu phải lớn hơn 0.');
      if (amount < paidAmount) throw new Error('Không thể giảm khoản thu nhỏ hơn số tiền đã thu.');

      const remainingAmount = Math.max(amount - paidAmount, 0);
      let resolvedStatus = input.status || current.status || 'open';

      if (resolvedStatus !== 'cancelled') {
            if (remainingAmount <= 0 && amount > 0) resolvedStatus = 'paid';
            else if (paidAmount > 0) resolvedStatus = 'partial';
            else resolvedStatus = 'open';
      }

      if (resolvedBillingMonth && feeTypeId) {
            const duplicate = await findDuplicateCharge(db, Number(current.residentId), feeTypeId, resolvedBillingMonth, input.id);
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
                  billing_month = ${resolvedBillingMonth},
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

      const chargeAmount = Number(charge.amount || 0);
      const currentPaidAmount = Number(charge.paidAmount || 0);
      const remainingAmount = Number(charge.remainingAmount || 0);
      if (remainingAmount <= 0) throw new Error('Khoản thu không còn số tiền phải thu.');
      if (amount > remainingAmount) throw new Error(`Số tiền thu không được lớn hơn số tiền còn lại (${remainingAmount}).`);

      const newPaidAmount = currentPaidAmount + amount;
      const newRemainingAmount = Math.max(chargeAmount - newPaidAmount, 0);
      const newStatus = newRemainingAmount <= 0 ? 'paid' : newPaidAmount > 0 ? 'partial' : 'open';

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
                  paid_amount = ${newPaidAmount},
                  remaining_amount = ${newRemainingAmount},
                  status = ${newStatus},
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
                  external_ref AS externalRef,
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

      const rows = getRows(result);

      // Các ngày chốt cửa hàng cũ chỉ lưu mô tả tổng quát. Khi đọc sổ chính,
      // tự dựng lại chi tiết từ các giao dịch thuộc ngày chốt và đồng thời
      // cập nhật ngược vào finance_transactions để phiếu in cũng dùng nội dung rõ ràng.
      for (const row of rows) {
            const source = String(row?.source || "");
            const description = String(row?.description || "");
            const externalRef = String(row?.externalRef || "");
            if (source !== "store_daily_closing" || !externalRef) continue;
            // Luôn dựng lại từ sổ cửa hàng để các giao dịch vừa được khôi phục
            // cũng xuất hiện trong ghi chú của dòng đã đẩy sang Finance.

            const batchId = externalRef.replace(/:(IN|OUT)$/i, "");
            if (!batchId) continue;

            const closingResult = await db.execute(sql`
                  SELECT id, closingCode, closingDate
                  FROM storeDailyClosings
                  WHERE financeBatchId = ${batchId}
                  LIMIT 1
            `);
            const closing = getRows(closingResult)?.[0];
            if (!closing?.id) continue;

            const transactionResult = await db.execute(sql`
                  SELECT transactionCode, direction, amount, title, partnerName, status
                  FROM storeLedgerTransactions
                  WHERE dailyClosingId = ${Number(closing.id)}
                        AND isActive = 1
                        AND status <> 'cancelled'
                        AND direction = ${String(row.direction || "")}
                  ORDER BY id ASC
            `);
            const transactions = getRows(transactionResult);
            if (!transactions.length) continue;

            const directionLabel = String(row.direction) === "in" ? "thu" : "chi";
            const details = transactions.map((item: any, index: number) => {
                  const title = String(item?.title || (directionLabel === "thu" ? "Khoản thu" : "Khoản chi")).trim();
                  const partner = String(item?.partnerName || "").trim();
                  const code = String(item?.transactionCode || "").trim();
                  const amount = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Number(item?.amount || 0));
                  return `${index + 1}. ${title}${partner ? ` · ${partner}` : ""} — ${amount}đ${code ? ` [${code}]` : ""}`;
            });
            const closingDate = String(closing.closingDate || row.transactionDate).slice(0, 10);
            const closingCode = String(closing.closingCode || batchId);
            const detailedDescription = [
                  `Chốt sổ cửa hàng ngày ${closingDate} · ${closingCode}`,
                  `Chi tiết từng giao dịch ${directionLabel}:`,
                  ...details,
            ].join("\n");

            row.description = detailedDescription;
            await db.execute(sql`
                  UPDATE finance_transactions
                  SET description = ${detailedDescription}, updated_at = NOW()
                  WHERE id = ${Number(row.id)}
            `);
      }

      return rows;
}

export async function createFinanceTransaction(input: {
      source: string;
      direction: string;
      amount: number;
      transactionDate?: string | null;
      targetType?: string | null;
      targetName?: string | null;
      description?: string | null;
      externalRef?: string | null;
      createdBy?: number | null;
}) {
      const db = await getFinanceDb();

      const source = input.source || 'other_income';
      const direction =
            source === 'expense' || source === 'expense_plan' || source === 'advance_out'
                  ? 'out'
                  : source === 'other_income' || source === 'donation'
                        ? 'in'
                        : input.direction === 'out'
                              ? 'out'
                              : 'in';
      const amount = Number(input.amount || 0);
      const targetName = String(input.targetName || '').trim();
      const description = String(input.description || '').trim();

      if (amount <= 0) throw new Error('Vui lòng nhập số tiền hợp lệ.');
      if (!targetName) throw new Error('Vui lòng nhập đối tượng/người nhận hoặc nguồn thu.');
      if (!description) throw new Error('Vui lòng nhập mục đích hoặc ghi chú nghiệp vụ.');

      const externalRef = String(input.externalRef || '').trim() || null;
      if (externalRef) {
            const existing = await db.execute(sql`
                  SELECT id FROM finance_transactions WHERE external_ref = ${externalRef} LIMIT 1
            `);
            const existingId = Number(getRows(existing)?.[0]?.id || 0);
            if (existingId) return { success: true, id: existingId, duplicated: true };
      }

      await db.execute(sql`
            INSERT INTO finance_transactions (
                  source,
                  direction,
                  amount,
                  transaction_date,
                  target_type,
                  target_name,
                  description,
                  external_ref,
                  created_by,
                  created_at,
                  updated_at
            )
            VALUES (
                  ${source},
                  ${direction},
                  ${amount},
                  ${input.transactionDate || todayText()},
                  ${input.targetType || source},
                  ${targetName},
                  ${description},
                  ${externalRef},
                  ${input.createdBy || null},
                  NOW(),
                  NOW()
            )
      `);

      const inserted = await db.execute(sql`SELECT LAST_INSERT_ID() AS id`);
      return { success: true, id: Number(getRows(inserted)?.[0]?.id || 0), duplicated: false };
}

export async function updateFinanceTransactionDescriptionByExternalRef(
      externalRef: string,
      description: string,
) {
      const db = await getFinanceDb();
      const normalizedRef = String(externalRef || "").trim();
      const normalizedDescription = String(description || "").trim();
      if (!normalizedRef || !normalizedDescription) return { success: false, updated: false };

      await db.execute(sql`
            UPDATE finance_transactions
            SET description = ${normalizedDescription}, updated_at = NOW()
            WHERE external_ref = ${normalizedRef}
      `);

      return { success: true, updated: true };
}

export async function deleteFinanceTransaction(input: { id: number }) {
      const db = await getFinanceDb();
      const id = Number(input.id || 0);
      if (!id) throw new Error('Thiếu mã khoản thu chi cần xóa.');

      const result = await db.execute(sql`
            SELECT id, source, target_name AS targetName, description
            FROM finance_transactions
            WHERE id = ${id}
            LIMIT 1
      `);
      const transaction = getRows(result)?.[0];

      if (!transaction) throw new Error('Không tìm thấy khoản thu chi cần xóa.');
      if (transaction.source === 'student_fee_payment') {
            throw new Error('Khoản thu học viên đã liên kết thanh toán, không xóa trực tiếp ở Sổ thu chi.');
      }

      await db.execute(sql`
            DELETE FROM finance_transactions
            WHERE id = ${id}
      `);

      return { success: true };
}


function toFinanceNumber(value: unknown) {
      const numberValue = Number(value || 0);
      return Number.isFinite(numberValue) ? numberValue : 0;
}

function normalizePortalText(value?: string | null) {
      return String(value || '')
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase();
}

function parseAdvanceMeta(targetType?: string | null) {
      const value = String(targetType || '');
      const parts = value.split(':');

      if (!value.startsWith('expense_advance:')) {
            return {
                  raw: value,
                  category: 'advance',
                  periodType: null,
                  periodStart: null,
                  periodEnd: null,
                  receiverType: null,
            };
      }

      const range = parts[3] || '';
      const [periodStart, periodEnd] = range.split('_');

      return {
            raw: value,
            category: parts[1] || 'advance',
            periodType: parts[2] || null,
            periodStart: periodStart || null,
            periodEnd: periodEnd || null,
            receiverType: parts[4] || null,
      };
}

function mapAdvanceRow(
      row: any,
      actualByAdvanceId: Map<number, number>,
      actualEntriesByAdvanceId: Map<number, Array<{ id: number; amount: number; transactionDate: string | null; description: string | null; createdAt: string | null }>>
) {
      const id = Number(row.id || 0);
      const advanceAmount = toFinanceNumber(row.amount);
      const actualAmount = actualByAdvanceId.get(id) || 0;
      const balanceAmount = advanceAmount - actualAmount;
      const meta = parseAdvanceMeta(row.targetType);
      const actualEntries = actualEntriesByAdvanceId.get(id) || [];

      return {
            id,
            source: row.source,
            amount: advanceAmount,
            advanceAmount,
            actualAmount,
            balanceAmount,
            transactionDate: row.transactionDate,
            targetType: row.targetType,
            targetName: row.targetName,
            description: row.description,
            createdAt: row.createdAt,
            category: meta.category,
            periodType: meta.periodType,
            periodStart: meta.periodStart,
            periodEnd: meta.periodEnd,
            receiverType: meta.receiverType,
            actualEntries,
            lastActualDate: actualEntries[0]?.transactionDate || null,
            status:
                  balanceAmount < 0
                        ? 'over_spent'
                        : actualAmount <= 0
                              ? 'holding'
                              : balanceAmount <= 0
                                    ? 'settled'
                                    : 'partial_spent',
      };
}

async function getActualSpendingByAdvanceIds(db: any, advanceIds: number[]) {
      const uniqueIds = Array.from(new Set(advanceIds.map((id) => Number(id)).filter((id) => id > 0)));
      const actualByAdvanceId = new Map<number, number>();
      const actualEntriesByAdvanceId = new Map<number, Array<{ id: number; amount: number; transactionDate: string | null; description: string | null; createdAt: string | null }>>();
      if (!uniqueIds.length) return { actualByAdvanceId, actualEntriesByAdvanceId };

      const result = await db.execute(sql`
            SELECT
                  id,
                  target_type AS targetType,
                  amount,
                  transaction_date AS transactionDate,
                  description,
                  created_at AS createdAt
            FROM finance_transactions
            WHERE source = 'advance_actual_spending'
                  AND target_type IN ${uniqueIds.map((id) => `advance_entry:${id}`)}
            ORDER BY transaction_date DESC, id DESC
      `);

      for (const row of getRows(result)) {
            const id = Number(String(row.targetType || '').replace('advance_entry:', ''));
            if (id <= 0) continue;
            const amount = toFinanceNumber(row.amount);
            actualByAdvanceId.set(id, (actualByAdvanceId.get(id) || 0) + amount);
            const current = actualEntriesByAdvanceId.get(id) || [];
            current.push({
                  id: Number(row.id || 0),
                  amount,
                  transactionDate: row.transactionDate || null,
                  description: row.description || null,
                  createdAt: row.createdAt || null,
            });
            actualEntriesByAdvanceId.set(id, current);
      }

      return { actualByAdvanceId, actualEntriesByAdvanceId };
}

function advanceMatchesResident(row: any, resident: { id: number; name?: string | null; code?: string | null }) {
      const meta = parseAdvanceMeta(row.targetType);
      const receiverType = normalizePortalText(meta.receiverType);
      const targetText = normalizePortalText(`${row.targetName || ''} ${row.description || ''}`);
      const residentName = normalizePortalText(resident.name);
      const residentCode = normalizePortalText(resident.code);

      if (![receiverType, normalizePortalText(row.targetType)].some((text) => ['person', 'resident', 'ca_nhan'].includes(text))) {
            if (!String(row.targetType || '').includes(':person') && !String(row.targetType || '').includes(':resident')) {
                  return false;
            }
      }

      return Boolean(
            (residentName && targetText.includes(residentName)) ||
                  (residentCode && targetText.includes(residentCode))
      );
}

function advanceMatchesUnit(row: any, unit: { unitType?: string | null; unitName?: string | null; unitId?: number | null }) {
      const meta = parseAdvanceMeta(row.targetType);
      const receiverType = normalizePortalText(meta.receiverType || row.targetType);
      const targetText = normalizePortalText(`${row.targetName || ''} ${row.description || ''}`);
      const unitName = normalizePortalText(unit.unitName);
      const unitType = normalizePortalText(unit.unitType);

      if (unitType && receiverType && !receiverType.includes(unitType)) return false;
      return Boolean(unitName && targetText.includes(unitName));
}

export async function getFinancePortalOverview(input: {
      residentId: number;
      residentName?: string | null;
      residentCode?: string | null;
      unitTargets?: Array<{ unitId?: number | null; unitName?: string | null; unitType?: string | null }>;
}) {
      const db = await getFinanceDb();
      const residentId = Number(input.residentId || 0);
      if (!residentId) throw new Error('Thiếu học viên cần xem tài chính.');

      const chargesResult = await db.execute(sql`
            SELECT
                  c.id,
                  c.charge_code AS chargeCode,
                  c.resident_id AS residentId,
                  c.amount,
                  c.paid_amount AS paidAmount,
                  c.remaining_amount AS remainingAmount,
                  c.due_date AS dueDate,
                  c.status,
                  c.billing_month AS billingMonth,
                  c.period_start_date AS periodStartDate,
                  c.period_end_date AS periodEndDate,
                  c.description,
                  c.created_at AS createdAt,
                  ft.fee_name AS feeName,
                  p.period_name AS periodName,
                  pi.fee_type_name AS periodItemName
            FROM finance_charges c
            LEFT JOIN finance_fee_types ft ON ft.id = c.fee_type_id
            LEFT JOIN finance_charge_periods p ON p.id = c.period_id
            LEFT JOIN finance_charge_period_items pi ON pi.id = c.period_item_id
            WHERE c.resident_id = ${residentId}
                  AND c.status <> 'cancelled'
            ORDER BY COALESCE(c.billing_month, DATE_FORMAT(c.created_at, '%Y-%m')) DESC, c.id DESC
      `);
      const charges = getRows(chargesResult);

      const paymentsResult = await db.execute(sql`
            SELECT
                  p.id,
                  p.charge_id AS chargeId,
                  p.resident_id AS residentId,
                  p.amount,
                  p.payment_date AS paymentDate,
                  p.method,
                  p.note,
                  p.created_at AS createdAt,
                  c.billing_month AS billingMonth,
                  ft.fee_name AS feeName,
                  pi.fee_type_name AS periodItemName
            FROM finance_payments p
            LEFT JOIN finance_charges c ON c.id = p.charge_id
            LEFT JOIN finance_fee_types ft ON ft.id = c.fee_type_id
            LEFT JOIN finance_charge_period_items pi ON pi.id = c.period_item_id
            WHERE p.resident_id = ${residentId}
            ORDER BY p.payment_date DESC, p.id DESC
            LIMIT 100
      `);
      const payments = getRows(paymentsResult);

      const advancesResult = await db.execute(sql`
            SELECT
                  id,
                  source,
                  amount,
                  transaction_date AS transactionDate,
                  target_type AS targetType,
                  target_name AS targetName,
                  description,
                  created_at AS createdAt
            FROM finance_transactions
            WHERE source = 'advance_out'
            ORDER BY transaction_date DESC, id DESC
            LIMIT 500
      `);
      const advanceRows = getRows(advancesResult);
      const { actualByAdvanceId, actualEntriesByAdvanceId } = await getActualSpendingByAdvanceIds(
            db,
            advanceRows.map((row: any) => Number(row.id || 0))
      );

      const personalAdvanceRows = advanceRows.filter((row: any) =>
            advanceMatchesResident(row, {
                  id: residentId,
                  name: input.residentName,
                  code: input.residentCode,
            })
      );
      const unitAdvanceRows = advanceRows.filter((row: any) =>
            (input.unitTargets || []).some((unit) => advanceMatchesUnit(row, unit))
      );

      const personalAdvances = personalAdvanceRows.map((row: any) => mapAdvanceRow(row, actualByAdvanceId, actualEntriesByAdvanceId));
      const unitAdvances = unitAdvanceRows.map((row: any) => mapAdvanceRow(row, actualByAdvanceId, actualEntriesByAdvanceId));

      const openCharges = charges.filter((charge: any) => ['open', 'partial', 'overdue'].includes(String(charge.status || 'open')));
      const paidCharges = charges.filter((charge: any) => String(charge.status || '') === 'paid');
      const totalDue = openCharges.reduce((sum: number, item: any) => sum + toFinanceNumber(item.remainingAmount), 0);
      const totalPaid = charges.reduce((sum: number, item: any) => sum + toFinanceNumber(item.paidAmount), 0);
      const personalAdvanceBalance = personalAdvances.reduce((sum: number, item: any) => sum + toFinanceNumber(item.balanceAmount), 0);
      const unitAdvanceBalance = unitAdvances.reduce((sum: number, item: any) => sum + toFinanceNumber(item.balanceAmount), 0);

      return {
            summary: {
                  totalDue,
                  totalPaid,
                  openChargeCount: openCharges.length,
                  paidChargeCount: paidCharges.length,
                  personalAdvanceBalance,
                  unitAdvanceBalance,
                  personalAdvanceCount: personalAdvances.length,
                  unitAdvanceCount: unitAdvances.length,
            },
            charges,
            openCharges,
            paidCharges,
            payments,
            personalAdvances,
            unitAdvances,
      };
}

export async function createFinanceAdvanceSpendingEntry(input: {
      advanceId: number;
      amount: number;
      transactionDate?: string | null;
      description?: string | null;
      createdBy?: number | null;
}) {
      const db = await getFinanceDb();
      const advanceId = Number(input.advanceId || 0);
      const amount = Number(input.amount || 0);
      const description = String(input.description || '').trim();

      if (!advanceId) throw new Error('Thiếu khoản tạm ứng cần cập nhật.');
      if (amount <= 0) throw new Error('Vui lòng nhập số tiền thực chi hợp lệ.');
      if (!description) throw new Error('Vui lòng nhập nội dung chi thực tế.');

      const advanceResult = await db.execute(sql`
            SELECT id, amount, target_name AS targetName, target_type AS targetType
            FROM finance_transactions
            WHERE id = ${advanceId}
                  AND source = 'advance_out'
            LIMIT 1
      `);
      const advance = getRows(advanceResult)?.[0];
      if (!advance) throw new Error('Không tìm thấy khoản tạm ứng.');

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
                  'advance_actual_spending',
                  'memo',
                  ${amount},
                  ${input.transactionDate || todayText()},
                  ${`advance_entry:${advanceId}`},
                  ${advance.targetName || 'Tạm ứng'},
                  ${description},
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
                  COALESCE(SUM(CASE WHEN direction = 'out' AND source <> 'expense_plan' THEN amount ELSE 0 END), 0) AS totalCashOut
            FROM finance_transactions
      `);

      const transactionSummary = getRows(transactionSummaryResult)?.[0] || {
            totalCashIn: 0,
            totalCashOut: 0,
      };

      return { ...baseSummary, ...transactionSummary };
}
