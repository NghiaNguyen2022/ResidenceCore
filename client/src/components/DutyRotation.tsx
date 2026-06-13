'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      ArrowLeft,
      CheckCircle2,
      ClipboardList,
      RefreshCw,
      Search,
      Shuffle,
      Sparkles,
      X,
} from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { normalizeText } from '@/lib/text';
import { formatTimeRange } from '@/lib/format';

interface Resident {
      id: number;
      residentCode?: string | null;
      code?: string | null;
      residentName?: string | null;
      fullName?: string | null;
      name?: string | null;
      email?: string | null;
      phone?: string | null;
      roomId?: number | null;
      roomCode?: string | null;
      roomName?: string | null;
      isActive?: boolean | null;
      status?: string | null;
}

interface DutyConfig {
      id: number;
      dutyCode: string;
      dutyName: string;
      dutyType: 'daily' | 'weekly' | 'monthly';
      startTime?: string | null;
      endTime?: string | null;
      minPersons: number;
      maxPersons: number;
      requiresStudyScheduleCheck?: boolean | null;
}

interface RotationPreview {
      week: number;
      residents: Array<{
            residentId: number;
            residentName: string;
            residentCode?: string | null;
            roomLabel?: string | null;
            hasConflict: boolean;
            conflictReason?: string;
      }>;
}

interface DutyRotationProps {
      onClose: () => void;
      onSuccess?: () => void;
}

type RotationStep = 'select-duty' | 'select-residents' | 'preview' | 'done';


function getResidentName(resident?: Resident | null) {
      return (
            resident?.residentName ||
            resident?.fullName ||
            resident?.name ||
            'Chưa có tên'
      );
}

function getResidentCode(resident?: Resident | null) {
      return resident?.residentCode || resident?.code || '';
}

function getRoomLabel(resident?: Resident | null) {
      if (!resident) return '';

      if (resident.roomCode && resident.roomName) {
            return `${resident.roomCode} - ${resident.roomName}`;
      }

      if (resident.roomCode) return resident.roomCode;
      if (resident.roomName) return resident.roomName;
      if (resident.roomId) return `Phòng ${resident.roomId}`;

      return 'Chưa có phòng';
}

function getDutyTypeLabel(type?: DutyConfig['dutyType']) {
      if (type === 'daily') return 'Hàng ngày';
      if (type === 'weekly') return 'Hàng tuần';
      if (type === 'monthly') return 'Hàng tháng';
      return '-';
}

function isActiveResident(resident: Resident) {
      if (resident.isActive === false) return false;

      const status = normalizeText(resident.status);

      if (!status) return true;

      return ![
            'inactive',
            'left',
            'ended',
            'archived',
            'da roi',
            'nghi',
            'ngung',
      ].includes(status);
}

function distributeResidentsByWeek({
      residents,
      startWeek,
      numWeeks,
      maxPersons,
}: {
      residents: Resident[];
      startWeek: number;
      numWeeks: number;
      maxPersons: number;
}): RotationPreview[] {
      const weeks: RotationPreview[] = Array.from({ length: numWeeks }, (_, index) => ({
            week: startWeek + index,
            residents: [],
      }));

      if (weeks.length === 0) return [];

      residents.forEach((resident, index) => {
            const weekIndex = index % weeks.length;
            const currentWeek = weeks[weekIndex];
            const willExceedMaxPersons =
                  maxPersons > 0 && currentWeek.residents.length + 1 > maxPersons;

            currentWeek.residents.push({
                  residentId: resident.id,
                  residentName: getResidentName(resident),
                  residentCode: getResidentCode(resident),
                  roomLabel: getRoomLabel(resident),
                  hasConflict: willExceedMaxPersons,
                  conflictReason: willExceedMaxPersons
                        ? `Vượt số người tối đa ${maxPersons}`
                        : undefined,
            });
      });

      return weeks;
}

export default function DutyRotation({ onClose, onSuccess }: DutyRotationProps) {
      const [step, setStep] = useState<RotationStep>('select-duty');
      const [selectedDutyId, setSelectedDutyId] = useState<number | null>(null);
      const [startWeek, setStartWeek] = useState(1);
      const [numWeeks, setNumWeeks] = useState(4);
      const [selectedResidentIds, setSelectedResidentIds] = useState<number[]>([]);
      const [rotationPreview, setRotationPreview] = useState<RotationPreview[]>([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [error, setError] = useState<string | null>(null);

      const dutiesQuery = trpc.duties.listConfigs.useQuery({ isActive: true });

      // Dự án hiện đang dùng members.list cho danh sách học viên.
      // Không dùng residents.listResidents vì router này không có trong backend hiện tại.
      const membersQuery = trpc.members.list.useQuery({
            limit: 500,
            offset: 0,
      });

      const createAssignmentsMutation = trpc.duties.createAssignments.useMutation();

      const duties = useMemo(() => {
            return ((dutiesQuery.data || []) as DutyConfig[]).slice();
      }, [dutiesQuery.data]);

      const residents = useMemo(() => {
            return ((membersQuery.data || []) as Resident[])
                  .filter(isActiveResident)
                  .sort((a, b) => getResidentName(a).localeCompare(getResidentName(b), 'vi'));
      }, [membersQuery.data]);

      const selectedDuty = useMemo(() => {
            return duties.find((duty) => duty.id === selectedDutyId) || null;
      }, [duties, selectedDutyId]);

      const filteredResidents = useMemo(() => {
            const keyword = normalizeText(searchTerm);

            if (!keyword) return residents;

            return residents.filter((resident) => {
                  const haystack = [
                        getResidentName(resident),
                        getResidentCode(resident),
                        getRoomLabel(resident),
                        resident.email,
                        resident.phone,
                  ]
                        .map((value) => normalizeText(value))
                        .join(' ');

                  return haystack.includes(keyword);
            });
      }, [residents, searchTerm]);

      const selectedResidents = useMemo(() => {
            const idSet = new Set(selectedResidentIds);

            return residents.filter((resident) => idSet.has(resident.id));
      }, [residents, selectedResidentIds]);

      const totalPreviewAssignments = useMemo(() => {
            return rotationPreview.reduce(
                  (total, week) => total + week.residents.length,
                  0
            );
      }, [rotationPreview]);

      const handleSelectDuty = () => {
            if (!selectedDutyId || !selectedDuty) {
                  setError('Vui lòng chọn công tác cần chia.');
                  return;
            }

            if (numWeeks <= 0) {
                  setError('Số tuần chia phải lớn hơn 0.');
                  return;
            }

            if (startWeek <= 0) {
                  setError('Tuần bắt đầu phải lớn hơn 0.');
                  return;
            }

            setError(null);
            setStep('select-residents');
      };

      const handleSelectResidents = () => {
            if (!selectedDuty) {
                  setError('Vui lòng chọn công tác trước khi chia.');
                  setStep('select-duty');
                  return;
            }

            if (selectedResidentIds.length === 0) {
                  setError('Vui lòng chọn ít nhất 1 học viên.');
                  return;
            }

            if (selectedResidentIds.length < selectedDuty.minPersons) {
                  setError(
                        `Công tác này cần tối thiểu ${selectedDuty.minPersons} người. Hiện đang chọn ${selectedResidentIds.length} người.`
                  );
                  return;
            }

            const preview = distributeResidentsByWeek({
                  residents: selectedResidents,
                  startWeek,
                  numWeeks,
                  maxPersons: selectedDuty.maxPersons,
            });

            setRotationPreview(preview);
            setError(null);
            setStep('preview');
      };

      const handleSaveRotation = async () => {
            if (!selectedDutyId) return;

            try {
                  setError(null);

                  const assignments = rotationPreview.flatMap((week) =>
                        week.residents.map((resident) => ({
                              dutyConfigId: selectedDutyId,
                              residentId: resident.residentId,
                              assignedWeek: week.week,
                              status: 'pending' as const,
                        }))
                  );

                  if (assignments.length === 0) {
                        setError('Chưa có dữ liệu phân công để lưu.');
                        return;
                  }

                  await createAssignmentsMutation.mutateAsync({
                        assignments,
                  });

                  setStep('done');

                  setTimeout(() => {
                        onSuccess?.();
                        onClose();
                  }, 1200);
            } catch (saveError) {
                  console.error('Error saving duty rotation:', saveError);
                  setError('Không thể lưu chia công tác. Vui lòng kiểm tra lại dữ liệu và thử lại.');
            }
      };

      const toggleResident = (residentId: number) => {
            setSelectedResidentIds((current) =>
                  current.includes(residentId)
                        ? current.filter((id) => id !== residentId)
                        : [...current, residentId]
            );
      };

      const selectAllFilteredResidents = () => {
            setSelectedResidentIds((current) => {
                  const idSet = new Set(current);
                  filteredResidents.forEach((resident) => idSet.add(resident.id));

                  return Array.from(idSet);
            });
      };

      const clearSelectedResidents = () => {
            setSelectedResidentIds([]);
      };

      const shuffleSelectedResidents = () => {
            setSelectedResidentIds((current) => {
                  const next = [...current];

                  for (let index = next.length - 1; index > 0; index -= 1) {
                        const randomIndex = Math.floor(Math.random() * (index + 1));
                        [next[index], next[randomIndex]] = [next[randomIndex], next[index]];
                  }

                  return next;
            });
      };

      const isSaving = createAssignmentsMutation.isPending;
      const isLoading = dutiesQuery.isLoading || membersQuery.isLoading;
      const errorMessage =
            error ||
            dutiesQuery.error?.message ||
            membersQuery.error?.message ||
            null;

      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50 px-6 py-5">
                              <div>
                                    <div className="flex items-center gap-2">
                                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                                                <RefreshCw className="h-5 w-5" />
                                          </span>
                                          <div>
                                                <h2 className="text-xl font-bold text-slate-950">
                                                      Chia công tác tự động
                                                </h2>
                                                <p className="mt-1 text-sm text-slate-500">
                                                      Chọn công tác, chọn học viên và xem trước lịch xoay vòng trước khi lưu.
                                                </p>
                                          </div>
                                    </div>
                              </div>

                              <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                              >
                                    <X className="h-5 w-5" />
                              </button>
                        </div>

                        <div className="border-b border-slate-100 px-6 py-4">
                              <RotationSteps currentStep={step} />
                        </div>

                        <div className="max-h-[calc(92vh-170px)] overflow-y-auto px-6 py-5">
                              {errorMessage && (
                                    <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                          <div className="flex gap-3">
                                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                                <div>
                                                      <p className="font-semibold">
                                                            Có lỗi khi chia công tác.
                                                      </p>
                                                      <p className="mt-1 text-sm">{errorMessage}</p>
                                                </div>
                                          </div>
                                    </div>
                              )}

                              {step === 'select-duty' && (
                                    <div className="space-y-5">
                                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_180px_180px]">
                                                <div>
                                                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                                                            Công tác cần chia
                                                      </label>
                                                      <select
                                                            value={selectedDutyId || ''}
                                                            onChange={(event) =>
                                                                  setSelectedDutyId(
                                                                        Number(event.target.value) || null
                                                                  )
                                                            }
                                                            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                      >
                                                            <option value="">-- Chọn công tác --</option>
                                                            {duties.map((duty) => (
                                                                  <option key={duty.id} value={duty.id}>
                                                                        {duty.dutyName} ({duty.minPersons}-{duty.maxPersons} người)
                                                                  </option>
                                                            ))}
                                                      </select>
                                                </div>

                                                <div>
                                                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                                                            Tuần bắt đầu
                                                      </label>
                                                      <input
                                                            type="number"
                                                            min={1}
                                                            value={startWeek}
                                                            onChange={(event) =>
                                                                  setStartWeek(Number(event.target.value) || 1)
                                                            }
                                                            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                      />
                                                </div>

                                                <div>
                                                      <label className="mb-1 block text-sm font-semibold text-slate-700">
                                                            Số tuần chia
                                                      </label>
                                                      <input
                                                            type="number"
                                                            min={1}
                                                            max={52}
                                                            value={numWeeks}
                                                            onChange={(event) =>
                                                                  setNumWeeks(Number(event.target.value) || 1)
                                                            }
                                                            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                      />
                                                </div>
                                          </div>

                                          {selectedDuty && (
                                                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                                                      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-800">
                                                            <ClipboardList className="h-4 w-4" />
                                                            Thông tin công tác
                                                      </div>

                                                      <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-4">
                                                            <InfoBox
                                                                  label="Tên công tác"
                                                                  value={selectedDuty.dutyName}
                                                            />
                                                            <InfoBox
                                                                  label="Loại"
                                                                  value={getDutyTypeLabel(selectedDuty.dutyType)}
                                                            />
                                                            <InfoBox
                                                                  label="Thời gian"
                                                                  value={formatTimeRange(
                                                                        selectedDuty.startTime,
                                                                        selectedDuty.endTime
                                                                  )}
                                                            />
                                                            <InfoBox
                                                                  label="Số người"
                                                                  value={`${selectedDuty.minPersons} - ${selectedDuty.maxPersons}`}
                                                            />
                                                      </div>
                                                </div>
                                          )}

                                          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                                                <button
                                                      type="button"
                                                      onClick={onClose}
                                                      className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                >
                                                      Hủy
                                                </button>

                                                <button
                                                      type="button"
                                                      onClick={handleSelectDuty}
                                                      disabled={isLoading}
                                                      className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-300"
                                                >
                                                      Tiếp tục
                                                </button>
                                          </div>
                                    </div>
                              )}

                              {step === 'select-residents' && (
                                    <div className="space-y-5">
                                          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                      <div>
                                                            <p className="font-bold text-slate-900">
                                                                  Chọn học viên tham gia xoay vòng
                                                            </p>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                  Đã chọn {selectedResidentIds.length}/{residents.length} học viên.
                                                            </p>
                                                      </div>

                                                      <div className="flex flex-wrap gap-2">
                                                            <button
                                                                  type="button"
                                                                  onClick={selectAllFilteredResidents}
                                                                  className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                                                            >
                                                                  Chọn danh sách đang lọc
                                                            </button>
                                                            <button
                                                                  type="button"
                                                                  onClick={shuffleSelectedResidents}
                                                                  className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                                                            >
                                                                  <Shuffle className="h-3.5 w-3.5" />
                                                                  Đảo thứ tự
                                                            </button>
                                                            <button
                                                                  type="button"
                                                                  onClick={clearSelectedResidents}
                                                                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                                            >
                                                                  Bỏ chọn
                                                            </button>
                                                      </div>
                                                </div>

                                                <div className="relative mt-4">
                                                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                      <input
                                                            type="text"
                                                            value={searchTerm}
                                                            onChange={(event) => setSearchTerm(event.target.value)}
                                                            placeholder="Tìm học viên, mã, phòng..."
                                                            className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 pl-10 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                                      />
                                                </div>
                                          </div>

                                          <div className="grid max-h-[440px] grid-cols-1 gap-2 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3">
                                                {filteredResidents.map((resident) => {
                                                      const selected = selectedResidentIds.includes(resident.id);

                                                      return (
                                                            <button
                                                                  key={resident.id}
                                                                  type="button"
                                                                  onClick={() => toggleResident(resident.id)}
                                                                  className={`rounded-2xl border p-3 text-left transition ${
                                                                        selected
                                                                              ? 'border-blue-300 bg-blue-50 shadow-sm'
                                                                              : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50'
                                                                  }`}
                                                            >
                                                                  <div className="flex items-start gap-3">
                                                                        <span
                                                                              className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                                                                    selected
                                                                                          ? 'border-blue-600 bg-blue-600 text-white'
                                                                                          : 'border-slate-300 bg-white'
                                                                              }`}
                                                                        >
                                                                              {selected && (
                                                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                                              )}
                                                                        </span>

                                                                        <div className="min-w-0">
                                                                              <p className="truncate font-semibold text-slate-900">
                                                                                    {getResidentName(resident)}
                                                                              </p>
                                                                              <p className="mt-1 text-xs text-slate-500">
                                                                                    {getResidentCode(resident) || 'Chưa có mã'} · {getRoomLabel(resident)}
                                                                              </p>
                                                                        </div>
                                                                  </div>
                                                            </button>
                                                      );
                                                })}
                                          </div>

                                          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
                                                <button
                                                      type="button"
                                                      onClick={() => setStep('select-duty')}
                                                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                >
                                                      <ArrowLeft className="h-4 w-4" />
                                                      Quay lại
                                                </button>

                                                <button
                                                      type="button"
                                                      onClick={handleSelectResidents}
                                                      className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                                >
                                                      Xem trước phân công
                                                </button>
                                          </div>
                                    </div>
                              )}

                              {step === 'preview' && (
                                    <div className="space-y-5">
                                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                      <div>
                                                            <p className="font-bold text-slate-900">
                                                                  Xem trước lịch chia công tác
                                                            </p>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                  {totalPreviewAssignments} lượt phân công trong {rotationPreview.length} tuần.
                                                            </p>
                                                      </div>

                                                      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                            {selectedDuty?.dutyName}
                                                      </span>
                                                </div>
                                          </div>

                                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                {rotationPreview.map((week) => (
                                                      <div
                                                            key={week.week}
                                                            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                                                      >
                                                            <div className="mb-3 flex items-center justify-between gap-2">
                                                                  <p className="font-bold text-slate-900">
                                                                        Tuần {week.week}
                                                                  </p>
                                                                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                                                        {week.residents.length} người
                                                                  </span>
                                                            </div>

                                                            <div className="space-y-2">
                                                                  {week.residents.length > 0 ? (
                                                                        week.residents.map((resident) => (
                                                                              <div
                                                                                    key={`${week.week}-${resident.residentId}`}
                                                                                    className={`rounded-xl border px-3 py-2 ${
                                                                                          resident.hasConflict
                                                                                                ? 'border-amber-200 bg-amber-50'
                                                                                                : 'border-slate-100 bg-slate-50'
                                                                                    }`}
                                                                              >
                                                                                    <div className="flex items-start gap-2">
                                                                                          <span
                                                                                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                                                                                                      resident.hasConflict
                                                                                                            ? 'bg-amber-100 text-amber-700'
                                                                                                            : 'bg-green-100 text-green-700'
                                                                                                }`}
                                                                                          >
                                                                                                {resident.hasConflict ? (
                                                                                                      <AlertCircle className="h-3.5 w-3.5" />
                                                                                                ) : (
                                                                                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                                                                                )}
                                                                                          </span>

                                                                                          <div className="min-w-0">
                                                                                                <p className="truncate text-sm font-semibold text-slate-900">
                                                                                                      {resident.residentName}
                                                                                                </p>
                                                                                                <p className="mt-0.5 text-xs text-slate-500">
                                                                                                      {resident.roomLabel || 'Chưa có phòng'}
                                                                                                </p>
                                                                                                {resident.conflictReason && (
                                                                                                      <p className="mt-1 text-xs font-medium text-amber-700">
                                                                                                            {resident.conflictReason}
                                                                                                      </p>
                                                                                                )}
                                                                                          </div>
                                                                                    </div>
                                                                              </div>
                                                                        ))
                                                                  ) : (
                                                                        <div className="rounded-xl border border-dashed border-slate-200 px-3 py-5 text-center text-xs text-slate-400">
                                                                              Không có học viên trong tuần này
                                                                        </div>
                                                                  )}
                                                            </div>
                                                      </div>
                                                ))}
                                          </div>

                                          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
                                                <button
                                                      type="button"
                                                      onClick={() => setStep('select-residents')}
                                                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                                >
                                                      <ArrowLeft className="h-4 w-4" />
                                                      Quay lại
                                                </button>

                                                <button
                                                      type="button"
                                                      onClick={handleSaveRotation}
                                                      disabled={isSaving}
                                                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-slate-300"
                                                >
                                                      {isSaving ? (
                                                            <>
                                                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                                                  Đang lưu...
                                                            </>
                                                      ) : (
                                                            <>
                                                                  <CheckCircle2 className="h-4 w-4" />
                                                                  Lưu chia công tác
                                                            </>
                                                      )}
                                                </button>
                                          </div>
                                    </div>
                              )}

                              {step === 'done' && (
                                    <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
                                          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-green-50 text-green-700">
                                                <Sparkles className="h-8 w-8" />
                                          </span>
                                          <h3 className="text-xl font-bold text-slate-950">
                                                Chia công tác thành công
                                          </h3>
                                          <p className="mt-2 max-w-md text-sm text-slate-500">
                                                Đã tạo {totalPreviewAssignments} lượt phân công. Danh sách công tác sẽ được cập nhật lại sau khi đóng màn hình này.
                                          </p>
                                    </div>
                              )}
                        </div>
                  </div>
            </div>
      );
}

function RotationSteps({ currentStep }: { currentStep: RotationStep }) {
      const steps: Array<{ key: RotationStep; label: string }> = [
            { key: 'select-duty', label: 'Chọn công tác' },
            { key: 'select-residents', label: 'Chọn học viên' },
            { key: 'preview', label: 'Xem trước' },
            { key: 'done', label: 'Hoàn thành' },
      ];

      const currentIndex = steps.findIndex((step) => step.key === currentStep);

      return (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {steps.map((step, index) => {
                        const active = index <= currentIndex;

                        return (
                              <div
                                    key={step.key}
                                    className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${
                                          active
                                                ? 'border-blue-200 bg-blue-50 text-blue-700'
                                                : 'border-slate-200 bg-slate-50 text-slate-400'
                                    }`}
                              >
                                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs shadow-sm">
                                          {index + 1}
                                    </span>
                                    {step.label}
                              </div>
                        );
                  })}
            </div>
      );
}

function InfoBox({ label, value }: { label: string; value: string }) {
      return (
            <div className="rounded-xl border border-blue-100 bg-white/80 px-3 py-2">
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-900">{value}</p>
            </div>
      );
}
