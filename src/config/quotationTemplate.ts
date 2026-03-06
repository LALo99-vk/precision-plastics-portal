/**
 * Proforma invoice template -- company details, bank info, terms.
 * Edit these values to match your branding. Used by generateQuotationPdf.ts.
 */
export const quotationTemplate = {
  companyName: 'NYLOKING & CO .,',
  companyTagline: 'HOUSE OF ENGINEERING PLASTICS',
  companyAddress: 'Factory & Office : No. 161/1, S.P. Road Bengaluru-560002 Karnataka, India,',
  companyPhone: 'Mobile : 9448354795 222234795 / 22224200',
  companyEmail: 'nylokingandco@gmail.com',
  companyWebsite: 'www.nitinenterprise.com',
  gstin: '29AABFN2443F1ZH',
  state: 'KARNATAKA',
  stateCode: 29,
  panNo: 'AAQPA3577J',
  msme: 'UDYAM-GJ-01-0042957',
  logoPath: '/logo/mainlogo.png',

  banks: [
    {
      bankName: 'HDFC BANK',
      accountNo: '99909824032127',
      ifsc: 'HDFC0000300',
      branch: 'MANINAGAR.',
    },
    {
      bankName: 'BANK OF BARODA',
      accountNo: '36590200000031',
      ifsc: 'BARB0SCIAHM',
      branch: 'SCIENCE CITY ROAD.',
    },
  ],

  terms: [
    '# We are not responsible for any brekage, damage or loss in transit.',
    '# Our responsibility\'s ceases the moment\'s good leave our premises.',
    '# Subject to Ahmedabad Jurisdiction.',
  ],

  defaultRemark: '100% ADVANCE @ P.I.',

  units: ['NOS', 'KG', 'MTR', 'SET', 'PCS', 'LTR', 'SQM', 'PAIR'] as const,
} as const;

export type QuotationTemplate = typeof quotationTemplate;
