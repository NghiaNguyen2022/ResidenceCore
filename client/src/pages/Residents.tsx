import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit2, Trash2, User, Search, AlertCircle } from "lucide-react";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const residentSchema = z.object({
  fullName: z.string().min(1, "Tên không được trống"),
  dateOfBirth: z.date().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  idNumber: z.string().optional(),
  permanentAddress: z.string().optional(),
  phoneNumber: z.string().optional(),
  notes: z.string().optional(),
});

type ResidentFormData = z.infer<typeof residentSchema>;

export default function Residents() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: residents, isLoading, refetch } = trpc.residents.list.useQuery({ limit: 100 });
  const createMutation = trpc.residents.create.useMutation();
  const updateMutation = trpc.residents.update.useMutation();
  const deactivateMutation = trpc.residents.deactivate.useMutation();

  const form = useForm<ResidentFormData>({
    resolver: zodResolver(residentSchema),
  });

  const onSubmit = async (data: ResidentFormData) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data });
        toast.success("Cập nhật cư dân thành công");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Thêm cư dân thành công");
      }
      form.reset();
      setOpen(false);
      setEditingId(null);
      refetch();
    } catch (error) {
      toast.error("Có lỗi xảy ra");
    }
  };

  const handleDeactivate = async (id: number) => {
    if (confirm("Bạn chắc chắn muốn vô hiệu hóa cư dân này?")) {
      try {
        await deactivateMutation.mutateAsync(id);
        toast.success("Vô hiệu hóa cư dân thành công");
        refetch();
      } catch (error) {
        toast.error("Có lỗi xảy ra");
      }
    }
  };

  const handleEdit = (resident: any) => {
    const formData = {
      fullName: resident.fullName,
      dateOfBirth: resident.dateOfBirth || undefined,
      gender: resident.gender || undefined,
      idNumber: resident.idNumber || undefined,
      permanentAddress: resident.permanentAddress || undefined,
      phoneNumber: resident.phoneNumber || undefined,
      notes: resident.notes || undefined,
    };
    setEditingId(resident.id);
    form.reset(formData);
    setOpen(true);
  };

  // Filter residents based on search term
  const filteredResidents = residents?.filter((resident) =>
    resident.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.idNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const activeCount = residents?.filter((r) => r.status === "active").length || 0;
  const inactiveCount = residents?.filter((r) => r.status === "inactive").length || 0;

  return (
    <ResidenceCareLayout>
      <div className="p-6 md:p-8 space-y-8 bg-background">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-display-lg">Quản lý cư dân</h1>
            <p className="text-body-md text-muted-foreground">Danh sách và quản lý thông tin cư dân nội trú</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-fit">
                <Plus className="w-4 h-4" />
                Thêm cư dân
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? "Cập nhật cư dân" : "Thêm cư dân mới"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ tên</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập họ tên" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập số điện thoại" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="idNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số CMND/CCCD</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập số CMND/CCCD" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="permanentAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Địa chỉ thường trú</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập địa chỉ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                    {createMutation.isPending || updateMutation.isPending ? "Đang xử lý..." : editingId ? "Cập nhật" : "Thêm mới"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-elevated p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-md text-muted-foreground">Tổng cư dân</p>
                <p className="text-heading-lg font-bold mt-2">{residents?.length || 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="card-elevated p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-md text-muted-foreground">Đang hoạt động</p>
                <p className="text-heading-lg font-bold mt-2 text-green-600">{activeCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                <User className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="card-elevated p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-md text-muted-foreground">Vô hiệu hóa</p>
                <p className="text-heading-lg font-bold mt-2 text-red-600">{inactiveCount}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
                <User className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Table */}
        <Card className="card-elevated overflow-hidden">
          {/* Search Bar */}
          <div className="p-6 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, số điện thoại hoặc CMND..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table Content */}
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-muted border-t-accent rounded-full" />
              <p className="text-muted-foreground mt-4">Đang tải dữ liệu...</p>
            </div>
          ) : filteredResidents.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="font-semibold">Họ tên</TableHead>
                    <TableHead className="font-semibold">Số điện thoại</TableHead>
                    <TableHead className="font-semibold">CMND/CCCD</TableHead>
                    <TableHead className="font-semibold">Phòng ở</TableHead>
                    <TableHead className="font-semibold">Trạng thái</TableHead>
                    <TableHead className="font-semibold text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResidents.map((resident) => (
                    <TableRow key={resident.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{resident.fullName}</TableCell>
                      <TableCell>{resident.phoneNumber || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{resident.idNumber || "-"}</TableCell>
                      <TableCell>{resident.currentRoomId ? `Phòng ${resident.currentRoomId}` : "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            resident.status === "active"
                              ? "badge-success"
                              : "badge-error"
                          }`}
                        >
                          {resident.status === "active" ? "Hoạt động" : "Vô hiệu"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(resident)}
                            className="hover:bg-muted"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivate(resident.id)}
                            className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="empty-state p-12">
              <AlertCircle className="empty-state-icon" />
              <h3 className="empty-state-title">
                {searchTerm ? "Không tìm thấy cư dân" : "Chưa có cư dân nào"}
              </h3>
              <p className="empty-state-description">
                {searchTerm ? "Hãy thử tìm kiếm với từ khóa khác" : "Hãy thêm cư dân mới để bắt đầu"}
              </p>
            </div>
          )}
        </Card>
      </div>
    </ResidenceCareLayout>
  );
}
