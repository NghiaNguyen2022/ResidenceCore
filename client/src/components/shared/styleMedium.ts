import { cx } from '@/lib/utils';

import {
      defaultResidenceAppearanceConfig,
      getDensityTokens,
      getRadiusTokens,
      getResidenceToneTokens,
} from '@/config/residenceAppearance';

export { cx };

const activeAppearanceConfig = defaultResidenceAppearanceConfig;
const tone = getResidenceToneTokens(activeAppearanceConfig);
const density = getDensityTokens(activeAppearanceConfig);
const radius = getRadiusTokens(activeAppearanceConfig);

export const residenceMediumStyle = {
      page:
            'min-h-full bg-[radial-gradient(circle_at_12%_16%,rgba(251,191,36,0.16)_0%,transparent_28%),radial-gradient(circle_at_88%_8%,rgba(12,10,9,0.10)_0%,transparent_26%),linear-gradient(135deg,#fffaf0_0%,#f8fafc_42%,#fef3c7_72%,#111827_150%)]',

      pageShell: cx(density.pageShell, 'relative'),

      pageAura:
            'pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(115deg,rgba(255,255,255,0.46)_0%,rgba(251,191,36,0.16)_46%,rgba(12,10,9,0.10)_100%)] opacity-80 blur-3xl',

      topArea: 'relative overflow-visible px-1 pt-1',
      topInner: 'relative overflow-visible px-1 py-1 text-slate-900 sm:px-2',
      topTitle: 'text-[32px] font-bold tracking-tight text-slate-950 drop-shadow-[0_1px_0_rgba(255,255,255,0.70)] sm:text-[38px]',
      topSubtitle: 'mt-2 max-w-3xl text-sm leading-7 text-slate-600 sm:text-[15px]',

      pageHeaderActions:
            'flex flex-wrap items-center justify-end gap-2',

      buttonCard:
            'inline-flex h-9 items-center justify-center gap-2 rounded-2xl border border-amber-100/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.88)_0%,rgba(255,251,235,0.74)_60%,rgba(245,158,11,0.18)_100%)] px-4 text-sm font-semibold text-slate-800 shadow-[0_12px_26px_rgba(12,10,9,0.08),inset_0_1px_0_rgba(255,255,255,0.70)] transition hover:-translate-y-0.5 hover:border-amber-200/80 hover:shadow-[0_18px_38px_rgba(12,10,9,0.12),0_0_0_1px_rgba(251,191,36,0.12)] disabled:cursor-not-allowed disabled:opacity-60',

      buttonCardPrimary:
            'inline-flex h-9 items-center justify-center gap-2 rounded-2xl border border-amber-200/60 bg-[linear-gradient(35deg,rgba(255,255,255,0.94)_0%,rgba(254,243,199,0.82)_36%,rgba(245,158,11,0.34)_74%,rgba(28,25,23,0.16)_100%)] px-4 text-sm font-bold text-slate-900 shadow-[0_14px_32px_rgba(12,10,9,0.10),inset_0_1px_0_rgba(255,255,255,0.78)] transition hover:-translate-y-0.5 hover:border-amber-300/80 hover:shadow-[0_20px_46px_rgba(12,10,9,0.16),0_0_0_1px_rgba(251,191,36,0.16)] disabled:cursor-not-allowed disabled:opacity-60',

      buttonCardIcon: 'h-4 w-4',

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
            'border border-amber-100/60 p-3',
            'bg-[linear-gradient(135deg,rgba(255,255,255,0.78)_0%,rgba(255,251,235,0.58)_54%,rgba(248,250,252,0.70)_100%)]',
            'shadow-[0_18px_46px_rgba(12,10,9,0.075),inset_0_1px_0_rgba(255,255,255,0.76)]'
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
            'overflow-visible border border-amber-100/60',
            radius.panel,
            'bg-[linear-gradient(145deg,rgba(255,255,255,0.80)_0%,rgba(255,251,235,0.58)_50%,rgba(248,250,252,0.72)_100%)]',
            'shadow-[0_20px_52px_rgba(12,10,9,0.085),inset_0_1px_0_rgba(255,255,255,0.76)]'
      ),
      sectionHeader:
            'border-b border-amber-100/65 bg-[linear-gradient(135deg,rgba(255,255,255,0.86)_0%,rgba(255,251,235,0.70)_60%,rgba(245,158,11,0.14)_100%)] px-5 py-2.5',
      sectionTitle: 'text-[20px] font-bold tracking-tight text-slate-900 sm:text-[21px]',
      sectionBody: cx('bg-[linear-gradient(180deg,rgba(255,251,235,0.38)_0%,rgba(248,250,252,0.48)_100%)]', density.sectionBody),

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

      premiumGoldBlackPanel:
            'relative overflow-hidden rounded-[28px] border border-amber-200/45 bg-[linear-gradient(35deg,rgba(255,251,235,0.92)_0%,rgba(245,158,11,0.58)_36%,rgba(120,53,15,0.34)_68%,rgba(12,10,9,0.82)_100%)] shadow-[0_22px_58px_rgba(12,10,9,0.18),inset_0_1px_0_rgba(255,255,255,0.35)]',

      premiumGoldBlackCard:
            'group relative overflow-hidden rounded-2xl border border-amber-200/45 bg-[linear-gradient(35deg,rgba(255,255,255,0.94)_0%,rgba(254,243,199,0.80)_34%,rgba(245,158,11,0.45)_64%,rgba(28,25,23,0.72)_100%)] shadow-[0_16px_38px_rgba(12,10,9,0.16),inset_0_1px_0_rgba(255,255,255,0.62),inset_0_-1px_0_rgba(251,191,36,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300/75 hover:shadow-[0_24px_62px_rgba(12,10,9,0.22),0_0_0_1px_rgba(251,191,36,0.20)]',

      premiumGoldBlackCardSoft:
            'group relative overflow-hidden rounded-2xl border border-amber-100/45 bg-[linear-gradient(35deg,rgba(255,255,255,0.90)_0%,rgba(255,251,235,0.72)_42%,rgba(251,191,36,0.32)_72%,rgba(28,25,23,0.36)_100%)] shadow-[0_12px_30px_rgba(12,10,9,0.10),inset_0_1px_0_rgba(255,255,255,0.64)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-200/70 hover:shadow-[0_20px_48px_rgba(12,10,9,0.16),0_0_0_1px_rgba(251,191,36,0.14)]',

      premiumGoldBlackCardEmpty:
            'group relative overflow-hidden rounded-2xl border border-dashed border-amber-200/45 bg-[linear-gradient(35deg,rgba(255,255,255,0.62)_0%,rgba(255,251,235,0.44)_52%,rgba(120,53,15,0.10)_100%)] shadow-[0_8px_22px_rgba(12,10,9,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300/60 hover:bg-[linear-gradient(35deg,rgba(255,255,255,0.82)_0%,rgba(254,243,199,0.58)_54%,rgba(120,53,15,0.16)_100%)] hover:shadow-[0_14px_34px_rgba(12,10,9,0.12)]',

      premiumGoldBlackGloss:
            'pointer-events-none absolute inset-0 bg-[linear-gradient(35deg,transparent_0%,transparent_24%,rgba(255,255,255,0.10)_33%,rgba(255,255,255,0.70)_43%,rgba(255,255,255,0.22)_51%,transparent_64%,transparent_100%)] opacity-70 mix-blend-screen transition-opacity duration-200 group-hover:opacity-100',

      // System-wide page style foundation.
      // Use these tokens for every new/updated page to keep style aligned with Members/Organization.
      standardPage: 'min-h-full bg-[radial-gradient(circle_at_12%_16%,rgba(251,191,36,0.16)_0%,transparent_28%),radial-gradient(circle_at_88%_8%,rgba(12,10,9,0.10)_0%,transparent_26%),linear-gradient(135deg,#fffaf0_0%,#f8fafc_42%,#fef3c7_72%,#111827_150%)]',
      standardPageAura:
            'pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(115deg,rgba(255,255,255,0.46)_0%,rgba(251,191,36,0.16)_46%,rgba(12,10,9,0.10)_100%)] opacity-80 blur-3xl',
      standardPageContent: 'relative mx-auto max-w-[1420px] space-y-4 px-2 pb-8',
      standardHeader: 'relative overflow-visible px-5 pb-2 pt-3 text-slate-900 sm:px-6',
      standardHeaderAura:
            'pointer-events-none absolute inset-x-0 top-0 h-32 opacity-70 [background-image:radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.92),transparent_30%),radial-gradient(circle_at_78%_8%,rgba(251,191,36,0.18),transparent_26%)]',
      standardHeaderInner: 'relative min-h-[88px]',
      standardHeaderTextWrap: 'mx-auto flex max-w-4xl flex-col items-center text-center',
      standardHeaderTitle: 'text-3xl font-bold tracking-tight text-slate-950 sm:text-[38px]',
      standardHeaderSubtitle: 'mt-1.5 max-w-3xl text-sm leading-6 text-slate-500 sm:text-[15px]',
      standardHeaderActions:
            'mt-4 flex flex-wrap items-center justify-center gap-2 lg:absolute lg:right-0 lg:top-0 lg:mt-0 lg:justify-end',

      standardTabRail:
            'flex flex-wrap items-center justify-center gap-2 rounded-[24px] border border-amber-100/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.62)_0%,rgba(255,251,235,0.42)_62%,rgba(245,158,11,0.08)_100%)] px-4 py-2.5 shadow-[0_14px_30px_rgba(12,10,9,0.045),inset_0_1px_0_rgba(255,255,255,0.70)]',
      standardTabGrid: 'flex w-full gap-2',
      standardTabButton:
            'flex-1 rounded-full px-4 py-2 text-sm font-semibold transition',
      standardTabButtonActive:
            'bg-white/84 text-amber-900 ring-1 ring-amber-100/80 shadow-sm shadow-slate-900/5',
      standardTabButtonIdle:
            'text-slate-500 hover:bg-amber-50/70 hover:text-slate-800',

      standardToolbar:
            'flex flex-col gap-3 rounded-[22px] border border-amber-100/70 bg-white/72 p-2 lg:flex-row lg:items-center lg:justify-between',
      standardSegmented:
            'inline-flex w-full rounded-xl border border-amber-100/70 bg-white/76 p-1 lg:w-auto',
      standardSegmentedButton:
            'inline-flex items-center justify-center rounded-lg px-3 py-2 text-slate-600 transition hover:bg-amber-50',
      standardSegmentedCurrent:
            'min-w-[96px] rounded-lg px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50',

      standardSoftPanel:
            'rounded-[22px] border border-amber-100/70 bg-white/72 px-4 py-3',
      standardSoftCard:
            'relative overflow-hidden rounded-[22px] border border-amber-100/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.84)_0%,rgba(255,251,235,0.38)_100%)] p-3 transition',
      standardInfoBox:
            'min-w-0 rounded-xl border border-amber-100/70 bg-white/78 px-3 py-2',
      standardInfoLabel:
            'text-[11px] font-semibold uppercase tracking-wide text-slate-400',
      standardInfoText:
            'mt-1 truncate text-sm font-semibold leading-5 text-slate-700',

      standardModalOverlay:
            'fixed inset-0 z-[70] overflow-y-auto bg-slate-950/38 px-4 py-6 backdrop-blur-sm',
      standardModalShell:
            'mx-auto w-full overflow-hidden rounded-2xl border border-amber-100/80 bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_72%,#fff8ef_100%)] shadow-[0_16px_40px_rgba(15,23,42,0.14)]',
      standardModalHeader:
            'sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-amber-100/70 bg-white/94 px-5 py-4 backdrop-blur',

      premiumGoldBlackGlossThin:
            'pointer-events-none absolute inset-0 bg-[linear-gradient(35deg,transparent_0%,transparent_48%,rgba(255,255,255,0.58)_50%,transparent_54%,transparent_100%)] opacity-42 mix-blend-screen transition-opacity duration-200 group-hover:opacity-75',

      premiumGoldBlackGlass:
            'pointer-events-none absolute inset-x-0 top-0 h-[58%] bg-[linear-gradient(180deg,rgba(255,255,255,0.46)_0%,rgba(255,255,255,0.17)_42%,transparent_100%)] opacity-92',

      premiumGoldBlackGlow:
            'pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-100',

      premiumGoldBlackGoldBeam:
            'pointer-events-none absolute -bottom-10 -left-8 h-28 w-32 rounded-full bg-amber-300/28 blur-3xl opacity-90 transition-opacity duration-200 group-hover:opacity-100',

      premiumGoldBlackShine:
            'pointer-events-none absolute -right-10 -top-10 h-28 w-36 rounded-full bg-amber-300/34 blur-3xl transition-opacity duration-200 group-hover:opacity-100',

      premiumGoldBlackPagePanel:
            'relative overflow-hidden rounded-[30px] border border-amber-100/65 bg-[linear-gradient(135deg,rgba(255,255,255,0.82)_0%,rgba(255,251,235,0.70)_48%,rgba(245,158,11,0.16)_76%,rgba(12,10,9,0.10)_100%)] shadow-[0_24px_64px_rgba(12,10,9,0.10),inset_0_1px_0_rgba(255,255,255,0.72)]',

      premiumGoldBlackPageSection:
            'relative overflow-hidden rounded-[28px] border border-amber-100/55 bg-[linear-gradient(145deg,rgba(255,255,255,0.76)_0%,rgba(255,251,235,0.58)_54%,rgba(248,250,252,0.70)_100%)] shadow-[0_18px_46px_rgba(12,10,9,0.075),inset_0_1px_0_rgba(255,255,255,0.72)]',

      premiumGoldBlackSoftSurface:
            'relative overflow-hidden rounded-2xl border border-amber-100/45 bg-[linear-gradient(145deg,rgba(255,255,255,0.72)_0%,rgba(255,251,235,0.46)_60%,rgba(248,250,252,0.62)_100%)] shadow-[0_12px_30px_rgba(12,10,9,0.055)]',

      premiumPanel:
            'relative overflow-hidden rounded-[30px] border border-amber-100/65 bg-[linear-gradient(135deg,rgba(255,255,255,0.82)_0%,rgba(255,251,235,0.70)_48%,rgba(245,158,11,0.16)_76%,rgba(12,10,9,0.10)_100%)] p-5 shadow-[0_24px_64px_rgba(12,10,9,0.10),inset_0_1px_0_rgba(255,255,255,0.72)]',
      premiumSection:
            'relative overflow-hidden rounded-[30px] border border-amber-100/65 bg-[linear-gradient(135deg,rgba(255,255,255,0.82)_0%,rgba(255,251,235,0.70)_48%,rgba(245,158,11,0.16)_76%,rgba(12,10,9,0.10)_100%)] p-5 shadow-[0_24px_64px_rgba(12,10,9,0.10),inset_0_1px_0_rgba(255,255,255,0.72)]',
      premiumNestedSection:
            'relative overflow-hidden rounded-[28px] border border-amber-100/55 bg-[linear-gradient(145deg,rgba(255,255,255,0.78)_0%,rgba(255,251,235,0.58)_58%,rgba(248,250,252,0.70)_100%)] p-4 shadow-[0_16px_42px_rgba(12,10,9,0.075),inset_0_1px_0_rgba(255,255,255,0.72)]',
      premiumSubtleSection:
            'relative overflow-hidden rounded-[30px] border border-amber-100/50 bg-[linear-gradient(145deg,rgba(255,255,255,0.72)_0%,rgba(255,251,235,0.45)_58%,rgba(248,250,252,0.65)_100%)] p-5 shadow-[0_14px_36px_rgba(12,10,9,0.06)]',
      statCard:
            'relative overflow-hidden rounded-[24px] border border-amber-100/55 bg-[linear-gradient(135deg,rgba(255,255,255,0.78)_0%,rgba(255,251,235,0.56)_62%,rgba(245,158,11,0.12)_100%)] p-4 shadow-[0_16px_40px_rgba(12,10,9,0.075),inset_0_1px_0_rgba(255,255,255,0.70)]',
      statIcon: tone.iconBubble,
      actionBar: 'flex flex-wrap justify-end gap-2 px-1',
      disabledActionButton: cx(
            radius.button,
            'inline-flex cursor-not-allowed items-center gap-2 border bg-white/70 px-4 py-2 text-sm font-semibold text-slate-400 opacity-70',
            tone.softBorder
      ),
      orgChartPanel: cx(
            'rounded-[24px] border p-3',
            tone.border,
            tone.panelGradient,
            tone.shadowMedium
      ),
      orgExecutivePanel: cx(
            'rounded-[20px] border p-2.5',
            tone.border,
            tone.cardGradient,
            tone.shadowSoft
      ),
      orgUnitsPanel: cx(
            'rounded-[24px] border p-3',
            tone.border,
            tone.panelGradient,
            tone.shadowSoft
      ),
      orgUnitColumn: cx(
            'overflow-hidden rounded-[22px] border border-amber-200/38',
            'bg-[linear-gradient(35deg,rgba(255,251,235,0.74)_0%,rgba(245,158,11,0.22)_55%,rgba(12,10,9,0.18)_100%)] shadow-[0_16px_36px_rgba(12,10,9,0.10)]'
      ),
      orgUnitCard:
            'group relative overflow-hidden rounded-2xl p-2.5 bg-[linear-gradient(35deg,rgba(255,255,255,0.90)_0%,rgba(255,251,235,0.72)_42%,rgba(245,158,11,0.36)_72%,rgba(12,10,9,0.44)_100%)] shadow-[0_14px_34px_rgba(12,10,9,0.12),inset_0_1px_0_rgba(255,255,255,0.62),inset_0_-1px_0_rgba(251,191,36,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300/70 hover:shadow-[0_22px_54px_rgba(12,10,9,0.18),0_0_0_1px_rgba(251,191,36,0.18)]',
      orgPersonCard:
            'group relative overflow-hidden rounded-2xl border border-amber-200/45 p-2 bg-[linear-gradient(35deg,rgba(255,255,255,0.94)_0%,rgba(254,243,199,0.80)_34%,rgba(245,158,11,0.45)_64%,rgba(28,25,23,0.72)_100%)] shadow-[0_16px_38px_rgba(12,10,9,0.16),inset_0_1px_0_rgba(255,255,255,0.62),inset_0_-1px_0_rgba(251,191,36,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300/75 hover:shadow-[0_24px_62px_rgba(12,10,9,0.22),0_0_0_1px_rgba(251,191,36,0.20)]',
      orgPersonCardHead:
            'group relative overflow-hidden rounded-2xl border border-amber-200/50 p-2.5 bg-[linear-gradient(35deg,rgba(255,255,255,0.96)_0%,rgba(254,243,199,0.84)_30%,rgba(245,158,11,0.50)_62%,rgba(12,10,9,0.78)_100%)] shadow-[0_20px_48px_rgba(12,10,9,0.20),inset_0_1px_0_rgba(255,255,255,0.65),inset_0_-1px_0_rgba(251,191,36,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300/80 hover:shadow-[0_28px_70px_rgba(12,10,9,0.25),0_0_0_1px_rgba(251,191,36,0.24)]',
      orgPersonCardEmpty:
            'group relative overflow-hidden rounded-2xl border border-dashed border-amber-200/45 p-2 bg-[linear-gradient(35deg,rgba(255,255,255,0.62)_0%,rgba(255,251,235,0.44)_52%,rgba(120,53,15,0.10)_100%)] shadow-[0_8px_22px_rgba(12,10,9,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300/60 hover:bg-[linear-gradient(35deg,rgba(255,255,255,0.82)_0%,rgba(254,243,199,0.58)_54%,rgba(120,53,15,0.16)_100%)] hover:shadow-[0_14px_34px_rgba(12,10,9,0.12)]',
      orgPersonCardUnit:
            'group relative overflow-hidden rounded-xl border border-amber-100/45 p-1.5 bg-[linear-gradient(35deg,rgba(255,255,255,0.88)_0%,rgba(255,251,235,0.70)_42%,rgba(245,158,11,0.30)_72%,rgba(12,10,9,0.34)_100%)] shadow-[0_10px_26px_rgba(12,10,9,0.10),inset_0_1px_0_rgba(255,255,255,0.58)] transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300/60 hover:shadow-[0_18px_42px_rgba(12,10,9,0.16),0_0_0_1px_rgba(251,191,36,0.14)]',
      orgPersonCardGlow:
            'pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-100',
      orgPersonCardShine:
            'pointer-events-none absolute -right-10 -top-10 h-28 w-36 rounded-full bg-amber-300/34 blur-3xl transition-opacity duration-200 group-hover:opacity-100',
      orgPersonCardGoldBeam:
            'pointer-events-none absolute -bottom-10 -left-8 h-28 w-32 rounded-full bg-amber-300/28 blur-3xl opacity-90 transition-opacity duration-200 group-hover:opacity-100',
      orgPersonCardGloss:
            'pointer-events-none absolute inset-0 bg-[linear-gradient(35deg,transparent_0%,transparent_24%,rgba(255,255,255,0.10)_33%,rgba(255,255,255,0.70)_43%,rgba(255,255,255,0.22)_51%,transparent_64%,transparent_100%)] opacity-70 mix-blend-screen transition-opacity duration-200 group-hover:opacity-100',
      orgPersonCardGlossThin:
            'pointer-events-none absolute inset-0 bg-[linear-gradient(35deg,transparent_0%,transparent_48%,rgba(255,255,255,0.58)_50%,transparent_54%,transparent_100%)] opacity-42 mix-blend-screen transition-opacity duration-200 group-hover:opacity-75',
      orgPersonCardGlass:
            'pointer-events-none absolute inset-x-0 top-0 h-[58%] bg-[linear-gradient(180deg,rgba(255,255,255,0.46)_0%,rgba(255,255,255,0.17)_42%,transparent_100%)] opacity-92',
      orgPersonTitle:
            'text-center text-[11px] font-semibold normal-case tracking-normal text-slate-500 transition-colors group-hover:text-amber-800',
      orgPersonName:
            'mt-0.5 truncate text-center text-[14px] font-medium leading-5 text-slate-700 transition-colors group-hover:text-slate-900',
      orgPersonTitleUnit:
            'text-center text-[10px] font-semibold normal-case tracking-normal text-slate-400 transition-colors group-hover:text-amber-700',
      orgPersonNameUnit:
            'mt-0.5 truncate text-center text-[12px] font-medium leading-4 text-slate-600 transition-colors group-hover:text-slate-800',
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
