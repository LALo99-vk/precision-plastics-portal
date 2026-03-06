const ONES = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
const TENS = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = TENS[Math.floor(n / 10)];
  const o = ONES[n % 10];
  return o ? `${t} ${o}` : t;
}

function threeDigits(n: number): string {
  if (n === 0) return '';
  if (n < 100) return twoDigits(n);
  const h = ONES[Math.floor(n / 100)];
  const rest = twoDigits(n % 100);
  return rest ? `${h} HUNDRED ${rest}` : `${h} HUNDRED`;
}

/**
 * Convert a number to Indian rupee words.
 * e.g. 77408 -> "RUPEES : SEVENTY SEVEN THOUSAND FOUR HUNDRED EIGHT ONLY"
 * Handles up to 99,99,99,999 (Indian numbering: lakh, crore).
 */
export function amountToWords(amount: number): string {
  if (amount === 0) return 'RUPEES : ZERO ONLY';

  const n = Math.round(Math.abs(amount));
  const parts: string[] = [];

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const remainder = n % 1000;

  if (crore > 0) parts.push(`${twoDigits(crore)} CRORE`);
  if (lakh > 0) parts.push(`${twoDigits(lakh)} LAKH`);
  if (thousand > 0) parts.push(`${twoDigits(thousand)} THOUSAND`);
  if (remainder > 0) parts.push(threeDigits(remainder));

  return `RUPEES : ${parts.join(' ')} ONLY`;
}
