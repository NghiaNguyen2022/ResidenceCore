export const ACTIVITY_TYPES = [
      { value: 'community', label: 'Sinh hoạt chung', icon: '🌿' },
      { value: 'spiritual', label: 'Thiêng liêng', icon: '⛪' },
      { value: 'study', label: 'Học tập', icon: '📚' },
      { value: 'sports', label: 'Thể thao', icon: '🏃' },
      { value: 'culture', label: 'Văn hóa', icon: '🎭' },
      { value: 'volunteer', label: 'Phục vụ', icon: '🤝' },
      { value: 'meeting', label: 'Họp', icon: '📝' },
      { value: 'other', label: 'Khác', icon: '✨' },
] as const;

export const ACTIVITY_STATUSES = [
      { value: 'draft', label: 'Nháp' },
      { value: 'scheduled', label: 'Dự kiến' },
      { value: 'in_progress', label: 'Đang diễn ra' },
      { value: 'completed', label: 'Đã diễn ra' },
      { value: 'cancelled', label: 'Đã hủy' },
] as const;

export const ACTIVITY_TYPE_OPTIONS = ACTIVITY_TYPES.map(({ value, label }) => ({ value, label }));
export const ACTIVITY_STATUS_OPTIONS = ACTIVITY_STATUSES.map(({ value, label }) => ({ value, label }));

export type ActivityType = (typeof ACTIVITY_TYPES)[number]['value'];
export type ActivityStatus = (typeof ACTIVITY_STATUSES)[number]['value'];

export type Activity = {
      id: number;
      code: string;
      title: string;
      activityType: ActivityType;
      status: ActivityStatus;
      activityDate: string;
      startTime?: string | null;
      endTime?: string | null;
      location?: string | null;
      ownerGroup?: string | null;
      expectedParticipants?: number | null;
      actualParticipants?: number | null;
      description?: string | null;
      notes?: string | null;
      isPublicOnPortal?: boolean | number | null;
};

export type ActivityForm = {
      code: string;
      title: string;
      activityType: ActivityType;
      status: ActivityStatus;
      activityDate: string;
      startTime: string;
      endTime: string;
      location: string;
      ownerGroup: string;
      expectedParticipants: string;
      description: string;
      notes: string;
      isPublicOnPortal: boolean;
};

export const DEFAULT_FORM: ActivityForm = {
      code: '',
      title: '',
      activityType: 'community',
      status: 'scheduled',
      activityDate: '',
      startTime: '19:00',
      endTime: '20:30',
      location: '',
      ownerGroup: '',
      expectedParticipants: '0',
      description: '',
      notes: '',
      isPublicOnPortal: true,
};

export function normalizeCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
}

export function getActivityTypeMeta(type?: string | null) {
      return ACTIVITY_TYPES.find((item) => item.value === type) ?? ACTIVITY_TYPES[0];
}

export function getStatusLabel(status?: string | null) {
      return ACTIVITY_STATUSES.find((item) => item.value === status)?.label ?? 'Dự kiến';
}

export function getStatusTone(status?: string | null) {
      if (status === 'completed') return 'success' as const;
      if (status === 'in_progress') return 'warning' as const;
      if (status === 'cancelled') return 'danger' as const;
      if (status === 'draft') return 'default' as const;
      return 'info' as const;
}

export function formatTimeRange(activity: Activity) {
      if (activity.startTime && activity.endTime) return `${activity.startTime} – ${activity.endTime}`;
      if (activity.startTime) return activity.startTime;
      if (activity.endTime) return `Đến ${activity.endTime}`;
      return 'Chưa ghi giờ';
}
