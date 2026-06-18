import {
      defaultResidenceAppearanceConfig,
      getDensityTokens,
      getRadiusTokens,
      getResidenceToneTokens,
} from '@/config/residenceAppearance';

export function cx(...classes: Array<string | false | null | undefined>) {
      return classes.filter(Boolean).join(' ');
}

const activeAppearanceConfig = defaultResidenceAppearanceConfig;
const tone = getResidenceToneTokens(activeAppearanceConfig);
const density = getDensityTokens(activeAppearanceConfig);
const radius = getRadiusTokens(activeAppearanceConfig);

export const residenceMediumStyle = {
      page: cx('min-h-full', tone.pageGradient),

      pageShell: density.pageShell,

      topArea: 'relative overflow-visible px-1 pt-1',
      topInner: 'relative mx-auto flex max-w-4xl flex-col items-center overflow-visible px-1 py-1 text-center text-slate-900 sm:px-2',
      topTitle: 'text-center text-[32px] font-bold tracking-tight text-slate-950 sm:text-[38px]',
      topSubtitle: 'mx-auto mt-2 max-w-3xl text-center text-sm leading-7 text-slate-600 sm:text-[15px]',

      warmButton:
            'rounded-md border border-amber-200/80 bg-[linear-gradient(180deg,#fffaf0_0%,#fff3dc_100%)] px-4 py-2 text-sm font-semibold text-amber-900 shadow-[0_10px_24px_rgba(180,83,9,0.12)] transition hover:shadow-[0_14px_28px_rgba(180,83,9,0.16)]',

      warmPrimaryButton: cx(
            'inline-flex items-center gap-2 px-4 py-2 text-sm font-bold transition hover:shadow-[0_16px_32px_rgba(180,83,9,0.20)]',
            radius.button,
            'border',
            tone.softBorder,
            tone.primaryButtonGradient,
            tone.accentText,
            tone.shadowMedium
      ),

      filterPanel: cx(
            radius.panel,
            'border p-3',
            tone.border,
            tone.panelGradient,
            tone.shadowMedium
      ),
      filterGrid: 'grid gap-3 lg:grid-cols-[minmax(320px,0.82fr)_1fr] lg:items-center',
      filterTitle: 'text-base font-semibold tracking-tight text-slate-900',
      filterHint: 'mt-0.5 text-xs leading-5 text-slate-500',
      searchInput:
            'h-10 rounded-xl border-amber-100 bg-white/90 pl-10 text-sm shadow-[0_8px_20px_rgba(120,53,15,0.06)] transition placeholder:text-slate-400 focus:bg-white',

      chipBase:
            'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition shadow-sm shadow-slate-900/5',
      chipActive: 'bg-slate-900 text-white ring-slate-900 shadow-[0_10px_24px_rgba(15,23,42,0.14)]',
      chipIdle: tone.chipIdle,
      chipCountActive: 'bg-white/15 text-white',
      chipCountIdle: tone.chipCount,

      section: cx(
            'overflow-visible border',
            radius.panel,
            tone.border,
            tone.sectionGradient,
            tone.shadowMedium
      ),
      sectionHeader:
            'border-b border-amber-100/70 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_70%,#fff4e8_100%)] px-5 py-2.5',
      sectionTitle: 'text-[20px] font-bold tracking-tight text-slate-900 sm:text-[21px]',
      subsectionTitle: 'text-lg font-semibold tracking-tight text-slate-900',
      sectionBody: cx('bg-[linear-gradient(180deg,rgba(255,250,240,0.45)_0%,rgba(248,250,252,0.35)_100%)]', density.sectionBody),

      segmentedControl: 'flex rounded-2xl bg-slate-100 p-1 text-sm font-semibold',
      segmentedActive: 'bg-white text-slate-900 shadow-[0_8px_18px_rgba(120,53,15,0.10)]',
      segmentedIdle: 'text-slate-500 hover:text-slate-800',

      cardTitle: 'min-w-0 text-[16px] font-semibold leading-6 text-[#17335f]',
      cardHolyName: 'text-xs font-medium leading-5 text-slate-500',
      cardMeta: 'mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500',

      compactSectionLabel: 'text-base font-medium tracking-tight text-slate-900',
      compactSectionHint: 'mt-1 text-xs leading-5 text-slate-500',

      card:
            'relative overflow-visible rounded-2xl border p-4 shadow-[0_12px_30px_rgba(15,23,42,0.055)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)]',
      cardActive: cx('border-slate-200 bg-white/95', 'hover:border-slate-300'),
      cardLeft: 'border-rose-100 bg-rose-50/70',
      cardInactive: 'border-amber-100 bg-amber-50/65',
      cardSection: cx(
            'rounded-2xl border px-4 py-3 shadow-[0_8px_22px_rgba(15,23,42,0.035)]',
            tone.border,
            'bg-white/80'
      ),

      listPanel:
            'overflow-hidden rounded-2xl border border-amber-100/80 bg-[linear-gradient(180deg,#ffffff_0%,#fffdfa_100%)] shadow-[0_14px_34px_rgba(120,53,15,0.055)]',
      listPanelHeader:
            'border-b border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf7_72%,#fff3e3_100%)] px-4 py-2.5',
      listTableWrap: 'max-h-[560px] overflow-auto',
      listTable: 'min-w-[1180px] divide-y divide-amber-100/70 text-sm',
      listHead: 'sticky top-0 z-10 bg-amber-50/75 backdrop-blur',
      listHeadCell: 'px-4 py-2.5 text-left text-xs font-semibold text-slate-500',
      listRow: 'transition hover:bg-amber-50/45',
      listCell: 'px-4 py-2.5 text-slate-700',
      listPrimaryText: 'font-semibold text-slate-900',
      listSecondaryText: 'text-xs text-slate-400',
      listEmptyText: 'text-slate-400',

      dropdownPanel:
            'absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-amber-100/80 bg-white/95 py-2 text-slate-800 shadow-[0_28px_60px_rgba(120,53,15,0.16)] backdrop-blur',
      dropdownLabel: 'px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400',
      dropdownItem: 'w-full px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-amber-50/60',
      dropdownItemHint: 'mt-0.5 text-xs text-slate-400',
      divider: 'my-1 border-t border-amber-100/80',

      modalOverlay: 'fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 px-4 py-5 backdrop-blur-sm',
      modalShell:
            'flex max-h-[92vh] w-full flex-col overflow-hidden rounded-3xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf9_58%,#fff4e7_100%)] shadow-[0_30px_80px_rgba(15,23,42,0.20)]',
      modalHeader:
            'flex items-start justify-between gap-4 border-b border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_68%,#fff3e3_100%)] px-5 py-4',
      modalEyebrow: 'text-xs font-semibold uppercase tracking-[0.16em] text-amber-700',
      modalTitle: 'text-xl font-bold tracking-tight text-slate-950',
      modalSubtitle: 'mt-1 text-sm leading-6 text-slate-500',

      metricCard:
            'rounded-2xl border border-amber-100/80 bg-white/85 px-4 py-3 shadow-[0_10px_24px_rgba(120,53,15,0.055)]',
      metricLabel: 'text-xs font-medium text-slate-400',
      metricValue: 'mt-1 text-xl font-bold text-slate-900',

      fieldLabel: 'text-sm font-semibold text-slate-700',
      formInput:
            'mt-1 h-10 rounded-xl border-amber-100 bg-white/90 text-sm shadow-[0_8px_18px_rgba(120,53,15,0.055)]',
      formTextarea:
            'mt-1 min-h-20 rounded-xl border-amber-100 bg-white/90 text-sm shadow-[0_8px_18px_rgba(120,53,15,0.055)]',
      secondaryButton:
            'rounded-xl border border-amber-100 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-amber-50/60 disabled:cursor-not-allowed disabled:opacity-60',
      primaryButton: cx(
            radius.button,
            'border px-4 py-2 text-sm font-bold transition hover:shadow-[0_14px_28px_rgba(180,83,9,0.18)] disabled:cursor-not-allowed disabled:opacity-60',
            tone.softBorder,
            tone.primaryButtonGradient,
            tone.accentText,
            tone.shadowSoft
      ),

      premiumPanel: cx(
            radius.panel,
            'border p-5',
            tone.border,
            tone.panelGradient,
            tone.shadowDeep
      ),
      premiumSection: cx(
            'rounded-[30px] border p-5',
            tone.border,
            tone.panelGradient,
            tone.shadowDeep
      ),
      premiumNestedSection: cx(
            'rounded-[28px] border p-4',
            tone.border,
            tone.cardGradient,
            tone.shadowMedium
      ),
      premiumSubtleSection: cx(
            'rounded-[30px] border p-5',
            tone.border,
            tone.sectionGradient,
            tone.shadowMedium
      ),
      statCard: cx(
            'rounded-[24px] border p-4',
            tone.border,
            tone.panelGradient,
            tone.shadowMedium
      ),
      statIcon: tone.iconBubble,
      actionBar: 'flex flex-wrap justify-end gap-2 px-1',
      disabledActionButton: cx(
            radius.button,
            'inline-flex cursor-not-allowed items-center gap-2 border bg-white/70 px-4 py-2 text-sm font-semibold text-slate-400 opacity-70',
            tone.softBorder
      ),
      orgChartPanel: cx(
            'rounded-[30px] border p-5',
            tone.border,
            tone.panelGradient,
            tone.shadowDeep
      ),
      orgExecutivePanel: cx(
            'rounded-[28px] border p-4',
            tone.border,
            tone.cardGradient,
            tone.shadowMedium
      ),
      orgUnitsPanel: cx(
            'rounded-[30px] border p-5',
            tone.border,
            tone.panelGradient,
            tone.shadowMedium
      ),
      orgUnitColumn: cx(
            'overflow-hidden rounded-[30px] border',
            tone.border,
            tone.cardGradient,
            tone.shadowMedium
      ),
      orgUnitCard: cx(
            'rounded-3xl border p-3',
            tone.border,
            tone.cardSoftGradient,
            tone.shadowSoft
      ),
      orgPersonCard: cx(
            'relative overflow-hidden rounded-3xl border p-4 transition hover:-translate-y-0.5',
            tone.border,
            tone.cardGradient,
            tone.shadowMedium
      ),
      orgPersonCardHead: cx(
            'relative overflow-hidden rounded-3xl border p-4 transition hover:-translate-y-0.5',
            tone.border,
            tone.cardGradient,
            tone.shadowDeep
      ),
      orgPersonCardEmpty: cx(
            'relative overflow-hidden rounded-3xl border border-dashed p-4 transition hover:-translate-y-0.5',
            tone.softBorder,
            'bg-white/55'
      ),
      orgPersonTitle: 'text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-500',
      orgPersonName: 'mt-1.5 truncate text-[20px] font-extrabold leading-7 text-slate-800',
      orgAvatarActive:
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white shadow-sm shadow-slate-900/20',
      orgAvatarEmpty:
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-bold text-slate-400 ring-1 ring-amber-100',

};

export const residenceMediumAccents = [
      {
            strip: 'from-slate-800 via-slate-700 to-indigo-400',
            avatar: 'from-slate-900 to-indigo-700',
            soft: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
      },
      {
            strip: 'from-slate-800 via-emerald-500 to-teal-300',
            avatar: 'from-emerald-800 to-teal-600',
            soft: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
      },
      {
            strip: 'from-slate-800 via-violet-500 to-indigo-300',
            avatar: 'from-violet-800 to-indigo-700',
            soft: 'bg-violet-50 text-violet-700 ring-violet-100',
      },
      {
            strip: 'from-slate-800 via-amber-500 to-orange-300',
            avatar: 'from-amber-800 to-orange-700',
            soft: 'bg-amber-50 text-amber-700 ring-amber-100',
      },
] as const;
