/** Default is prelaunch. Production payments require an independently verified backend gate. */
export const IS_LIVE_STORE = false;
export type Currency = 'TWD' | 'USD' | 'THB';
export const CURRENCY_BY_LOCALE = {'zh-TW':'TWD', en:'USD', th:'THB'} as const;
/** Never derive USD/THB from TWD without approved regional price lists. */
export const APPROVED_REGIONAL_PRICES: Record<string, Partial<Record<Currency, number>>> = {};
