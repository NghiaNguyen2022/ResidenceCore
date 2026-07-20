'use client';

import { useMemo, useState, useEffect } from 'react';
import {
      Clock,
      Plus,
      X,
} from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { useAutoDismissMessage } from '@/hooks/useAutoDismissMessage';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { residenceMediumStyle } from '@/components/shared/styleMedium';
import DutyConfigForm from '@/components/DutyConfigForm';
import TodayOverviewTab from '@/components/daily-routine/today/TodayOverviewTab';
import DutiesTab from '@/components/daily-routine/duties/DutiesTab';
import DutyTemplateDialog from '@/components/daily-routine/duties/DutyTemplateDialog';
import RoutineSetupTab from '@/components/daily-routine/routine/RoutineSetupTab';
import RoutineTemplateModal from '@/components/daily-routine/routine/RoutineTemplateModal';
import RoutineItemModal from '@/components/daily-routine/routine/RoutineItemModal';
import {
      AppMessageBox,
      type AppMessageBoxState,
} from '@/components/common/AppMessageBox';
import { formatTime } from '@/lib/format';
import { DEFAULT_TIME } from '@/lib/formDefaults';

type DayType = 'weekday' | 'sunday' | 'special';

type DailyRoutineView = 'today' | 'routine' | 'duties';

type DutyStatusFilter = 'all' | 'open' | 'overdue' | 'completed' | 'skipped' | 'absent' | 'cancelled';

type AssignToType = 'resident' | 'team' | 'room' | 'committee';

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

      // 16L2 — chỉ dùng cho công tác Trực cửa hàng.
      storeShiftType: '' | 'morning' | 'afternoon';
      storeLedgerId: string;
      primaryResidentId: string;
      openingCashPlanned: string;
};

type TemplateForm = {
      id?: number;
      code: string;
      name: string;
      dayType: DayType;
      description: string;
      isActive: boolean;
      sortOrder: string;
};

type ItemForm = {
      id?: number;
      templateId: string;
      startTime: string;
      endTime: string;
      title: string;
      location: string;
      description: string;
      isActive: boolean;
      sortOrder: string;
};

const emptyTemplateForm: TemplateForm = {
      code: '',
      name: '',
      dayType: 'weekday',
      description: '',
      isActive: true,
      sortOrder: '10',
};

const emptyItemForm: ItemForm = {
      templateId: '',
      startTime: DEFAULT_TIME,
      endTime: DEFAULT_TIME,
      title: '',
      location: '',
      description: '',
      isActive: true,
      sortOrder: '10',
};

function getDayTypeLabel(dayType?: string | null) {
      if (dayType === 'weekday') return 'Ngày thường';
      if (dayType === 'sunday') return 'Chúa nhật';
      if (dayType === 'special') return 'Ngày đặc biệt';
      return 'Chưa xác định';
}

function getDayTypeClass(dayType?: string | null) {
      if (dayType === 'weekday') return 'border-amber-100 bg-amber-50 text-amber-800';
      if (dayType === 'sunday') return 'border-purple-100 bg-purple-50 text-purple-700';
      if (dayType === 'special') return 'border-amber-100 bg-amber-50 text-amber-700';
      return 'border-slate-100 bg-slate-50 text-slate-600';
}

function todayValue() {
      return formatDateValue(new Date());
}

function formatDateValue(date: Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
}

const DAY_INDEX_BY_VALUE: Record<DayOfWeek, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
};

const DAY_VALUE_BY_INDEX: DayOfWeek[] = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
];

function getDayOfWeekValue(dateText: string): DayOfWeek {
      const date = parseDateValue(dateText);
      return DAY_VALUE_BY_INDEX[date.getDay()] || 'monday';
}

function getWeekRangeValues(dateText: string) {
      const startDate = parseDateValue(dateText);
      const endDate = addDays(startDate, 6);

      return {
            startDate: formatDateValue(startDate),
            endDate: formatDateValue(endDate),
      };
}

function getForwardWeekRangeValues(dateText: string) {
      const startDate = parseDateValue(dateText);
      const endDate = addDays(startDate, 6);

      return {
            startDate: formatDateValue(startDate),
            endDate: formatDateValue(endDate),
      };
}

function getMonthRangeForDateValue(dateText: string) {
      const date = parseDateValue(dateText);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      return {
            startDate: formatDateValue(startDate),
            endDate: formatDateValue(endDate),
      };
}

function normalizeJsonArray<T extends string | number>(value: unknown): T[] {
      if (Array.isArray(value)) return value as T[];

      if (typeof value === 'string' && value.trim()) {
            try {
                  const parsed = JSON.parse(value);
                  return Array.isArray(parsed) ? (parsed as T[]) : [];
            } catch {
                  return [];
            }
      }

      return [];
}

function getDutyConfigType(dutyConfig?: any | null) {
      return dutyConfig?.dutyType || dutyConfig?.frequency || 'daily';
}

function getConfigWeeklyDays(dutyConfig?: any | null): DayOfWeek[] {
      const configured = normalizeJsonArray<DayOfWeek>(dutyConfig?.weeklyDaysJson);

      if (configured.length > 0) return configured;

      if (Number.isInteger(dutyConfig?.dayOfWeek)) {
            return [DAY_VALUE_BY_INDEX[Number(dutyConfig.dayOfWeek)] || 'monday'];
      }

      return [];
}

function getConfigMonthWeeks(dutyConfig?: any | null): MonthWeek[] {
      const configured = normalizeJsonArray<MonthWeek>(dutyConfig?.monthWeeksJson);
      return configured.length > 0 ? configured : ['last'];
}

function getConfigMonthWeekDays(dutyConfig?: any | null): DayOfWeek[] {
      const configured = normalizeJsonArray<DayOfWeek>(dutyConfig?.monthWeekDaysJson);
      return configured.length > 0 ? configured : ['saturday'];
}

function getConfigMonthDays(dutyConfig?: any | null): number[] {
      return normalizeJsonArray<number>(dutyConfig?.monthDaysJson);
}

function shouldUseConfigMonthDays(dutyConfig?: any | null) {
      return getConfigMonthDays(dutyConfig).length > 0;
}

function getScheduleDateRange(form: AssignmentForm) {
      const startDate = form.assignedDate;
      let endDate = form.repeatEndDate || form.assignedDate;

      if (form.repeatType === 'once') {
            endDate = startDate;
      }

      if (endDate < startDate) {
            endDate = startDate;
      }

      return { startDate, endDate };
}

function parseDateValue(dateText: string) {
      const [year, month, day] = dateText.split('-').map(Number);
      return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + days);
      return nextDate;
}

function isDateInRange(dateText: string, startDate: string, endDate: string) {
      return dateText >= startDate && dateText <= endDate;
}

function getLastDayOfMonth(year: number, monthIndex: number) {
      return new Date(year, monthIndex + 1, 0).getDate();
}

function uniqueSortedDates(values: string[]) {
      return Array.from(new Set(values.filter(Boolean))).sort();
}

function getNthWeekdayOfMonth(input: {
      year: number;
      monthIndex: number;
      week: MonthWeek;
      weekday: DayOfWeek;
}) {
      const targetDayIndex = DAY_INDEX_BY_VALUE[input.weekday];

      if (input.week === 'last') {
            const lastDate = new Date(
                  input.year,
                  input.monthIndex,
                  getLastDayOfMonth(input.year, input.monthIndex)
            );

            while (lastDate.getDay() !== targetDayIndex) {
                  lastDate.setDate(lastDate.getDate() - 1);
            }

            return formatDateValue(lastDate);
      }

      const occurrence = Number(input.week);
      const firstDate = new Date(input.year, input.monthIndex, 1);
      const diff = (targetDayIndex - firstDate.getDay() + 7) % 7;
      const day = 1 + diff + (occurrence - 1) * 7;
      const lastDay = getLastDayOfMonth(input.year, input.monthIndex);

      if (day > lastDay) return null;

      return formatDateValue(new Date(input.year, input.monthIndex, day));
}

function generateAssignmentDatesByRule(form: AssignmentForm, dutyConfig?: any | null) {
      if (!form.assignedDate) return [];

      const dutyType = getDutyConfigType(dutyConfig);
      const { startDate, endDate } = getScheduleDateRange(form);

      if (dutyType === 'weekly') {
            const weeklyDays = getConfigWeeklyDays(dutyConfig);

            if (weeklyDays.length === 0) return [];

            const selectedDayIndexes = new Set(
                  weeklyDays.map((day) => DAY_INDEX_BY_VALUE[day])
            );
            const dates: string[] = [];
            let currentDate = parseDateValue(startDate);
            const lastDate = parseDateValue(endDate);

            while (currentDate <= lastDate) {
                  if (selectedDayIndexes.has(currentDate.getDay())) {
                        dates.push(formatDateValue(currentDate));
                  }

                  currentDate = addDays(currentDate, 1);
            }

            return uniqueSortedDates(dates);
      }

      if (dutyType === 'monthly') {
            const dates: string[] = [];
            const start = parseDateValue(startDate);
            const end = parseDateValue(endDate);
            let year = start.getFullYear();
            let monthIndex = start.getMonth();

            while (
                  year < end.getFullYear() ||
                  (year === end.getFullYear() && monthIndex <= end.getMonth())
            ) {
                  const monthDays = getConfigMonthDays(dutyConfig);

                  if (monthDays.length > 0) {
                        monthDays.forEach((day) => {
                              if (day > getLastDayOfMonth(year, monthIndex)) return;

                              const dateText = formatDateValue(new Date(year, monthIndex, day));

                              if (isDateInRange(dateText, startDate, endDate)) {
                                    dates.push(dateText);
                              }
                        });
                  } else {
                        getConfigMonthWeeks(dutyConfig).forEach((week) => {
                              getConfigMonthWeekDays(dutyConfig).forEach((weekday) => {
                                    const dateText = getNthWeekdayOfMonth({
                                          year,
                                          monthIndex,
                                          week,
                                          weekday,
                                    });

                                    if (dateText && isDateInRange(dateText, startDate, endDate)) {
                                          dates.push(dateText);
                                    }
                              });
                        });
                  }

                  monthIndex += 1;

                  if (monthIndex > 11) {
                        monthIndex = 0;
                        year += 1;
                  }
            }

            return uniqueSortedDates(dates);
      }

      if (dutyType === 'event') {
            if (form.repeatType === 'once') return [startDate];

            const dates: string[] = [];
            let currentDate = parseDateValue(startDate);
            const lastDate = parseDateValue(endDate);

            while (currentDate <= lastDate) {
                  dates.push(formatDateValue(currentDate));
                  currentDate = addDays(currentDate, 1);
            }

            return uniqueSortedDates(dates);
      }

      if (form.repeatType === 'once') {
            return [startDate];
      }

      const dates: string[] = [];
      let currentDate = parseDateValue(startDate);
      const lastDate = parseDateValue(endDate);

      while (currentDate <= lastDate) {
            dates.push(formatDateValue(currentDate));
            currentDate = addDays(currentDate, 1);
      }

      return uniqueSortedDates(dates);
}

function createWallClockDate(dateText: string, timeText = '12:00:00') {
      const [year, month, day] = dateText.split('-').map(Number);
      const [hour = 0, minute = 0, second = 0] = timeText.split(':').map(Number);

      return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

function toDateAtNoon(dateText: string) {
      return createWallClockDate(dateText, '12:00:00');
}

function toDateStartOfDay(dateText: string) {
      return createWallClockDate(dateText, '00:00:00');
}

function toDateEndOfDay(dateText: string) {
      return createWallClockDate(dateText, '23:59:59');
}

function getAssignmentDateText(assignment: any) {
      const value = assignment.assignedDate || assignment.date;

      if (!value) return '';

      if (value instanceof Date) return value.toISOString().slice(0, 10);

      return String(value).slice(0, 10);
}

function getMonthRangeValues(dateText: string) {
      const [year, month] = dateText.split('-').map(Number);
      const firstDate = new Date(year, month - 1, 1);
      const lastDate = new Date(year, month, 0);

      return {
            startDate: formatDateValue(firstDate),
            endDate: formatDateValue(lastDate),
      };
}

function getLocalTodayText(date = new Date()) {
      return formatDateValue(date);
}

function extractWallTimeText(timeValue?: string | Date | null) {
      if (!timeValue) return '';

      if (timeValue instanceof Date) {
            return `${String(timeValue.getHours()).padStart(2, '0')}:${String(
                  timeValue.getMinutes()
            ).padStart(2, '0')}:${String(timeValue.getSeconds()).padStart(2, '0')}`;
      }

      const text = String(timeValue).trim();
      const timePart = text.includes(' ')
            ? text.split(' ')[1]
            : text.includes('T')
                  ? text.split('T')[1]
                  : text;

      return timePart.length === 5 ? `${timePart}:00` : timePart.slice(0, 8);
}

function getTimeValue(dateText: string, timeValue?: string | Date | null) {
      if (!dateText || !timeValue) return null;

      const timeText = extractWallTimeText(timeValue);
      if (!timeText) return null;

      const [year, month, day] = dateText.split('-').map(Number);
      const [hour = 0, minute = 0, second = 0] = timeText.split(':').map(Number);

      return new Date(year, month - 1, day, hour, minute, second).getTime();
}

function isPastTime(dateText: string, timeValue?: string | Date | null) {
      const value = getTimeValue(dateText, timeValue);

      if (!value) return false;

      return value < Date.now();
}

function isSameDateAsToday(dateText: string) {
      return dateText === getLocalTodayText();
}

function getRoutineVisualState(entry: any, selectedDate: string) {
      if (!isSameDateAsToday(selectedDate)) return 'normal';

      return isPastTime(selectedDate, entry.endTime || entry.startTime) ? 'past' : 'normal';
}

function getDutyVisualState(entryOrAssignment: any, selectedDate: string) {
      const status = entryOrAssignment.status;

      if (status === 'completed') return 'completed';
      if (status === 'skipped' || status === 'absent') return 'skipped';
      if (status === 'cancelled') return 'cancelled';

      if (!isSameDateAsToday(selectedDate)) return 'normal';

      const endTime =
            entryOrAssignment.dutyConfig?.endTime ||
            entryOrAssignment.endTime ||
            entryOrAssignment.endDateTime ||
            entryOrAssignment.dutyConfig?.startTime ||
            entryOrAssignment.startTime ||
            entryOrAssignment.startDateTime;

      return isPastTime(selectedDate, endTime) ? 'overdue' : 'normal';
}

function getAssigneeTypeLabel(type?: string | null) {
      if (type === 'team') return 'Tổ';
      if (type === 'room') return 'Phòng';
      if (type === 'committee') return 'Ban';
      return 'Học viên';
}


function getAssigneeId(assignment: any) {
      return (
            assignment.assignedToId ||
            assignment.assigned_to_id ||
            assignment.residentId ||
            assignment.resident_id ||
            null
      );
}


function getSimpleAssigneeName(assignment: any) {
      return (
            assignment.residentName ||
            assignment.memberName ||
            assignment.assigneeName ||
            assignment.assignedToName ||
            assignment.roomName ||
            assignment.unitName ||
            assignment.resident?.fullName ||
            assignment.member?.fullName ||
            'Đối tượng được phân công'
      );
}


function getMemberName(member: any) {
      if (!member) return '';
      const holyName = member.holyName ? `${member.holyName} ` : '';
      return `${holyName}${member.fullName || member.name || `Học viên ${member.id}`}`.trim();
}

function getRoomName(room: any) {
      if (!room) return '';
      if (room.roomCode && room.roomName) return `${room.roomCode} - ${room.roomName}`;
      return room.roomName || room.name || room.roomCode || `Phòng ${room.id}`;
}

function getUnitName(unit: any) {
      if (!unit) return '';
      return unit.name || unit.code || `Đơn vị ${unit.id}`;
}

function toDateTime(dateText: string, timeText?: string | null) {
      if (!dateText || !timeText) return undefined;

      return createWallClockDate(dateText, timeText.length === 5 ? `${timeText}:00` : timeText);
}

function normalizeCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
}

function isStoreDutyConfig(dutyConfig?: any | null) {
      const code = normalizeCode(String(dutyConfig?.dutyCode || ''));
      const name = normalizeCode(String(dutyConfig?.dutyName || ''));

      return (
            code === 'STORE_SHIFT' ||
            code === 'TRUC_CUA_HANG' ||
            code.includes('CUA_HANG') ||
            name.includes('TRUC_CUA_HANG')
      );
}


export default function DailyRoutine() {
      const [activeView, setActiveView] = useState<DailyRoutineView>('duties');
      const [assignmentModalSignal, setAssignmentModalSignal] = useState(0);
      const [selectedDate, setSelectedDate] = useState(todayValue());
      const [dutyStatusFilter, setDutyStatusFilter] = useState<DutyStatusFilter>('all');
      const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [dayTypeFilter, setDayTypeFilter] = useState<'all' | DayType>('all');

      const [templateForm, setTemplateForm] = useState<TemplateForm | null>(null);
      const [itemForm, setItemForm] = useState<ItemForm | null>(null);

      const [assignmentForm, setAssignmentForm] = useState<AssignmentForm>({
            dutyConfigId: '',
            assignedDate: todayValue(),
            startTime: '',
            endTime: '',
            assignedToType: 'resident',
            assignedToId: '',
            assignedToIds: [],
            assignWholeWeek: false,
            repeatType: 'once',
            repeatEndDate: todayValue(),
            weeklyDays: [getDayOfWeekValue(todayValue())],
            monthlyMode: 'month_boundary',
            monthBoundary: 'first_day',
            monthDays: [1],
            monthWeeks: ['1'],
            monthWeekDays: ['monday'],
            notes: '',
            storeShiftType: '',
            storeLedgerId: '',
            primaryResidentId: '',
            openingCashPlanned: '0',
      });

      const [isDutyTemplateDialogOpen, setIsDutyTemplateDialogOpen] = useState(false);
      const [isDutyConfigFormOpen, setIsDutyConfigFormOpen] = useState(false);
      const [selectedDutyConfigForEdit, setSelectedDutyConfigForEdit] = useState<any>(null);

      const [messageBox, setMessageBox] = useState<AppMessageBoxState>({
            open: false,
            title: '',
            message: '',
            variant: 'info',
            actions: [],
      });
      const [pendingDeleteDutyConfig, setPendingDeleteDutyConfig] = useState<any>(null);
      const [pendingCancelAssignment, setPendingCancelAssignment] = useState<any>(null);

      // ✅ Use hook for auto-dismiss messages
      const { message, showMessage } = useAutoDismissMessage({
            successDuration: 5000,
            errorDuration: 7000,
      });

      const templatesQuery = trpc.dailyRoutine.listTemplates.useQuery({
            search: searchTerm || undefined,
            dayType: dayTypeFilter,
            limit: 200,
            offset: 0,
      });

      const templates = templatesQuery.data || [];

      const currentTemplate = useMemo(() => {
            if (selectedTemplateId) {
                  return templates.find((template: any) => template.id === selectedTemplateId) || null;
            }

            return templates[0] || null;
      }, [templates, selectedTemplateId]);

      const itemsQuery = trpc.dailyRoutine.listItems.useQuery(
            {
                  templateId: currentTemplate?.id,
                  limit: 500,
                  offset: 0,
            },
            {
                  enabled: Boolean(currentTemplate?.id),
            }
      );

      const items = itemsQuery.data || [];

      const selectedMonthRange = useMemo(
            () => getMonthRangeValues(selectedDate),
            [selectedDate]
      );

      const dutiesQuery = trpc.duties.getAssignmentsByDateRange.useQuery({
            startDate: toDateStartOfDay(selectedMonthRange.startDate),
            endDate: toDateEndOfDay(selectedMonthRange.endDate),
      });

      /**
       * Dữ liệu công tác của cả tháng.
       * View ngày sẽ tự lọc theo selectedDate.
       * View tuần sẽ tự lọc theo tuần đang chọn.
       * View tháng dùng toàn bộ dữ liệu này.
       */
      const dutyAssignments = dutiesQuery.data || [];

      const dutyConfigsQuery = trpc.duties.listConfigs.useQuery({ isActive: true });

      const membersQuery = trpc.members.list.useQuery({
            status: 'active' as any,
            limit: 500,
            offset: 0,
      });

      const roomsQuery = trpc.rooms.list.useQuery();

      const unitsQuery = trpc.organization.listUnits.useQuery({
            isActive: true,
            limit: 500,
            offset: 0,
      });

      const storeLedgersQuery = trpc.storeLedger.listLedgers.useQuery({
            isActive: true,
      });

      const dutyConfigs = dutyConfigsQuery.data || [];
      const members = (membersQuery.data || []) as any[];
      const rooms = (roomsQuery.data || []) as any[];
      const units = (unitsQuery.data || []) as any[];
      const storeLedgers = (storeLedgersQuery.data || []) as any[];
      const teams = units.filter((unit: any) => unit.unitType === 'team');
      const committees = units.filter((unit: any) => unit.unitType === 'committee');

      const enrichedDutyAssignments = useMemo(() => {
            const dutyMap = new Map<number, any>();
            const memberMap = new Map<number, any>();
            const roomMap = new Map<number, any>();
            const unitMap = new Map<number, any>();

            (dutyConfigs as any[]).forEach((duty: any) => dutyMap.set(Number(duty.id), duty));
            members.forEach((member: any) => memberMap.set(Number(member.id), member));
            rooms.forEach((room: any) => roomMap.set(Number(room.id), room));
            units.forEach((unit: any) => unitMap.set(Number(unit.id), unit));

            return (dutyAssignments as any[]).map((assignment: any) => {
                  const dutyConfig = assignment.dutyConfig || dutyMap.get(Number(assignment.dutyConfigId));
                  const assignedToType =
                        assignment.assignedToType ||
                        assignment.assigned_to_type ||
                        (assignment.residentId ? 'resident' : 'resident');
                  const assignedToId = getAssigneeId(assignment);

                  let assigneeName = getSimpleAssigneeName(assignment);

                  if (assignedToType === 'room') {
                        assigneeName =
                              getRoomName(roomMap.get(Number(assignedToId))) || assigneeName;
                  } else if (assignedToType === 'team' || assignedToType === 'committee') {
                        assigneeName =
                              getUnitName(unitMap.get(Number(assignedToId))) || assigneeName;
                  } else {
                        assigneeName =
                              getMemberName(memberMap.get(Number(assignedToId))) || assigneeName;
                  }

                  return {
                        ...assignment,
                        dutyConfig,
                        assignedToType,
                        assignedToId,
                        assigneeName,
                        dutyName: assignment.dutyName || dutyConfig?.dutyName,
                  };
            });
      }, [dutyAssignments, dutyConfigs, members, rooms, units]);

      const selectedDateDutyAssignments = useMemo(() => {
            return (enrichedDutyAssignments as any[]).filter(
                  (assignment: any) => getAssignmentDateText(assignment) === selectedDate
            );
      }, [enrichedDutyAssignments, selectedDate]);

      const completeAssignmentMutation = trpc.duties.completeAssignment.useMutation();
      const skipAssignmentMutation = trpc.duties.skipAssignment.useMutation();
      const assignDutyBatchMutation = trpc.duties.assignDutyBatch.useMutation();
      const cancelAssignmentMutation = trpc.duties.cancelAssignment.useMutation();
      const deleteDutyConfigMutation = trpc.duties.deleteConfig.useMutation();

      const createTemplateMutation = trpc.dailyRoutine.createTemplate.useMutation();
      const updateTemplateMutation = trpc.dailyRoutine.updateTemplate.useMutation();
      const removeTemplateMutation = trpc.dailyRoutine.removeTemplate.useMutation();

      const createItemMutation = trpc.dailyRoutine.createItem.useMutation();
      const updateItemMutation = trpc.dailyRoutine.updateItem.useMutation();
      const removeItemMutation = trpc.dailyRoutine.removeItem.useMutation();

      const isSavingTemplate =
            createTemplateMutation.isPending || updateTemplateMutation.isPending;

      const isSavingItem = createItemMutation.isPending || updateItemMutation.isPending;

      const refetchAll = async () => {
            await templatesQuery.refetch();
            await itemsQuery.refetch();
            await dutiesQuery.refetch();
      };

      const todayTimelineItems = useMemo(() => {
            const routineTimeline = (items || [])
                  .filter((item: any) => item.isActive)
                  .map((item: any) => ({
                        key: `routine-${item.id}`,
                        type: 'routine' as const,
                        startTime: item.startTime,
                        endTime: item.endTime,
                        title: item.title,
                        subTitle: item.location || 'Sinh hoạt chung',
                        description: item.description,
                        status: 'routine',
                        visualState: getRoutineVisualState(item, selectedDate),
                  }));

            const dutyTimeline = (selectedDateDutyAssignments || []).map((assignment: any) => {
                  const entry = {
                        key: `duty-${assignment.id}`,
                        type: 'duty' as const,
                        startTime:
                              assignment.startDateTime ||
                              assignment.startTime ||
                              assignment.dutyConfig?.startTime,
                        endTime:
                              assignment.endDateTime ||
                              assignment.endTime ||
                              assignment.dutyConfig?.endTime,
                        title:
                              assignment.dutyName ||
                              assignment.dutyConfig?.dutyName ||
                              `Công tác #${assignment.id}`,
                        subTitle: `${getAssigneeTypeLabel(
                              assignment.assignedToType || (assignment.residentId ? 'resident' : null)
                        )}: ${assignment.assigneeName || getSimpleAssigneeName(assignment)}`,
                        description: assignment.notes,
                        status: assignment.status,
                        assignment,
                  };

                  return {
                        ...entry,
                        visualState: getDutyVisualState(entry, selectedDate),
                  };
            });

            return [...routineTimeline, ...dutyTimeline].sort((a, b) =>
                  String(a.startTime || '').localeCompare(String(b.startTime || ''))
            );
      }, [items, selectedDateDutyAssignments, selectedDate]);

      const filteredDutyAssignments = useMemo(() => {
            return (selectedDateDutyAssignments as any[]).filter((assignment: any) => {
                  const visualState = getDutyVisualState(assignment, selectedDate);

                  if (dutyStatusFilter === 'all') return true;
                  if (dutyStatusFilter === 'open') {
                        return !['completed', 'skipped', 'absent', 'cancelled'].includes(assignment.status);
                  }
                  if (dutyStatusFilter === 'overdue') return visualState === 'overdue';

                  return assignment.status === dutyStatusFilter;
            });
      }, [selectedDateDutyAssignments, dutyStatusFilter, selectedDate]);

      const getAssignmentGroupRows = (assignment: any) =>
            Array.isArray(assignment?.assignments) && assignment.assignments.length > 0
                  ? assignment.assignments
                  : [assignment];

      const completeAssignment = async (assignment: any) => {
            const assignmentRows = getAssignmentGroupRows(assignment);

            try {
                  await Promise.all(
                        assignmentRows.map((row: any) =>
                              completeAssignmentMutation.mutateAsync({ id: row.id })
                        )
                  );
                  showMessage(
                        'success',
                        assignmentRows.length > 1
                              ? `Đã đánh dấu hoàn thành ${assignmentRows.length} phân công.`
                              : 'Đã đánh dấu hoàn thành công tác.'
                  );
                  await dutiesQuery.refetch();
            } catch (err: any) {
                  showMessage('error', err?.message || 'Không thể cập nhật công tác.');
            }
      };

      const skipAssignment = async (assignment: any) => {
            const assignmentRows = getAssignmentGroupRows(assignment);

            try {
                  await Promise.all(
                        assignmentRows.map((row: any) =>
                              skipAssignmentMutation.mutateAsync({
                                    id: row.id,
                                    reason: 'Vắng / không thực hiện',
                              })
                        )
                  );
                  showMessage(
                        'success',
                        assignmentRows.length > 1
                              ? `Đã ghi nhận vắng / không làm cho ${assignmentRows.length} phân công.`
                              : 'Đã ghi nhận vắng / không làm công tác.'
                  );
                  await dutiesQuery.refetch();
            } catch (err: any) {
                  showMessage('error', err?.message || 'Không thể cập nhật công tác.');
            }
      };

      const requestCancelAssignment = (assignment: any) => {
            setPendingCancelAssignment(assignment);
            setMessageBox({
                  open: true,
                  title: 'Hủy công tác',
                  message:
                        `Bạn có chắc muốn hủy công tác "${
                              assignment.dutyName ||
                              assignment.dutyConfig?.dutyName ||
                              `#${assignment.id}`
                        }"${
                              Array.isArray(assignment.assignments) && assignment.assignments.length > 1
                                    ? ` cho ${assignment.assignments.length} người/đối tượng`
                                    : ''
                        }?\n\n` +
                        'Công tác sẽ chuyển sang trạng thái Đã hủy và không còn được tính là công tác cần thực hiện.',
                  variant: 'warning',
                  selectedValue: 'cancelAssignment',
                  cancelText: 'Hủy',
                  actions: [
                        {
                              label: 'Hủy công tác',
                              value: 'cancelAssignment',
                              description: 'Chuyển công tác sang trạng thái Đã hủy.',
                              variant: 'warning',
                        },
                  ],
            });
      };

      const executeCancelAssignment = async () => {
            if (!pendingCancelAssignment) {
                  closeMessageBox();
                  return;
            }

            try {
                  const assignmentRows = getAssignmentGroupRows(pendingCancelAssignment);

                  await Promise.all(
                        assignmentRows.map((row: any) =>
                              cancelAssignmentMutation.mutateAsync({
                                    id: row.id,
                                    reason: 'Hủy từ màn hình sinh hoạt hằng ngày',
                              })
                        )
                  );

                  showMessage(
                        'success',
                        assignmentRows.length > 1
                              ? `Đã hủy ${assignmentRows.length} phân công.`
                              : 'Đã hủy công tác.'
                  );
                  closeMessageBox();
                  await dutiesQuery.refetch();
            } catch (err: any) {
                  showMessage('error', err?.message || 'Không thể hủy công tác.');
                  closeMessageBox();
            }
      };

      const selectedDutyConfig = assignmentForm.dutyConfigId
            ? (dutyConfigs as any[]).find(
                    (duty: any) => String(duty.id) === assignmentForm.dutyConfigId
              )
            : null;

      const isStoreDuty = isStoreDutyConfig(selectedDutyConfig);

      const assignmentPreviewDates = useMemo(
            () => generateAssignmentDatesByRule(assignmentForm, selectedDutyConfig),
            [assignmentForm, selectedDutyConfig]
      );

      const isAssignmentPreviewReady = Boolean(
            assignmentForm.dutyConfigId &&
                  assignmentForm.assignedDate &&
                  (assignmentForm.assignedToIds || []).length > 0 &&
                  assignmentPreviewDates.length > 0 &&
                  (!isStoreDuty ||
                        (assignmentForm.assignedToType === 'resident' &&
                              assignmentForm.storeShiftType &&
                              assignmentForm.storeLedgerId &&
                              assignmentForm.primaryResidentId))
      );

      const assignmentPreviewQuery = trpc.duties.previewAssignment.useQuery(
            {
                  dutyConfigId: Number(assignmentForm.dutyConfigId || 0),
                  assignedDates: assignmentPreviewDates,
                  assignedToType: assignmentForm.assignedToType,
                  assignedToId: Number(assignmentForm.assignedToIds[0] || assignmentForm.assignedToId || 0),
                  assignedToIds: (assignmentForm.assignedToIds || []).map((id) => Number(id)).filter(Boolean),
                  startTime: assignmentForm.startTime || null,
                  endTime: assignmentForm.endTime || null,
                  notes: assignmentForm.notes || null,
                  storeShiftType: isStoreDuty ? assignmentForm.storeShiftType || null : null,
                  storeLedgerId: isStoreDuty ? Number(assignmentForm.storeLedgerId || 0) || null : null,
                  primaryResidentId: isStoreDuty ? Number(assignmentForm.primaryResidentId || 0) || null : null,
                  openingCashPlanned: isStoreDuty
                        ? Number(assignmentForm.openingCashPlanned || 0)
                        : null,
            } as any,
            {
                  enabled: isAssignmentPreviewReady,
            }
      );

      const assignmentPreview = assignmentPreviewQuery.data as
            | {
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
              }
            | undefined;


      const selectedDutyResidentAssignmentsCount = useMemo(() => {
            if (!assignmentForm.dutyConfigId || !assignmentForm.assignedDate) return 0;

            return (enrichedDutyAssignments as any[]).filter((assignment: any) => {
                  const assignedDateText = String(assignment.assignedDate || '').slice(0, 10);

                  return (
                        String(assignment.dutyConfigId) === assignmentForm.dutyConfigId &&
                        assignedDateText === assignmentForm.assignedDate &&
                        (assignment.assignedToType || (assignment.residentId ? 'resident' : 'resident')) ===
                              'resident' &&
                        assignment.status !== 'cancelled'
                  );
            }).length;
      }, [enrichedDutyAssignments, assignmentForm.dutyConfigId, assignmentForm.assignedDate]);


      const getAssigneeOptions = () => {
            const getAssignmentLoad = (type: AssignToType, id: number | string) => {
                  const normalizedId = Number(id);
                  const dateRangeWeek = getForwardWeekRangeValues(assignmentForm.assignedDate || selectedDate);
                  const dateRangeMonth = getMonthRangeForDateValue(assignmentForm.assignedDate || selectedDate);

                  const activeRows = (enrichedDutyAssignments as any[]).filter((assignment: any) => {
                        if (assignment.status === 'cancelled') return false;
                        const assignmentType =
                              assignment.assignedToType || (assignment.residentId ? 'resident' : 'resident');
                        const assignmentId = Number(assignment.assignedToId || assignment.residentId || 0);

                        return assignmentType === type && assignmentId === normalizedId;
                  });

                  const todayCount = activeRows.filter(
                        (assignment: any) => getAssignmentDateText(assignment) === (assignmentForm.assignedDate || selectedDate)
                  ).length;

                  const weekCount = activeRows.filter((assignment: any) => {
                        const dateText = getAssignmentDateText(assignment);
                        return dateText >= dateRangeWeek.startDate && dateText <= dateRangeWeek.endDate;
                  }).length;

                  const monthCount = activeRows.filter((assignment: any) => {
                        const dateText = getAssignmentDateText(assignment);
                        return dateText >= dateRangeMonth.startDate && dateText <= dateRangeMonth.endDate;
                  }).length;

                  return {
                        todayCount,
                        weekCount,
                        monthCount,
                        isBusyToday: todayCount > 0,
                        isOverloaded: todayCount >= 2 || weekCount >= 4 || monthCount >= 10,
                        recommendScore: todayCount * 100 + weekCount * 10 + monthCount,
                  };
            };

            const withLoad = (type: AssignToType, option: { id: number | string; label: string }) => {
                  const load = getAssignmentLoad(type, option.id);

                  return {
                        ...option,
                        ...load,
                        recommendLabel: load.isOverloaded
                              ? 'Đang nhiều việc'
                              : load.isBusyToday
                                    ? 'Đã có việc hôm nay'
                                    : 'Gợi ý',
                  };
            };

            const sortSmart = (items: Array<{ id: number | string; label: string; recommendScore?: number }>) =>
                  [...items].sort((a, b) => Number(a.recommendScore || 0) - Number(b.recommendScore || 0));

            if (assignmentForm.assignedToType === 'room') {
                  return sortSmart(
                        rooms.map((room: any) =>
                              withLoad('room', {
                                    id: room.id,
                                    label: getRoomName(room),
                              })
                        )
                  );
            }

            if (assignmentForm.assignedToType === 'team') {
                  return sortSmart(
                        teams.map((unit: any) =>
                              withLoad('team', {
                                    id: unit.id,
                                    label: getUnitName(unit),
                              })
                        )
                  );
            }

            if (assignmentForm.assignedToType === 'committee') {
                  return sortSmart(
                        committees.map((unit: any) =>
                              withLoad('committee', {
                                    id: unit.id,
                                    label: getUnitName(unit),
                              })
                        )
                  );
            }

            const memberOptions = sortSmart(
                  members.map((member: any) =>
                        withLoad('resident', {
                              id: member.id,
                              label: getMemberName(member),
                        })
                  )
            );

            if (memberOptions.length === 0 && membersQuery.isLoading) {
                  return [{ id: 'loading', label: '⏳ Đang tải danh sách...' }];
            }

            if (memberOptions.length === 0) {
                  return [{ id: 'empty', label: '❌ Không có học viên nào' }];
            }

            return memberOptions;
      };

            const saveAssignment = async () => {
            const dutyConfigId = Number(assignmentForm.dutyConfigId || 0);
            const assignedToIds = (assignmentForm.assignedToIds || [])
                  .map((id) => Number(id || 0))
                  .filter((id) => id > 0);
            const assignedToId = assignedToIds[0] || Number(assignmentForm.assignedToId || 0);

            if (!dutyConfigId) {
                  showMessage('error', 'Vui lòng chọn công tác.');
                  return;
            }

            if (!assignmentForm.assignedDate) {
                  showMessage('error', 'Vui lòng chọn ngày bắt đầu.');
                  return;
            }

            if (assignmentForm.repeatType !== 'once' && !assignmentForm.repeatEndDate) {
                  showMessage('error', 'Vui lòng chọn ngày kết thúc.');
                  return;
            }

            if (assignmentForm.repeatType === 'weekly' && assignmentForm.weeklyDays.length === 0) {
                  showMessage('error', 'Vui lòng chọn ít nhất một thứ trong tuần.');
                  return;
            }

            if (
                  assignmentForm.repeatType === 'monthly' &&
                  assignmentForm.monthlyMode === 'day_of_month' &&
                  assignmentForm.monthDays.length === 0
            ) {
                  showMessage('error', 'Vui lòng chọn ít nhất một ngày trong tháng.');
                  return;
            }

            if (
                  assignmentForm.repeatType === 'monthly' &&
                  assignmentForm.monthlyMode === 'week_day' &&
                  (assignmentForm.monthWeeks.length === 0 ||
                        assignmentForm.monthWeekDays.length === 0)
            ) {
                  showMessage('error', 'Vui lòng chọn tuần trong tháng và thứ thực hiện.');
                  return;
            }

            if (assignmentPreviewDates.length === 0) {
                  showMessage('error', 'Không có ngày thực hiện phù hợp với chu kỳ đã chọn.');
                  return;
            }

            if (assignedToIds.length === 0) {
                  showMessage('error', 'Vui lòng chọn ít nhất một đối tượng được phân công.');
                  return;
            }

            if (isStoreDuty) {
                  if (assignmentForm.assignedToType !== 'resident') {
                        showMessage('error', 'Công tác Trực cửa hàng chỉ được giao trực tiếp cho học viên.');
                        return;
                  }

                  if (!assignmentForm.storeShiftType) {
                        showMessage('error', 'Vui lòng chọn ca sáng hoặc ca chiều.');
                        return;
                  }

                  if (!assignmentForm.storeLedgerId) {
                        showMessage('error', 'Vui lòng chọn cửa hàng.');
                        return;
                  }

                  if (!assignmentForm.primaryResidentId) {
                        showMessage('error', 'Vui lòng chọn học viên trực chính.');
                        return;
                  }

                  if (!assignedToIds.includes(Number(assignmentForm.primaryResidentId))) {
                        showMessage('error', 'Học viên trực chính phải nằm trong danh sách được phân công.');
                        return;
                  }
            }

            try {
                  const result = await assignDutyBatchMutation.mutateAsync({
                        dutyConfigId,
                        assignedDates: assignmentPreviewDates,
                        assignedToType: assignmentForm.assignedToType,
                        assignedToId,
                        assignedToIds,
                        startTime: assignmentForm.startTime || null,
                        endTime: assignmentForm.endTime || null,
                        notes: assignmentForm.notes || null,
                        storeShiftType: isStoreDuty
                              ? assignmentForm.storeShiftType || null
                              : null,
                        storeLedgerId: isStoreDuty
                              ? Number(assignmentForm.storeLedgerId || 0) || null
                              : null,
                        primaryResidentId: isStoreDuty
                              ? Number(assignmentForm.primaryResidentId || 0) || null
                              : null,
                        openingCashPlanned: isStoreDuty
                              ? Number(assignmentForm.openingCashPlanned || 0)
                              : null,
                  } as any);

                  setSelectedDate(assignmentForm.assignedDate);
                  showMessage(
                        'success',
                        result.skipped > 0
                              ? `Đã tạo ${result.created} phân công, bỏ qua ${result.skipped} ngày không phù hợp.`
                              : `Đã tạo ${result.created} phân công.`
                  );
                  setAssignmentForm({
                        dutyConfigId: '',
                        assignedDate: assignmentForm.assignedDate,
                        startTime: '',
                        endTime: '',
                        assignedToType: 'resident',
                        assignedToId: '',
                        assignedToIds: [],
                        assignWholeWeek: false,
                        repeatType: 'once',
                        repeatEndDate: assignmentForm.assignedDate,
                        weeklyDays: [getDayOfWeekValue(assignmentForm.assignedDate)],
                        monthlyMode: 'month_boundary',
                        monthBoundary: 'first_day',
                        monthDays: [1],
                        monthWeeks: ['1'],
                        monthWeekDays: ['monday'],
                        notes: '',
                        storeShiftType: '',
                        storeLedgerId: '',
                        primaryResidentId: '',
                        openingCashPlanned: '0',
                  });

                  await dutiesQuery.refetch();
            } catch (err: any) {
                  showMessage('error', err?.message || 'Không thể tạo phân công công tác.');
            }
      };

      const openCreateDutyConfig = () => {
            setIsDutyTemplateDialogOpen(false);
            setSelectedDutyConfigForEdit(null);
            setIsDutyConfigFormOpen(true);
      };

      const openEditDutyConfig = (duty: any) => {
            setIsDutyTemplateDialogOpen(false);
            setSelectedDutyConfigForEdit(duty);
            setIsDutyConfigFormOpen(true);
      };

      const requestDeleteDutyConfig = (duty: any) => {
            setPendingDeleteDutyConfig(duty);
            setMessageBox({
                  open: true,
                  title: 'Xóa mẫu công tác',
                  message:
                        `Bạn có chắc muốn xóa mẫu công tác "${duty.dutyName}"?\n\n` +
                        'Chỉ nên xóa khi đây là dữ liệu tạo nhầm hoặc dữ liệu test. Nếu mẫu công tác đã phát sinh phân công, nên chuyển sang ngừng dùng để giữ lịch sử.',
                  variant: 'danger',
                  selectedValue: 'deleteDutyConfig',
                  cancelText: 'Hủy',
                  actions: [
                        {
                              label: 'Xóa mẫu công tác',
                              value: 'deleteDutyConfig',
                              description: 'Xóa mẫu công tác và các thiết lập liên quan nếu backend cho phép.',
                              variant: 'danger',
                        },
                  ],
            });
      };

      const closeMessageBox = () => {
            setMessageBox({
                  open: false,
                  title: '',
                  message: '',
                  variant: 'info',
                  actions: [],
            });
            setPendingDeleteDutyConfig(null);
            setPendingCancelAssignment(null);
      };

      const executeDeleteDutyConfig = async () => {
            if (!pendingDeleteDutyConfig) {
                  closeMessageBox();
                  return;
            }

            try {
                  await deleteDutyConfigMutation.mutateAsync({
                        id: pendingDeleteDutyConfig.id,
                  });

                  showMessage('success', 'Đã xóa mẫu công tác.');

                  closeMessageBox();
                  await dutyConfigsQuery.refetch();
            } catch (err: any) {
                  showMessage(
                        'error',
                        err?.message ||
                        'Không thể xóa mẫu công tác. Nếu đã phát sinh phân công, nên chuyển sang ngừng dùng.'
                  );
                  closeMessageBox();
            }
      };

      const handleMessageBoxConfirm = async (value: string) => {
            if (value === 'deleteDutyConfig') {
                  await executeDeleteDutyConfig();
                  return;
            }

            if (value === 'cancelAssignment') {
                  await executeCancelAssignment();
                  return;
            }

            closeMessageBox();
      };

      const openCreateTemplate = () => {
            // Message cleared by hook
            setTemplateForm({ ...emptyTemplateForm });
      };

      const openEditTemplate = (template: any) => {
            // Message cleared by hook
            setTemplateForm({
                  id: template.id,
                  code: template.code || '',
                  name: template.name || '',
                  dayType: template.dayType || 'weekday',
                  description: template.description || '',
                  isActive: Boolean(template.isActive),
                  sortOrder: String(template.sortOrder ?? 10),
            });
      };

      const saveTemplate = async () => {
            if (!templateForm) return;

            const code = normalizeCode(templateForm.code);
            const name = templateForm.name.trim();

            if (!code) {
                  showMessage('error', 'Vui lòng nhập mã mẫu lịch.');
                  return;
            }

            if (!name) {
                  showMessage('error', 'Vui lòng nhập tên mẫu lịch.');
                  return;
            }

            try {
                  if (templateForm.id) {
                        const updated = await updateTemplateMutation.mutateAsync({
                              id: templateForm.id,
                              code,
                              name,
                              dayType: templateForm.dayType,
                              description: templateForm.description || null,
                              isActive: templateForm.isActive,
                              sortOrder: Number(templateForm.sortOrder || 10),
                        });

                        setSelectedTemplateId((updated as any)?.id || templateForm.id);
                        showMessage('success', 'Đã cập nhật mẫu lịch.');
                  } else {
                        const created = await createTemplateMutation.mutateAsync({
                              code,
                              name,
                              dayType: templateForm.dayType,
                              description: templateForm.description || null,
                              isActive: templateForm.isActive,
                              sortOrder: Number(templateForm.sortOrder || 10),
                        });

                        setSelectedTemplateId((created as any)?.id || null);
                        showMessage('success', 'Đã thêm mẫu lịch.');
                  }

                  setTemplateForm(null);
                  await refetchAll();
            } catch (err: any) {
                  showMessage('error', err?.message || 'Không thể lưu mẫu lịch.');
            }
      };

      const removeTemplate = async (template: any) => {
            const confirmed = window.confirm(
                  `Xóa mẫu lịch "${template.name}"? Các khung giờ bên trong cũng sẽ bị xóa.`
            );

            if (!confirmed) return;

            try {
                  await removeTemplateMutation.mutateAsync({ id: template.id });
                  showMessage('success', 'Đã xóa mẫu lịch.');

                  if (selectedTemplateId === template.id) {
                        setSelectedTemplateId(null);
                  }

                  await refetchAll();
            } catch (err: any) {
                  showMessage('error', err?.message || 'Không thể xóa mẫu lịch.');
            }
      };

      const openCreateItem = () => {
            if (!currentTemplate?.id) {
                  showMessage('error', 'Vui lòng chọn mẫu lịch trước khi thêm khung giờ.');
                  return;
            }

            // Message cleared by hook
            setItemForm({
                  ...emptyItemForm,
                  templateId: String(currentTemplate.id),
            });
      };

      const openEditItem = (item: any) => {
            // Message cleared by hook
            setItemForm({
                  id: item.id,
                  templateId: String(item.templateId || currentTemplate?.id || ''),
                  startTime: formatTime(item.startTime),
                  endTime: formatTime(item.endTime),
                  title: item.title || '',
                  location: item.location || '',
                  description: item.description || '',
                  isActive: Boolean(item.isActive),
                  sortOrder: String(item.sortOrder ?? 10),
            });
      };

      const saveItem = async () => {
            if (!itemForm) return;

            const templateId = Number(itemForm.templateId || 0);
            const title = itemForm.title.trim();

            if (!templateId) {
                  showMessage('error', 'Vui lòng chọn mẫu lịch.');
                  return;
            }

            if (!itemForm.startTime || !itemForm.endTime) {
                  showMessage('error', 'Vui lòng nhập giờ bắt đầu và giờ kết thúc.');
                  return;
            }

            if (itemForm.endTime <= itemForm.startTime) {
                  showMessage('error', 'Giờ kết thúc phải lớn hơn giờ bắt đầu.');
                  return;
            }

            if (!title) {
                  showMessage('error', 'Vui lòng nhập tên hoạt động.');
                  return;
            }

            try {
                  if (itemForm.id) {
                        await updateItemMutation.mutateAsync({
                              id: itemForm.id,
                              templateId,
                              startTime: itemForm.startTime,
                              endTime: itemForm.endTime,
                              title,
                              location: itemForm.location || null,
                              description: itemForm.description || null,
                              isActive: itemForm.isActive,
                              sortOrder: Number(itemForm.sortOrder || 10),
                        });

                        showMessage('success', 'Đã cập nhật khung giờ.');
                  } else {
                        await createItemMutation.mutateAsync({
                              templateId,
                              startTime: itemForm.startTime,
                              endTime: itemForm.endTime,
                              title,
                              location: itemForm.location || null,
                              description: itemForm.description || null,
                              isActive: itemForm.isActive,
                              sortOrder: Number(itemForm.sortOrder || 10),
                        });

                        showMessage('success', 'Đã thêm khung giờ.');
                  }

                  setItemForm(null);
                  await itemsQuery.refetch();
            } catch (err: any) {
                  showMessage('error', err?.message || 'Không thể lưu khung giờ.');
            }
      };

      const removeItem = async (item: any) => {
            const confirmed = window.confirm(`Xóa khung giờ "${item.title}"?`);

            if (!confirmed) return;

            try {
                  await removeItemMutation.mutateAsync({ id: item.id });
                  showMessage('success', 'Đã xóa khung giờ.');
                  await itemsQuery.refetch();
            } catch (err: any) {
                  showMessage('error', err?.message || 'Không thể xóa khung giờ.');
            }
      };

      return (
            <ResidenceCareLayout>
                  <div className={residenceMediumStyle.page}>
                        <span className={residenceMediumStyle.pageAura} />
                        <div className="relative mx-auto max-w-[1420px] space-y-4 px-2 pb-8">
                              <div className="relative overflow-visible px-5 pb-2 pt-3 text-slate-900 sm:px-6">
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-70 [background-image:radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.92),transparent_30%),radial-gradient(circle_at_78%_8%,rgba(251,191,36,0.18),transparent_26%)]" />

                                    <div className="relative min-h-[88px]">
                                          <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
                                                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-[38px]">
                                                      Sinh hoạt hằng ngày
                                                </h1>

                                                <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                                                      Theo dõi lịch sinh hoạt, công tác và phân công trong ngày trên một màn hình gọn, dễ nhìn và dễ thực hiện.
                                                </p>
                                          </div>

                                          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:absolute lg:right-0 lg:top-0 lg:mt-0 lg:justify-end">
                                                <button
                                                      type="button"
                                                      onClick={() => {
                                                            setActiveView('duties');
                                                            setAssignmentForm((current) => ({
                                                                  ...current,
                                                                  assignedDate: selectedDate,
                                                                  repeatEndDate: selectedDate,
                                                            }));
                                                            setAssignmentModalSignal((value) => value + 1);
                                                      }}
                                                      className={residenceMediumStyle.buttonCardPrimary}
                                                >
                                                      <Plus className={residenceMediumStyle.buttonCardIcon} />
                                                      Phân công công tác
                                                </button>
                                          </div>
                                    </div>
                              </div>

                        {message && (
                              <div
                                    className={[
                                          'rounded-xl border px-3 py-2.5 text-sm font-medium',
                                          message.type === 'success'
                                                ? 'border-green-100 bg-green-50 text-green-700'
                                                : message.type === 'error'
                                                      ? 'border-red-100 bg-red-50 text-red-700'
                                                      : 'border-amber-100 bg-amber-50 text-amber-800',
                                    ].join(' ')}
                              >
                                    {message.text}
                              </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center gap-2 rounded-[24px] border border-amber-100/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.62)_0%,rgba(255,251,235,0.42)_62%,rgba(245,158,11,0.08)_100%)] px-4 py-2.5 shadow-[0_14px_30px_rgba(12,10,9,0.045),inset_0_1px_0_rgba(255,255,255,0.70)]">
                              <div className="flex w-full gap-2">
                                    {[
                                          { key: 'duties', label: 'Công tác' },
                                          { key: 'today', label: 'Sinh hoạt' },
                                    ].map((view) => (
                                          <button
                                                key={view.key}
                                                type="button"
                                                onClick={() => setActiveView(view.key as DailyRoutineView)}
                                                className={[
                                                      'flex-1 rounded-full px-4 py-2 text-sm font-semibold transition',
                                                      activeView === view.key
                                                            ? 'bg-white/84 text-amber-900 ring-1 ring-amber-100/80 shadow-sm shadow-slate-900/5'
                                                            : 'text-slate-500 hover:bg-amber-50/70 hover:text-slate-800',
                                                ].join(' ')}
                                          >
                                                {view.label}
                                          </button>
                                    ))}
                              </div>
                        </div>

                        {activeView === 'today' && (
                              <div className="mb-4 flex flex-wrap justify-end gap-2">
                                    <button
                                          type="button"
                                          onClick={openCreateTemplate}
                                          className="inline-flex items-center gap-2 rounded-xl border border-amber-100 bg-white/88 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-amber-50"
                                    >
                                          <Plus className="h-4 w-4" />
                                          Thêm mẫu lịch
                                    </button>
                                    <button
                                          type="button"
                                          onClick={openCreateItem}
                                          className="inline-flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                                    >
                                          <Clock className="h-4 w-4" />
                                          Thêm khung giờ
                                    </button>
                              </div>
                        )}

                        {activeView === 'today' && (
                              <TodayOverviewTab
                                    selectedDate={selectedDate}
                                    onDateChange={setSelectedDate}
                                    routineItems={items}
                                    dutyAssignments={[]}
                                    timelineItems={todayTimelineItems.filter((item: any) => item.type !== 'duty')}
                                    isLoading={
                                          templatesQuery.isLoading ||
                                          itemsQuery.isLoading ||
                                          dutiesQuery.isLoading
                                    }
                                    onCreateDuty={() => setActiveView('duties')}
                                    onCompleteDuty={completeAssignment}
                                    onSkipDuty={skipAssignment}
                              />
                        )}

                        {activeView === 'duties' && (
                              <DutiesTab
                                    assignmentForm={assignmentForm}
                                    onAssignmentFormChange={setAssignmentForm}
                                    dutyConfigs={dutyConfigs as any[]}
                                    selectedDutyConfig={selectedDutyConfig}
                                    assigneeOptions={getAssigneeOptions()}
                                    storeLedgers={storeLedgers}
                                    previewEnabled={isAssignmentPreviewReady}
                                    previewLoading={assignmentPreviewQuery.isLoading}
                                    preview={assignmentPreview}
                                    isSaving={assignDutyBatchMutation.isPending}
                                    onSaveAssignment={saveAssignment}
                                    onOpenDutyTemplateDialog={() =>
                                          setIsDutyTemplateDialogOpen(true)
                                    }
                                    openAssignmentSignal={assignmentModalSignal}
                                    onOpenToday={() => setActiveView('today')}
                                    onOpenRoutine={() => setActiveView('routine')}
                                    selectedDate={selectedDate}
                                    onDateChange={setSelectedDate}
                                    statusFilter={dutyStatusFilter}
                                    onStatusFilterChange={setDutyStatusFilter}
                                    assignments={filteredDutyAssignments}
                                    allAssignments={enrichedDutyAssignments}
                                    isLoadingAssignments={dutiesQuery.isLoading}
                                    onCompleteDuty={completeAssignment}
                                    onSkipDuty={skipAssignment}
                                    onCancelDuty={requestCancelAssignment}
                              />
                        )}

                        {activeView === 'routine' && (
                              <RoutineSetupTab
                                    templates={templates as any[]}
                                    currentTemplate={currentTemplate}
                                    items={items as any[]}
                                    templatesLoading={templatesQuery.isLoading}
                                    itemsLoading={itemsQuery.isLoading}
                                    searchTerm={searchTerm}
                                    onSearchTermChange={setSearchTerm}
                                    dayTypeFilter={dayTypeFilter as any}
                                    onDayTypeFilterChange={setDayTypeFilter as any}
                                    onSelectTemplate={setSelectedTemplateId}
                                    onCreateTemplate={openCreateTemplate}
                                    onEditTemplate={openEditTemplate}
                                    onRemoveTemplate={removeTemplate}
                                    onCreateItem={openCreateItem}
                                    onEditItem={openEditItem}
                                    onRemoveItem={removeItem}
                              />
                        )}

                        {templateForm && (
                              <RoutineTemplateModal
                                    form={templateForm}
                                    onChange={setTemplateForm}
                                    onSave={saveTemplate}
                                    isSaving={isSavingTemplate}
                              />
                        )}

                        {itemForm && (
                              <RoutineItemModal
                                    form={itemForm}
                                    templates={templates as any[]}
                                    onChange={setItemForm}
                                    onSave={saveItem}
                                    isSaving={isSavingItem}
                              />
                        )}

                        {isDutyTemplateDialogOpen && (
                              <DutyTemplateDialog
                                    dutyConfigs={dutyConfigs as any[]}
                                    isLoading={dutyConfigsQuery.isLoading}
                                    isDeleting={deleteDutyConfigMutation.isPending}
                                    onClose={() => setIsDutyTemplateDialogOpen(false)}
                                    onCreate={openCreateDutyConfig}
                                    onEdit={openEditDutyConfig}
                                    onDelete={requestDeleteDutyConfig}
                              />
                        )}

                        {isDutyConfigFormOpen && (
                              <div className="fixed inset-0 z-[92] overflow-y-auto bg-slate-950/38 px-4 py-6 backdrop-blur-sm">
                                    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_72%,#fff8ef_100%)] shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
                                          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-amber-100/70 bg-white/92 px-5 py-4 backdrop-blur">
                                                <div>
                                                      <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                                                            {selectedDutyConfigForEdit
                                                                  ? 'Cập nhật công tác'
                                                                  : 'Thêm công tác'}
                                                      </h2>
                                                      <p className="mt-1 text-sm text-slate-500">
                                                            Thiết lập loại công tác, lịch lặp và các công đoạn cần hoàn thành.
                                                      </p>
                                                </div>

                                                <button
                                                      type="button"
                                                      onClick={() => setIsDutyConfigFormOpen(false)}
                                                      className="rounded-xl border border-amber-100 bg-white px-2.5 py-2 text-slate-500 shadow-[0_4px_12px_rgba(120,53,15,0.035)] transition hover:bg-amber-50"
                                                >
                                                      <X className="h-4 w-4" />
                                                </button>
                                          </div>

                                          <div className="max-h-[calc(100vh-180px)] overflow-y-auto px-5 py-4">
                                                <DutyConfigForm
                                                duty={selectedDutyConfigForEdit}
                                                onSave={async () => {
                                                      setIsDutyConfigFormOpen(false);
                                                      setSelectedDutyConfigForEdit(null);
                                                      showMessage('success', selectedDutyConfigForEdit
                                                                  ? 'Đã cập nhật mẫu công tác.'
                                                                  : 'Đã thêm mẫu công tác.');
                                                      await dutyConfigsQuery.refetch();
                                                }}
                                                onCancel={() => setIsDutyConfigFormOpen(false)}
                                          />
                                          </div>
                                    </div>
                              </div>
                        )}

                        <AppMessageBox
                              state={messageBox}
                              onCancel={closeMessageBox}
                              onConfirm={handleMessageBoxConfirm}
                              isProcessing={deleteDutyConfigMutation.isPending || cancelAssignmentMutation.isPending}
                        />
                        </div>
                  </div>
            </ResidenceCareLayout>
      );
}
