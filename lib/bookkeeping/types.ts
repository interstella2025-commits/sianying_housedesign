export const BK_PAYMENT_METHODS = ["現金", "匯款", "支票", "其他"] as const;

export const BK_PAYMENT_STAGES = ["訂金", "期中款", "尾款", "追加款", "保留款", "其他"] as const;

export const BK_PROJECT_STATUSES = ["進行中", "已完工", "已結案"] as const;

export const BK_PAYMENT_STATUSES = ["未付款", "部分付款", "已結清"] as const;

export const BK_CLIENT_INVOICE_STATUSES = ["不需", "待開", "已開"] as const;

export const BK_TAX_STATUSES = ["不適用", "待繳", "已繳"] as const;

export const BK_VENDOR_INVOICE_STATUSES = ["不需", "待收", "已收到"] as const;

export const BK_VENDOR_TAX_MODES = ["應稅", "免稅"] as const;

export const BK_VENDOR_TAXABLE_INVOICE_STATUSES = ["待收", "已收到"] as const;

export const BK_INVOICE_TAX_MODES = ["不開", "內含", "外加"] as const;

export const BK_INCOME_CATEGORIES = ["設計費", "工程款", "預付款"] as const;

export type BkPaymentMethod = (typeof BK_PAYMENT_METHODS)[number];
export type BkPaymentStage = (typeof BK_PAYMENT_STAGES)[number];
export type BkProjectStatus = (typeof BK_PROJECT_STATUSES)[number];
export type BkPaymentStatus = (typeof BK_PAYMENT_STATUSES)[number];
export type BkClientInvoiceStatus = (typeof BK_CLIENT_INVOICE_STATUSES)[number];
export type BkTaxStatus = (typeof BK_TAX_STATUSES)[number];
export type BkVendorInvoiceStatus = (typeof BK_VENDOR_INVOICE_STATUSES)[number];
export type BkVendorTaxMode = (typeof BK_VENDOR_TAX_MODES)[number];
export type BkVendorTaxableInvoiceStatus = (typeof BK_VENDOR_TAXABLE_INVOICE_STATUSES)[number];
export type BkInvoiceTaxMode = (typeof BK_INVOICE_TAX_MODES)[number];
export type BkIncomeCategory = (typeof BK_INCOME_CATEGORIES)[number];

export type BkProject = {
  id: string;
  name: string;
  client_name: string | null;
  client_phone: string | null;
  client_tax_id: string | null;
  client_invoice_tax_mode: BkInvoiceTaxMode;
  client_invoice_no: string | null;
  design_invoice_tax_mode: BkInvoiceTaxMode;
  design_invoice_no: string | null;
  prepayment_invoice_tax_mode: BkInvoiceTaxMode;
  prepayment_invoice_no: string | null;
  address: string | null;
  design_fee_amount: number;
  prepayment_amount: number;
  contract_amount: number;
  status: BkProjectStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type BkProjectIncome = {
  id: string;
  project_id: string;
  income_category: BkIncomeCategory;
  received_date: string;
  amount: number;
  payment_method: BkPaymentMethod;
  reference_no: string | null;
  invoice_tax_mode: BkInvoiceTaxMode;
  client_invoice_status: BkClientInvoiceStatus;
  client_invoice_no: string | null;
  tax_status: BkTaxStatus;
  tax_amount: number | null;
  tax_paid_date: string | null;
  note: string | null;
  created_at: string;
};

export type BkVendor = {
  id: string;
  name: string;
  trade: string | null;
  contact_name: string | null;
  phone: string | null;
  tax_id: string | null;
  bank_info: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type BkProjectExpense = {
  id: string;
  project_id: string;
  vendor_id: string;
  expense_date: string;
  trade: string;
  description: string | null;
  payable_net_amount: number | null;
  payable_amount: number;
  due_date: string | null;
  payment_stage: BkPaymentStage | null;
  invoice_no: string | null;
  invoice_amount: number | null;
  vendor_tax_mode: BkVendorTaxMode;
  vendor_invoice_status: BkVendorInvoiceStatus;
  vendor_invoice_note: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type BkExpensePayment = {
  id: string;
  expense_id: string;
  paid_date: string;
  amount: number;
  payment_method: BkPaymentMethod;
  reference_no: string | null;
  note: string | null;
  created_at: string;
};

export type BkExpenseWithPayments = BkProjectExpense & {
  payments: BkExpensePayment[];
  paid_amount: number;
  unpaid_balance: number;
  payment_status: BkPaymentStatus;
  vendor_name?: string;
  project_name?: string;
};

export type BkProjectSummary = {
  income_total: number;
  client_unpaid: number;
  expense_payable_total: number;
  expense_paid_total: number;
  payable_now: number;
  estimated_gross_profit: number;
  cash_balance: number;
};

export type BkProjectListItem = BkProject & BkProjectSummary;

export type BkVendorSummary = {
  payable_total: number;
  paid_total: number;
  payable_now: number;
  project_count: number;
};

export type BkVendorListItem = BkVendor & BkVendorSummary;

export type BkVendorProjectPaymentLine = {
  paid_date: string;
  amount: number;
};

export type BkVendorProjectGroup = {
  project_id: string;
  project_name: string;
  trade: string;
  payable_total: number;
  paid_total: number;
  unpaid_balance: number;
  payment_stage: BkPaymentStage | null;
  payment_lines: BkVendorProjectPaymentLine[];
  payment_status: BkPaymentStatus;
  expenses: BkExpenseWithPayments[];
};

export type BkBookkeepingStore = {
  projects: BkProject[];
  project_incomes: BkProjectIncome[];
  vendors: BkVendor[];
  project_expenses: BkProjectExpense[];
  expense_payments: BkExpensePayment[];
};
