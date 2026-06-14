'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      CalendarDays,
      CheckCircle2,
      Church,
      Clock3,
      Edit2,
      Search,
      UserCheck,
      UserMinus,
      UserX,
      Users,
      X,
} from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfigurableStatCard } from '@/components/configurable/ConfigurableStatCard';
import {
      ConfigurableColumn,
      ConfigurableDataTable,
} from '@/components/configurable/ConfigurableDataTable';
import { normalizeText } from '@/lib/text';
import { DatePickerInput } from '@/components/shared/form/DatePickerInput';

type LiturgyAttendanceType = 'mass' | 'evening_prayer' | 'adoration' | 'retreat' | 'other';
type LiturgyAttendanceStatus = 'present' | 'late' | 'excused' | 'absent';

type Resident = {
      id: number;
      residentCode?: string | null;
      code?: string | null;
      fullName?: string | null;
      name?: string | null;
      status?: string | null;
      roomId?: number | null;
      roomCode?: string | null;
      roomName?: string | null;
};

type AttendanceRecord = {
      residentId: number;
      status: LiturgyAttendanceStatus;
      note: string;
      checkedAt?: string | null;
};

type AttendanceRow = {
      resident: Resident;
      record: AttendanceRecord;
};

const statusOptions = [
      {
            status: 'present' as const,
            label: 'Có mặt',
            shortLabel: 'Có mặt',
            className: 'border-green-200 bg-green-50 text-green-700',
      },
      {
            status: 'late' as const,
            label: 'Đi trễ',
            shortLabel: 'Trễ',
            className: 'border-amber-200 bg-amber-50 text-amber-700',
      },
      {
            status: 'excused' as const,
            label: 'Vắng phép',
            shortLabel: 'Phép',
            className: 'border-blue-200 bg-blue-50 text-blue-700',
      },
      {
            status: 'absent' as const,
            label: 'Vắng không phép',
            shortLabel: 'Vắng',
            className: 'border-red-200 bg-red-50 text-red-700',
      },
];

function getTodayDateString() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
}


function getResidentName(resident: Resident) {
      return resident.fullName || resident.name || 'Chưa có tên';
}

function getResidentCode(resident: Resident) {
      return resident.residentCode || resident.code || '';
}

function getRoomLabel(resident: Resident) {
      if (resident.roomCode && resident.roomName) return `${resident.roomCode} - ${resident.roomName}`;
      if (resident.roomCode) return resident.roomCode;
      if (resident.roomName) return resident.roomName;
      if (resident.roomId) return `Phòng ${resident.roomId}`;

      return 'Chưa có phòng';
}

function getAttendanceTypeLabel(value: LiturgyAttendanceType) {
      if (value === 'mass') return 'Thánh lễ';
      if (value === 'evening_prayer') return 'Kinh tối';
      if (value === 'adoration') return 'Chầu Thánh Thể';
      if (value === 'retreat') return 'Tĩnh tâm';
      return 'Khác';
}

function getStatusLabel(status: LiturgyAttendanceStatus) {
      return statusOptions.find((item) => item.status === status)?.label || status;
}

function getStatusClass(status: LiturgyAttendanceStatus) {
      return (
            statusOptions.find((item) => item.status === status)?.className ||
            'border-slate-200 bg-slate-50 text-slate-700'
      );
}

function buildDefaultRecords(residents: Resident[]) {
      const next: Record<number, AttendanceRecord> = {};

      residents.forEach((resident) => {
            next[resident.id] = {
                  residentId: resident.id,
                  status: 'present',
                  note: '',
                  checkedAt: null,
            };
      });

      return next;
}

function isActiveResident(resident: Resident) {
      const status = normalizeText(resident.status);

      if (!status) return true;

      return !['inactive', 'left', 'ended', 'archived', 'da roi', 'nghi', 'ngung'].includes(status);
}

export default function LiturgyAttendance() {
      const [attendanceDate, setAttendanceDate] = useState(getTodayDateString());
      const [attendanceType, setAttendanceType] = useState<LiturgyAttendanceType>('evening_prayer');
      const [searchTerm, setSearchTerm] = useState('');
      const [statusFilter, setStatusFilter] = useState<'all' | LiturgyAttendanceStatus>('all');
      const [records, setRecords] = useState<Record<number, AttendanceRecord>>({});
      const [editingRow, setEditingRow] = useState<AttendanceRow | null>(null);
      const [noteDraft, setNoteDraft] = useState('');
      const [error, setError] = useState<string | null>(null);

      const membersQuery = trpc.members.list.useQuery({
            limit: 500,
            offset: 0,
      });

      const residents = useMemo(() => {
            const data = (membersQuery.data || []) as Resident[];

            return data
                  .filter(isActiveResident)
                  .sort((a, b) => getResidentName(a).localeCompare(getResidentName(b), 'vi'));
      }, [membersQuery.data]);

      const effectiveRecords = useMemo(() => {
            return {
                  ...buildDefaultRecords(residents),
                  ...records,
            };
      }, [residents, records]);

      const rows = useMemo<AttendanceRow[]>(() => {
            const keyword = normalizeText(searchTerm);

            return residents
                  .map((resident) => ({
                        resident,
                        record: effectiveRecords[resident.id],
                  }))
                  .filter((row) => {
                        if (statusFilter !== 'all' && row.record.status !== statusFilter) return false;

                        if (!keyword) return true;

                        const haystack = [
                              getResidentName(row.resident),
                              getResidentCode(row.resident),
                              getRoomLabel(row.resident),
                              row.record.note,
                        ]
                              .map((value) => normalizeText(value))
                              .join(' ');

                        return haystack.includes(keyword);
                  });
      }, [residents, effectiveRecords, searchTerm, statusFilter]);

      const stats = useMemo(() => {
            const allRows = residents.map((resident) => ({
                  resident,
                  record: effectiveRecords[resident.id],
            }));

            return {
                  total: allRows.length,
                  present: allRows.filter((row) => row.record.status === 'present').length,
                  late: allRows.filter((row) => row.record.status === 'late').length,
                  excused: allRows.filter((row) => row.record.status === 'excused').length,
                  absent: allRows.filter((row) => row.record.status === 'absent').length,
            };
      }, [residents, effectiveRecords]);

      const setStatusForResident = (
            residentId: number,
            status: LiturgyAttendanceStatus
      ) => {
            setRecords((current) => ({
                  ...current,
                  [residentId]: {
                        ...(effectiveRecords[residentId] || {
                              residentId,
                              note: '',
                        }),
                        residentId,
                        status,
                        checkedAt: new Date().toISOString(),
                  },
            }));
      };

      const setStatusForAll = (status: LiturgyAttendanceStatus) => {
            const next: Record<number, AttendanceRecord> = {};

            residents.forEach((resident) => {
                  next[resident.id] = {
                        ...(effectiveRecords[resident.id] || {
                              residentId: resident.id,
                              note: '',
                        }),
                        residentId: resident.id,
                        status,
                        checkedAt: new Date().toISOString(),
                  };
            });

            setRecords((current) => ({
                  ...current,
                  ...next,
            }));
      };

      const openNoteModal = (row: AttendanceRow) => {
            setEditingRow(row);
            setNoteDraft(row.record.note || '');
            setError(null);
      };

      const closeNoteModal = () => {
            setEditingRow(null);
            setNoteDraft('');
            setError(null);
      };

      const saveNote = () => {
            if (!editingRow) return;

            const residentId = editingRow.resident.id;

            setRecords((current) => ({
                  ...current,
                  [residentId]: {
                        ...(effectiveRecords[residentId] || {
                              residentId,
                              status: 'present',
                        }),
                        residentId,
                        note: noteDraft.trim(),
                        checkedAt: new Date().toISOString(),
                  },
            }));

            closeNoteModal();
      };

      const clearFilters = () => {
            setSearchTerm('');
            setStatusFilter('all');
      };

      const columns = useMemo<ConfigurableColumn<AttendanceRow>[]>(
            () => [
                  {
                        key: 'resident',
                        label: 'Học viên',
                        sortable: true,
                        sortValue: (row) => getResidentName(row.resident),
                        render: (row) => (
                              <div>
                                    <p className="font-semibold text-slate-900">
                                          {getResidentName(row.resident)}
                                    </p>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                          {getResidentCode(row.resident) && <span>{getResidentCode(row.resident)}</span>}
                                          <span>{getRoomLabel(row.resident)}</span>
                                    </div>
                              </div>
                        ),
                  },
                  {
                        key: 'status',
                        label: 'Trạng thái',
                        sortable: true,
                        sortValue: (row) => row.record.status,
                        render: (row) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                          row.record.status
                                    )}`}
                              >
                                    {getStatusLabel(row.record.status)}
                              </span>
                        ),
                  },
                  {
                        key: 'quickActions',
                        label: 'Điểm danh nhanh',
                        className: 'min-w-[290px]',
                        render: (row) => (
                              <div className="flex flex-wrap items-center gap-1.5">
                                    {statusOptions.map((option) => (
                                          <button
                                                key={option.status}
                                                type="button"
                                                onClick={() =>
                                                      setStatusForResident(row.resident.id, option.status)
                                                }
                                                className={`rounded-lg border px-2 py-1 text-xs font-semibold transition ${row.record.status === option.status
                                                            ? option.className
                                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                                      }`}
                                          >
                                                {option.shortLabel}
                                          </button>
                                    ))}
                              </div>
                        ),
                  },
                  {
                        key: 'note',
                        label: 'Ghi chú',
                        sortable: true,
                        sortValue: (row) => row.record.note || '',
                        render: (row) => (
                              <div className="max-w-xs truncate text-sm text-slate-600">
                                    {row.record.note || '-'}
                              </div>
                        ),
                  },
                  {
                        key: 'checkedAt',
                        label: 'Cập nhật',
                        defaultVisible: false,
                        sortable: true,
                        sortValue: (row) => row.record.checkedAt || '',
                        render: (row) =>
                              row.record.checkedAt
                                    ? new Date(row.record.checkedAt).toLocaleTimeString('vi-VN', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                    })
                                    : '-',
                  },
                  {
                        key: 'actions',
                        label: 'Hành động',
                        render: (row) => (
                              <button
                                    type="button"
                                    onClick={() => openNoteModal(row)}
                                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                              >
                                    <Edit2 className="h-4 w-4" />
                                    Ghi chú
                              </button>
                        ),
                  },
            ],
            [effectiveRecords]
      );

      return (
            <ResidenceCareLayout>
                  <div className="space-y-6 p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                    <p className="text-sm font-semibold text-blue-600">
                                          Phụng vụ & Cộng đoàn
                                    </p>
                                    <h1 className="mt-1 text-3xl font-bold text-neutral-900">
                                          Đi lễ / Kinh tối
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Theo dõi sự tham dự của học viên trong Thánh lễ, kinh tối, chầu và các giờ cầu nguyện chung.
                                    </p>
                              </div>

                              <div className="flex flex-col gap-2 sm:flex-row">
                                    <button
                                          type="button"
                                          onClick={() => setStatusForAll('present')}
                                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-100"
                                    >
                                          <UserCheck className="h-4 w-4" />
                                          Tất cả có mặt
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => setStatusForAll('absent')}
                                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                                    >
                                          <UserX className="h-4 w-4" />
                                          Tất cả vắng
                                    </button>
                              </div>
                        </div>

                        {(error || membersQuery.error) && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">
                                                      Có lỗi khi xử lý điểm danh phụng vụ.
                                                </p>
                                                <p className="mt-1 text-sm">
                                                      {error || membersQuery.error?.message || 'Vui lòng kiểm tra lại dữ liệu.'}
                                                </p>
                                          </div>
                                    </div>
                              </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                              <ConfigurableStatCard
                                    moduleKey="liturgyAttendance"
                                    cardKey="liturgyAttendance.total"
                                    label="Tổng học viên"
                                    value={stats.total}
                                    description="Số học viên trong danh sách"
                                    tone="blue"
                                    icon={<Users className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="liturgyAttendance"
                                    cardKey="liturgyAttendance.present"
                                    label="Có mặt"
                                    value={stats.present}
                                    description="Đã ghi nhận tham dự"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="liturgyAttendance"
                                    cardKey="liturgyAttendance.late"
                                    label="Đi trễ"
                                    value={stats.late}
                                    description="Có mặt nhưng trễ giờ"
                                    tone="orange"
                                    icon={<Clock3 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="liturgyAttendance"
                                    cardKey="liturgyAttendance.excused"
                                    label="Vắng phép"
                                    value={stats.excused}
                                    description="Có lý do được ghi nhận"
                                    tone="purple"
                                    icon={<UserMinus className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="liturgyAttendance"
                                    cardKey="liturgyAttendance.absent"
                                    label="Vắng"
                                    value={stats.absent}
                                    description="Chưa có lý do"
                                    tone="red"
                                    icon={<UserX className="h-6 w-6" />}
                              />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[220px_260px_1fr_220px_auto]">
                                    <div>
                                          <Label htmlFor="attendanceDate">Ngày</Label>
                                          <DatePickerInput
                                                id="attendanceDate"
                                                value={attendanceDate}
                                                onChange={(event) => setAttendanceDate(event.target.value)}
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="attendanceType">Loại tham dự</Label>
                                          <select
                                                id="attendanceType"
                                                value={attendanceType}
                                                onChange={(event) =>
                                                      setAttendanceType(event.target.value as LiturgyAttendanceType)
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="mass">Thánh lễ</option>
                                                <option value="evening_prayer">Kinh tối</option>
                                                <option value="adoration">Chầu Thánh Thể</option>
                                                <option value="retreat">Tĩnh tâm</option>
                                                <option value="other">Khác</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label>Tìm kiếm</Label>
                                          <div className="relative">
                                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                                <Input
                                                      value={searchTerm}
                                                      onChange={(event) => setSearchTerm(event.target.value)}
                                                      placeholder="Tìm học viên, mã, phòng, ghi chú..."
                                                      className="pl-10"
                                                />
                                          </div>
                                    </div>

                                    <div>
                                          <Label>Trạng thái</Label>
                                          <select
                                                value={statusFilter}
                                                onChange={(event) =>
                                                      setStatusFilter(event.target.value as 'all' | LiturgyAttendanceStatus)
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="all">Tất cả</option>
                                                <option value="present">Có mặt</option>
                                                <option value="late">Đi trễ</option>
                                                <option value="excused">Vắng phép</option>
                                                <option value="absent">Vắng không phép</option>
                                          </select>
                                    </div>

                                    <div className="flex items-end">
                                          <button
                                                type="button"
                                                onClick={clearFilters}
                                                className="h-10 w-full rounded-xl border border-neutral-300 px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                                          >
                                                Xóa lọc
                                          </button>
                                    </div>
                              </div>

                              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-sm text-blue-800">
                                    <span className="font-semibold">{getAttendanceTypeLabel(attendanceType)}</span>{' '}
                                    · {new Date(attendanceDate).toLocaleDateString('vi-VN')}
                              </div>
                        </div>

                        <ConfigurableDataTable
                              moduleKey="liturgyAttendance"
                              tableKey="liturgyAttendance.list"
                              columns={columns}
                              data={rows}
                              getRowKey={(row) => row.resident.id}
                              isLoading={membersQuery.isLoading}
                              loadingText="Đang tải danh sách học viên..."
                              emptyTitle="Không có học viên phù hợp"
                              emptyDescription="Thử thay đổi bộ lọc hoặc kiểm tra danh sách học viên."
                        />

                        {editingRow && (
                              <NoteModal
                                    row={editingRow}
                                    noteDraft={noteDraft}
                                    setNoteDraft={setNoteDraft}
                                    onClose={closeNoteModal}
                                    onSave={saveNote}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function NoteModal({
      row,
      noteDraft,
      setNoteDraft,
      onClose,
      onSave,
}: {
      row: AttendanceRow;
      noteDraft: string;
      setNoteDraft: React.Dispatch<React.SetStateAction<string>>;
      onClose: () => void;
      onSave: () => void;
}) {
      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
                              <div>
                                    <h2 className="text-xl font-bold text-neutral-900">Ghi chú tham dự</h2>
                                    <p className="text-sm text-neutral-500">
                                          {getResidentName(row.resident)} · {getRoomLabel(row.resident)}
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-lg p-2 transition hover:bg-neutral-100"
                              >
                                    <X className="h-5 w-5" />
                              </button>
                        </div>

                        <div className="space-y-4 p-6">
                              <div>
                                    <Label htmlFor="attendanceNote">Nội dung ghi chú</Label>
                                    <Textarea
                                          id="attendanceNote"
                                          value={noteDraft}
                                          onChange={(event) => setNoteDraft(event.target.value)}
                                          placeholder="Nhập lý do vắng, lý do đi trễ hoặc ghi chú cần theo dõi..."
                                          className="min-h-32"
                                    />
                              </div>

                              <div className="flex flex-col-reverse gap-3 border-t border-neutral-200 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                          type="button"
                                          onClick={onClose}
                                          className="rounded-xl border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                                    >
                                          Hủy
                                    </button>

                                    <button
                                          type="button"
                                          onClick={onSave}
                                          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                          Lưu ghi chú
                                    </button>
                              </div>
                        </div>
                  </div>
            </div>
      );
}
