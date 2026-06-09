'use client';

import { useMemo, useState } from 'react';
import {
      Clock,
      Edit2,
      Plus,
      Save,
      Search,
      Trash2,
      X,
} from 'lucide-react';

import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type DayType = 'weekday' | 'sunday' | 'special';

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

function formatTime(value?: string | null) {
      if (!value) return '--:--';

      return String(value).slice(0, 5);
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
      const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
      const [searchTerm, setSearchTerm] = useState('');
      const [dayTypeFilter, setDayTypeFilter] = useState<'all' | DayType>('all');

      const [templateForm, setTemplateForm] = useState<TemplateForm | null>(null);
      const [itemForm, setItemForm] = useState<ItemForm | null>(null);

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
                                          Lịch sinh hoạt hằng ngày
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                          Quản lý các khung giờ sinh hoạt chung để học viên và người phụ trách
                                          nắm rõ nhịp sinh hoạt trong ngày.
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
                  </div>
            </ResidenceCareLayout>
      );
}
