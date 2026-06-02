'use client';

import { useMemo, useState } from 'react';
import {
      AlertCircle,
      BookOpenCheck,
      Building2,
      CheckCircle2,
      Edit2,
      GraduationCap,
      Plus,
      Search,
      Trash2,
      Users,
      X,
} from 'lucide-react';

import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfigurableStatCard } from '@/components/configurable/ConfigurableStatCard';
import {
      ConfigurableColumn,
      ConfigurableDataTable,
} from '@/components/configurable/ConfigurableDataTable';

type ReferenceStatus = 'active' | 'inactive';
type SchoolType = 'university' | 'college' | 'high_school' | 'vocational' | 'other';
type MajorGroup =
      | 'business'
      | 'technology'
      | 'healthcare'
      | 'education'
      | 'engineering'
      | 'social'
      | 'arts'
      | 'other';

type School = {
      id: number;
      code: string;
      name: string;
      schoolType: SchoolType;
      province: string;
      address: string;
      contactPhone: string;
      status: ReferenceStatus;
      note?: string | null;
      studentCount: number;
      sortOrder: number;
};

type Major = {
      id: number;
      code: string;
      name: string;
      majorGroup: MajorGroup;
      schoolId: number | null;
      schoolName: string;
      status: ReferenceStatus;
      note?: string | null;
      studentCount: number;
      sortOrder: number;
};

type SchoolFormData = {
      code: string;
      name: string;
      schoolType: SchoolType;
      province: string;
      address: string;
      contactPhone: string;
      status: ReferenceStatus;
      note: string;
      sortOrder: string;
};

type MajorFormData = {
      code: string;
      name: string;
      majorGroup: MajorGroup;
      schoolId: string;
      status: ReferenceStatus;
      note: string;
      sortOrder: string;
};

type ActiveTab = 'schools' | 'majors';

const initialSchools: School[] = [
      {
            id: 1,
            code: 'HCMUS',
            name: 'Trường Đại học Khoa học Tự nhiên',
            schoolType: 'university',
            province: 'TP. Hồ Chí Minh',
            address: '',
            contactPhone: '',
            status: 'active',
            note: 'Thông tin tham chiếu phục vụ hồ sơ học viên.',
            studentCount: 12,
            sortOrder: 10,
      },
      {
            id: 2,
            code: 'UEL',
            name: 'Trường Đại học Kinh tế - Luật',
            schoolType: 'university',
            province: 'TP. Hồ Chí Minh',
            address: '',
            contactPhone: '',
            status: 'active',
            note: '',
            studentCount: 8,
            sortOrder: 20,
      },
      {
            id: 3,
            code: 'CĐKT',
            name: 'Trường Cao đẳng Kỹ thuật',
            schoolType: 'college',
            province: 'TP. Hồ Chí Minh',
            address: '',
            contactPhone: '',
            status: 'active',
            note: '',
            studentCount: 5,
            sortOrder: 30,
      },
];

const initialMajors: Major[] = [
      {
            id: 1,
            code: 'IT',
            name: 'Công nghệ thông tin',
            majorGroup: 'technology',
            schoolId: 1,
            schoolName: 'Trường Đại học Khoa học Tự nhiên',
            status: 'active',
            note: '',
            studentCount: 10,
            sortOrder: 10,
      },
      {
            id: 2,
            code: 'BA',
            name: 'Quản trị kinh doanh',
            majorGroup: 'business',
            schoolId: 2,
            schoolName: 'Trường Đại học Kinh tế - Luật',
            status: 'active',
            note: '',
            studentCount: 6,
            sortOrder: 20,
      },
      {
            id: 3,
            code: 'NURSING',
            name: 'Điều dưỡng',
            majorGroup: 'healthcare',
            schoolId: null,
            schoolName: 'Nhiều trường',
            status: 'active',
            note: 'Ngành tham chiếu dùng chung khi chưa cần gắn cố định với một trường.',
            studentCount: 4,
            sortOrder: 30,
      },
];

const defaultSchoolFormData: SchoolFormData = {
      code: '',
      name: '',
      schoolType: 'university',
      province: '',
      address: '',
      contactPhone: '',
      status: 'active',
      note: '',
      sortOrder: '10',
};

const defaultMajorFormData: MajorFormData = {
      code: '',
      name: '',
      majorGroup: 'other',
      schoolId: '',
      status: 'active',
      note: '',
      sortOrder: '10',
};

function normalizeCode(value: string) {
      return value
            .trim()
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
}

function normalizeText(value?: string | null) {
      return (value || '')
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, ' ');
}

function getSchoolTypeLabel(type: SchoolType) {
      if (type === 'university') return 'Đại học';
      if (type === 'college') return 'Cao đẳng';
      if (type === 'high_school') return 'THPT';
      if (type === 'vocational') return 'Trung cấp / Nghề';
      return 'Khác';
}

function getSchoolTypeClass(type: SchoolType) {
      if (type === 'university') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (type === 'college') return 'border-violet-200 bg-violet-50 text-violet-700';
      if (type === 'high_school') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      if (type === 'vocational') return 'border-orange-200 bg-orange-50 text-orange-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getMajorGroupLabel(group: MajorGroup) {
      if (group === 'business') return 'Kinh tế / Quản trị';
      if (group === 'technology') return 'Công nghệ';
      if (group === 'healthcare') return 'Y tế / Sức khỏe';
      if (group === 'education') return 'Giáo dục';
      if (group === 'engineering') return 'Kỹ thuật';
      if (group === 'social') return 'Xã hội / Nhân văn';
      if (group === 'arts') return 'Nghệ thuật';
      return 'Khác';
}

function getMajorGroupClass(group: MajorGroup) {
      if (group === 'business') return 'border-violet-200 bg-violet-50 text-violet-700';
      if (group === 'technology') return 'border-blue-200 bg-blue-50 text-blue-700';
      if (group === 'healthcare') return 'border-red-200 bg-red-50 text-red-700';
      if (group === 'education') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      if (group === 'engineering') return 'border-orange-200 bg-orange-50 text-orange-700';
      if (group === 'social') return 'border-sky-200 bg-sky-50 text-sky-700';
      if (group === 'arts') return 'border-pink-200 bg-pink-50 text-pink-700';
      return 'border-neutral-200 bg-neutral-50 text-neutral-700';
}

function getStatusLabel(status: ReferenceStatus) {
      if (status === 'active') return 'Đang sử dụng';
      return 'Ngưng sử dụng';
}

function getStatusClass(status: ReferenceStatus) {
      if (status === 'active') return 'border-green-200 bg-green-50 text-green-700';
      return 'border-neutral-200 bg-neutral-100 text-neutral-600';
}

function getNextId<T extends { id: number }>(items: T[]) {
      return Math.max(...items.map((item) => item.id), 0) + 1;
}

function getNextSortOrder<T extends { sortOrder: number }>(items: T[]) {
      return String(Math.max(...items.map((item) => Number(item.sortOrder || 0)), 0) + 10);
}

function validateSchoolForm({
      schools,
      formData,
      editingId,
}: {
      schools: School[];
      formData: SchoolFormData;
      editingId?: number;
}) {
      const code = normalizeCode(formData.code);

      if (!code) return 'Vui lòng nhập mã trường.';
      if (!formData.name.trim()) return 'Vui lòng nhập tên trường.';

      const sortOrder = Number(formData.sortOrder || 0);

      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.';
      }

      const duplicatedCode = schools
            .filter((school) => school.id !== editingId)
            .some((school) => normalizeText(school.code) === normalizeText(code));

      if (duplicatedCode) {
            return 'Mã trường đã tồn tại. Vui lòng nhập mã khác.';
      }

      return null;
}

function validateMajorForm({
      majors,
      formData,
      editingId,
}: {
      majors: Major[];
      formData: MajorFormData;
      editingId?: number;
}) {
      const code = normalizeCode(formData.code);

      if (!code) return 'Vui lòng nhập mã ngành.';
      if (!formData.name.trim()) return 'Vui lòng nhập tên ngành.';

      const sortOrder = Number(formData.sortOrder || 0);

      if (!Number.isFinite(sortOrder) || sortOrder < 0) {
            return 'Thứ tự hiển thị phải là số lớn hơn hoặc bằng 0.';
      }

      const duplicatedCode = majors
            .filter((major) => major.id !== editingId)
            .some((major) => normalizeText(major.code) === normalizeText(code));

      if (duplicatedCode) {
            return 'Mã ngành đã tồn tại. Vui lòng nhập mã khác.';
      }

      return null;
}

export default function EducationReferences() {
      const [activeTab, setActiveTab] = useState<ActiveTab>('schools');
      const [schools, setSchools] = useState<School[]>(initialSchools);
      const [majors, setMajors] = useState<Major[]>(initialMajors);
      const [searchTerm, setSearchTerm] = useState('');
      const [statusFilter, setStatusFilter] = useState<'all' | ReferenceStatus>('all');
      const [schoolTypeFilter, setSchoolTypeFilter] = useState<'all' | SchoolType>('all');
      const [majorGroupFilter, setMajorGroupFilter] = useState<'all' | MajorGroup>('all');

      const [isSchoolFormOpen, setIsSchoolFormOpen] = useState(false);
      const [editingSchool, setEditingSchool] = useState<School | null>(null);
      const [schoolFormData, setSchoolFormData] = useState<SchoolFormData>(defaultSchoolFormData);

      const [isMajorFormOpen, setIsMajorFormOpen] = useState(false);
      const [editingMajor, setEditingMajor] = useState<Major | null>(null);
      const [majorFormData, setMajorFormData] = useState<MajorFormData>(defaultMajorFormData);

      const [error, setError] = useState<string | null>(null);

      const filteredSchools = useMemo(() => {
            const keyword = normalizeText(searchTerm);

            return schools
                  .filter((school) => {
                        if (statusFilter !== 'all' && school.status !== statusFilter) return false;
                        if (schoolTypeFilter !== 'all' && school.schoolType !== schoolTypeFilter) return false;
                        if (!keyword) return true;

                        const haystack = [
                              school.code,
                              school.name,
                              getSchoolTypeLabel(school.schoolType),
                              school.province,
                              school.address,
                              school.contactPhone,
                              school.note,
                        ]
                              .map((value) => normalizeText(value))
                              .join(' ');

                        return haystack.includes(keyword);
                  })
                  .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
      }, [schools, searchTerm, statusFilter, schoolTypeFilter]);

      const filteredMajors = useMemo(() => {
            const keyword = normalizeText(searchTerm);

            return majors
                  .filter((major) => {
                        if (statusFilter !== 'all' && major.status !== statusFilter) return false;
                        if (majorGroupFilter !== 'all' && major.majorGroup !== majorGroupFilter) return false;
                        if (!keyword) return true;

                        const haystack = [
                              major.code,
                              major.name,
                              getMajorGroupLabel(major.majorGroup),
                              major.schoolName,
                              major.note,
                        ]
                              .map((value) => normalizeText(value))
                              .join(' ');

                        return haystack.includes(keyword);
                  })
                  .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
      }, [majors, searchTerm, statusFilter, majorGroupFilter]);

      const stats = useMemo(() => {
            return {
                  schools: schools.length,
                  activeSchools: schools.filter((school) => school.status === 'active').length,
                  majors: majors.length,
                  students: schools.reduce((sum, school) => sum + (school.studentCount || 0), 0),
            };
      }, [schools, majors]);

      const clearFilters = () => {
            setSearchTerm('');
            setStatusFilter('all');
            setSchoolTypeFilter('all');
            setMajorGroupFilter('all');
      };

      const openCreateSchoolForm = () => {
            setEditingSchool(null);
            setSchoolFormData({
                  ...defaultSchoolFormData,
                  sortOrder: getNextSortOrder(schools),
            });
            setError(null);
            setIsSchoolFormOpen(true);
      };

      const openEditSchoolForm = (school: School) => {
            setEditingSchool(school);
            setSchoolFormData({
                  code: school.code,
                  name: school.name,
                  schoolType: school.schoolType,
                  province: school.province,
                  address: school.address,
                  contactPhone: school.contactPhone,
                  status: school.status,
                  note: school.note || '',
                  sortOrder: String(school.sortOrder || 0),
            });
            setError(null);
            setIsSchoolFormOpen(true);
      };

      const closeSchoolForm = () => {
            setIsSchoolFormOpen(false);
            setEditingSchool(null);
            setSchoolFormData(defaultSchoolFormData);
            setError(null);
      };

      const saveSchool = () => {
            const validationMessage = validateSchoolForm({
                  schools,
                  formData: schoolFormData,
                  editingId: editingSchool?.id,
            });

            if (validationMessage) {
                  setError(validationMessage);
                  return;
            }

            const payload: School = {
                  id: editingSchool?.id || getNextId(schools),
                  code: normalizeCode(schoolFormData.code),
                  name: schoolFormData.name.trim(),
                  schoolType: schoolFormData.schoolType,
                  province: schoolFormData.province.trim(),
                  address: schoolFormData.address.trim(),
                  contactPhone: schoolFormData.contactPhone.trim(),
                  status: schoolFormData.status,
                  note: schoolFormData.note.trim() || null,
                  studentCount: editingSchool?.studentCount || 0,
                  sortOrder: Number(schoolFormData.sortOrder || 0),
            };

            if (editingSchool) {
                  setSchools((current) =>
                        current.map((school) => (school.id === editingSchool.id ? payload : school))
                  );

                  setMajors((current) =>
                        current.map((major) =>
                              major.schoolId === editingSchool.id
                                    ? {
                                            ...major,
                                            schoolName: payload.name,
                                      }
                                    : major
                        )
                  );
            } else {
                  setSchools((current) => [...current, payload]);
            }

            closeSchoolForm();
      };

      const deleteSchool = (school: School) => {
            const isUsedByMajor = majors.some((major) => major.schoolId === school.id);

            if (isUsedByMajor) {
                  setError('Không thể xóa trường đang được gắn với ngành học. Vui lòng chuyển ngành sang trường khác trước.');
                  return;
            }

            if (!confirm(`Bạn có chắc chắn muốn xóa trường "${school.name}"?`)) return;

            setSchools((current) => current.filter((item) => item.id !== school.id));
      };

      const openCreateMajorForm = () => {
            setEditingMajor(null);
            setMajorFormData({
                  ...defaultMajorFormData,
                  sortOrder: getNextSortOrder(majors),
            });
            setError(null);
            setIsMajorFormOpen(true);
      };

      const openEditMajorForm = (major: Major) => {
            setEditingMajor(major);
            setMajorFormData({
                  code: major.code,
                  name: major.name,
                  majorGroup: major.majorGroup,
                  schoolId: major.schoolId ? String(major.schoolId) : '',
                  status: major.status,
                  note: major.note || '',
                  sortOrder: String(major.sortOrder || 0),
            });
            setError(null);
            setIsMajorFormOpen(true);
      };

      const closeMajorForm = () => {
            setIsMajorFormOpen(false);
            setEditingMajor(null);
            setMajorFormData(defaultMajorFormData);
            setError(null);
      };

      const saveMajor = () => {
            const validationMessage = validateMajorForm({
                  majors,
                  formData: majorFormData,
                  editingId: editingMajor?.id,
            });

            if (validationMessage) {
                  setError(validationMessage);
                  return;
            }

            const selectedSchool = majorFormData.schoolId
                  ? schools.find((school) => school.id === Number(majorFormData.schoolId))
                  : null;

            const payload: Major = {
                  id: editingMajor?.id || getNextId(majors),
                  code: normalizeCode(majorFormData.code),
                  name: majorFormData.name.trim(),
                  majorGroup: majorFormData.majorGroup,
                  schoolId: selectedSchool?.id || null,
                  schoolName: selectedSchool?.name || 'Dùng chung',
                  status: majorFormData.status,
                  note: majorFormData.note.trim() || null,
                  studentCount: editingMajor?.studentCount || 0,
                  sortOrder: Number(majorFormData.sortOrder || 0),
            };

            if (editingMajor) {
                  setMajors((current) =>
                        current.map((major) => (major.id === editingMajor.id ? payload : major))
                  );
            } else {
                  setMajors((current) => [...current, payload]);
            }

            closeMajorForm();
      };

      const deleteMajor = (major: Major) => {
            if (major.studentCount > 0) {
                  setError('Không thể xóa ngành học đang có học viên sử dụng. Có thể chuyển sang trạng thái ngưng sử dụng.');
                  return;
            }

            if (!confirm(`Bạn có chắc chắn muốn xóa ngành "${major.name}"?`)) return;

            setMajors((current) => current.filter((item) => item.id !== major.id));
      };

      const schoolColumns = useMemo<ConfigurableColumn<School>[]>(
            () => [
                  {
                        key: 'school',
                        label: 'Trường học',
                        sortable: true,
                        sortValue: (school) => school.name,
                        render: (school) => (
                              <div>
                                    <p className="font-semibold text-slate-900">{school.name}</p>
                                    <p className="mt-1 font-mono text-xs text-slate-500">{school.code}</p>
                              </div>
                        ),
                  },
                  {
                        key: 'type',
                        label: 'Loại trường',
                        sortable: true,
                        sortValue: (school) => getSchoolTypeLabel(school.schoolType),
                        render: (school) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getSchoolTypeClass(
                                          school.schoolType
                                    )}`}
                              >
                                    {getSchoolTypeLabel(school.schoolType)}
                              </span>
                        ),
                  },
                  {
                        key: 'province',
                        label: 'Tỉnh/Thành',
                        sortable: true,
                        sortValue: (school) => school.province,
                        render: (school) => school.province || '-',
                  },
                  {
                        key: 'studentCount',
                        label: 'Học viên',
                        sortable: true,
                        sortValue: (school) => school.studentCount,
                        render: (school) => `${school.studentCount || 0} người`,
                  },
                  {
                        key: 'status',
                        label: 'Trạng thái',
                        sortable: true,
                        sortValue: (school) => getStatusLabel(school.status),
                        render: (school) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                          school.status
                                    )}`}
                              >
                                    {getStatusLabel(school.status)}
                              </span>
                        ),
                  },
                  {
                        key: 'note',
                        label: 'Ghi chú',
                        defaultVisible: false,
                        sortable: true,
                        sortValue: (school) => school.note || '',
                        render: (school) => school.note || '-',
                  },
                  {
                        key: 'actions',
                        label: 'Hành động',
                        className: 'min-w-[140px]',
                        render: (school) => (
                              <div className="flex items-center gap-1.5">
                                    <button
                                          type="button"
                                          onClick={() => openEditSchoolForm(school)}
                                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                          title="Sửa trường học"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => deleteSchool(school)}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                          title="Xóa trường học"
                                    >
                                          <Trash2 className="h-4 w-4" />
                                    </button>
                              </div>
                        ),
                  },
            ],
            [majors, schools]
      );

      const majorColumns = useMemo<ConfigurableColumn<Major>[]>(
            () => [
                  {
                        key: 'major',
                        label: 'Ngành học',
                        sortable: true,
                        sortValue: (major) => major.name,
                        render: (major) => (
                              <div>
                                    <p className="font-semibold text-slate-900">{major.name}</p>
                                    <p className="mt-1 font-mono text-xs text-slate-500">{major.code}</p>
                              </div>
                        ),
                  },
                  {
                        key: 'group',
                        label: 'Nhóm ngành',
                        sortable: true,
                        sortValue: (major) => getMajorGroupLabel(major.majorGroup),
                        render: (major) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getMajorGroupClass(
                                          major.majorGroup
                                    )}`}
                              >
                                    {getMajorGroupLabel(major.majorGroup)}
                              </span>
                        ),
                  },
                  {
                        key: 'schoolName',
                        label: 'Trường tham chiếu',
                        sortable: true,
                        sortValue: (major) => major.schoolName,
                        render: (major) => major.schoolName || 'Dùng chung',
                  },
                  {
                        key: 'studentCount',
                        label: 'Học viên',
                        sortable: true,
                        sortValue: (major) => major.studentCount,
                        render: (major) => `${major.studentCount || 0} người`,
                  },
                  {
                        key: 'status',
                        label: 'Trạng thái',
                        sortable: true,
                        sortValue: (major) => getStatusLabel(major.status),
                        render: (major) => (
                              <span
                                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                                          major.status
                                    )}`}
                              >
                                    {getStatusLabel(major.status)}
                              </span>
                        ),
                  },
                  {
                        key: 'note',
                        label: 'Ghi chú',
                        defaultVisible: false,
                        sortable: true,
                        sortValue: (major) => major.note || '',
                        render: (major) => major.note || '-',
                  },
                  {
                        key: 'actions',
                        label: 'Hành động',
                        className: 'min-w-[140px]',
                        render: (major) => (
                              <div className="flex items-center gap-1.5">
                                    <button
                                          type="button"
                                          onClick={() => openEditMajorForm(major)}
                                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                          title="Sửa ngành học"
                                    >
                                          <Edit2 className="h-4 w-4" />
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => deleteMajor(major)}
                                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                                          title="Xóa ngành học"
                                    >
                                          <Trash2 className="h-4 w-4" />
                                    </button>
                              </div>
                        ),
                  },
            ],
            [majors, schools]
      );

      return (
            <ResidenceCareLayout>
                  <div className="space-y-6 p-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                              <div>
                                    <p className="text-sm font-semibold text-blue-600">
                                          Học vụ & Phát triển
                                    </p>
                                    <h1 className="mt-1 text-3xl font-bold text-neutral-900">
                                          Trường học / Ngành học
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-neutral-500">
                                          Quản lý thông tin tham chiếu về trường học và ngành học, phục vụ hồ sơ học viên, điểm danh, chia công tác và cập nhật kết quả học tập.
                                    </p>
                              </div>

                              <button
                                    type="button"
                                    onClick={activeTab === 'schools' ? openCreateSchoolForm : openCreateMajorForm}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                              >
                                    <Plus className="h-4 w-4" />
                                    {activeTab === 'schools' ? 'Thêm trường học' : 'Thêm ngành học'}
                              </button>
                        </div>

                        {error && (
                              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                                    <div className="flex gap-3">
                                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                                          <div>
                                                <p className="font-semibold">Có lỗi khi xử lý dữ liệu học vụ.</p>
                                                <p className="mt-1 text-sm">{error}</p>
                                          </div>
                                    </div>
                              </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                              <ConfigurableStatCard
                                    moduleKey="educationReferences"
                                    cardKey="educationReferences.schools"
                                    label="Trường học"
                                    value={stats.schools}
                                    description="Tổng số trường tham chiếu"
                                    tone="blue"
                                    icon={<Building2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="educationReferences"
                                    cardKey="educationReferences.activeSchools"
                                    label="Đang sử dụng"
                                    value={stats.activeSchools}
                                    description="Trường còn sử dụng trong hồ sơ"
                                    tone="green"
                                    icon={<CheckCircle2 className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="educationReferences"
                                    cardKey="educationReferences.majors"
                                    label="Ngành học"
                                    value={stats.majors}
                                    description="Tổng số ngành tham chiếu"
                                    tone="orange"
                                    icon={<GraduationCap className="h-6 w-6" />}
                              />

                              <ConfigurableStatCard
                                    moduleKey="educationReferences"
                                    cardKey="educationReferences.students"
                                    label="Học viên"
                                    value={stats.students}
                                    description="Số học viên đang có thông tin học vụ"
                                    tone="purple"
                                    icon={<Users className="h-6 w-6" />}
                              />
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                    <button
                                          type="button"
                                          onClick={() => {
                                                setActiveTab('schools');
                                                clearFilters();
                                          }}
                                          className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                                activeTab === 'schools'
                                                      ? 'bg-blue-600 text-white shadow-sm'
                                                      : 'text-slate-600 hover:bg-slate-50'
                                          }`}
                                    >
                                          Trường học
                                    </button>

                                    <button
                                          type="button"
                                          onClick={() => {
                                                setActiveTab('majors');
                                                clearFilters();
                                          }}
                                          className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                                activeTab === 'majors'
                                                      ? 'bg-blue-600 text-white shadow-sm'
                                                      : 'text-slate-600 hover:bg-slate-50'
                                          }`}
                                    >
                                          Ngành học
                                    </button>
                              </div>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                              <div className="grid grid-cols-1 gap-4 2xl:grid-cols-[1fr_220px_220px_auto]">
                                    <div className="relative">
                                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                          <Input
                                                value={searchTerm}
                                                onChange={(event) => setSearchTerm(event.target.value)}
                                                placeholder={
                                                      activeTab === 'schools'
                                                            ? 'Tìm trường, mã trường, tỉnh/thành...'
                                                            : 'Tìm ngành, mã ngành, nhóm ngành, trường...'
                                                }
                                                className="pl-10"
                                          />
                                    </div>

                                    {activeTab === 'schools' ? (
                                          <select
                                                value={schoolTypeFilter}
                                                onChange={(event) =>
                                                      setSchoolTypeFilter(event.target.value as 'all' | SchoolType)
                                                }
                                                className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="all">Tất cả loại trường</option>
                                                <option value="university">Đại học</option>
                                                <option value="college">Cao đẳng</option>
                                                <option value="high_school">THPT</option>
                                                <option value="vocational">Trung cấp / Nghề</option>
                                                <option value="other">Khác</option>
                                          </select>
                                    ) : (
                                          <select
                                                value={majorGroupFilter}
                                                onChange={(event) =>
                                                      setMajorGroupFilter(event.target.value as 'all' | MajorGroup)
                                                }
                                                className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="all">Tất cả nhóm ngành</option>
                                                <option value="business">Kinh tế / Quản trị</option>
                                                <option value="technology">Công nghệ</option>
                                                <option value="healthcare">Y tế / Sức khỏe</option>
                                                <option value="education">Giáo dục</option>
                                                <option value="engineering">Kỹ thuật</option>
                                                <option value="social">Xã hội / Nhân văn</option>
                                                <option value="arts">Nghệ thuật</option>
                                                <option value="other">Khác</option>
                                          </select>
                                    )}

                                    <select
                                          value={statusFilter}
                                          onChange={(event) =>
                                                setStatusFilter(event.target.value as 'all' | ReferenceStatus)
                                          }
                                          className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >
                                          <option value="all">Tất cả trạng thái</option>
                                          <option value="active">Đang sử dụng</option>
                                          <option value="inactive">Ngưng sử dụng</option>
                                    </select>

                                    <button
                                          type="button"
                                          onClick={clearFilters}
                                          className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
                                    >
                                          Xóa lọc
                                    </button>
                              </div>
                        </div>

                        <EducationReferenceNote />

                        {activeTab === 'schools' ? (
                              <ConfigurableDataTable
                                    moduleKey="educationReferences"
                                    tableKey="educationReferences.schools"
                                    columns={schoolColumns}
                                    data={filteredSchools}
                                    getRowKey={(school) => school.id}
                                    emptyTitle="Chưa có trường học"
                                    emptyDescription="Thêm trường học để dùng làm thông tin tham chiếu trong hồ sơ học viên."
                              />
                        ) : (
                              <ConfigurableDataTable
                                    moduleKey="educationReferences"
                                    tableKey="educationReferences.majors"
                                    columns={majorColumns}
                                    data={filteredMajors}
                                    getRowKey={(major) => major.id}
                                    emptyTitle="Chưa có ngành học"
                                    emptyDescription="Thêm ngành học để dùng làm thông tin tham chiếu trong hồ sơ học viên."
                              />
                        )}

                        {isSchoolFormOpen && (
                              <SchoolFormModal
                                    title={editingSchool ? 'Cập nhật trường học' : 'Thêm trường học'}
                                    formData={schoolFormData}
                                    setFormData={setSchoolFormData}
                                    error={error}
                                    onClose={closeSchoolForm}
                                    onSubmit={saveSchool}
                                    submitText={editingSchool ? 'Cập nhật' : 'Thêm trường'}
                              />
                        )}

                        {isMajorFormOpen && (
                              <MajorFormModal
                                    title={editingMajor ? 'Cập nhật ngành học' : 'Thêm ngành học'}
                                    formData={majorFormData}
                                    setFormData={setMajorFormData}
                                    schools={schools}
                                    error={error}
                                    onClose={closeMajorForm}
                                    onSubmit={saveMajor}
                                    submitText={editingMajor ? 'Cập nhật' : 'Thêm ngành'}
                              />
                        )}
                  </div>
            </ResidenceCareLayout>
      );
}

function EducationReferenceNote() {
      return (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex gap-3">
                        <BookOpenCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-700" />
                        <div>
                              <p className="font-semibold text-blue-900">Phạm vi quản lý học vụ</p>
                              <p className="mt-1 text-sm leading-6 text-blue-800">
                                    Trường học và ngành học được quản lý như dữ liệu tham chiếu. Thông tin này dùng để gắn vào hồ sơ học viên, hỗ trợ điểm danh theo lịch học, chia công tác phù hợp và cập nhật kết quả học tập. Các nghiệp vụ học thuật chuyên sâu ngoài lưu xá không cần triển khai chi tiết ở giai đoạn này.
                              </p>
                        </div>
                  </div>
            </div>
      );
}

function SchoolFormModal({
      title,
      formData,
      setFormData,
      error,
      onClose,
      onSubmit,
      submitText,
}: {
      title: string;
      formData: SchoolFormData;
      setFormData: React.Dispatch<React.SetStateAction<SchoolFormData>>;
      error: string | null;
      onClose: () => void;
      onSubmit: () => void;
      submitText: string;
}) {
      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                              <div>
                                    <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
                                    <p className="text-sm text-neutral-500">
                                          Khai báo thông tin trường học làm dữ liệu tham chiếu cho hồ sơ học viên.
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

                        <form
                              onSubmit={(event) => {
                                    event.preventDefault();
                                    onSubmit();
                              }}
                              className="space-y-5 p-6"
                        >
                              {error && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                          {error}
                                    </div>
                              )}

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                          <Label htmlFor="schoolCode">Mã trường</Label>
                                          <Input
                                                id="schoolCode"
                                                value={formData.code}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            code: normalizeCode(event.target.value),
                                                      })
                                                }
                                                placeholder="VD: HCMUS"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="schoolName">Tên trường</Label>
                                          <Input
                                                id="schoolName"
                                                value={formData.name}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            name: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Trường Đại học..."
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="schoolType">Loại trường</Label>
                                          <select
                                                id="schoolType"
                                                value={formData.schoolType}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            schoolType: event.target.value as SchoolType,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="university">Đại học</option>
                                                <option value="college">Cao đẳng</option>
                                                <option value="high_school">THPT</option>
                                                <option value="vocational">Trung cấp / Nghề</option>
                                                <option value="other">Khác</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="province">Tỉnh/Thành</Label>
                                          <Input
                                                id="province"
                                                value={formData.province}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            province: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: TP. Hồ Chí Minh"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="contactPhone">Số điện thoại liên hệ</Label>
                                          <Input
                                                id="contactPhone"
                                                value={formData.contactPhone}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            contactPhone: event.target.value,
                                                      })
                                                }
                                                placeholder="Thông tin tham chiếu nếu cần"
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="schoolStatus">Trạng thái</Label>
                                          <select
                                                id="schoolStatus"
                                                value={formData.status}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            status: event.target.value as ReferenceStatus,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="active">Đang sử dụng</option>
                                                <option value="inactive">Ngưng sử dụng</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="schoolSortOrder">Thứ tự hiển thị</Label>
                                          <Input
                                                id="schoolSortOrder"
                                                type="number"
                                                min={0}
                                                value={formData.sortOrder}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            sortOrder: event.target.value,
                                                      })
                                                }
                                          />
                                    </div>

                                    <div className="md:col-span-2">
                                          <Label htmlFor="address">Địa chỉ</Label>
                                          <Input
                                                id="address"
                                                value={formData.address}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            address: event.target.value,
                                                      })
                                                }
                                                placeholder="Địa chỉ trường nếu cần lưu"
                                          />
                                    </div>
                              </div>

                              <div>
                                    <Label htmlFor="schoolNote">Ghi chú</Label>
                                    <Textarea
                                          id="schoolNote"
                                          value={formData.note}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      note: event.target.value,
                                                })
                                          }
                                          placeholder="Ghi chú thêm nếu có"
                                          className="min-h-24"
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
                                          type="submit"
                                          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                          {submitText}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}

function MajorFormModal({
      title,
      formData,
      setFormData,
      schools,
      error,
      onClose,
      onSubmit,
      submitText,
}: {
      title: string;
      formData: MajorFormData;
      setFormData: React.Dispatch<React.SetStateAction<MajorFormData>>;
      schools: School[];
      error: string | null;
      onClose: () => void;
      onSubmit: () => void;
      submitText: string;
}) {
      return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                  <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
                              <div>
                                    <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
                                    <p className="text-sm text-neutral-500">
                                          Khai báo ngành học làm dữ liệu tham chiếu cho hồ sơ học viên.
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

                        <form
                              onSubmit={(event) => {
                                    event.preventDefault();
                                    onSubmit();
                              }}
                              className="space-y-5 p-6"
                        >
                              {error && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                          {error}
                                    </div>
                              )}

                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                          <Label htmlFor="majorCode">Mã ngành</Label>
                                          <Input
                                                id="majorCode"
                                                value={formData.code}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            code: normalizeCode(event.target.value),
                                                      })
                                                }
                                                placeholder="VD: IT"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="majorName">Tên ngành</Label>
                                          <Input
                                                id="majorName"
                                                value={formData.name}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            name: event.target.value,
                                                      })
                                                }
                                                placeholder="VD: Công nghệ thông tin"
                                                required
                                          />
                                    </div>

                                    <div>
                                          <Label htmlFor="majorGroup">Nhóm ngành</Label>
                                          <select
                                                id="majorGroup"
                                                value={formData.majorGroup}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            majorGroup: event.target.value as MajorGroup,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="business">Kinh tế / Quản trị</option>
                                                <option value="technology">Công nghệ</option>
                                                <option value="healthcare">Y tế / Sức khỏe</option>
                                                <option value="education">Giáo dục</option>
                                                <option value="engineering">Kỹ thuật</option>
                                                <option value="social">Xã hội / Nhân văn</option>
                                                <option value="arts">Nghệ thuật</option>
                                                <option value="other">Khác</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="schoolId">Trường tham chiếu</Label>
                                          <select
                                                id="schoolId"
                                                value={formData.schoolId}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            schoolId: event.target.value,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="">Dùng chung / Chưa gắn trường</option>
                                                {schools
                                                      .filter((school) => school.status === 'active')
                                                      .map((school) => (
                                                            <option key={school.id} value={String(school.id)}>
                                                                  {school.name}
                                                            </option>
                                                      ))}
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="majorStatus">Trạng thái</Label>
                                          <select
                                                id="majorStatus"
                                                value={formData.status}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            status: event.target.value as ReferenceStatus,
                                                      })
                                                }
                                                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                          >
                                                <option value="active">Đang sử dụng</option>
                                                <option value="inactive">Ngưng sử dụng</option>
                                          </select>
                                    </div>

                                    <div>
                                          <Label htmlFor="majorSortOrder">Thứ tự hiển thị</Label>
                                          <Input
                                                id="majorSortOrder"
                                                type="number"
                                                min={0}
                                                value={formData.sortOrder}
                                                onChange={(event) =>
                                                      setFormData({
                                                            ...formData,
                                                            sortOrder: event.target.value,
                                                      })
                                                }
                                          />
                                    </div>
                              </div>

                              <div>
                                    <Label htmlFor="majorNote">Ghi chú</Label>
                                    <Textarea
                                          id="majorNote"
                                          value={formData.note}
                                          onChange={(event) =>
                                                setFormData({
                                                      ...formData,
                                                      note: event.target.value,
                                                })
                                          }
                                          placeholder="Ghi chú thêm nếu có"
                                          className="min-h-24"
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
                                          type="submit"
                                          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                    >
                                          {submitText}
                                    </button>
                              </div>
                        </form>
                  </div>
            </div>
      );
}
