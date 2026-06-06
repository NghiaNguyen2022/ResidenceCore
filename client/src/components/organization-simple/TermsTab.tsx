import { CheckCircle2, Plus } from 'lucide-react';

import type { OrganizationTerm } from './types';
import {
      formatDate,
      getTermStatusClass,
      getTermStatusLabel,
} from './utils';
import { Badge, SectionEmpty } from './OrgCards';

type TermsTabProps = {
      terms: OrganizationTerm[];
      onCreateTerm: () => void;
      onEditTerm: (term: OrganizationTerm) => void;
      onSetActiveTerm: (term: OrganizationTerm) => void;
};

export function TermsTab({
      terms,
      onCreateTerm,
      onEditTerm,
      onSetActiveTerm,
}: TermsTabProps) {
      return (
            <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                              <h2 className="text-lg font-bold text-neutral-950">Nhiệm kỳ</h2>
                              <p className="mt-1 text-sm text-neutral-500">
                                    Tạo, cập nhật và chọn nhiệm kỳ hiện tại.
                              </p>
                        </div>
                        <button
                              type="button"
                              onClick={onCreateTerm}
                              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                              <Plus className="h-4 w-4" />
                              Thêm nhiệm kỳ
                        </button>
                  </div>

                  {terms.length === 0 ? (
                        <SectionEmpty
                              title="Chưa có nhiệm kỳ"
                              description="Tạo nhiệm kỳ để bắt đầu thiết lập cơ cấu tổ chức."
                        />
                  ) : (
                        <div className="space-y-3">
                              {terms.map((term) => (
                                    <div
                                          key={term.id}
                                          className="flex flex-col gap-3 rounded-3xl border border-neutral-200 bg-neutral-50 p-4 md:flex-row md:items-center md:justify-between"
                                    >
                                          <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                      <p className="font-bold text-neutral-950">{term.name}</p>
                                                      <Badge className={getTermStatusClass(term.status)}>
                                                            {getTermStatusLabel(term.status)}
                                                      </Badge>
                                                </div>
                                                <p className="mt-1 text-sm text-neutral-500">
                                                      {term.code} · {formatDate(term.startDate)} - {formatDate(term.endDate)}
                                                </p>
                                                {term.description && (
                                                      <p className="mt-2 text-sm text-neutral-600">
                                                            {term.description}
                                                      </p>
                                                )}
                                          </div>

                                          <div className="flex flex-wrap gap-2">
                                                <button
                                                      type="button"
                                                      onClick={() => onEditTerm(term)}
                                                      className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                                                >
                                                      Sửa
                                                </button>
                                                {term.status !== 'active' && (
                                                      <button
                                                            type="button"
                                                            onClick={() => onSetActiveTerm(term)}
                                                            className="inline-flex items-center gap-1.5 rounded-xl border border-green-100 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100"
                                                      >
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                            Đặt hiện tại
                                                      </button>
                                                )}
                                          </div>
                                    </div>
                              ))}
                        </div>
                  )}
            </div>
      );
}
