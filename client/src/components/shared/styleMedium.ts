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
      topInner: 'relative overflow-visible px-1 py-1 text-slate-900 sm:px-2',
      topTitle: 'text-[32px] font-bold tracking-tight text-slate-950 sm:text-[38px]',
      topSubtitle: 'mt-2 max-w-3xl text-sm leading-7 text-slate-600 sm:text-[15px]',

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
      sectionBody: cx('bg-[linear-gradient(180deg,rgba(255,250,240,0.45)_0%,rgba(248,250,252,0.35)_100%)]', density.sectionBody),

      segmentedControl: 'flex rounded-2xl bg-slate-100 p-1 text-sm font-semibold',
      segmentedActive: 'bg-white text-slate-900 shadow-[0_8px_18px_rgba(120,53,15,0.10)]',
      segmentedIdle: 'text-slate-500 hover:text-slate-800',

      cardTitle: 'min-w-0 text-xl font-semibold leading-7 text-slate-950',
      cardHolyName: 'text-xs font-medium leading-5 text-slate-500',
      cardMeta: 'mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-slate-500',

      compactSectionLabel: 'text-base font-medium tracking-tight text-slate-900',
      compactSectionHint: 'mt-1 text-xs leading-5 text-slate-500',

      card:
            'relative overflow-visible rounded-3xl border p-4 shadow-[0_18px_42px_rgba(120,53,15,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_56px_rgba(120,53,15,0.12)]',
      cardActive: cx(tone.border, tone.cardGradient, 'hover:border-amber-200'),
      cardLeft: 'border-rose-200 bg-rose-50/80',
      cardInactive: 'border-amber-200 bg-amber-50/80',
      cardSection: cx(
            'rounded-2xl border px-4 py-3 shadow-sm shadow-amber-900/5',
            tone.border,
            tone.cardSoftGradient
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
            'rounded-[26px] border p-4',
            tone.border,
            tone.panelGradient,
            tone.shadowMedium
      ),
      orgExecutivePanel: cx(
            'rounded-[22px] border p-3',
            tone.border,
            tone.cardGradient,
            tone.shadowSoft
      ),
      orgUnitsPanel: cx(
            'rounded-[26px] border p-4',
            tone.border,
            tone.panelGradient,
            tone.shadowSoft
      ),
      orgUnitColumn: cx(
            'overflow-hidden rounded-[22px] border',
            tone.border,
            tone.cardGradient,
            tone.shadowSoft
      ),
      orgUnitCard: cx(
            'rounded-2xl border p-2.5',
            tone.softBorder,
            'bg-white/58'
      ),
      orgPersonCard: cx(
            'group relative overflow-hidden rounded-2xl border p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:bg-white/92 hover:shadow-[0_14px_34px_rgba(120,53,15,0.11)]',
            tone.softBorder,
            'bg-[linear-gradient(145deg,rgba(255,255,255,0.86)_0%,rgba(255,250,241,0.72)_100%)] shadow-[0_8px_22px_rgba(120,53,15,0.055)]'
      ),
      orgPersonCardHead: cx(
            'group relative overflow-hidden rounded-2xl border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200 hover:bg-white/94 hover:shadow-[0_18px_42px_rgba(120,53,15,0.13)]',
            tone.border,
            'bg-[linear-gradient(145deg,rgba(255,255,255,0.92)_0%,rgba(255,248,236,0.84)_100%)] shadow-[0_12px_32px_rgba(120,53,15,0.08)]'
      ),
      orgPersonCardEmpty: cx(
            'group relative overflow-hidden rounded-2xl border border-dashed p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/78 hover:shadow-[0_10px_28px_rgba(120,53,15,0.08)]',
            tone.softBorder,
            'bg-white/45'
      ),
      orgPersonCardUnit: cx(
            'group relative overflow-hidden rounded-xl border border-slate-200/70 p-2 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-100 hover:bg-white/86 hover:shadow-[0_10px_24px_rgba(120,53,15,0.08)]',
            'bg-[linear-gradient(145deg,rgba(255,255,255,0.74)_0%,rgba(248,250,252,0.58)_100%)] shadow-[0_4px_12px_rgba(15,23,42,0.035)]'
      ),
      orgPersonCardGlow:
            'pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent opacity-80',
      orgPersonCardShine:
            'pointer-events-none absolute -right-8 -top-8 h-16 w-16 rounded-full bg-amber-100/35 blur-2xl transition-opacity duration-200 group-hover:opacity-90',
      orgPersonTitle:
            'text-center text-[11px] font-semibold normal-case tracking-normal text-amber-700/90 transition-colors group-hover:text-amber-800',
      orgPersonName:
            'mt-1 truncate text-center text-[15px] font-medium leading-5 text-slate-700 transition-colors group-hover:text-slate-900',
      orgPersonTitleUnit:
            'text-center text-[10px] font-semibold normal-case tracking-normal text-slate-400 transition-colors group-hover:text-amber-700/80',
      orgPersonNameUnit:
            'mt-0.5 truncate text-center text-[13px] font-medium leading-5 text-slate-600 transition-colors group-hover:text-slate-800',
      orgAvatarActive:
            'hidden',
      orgAvatarEmpty:
            'hidden',

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
