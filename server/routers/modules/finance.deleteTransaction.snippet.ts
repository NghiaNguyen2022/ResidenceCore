// Add this procedure inside financeRouter, after createTransaction and before recordPayment.
// This is a snippet because server/routers/modules/finance.ts in the repo may be minified into one long line.

deleteTransaction: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
            try {
                  return await financeDb.deleteFinanceTransaction(input);
            } catch (error) {
                  console.error('[finance.deleteTransaction] Error:', error);
                  throw new TRPCError({
                        code: 'BAD_REQUEST',
                        message:
                              error instanceof Error
                                    ? error.message
                                    : 'Không thể xóa khoản thu chi.',
                  });
            }
      }),
