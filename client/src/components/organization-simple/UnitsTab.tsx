import { Building2, Plus } from 'lucide-react';

import type { OrganizationUnit } from './types';
import {
      getUnitTypeClass,
      getUnitTypeLabel,
} from './utils';
import { Badge, SectionEmpty } from './OrgCards';

type UnitsTabProps = {
      units: OrganizationUnit[];
      onCreateUnit: () => void;
      onEditUnit: (unit: OrganizationUnit) => void;
      onToggleUnit: (unit: OrganizationUnit) => void;
};

export function UnitsTab({
      units,
      onCreateUnit,
      onEditUnit,
      onToggleUnit,
}: UnitsTabProps) {
      return (
            <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                              <h2 className="text-lg font-bold text-neutral-950">Tổ / Ban</h2>
                              <p className="mt-1 text-sm text-neutral-500">
                                    Quản lý các tổ và ban đang sử dụng trong lưu xá.
                              </p>
                        </div>
                        <button
                              type="button"
                              onClick={onCreateUnit}
                              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                              <Plus className="h-4 w-4" />
                              Thêm Tổ/Ban
                        </button>
                  </div>

                  {units.length === 0 ? (
                        <SectionEmpty
                              title="Chưa có Tổ/Ban"
                              description="Thêm Tổ hoặc Ban để phát sinh các vị trí phụ trách tương ứng."
                        />
                  ) : (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                              {units.map((unit) => (
                                    <div
                                          key={unit.id}
                                          className={[
                                                'rounded-3xl border p-4 shadow-sm',
                                                unit.isActive
                                                      ? 'border-neutral-200 bg-neutral-50'
                                                      : 'border-neutral-200 bg-neutral-100 opacity-70',
                                          ].join(' ')}
                                    >
                                          <div className="flex items-start justify-between gap-3">
                                                <div>
                                                      <div className="flex items-center gap-2">
                                                            <Building2 className="h-4 w-4 text-neutral-500" />
                                                            <p className="font-bold text-neutral-950">{unit.name}</p>
                                                      </div>
                                                      <p className="mt-1 text-xs text-neutral-500">{unit.code}</p>
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                      <Badge className={getUnitTypeClass(unit.unitType)}>
                                                            {getUnitTypeLabel(unit.unitType)}
                                                      </Badge>
                                                      <Badge
                                                            className={
                                                                  unit.isActive
                                                                        ? 'border-green-200 bg-green-50 text-green-700'
                                                                        : 'border-neutral-200 bg-neutral-100 text-neutral-600'
                                                            }
                                                      >
                                                            {unit.isActive ? 'Đang dùng' : 'Ngừng dùng'}
                                                      </Badge>
                                                </div>
                                          </div>

                                          {unit.description && (
                                                <p className="mt-3 text-sm leading-6 text-neutral-600">
                                                      {unit.description}
                                                </p>
                                          )}

                                          <div className="mt-4 flex flex-wrap gap-2">
                                                <button
                                                      type="button"
                                                      onClick={() => onEditUnit(unit)}
                                                      className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                                                >
                                                      Sửa
                                                </button>
                                                <button
                                                      type="button"
                                                      onClick={() => onToggleUnit(unit)}
                                                      className={[
                                                            'rounded-xl border px-3 py-2 text-xs font-semibold',
                                                            unit.isActive
                                                                  ? 'border-orange-100 bg-orange-50 text-orange-700 hover:bg-orange-100'
                                                                  : 'border-green-100 bg-green-50 text-green-700 hover:bg-green-100',
                                                      ].join(' ')}
                                                >
                                                      {unit.isActive ? 'Ngừng dùng' : 'Kích hoạt'}
                                                </button>
                                          </div>
                                    </div>
                              ))}
                        </div>
                  )}
            </div>
      );
}
