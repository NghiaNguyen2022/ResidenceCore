'use client';

import { useMemo, useState } from 'react';
import {
      CalendarDays,
      CheckCircle2,
      Clock,
      Edit2,
      Plus,
      Save,
      Search,
      SkipForward,
      Trash2,
      Users,
      X,
} from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DutyConfigForm from '@/components/DutyConfigForm';
import {
      AppMessageBox,
      type AppMessageBoxState,
} from '@/components/common/AppMessageBox';

type DayType = 'weekday' | 'sunday' | 'special';

type DailyRoutineView = 'today' | 'routine' | 'duties';

type DutyStatusFilter = 'all' | 'open' | 'overdue' | 'completed' | 'skipped' | 'cancelled';

type AssignToType = 'resident' | 'team' | 'room' | 'committee';

type AssignmentForm = {
      dutyConfigId: string;
      assignedDate: string;
      startTime: string;
      endTime: string;
      assignedToType: AssignToType;
      assignedToId: string;
      assignWholeWeek: boolean;
      notes: string;
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
      startTime: '',
      endTime: '',
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
      if (dayType === 'weekday') return 'border-blue-100 bg-blue-50 text-blue-700';
      if (dayType === 'sunday') return 'border-purple-100 bg-purple-50 text-purple-700';
      if (dayType === 'special') return 'border-amber-100 bg-amber-50 text-amber-700';
      return 'border-slate-100 bg-slate-50 text-slate-600';
}

function formatTime(value?: string | Date | null) {
      if (!value) return '--:--';

      if (value instanceof Date) {
            return value.toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
            });
      }

      const text = String(value);

      if (text.includes('T')) {
            return new Date(text).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
            });
      }

      return text.slice(0, 5);
}

function todayValue() {
      return new Date().toISOString().slice(0, 10);
}

function formatDateValue(date: Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
}

function getWeekDateValues(dateText: string) {
      const [year, month, day] = dateText.split('-').map(Number);
      const baseDate = new Date(year, month - 1, day);
      const dayOfWeek = baseDate.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(baseDate);
      monday.setDate(baseDate.getDate() + diffToMonday);

      return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(monday);
            date.setDate(monday.getDate() + index);
            return formatDateValue(date);
      });
}

function createWallClockDate(dateText: string, timeText = '12:00:00') {
      const [year, month, day] = dateText.split('-').map(Number);
      const [hour = 0, minute = 0, second = 0] = timeText.split(':').map(Number);

      return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}

function toDateAtNoon(dateText: string) {
      return createWallClockDate(dateText, '12:00:00');
}

function getStatusLabel(status?: string | null) {
      if (status === 'completed') return 'Hoàn thành';
      if (status === 'in_progress') return 'Đang làm';
      if (status === 'confirmed') return 'Đã nhận';
      if (status === 'skipped') return 'Vắng / Không làm';
      if (status === 'cancelled') return 'Đã hủy';
      return 'Chưa làm';
}

function getStatusClass(status?: string | null) {
      if (status === 'completed') return 'border-green-100 bg-green-50 text-green-700';
      if (status === 'in_progress') return 'border-blue-100 bg-blue-50 text-blue-700';
      if (status === 'confirmed') return 'border-indigo-100 bg-indigo-50 text-indigo-700';
      if (status === 'skipped') return 'border-amber-100 bg-amber-50 text-amber-700';
      if (status === 'cancelled') return 'border-slate-200 bg-slate-100 text-slate-600';
      return 'border-orange-100 bg-orange-50 text-orange-700';
}


function getTimeValue(dateText: string, timeValue?: string | Date | null) {
      if (!dateText || !timeValue) return null;

      if (timeValue instanceof Date) {
            return createWallClockDate(
                  dateText,
                  `${String(timeValue.getHours()).padStart(2, '0')}:${String(
                        timeValue.getMinutes()
                  ).padStart(2, '0')}:${String(timeValue.getSeconds()).padStart(2, '0')}`
            ).getTime();
      }

      const text = String(timeValue);
      const timePart = text.includes(' ')
            ? text.split(' ')[1]
            : text.includes('T')
                  ? text.split('T')[1]
                  : text;

      const timeText = timePart.length === 5 ? `${timePart}:00` : timePart.slice(0, 8);
      return new Date(`${dateText}T${timeText}`).getTime();
}

function isPastTime(dateText: string, timeValue?: string | Date | null) {
      const value = getTimeValue(dateText, timeValue);

      if (!value) return false;

      return value < Date.now();
}

function isSameDateAsToday(dateText: string) {
      return dateText === new Date().toISOString().slice(0, 10);
}

function getRoutineVisualState(entry: any, selectedDate: string) {
      if (!isSameDateAsToday(selectedDate)) return 'normal';

      return isPastTime(selectedDate, entry.endTime || entry.startTime) ? 'past' : 'normal';
}

function getDutyVisualState(entryOrAssignment: any, selectedDate: string) {
      const status = entryOrAssignment.status;

      if (status === 'completed') return 'completed';
      if (status === 'skipped') return 'skipped';
      if (status === 'cancelled') return 'cancelled';

      if (!isSameDateAsToday(selectedDate)) return 'normal';

      const endTime =
            entryOrAssignment.endTime ||
            entryOrAssignment.endDateTime ||
            entryOrAssignment.dutyConfig?.endTime ||
            entryOrAssignment.startTime ||
            entryOrAssignment.startDateTime ||
            entryOrAssignment.dutyConfig?.startTime;

      return isPastTime(selectedDate, endTime) ? 'overdue' : 'normal';
}

function getTimelineCardClass(type: 'routine' | 'duty', state: string) {
      if (type === 'routine' && state === 'past') {
            return 'border-slate-200 bg-slate-100/80 opacity-75';
      }

      if (type === 'duty' && state === 'completed') {
            return 'border-green-200 bg-green-50 ring-1 ring-green-100';
      }

      if (type === 'duty' && state === 'overdue') {
            return 'border-rose-200 bg-rose-50 ring-1 ring-rose-100';
      }

      if (type === 'duty' && state === 'skipped') {
            return 'border-amber-200 bg-amber-50 ring-1 ring-amber-100';
      }

      if (type === 'duty' && state === 'cancelled') {
            return 'border-slate-200 bg-slate-100 opacity-70';
      }

      return 'border-slate-200 bg-slate-50/70';
}

function getVisualStateLabel(type: 'routine' | 'duty', state: string) {
      if (type === 'routine' && state === 'past') return 'Đã qua giờ';
      if (type === 'duty' && state === 'completed') return 'Đã hoàn thành';
      if (type === 'duty' && state === 'overdue') return 'Đã quá giờ';
      if (type === 'duty' && state === 'skipped') return 'Vắng / Không làm';
      if (type === 'duty' && state === 'cancelled') return 'Đã hủy';

      return '';
}

function getVisualStateBadgeClass(type: 'routine' | 'duty', state: string) {
      if (type === 'routine' && state === 'past') return 'border-slate-200 bg-white text-slate-500';
      if (type === 'duty' && state === 'completed') return 'border-green-200 bg-white text-green-700';
      if (type === 'duty' && state === 'overdue') return 'border-rose-200 bg-white text-rose-700';
      if (type === 'duty' && state === 'skipped') return 'border-amber-200 bg-white text-amber-700';
      if (type === 'duty' && state === 'cancelled') return 'border-slate-200 bg-white text-slate-500';

      return 'border-slate-100 bg-slate-50 text-slate-600';
}


function getAssigneeTypeLabel(type?: string | null) {
      if (type === 'team') return 'Tổ';
      if (type === 'room') return 'Phòng';
      if (type === 'committee') return 'Ban';
      return 'Học viên';
}


function getDutyTypeLabel(type?: string | null) {
      if (type === 'weekly') return 'Hằng tuần';
      if (type === 'monthly') return 'Hằng tháng';
      return 'Hằng ngày';
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

function Badge({
      children,
      className = '',
}: {
      children: React.ReactNode;
      className?: string;
}) {
      return (
            <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
            >
                  {children}
            </span>
      );
}

function SectionEmpty({
      title,
      description,
}: {
      title: string;
      description: string;
}) {
      return (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <p className="font-semibold text-slate-800">{title}</p>
                  <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
      );
}

export default function DailyRoutine() {
      const [activeView, setActiveView] = useState<DailyRoutineView>('today');
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
            assignWholeWeek: true,
            notes: '',
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

      const [message, setMessage] = useState<{
            type: 'success' | 'error' | 'info';
            text: string;
      } | null>(null);

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

      const dutiesQuery = trpc.duties.getAssignmentsByDate.useQuery({
            date: toDateAtNoon(selectedDate),
      });

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

      const dutyConfigs = dutyConfigsQuery.data || [];
      const members = (membersQuery.data || []) as any[];
      const rooms = (roomsQuery.data || []) as any[];
      const units = (unitsQuery.data || []) as any[];
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

      const completeAssignmentMutation = trpc.duties.completeAssignment.useMutation();
      const skipAssignmentMutation = trpc.duties.skipAssignment.useMutation();
      const assignDutyMutation = trpc.duties.assignDuty.useMutation();
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

            const dutyTimeline = (enrichedDutyAssignments || []).map((assignment: any) => {
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
      }, [items, enrichedDutyAssignments]);

      const filteredDutyAssignments = useMemo(() => {
            return (enrichedDutyAssignments as any[]).filter((assignment: any) => {
                  const visualState = getDutyVisualState(assignment, selectedDate);

                  if (dutyStatusFilter === 'all') return true;
                  if (dutyStatusFilter === 'open') {
                        return assignment.status !== 'completed' && assignment.status !== 'cancelled';
                  }
                  if (dutyStatusFilter === 'overdue') return visualState === 'overdue';

                  return assignment.status === dutyStatusFilter;
            });
      }, [enrichedDutyAssignments, dutyStatusFilter, selectedDate]);

      const completeAssignment = async (assignment: any) => {
            try {
                  await completeAssignmentMutation.mutateAsync({ id: assignment.id });
                  setMessage({ type: 'success', text: 'Đã đánh dấu hoàn thành công tác.' });
                  await dutiesQuery.refetch();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể cập nhật công tác.',
                  });
            }
      };

      const skipAssignment = async (assignment: any) => {
            try {
                  await skipAssignmentMutation.mutateAsync({
                        id: assignment.id,
                        reason: 'Vắng / không thực hiện',
                  });
                  setMessage({ type: 'success', text: 'Đã ghi nhận vắng / không làm công tác.' });
                  await dutiesQuery.refetch();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể cập nhật công tác.',
                  });
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
                        }"?\n\n` +
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
                  await cancelAssignmentMutation.mutateAsync({
                        id: pendingCancelAssignment.id,
                        reason: 'Hủy từ màn hình sinh hoạt hằng ngày',
                  });

                  setMessage({ type: 'success', text: 'Đã hủy công tác.' });
                  closeMessageBox();
                  await dutiesQuery.refetch();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể hủy công tác.',
                  });
                  closeMessageBox();
            }
      };

      const selectedDutyConfig = assignmentForm.dutyConfigId
            ? (dutyConfigs as any[]).find(
                    (duty: any) => String(duty.id) === assignmentForm.dutyConfigId
              )
            : null;

      const assignmentPreviewDates = useMemo(() => {
            if (!assignmentForm.assignedDate) return [];

            return selectedDutyConfig?.dutyType === 'daily' && assignmentForm.assignWholeWeek
                  ? getWeekDateValues(assignmentForm.assignedDate)
                  : [assignmentForm.assignedDate];
      }, [assignmentForm.assignedDate, assignmentForm.assignWholeWeek, selectedDutyConfig?.dutyType]);

      const isAssignmentPreviewReady = Boolean(
            assignmentForm.dutyConfigId &&
                  assignmentForm.assignedDate &&
                  assignmentForm.assignedToId &&
                  assignmentPreviewDates.length > 0
      );

      const assignmentPreviewQuery = trpc.duties.previewAssignment.useQuery(
            {
                  dutyConfigId: Number(assignmentForm.dutyConfigId || 0),
                  assignedDates: assignmentPreviewDates,
                  assignedToType: assignmentForm.assignedToType,
                  assignedToId: Number(assignmentForm.assignedToId || 0),
                  startTime: assignmentForm.startTime || null,
                  endTime: assignmentForm.endTime || null,
                  notes: assignmentForm.notes || null,
            },
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
                          canCreate: boolean;
                          reason?: string;
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
            if (assignmentForm.assignedToType === 'room') {
                  return rooms.map((room: any) => ({
                        id: room.id,
                        label: getRoomName(room),
                  }));
            }

            if (assignmentForm.assignedToType === 'team') {
                  return teams.map((unit: any) => ({
                        id: unit.id,
                        label: getUnitName(unit),
                  }));
            }

            if (assignmentForm.assignedToType === 'committee') {
                  return committees.map((unit: any) => ({
                        id: unit.id,
                        label: getUnitName(unit),
                  }));
            }

            return members.map((member: any) => ({
                  id: member.id,
                  label: getMemberName(member),
            }));
      };

      const saveAssignment = async () => {
            const dutyConfigId = Number(assignmentForm.dutyConfigId || 0);
            const assignedToId = Number(assignmentForm.assignedToId || 0);

            if (!dutyConfigId) {
                  setMessage({ type: 'error', text: 'Vui lòng chọn công tác.' });
                  return;
            }

            if (!assignmentForm.assignedDate) {
                  setMessage({ type: 'error', text: 'Vui lòng chọn ngày công tác.' });
                  return;
            }

            if (!assignedToId) {
                  setMessage({ type: 'error', text: 'Vui lòng chọn đối tượng được phân công.' });
                  return;
            }

            try {
                  const result = await assignDutyBatchMutation.mutateAsync({
                        dutyConfigId,
                        assignedDates: assignmentPreviewDates,
                        assignedToType: assignmentForm.assignedToType,
                        assignedToId,
                        startTime: assignmentForm.startTime || null,
                        endTime: assignmentForm.endTime || null,
                        notes: assignmentForm.notes || null,
                  } as any);

                  setSelectedDate(assignmentForm.assignedDate);
                  setMessage({
                        type: 'success',
                        text:
                              result.skipped > 0
                                    ? `Đã tạo ${result.created} phân công, bỏ qua ${result.skipped} ngày không phù hợp.`
                                    : `Đã tạo ${result.created} phân công.`,
                  });
                  setAssignmentForm({
                        dutyConfigId: '',
                        assignedDate: assignmentForm.assignedDate,
                        startTime: '',
                        endTime: '',
                        assignedToType: 'resident',
                        assignedToId: '',
                        assignWholeWeek: true,
                        notes: '',
                  });

                  await dutiesQuery.refetch();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể tạo phân công công tác.',
                  });
            }
      };

      const openCreateDutyConfig = () => {
            setSelectedDutyConfigForEdit(null);
            setIsDutyConfigFormOpen(true);
      };

      const openEditDutyConfig = (duty: any) => {
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

                  setMessage({
                        type: 'success',
                        text: 'Đã xóa mẫu công tác.',
                  });

                  closeMessageBox();
                  await dutyConfigsQuery.refetch();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text:
                              err?.message ||
                              'Không thể xóa mẫu công tác. Nếu đã phát sinh phân công, nên chuyển sang ngừng dùng.',
                  });
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
            setMessage(null);
            setTemplateForm({ ...emptyTemplateForm });
      };

      const openEditTemplate = (template: any) => {
            setMessage(null);
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
                  setMessage({ type: 'error', text: 'Vui lòng nhập mã mẫu lịch.' });
                  return;
            }

            if (!name) {
                  setMessage({ type: 'error', text: 'Vui lòng nhập tên mẫu lịch.' });
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
                        setMessage({ type: 'success', text: 'Đã cập nhật mẫu lịch.' });
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
                        setMessage({ type: 'success', text: 'Đã thêm mẫu lịch.' });
                  }

                  setTemplateForm(null);
                  await refetchAll();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể lưu mẫu lịch.',
                  });
            }
      };

      const removeTemplate = async (template: any) => {
            const confirmed = window.confirm(
                  `Xóa mẫu lịch "${template.name}"? Các khung giờ bên trong cũng sẽ bị xóa.`
            );

            if (!confirmed) return;

            try {
                  await removeTemplateMutation.mutateAsync({ id: template.id });
                  setMessage({ type: 'success', text: 'Đã xóa mẫu lịch.' });

                  if (selectedTemplateId === template.id) {
                        setSelectedTemplateId(null);
                  }

                  await refetchAll();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể xóa mẫu lịch.',
                  });
            }
      };

      const openCreateItem = () => {
            if (!currentTemplate?.id) {
                  setMessage({
                        type: 'error',
                        text: 'Vui lòng chọn mẫu lịch trước khi thêm khung giờ.',
                  });
                  return;
            }

            setMessage(null);
            setItemForm({
                  ...emptyItemForm,
                  templateId: String(currentTemplate.id),
            });
      };

      const openEditItem = (item: any) => {
            setMessage(null);
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
                  setMessage({ type: 'error', text: 'Vui lòng chọn mẫu lịch.' });
                  return;
            }

            if (!itemForm.startTime || !itemForm.endTime) {
                  setMessage({
                        type: 'error',
                        text: 'Vui lòng nhập giờ bắt đầu và giờ kết thúc.',
                  });
                  return;
            }

            if (itemForm.endTime <= itemForm.startTime) {
                  setMessage({
                        type: 'error',
                        text: 'Giờ kết thúc phải lớn hơn giờ bắt đầu.',
                  });
                  return;
            }

            if (!title) {
                  setMessage({ type: 'error', text: 'Vui lòng nhập tên hoạt động.' });
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

                        setMessage({ type: 'success', text: 'Đã cập nhật khung giờ.' });
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

                        setMessage({ type: 'success', text: 'Đã thêm khung giờ.' });
                  }

                  setItemForm(null);
                  await itemsQuery.refetch();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể lưu khung giờ.',
                  });
            }
      };

      const removeItem = async (item: any) => {
            const confirmed = window.confirm(`Xóa khung giờ "${item.title}"?`);

            if (!confirmed) return;

            try {
                  await removeItemMutation.mutateAsync({ id: item.id });
                  setMessage({ type: 'success', text: 'Đã xóa khung giờ.' });
                  await itemsQuery.refetch();
            } catch (err: any) {
                  setMessage({
                        type: 'error',
                        text: err?.message || 'Không thể xóa khung giờ.',
                  });
            }
      };

      return (
            <ResidenceCareLayout>
                  <div className="space-y-6 p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div>
                                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                                          Sinh hoạt
                                    </p>
                                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                                          Sinh hoạt hằng ngày
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                          Theo dõi lịch sinh hoạt và công tác trong ngày trên một màn hình gọn,
                                          dễ nhìn và dễ thực hiện.
                                    </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                    <button
                                          type="button"
                                          onClick={openCreateTemplate}
                                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                          <Plus className="h-4 w-4" />
                                          Thêm mẫu lịch
                                    </button>
                                    <button
                                          type="button"
                                          onClick={openCreateItem}
                                          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                    >
                                          <Clock className="h-4 w-4" />
                                          Thêm khung giờ
                                    </button>
                              </div>
                        </div>

                        {message && (
                              <div
                                    className={[
                                          'rounded-2xl border px-4 py-3 text-sm font-medium',
                                          message.type === 'success'
                                                ? 'border-green-100 bg-green-50 text-green-700'
                                                : message.type === 'error'
                                                      ? 'border-red-100 bg-red-50 text-red-700'
                                                      : 'border-blue-100 bg-blue-50 text-blue-700',
                                    ].join(' ')}
                              >
                                    {message.text}
                              </div>
                        )}

                        <div className="flex flex-wrap gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
                              {[
                                    { key: 'today', label: 'Hôm nay' },
                                    { key: 'routine', label: 'Thiết lập lịch' },
                                    { key: 'duties', label: 'Công tác' },
                              ].map((view) => (
                                    <button
                                          key={view.key}
                                          type="button"
                                          onClick={() => setActiveView(view.key as DailyRoutineView)}
                                          className={[
                                                'rounded-2xl px-4 py-2 text-sm font-semibold transition',
                                                activeView === view.key
                                                      ? 'bg-blue-600 text-white shadow-sm'
                                                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                                          ].join(' ')}
                                    >
                                          {view.label}
                                    </button>
                              ))}
                        </div>

                        {activeView === 'today' && (
                              <div className="space-y-5">
                                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                <div>
                                                      <h2 className="text-xl font-bold text-slate-950">
                                                            Hôm nay
                                                      </h2>
                                                      <p className="mt-1 text-sm text-slate-500">
                                                            Xem nhanh lịch sinh hoạt và các công tác cần theo dõi trong ngày.
                                                      </p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                      <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                                                            <CalendarDays className="h-4 w-4 text-slate-400" />
                                                            <Input
                                                                  type="date"
                                                                  value={selectedDate}
                                                                  onChange={(event) =>
                                                                        setSelectedDate(event.target.value)
                                                                  }
                                                                  className="h-8 border-0 p-0 shadow-none focus-visible:ring-0"
                                                            />
                                                      </label>

                                                      <button
                                                            type="button"
                                                            onClick={() => setActiveView('duties')}
                                                            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                                      >
                                                            <Plus className="h-4 w-4" />
                                                            Thêm phân công
                                                      </button>
                                                </div>
                                          </div>

                                          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                                                <Badge className="border-blue-100 bg-blue-50 text-blue-700">
                                                      {items.filter((item: any) => item.isActive).length} khung giờ sinh hoạt
                                                </Badge>
                                                <Badge className="border-orange-100 bg-orange-50 text-orange-700">
                                                      {enrichedDutyAssignments.length} công tác
                                                </Badge>
                                                <Badge className="border-green-100 bg-green-50 text-green-700">
                                                      {
                                                            (enrichedDutyAssignments as any[]).filter(
                                                                  (assignment: any) =>
                                                                        assignment.status === 'completed'
                                                            ).length
                                                      } đã hoàn thành
                                                </Badge>
                                                <Badge className="border-rose-100 bg-rose-50 text-rose-700">
                                                      {
                                                            (enrichedDutyAssignments as any[]).filter(
                                                                  (assignment: any) =>
                                                                        getDutyVisualState(
                                                                              assignment,
                                                                              selectedDate
                                                                        ) === 'overdue'
                                                            ).length
                                                      } quá giờ
                                                </Badge>
                                          </div>
                                    </div>

                                    {templatesQuery.isLoading || itemsQuery.isLoading || dutiesQuery.isLoading ? (
                                          <SectionEmpty
                                                title="Đang tải sinh hoạt trong ngày"
                                                description="Vui lòng chờ trong giây lát."
                                          />
                                    ) : (
                                          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                                                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                                      <div className="mb-4">
                                                            <h3 className="text-lg font-bold text-slate-950">
                                                                  Timeline trong ngày
                                                            </h3>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                  Lịch sinh hoạt và công tác được sắp theo giờ.
                                                            </p>
                                                      </div>

                                                      {todayTimelineItems.length === 0 ? (
                                                            <SectionEmpty
                                                                  title="Chưa có nội dung trong ngày"
                                                                  description="Thiết lập lịch sinh hoạt hoặc tạo công tác để hiển thị tại đây."
                                                            />
                                                      ) : (
                                                            <div className="space-y-3">
                                                                  {todayTimelineItems.map((entry: any) => (
                                                                        <div
                                                                              key={entry.key}
                                                                              className={[
                                                                                    'rounded-3xl border p-4 shadow-sm transition',
                                                                                    getTimelineCardClass(
                                                                                          entry.type,
                                                                                          entry.visualState
                                                                                    ),
                                                                              ].join(' ')}
                                                                        >
                                                                              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                                                    <div className="flex gap-4">
                                                                                          <div className="min-w-[98px] rounded-2xl bg-white px-3 py-2 text-center ring-1 ring-slate-200">
                                                                                                <p className="text-sm font-bold text-slate-950">
                                                                                                      {formatTime(entry.startTime)}
                                                                                                </p>
                                                                                                <p className="text-xs text-slate-400">
                                                                                                      đến
                                                                                                </p>
                                                                                                <p className="text-sm font-bold text-slate-950">
                                                                                                      {formatTime(entry.endTime)}
                                                                                                </p>
                                                                                          </div>

                                                                                          <div>
                                                                                                <div className="flex flex-wrap items-center gap-2">
                                                                                                      <h3 className="font-bold text-slate-950">
                                                                                                            {entry.title}
                                                                                                      </h3>

                                                                                                      {entry.type === 'routine' ? (
                                                                                                            <Badge className="border-blue-100 bg-blue-50 text-blue-700">
                                                                                                                  Lịch sinh hoạt
                                                                                                            </Badge>
                                                                                                      ) : (
                                                                                                            <Badge className={getStatusClass(entry.status)}>
                                                                                                                  {getStatusLabel(entry.status)}
                                                                                                            </Badge>
                                                                                                      )}

                                                                                                      {getVisualStateLabel(
                                                                                                            entry.type,
                                                                                                            entry.visualState
                                                                                                      ) && (
                                                                                                            <Badge
                                                                                                                  className={getVisualStateBadgeClass(
                                                                                                                        entry.type,
                                                                                                                        entry.visualState
                                                                                                                  )}
                                                                                                            >
                                                                                                                  {getVisualStateLabel(
                                                                                                                        entry.type,
                                                                                                                        entry.visualState
                                                                                                                  )}
                                                                                                            </Badge>
                                                                                                      )}
                                                                                                </div>

                                                                                                <p className="mt-1 text-sm text-slate-500">
                                                                                                      {entry.subTitle}
                                                                                                </p>

                                                                                                {entry.description && (
                                                                                                      <p className="mt-2 text-sm leading-6 text-slate-600">
                                                                                                            {entry.description}
                                                                                                      </p>
                                                                                                )}
                                                                                          </div>
                                                                                    </div>

                                                                                    {entry.type === 'duty' &&
                                                                                          entry.status !== 'completed' &&
                                                                                          entry.status !== 'cancelled' && (
                                                                                                <div className="flex flex-wrap gap-2 lg:justify-end">
                                                                                                      <button
                                                                                                            type="button"
                                                                                                            onClick={() =>
                                                                                                                  completeAssignment(
                                                                                                                        entry.assignment
                                                                                                                  )
                                                                                                            }
                                                                                                            className="inline-flex items-center gap-1.5 rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100"
                                                                                                      >
                                                                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                                                                            Hoàn thành
                                                                                                      </button>
                                                                                                      <button
                                                                                                            type="button"
                                                                                                            onClick={() =>
                                                                                                                  skipAssignment(
                                                                                                                        entry.assignment
                                                                                                                  )
                                                                                                            }
                                                                                                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                                                                                                      >
                                                                                                            <SkipForward className="h-3.5 w-3.5" />
                                                                                                            Vắng / Không làm
                                                                                                      </button>
                                                                                                </div>
                                                                                          )}
                                                                              </div>
                                                                        </div>
                                                                  ))}
                                                            </div>
                                                      )}
                                                </div>

                                                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                                      <div className="mb-4">
                                                            <h3 className="text-lg font-bold text-slate-950">
                                                                  Công tác cần theo dõi
                                                            </h3>
                                                            <p className="mt-1 text-sm text-slate-500">
                                                                  Ưu tiên xử lý các công tác chưa hoàn thành hoặc đã quá giờ.
                                                            </p>
                                                      </div>

                                                      {enrichedDutyAssignments.length === 0 ? (
                                                            <SectionEmpty
                                                                  title="Chưa có công tác"
                                                                  description="Bấm Thêm phân công để tạo công tác trong ngày."
                                                            />
                                                      ) : (
                                                            <div className="space-y-3">
                                                                  {(enrichedDutyAssignments as any[])
                                                                        .slice()
                                                                        .sort((a: any, b: any) => {
                                                                              const aState = getDutyVisualState(
                                                                                    a,
                                                                                    selectedDate
                                                                              );
                                                                              const bState = getDutyVisualState(
                                                                                    b,
                                                                                    selectedDate
                                                                              );
                                                                              const rank: Record<string, number> = {
                                                                                    overdue: 1,
                                                                                    normal: 2,
                                                                                    skipped: 3,
                                                                                    completed: 4,
                                                                                    cancelled: 5,
                                                                              };

                                                                              return (
                                                                                    (rank[aState] || 9) -
                                                                                    (rank[bState] || 9)
                                                                              );
                                                                        })
                                                                        .map((assignment: any) => {
                                                                              const visualState =
                                                                                    getDutyVisualState(
                                                                                          assignment,
                                                                                          selectedDate
                                                                                    );

                                                                              return (
                                                                                    <div
                                                                                          key={assignment.id}
                                                                                          className={[
                                                                                                'rounded-3xl border p-4 shadow-sm transition',
                                                                                                getTimelineCardClass(
                                                                                                      'duty',
                                                                                                      visualState
                                                                                                ),
                                                                                          ].join(' ')}
                                                                                    >
                                                                                          <div className="flex flex-wrap items-center gap-2">
                                                                                                <h4 className="font-bold text-slate-950">
                                                                                                      {assignment.dutyName ||
                                                                                                            assignment.dutyConfig?.dutyName ||
                                                                                                            `Công tác #${assignment.id}`}
                                                                                                </h4>
                                                                                                <Badge className={getStatusClass(assignment.status)}>
                                                                                                      {getStatusLabel(assignment.status)}
                                                                                                </Badge>
                                                                                                {getVisualStateLabel(
                                                                                                      'duty',
                                                                                                      visualState
                                                                                                ) && (
                                                                                                      <Badge
                                                                                                            className={getVisualStateBadgeClass(
                                                                                                                  'duty',
                                                                                                                  visualState
                                                                                                            )}
                                                                                                      >
                                                                                                            {getVisualStateLabel(
                                                                                                                  'duty',
                                                                                                                  visualState
                                                                                                            )}
                                                                                                      </Badge>
                                                                                                )}
                                                                                          </div>

                                                                                          <p className="mt-2 text-sm text-slate-600">
                                                                                                {formatTime(
                                                                                                      assignment.startDateTime ||
                                                                                                            assignment.startTime ||
                                                                                                            assignment.dutyConfig?.startTime
                                                                                                )}{' '}
                                                                                                -{' '}
                                                                                                {formatTime(
                                                                                                      assignment.endDateTime ||
                                                                                                            assignment.endTime ||
                                                                                                            assignment.dutyConfig?.endTime
                                                                                                )}
                                                                                          </p>

                                                                                          <p className="mt-1 text-sm text-slate-500">
                                                                                                {getAssigneeTypeLabel(
                                                                                                      assignment.assignedToType ||
                                                                                                            (assignment.residentId
                                                                                                                  ? 'resident'
                                                                                                                  : null)
                                                                                                )}
                                                                                                :{' '}
                                                                                                <span className="font-semibold text-slate-700">
                                                                                                      {assignment.assigneeName || getSimpleAssigneeName(assignment)}
                                                                                                </span>
                                                                                          </p>

                                                                                          {assignment.status !== 'completed' &&
                                                                                                assignment.status !== 'cancelled' && (
                                                                                                      <div className="mt-3 flex flex-wrap gap-2">
                                                                                                            <button
                                                                                                                  type="button"
                                                                                                                  onClick={() =>
                                                                                                                        completeAssignment(
                                                                                                                              assignment
                                                                                                                        )
                                                                                                                  }
                                                                                                                  className="inline-flex items-center gap-1.5 rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100"
                                                                                                            >
                                                                                                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                                                                                                  Hoàn thành
                                                                                                            </button>

                                                                                                            <button
                                                                                                                  type="button"
                                                                                                                  onClick={() =>
                                                                                                                        skipAssignment(
                                                                                                                              assignment
                                                                                                                        )
                                                                                                                  }
                                                                                                                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                                                                                                            >
                                                                                                                  <SkipForward className="h-3.5 w-3.5" />
                                                                                                                  Vắng
                                                                                                            </button>
                                                                                                      </div>
                                                                                                )}
                                                                                    </div>
                                                                              );
                                                                        })}
                                                            </div>
                                                      )}
                                                </div>
                                          </div>
                                    )}
                              </div>
                        )}

                        {activeView === 'duties' && (
                              <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
                                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                          <div className="mb-5 flex items-start justify-between gap-3">
                                                <div>
                                                      <h2 className="text-xl font-bold text-slate-950">
                                                            Tạo phân công
                                                      </h2>
                                                      <p className="mt-1 text-sm text-slate-500">
                                                            Giao công tác nhanh cho học viên, Tổ, phòng ngủ hoặc Ban.
                                                      </p>
                                                </div>

                                                <button
                                                      type="button"
                                                      onClick={() => setIsDutyTemplateDialogOpen(true)}
                                                      className="shrink-0 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                >
                                                      Mẫu công tác
                                                </button>
                                          </div>

                                          <div className="space-y-4">
                                                <label className="space-y-1.5">
                                                      <Label>Ngày công tác</Label>
                                                      <Input
                                                            type="date"
                                                            value={assignmentForm.assignedDate}
                                                            onChange={(event) =>
                                                                  setAssignmentForm((current) => ({
                                                                        ...current,
                                                                        assignedDate: event.target.value,
                                                                  }))
                                                            }
                                                            className="rounded-2xl"
                                                      />
                                                </label>

                                                <label className="space-y-1.5">
                                                      <Label>Công tác</Label>
                                                      <select
                                                            value={assignmentForm.dutyConfigId}
                                                            onChange={(event) => {
                                                                  const duty = (dutyConfigs as any[]).find(
                                                                        (item: any) =>
                                                                              String(item.id) ===
                                                                              event.target.value
                                                                  );

                                                                  setAssignmentForm((current) => ({
                                                                        ...current,
                                                                        dutyConfigId: event.target.value,
                                                                        startTime: formatTime(duty?.startTime),
                                                                        endTime: formatTime(duty?.endTime),
                                                                        assignWholeWeek: duty?.dutyType === 'daily',
                                                                  }));
                                                            }}
                                                            className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                                                      >
                                                            <option value="">Chọn công tác</option>
                                                            {(dutyConfigs as any[]).map((duty: any) => (
                                                                  <option key={duty.id} value={duty.id}>
                                                                        {duty.dutyName}
                                                                  </option>
                                                            ))}
                                                      </select>
                                                </label>

                                                {selectedDutyConfig?.dutyType === 'daily' && (
                                                      <label className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                                                            <input
                                                                  type="checkbox"
                                                                  checked={assignmentForm.assignWholeWeek}
                                                                  onChange={(event) =>
                                                                        setAssignmentForm((current) => ({
                                                                              ...current,
                                                                              assignWholeWeek: event.target.checked,
                                                                        }))
                                                                  }
                                                                  className="mt-1 h-4 w-4 rounded border-blue-300"
                                                            />
                                                            <span>
                                                                  <span className="font-semibold">
                                                                        Gán nguyên tuần
                                                                  </span>
                                                                  <span className="mt-1 block text-xs leading-5">
                                                                        Áp dụng cho tuần từ thứ Hai đến Chúa nhật của ngày đã chọn.
                                                                  </span>
                                                            </span>
                                                      </label>
                                                )}

                                                <div className="grid grid-cols-2 gap-3">
                                                      <label className="space-y-1.5">
                                                            <Label>Bắt đầu</Label>
                                                            <Input
                                                                  type="time"
                                                                  value={assignmentForm.startTime}
                                                                  onChange={(event) =>
                                                                        setAssignmentForm((current) => ({
                                                                              ...current,
                                                                              startTime: event.target.value,
                                                                        }))
                                                                  }
                                                                  className="rounded-2xl"
                                                            />
                                                      </label>

                                                      <label className="space-y-1.5">
                                                            <Label>Kết thúc</Label>
                                                            <Input
                                                                  type="time"
                                                                  value={assignmentForm.endTime}
                                                                  onChange={(event) =>
                                                                        setAssignmentForm((current) => ({
                                                                              ...current,
                                                                              endTime: event.target.value,
                                                                        }))
                                                                  }
                                                                  className="rounded-2xl"
                                                            />
                                                      </label>
                                                </div>

                                                <label className="space-y-1.5">
                                                      <Label>Giao cho</Label>
                                                      <select
                                                            value={assignmentForm.assignedToType}
                                                            onChange={(event) =>
                                                                  setAssignmentForm((current) => ({
                                                                        ...current,
                                                                        assignedToType:
                                                                              event.target.value as AssignToType,
                                                                        assignedToId: '',
                                                                  }))
                                                            }
                                                            className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                                                      >
                                                            <option value="resident">Học viên</option>
                                                            <option value="team">Tổ</option>
                                                            <option value="room">Phòng ngủ</option>
                                                            <option value="committee">Ban</option>
                                                      </select>
                                                </label>

                                                <label className="space-y-1.5">
                                                      <Label>Đối tượng</Label>
                                                      <select
                                                            value={assignmentForm.assignedToId}
                                                            onChange={(event) =>
                                                                  setAssignmentForm((current) => ({
                                                                        ...current,
                                                                        assignedToId: event.target.value,
                                                                  }))
                                                            }
                                                            className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                                                      >
                                                            <option value="">
                                                                  Chọn {getAssigneeTypeLabel(
                                                                        assignmentForm.assignedToType
                                                                  ).toLowerCase()}
                                                            </option>
                                                            {getAssigneeOptions().map((option) => (
                                                                  <option key={option.id} value={option.id}>
                                                                        {option.label}
                                                                  </option>
                                                            ))}
                                                      </select>
                                                </label>

                                                {selectedDutyConfig?.requiresStudyScheduleCheck && (
                                                      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                                            Công tác này cần lưu ý lịch học/vắng mặt khi phân công.
                                                      </div>
                                                )}

                                                <label className="space-y-1.5">
                                                      <Label>Ghi chú</Label>
                                                      <Textarea
                                                            value={assignmentForm.notes}
                                                            onChange={(event) =>
                                                                  setAssignmentForm((current) => ({
                                                                        ...current,
                                                                        notes: event.target.value,
                                                                  }))
                                                            }
                                                            rows={3}
                                                            className="rounded-2xl"
                                                      />
                                                </label>

                                                {isAssignmentPreviewReady && (
                                                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                                                            {assignmentPreviewQuery.isLoading ? (
                                                                  <p className="font-semibold">Đang kiểm tra phân công...</p>
                                                            ) : assignmentPreview ? (
                                                                  <div>
                                                                        <p className="font-semibold">
                                                                              Dự kiến tạo {assignmentPreview.canCreateCount} ngày
                                                                              {assignmentPreview.skippedCount > 0
                                                                                    ? `, bỏ qua ${assignmentPreview.skippedCount} ngày`
                                                                                    : ''}
                                                                        </p>
                                                                        {assignmentPreview.skippedCount > 0 && (
                                                                              <details className="mt-2">
                                                                                    <summary className="cursor-pointer text-xs font-semibold text-slate-600">
                                                                                          Xem ngày bỏ qua
                                                                                    </summary>
                                                                                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                                                                                          {assignmentPreview.items
                                                                                                .filter((item) => !item.canCreate)
                                                                                                .map((item) => (
                                                                                                      <p key={item.date}>
                                                                                                            {item.date}: {item.reason}
                                                                                                      </p>
                                                                                                ))}
                                                                                    </div>
                                                                              </details>
                                                                        )}
                                                                  </div>
                                                            ) : (
                                                                  <p>Chưa có dữ liệu kiểm tra.</p>
                                                            )}
                                                      </div>
                                                )}

                                                <button
                                                      type="button"
                                                      onClick={saveAssignment}
                                                      disabled={assignDutyBatchMutation.isPending || (isAssignmentPreviewReady && assignmentPreview?.canCreateCount === 0)}
                                                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                                                >
                                                      <Users className="h-4 w-4" />
                                                      {assignDutyBatchMutation.isPending
                                                            ? 'Đang lưu...'
                                                            : 'Lưu phân công'}
                                                </button>
                                          </div>
                                    </div>

                                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                <div>
                                                      <h2 className="text-xl font-bold text-slate-950">
                                                            Công tác trong ngày
                                                      </h2>
                                                      <p className="mt-1 text-sm text-slate-500">
                                                            Theo dõi và cập nhật tình trạng công tác.
                                                      </p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                      <button
                                                            type="button"
                                                            onClick={() => setSelectedDate(todayValue())}
                                                            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                      >
                                                            Hôm nay
                                                      </button>

                                                      <select
                                                            value={dutyStatusFilter}
                                                            onChange={(event) =>
                                                                  setDutyStatusFilter(event.target.value as DutyStatusFilter)
                                                            }
                                                            className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                                                      >
                                                            <option value="all">Tất cả</option>
                                                            <option value="open">Chưa hoàn tất</option>
                                                            <option value="overdue">Đã quá giờ</option>
                                                            <option value="completed">Hoàn thành</option>
                                                            <option value="skipped">Vắng / Không làm</option>
                                                            <option value="cancelled">Đã hủy</option>
                                                      </select>

                                                      <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                                                            <CalendarDays className="h-4 w-4 text-slate-400" />
                                                            <Input
                                                                  type="date"
                                                                  value={selectedDate}
                                                                  onChange={(event) => setSelectedDate(event.target.value)}
                                                                  className="h-8 border-0 p-0 shadow-none focus-visible:ring-0"
                                                            />
                                                      </label>
                                                </div>
                                          </div>

                                          {dutiesQuery.isLoading ? (
                                                <SectionEmpty
                                                      title="Đang tải công tác"
                                                      description="Vui lòng chờ trong giây lát."
                                                />
                                          ) : filteredDutyAssignments.length === 0 ? (
                                                <SectionEmpty
                                                      title="Chưa có công tác trong ngày"
                                                      description="Chưa có công tác phù hợp với bộ lọc hiện tại."
                                                />
                                          ) : (
                                                <div className="space-y-3">
                                                      {filteredDutyAssignments.map((assignment: any) => (
                                                            <div
                                                                  key={assignment.id}
                                                                  className={[
                                                                        'rounded-3xl border p-4 shadow-sm transition',
                                                                        getTimelineCardClass(
                                                                              'duty',
                                                                              getDutyVisualState(assignment, selectedDate)
                                                                        ),
                                                                  ].join(' ')}
                                                            >
                                                                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                                        <div className="flex gap-4">
                                                                              <div className="min-w-[98px] rounded-2xl bg-white px-3 py-2 text-center ring-1 ring-slate-200">
                                                                                    <p className="text-sm font-bold text-slate-950">
                                                                                          {formatTime(
                                                                                                assignment.startDateTime ||
                                                                                                      assignment.startTime ||
                                                                                                      assignment.dutyConfig?.startTime
                                                                                          )}
                                                                                    </p>
                                                                                    <p className="text-xs text-slate-400">đến</p>
                                                                                    <p className="text-sm font-bold text-slate-950">
                                                                                          {formatTime(
                                                                                                assignment.endDateTime ||
                                                                                                      assignment.endTime ||
                                                                                                      assignment.dutyConfig?.endTime
                                                                                          )}
                                                                                    </p>
                                                                              </div>

                                                                              <div>
                                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                                          <h3 className="font-bold text-slate-950">
                                                                                                {assignment.dutyName ||
                                                                                                      assignment.dutyConfig?.dutyName ||
                                                                                                      `Công tác #${assignment.id}`}
                                                                                          </h3>
                                                                                          <Badge className={getStatusClass(assignment.status)}>
                                                                                                {getStatusLabel(assignment.status)}
                                                                                          </Badge>

                                                                                          {getVisualStateLabel(
                                                                                                'duty',
                                                                                                getDutyVisualState(assignment, selectedDate)
                                                                                          ) && (
                                                                                                <Badge
                                                                                                      className={getVisualStateBadgeClass(
                                                                                                            'duty',
                                                                                                            getDutyVisualState(
                                                                                                                  assignment,
                                                                                                                  selectedDate
                                                                                                            )
                                                                                                      )}
                                                                                                >
                                                                                                      {getVisualStateLabel(
                                                                                                            'duty',
                                                                                                            getDutyVisualState(
                                                                                                                  assignment,
                                                                                                                  selectedDate
                                                                                                            )
                                                                                                      )}
                                                                                                </Badge>
                                                                                          )}
                                                                                    </div>

                                                                                    <p className="mt-1 text-sm text-slate-500">
                                                                                          {getAssigneeTypeLabel(
                                                                                                assignment.assignedToType ||
                                                                                                      (assignment.residentId ? 'resident' : null)
                                                                                          )}
                                                                                          :{' '}
                                                                                          <span className="font-semibold text-slate-700">
                                                                                                {assignment.assigneeName || getSimpleAssigneeName(assignment)}
                                                                                          </span>
                                                                                    </p>

                                                                                    {assignment.dutyConfig && (
                                                                                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                                                                                <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                                                                                                      {getDutyTypeLabel(assignment.dutyConfig.dutyType)}
                                                                                                </span>
                                                                                                {(assignment.dutyConfig.minPersons ||
                                                                                                      assignment.dutyConfig.maxPersons) && (
                                                                                                      <span className="rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-200">
                                                                                                            Số người:{' '}
                                                                                                            {assignment.dutyConfig.minPersons || 0}
                                                                                                            {assignment.dutyConfig.maxPersons
                                                                                                                  ? ` - ${assignment.dutyConfig.maxPersons}`
                                                                                                                  : '+'}
                                                                                                      </span>
                                                                                                )}
                                                                                          </div>
                                                                                    )}
                                                                              </div>
                                                                        </div>

                                                                        {assignment.status !== 'completed' && assignment.status !== 'cancelled' && (
                                                                              <div className="flex flex-wrap gap-2 lg:justify-end">
                                                                                    <button
                                                                                          type="button"
                                                                                          onClick={() => completeAssignment(assignment)}
                                                                                          className="inline-flex items-center gap-1.5 rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100"
                                                                                    >
                                                                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                                                                          Hoàn thành
                                                                                    </button>
                                                                                    <button
                                                                                          type="button"
                                                                                          onClick={() => skipAssignment(assignment)}
                                                                                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                                                                                    >
                                                                                          <SkipForward className="h-3.5 w-3.5" />
                                                                                          Vắng / Không làm
                                                                                    </button>

                                                                                    <button
                                                                                          type="button"
                                                                                          onClick={() => requestCancelAssignment(assignment)}
                                                                                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                                                                    >
                                                                                          <X className="h-3.5 w-3.5" />
                                                                                          Hủy
                                                                                    </button>
                                                                              </div>
                                                                        )}
                                                                  </div>
                                                            </div>
                                                      ))}
                                                </div>
                                          )}
                                    </div>
                              </div>
                        )}

                        {activeView === 'routine' && (
                        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="mb-4">
                                          <h2 className="text-lg font-bold text-slate-950">
                                                Mẫu lịch sinh hoạt
                                          </h2>
                                          <p className="mt-1 text-sm text-slate-500">
                                                Chọn mẫu lịch để xem và sắp xếp các khung giờ.
                                          </p>
                                    </div>

                                    <div className="mb-4 space-y-3">
                                          <div className="relative">
                                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                                <Input
                                                      value={searchTerm}
                                                      onChange={(event) =>
                                                            setSearchTerm(event.target.value)
                                                      }
                                                      placeholder="Tìm mẫu lịch..."
                                                      className="rounded-2xl pl-9"
                                                />
                                          </div>

                                          <select
                                                value={dayTypeFilter}
                                                onChange={(event) =>
                                                      setDayTypeFilter(event.target.value as any)
                                                }
                                                className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                                          >
                                                <option value="all">Tất cả loại ngày</option>
                                                <option value="weekday">Ngày thường</option>
                                                <option value="sunday">Chúa nhật</option>
                                                <option value="special">Ngày đặc biệt</option>
                                          </select>
                                    </div>

                                    {templatesQuery.isLoading ? (
                                          <SectionEmpty
                                                title="Đang tải mẫu lịch"
                                                description="Vui lòng chờ trong giây lát."
                                          />
                                    ) : templates.length === 0 ? (
                                          <SectionEmpty
                                                title="Chưa có mẫu lịch"
                                                description="Thêm mẫu lịch để bắt đầu thiết lập lịch sinh hoạt."
                                          />
                                    ) : (
                                          <div className="space-y-3">
                                                {templates.map((template: any) => {
                                                      const isSelected =
                                                            currentTemplate?.id === template.id;

                                                      return (
                                                            <button
                                                                  type="button"
                                                                  key={template.id}
                                                                  onClick={() =>
                                                                        setSelectedTemplateId(template.id)
                                                                  }
                                                                  className={[
                                                                        'w-full rounded-3xl border p-4 text-left transition',
                                                                        isSelected
                                                                              ? 'border-blue-300 bg-blue-50 shadow-sm'
                                                                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                                                                  ].join(' ')}
                                                            >
                                                                  <div className="flex items-start justify-between gap-3">
                                                                        <div>
                                                                              <p className="font-bold text-slate-950">
                                                                                    {template.name}
                                                                              </p>
                                                                              <p className="mt-1 text-xs text-slate-500">
                                                                                    {template.code}
                                                                              </p>
                                                                        </div>

                                                                        <Badge
                                                                              className={getDayTypeClass(
                                                                                    template.dayType
                                                                              )}
                                                                        >
                                                                              {getDayTypeLabel(
                                                                                    template.dayType
                                                                              )}
                                                                        </Badge>
                                                                  </div>

                                                                  {template.description && (
                                                                        <p className="mt-3 text-sm leading-6 text-slate-500">
                                                                              {template.description}
                                                                        </p>
                                                                  )}

                                                                  <div className="mt-4 flex flex-wrap gap-2">
                                                                        <button
                                                                              type="button"
                                                                              onClick={(event) => {
                                                                                    event.stopPropagation();
                                                                                    openEditTemplate(template);
                                                                              }}
                                                                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                                        >
                                                                              <Edit2 className="h-3.5 w-3.5" />
                                                                              Sửa
                                                                        </button>
                                                                        <button
                                                                              type="button"
                                                                              onClick={(event) => {
                                                                                    event.stopPropagation();
                                                                                    removeTemplate(template);
                                                                              }}
                                                                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                                                        >
                                                                              <Trash2 className="h-3.5 w-3.5" />
                                                                              Xóa
                                                                        </button>
                                                                  </div>
                                                            </button>
                                                      );
                                                })}
                                          </div>
                                    )}
                              </div>

                              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                          <div>
                                                <h2 className="text-xl font-bold text-slate-950">
                                                      {currentTemplate?.name || 'Chưa chọn mẫu lịch'}
                                                </h2>
                                                <p className="mt-1 text-sm text-slate-500">
                                                      {currentTemplate
                                                            ? `${getDayTypeLabel(
                                                                    currentTemplate.dayType
                                                              )} · ${currentTemplate.code}`
                                                            : 'Chọn một mẫu lịch ở bên trái để xem khung giờ.'}
                                                </p>
                                          </div>

                                          <button
                                                type="button"
                                                onClick={openCreateItem}
                                                disabled={!currentTemplate}
                                                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                          >
                                                <Plus className="h-4 w-4" />
                                                Thêm khung giờ
                                          </button>
                                    </div>

                                    {!currentTemplate ? (
                                          <SectionEmpty
                                                title="Chưa chọn mẫu lịch"
                                                description="Chọn một mẫu lịch để quản lý các khung giờ sinh hoạt."
                                          />
                                    ) : itemsQuery.isLoading ? (
                                          <SectionEmpty
                                                title="Đang tải khung giờ"
                                                description="Vui lòng chờ trong giây lát."
                                          />
                                    ) : items.length === 0 ? (
                                          <SectionEmpty
                                                title="Chưa có khung giờ"
                                                description="Thêm các hoạt động trong ngày cho mẫu lịch này."
                                          />
                                    ) : (
                                          <div className="space-y-3">
                                                {items.map((item: any) => (
                                                      <div
                                                            key={item.id}
                                                            className={[
                                                                  'rounded-3xl border p-4 shadow-sm',
                                                                  item.isActive
                                                                        ? 'border-slate-200 bg-slate-50/70'
                                                                        : 'border-slate-200 bg-slate-100 opacity-70',
                                                            ].join(' ')}
                                                      >
                                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                                  <div className="flex gap-4">
                                                                        <div className="min-w-[96px] rounded-2xl bg-white px-3 py-2 text-center ring-1 ring-slate-200">
                                                                              <p className="text-sm font-bold text-slate-950">
                                                                                    {formatTime(item.startTime)}
                                                                              </p>
                                                                              <p className="text-xs text-slate-400">
                                                                                    đến
                                                                              </p>
                                                                              <p className="text-sm font-bold text-slate-950">
                                                                                    {formatTime(item.endTime)}
                                                                              </p>
                                                                        </div>

                                                                        <div>
                                                                              <div className="flex flex-wrap items-center gap-2">
                                                                                    <h3 className="font-bold text-slate-950">
                                                                                          {item.title}
                                                                                    </h3>
                                                                                    <Badge
                                                                                          className={
                                                                                                item.isActive
                                                                                                      ? 'border-green-100 bg-green-50 text-green-700'
                                                                                                      : 'border-slate-200 bg-slate-100 text-slate-600'
                                                                                          }
                                                                                    >
                                                                                          {item.isActive
                                                                                                ? 'Đang áp dụng'
                                                                                                : 'Ngừng dùng'}
                                                                                    </Badge>
                                                                              </div>

                                                                              <p className="mt-1 text-sm text-slate-500">
                                                                                    {item.location || 'Chưa có địa điểm'}
                                                                              </p>

                                                                              {item.description && (
                                                                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                                                                          {item.description}
                                                                                    </p>
                                                                              )}
                                                                        </div>
                                                                  </div>

                                                                  <div className="flex flex-wrap gap-2 lg:justify-end">
                                                                        <button
                                                                              type="button"
                                                                              onClick={() => openEditItem(item)}
                                                                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                                        >
                                                                              <Edit2 className="h-3.5 w-3.5" />
                                                                              Sửa
                                                                        </button>
                                                                        <button
                                                                              type="button"
                                                                              onClick={() => removeItem(item)}
                                                                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                                                        >
                                                                              <Trash2 className="h-3.5 w-3.5" />
                                                                              Xóa
                                                                        </button>
                                                                  </div>
                                                            </div>
                                                      </div>
                                                ))}
                                          </div>
                                    )}
                              </div>
                        </div>

                        )}

                        {templateForm && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
                                    <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl">
                                          <div className="mb-5 flex items-start justify-between">
                                                <div>
                                                      <h2 className="text-xl font-bold text-slate-950">
                                                            {templateForm.id
                                                                  ? 'Cập nhật mẫu lịch'
                                                                  : 'Thêm mẫu lịch'}
                                                      </h2>
                                                      <p className="mt-1 text-sm text-slate-500">
                                                            Thiết lập loại ngày và tên mẫu lịch sinh hoạt.
                                                      </p>
                                                </div>
                                                <button
                                                      type="button"
                                                      onClick={() => setTemplateForm(null)}
                                                      className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                                                >
                                                      <X className="h-4 w-4" />
                                                </button>
                                          </div>

                                          <div className="grid gap-4 md:grid-cols-2">
                                                <label className="space-y-1.5">
                                                      <Label>Mã mẫu lịch</Label>
                                                      <Input
                                                            value={templateForm.code}
                                                            onChange={(event) =>
                                                                  setTemplateForm((current) =>
                                                                        current
                                                                              ? {
                                                                                      ...current,
                                                                                      code: event.target.value,
                                                                                }
                                                                              : current
                                                                  )
                                                            }
                                                            placeholder="WEEKDAY_DEFAULT"
                                                            className="rounded-2xl"
                                                      />
                                                </label>

                                                <label className="space-y-1.5">
                                                      <Label>Loại ngày</Label>
                                                      <select
                                                            value={templateForm.dayType}
                                                            onChange={(event) =>
                                                                  setTemplateForm((current) =>
                                                                        current
                                                                              ? {
                                                                                      ...current,
                                                                                      dayType: event.target
                                                                                            .value as DayType,
                                                                                }
                                                                              : current
                                                                  )
                                                            }
                                                            className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                                                      >
                                                            <option value="weekday">Ngày thường</option>
                                                            <option value="sunday">Chúa nhật</option>
                                                            <option value="special">Ngày đặc biệt</option>
                                                      </select>
                                                </label>

                                                <label className="space-y-1.5 md:col-span-2">
                                                      <Label>Tên mẫu lịch</Label>
                                                      <Input
                                                            value={templateForm.name}
                                                            onChange={(event) =>
                                                                  setTemplateForm((current) =>
                                                                        current
                                                                              ? {
                                                                                      ...current,
                                                                                      name: event.target.value,
                                                                                }
                                                                              : current
                                                                  )
                                                            }
                                                            placeholder="Lịch ngày thường"
                                                            className="rounded-2xl"
                                                      />
                                                </label>

                                                <label className="space-y-1.5">
                                                      <Label>Thứ tự</Label>
                                                      <Input
                                                            value={templateForm.sortOrder}
                                                            onChange={(event) =>
                                                                  setTemplateForm((current) =>
                                                                        current
                                                                              ? {
                                                                                      ...current,
                                                                                      sortOrder: event.target.value,
                                                                                }
                                                                              : current
                                                                  )
                                                            }
                                                            className="rounded-2xl"
                                                      />
                                                </label>

                                                <label className="flex items-center gap-2 pt-7 text-sm font-semibold text-slate-700">
                                                      <input
                                                            type="checkbox"
                                                            checked={templateForm.isActive}
                                                            onChange={(event) =>
                                                                  setTemplateForm((current) =>
                                                                        current
                                                                              ? {
                                                                                      ...current,
                                                                                      isActive:
                                                                                            event.target.checked,
                                                                                }
                                                                              : current
                                                                  )
                                                            }
                                                            className="h-4 w-4 rounded border-slate-300"
                                                      />
                                                      Đang áp dụng
                                                </label>

                                                <label className="space-y-1.5 md:col-span-2">
                                                      <Label>Ghi chú</Label>
                                                      <Textarea
                                                            value={templateForm.description}
                                                            onChange={(event) =>
                                                                  setTemplateForm((current) =>
                                                                        current
                                                                              ? {
                                                                                      ...current,
                                                                                      description:
                                                                                            event.target.value,
                                                                                }
                                                                              : current
                                                                  )
                                                            }
                                                            rows={3}
                                                            className="rounded-2xl"
                                                      />
                                                </label>
                                          </div>

                                          <div className="mt-5 flex justify-end gap-2">
                                                <button
                                                      type="button"
                                                      onClick={() => setTemplateForm(null)}
                                                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                >
                                                      Hủy
                                                </button>
                                                <button
                                                      type="button"
                                                      onClick={saveTemplate}
                                                      disabled={isSavingTemplate}
                                                      className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                                                >
                                                      <Save className="h-4 w-4" />
                                                      Lưu
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        )}

                        {itemForm && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
                                    <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-2xl">
                                          <div className="mb-5 flex items-start justify-between">
                                                <div>
                                                      <h2 className="text-xl font-bold text-slate-950">
                                                            {itemForm.id
                                                                  ? 'Cập nhật khung giờ'
                                                                  : 'Thêm khung giờ'}
                                                      </h2>
                                                      <p className="mt-1 text-sm text-slate-500">
                                                            Thiết lập thời gian, địa điểm và nội dung sinh hoạt.
                                                      </p>
                                                </div>
                                                <button
                                                      type="button"
                                                      onClick={() => setItemForm(null)}
                                                      className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                                                >
                                                      <X className="h-4 w-4" />
                                                </button>
                                          </div>

                                          <div className="grid gap-4 md:grid-cols-2">
                                                <label className="space-y-1.5 md:col-span-2">
                                                      <Label>Mẫu lịch</Label>
                                                      <select
                                                            value={itemForm.templateId}
                                                            onChange={(event) =>
                                                                  setItemForm((current) =>
                                                                        current
                                                                              ? {
                                                                                      ...current,
                                                                                      templateId:
                                                                                            event.target.value,
                                                                                }
                                                                              : current
                                                                  )
                                                            }
                                                            className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm"
                                                      >
                                                            <option value="">Chọn mẫu lịch</option>
                                                            {templates.map((template: any) => (
                                                                  <option
                                                                        key={template.id}
                                                                        value={template.id}
                                                                  >
                                                                        {template.name}
                                                                  </option>
                                                            ))}
                                                      </select>
                                                </label>

                                                <label className="space-y-1.5">
                                                      <Label>Giờ bắt đầu</Label>
                                                      <Input
                                                            type="time"
                                                            value={itemForm.startTime}
                                                            onChange={(event) =>
                                                                  setItemForm((current) =>
                                                                        current
                                                                              ? {
                                                                                      ...current,
                                                                                      startTime:
                                                                                            event.target.value,
                                                                                }
                                                                              : current
                                                                  )
                                                            }
                                                            className="rounded-2xl"
                                                      />
                                                </label>

                                                <label className="space-y-1.5">
                                                      <Label>Giờ kết thúc</Label>
                                                      <Input
                                                            type="time"
                                                            value={itemForm.endTime}
                                                            onChange={(event) =>
                                                                  setItemForm((current) =>
                                                                        current
                                                                              ? {
                                                                                      ...current,
                                                                                      endTime:
                                                                                            event.target.value,
                                                                                }
                                                                              : current
                                                                  )
                                                            }
                                                            className="rounded-2xl"
                                                      />
                                                </label>

                                                <label className="space-y-1.5 md:col-span-2">
                                                      <Label>Tên hoạt động</Label>
                                                      <Input
                                                            value={itemForm.title}
                                                            onChange={(event) =>
                                                                  setItemForm((current) =>
                                                                        current
                                                                              ? {
                                                                                      ...current,
                                                                                      title: event.target.value,
                                                                                }
                                                                              : current
                                                                  )
                                                            }
                                                            placeholder="Giờ học bài"
                                                            className="rounded-2xl"
                                                      />
                                                </label>

                                                <label className="space-y-1.5">
                                                      <Label>Địa điểm</Label>
                                                      <Input
                                                            value={itemForm.location}
                                                            onChange={(event) =>
                                                                  setItemForm((current) =>
                                                                        current
                                                                              ? {
                                                                                      ...current,
                                                                                      location:
                                                                                            event.target.value,
                                                                                }
                                                                              : current
                                                                  )
                                                            }
                                                            placeholder="Phòng sinh hoạt"
                                                            className="rounded-2xl"
                                                      />
                                                </label>

                                                <label className="space-y-1.5">
                                                      <Label>Thứ tự</Label>
                                                      <Input
                                                            value={itemForm.sortOrder}
                                                            onChange={(event) =>
                                                                  setItemForm((current) =>
                                                                        current
                                                                              ? {
                                                                                      ...current,
                                                                                      sortOrder:
                                                                                            event.target.value,
                                                                                }
                                                                              : current
                                                                  )
                                                            }
                                                            className="rounded-2xl"
                                                      />
                                                </label>

                                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                      <input
                                                            type="checkbox"
                                                            checked={itemForm.isActive}
                                                            onChange={(event) =>
                                                                  setItemForm((current) =>
                                                                        current
                                                                              ? {
                                                                                      ...current,
                                                                                      isActive:
                                                                                            event.target.checked,
                                                                                }
                                                                              : current
                                                                  )
                                                            }
                                                            className="h-4 w-4 rounded border-slate-300"
                                                      />
                                                      Đang áp dụng
                                                </label>

                                                <label className="space-y-1.5 md:col-span-2">
                                                      <Label>Ghi chú</Label>
                                                      <Textarea
                                                            value={itemForm.description}
                                                            onChange={(event) =>
                                                                  setItemForm((current) =>
                                                                        current
                                                                              ? {
                                                                                      ...current,
                                                                                      description:
                                                                                            event.target.value,
                                                                                }
                                                                              : current
                                                                  )
                                                            }
                                                            rows={3}
                                                            className="rounded-2xl"
                                                      />
                                                </label>
                                          </div>

                                          <div className="mt-5 flex justify-end gap-2">
                                                <button
                                                      type="button"
                                                      onClick={() => setItemForm(null)}
                                                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                >
                                                      Hủy
                                                </button>
                                                <button
                                                      type="button"
                                                      onClick={saveItem}
                                                      disabled={isSavingItem}
                                                      className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                                                >
                                                      <Save className="h-4 w-4" />
                                                      Lưu
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        )}

                        {isDutyTemplateDialogOpen && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
                                    <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl">
                                          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                <div>
                                                      <h2 className="text-xl font-bold text-slate-950">
                                                            Mẫu công tác
                                                      </h2>
                                                      <p className="mt-1 text-sm text-slate-500">
                                                            Quản lý các mẫu công tác dùng lại khi phân công hằng ngày.
                                                      </p>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                      <button
                                                            type="button"
                                                            onClick={openCreateDutyConfig}
                                                            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                                      >
                                                            <Plus className="h-4 w-4" />
                                                            Thêm mẫu
                                                      </button>
                                                      <button
                                                            type="button"
                                                            onClick={() => setIsDutyTemplateDialogOpen(false)}
                                                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                      >
                                                            Đóng
                                                      </button>
                                                </div>
                                          </div>

                                          {dutyConfigsQuery.isLoading ? (
                                                <SectionEmpty
                                                      title="Đang tải mẫu công tác"
                                                      description="Vui lòng chờ trong giây lát."
                                                />
                                          ) : (dutyConfigs as any[]).length === 0 ? (
                                                <SectionEmpty
                                                      title="Chưa có mẫu công tác"
                                                      description="Thêm mẫu công tác để tạo phân công nhanh."
                                                />
                                          ) : (
                                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                      {(dutyConfigs as any[]).map((duty: any) => (
                                                            <div
                                                                  key={duty.id}
                                                                  className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 shadow-sm"
                                                            >
                                                                  <div className="flex items-start justify-between gap-3">
                                                                        <div>
                                                                              <p className="font-bold text-slate-950">
                                                                                    {duty.dutyName}
                                                                              </p>
                                                                              <p className="mt-1 text-xs text-slate-500">
                                                                                    {duty.dutyCode}
                                                                              </p>
                                                                        </div>

                                                                        <Badge className="border-blue-100 bg-blue-50 text-blue-700">
                                                                              {duty.dutyType === 'weekly'
                                                                                    ? 'Hằng tuần'
                                                                                    : duty.dutyType === 'monthly'
                                                                                          ? 'Hằng tháng'
                                                                                          : 'Hằng ngày'}
                                                                        </Badge>
                                                                  </div>

                                                                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                                                                        <Clock className="h-4 w-4 text-slate-400" />
                                                                        {formatTime(duty.startTime)} - {formatTime(duty.endTime)}
                                                                  </div>

                                                                  {duty.description && (
                                                                        <p className="mt-3 text-sm leading-6 text-slate-600">
                                                                              {duty.description}
                                                                        </p>
                                                                  )}

                                                                  <div className="mt-4 flex flex-wrap gap-2">
                                                                        <button
                                                                              type="button"
                                                                              onClick={() => {
                                                                                    setAssignmentForm((current) => ({
                                                                                          ...current,
                                                                                          dutyConfigId: String(duty.id),
                                                                                          startTime: formatTime(duty.startTime),
                                                                                          endTime: formatTime(duty.endTime),
                                                                                    }));
                                                                                    setIsDutyTemplateDialogOpen(false);
                                                                                    setActiveView('duties');
                                                                              }}
                                                                              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                                                        >
                                                                              <Plus className="h-3.5 w-3.5" />
                                                                              Chọn phân công
                                                                        </button>

                                                                        <button
                                                                              type="button"
                                                                              onClick={() => openEditDutyConfig(duty)}
                                                                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                                                        >
                                                                              <Edit2 className="h-3.5 w-3.5" />
                                                                              Sửa
                                                                        </button>

                                                                        <button
                                                                              type="button"
                                                                              onClick={() => requestDeleteDutyConfig(duty)}
                                                                              disabled={deleteDutyConfigMutation.isPending}
                                                                              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                                        >
                                                                              <Trash2 className="h-3.5 w-3.5" />
                                                                              Xóa
                                                                        </button>
                                                                  </div>
                                                            </div>
                                                      ))}
                                                </div>
                                          )}
                                    </div>
                              </div>
                        )}

                        {isDutyConfigFormOpen && (
                              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
                                    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl">
                                          <div className="mb-5 flex items-start justify-between">
                                                <div>
                                                      <h2 className="text-xl font-bold text-slate-950">
                                                            {selectedDutyConfigForEdit
                                                                  ? 'Cập nhật mẫu công tác'
                                                                  : 'Thêm mẫu công tác'}
                                                      </h2>
                                                      <p className="mt-1 text-sm text-slate-500">
                                                            Thiết lập thông tin công tác và danh sách việc cần hoàn thành.
                                                      </p>
                                                </div>

                                                <button
                                                      type="button"
                                                      onClick={() => setIsDutyConfigFormOpen(false)}
                                                      className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                                                >
                                                      <X className="h-4 w-4" />
                                                </button>
                                          </div>

                                          <DutyConfigForm
                                                duty={selectedDutyConfigForEdit}
                                                onSave={async () => {
                                                      setIsDutyConfigFormOpen(false);
                                                      setSelectedDutyConfigForEdit(null);
                                                      setMessage({
                                                            type: 'success',
                                                            text: selectedDutyConfigForEdit
                                                                  ? 'Đã cập nhật mẫu công tác.'
                                                                  : 'Đã thêm mẫu công tác.',
                                                      });
                                                      await dutyConfigsQuery.refetch();
                                                }}
                                                onCancel={() => setIsDutyConfigFormOpen(false)}
                                          />
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
            </ResidenceCareLayout>
      );
}
