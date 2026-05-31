'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, DoorOpen, Users, UserCheck, UserX, Clock, X } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { ResidenceCareLayout } from '@/components/ResidenceCareLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
  color: 'blue' | 'green' | 'red' | 'orange';
}

function StatCard({ icon, label, value, description, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 mb-2">{label}</p>
          <p className="stat-card-value">{value}</p>
          <p className="stat-card-description">{description}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function Members() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignRoomDialogOpen, setIsAssignRoomDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [selectedMemberForRoom, setSelectedMemberForRoom] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'male',
    idNumber: '',
    permanentAddress: '',
    phoneNumber: '',
    schoolId: '',
    admissionDate: new Date().toISOString().split('T')[0],
  });
  const [roomAssignmentData, setRoomAssignmentData] = useState({
    roomId: '',
    assignedDate: new Date().toISOString().split('T')[0],
    eventType: 'new_entry' as 'new_entry' | 'transfer' | 'temporary_leave',
    reason: '',
  });

  const membersQuery = trpc.members.list.useQuery({ search: searchTerm, status: statusFilter !== 'all' ? statusFilter : undefined });
  const statsQuery = trpc.members.getStats.useQuery();
  const roomsQuery = trpc.rooms.list.useQuery();
  const createMember = trpc.members.create.useMutation();
  const updateMember = trpc.members.update.useMutation();
  const deleteMember = trpc.members.delete.useMutation();
  const assignRoomMutation = trpc.rooms.assignResident.useMutation();

  // ✅ FIX: Convert string dates to Date objects
  const handleAddMember = async () => {
    try {
      const submitData = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        gender: formData.gender as 'male' | 'female' | 'other',
        idNumber: formData.idNumber || undefined,
        permanentAddress: formData.permanentAddress || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        schoolId: formData.schoolId ? parseInt(formData.schoolId) : undefined,
        admissionDate: formData.admissionDate ? new Date(formData.admissionDate) : new Date(),
      };

      await createMember.mutateAsync(submitData);
      setIsAddDialogOpen(false);
      setFormData({
        fullName: '',
        dateOfBirth: '',
        gender: 'male',
        idNumber: '',
        permanentAddress: '',
        phoneNumber: '',
        schoolId: '',
        admissionDate: new Date().toISOString().split('T')[0],
      });
      setError(null);
      membersQuery.refetch();
      statsQuery.refetch();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi thêm học viên');
    }
  };

  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setFormData({
      fullName: member.fullName || '',
      dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '',
      gender: member.gender || 'male',
      idNumber: member.idNumber || '',
      permanentAddress: member.permanentAddress || '',
      phoneNumber: member.phoneNumber || '',
      schoolId: member.schoolId?.toString() || '',
      admissionDate: member.admissionDate ? new Date(member.admissionDate).toISOString().split('T')[0] : '',
    });
    setError(null);
    setIsEditDialogOpen(true);
  };

  // ✅ FIX: Convert string dates to Date objects for update
  const handleSaveEdit = async () => {
    try {
      const submitData = {
        id: editingMember.id,
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        gender: formData.gender as 'male' | 'female' | 'other',
        idNumber: formData.idNumber || undefined,
        permanentAddress: formData.permanentAddress || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        schoolId: formData.schoolId ? parseInt(formData.schoolId) : undefined,
        admissionDate: formData.admissionDate ? new Date(formData.admissionDate) : new Date(),
      };

      await updateMember.mutateAsync(submitData);
      setIsEditDialogOpen(false);
      setEditingMember(null);
      setFormData({
        fullName: '',
        dateOfBirth: '',
        gender: 'male',
        idNumber: '',
        permanentAddress: '',
        phoneNumber: '',
        schoolId: '',
        admissionDate: new Date().toISOString().split('T')[0],
      });
      setError(null);
      membersQuery.refetch();
      statsQuery.refetch();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật học viên');
    }
  };

  const handleDeleteMember = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa học viên này?')) {
      try {
        await deleteMember.mutateAsync({ id });
        membersQuery.refetch();
        statsQuery.refetch();
      } catch (err: any) {
        setError(err.message || 'Lỗi khi xóa học viên');
      }
    }
  };

  const handleOpenAssignRoomDialog = (member: any) => {
    setSelectedMemberForRoom(member);
    setRoomAssignmentData({
      roomId: '',
      assignedDate: new Date().toISOString().split('T')[0],
      eventType: 'new_entry',
      reason: '',
    });
    setError(null);
    setIsAssignRoomDialogOpen(true);
  };

  const handleAssignRoom = async () => {
    if (!roomAssignmentData.roomId) {
      setError('Vui lòng chọn phòng');
      return;
    }

    try {
      await assignRoomMutation.mutateAsync({
        residentId: selectedMemberForRoom.id,
        roomId: parseInt(roomAssignmentData.roomId),
        assignedDate: new Date(roomAssignmentData.assignedDate),
        eventType: roomAssignmentData.eventType,
        reason: roomAssignmentData.reason || undefined,
      });
      setIsAssignRoomDialogOpen(false);
      setSelectedMemberForRoom(null);
      setError(null);
      membersQuery.refetch();
      roomsQuery.refetch();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gán phòng');
    }
  };

  const rooms = roomsQuery.data || [];
  const stats = statsQuery.data || { total: 0, active: 0, inactive: 0, transferred_out: 0 };
  const members = membersQuery.data || [];

  return (
    <ResidenceCareLayout>
      <div className="px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-display-lg text-neutral-900 mb-2">Quản Lý Học Viên Lưu Trú</h1>
            <p className="text-body-md text-neutral-600">Quản lý thông tin và dữ liệu học viên lưu trú</p>
          </div>
          <button
            onClick={() => {
              setEditingMember(null);
              setFormData({
                fullName: '',
                dateOfBirth: '',
                gender: 'male',
                idNumber: '',
                permanentAddress: '',
                phoneNumber: '',
                schoolId: '',
                admissionDate: new Date().toISOString().split('T')[0],
              });
              setError(null);
              setIsAddDialogOpen(true);
            }}
            className="btn-primary"
          >
            + Thêm Học Viên
          </button>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Tổng Số"
            value={stats.total}
            description="Tổng học viên"
            color="blue"
          />
          <StatCard
            icon={<UserCheck className="w-6 h-6" />}
            label="Đang Ở"
            value={stats.active}
            description="Học viên hiện tại"
            color="green"
          />
          <StatCard
            icon={<UserX className="w-6 h-6" />}
            label="Đã Rời"
            value={stats.transferred_out}
            description="Học viên đã rời"
            color="red"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Tạm Rời"
            value={stats.inactive}
            description="Học viên tạm rời"
            color="orange"
          />
        </div>

        {/* Search and Filter */}
        <div className="card-elevated mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm theo tên hoặc điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-full md:w-48"
            >
              <option value="all">Tất Cả</option>
              <option value="active">Đang Ở</option>
              <option value="inactive">Tạm Rời</option>
              <option value="transferred_out">Đã Rời</option>
            </select>
          </div>
        </div>

        {/* Members Table */}
        <div className="card-elevated">
          <h3 className="text-heading-md text-neutral-900 mb-6">Danh Sách Học Viên</h3>
          {membersQuery.isLoading ? (
            <div className="text-center py-12 text-neutral-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
              <p className="text-lg">Không có học viên nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Tên Học Viên</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Mã Lưu Trú</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Điện Thoại</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Giới Tính</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-700">Trạng Thái</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-neutral-700">Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member: any, index: number) => (
                    <tr key={member.id} className={index % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}>
                      <td className="py-3 px-4 text-sm text-neutral-900">{member.fullName}</td>
                      <td className="py-3 px-4 text-sm text-neutral-600">{member.residentCode}</td>
                      <td className="py-3 px-4 text-sm text-neutral-600">{member.phoneNumber}</td>
                      <td className="py-3 px-4 text-sm text-neutral-600">{member.gender === 'male' ? 'Nam' : 'Nữ'}</td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            member.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : member.status === 'transferred_out'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {member.status === 'active' ? 'Đang Ở' : member.status === 'transferred_out' ? 'Đã Rời' : 'Tạm Rời'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenAssignRoomDialog(member)}
                            className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition"
                            title="Gán phòng"
                          >
                            <DoorOpen className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditMember(member)}
                            className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ✅ FIXED: Add Member Modal - Using CUSTOM FIXED DIV (like Rooms) */}
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-display-md text-neutral-900">Thêm Học Viên Mới</h2>
              <button
                onClick={() => setIsAddDialogOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddMember();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Tên Học Viên *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nhập tên"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Ngày Sinh</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Giới Tính</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="input-field"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="idNumber">Số CCCD</Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    placeholder="Nhập số CCCD"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phoneNumber">Điện Thoại</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <Label htmlFor="permanentAddress">Địa Chỉ</Label>
                <Textarea
                  id="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                  placeholder="Nhập địa chỉ"
                  className="min-h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schoolId">Trường Học (ID)</Label>
                  <Input
                    id="schoolId"
                    type="number"
                    value={formData.schoolId}
                    onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                    placeholder="Nhập ID trường"
                  />
                </div>
                <div>
                  <Label htmlFor="admissionDate">Ngày Ở Lưu Trú *</Label>
                  <Input
                    id="admissionDate"
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddDialogOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={createMember.isPending}
                >
                  {createMember.isPending ? 'Đang thêm...' : 'Thêm Học Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ FIXED: Edit Member Modal */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-display-md text-neutral-900">Chỉnh Sửa Học Viên</h2>
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Tên Học Viên *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Nhập tên"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Ngày Sinh</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Giới Tính</Label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="input-field"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="idNumber">Số CCCD</Label>
                  <Input
                    id="idNumber"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    placeholder="Nhập số CCCD"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phoneNumber">Điện Thoại</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <Label htmlFor="permanentAddress">Địa Chỉ</Label>
                <Textarea
                  id="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
                  placeholder="Nhập địa chỉ"
                  className="min-h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schoolId">Trường Học (ID)</Label>
                  <Input
                    id="schoolId"
                    type="number"
                    value={formData.schoolId}
                    onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                    placeholder="Nhập ID trường"
                  />
                </div>
                <div>
                  <Label htmlFor="admissionDate">Ngày Ở Lưu Trú *</Label>
                  <Input
                    id="admissionDate"
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={updateMember.isPending}
                >
                  {updateMember.isPending ? 'Đang cập nhật...' : 'Cập Nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ FIXED: Assign Room Modal */}
      {isAssignRoomDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-display-md text-neutral-900">Gán Phòng</h2>
              <button
                onClick={() => setIsAssignRoomDialogOpen(false)}
                className="p-2 hover:bg-neutral-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-body-md text-neutral-600 mb-6">
              Gán học viên <strong>{selectedMemberForRoom?.fullName}</strong> vào phòng
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAssignRoom();
              }}
              className="space-y-4"
            >
              <div>
                <Label htmlFor="roomId">Chọn Phòng *</Label>
                <select
                  id="roomId"
                  value={roomAssignmentData.roomId}
                  onChange={(e) => setRoomAssignmentData({ ...roomAssignmentData, roomId: e.target.value })}
                  className="input-field"
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((room: any) => (
                    <option key={room.id} value={String(room.id)}>
                      {room.roomCode} - Sức chứa: {room.capacity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="assignedDate">Ngày Gán *</Label>
                <Input
                  id="assignedDate"
                  type="date"
                  value={roomAssignmentData.assignedDate}
                  onChange={(e) => setRoomAssignmentData({ ...roomAssignmentData, assignedDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="eventType">Loại Sự Kiện *</Label>
                <select
                  id="eventType"
                  value={roomAssignmentData.eventType}
                  onChange={(e) => setRoomAssignmentData({ ...roomAssignmentData, eventType: e.target.value as any })}
                  className="input-field"
                >
                  <option value="new_entry">Nhập Lưu</option>
                  <option value="transfer">Chuyển Phòng</option>
                  <option value="temporary_leave">Tạm Rời</option>
                </select>
              </div>

              <div>
                <Label htmlFor="reason">Lý Do (Optional)</Label>
                <Input
                  id="reason"
                  value={roomAssignmentData.reason}
                  onChange={(e) => setRoomAssignmentData({ ...roomAssignmentData, reason: e.target.value })}
                  placeholder="Nhập lý do"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAssignRoomDialogOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={assignRoomMutation.isPending}
                >
                  {assignRoomMutation.isPending ? 'Đang gán...' : 'Gán Phòng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ResidenceCareLayout>
  );
}