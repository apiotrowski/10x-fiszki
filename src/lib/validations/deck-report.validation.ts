import { z } from "zod";

/**
 * Validation schema for deck report query parameters
 * Validates the period parameter for filtering report data by time range
 */
export const deckReportQuerySchema = z.object({
  period: z
    .enum(["week", "month", "all"], {
      errorMap: () => ({ message: "Period musi być jednym z: 'week', 'month', 'all'" }),
    })
    .optional()
    .default("all"),
});

export type DeckReportQuery = z.infer<typeof deckReportQuerySchema>;
