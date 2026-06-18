export type ResidenceAppearanceTone =
      | 'premiumWarm'
      | 'softBlue'
      | 'sageGreen'
      | 'minimalSlate';

export type ResidenceAppearanceDensity = 'comfortable' | 'compact';
export type ResidenceAppearanceDepth = 'soft' | 'medium' | 'deep';
export type ResidenceAppearanceRadius = 'soft' | 'medium' | 'round';

export type ResidenceAppearanceConfig = {
      tone: ResidenceAppearanceTone;
      density: ResidenceAppearanceDensity;
      depth: ResidenceAppearanceDepth;
      radius: ResidenceAppearanceRadius;
};

export type ResidenceToneTokens = {
      pageGradient: string;
      panelGradient: string;
      sectionGradient: string;
      cardGradient: string;
      cardSoftGradient: string;
      primaryButtonGradient: string;
      primaryText: string;
      mutedText: string;
      accentText: string;
      border: string;
      softBorder: string;
      ring: string;
      chipIdle: string;
      chipCount: string;
      iconBubble: string;
      shadowSoft: string;
      shadowMedium: string;
      shadowDeep: string;
};

export const residenceAppearancePresets: Record<
      ResidenceAppearanceTone,
      ResidenceToneTokens
> = {
      premiumWarm: {
            pageGradient:
                  'bg-[linear-gradient(180deg,#fffdf9_0%,#fffaf4_35%,#f8fafc_100%)]',
            panelGradient:
                  'bg-[linear-gradient(135deg,#ffffff_0%,#fffdf8_62%,#fff5e8_100%)]',
            sectionGradient:
                  'bg-[linear-gradient(180deg,#ffffff_0%,#fffdfa_100%)]',
            cardGradient:
                  'bg-[linear-gradient(135deg,#ffffff_0%,#fffdfa_58%,#fff5ea_100%)]',
            cardSoftGradient:
                  'bg-[linear-gradient(180deg,#ffffff_0%,#fffaf2_100%)]',
            primaryButtonGradient:
                  'bg-[linear-gradient(180deg,#fff8ea_0%,#ffe9c8_100%)]',
            primaryText: 'text-slate-950',
            mutedText: 'text-slate-600',
            accentText: 'text-amber-950',
            border: 'border-amber-100/80',
            softBorder: 'border-amber-100',
            ring: 'ring-amber-100',
            chipIdle:
                  'bg-white/90 text-slate-600 ring-amber-100 hover:bg-white hover:text-slate-900',
            chipCount: 'bg-amber-50 text-amber-700',
            iconBubble:
                  'rounded-2xl border border-amber-100 bg-white/85 p-2.5 text-amber-800 shadow-sm shadow-amber-900/5',
            shadowSoft: 'shadow-[0_10px_24px_rgba(120,53,15,0.045)]',
            shadowMedium: 'shadow-[0_16px_36px_rgba(120,53,15,0.06)]',
            shadowDeep: 'shadow-[0_24px_70px_rgba(120,53,15,0.09)]',
      },
      softBlue: {
            pageGradient:
                  'bg-[linear-gradient(180deg,#fbfdff_0%,#f5f9ff_40%,#f8fafc_100%)]',
            panelGradient:
                  'bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_62%,#eef6ff_100%)]',
            sectionGradient:
                  'bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]',
            cardGradient:
                  'bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_58%,#eff6ff_100%)]',
            cardSoftGradient:
                  'bg-[linear-gradient(180deg,#ffffff_0%,#f4f8ff_100%)]',
            primaryButtonGradient:
                  'bg-[linear-gradient(180deg,#eef6ff_0%,#dbeafe_100%)]',
            primaryText: 'text-slate-950',
            mutedText: 'text-slate-600',
            accentText: 'text-blue-950',
            border: 'border-blue-100/80',
            softBorder: 'border-blue-100',
            ring: 'ring-blue-100',
            chipIdle:
                  'bg-white/90 text-slate-600 ring-blue-100 hover:bg-white hover:text-slate-900',
            chipCount: 'bg-blue-50 text-blue-700',
            iconBubble:
                  'rounded-2xl border border-blue-100 bg-white/85 p-2.5 text-blue-800 shadow-sm shadow-blue-900/5',
            shadowSoft: 'shadow-[0_10px_24px_rgba(30,64,175,0.04)]',
            shadowMedium: 'shadow-[0_16px_36px_rgba(30,64,175,0.055)]',
            shadowDeep: 'shadow-[0_24px_70px_rgba(30,64,175,0.08)]',
      },
      sageGreen: {
            pageGradient:
                  'bg-[linear-gradient(180deg,#fcfffb_0%,#f5fbf4_38%,#f8fafc_100%)]',
            panelGradient:
                  'bg-[linear-gradient(135deg,#ffffff_0%,#fbfef9_62%,#eef9ed_100%)]',
            sectionGradient:
                  'bg-[linear-gradient(180deg,#ffffff_0%,#fbfef9_100%)]',
            cardGradient:
                  'bg-[linear-gradient(135deg,#ffffff_0%,#fbfef9_58%,#eff9ed_100%)]',
            cardSoftGradient:
                  'bg-[linear-gradient(180deg,#ffffff_0%,#f6fbf4_100%)]',
            primaryButtonGradient:
                  'bg-[linear-gradient(180deg,#f1faef_0%,#dcfce7_100%)]',
            primaryText: 'text-slate-950',
            mutedText: 'text-slate-600',
            accentText: 'text-emerald-950',
            border: 'border-emerald-100/80',
            softBorder: 'border-emerald-100',
            ring: 'ring-emerald-100',
            chipIdle:
                  'bg-white/90 text-slate-600 ring-emerald-100 hover:bg-white hover:text-slate-900',
            chipCount: 'bg-emerald-50 text-emerald-700',
            iconBubble:
                  'rounded-2xl border border-emerald-100 bg-white/85 p-2.5 text-emerald-800 shadow-sm shadow-emerald-900/5',
            shadowSoft: 'shadow-[0_10px_24px_rgba(6,95,70,0.04)]',
            shadowMedium: 'shadow-[0_16px_36px_rgba(6,95,70,0.055)]',
            shadowDeep: 'shadow-[0_24px_70px_rgba(6,95,70,0.08)]',
      },
      minimalSlate: {
            pageGradient:
                  'bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_48%,#f1f5f9_100%)]',
            panelGradient:
                  'bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_62%,#f1f5f9_100%)]',
            sectionGradient:
                  'bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]',
            cardGradient:
                  'bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_58%,#f1f5f9_100%)]',
            cardSoftGradient:
                  'bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]',
            primaryButtonGradient:
                  'bg-[linear-gradient(180deg,#f8fafc_0%,#e2e8f0_100%)]',
            primaryText: 'text-slate-950',
            mutedText: 'text-slate-600',
            accentText: 'text-slate-950',
            border: 'border-slate-200/80',
            softBorder: 'border-slate-200',
            ring: 'ring-slate-200',
            chipIdle:
                  'bg-white/90 text-slate-600 ring-slate-200 hover:bg-white hover:text-slate-900',
            chipCount: 'bg-slate-100 text-slate-700',
            iconBubble:
                  'rounded-2xl border border-slate-200 bg-white/85 p-2.5 text-slate-800 shadow-sm shadow-slate-900/5',
            shadowSoft: 'shadow-[0_10px_24px_rgba(15,23,42,0.035)]',
            shadowMedium: 'shadow-[0_16px_36px_rgba(15,23,42,0.05)]',
            shadowDeep: 'shadow-[0_24px_70px_rgba(15,23,42,0.07)]',
      },
};

export const defaultResidenceAppearanceConfig: ResidenceAppearanceConfig = {
      tone: 'premiumWarm',
      density: 'comfortable',
      depth: 'medium',
      radius: 'soft',
};

export function getResidenceToneTokens(
      config: ResidenceAppearanceConfig = defaultResidenceAppearanceConfig
) {
      return residenceAppearancePresets[config.tone] || residenceAppearancePresets.premiumWarm;
}

export function getDensityTokens(config: ResidenceAppearanceConfig) {
      return config.density === 'compact'
            ? {
                    pageShell: 'mx-auto max-w-[1420px] space-y-4 px-2 pb-6',
                    sectionBody: 'p-3',
                    cardPadding: 'p-3',
              }
            : {
                    pageShell: 'mx-auto max-w-[1420px] space-y-5 px-2 pb-8',
                    sectionBody: 'p-3 sm:p-4',
                    cardPadding: 'p-4',
              };
}

export function getRadiusTokens(config: ResidenceAppearanceConfig) {
      if (config.radius === 'medium') {
            return {
                  panel: 'rounded-[22px]',
                  card: 'rounded-2xl',
                  button: 'rounded-xl',
            };
      }

      if (config.radius === 'round') {
            return {
                  panel: 'rounded-[30px]',
                  card: 'rounded-3xl',
                  button: 'rounded-2xl',
            };
      }

      return {
            panel: 'rounded-[26px]',
            card: 'rounded-3xl',
            button: 'rounded-xl',
      };
}
