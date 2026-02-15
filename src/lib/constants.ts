export const CARD_VALUES = ['0', '1', '2', '3', '5', '8', '13', '21', '?'] as const;

export type CardValue = (typeof CARD_VALUES)[number];
