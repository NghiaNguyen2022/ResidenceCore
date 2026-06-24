'use client';

import { Route } from 'wouter';

import FinanceLite from '@/pages/FinanceLite';

export const financeRoutePath = '/finance';

export function FinanceRouteFragment() {
      return <Route path={financeRoutePath} component={FinanceLite} />;
}

export default FinanceRouteFragment;
