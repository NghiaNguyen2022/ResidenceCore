'use client';

import { Route } from 'wouter';

import FinanceLite from '@/pages/FinanceLite';

export function FinanceRoutes() {
      return <Route path="/finance" component={FinanceLite} />;
}

export default FinanceRoutes;
