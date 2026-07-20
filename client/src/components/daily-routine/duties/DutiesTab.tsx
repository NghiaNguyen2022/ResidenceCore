'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import DutyAssignmentForm from './DutyAssignmentForm';
import DutyDayView from './DutyDayView';
import DutyMonthView from './DutyMonthView';
import DutyViewSwitcher from './DutyViewSwitcher';
import DutyWeekView from './DutyWeekView';

type DutyStatusFilter = 'all' | 'open' | 'overdue' | 'completed' | 'skipped' | 'absent' | 'cancelled';
type AssignToType = 'resident' | 'team' | 'room' | 'committee';
type DutyViewMode = 'day' | 'week' | 'month';

type DayOfWeek =
      | 'monday'
      | 'tuesday'
      | 'wednesday'
      | 'thursday'
      | 'friday'
      | 'saturday'
      | 'sunday';

type RepeatType = 'once' | 'weekly' | 'monthly';
type MonthlyMode = 'month_boundary' | 'day_of_month' | 'week_day';
type MonthBoundary = 'first_day' | 'last_day';
type MonthWeek = '1' | '2' | '3' | '4' | 'last';

type AssignmentForm = {
      dutyConfigId: string;
      assignedDate: string;
      startTime: string;
      endTime: string;
      assignedToType: AssignToType;
      assignedToId: string;
      assignedToIds: string[];
      assignWholeWeek: boolean;
      repeatType: RepeatType;
      repeatEndDate: string;
      weeklyDays: DayOfWeek[];
      monthlyMode: MonthlyMode;
      monthBoundary: MonthBoundary;
      monthDays: number[];
      monthWeeks: MonthWeek[];
      monthWeekDays: DayOfWeek[];
      notes: string;
      storeShiftType: '' | 'morning' | 'afternoon';
      storeLedgerId: string;
      primaryResidentId: string;
      openingCashPlanned: string;
};

type SmartAssigneeOption = {
      id: number | string;
      label: string;
      todayCount?: number;
      weekCount?: number;
      monthCount?: number;
      isBusyToday?: boolean;
      isOverloaded?: boolean;
      recommendScore?: number;
      recommendLabel?: string;
};

type DutiesTabProps = {
      assignmentForm: AssignmentForm;
      onAssignmentFormChange: (form: AssignmentForm) => void;

      dutyConfigs: any[];
      selectedDutyConfig?: any | null;
      assigneeOptions: SmartAssigneeOption[];
      storeLedgers?: any[];

      previewEnabled: boolean;
      previewLoading?: boolean;
      preview?: {
            canCreateCount: number;
            skippedCount: number;
            items: Array<{
                  date: string;
                  assignedToId?: number;
                  canCreate: boolean;
                  reason?: string;
                  detail?: string;
                  conflictType?: string;
                  currentResidentCount?: number;
                  minPersons?: number | null;
                  maxPersons?: number | null;
            }>;
      } | null;

      isSaving?: boolean;
      onSaveAssignment: () => void;
      onOpenDutyTemplateDialog: () => void;
      openAssignmentSignal?: number;

      selectedDate: string;
      onDateChange: (value: string) => void;
      statusFilter: DutyStatusFilter;
      onStatusFilterChange: (value: DutyStatusFilter) => void;

      assignments: any[];
      allAssignments?: any[];

      isLoadingAssignments?: boolean;
      onCompleteDuty: (assignment: any) => void;
      onSkipDuty: (assignment: any) => void;
      onCancelDuty: (assignment: any) => void;
      onOpenToday?: () => void;
      onOpenRoutine?: () => void;
};

export function DutiesTab({
      assignmentForm,
      onAssignmentFormChange,
      dutyConfigs,
      selectedDutyConfig,
      assigneeOptions,
      storeLedgers = [],
      previewEnabled,
      previewLoading,
      preview,
      isSaving,
      onSaveAssignment,
      onOpenDutyTemplateDialog,
      openAssignmentSignal,
      selectedDate,
      onDateChange,
      statusFilter,
      onStatusFilterChange,
      assignments,
      allAssignments,
      isLoadingAssignments,
      onCompleteDuty,
      onSkipDuty,
      onCancelDuty,
}: DutiesTabProps) {
      const [viewMode, setViewMode] = useState<DutyViewMode>('day');
      const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
      const lastOpenAssignmentSignalRef = useRef(openAssignmentSignal || 0);

      useEffect(() => {
            const nextSignal = openAssignmentSignal || 0;

            if (nextSignal <= lastOpenAssignmentSignalRef.current) {
                  return;
            }

            lastOpenAssignmentSignalRef.current = nextSignal;
            setIsAssignmentModalOpen(true);
      }, [openAssignmentSignal]);

      const shiftDate = (amount: number) => {
            const [year, month, day] = selectedDate.split('-').map(Number);
            const date = new Date(year, month - 1, day);

            if (viewMode === 'month') {
                  date.setMonth(date.getMonth() + amount);
            } else {
                  date.setDate(date.getDate() + amount * (viewMode === 'week' ? 7 : 1));
            }

            const nextYear = date.getFullYear();
            const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
            const nextDay = String(date.getDate()).padStart(2, '0');

            onDateChange(`${nextYear}-${nextMonth}-${nextDay}`);
      };

      const goToday = () => {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            onDateChange(`${year}-${month}-${day}`);
      };

      const selectDateAndOpenDayView = (date: string) => {
            onDateChange(date);
            setViewMode('day');
      };

      const rangeAssignments = allAssignments || assignments;

      const getCurrentLabel = () => {
            if (viewMode === 'week') return 'Tuần này';
            if (viewMode === 'month') return 'Tháng này';

            return 'Hôm nay';
      };

      const formatDutyTime = (value?: string | Date | null) => {
            if (!value) return '';

            if (value instanceof Date) {
                  return value.toTimeString().slice(0, 5);
            }

            const text = String(value);
            if (text.includes('T')) return text.slice(11, 16);

            return text.slice(0, 5);
      };

      const handleAssignDutyConfig = (dutyConfig: any) => {
            onAssignmentFormChange({
                  ...assignmentForm,
                  dutyConfigId: String(dutyConfig?.id || ''),
                  assignedDate: selectedDate,
                  startTime: formatDutyTime(dutyConfig?.startTime),
                  endTime: formatDutyTime(dutyConfig?.endTime),
                  assignedToId: '',
                  assignedToIds: [],
                  repeatType: 'once',
                  repeatEndDate: selectedDate,
                  assignWholeWeek: false,
                  storeShiftType: '',
                  primaryResidentId: '',
                  openingCashPlanned: '0',
            });
            setIsAssignmentModalOpen(true);
      };

      const handleSaveAssignment = async () => {
            await onSaveAssignment();
            setIsAssignmentModalOpen(false);
      };

      return (
            <div className="space-y-4">
                  <div className="flex flex-col gap-3 rounded-[22px] border border-amber-100/70 bg-white/72 p-2 lg:flex-row lg:items-center lg:justify-between">
                        <div className="inline-flex w-full rounded-xl border border-amber-100/70 bg-white/76 p-1 lg:w-auto">
                              <button
                                    type="button"
                                    onClick={() => shiftDate(-1)}
                                    className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-slate-600 transition hover:bg-amber-50"
                                    aria-label="Kỳ trước"
                              >
                                    <ChevronLeft className="h-4 w-4" />
                              </button>
                              <button
                                    type="button"
                                    onClick={goToday}
                                    className="min-w-[96px] rounded-lg px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50"
                              >
                                    {getCurrentLabel()}
                              </button>
                              <button
                                    type="button"
                                    onClick={() => shiftDate(1)}
                                    className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-slate-600 transition hover:bg-amber-50"
                                    aria-label="Kỳ sau"
                              >
                                    <ChevronRight className="h-4 w-4" />
                              </button>
                        </div>

                        <DutyViewSwitcher value={viewMode} onChange={setViewMode} />
                  </div>

                  {viewMode === 'day' && (
                        <DutyDayView
                              selectedDate={selectedDate}
                              onDateChange={onDateChange}
                              statusFilter={statusFilter}
                              onStatusFilterChange={onStatusFilterChange}
                              assignments={assignments}
                              dutyConfigs={dutyConfigs}
                              isLoading={isLoadingAssignments}
                              onAssignDutyConfig={handleAssignDutyConfig}
                              onCompleteDuty={onCompleteDuty}
                              onSkipDuty={onSkipDuty}
                              onCancelDuty={onCancelDuty}
                        />
                  )}

                  {viewMode === 'week' && (
                        <DutyWeekView
                              selectedDate={selectedDate}
                              assignments={rangeAssignments}
                              onSelectDate={selectDateAndOpenDayView}
                        />
                  )}

                  {viewMode === 'month' && (
                        <DutyMonthView
                              selectedDate={selectedDate}
                              assignments={rangeAssignments}
                              onSelectDate={selectDateAndOpenDayView}
                        />
                  )}

                  {isAssignmentModalOpen && (
                        <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/38 px-4 py-6 backdrop-blur-sm">
                              <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_72%,#fff8ef_100%)] shadow-[0_16px_40px_rgba(15,23,42,0.14)]">
                                    <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-amber-100/70 bg-white/94 px-5 py-4 backdrop-blur">
                                          <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                                                      Phân công thông minh
                                                </p>
                                                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                                                      Phân công công tác
                                                </h2>
                                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                                      Chọn công tác, ngày/chu kỳ và đối tượng. Danh sách sẽ hiển thị tải việc để phân công công bằng hơn.
                                                </p>
                                          </div>

                                          <button
                                                type="button"
                                                onClick={() => setIsAssignmentModalOpen(false)}
                                                className="rounded-xl border border-amber-100 bg-white px-2.5 py-2 text-slate-500 shadow-[0_4px_12px_rgba(120,53,15,0.035)] transition hover:bg-amber-50"
                                          >
                                                <X className="h-4 w-4" />
                                          </button>
                                    </div>

                                    <div className="max-h-[calc(100vh-180px)] overflow-y-auto p-5">
                                          <DutyAssignmentForm
                                                form={assignmentForm}
                                                onChange={onAssignmentFormChange}
                                                dutyConfigs={dutyConfigs}
                                                selectedDutyConfig={selectedDutyConfig}
                                                assigneeOptions={assigneeOptions}
                                                storeLedgers={storeLedgers}
                                                previewEnabled={previewEnabled}
                                                previewLoading={previewLoading}
                                                preview={preview}
                                                isSaving={isSaving}
                                                onSave={handleSaveAssignment}
                                                onOpenDutyTemplateDialog={onOpenDutyTemplateDialog}
                                                fullScreen
                                          />
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
}

export default DutiesTab;
