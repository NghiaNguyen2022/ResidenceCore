import { useMemo, useState } from "react";
import {
  AlertCircle,
  Award,
  BookOpenCheck,
  CalendarDays,
  Edit2,
  GraduationCap,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { trpc } from "@/lib/trpc";
import { ResidenceCareLayout } from "@/components/ResidenceCareLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type AcademicTerm = {
  id: number;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

type AcademicRating =
  | "excellent"
  | "good"
  | "fair"
  | "average"
  | "weak";

type AcademicEvaluation = {
  id: number;
  residentId: number;
  residentName: string;
  residentCode: string;
  termId: number;
  termName: string;
  academicYear: string;
  majorName?: string;
  score?: number;
  rating: AcademicRating;
  needSupport: boolean;
  comment?: string;
  evaluatedBy?: string;
  evaluatedAt: string;
};

type TermFormData = {
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

type EvaluationFormData = {
  residentId: string;
  termId: string;
  majorName: string;
  score: string;
  rating: AcademicRating;
  needSupport: boolean;
  comment: string;
  evaluatedBy: string;
};

const initialTerms: AcademicTerm[] = [
  {
    id: 1,
    name: "Học kỳ 1",
    academicYear: "2026",
    startDate: "2026-09-01",
    endDate: "2027-01-15",
    isActive: true,
  },
  {
    id: 2,
    name: "Học kỳ 2",
    academicYear: "2026",
    startDate: "2027-02-01",
    endDate: "2027-06-30",
    isActive: false,
  },
];

const initialEvaluations: AcademicEvaluation[] = [
  {
    id: 1,
    residentId: 1,
    residentName: "Nguyễn Văn A",
    residentCode: "HV0001",
    termId: 1,
    termName: "Học kỳ 1",
    academicYear: "2026",
    majorName: "Y",
    score: 8.2,
    rating: "good",
    needSupport: false,
    comment: "Có tiến bộ, duy trì tốt việc học.",
    evaluatedBy: "Người phụ trách học vụ",
    evaluatedAt: "2026-12-20",
  },
  {
    id: 2,
    residentId: 2,
    residentName: "Trần Thị B",
    residentCode: "HV0002",
    termId: 1,
    termName: "Học kỳ 1",
    academicYear: "2026",
    majorName: "Sư phạm",
    score: 6.1,
    rating: "average",
    needSupport: true,
    comment: "Cần theo dõi thêm và hỗ trợ kế hoạch học tập.",
    evaluatedBy: "Người phụ trách học vụ",
    evaluatedAt: "2026-12-20",
  },
];

const defaultTermForm: TermFormData = {
  name: "",
  academicYear: "2026",
  startDate: "",
  endDate: "",
  isActive: false,
};

const defaultEvaluationForm: EvaluationFormData = {
  residentId: "",
  termId: "",
  majorName: "",
  score: "",
  rating: "good",
  needSupport: false,
  comment: "",
  evaluatedBy: "",
};

function getRatingLabel(rating: AcademicRating) {
  if (rating === "excellent") return "Xuất sắc";
  if (rating === "good") return "Giỏi";
  if (rating === "fair") return "Khá";
  if (rating === "average") return "Trung bình";
  return "Yếu";
}

function getRatingClass(rating: AcademicRating) {
  if (rating === "excellent") return "bg-purple-50 text-purple-700";
  if (rating === "good") return "bg-green-50 text-green-700";
  if (rating === "fair") return "bg-blue-50 text-blue-700";
  if (rating === "average") return "bg-orange-50 text-orange-700";
  return "bg-red-50 text-red-700";
}

function formatDate(date?: string) {
  if (!date) return "-";

  try {
    return new Date(date).toLocaleDateString("vi-VN");
  } catch {
    return "-";
  }
}

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{value}</p>
          <p className="mt-1 text-xs text-neutral-500">{description}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function AcademicEvaluations() {
  const [terms, setTerms] = useState<AcademicTerm[]>(initialTerms);
  const [evaluations, setEvaluations] =
    useState<AcademicEvaluation[]>(initialEvaluations);

  const [searchTerm, setSearchTerm] = useState("");
  const [termFilter, setTermFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [supportFilter, setSupportFilter] = useState("all");

  const [isTermFormOpen, setIsTermFormOpen] = useState(false);
  const [isEvaluationFormOpen, setIsEvaluationFormOpen] = useState(false);

  const [editingTerm, setEditingTerm] = useState<AcademicTerm | null>(null);
  const [editingEvaluation, setEditingEvaluation] =
    useState<AcademicEvaluation | null>(null);

  const [termForm, setTermForm] = useState<TermFormData>(defaultTermForm);
  const [evaluationForm, setEvaluationForm] =
    useState<EvaluationFormData>(defaultEvaluationForm);

  /**
   * CONNECTED DATA
   * Danh sách học viên lấy từ API thật.
   * Kỳ đánh giá và lượng giá học kỳ hiện vẫn là mock UI, chưa ghi DB.
   */
  const membersQuery = trpc.members.list.useQuery({
    search: "",
    status: undefined,
  });

  const members = membersQuery.data || [];

  const filteredEvaluations = useMemo(() => {
    return evaluations.filter((item) => {
      const keyword = searchTerm.trim().toLowerCase();

      const matchesSearch =
        !keyword ||
        item.residentName.toLowerCase().includes(keyword) ||
        item.residentCode.toLowerCase().includes(keyword) ||
        item.termName.toLowerCase().includes(keyword) ||
        (item.majorName || "").toLowerCase().includes(keyword) ||
        (item.comment || "").toLowerCase().includes(keyword);

      const matchesTerm =
        termFilter === "all" || String(item.termId) === termFilter;

      const matchesRating =
        ratingFilter === "all" || item.rating === ratingFilter;

      const matchesSupport =
        supportFilter === "all" ||
        (supportFilter === "need-support" && item.needSupport) ||
        (supportFilter === "normal" && !item.needSupport);

      return matchesSearch && matchesTerm && matchesRating && matchesSupport;
    });
  }, [evaluations, searchTerm, termFilter, ratingFilter, supportFilter]);

  const activeTerm = terms.find((term) => term.isActive);
  const evaluatedResidentCount = new Set(
    evaluations.map((item) => item.residentId)
  ).size;

  const excellentAndGoodCount = evaluations.filter(
    (item) => item.rating === "excellent" || item.rating === "good"
  ).length;

  const needSupportCount = evaluations.filter((item) => item.needSupport).length;

  const ratingStats = useMemo(() => {
    const ratings: AcademicRating[] = [
      "excellent",
      "good",
      "fair",
      "average",
      "weak",
    ];

    return ratings.map((rating) => ({
      rating,
      label: getRatingLabel(rating),
      count: evaluations.filter((item) => item.rating === rating).length,
    }));
  }, [evaluations]);

  const openCreateTerm = () => {
    setEditingTerm(null);
    setTermForm(defaultTermForm);
    setIsTermFormOpen(true);
  };

  const openEditTerm = (term: AcademicTerm) => {
    setEditingTerm(term);
    setTermForm({
      name: term.name,
      academicYear: term.academicYear,
      startDate: term.startDate,
      endDate: term.endDate,
      isActive: term.isActive,
    });
    setIsTermFormOpen(true);
  };

  const handleSaveTerm = () => {
    if (editingTerm) {
      setTerms((prev) =>
        prev.map((item) => {
          if (item.id === editingTerm.id) {
            return {
              ...item,
              name: termForm.name,
              academicYear: termForm.academicYear,
              startDate: termForm.startDate,
              endDate: termForm.endDate,
              isActive: termForm.isActive,
            };
          }

          if (termForm.isActive) {
            return {
              ...item,
              isActive: false,
            };
          }

          return item;
        })
      );

      setEvaluations((prev) =>
        prev.map((item) =>
          item.termId === editingTerm.id
            ? {
                ...item,
                termName: termForm.name,
                academicYear: termForm.academicYear,
              }
            : item
        )
      );
    } else {
      const newTerm: AcademicTerm = {
        id: Date.now(),
        name: termForm.name,
        academicYear: termForm.academicYear,
        startDate: termForm.startDate,
        endDate: termForm.endDate,
        isActive: termForm.isActive,
      };

      setTerms((prev) => {
        const updatedTerms = termForm.isActive
          ? prev.map((term) => ({ ...term, isActive: false }))
          : prev;

        return [newTerm, ...updatedTerms];
      });
    }

    setIsTermFormOpen(false);
    setEditingTerm(null);
    setTermForm(defaultTermForm);
  };

  const handleDeleteTerm = (id: number) => {
    const hasEvaluations = evaluations.some((item) => item.termId === id);

    if (hasEvaluations) {
      alert("Kỳ này đang có lượng giá trong UI mock, chưa thể xóa.");
      return;
    }

    if (!confirm("Bạn có chắc chắn muốn xóa kỳ đánh giá này khỏi UI mock?")) {
      return;
    }

    setTerms((prev) => prev.filter((item) => item.id !== id));
  };

  const openCreateEvaluation = () => {
    setEditingEvaluation(null);
    setEvaluationForm({
      ...defaultEvaluationForm,
      termId: activeTerm ? String(activeTerm.id) : "",
    });
    setIsEvaluationFormOpen(true);
  };

  const openEditEvaluation = (evaluation: AcademicEvaluation) => {
    setEditingEvaluation(evaluation);
    setEvaluationForm({
      residentId: String(evaluation.residentId),
      termId: String(evaluation.termId),
      majorName: evaluation.majorName || "",
      score: evaluation.score ? String(evaluation.score) : "",
      rating: evaluation.rating,
      needSupport: evaluation.needSupport,
      comment: evaluation.comment || "",
      evaluatedBy: evaluation.evaluatedBy || "",
    });
    setIsEvaluationFormOpen(true);
  };

  const handleSaveEvaluation = () => {
    const selectedResident = members.find(
      (member: any) => String(member.id) === evaluationForm.residentId
    );

    const selectedTerm = terms.find(
      (term) => String(term.id) === evaluationForm.termId
    );

    if (!selectedResident) {
      alert("Vui lòng chọn học viên từ danh sách.");
      return;
    }

    if (!selectedTerm) {
      alert("Vui lòng chọn kỳ đánh giá.");
      return;
    }

    const residentId = selectedResident.id;
    const residentName = selectedResident.fullName || "-";
    const residentCode =
      selectedResident.residentCode || `ID: ${selectedResident.id}`;

    const score = evaluationForm.score
      ? Number(evaluationForm.score)
      : undefined;

    const duplicated = evaluations.some(
      (item) =>
        item.residentId === residentId &&
        item.termId === selectedTerm.id &&
        item.id !== editingEvaluation?.id
    );

    if (duplicated) {
      alert(
        "Học viên này đã có lượng giá trong kỳ đã chọn. Vui lòng sửa dòng hiện có thay vì tạo mới."
      );
      return;
    }

    if (editingEvaluation) {
      setEvaluations((prev) =>
        prev.map((item) =>
          item.id === editingEvaluation.id
            ? {
                ...item,
                residentId,
                residentName,
                residentCode,
                termId: selectedTerm.id,
                termName: selectedTerm.name,
                academicYear: selectedTerm.academicYear,
                majorName: evaluationForm.majorName,
                score,
                rating: evaluationForm.rating,
                needSupport: evaluationForm.needSupport,
                comment: evaluationForm.comment,
                evaluatedBy: evaluationForm.evaluatedBy,
                evaluatedAt: new Date().toISOString().split("T")[0],
              }
            : item
        )
      );
    } else {
      const newEvaluation: AcademicEvaluation = {
        id: Date.now(),
        residentId,
        residentName,
        residentCode,
        termId: selectedTerm.id,
        termName: selectedTerm.name,
        academicYear: selectedTerm.academicYear,
        majorName: evaluationForm.majorName,
        score,
        rating: evaluationForm.rating,
        needSupport: evaluationForm.needSupport,
        comment: evaluationForm.comment,
        evaluatedBy: evaluationForm.evaluatedBy,
        evaluatedAt: new Date().toISOString().split("T")[0],
      };

      setEvaluations((prev) => [newEvaluation, ...prev]);
    }

    setIsEvaluationFormOpen(false);
    setEditingEvaluation(null);
    setEvaluationForm(defaultEvaluationForm);
  };

  const handleDeleteEvaluation = (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lượng giá này khỏi UI mock?")) {
      return;
    }

    setEvaluations((prev) => prev.filter((item) => item.id !== id));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTermFilter("all");
    setRatingFilter("all");
    setSupportFilter("all");
  };

  return (
    <ResidenceCareLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Học vụ</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">
              Lượng giá học kỳ
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-500">
              Theo dõi kết quả học tập, xếp loại và nhu cầu hỗ trợ học tập của
              học viên theo từng học kỳ hoặc năm học.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={openCreateTerm}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-3 text-sm font-semibold text-neutral-700 shadow-sm transition hover:bg-neutral-50"
            >
              <Plus className="h-4 w-4" />
              Thêm kỳ
            </button>

            <button
              type="button"
              onClick={openCreateEvaluation}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Thêm lượng giá
            </button>
          </div>
        </div>

        {/* Data status */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-800">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">
                UI mock cho lượng giá học kỳ - danh sách học viên lấy data thật
              </p>
              <p className="mt-1 text-sm">
                Học viên được lấy từ{" "}
                <span className="font-semibold">trpc.members.list</span>. Kỳ
                đánh giá và kết quả lượng giá hiện chỉ lưu trong state mock trên
                UI, chưa ghi database. Sau này sẽ mapping với{" "}
                <span className="font-semibold">academicTerms</span> và{" "}
                <span className="font-semibold">academicEvaluations</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Học viên"
            value={members.length}
            description="Lấy từ API members.list"
            icon={<Users className="h-5 w-5" />}
          />

          <StatCard
            label="Đã lượng giá"
            value={evaluatedResidentCount}
            description="Tính theo học viên duy nhất"
            icon={<BookOpenCheck className="h-5 w-5" />}
          />

          <StatCard
            label="Xuất sắc / Giỏi"
            value={excellentAndGoodCount}
            description="Số lượng giá đạt mức cao"
            icon={<Award className="h-5 w-5" />}
          />

          <StatCard
            label="Cần hỗ trợ"
            value={needSupportCount}
            description="Học viên cần theo dõi học tập"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>

        {/* Mapping */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">
              Mapping checklist
            </h2>
            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <div className="rounded-xl bg-neutral-50 p-3">
                Lượng giá kết quả học tập theo kỳ.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Xếp loại học viên: Xuất sắc, Giỏi, Khá, Trung bình, Yếu.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Đánh dấu học viên cần hỗ trợ học tập.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Sau này hiển thị trong tab Học vụ của hồ sơ học viên.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900">
              Mapping backend / data
            </h2>
            <div className="mt-4 space-y-2 text-sm text-neutral-700">
              <div className="rounded-xl bg-neutral-50 p-3">
                Danh sách học viên: <b>trpc.members.list</b> - đã connect.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Bảng đề xuất: <b>academicTerms</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Bảng đề xuất: <b>academicEvaluations</b>.
              </div>
              <div className="rounded-xl bg-neutral-50 p-3">
                Quan hệ dữ liệu:{" "}
                <b>residents 1 - n academicEvaluations</b>.
              </div>
            </div>
          </div>
        </div>

        {/* Active term + rating stats */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[320px_1fr]">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-bold text-neutral-900">
                Kỳ hiện hành
              </h2>
            </div>

            {activeTerm ? (
              <div>
                <p className="text-2xl font-bold text-neutral-900">
                  {activeTerm.name}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Năm học {activeTerm.academicYear}
                </p>
                <p className="mt-3 text-sm text-neutral-700">
                  {formatDate(activeTerm.startDate)} -{" "}
                  {formatDate(activeTerm.endDate)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">
                Chưa có kỳ nào được đánh dấu hiện hành.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-neutral-900">
              Thống kê xếp loại
            </h2>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
              {ratingStats.map((item) => (
                <div
                  key={item.rating}
                  className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                >
                  <p className="text-sm font-semibold text-neutral-700">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-neutral-900">
                    {item.count}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_180px_180px_180px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tìm học viên, kỳ, ngành, nhận xét..."
                className="pl-10"
              />
            </div>

            <select
              value={termFilter}
              onChange={(event) => setTermFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả kỳ</option>
              {terms.map((term) => (
                <option key={term.id} value={String(term.id)}>
                  {term.name} - {term.academicYear}
                </option>
              ))}
            </select>

            <select
              value={ratingFilter}
              onChange={(event) => setRatingFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả xếp loại</option>
              <option value="excellent">Xuất sắc</option>
              <option value="good">Giỏi</option>
              <option value="fair">Khá</option>
              <option value="average">Trung bình</option>
              <option value="weak">Yếu</option>
            </select>

            <select
              value={supportFilter}
              onChange={(event) => setSupportFilter(event.target.value)}
              className="h-10 rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">Tất cả hỗ trợ</option>
              <option value="need-support">Cần hỗ trợ</option>
              <option value="normal">Không cần hỗ trợ</option>
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Xóa lọc
            </button>
          </div>
        </div>

        {/* Evaluations table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Danh sách lượng giá học kỳ
              </h2>
              <p className="text-sm text-neutral-500">
                {filteredEvaluations.length} dòng đang hiển thị. Dữ liệu lượng
                giá hiện là mock UI.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Học viên
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Kỳ
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Ngành
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Điểm
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Xếp loại
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Hỗ trợ
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Nhận xét
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {filteredEvaluations.map((item) => (
                  <tr key={item.id} className="transition hover:bg-neutral-50">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {item.residentName}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {item.residentCode}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-neutral-800">
                        {item.termName}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {item.academicYear}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {item.majorName || "-"}
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {item.score ?? "-"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getRatingClass(
                          item.rating
                        )}`}
                      >
                        {getRatingLabel(item.rating)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {item.needSupport ? (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                          Cần hỗ trợ
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Ổn định
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      <div className="max-w-xs truncate">
                        {item.comment || "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditEvaluation(item)}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Sửa lượng giá"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteEvaluation(item.id)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          title="Xóa lượng giá mock"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredEvaluations.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-10 text-center text-sm text-neutral-500"
                    >
                      Không có lượng giá nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Terms table */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Danh sách kỳ đánh giá
              </h2>
              <p className="text-sm text-neutral-500">
                Kỳ đánh giá hiện là mock UI, chưa ghi database.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Kỳ
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Năm học
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Thời gian
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Hiện hành
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100">
                {terms.map((term) => (
                  <tr key={term.id} className="transition hover:bg-neutral-50">
                    <td className="px-5 py-4 font-semibold text-neutral-900">
                      {term.name}
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {term.academicYear}
                    </td>

                    <td className="px-5 py-4 text-sm text-neutral-700">
                      {formatDate(term.startDate)} - {formatDate(term.endDate)}
                    </td>

                    <td className="px-5 py-4">
                      {term.isActive ? (
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Đang áp dụng
                        </span>
                      ) : (
                        <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600">
                          Không
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditTerm(term)}
                          className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          title="Sửa kỳ"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTerm(term.id)}
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          title="Xóa kỳ mock"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {terms.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-sm text-neutral-500"
                    >
                      Chưa có kỳ đánh giá nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isTermFormOpen && (
          <TermFormModal
            title={editingTerm ? "Chỉnh sửa kỳ đánh giá" : "Thêm kỳ đánh giá"}
            formData={termForm}
            setFormData={setTermForm}
            onClose={() => {
              setIsTermFormOpen(false);
              setEditingTerm(null);
            }}
            onSubmit={handleSaveTerm}
          />
        )}

        {isEvaluationFormOpen && (
          <EvaluationFormModal
            title={
              editingEvaluation
                ? "Chỉnh sửa lượng giá học kỳ"
                : "Thêm lượng giá học kỳ"
            }
            formData={evaluationForm}
            setFormData={setEvaluationForm}
            members={members}
            membersLoading={membersQuery.isLoading}
            terms={terms}
            onClose={() => {
              setIsEvaluationFormOpen(false);
              setEditingEvaluation(null);
            }}
            onSubmit={handleSaveEvaluation}
          />
        )}
      </div>
    </ResidenceCareLayout>
  );
}

function TermFormModal({
  title,
  formData,
  setFormData,
  onClose,
  onSubmit,
}: {
  title: string;
  formData: TermFormData;
  setFormData: React.Dispatch<React.SetStateAction<TermFormData>>;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
            <p className="text-sm text-neutral-500">
              Form này hiện chỉ cập nhật kỳ đánh giá trong UI mock, chưa ghi
              database.
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
          <div>
            <Label htmlFor="termName">Tên kỳ *</Label>
            <Input
              id="termName"
              value={formData.name}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  name: event.target.value,
                })
              }
              placeholder="VD: Học kỳ 1"
              required
            />
          </div>

          <div>
            <Label htmlFor="academicYear">Năm học *</Label>
            <Input
              id="academicYear"
              value={formData.academicYear}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  academicYear: event.target.value,
                })
              }
              placeholder="VD: 2026"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="startDate">Từ ngày</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    startDate: event.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="endDate">Đến ngày</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    endDate: event.target.value,
                  })
                }
              />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  isActive: event.target.checked,
                })
              }
              className="h-4 w-4"
            />
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                Đánh dấu là kỳ hiện hành
              </p>
              <p className="text-xs text-neutral-500">
                Nếu chọn mục này, các kỳ khác sẽ chuyển về không hiện hành
                trong UI mock.
              </p>
            </div>
          </label>

          <div className="flex justify-end gap-3 border-t border-neutral-200 pt-5">
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
              Lưu mock UI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EvaluationFormModal({
  title,
  formData,
  setFormData,
  members,
  membersLoading,
  terms,
  onClose,
  onSubmit,
}: {
  title: string;
  formData: EvaluationFormData;
  setFormData: React.Dispatch<React.SetStateAction<EvaluationFormData>>;
  members: any[];
  membersLoading: boolean;
  terms: AcademicTerm[];
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
            <p className="text-sm text-neutral-500">
              Chọn học viên từ danh sách thật. Lượng giá hiện chỉ lưu trong UI
              mock, chưa ghi database.
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
          <div>
            <Label htmlFor="residentId">Chọn học viên *</Label>
            <select
              id="residentId"
              value={formData.residentId}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  residentId: event.target.value,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">
                {membersLoading
                  ? "Đang tải danh sách học viên..."
                  : "-- Chọn học viên --"}
              </option>

              {members.map((member: any) => (
                <option key={member.id} value={String(member.id)}>
                  {member.fullName} - {member.residentCode || `ID: ${member.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="termId">Kỳ đánh giá *</Label>
            <select
              id="termId"
              value={formData.termId}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  termId: event.target.value,
                })
              }
              className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">-- Chọn kỳ --</option>

              {terms.map((term) => (
                <option key={term.id} value={String(term.id)}>
                  {term.name} - {term.academicYear}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="majorName">Ngành học</Label>
            <Input
              id="majorName"
              value={formData.majorName}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  majorName: event.target.value,
                })
              }
              placeholder="VD: Y, Sư phạm, Kinh tế..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="score">Điểm / GPA</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={formData.score}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    score: event.target.value,
                  })
                }
                placeholder="VD: 8.2"
              />
            </div>

            <div>
              <Label htmlFor="rating">Xếp loại *</Label>
              <select
                id="rating"
                value={formData.rating}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    rating: event.target.value as AcademicRating,
                  })
                }
                className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              >
                <option value="excellent">Xuất sắc</option>
                <option value="good">Giỏi</option>
                <option value="fair">Khá</option>
                <option value="average">Trung bình</option>
                <option value="weak">Yếu</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <input
              type="checkbox"
              checked={formData.needSupport}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  needSupport: event.target.checked,
                })
              }
              className="h-4 w-4"
            />
            <div>
              <p className="text-sm font-semibold text-neutral-800">
                Học viên cần hỗ trợ học tập
              </p>
              <p className="text-xs text-neutral-500">
                Dùng để theo dõi các trường hợp cần kèm thêm, nhắc nhở hoặc
                trao đổi với người phụ trách.
              </p>
            </div>
          </label>

          <div>
            <Label htmlFor="evaluatedBy">Người lượng giá</Label>
            <Input
              id="evaluatedBy"
              value={formData.evaluatedBy}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  evaluatedBy: event.target.value,
                })
              }
              placeholder="VD: Người phụ trách học vụ"
            />
          </div>

          <div>
            <Label htmlFor="comment">Nhận xét</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  comment: event.target.value,
                })
              }
              placeholder="Nhận xét thêm về kết quả học tập"
              className="min-h-24"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-neutral-200 pt-5">
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
              Lưu mock UI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}