import { useState, useEffect } from "react";

// ── Theme ───────────────────────────────────
const C = {
  bg: "#faf9f6",
  surface: "#ffffff",
  surfaceHover: "#f5f4f1",
  border: "#e2e0db",
  borderStrong: "#ccc9c2",
  text: "#1a1a1a",
  textMid: "#4a4a4a",
  textLight: "#8a8780",
  accent: "#2b5797",
  accentBg: "rgba(43,87,151,0.08)",
  accentBorder: "rgba(43,87,151,0.25)",
  green: "#2d7a3a",
  greenBg: "rgba(45,122,58,0.08)",
  greenBorder: "rgba(45,122,58,0.25)",
  red: "#c03030",
  redBg: "rgba(192,48,48,0.08)",
  mono: "'SF Mono', 'Fira Code', 'Consolas', monospace",
};

// ── VAT Schemes ───────────────────────────────────
const VAT_SCHEMES = [
  { key: "standard", label: "Standard VAT", desc: "Normal input/output VAT accounting" },
  { key: "flat_rate", label: "Flat Rate Scheme", desc: "Fixed % of gross turnover, limited input VAT recovery" },
  { key: "cash", label: "Cash Accounting", desc: "VAT based on payments received/made, not invoices" },
];

// ── Document types for VAT ───────────────────────────────────
const VAT_DOCUMENTS = [
  { key: "clientSS", label: "Client's VAT spreadsheet", critical: true },
  { key: "bankStatements", label: "Bank statement(s) for the quarter" },
  { key: "salesInvoices", label: "Sales invoices / income records" },
  { key: "purchaseInvoices", label: "Purchase invoices / expense receipts" },
  { key: "clientNotes", label: "Client notes / emails about the quarter" },
  { key: "cisStatements", label: "CIS statements (construction industry)" },
  { key: "importExport", label: "Import/export documentation" },
];

// ── Sync checklist ───────────────────────────────────
const SYNC_ITEMS = [
  { key: "folder", label: "Client VAT folder is available offline in Finder (green tick visible)" },
  { key: "xlsx", label: "Client's spreadsheet is in .xlsx format (not .gsheet)" },
  { key: "irisTemplate", label: "IRIS VAT Template - Bridging.xlsx is in the Cowork Templates folder (Shared Drive)" },
  { key: "supporting", label: "Any supporting documents are in the folder (bank statements, invoices)" },
  { key: "cowork", label: "Claude Desktop is open and set to Cowork mode" },
];

// ── Wizard steps ───────────────────────────────────
const STEPS = [
  { id: "client", title: "Client & Period", icon: "01" },
  { id: "scheme", title: "VAT Scheme", icon: "02" },
  { id: "documents", title: "Documents", icon: "03" },
  { id: "rules", title: "Client Rules", icon: "04" },
  { id: "sync", title: "Sync Checklist", icon: "05" },
  { id: "prompt", title: "Your Prompt", icon: "06" },
];

const EMPTY_DATA = {
  client: "",
  vatNumber: "",
  vatScheme: "standard",
  flatRatePercent: "",
  clientYEMonth: "3",
  endMonth: "",
  endYear: "",
  periodLabel: "",
  periodFrom: "",
  periodTo: "",
  mtd: false,
  comparePrev: true,
  preparedBy: "",
  documents: {},
  rules: {
    zeroRated: "",
    exempt: "",
    partialExemption: false,
    reverseCharge: false,
    cisDeductions: false,
    other: "",
  },
  syncChecked: {},
};

// ── Preloaded clients from Senta ───────────────────────────────────
const PRELOADED_CLIENTS = [
  { name: "Alister Bowen", vatNumber: "402760918", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Andrew, Diane & Amy James", vatNumber: "794373978", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Cleddau Cleaning Ltd", vatNumber: "194765557", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "2", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "David & Kaye James", vatNumber: "477840113", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Dr John Beer", vatNumber: "810888517", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "DT Plant", vatNumber: "901226472", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Edward & Emma de Waal Trading as Whitesands Bay Cottages", vatNumber: "430821819", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "GRUB.FOOD.PEMBS LTD", vatNumber: "426928077", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "1", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Halton & Davies", vatNumber: "891544400", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Jeffrey Brown", vatNumber: "557822219", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Keith Norman", vatNumber: "485003263", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Liam J Logan", vatNumber: "407987064", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Lilac Laundry & Cleaning Ltd", vatNumber: "453914874", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Merry Bros (partnership)", vatNumber: "821920155", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Messrs Atherton", vatNumber: "666643013", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Morgan, Deep Lake Farm", vatNumber: "9901052295", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Narberth Energy Ltd", vatNumber: "210629541", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Newbridge Nursery", vatNumber: "879988415", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "OKTOBERFEST EVENTS LTD", vatNumber: "474511785", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Palin Construction", vatNumber: "885870367", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Pentlepoir Car Sales", vatNumber: "485124149", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Peter & Pam Thomas", vatNumber: "840827621", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "RJ Solutions Ltd.", vatNumber: "314548117", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Robin & Sally Amoore", vatNumber: "442385060", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Roy & Emma Jenkins", vatNumber: "558077708", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Sea-land Pembroke Ltd", vatNumber: "558209524", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "7", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Shipping Developments", vatNumber: "377396934", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Skycam Contracts", vatNumber: "779260882", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Telecomms Facilities Ltd", vatNumber: "431716568", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "TENBY TAXIS", vatNumber: "401885069", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "The Village Wine Shop", vatNumber: "366620642", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Thomas Engineering", vatNumber: "124602505", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Thomas Fisheries", vatNumber: "647770209", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Thomas Morris", vatNumber: "122554300", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Tony & Majella Thomas", vatNumber: "439525375", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Torri Tir Ltd", vatNumber: "879574549", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "10", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Utopia / The Barbers", vatNumber: "771761217", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
  { name: "Will's formerly known as Blueberry's", vatNumber: "931015762", vatScheme: "standard", flatRatePercent: "", clientYEMonth: "3", mtd: false, defaultRules: { zeroRated: "", exempt: "", partialExemption: false, reverseCharge: false, cisDeductions: false, other: "" } },
];

// ── Period helper ───────────────────────────────────
const MONTHS = [
  { key: 1, label: "January", short: "Jan", days: 31 },
  { key: 2, label: "February", short: "Feb", days: 28 },
  { key: 3, label: "March", short: "Mar", days: 31 },
  { key: 4, label: "April", short: "Apr", days: 30 },
  { key: 5, label: "May", short: "May", days: 31 },
  { key: 6, label: "June", short: "Jun", days: 30 },
  { key: 7, label: "July", short: "Jul", days: 31 },
  { key: 8, label: "August", short: "Aug", days: 31 },
  { key: 9, label: "September", short: "Sep", days: 30 },
  { key: 10, label: "October", short: "Oct", days: 31 },
  { key: 11, label: "November", short: "Nov", days: 30 },
  { key: 12, label: "December", short: "Dec", days: 31 },
];

function getYearOptions() {
  return [2026, 2025];
}

function derivePeriodDates(endMonth, endYear) {
  if (!endMonth || !endYear) return { from: "", to: "", label: "", fromNatural: "", toNatural: "" };
  const m = parseInt(endMonth);
  const y = parseInt(endYear);
  const monthInfo = MONTHS.find(mo => mo.key === m);
  // Handle Feb leap year
  let lastDay = monthInfo.days;
  if (m === 2 && ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0)) lastDay = 29;
  // Quarter ending = last day of selected month, starting 3 months prior
  let startMonth = m - 2;
  let startYear = y;
  if (startMonth <= 0) { startMonth += 12; startYear -= 1; }
  const from = `${startYear}-${String(startMonth).padStart(2, "0")}-01`;
  const to = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const label = `QE ${monthInfo.label} ${y}`;
  // Natural UK date format
  const startMonthInfo = MONTHS.find(mo => mo.key === startMonth);
  const ordinal = (n) => { const s = ["th","st","nd","rd"]; const v = n % 100; return n + (s[(v-20)%10] || s[v] || s[0]); };
  const fromNatural = `${ordinal(1)} ${startMonthInfo.label} ${startYear}`;
  const toNatural = `${ordinal(lastDay)} ${monthInfo.label} ${y}`;
  return { from, to, label, fromNatural, toNatural };
}

// ── Prompt generation ───────────────────────────────────
function generatePrompt(data) {
  const { client, vatNumber, vatScheme, flatRatePercent, clientYEMonth, periodLabel, periodFrom, periodTo, mtd, comparePrev, preparedBy, endMonth, endYear, documents, rules } = data;

  const scheme = VAT_SCHEMES.find(s => s.key === vatScheme);
  const docList = VAT_DOCUMENTS.filter(d => documents[d.key] === "yes").map(d => d.label).join(", ");
  const partialDocs = VAT_DOCUMENTS.filter(d => documents[d.key] === "partial").map(d => d.label);

  let prompt = `You are reviewing a VAT return for a UK client. Your role is to review the client's own spreadsheet, cross-check it against any supporting documents provided, identify errors or issues, and populate the IRIS VAT Template with the reviewed figures ready for submission via bridging software.\n\n`;
  prompt += `Client: ${client || "[client name]"}\n`;
  if (vatNumber) prompt += `VAT registration number: ${vatNumber}\n`;
  prompt += `Period: ${periodLabel || ""}${periodFrom && periodTo ? ` (${periodFrom} to ${periodTo})` : ""}\n`;
  prompt += `VAT scheme: ${scheme ? scheme.label : vatScheme}\n`;
  if (vatScheme === "flat_rate" && flatRatePercent) prompt += `Flat rate percentage: ${flatRatePercent}%\n`;
  if (mtd) prompt += `This period falls under Making Tax Digital (MTD) for VAT.\n`;
  if (preparedBy) prompt += `Prepared by: ${preparedBy}\n`;

  const folderPath = buildFolderPath(client, endMonth, endYear, clientYEMonth);
  if (folderPath) prompt += `\nWorking folder: ${folderPath}\nAll input files are in this folder. All output files (populated IRIS template, Cowork_Notes) must be saved back to this same folder.\n`;

  prompt += `\nDocuments provided: ${docList || "None specified"}\n`;
  if (partialDocs.length > 0) prompt += `Partial/incomplete: ${partialDocs.join(", ")}\n`;

  // Step 0 — Folder organisation
  prompt += `\n--- INSTRUCTIONS ---\n\n`;
  prompt += `Step 0 — Folder Organisation\n`;
  prompt += `Open the client's VAT folder. Confirm the following files are present and readable:\n`;
  VAT_DOCUMENTS.filter(d => documents[d.key] === "yes" || documents[d.key] === "partial").forEach(d => {
    prompt += `• ${d.label}${documents[d.key] === "partial" ? " (partial — flag gaps)" : ""}\n`;
  });
  prompt += `• IRIS VAT Template - Bridging.xlsx (from the Cowork Templates folder in the Shared Drive) — this is the output template you will populate\n`;
  prompt += `If any expected files are missing, note this in your review and proceed with what is available.\n`;
  prompt += `Make a copy of the IRIS VAT Template and name it: ${client || "[client]"}_VAT_${periodLabel || "[period]"}.xlsx — all your output goes into this copy.\n`;

  // Step 1 — Read the client spreadsheet
  prompt += `\nStep 1 — Read the Client Spreadsheet\n`;
  prompt += `Open the client's VAT spreadsheet. This is their own format — it may not be structured in a standard way. Your job is to interpret it and understand:\n`;
  prompt += `• What columns/rows represent sales/income\n`;
  prompt += `• What columns/rows represent purchases/expenses\n`;
  prompt += `• How VAT amounts are recorded (separate column, included in gross, calculated by formula)\n`;
  prompt += `• Whether the spreadsheet covers the full period ${periodFrom ? `(${periodFrom} to ${periodTo})` : ""}\n`;
  prompt += `• Any running totals, summaries, or notes the client has included\n`;
  prompt += `Produce a brief summary of the spreadsheet structure before proceeding.\n`;

  // Step 2 — VAT scheme specific review
  prompt += `\nStep 2 — Review Against VAT Scheme Rules\n`;
  if (vatScheme === "standard") {
    prompt += `This client is on Standard VAT accounting. Review for:\n`;
    prompt += `• Output VAT: check all sales are correctly VAT-rated (standard 20%, reduced 5%, zero-rated, exempt)\n`;
    prompt += `• Input VAT: check all purchase VAT claims are valid and supported\n`;
    prompt += `• Any items where VAT treatment looks incorrect or unclear — flag these\n`;
    prompt += `• Any transactions that appear to be outside the period\n`;
  } else if (vatScheme === "flat_rate") {
    prompt += `This client is on the Flat Rate Scheme (${flatRatePercent || "[?]"}%). Review for:\n`;
    prompt += `• Gross turnover (VAT-inclusive) for the period — this is the base for the flat rate calculation\n`;
    prompt += `• Apply ${flatRatePercent || "[?]"}% to gross turnover to calculate VAT due\n`;
    prompt += `• Check for any capital asset purchases over £2,000 (input VAT can be reclaimed on these even under FRS)\n`;
    prompt += `• Do NOT claim input VAT on ordinary purchases — this is not allowed under FRS\n`;
    prompt += `• Check the client hasn't accidentally claimed input VAT\n`;
  } else if (vatScheme === "cash") {
    prompt += `This client is on Cash Accounting. Review for:\n`;
    prompt += `• Only include sales where payment was RECEIVED in the period\n`;
    prompt += `• Only include purchases where payment was MADE in the period\n`;
    prompt += `• Check against bank statements to verify actual cash movements\n`;
    prompt += `• Flag any invoices in the spreadsheet that may not have been paid/received yet\n`;
  }

  // Step 3 — Cross-check against supporting documents
  if (documents.bankStatements === "yes" || documents.salesInvoices === "yes" || documents.purchaseInvoices === "yes") {
    prompt += `\nStep 3 — Cross-Check Against Supporting Documents\n`;
    if (documents.bankStatements === "yes") {
      prompt += `• Compare the spreadsheet entries against the bank statement(s). Flag any significant entries in the bank that don't appear in the spreadsheet, or vice versa.\n`;
    }
    if (documents.salesInvoices === "yes") {
      prompt += `• Spot-check sales invoices against the spreadsheet — do key amounts match?\n`;
    }
    if (documents.purchaseInvoices === "yes") {
      prompt += `• Spot-check purchase invoices — verify VAT amounts are correctly extracted.\n`;
    }
    prompt += `You don't need to reconcile every line item — focus on material differences and obvious errors.\n`;
  } else {
    prompt += `\nStep 3 — No supporting documents provided for cross-checking. Note this limitation in your review.\n`;
  }

  // Step 4 — Populate IRIS VAT Template
  prompt += `\nStep 4 — Populate the IRIS VAT Template\n`;
  prompt += `Open the copy of the IRIS VAT Template you created in Step 0. This workbook has four sheets: Notes, VAT Return, Sales, and Purchases. The VAT Return sheet calculates Box 1–9 automatically from the Sales and Purchases sheets via formulas — do NOT edit the VAT Return sheet directly.\n\n`;

  prompt += `Notes sheet:\n`;
  prompt += `• Cell A1: Client name (${client || "[client name]"})\n`;
  prompt += `• Cell A2: Quarter ending (QE ${periodTo || "[end date]"})\n`;
  prompt += `• Rows 6 onward: Use the queries table (columns A–D: #, Subject, Query, Clearing comment) to record any queries raised during your review. Number them sequentially.\n\n`;

  prompt += `VAT Return sheet:\n`;
  prompt += `• Cell C7: VAT registration number (${vatNumber || "[VAT number]"})\n`;
  prompt += `• Cell C8: VAT scheme ("${scheme ? scheme.label : "Accrual Scheme"}"${vatScheme === "cash" ? " — note: use Cash Accounting" : ""})\n`;
  prompt += `• Do NOT edit any other cells on this sheet — Boxes 1–9 are calculated by formulas from the Sales and Purchases sheets.\n\n`;

  prompt += `Sales sheet (Output VAT):\n`;
  prompt += `• One row per sales invoice/transaction, starting from row 8.\n`;
  prompt += `• Columns: A = Invoice No, B = Invoice Date, C = Customer Name, D = Description, E = Gross Invoice Amount, F = VAT Amount, G = Zero Rated net, H = Net at 5%, I = Net at 12.5%, J = Net at 20%.\n`;
  prompt += `• Column L (VAT Calcs) and Column M (Adding) are check formulas — do not edit these, they verify your figures.\n`;
  prompt += `• Row 18 contains totals (formulas) — do not edit. If you have more than 10 sales lines, insert rows ABOVE row 18 and copy the formulas down.\n`;
  prompt += `• For each sale from the client's spreadsheet, determine the correct VAT rate and place the net amount in the appropriate rate column (G, H, I, or J). The VAT amount goes in column F. The gross amount goes in column E.\n\n`;

  prompt += `Purchases sheet (Input VAT):\n`;
  prompt += `• One row per purchase invoice/expense, starting from row 9.\n`;
  prompt += `• Columns: A = Invoice No (or sequential number), B = Invoice Date, C = Supplier Name, D = Description, E = Gross Invoice Amount, F = VAT Amount, G = Zero Rated net, H = Net at 5%, I = Net at 12.5%, J = Net at 20%, K = Exempt.\n`;
  prompt += `• Column L (VAT Calcs) and Column M (Adding) are check formulas — do not edit these.\n`;
  prompt += `• Row 53 contains totals (formulas) — do not edit. The template has room for approximately 45 purchase lines. If you need more, insert rows ABOVE row 53 and copy the formulas down.\n`;
  prompt += `• For each purchase from the client's spreadsheet, determine the correct VAT rate and place the net amount in the appropriate rate column. The VAT amount goes in column F. The gross amount goes in column E.\n\n`;

  if (vatScheme === "flat_rate") {
    prompt += `IMPORTANT — Flat Rate Scheme adjustments:\n`;
    prompt += `• Under FRS, the Sales sheet should still show all sales at their actual VAT rates for the gross/net breakdown.\n`;
    prompt += `• Box 1 on the VAT Return will need manual adjustment: it should be ${flatRatePercent || "[?]"}% × total gross turnover (including VAT), not the sum of output VAT from the Sales sheet.\n`;
    prompt += `• Box 6 under FRS = gross turnover INCLUDING VAT (different from standard scheme).\n`;
    prompt += `• Box 4: only claim input VAT on capital assets over £2,000. Clear the Purchases sheet VAT column for all other purchases.\n`;
    prompt += `• Flag this clearly in the Notes sheet so the reviewer knows to check the Box 1 override.\n\n`;
  }

  prompt += `After populating, verify:\n`;
  prompt += `• The check columns (L and M) on both Sales and Purchases sheets show no discrepancies (VAT Calcs should be zero or near-zero, Adding should be zero).\n`;
  prompt += `• The VAT Return sheet Box 1–9 figures look reasonable.\n`;
  prompt += `• Box 5 (net VAT) makes sense given the client's business.\n`;

  // Step 5 — Comparison with previous period
  if (comparePrev) {
    const prevPath = buildPrevQuarterPath(client, endMonth, endYear, clientYEMonth);
    prompt += `\n\nStep 5 — Period-on-Period Comparison\n`;
    prompt += `Navigate to the previous quarter's folder: ${prevPath}\n`;
    prompt += `Find the completed IRIS VAT Template or Cowork_Notes from that quarter. Compare the Box 1–9 figures with this period's figures. Flag any significant variances (±20% or more on any box) and provide a brief explanation of likely causes. Record these in the Notes sheet.\n`;
    prompt += `If the previous quarter's folder doesn't exist or contains no completed return, note this and skip the comparison.\n`;
  }

  // Client-specific rules
  const ruleLines = [];
  if (rules.zeroRated) ruleLines.push(`Zero-rated items: ${rules.zeroRated}`);
  if (rules.exempt) ruleLines.push(`Exempt supplies: ${rules.exempt}`);
  if (rules.partialExemption) ruleLines.push("This client has partial exemption — calculate the recoverable proportion of input VAT using the standard method unless otherwise noted. Adjust Box 4 accordingly and document the calculation in the Notes sheet.");
  if (rules.reverseCharge) ruleLines.push("Reverse charge applies to some supplies — check for construction industry or other domestic reverse charge scenarios. For reverse charge items: include the VAT in both Box 1 (output) and Box 4 (input) so it nets to zero, and include the net value in both Box 6 and Box 7.");
  if (rules.cisDeductions) ruleLines.push("CIS deductions apply — ensure CIS-suffered amounts are separately identified in the Notes sheet for offset against the client's own PAYE/NI liability. Do not treat CIS deductions as input VAT.");
  if (rules.other) ruleLines.push(rules.other);

  if (ruleLines.length > 0) {
    prompt += `\nClient-specific rules:\n${ruleLines.map(r => `• ${r}`).join("\n")}\n`;
  }

  // Final step — Cowork Notes
  const lastStep = comparePrev ? 6 : 5;
  prompt += `\nStep ${lastStep} — Produce Cowork_Notes\n`;
  prompt += `Create a Cowork_Notes document in the client's VAT folder containing:\n`;
  prompt += `• Client name, VAT number, period\n`;
  prompt += `• Summary of the client's spreadsheet structure (so the next reviewer understands their format)\n`;
  prompt += `• Confirmation that the IRIS VAT Template has been populated: ${client || "[client]"}_VAT_${periodLabel || "[period]"}.xlsx\n`;
  prompt += `• Box 1–9 figures as calculated by the template (for quick reference)\n`;
  prompt += `• List of queries raised (matching the Notes sheet in the template)\n`;
  prompt += `• List of adjustments made (anything you corrected or reclassified from the client's original)\n`;
  prompt += `• Any items you were unable to classify — these need human review before submission\n`;
  prompt += `• Any notes relevant to MTD compliance${mtd ? " (this period is under MTD)" : ""}\n`;
  prompt += `• Flags for the reviewer's attention\n`;

  return prompt;
}

// ── Folder path derivation ───────────────────────────────────
function deriveYEFolder(qeMonth, qeYear, clientYEMonth) {
  if (!qeMonth || !qeYear || !clientYEMonth) return { yeLabel: "", qeLabel: "" };
  const qm = parseInt(qeMonth);
  const qy = parseInt(qeYear);
  const yem = parseInt(clientYEMonth);
  const monthInfo = MONTHS.find(mo => mo.key === yem);
  // Work out which YE this quarter falls under
  // If the QE month is after the YE month, the YE year is the following year
  // e.g. QE June 2025 with YE March → YE March 2026
  // QE March 2026 with YE March → YE March 2026
  let yeYear = qy;
  if (qm > yem) yeYear = qy + 1;
  const qeMonthInfo = MONTHS.find(mo => mo.key === qm);
  return {
    yeLabel: `YE ${monthInfo.label} ${yeYear}`,
    qeLabel: `QE ${qeMonthInfo.label} ${qy}`,
  };
}

function buildFolderPath(clientName, qeMonth, qeYear, clientYEMonth) {
  if (!clientName || !qeMonth || !qeYear || !clientYEMonth) return "";
  const { yeLabel, qeLabel } = deriveYEFolder(qeMonth, qeYear, clientYEMonth);
  if (!yeLabel || !qeLabel) return "";
  return `${clientName} / VAT / ${yeLabel} / ${qeLabel}`;
}

function buildPrevQuarterPath(clientName, qeMonth, qeYear, clientYEMonth) {
  if (!clientName || !qeMonth || !qeYear || !clientYEMonth) return "";
  const qm = parseInt(qeMonth);
  const qy = parseInt(qeYear);
  // Go back 3 months
  let prevMonth = qm - 3;
  let prevYear = qy;
  if (prevMonth <= 0) { prevMonth += 12; prevYear -= 1; }
  return buildFolderPath(clientName, String(prevMonth), String(prevYear), clientYEMonth);
}

// ── Reusable components ───────────────────────────────────
function Field({ label, children, note }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 12, fontFamily: C.mono, letterSpacing: "0.1em", color: C.textMid, marginBottom: 6, textTransform: "uppercase" }}>{label}</label>
      {children}
      {note && <div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>{note}</div>}
    </div>
  );
}

function Input({ value, onChange, placeholder, style: s }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", padding: "10px 12px", background: C.surface, border: `1px solid ${C.border}`,
        color: C.text, fontSize: 14, fontFamily: "inherit", borderRadius: 2, outline: "none",
        boxSizing: "border-box", ...s,
      }}
      onFocus={e => e.target.style.borderColor = C.accent}
      onBlur={e => e.target.style.borderColor = C.border}
    />
  );
}

function TriToggle({ value, onChange }) {
  const opts = [
    { key: "yes", label: "Yes", color: C.green },
    { key: "partial", label: "Partial", color: C.accent },
    { key: "no", label: "No", color: C.textLight },
  ];
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {opts.map(o => (
        <button key={o.key} onClick={() => onChange(o.key)} style={{
          padding: "4px 12px", fontSize: 11, fontFamily: C.mono,
          background: value === o.key ? (o.key === "yes" ? C.greenBg : o.key === "partial" ? C.accentBg : C.surface) : "transparent",
          border: `1px solid ${value === o.key ? o.color : C.border}`,
          color: value === o.key ? o.color : C.textLight,
          cursor: "pointer", borderRadius: 2,
        }}>{o.label}</button>
      ))}
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
      background: checked ? C.greenBg : C.surface, border: `1px solid ${checked ? C.greenBorder : C.border}`,
      cursor: "pointer", textAlign: "left", width: "100%", borderRadius: 2,
    }}>
      <span style={{
        width: 16, height: 16, marginTop: 1, border: `1.5px solid ${checked ? C.green : C.borderStrong}`,
        background: checked ? C.green : "transparent", display: "flex", alignItems: "center",
        justifyContent: "center", flexShrink: 0, fontSize: 10, color: "#fff", borderRadius: 2,
      }}>{checked ? "✓" : ""}</span>
      <span style={{ fontSize: 13, color: checked ? C.textMid : C.textLight, lineHeight: 1.4 }}>{label}</span>
    </button>
  );
}

// ── Main App ───────────────────────────────────
export default function VATCoworkApp() {
  const [view, setView] = useState("home");
  const [currentStep, setCurrentStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState(EMPTY_DATA);
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState([]);
  const [jobStatuses, setJobStatuses] = useState({});
  const [notification, setNotification] = useState(null);
  const [clientSearch, setClientSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [j, c, s] = await Promise.all([
          window.storage.get("vat_jobs_v1").catch(() => null),
          window.storage.get("vat_clients_v1").catch(() => null),
          window.storage.get("vat_statuses_v1").catch(() => null),
        ]);
        if (j) setJobs(JSON.parse(j.value));
        if (s) setJobStatuses(JSON.parse(s.value));
        // Merge: saved clients override preloaded ones by name, then add any preloaded ones not yet saved
        const saved = c ? JSON.parse(c.value) : [];
        const savedNames = new Set(saved.map(cl => cl.name.toLowerCase()));
        const merged = [
          ...saved,
          ...PRELOADED_CLIENTS.filter(cl => !savedNames.has(cl.name.toLowerCase())),
        ].sort((a, b) => a.name.localeCompare(b.name));
        setClients(merged);
      } catch (e) {
        setClients([...PRELOADED_CLIENTS]);
      }
    };
    load();
  }, []);

  const persist = async (key, val) => { try { await window.storage.set(key, JSON.stringify(val)); } catch (e) {} };
  const notify = (msg, type = "ok") => { setNotification({ msg, type }); setTimeout(() => setNotification(null), 2500); };
  const update = (key, val) => setData(d => ({ ...d, [key]: val }));

  const startNewJob = (clientData = null) => {
    if (clientData) {
      setData({
        ...EMPTY_DATA,
        client: clientData.name,
        vatNumber: clientData.vatNumber || "",
        vatScheme: clientData.vatScheme || "standard",
        flatRatePercent: clientData.flatRatePercent || "",
        clientYEMonth: clientData.clientYEMonth || "3",
        mtd: clientData.mtd || false,
        rules: clientData.defaultRules || EMPTY_DATA.rules,
      });
    } else {
      setData(EMPTY_DATA);
    }
    setCurrentStep(0);
    setView("wizard");
  };

  const saveJob = async () => {
    const job = {
      id: Date.now(),
      client: data.client || "Unnamed client",
      period: data.periodLabel || `${data.periodFrom} to ${data.periodTo}`,
      scheme: VAT_SCHEMES.find(s => s.key === data.vatScheme)?.label || data.vatScheme,
      preparedBy: data.preparedBy || "—",
      status: "In progress",
      date: new Date().toLocaleDateString("en-GB"),
      mtd: data.mtd,
    };
    const newJobs = [job, ...jobs];
    setJobs(newJobs);
    setJobStatuses(s => ({ ...s, [job.id]: "In progress" }));
    await persist("vat_jobs_v1", newJobs);
    await persist("vat_statuses_v1", { ...jobStatuses, [job.id]: "In progress" });
    notify(`Job saved: ${job.client} — ${job.period}`);
  };

  const saveClient = async () => {
    const existing = clients.findIndex(c => c.name.toLowerCase() === data.client.toLowerCase());
    const clientData = {
      name: data.client,
      vatNumber: data.vatNumber,
      vatScheme: data.vatScheme,
      flatRatePercent: data.flatRatePercent,
      clientYEMonth: data.clientYEMonth,
      mtd: data.mtd,
      defaultRules: data.rules,
    };
    let newClients;
    if (existing >= 0) {
      newClients = [...clients];
      newClients[existing] = clientData;
    } else {
      newClients = [clientData, ...clients];
    }
    setClients(newClients);
    await persist("vat_clients_v1", newClients);
    notify(`Client saved: ${data.client}`);
  };

  const updateJobStatus = async (id, status) => {
    const newStatuses = { ...jobStatuses, [id]: status };
    setJobStatuses(newStatuses);
    await persist("vat_statuses_v1", newStatuses);
  };

  const allSynced = SYNC_ITEMS.every(i => data.syncChecked[i.key]);
  const prompt = generatePrompt(data);

  const stepValid = (step) => {
    if (step === 0) return data.client.trim().length > 0 && data.endMonth && data.endYear;
    if (step === 1) return true;
    return true;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Render: Home ───────────────────────────────────
  if (view === "home") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Georgia', 'Times New Roman', serif", color: C.text, padding: 0 }}>
        {notification && (
          <div style={{ position: "fixed", top: 16, right: 16, padding: "10px 20px", background: notification.type === "ok" ? C.greenBg : C.redBg, border: `1px solid ${notification.type === "ok" ? C.greenBorder : C.red}`, color: notification.type === "ok" ? C.green : C.red, fontSize: 13, zIndex: 100, borderRadius: 2 }}>{notification.msg}</div>
        )}

        {/* Header */}
        <div style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 36, height: 36, background: C.accentBg, border: `1px solid ${C.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 2 }}>
              <span style={{ fontFamily: C.mono, fontSize: 14, color: C.accent, fontWeight: 700 }}>V</span>
            </div>
            <div>
              <div style={{ fontSize: 18, color: C.text, letterSpacing: "-0.02em" }}>VAT Review</div>
              <div style={{ fontSize: 11, fontFamily: C.mono, color: C.textLight, letterSpacing: "0.1em", textTransform: "uppercase" }}>Cowork Job Setup</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "32px 32px 16px" }}>
          <button onClick={() => { setClientSearch(""); setView("clientPicker"); }} style={{
            width: "100%", padding: "20px 24px", background: C.accentBg, border: `2px solid ${C.accentBorder}`,
            color: C.accent, fontSize: 16, fontFamily: "inherit", cursor: "pointer", textAlign: "left", borderRadius: 2,
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>+</span>
            <div>
              <div style={{ fontSize: 15 }}>New VAT Review Job</div>
              <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>Select a client and start the wizard</div>
            </div>
          </button>
        </div>

        {/* Job tracker */}
        <div style={{ padding: "0 32px 32px" }}>
          <div style={{ fontSize: 11, fontFamily: C.mono, color: C.textLight, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Job Tracker</div>
          {jobs.length === 0 ? (
            <div style={{ padding: "24px 16px", background: C.surface, border: `1px solid ${C.border}`, color: C.textLight, fontSize: 13, textAlign: "center", borderRadius: 2 }}>No jobs yet. Start a new VAT review to begin.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {jobs.map(job => {
                const status = jobStatuses[job.id] || job.status;
                const statusColors = {
                  "In progress": { color: C.accent, bg: C.accentBg },
                  "Awaiting info": { color: "#d4a843", bg: "rgba(212,168,67,0.12)" },
                  "Review": { color: "#6a9fd8", bg: "rgba(106,159,216,0.12)" },
                  "Submitted": { color: C.green, bg: C.greenBg },
                };
                const sc = statusColors[status] || statusColors["In progress"];
                return (
                  <div key={job.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px",
                    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 2,
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: C.text }}>{job.client}</div>
                      <div style={{ fontSize: 11, color: C.textLight, fontFamily: C.mono, marginTop: 2 }}>
                        {job.period} · {job.scheme}{job.mtd ? " · MTD" : ""} · {job.date}
                      </div>
                    </div>
                    <select
                      value={status}
                      onChange={e => updateJobStatus(job.id, e.target.value)}
                      style={{
                        padding: "4px 8px", fontSize: 11, fontFamily: C.mono,
                        background: sc.bg, border: `1px solid ${sc.color}`, color: sc.color,
                        cursor: "pointer", borderRadius: 2, appearance: "auto",
                      }}
                    >
                      <option value="In progress">In progress</option>
                      <option value="Awaiting info">Awaiting info</option>
                      <option value="Review">Review</option>
                      <option value="Submitted">Submitted</option>
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Render: Client Picker ───────────────────────────────────
  if (view === "clientPicker") {
    const filtered = clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Georgia', 'Times New Roman', serif", color: C.text, padding: 0 }}>
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: C.textLight, cursor: "pointer", fontSize: 13, fontFamily: "inherit", padding: 0 }}>← Back</button>
          <div style={{ fontSize: 11, fontFamily: C.mono, color: C.textLight, letterSpacing: "0.1em" }}>SELECT CLIENT</div>
        </div>

        <div style={{ padding: "20px 32px 8px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 400, margin: 0, color: C.text, letterSpacing: "-0.02em" }}>Choose a client</h2>
        </div>

        {/* Search */}
        <div style={{ padding: "8px 32px 16px" }}>
          <Input value={clientSearch} onChange={setClientSearch} placeholder="Search clients..." />
        </div>

        {/* Client list */}
        <div style={{ padding: "0 32px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {filtered.map((c, i) => {
              const yeMonth = MONTHS.find(m => m.key === parseInt(c.clientYEMonth));
              return (
                <button key={i} onClick={() => startNewJob(c)} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px",
                  background: C.surface, border: `1px solid ${C.border}`, cursor: "pointer", textAlign: "left", borderRadius: 2, width: "100%",
                }}>
                  <div>
                    <div style={{ fontSize: 14, color: C.text }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: C.textLight, fontFamily: C.mono, marginTop: 2 }}>
                      {c.vatNumber || "No VAT no."} · {VAT_SCHEMES.find(s => s.key === c.vatScheme)?.label || c.vatScheme}
                      · YE {yeMonth ? yeMonth.short : "Mar"}
                    </div>
                  </div>
                  <span style={{ color: C.accent, fontSize: 12 }}>Start →</span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ padding: "20px 16px", color: C.textLight, fontSize: 13, textAlign: "center" }}>
                No clients match "{clientSearch}"
              </div>
            )}
          </div>
        </div>

        {/* New client option */}
        <div style={{ padding: "0 32px 32px" }}>
          <button onClick={() => startNewJob()} style={{
            width: "100%", padding: "14px 16px", background: "transparent", border: `1px dashed ${C.border}`,
            color: C.textLight, fontSize: 13, fontFamily: "inherit", cursor: "pointer", borderRadius: 2, textAlign: "center",
          }}>
            + Add new client manually
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Wizard ───────────────────────────────────
  const step = STEPS[currentStep];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Georgia', 'Times New Roman', serif", color: C.text, padding: 0 }}>
      {notification && (
        <div style={{ position: "fixed", top: 16, right: 16, padding: "10px 20px", background: notification.type === "ok" ? C.greenBg : C.redBg, border: `1px solid ${notification.type === "ok" ? C.greenBorder : C.red}`, color: notification.type === "ok" ? C.green : C.red, fontSize: 13, zIndex: 100, borderRadius: 2 }}>{notification.msg}</div>
      )}

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => setView("home")} style={{ background: "none", border: "none", color: C.textLight, cursor: "pointer", fontSize: 13, fontFamily: "inherit", padding: 0 }}>← Back</button>
        <div style={{ fontSize: 11, fontFamily: C.mono, color: C.textLight, letterSpacing: "0.1em" }}>
          STEP {step.icon} OF {String(STEPS.length).padStart(2, "0")}
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 2, padding: "0 32px", marginTop: 12 }}>
        {STEPS.map((s, i) => (
          <div key={s.id} style={{
            flex: 1, height: 3,
            background: i <= currentStep ? C.accent : C.border,
            borderRadius: 1,
          }} />
        ))}
      </div>

      {/* Step title */}
      <div style={{ padding: "20px 32px 8px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 400, margin: 0, color: C.text, letterSpacing: "-0.02em" }}>{step.title}</h2>
      </div>

      {/* Step content */}
      <div style={{ padding: "8px 32px 100px" }}>

        {/* Step 0: Client & Period */}
        {currentStep === 0 && <>
          <Field label="Client name">
            <Input value={data.client} onChange={v => update("client", v)} placeholder="e.g. Smith Building Services Ltd" />
          </Field>
          <Field label="VAT registration number">
            <Input value={data.vatNumber} onChange={v => update("vatNumber", v)} placeholder="e.g. 123 4567 89" />
          </Field>
          <Field label="Quarter ending" note="Select the month and year the quarter ends in">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontFamily: C.mono, color: C.textLight, marginBottom: 4, letterSpacing: "0.05em" }}>MONTH</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4 }}>
                  {MONTHS.map(m => (
                    <button key={m.key} onClick={() => {
                      update("endMonth", String(m.key));
                      const pd = derivePeriodDates(String(m.key), data.endYear);
                      update("periodLabel", pd.label);
                      update("periodFrom", pd.from);
                      update("periodTo", pd.to);
                    }} style={{
                      padding: "8px 4px", fontSize: 12, fontFamily: C.mono,
                      background: data.endMonth === String(m.key) ? C.accentBg : C.surface,
                      border: `1px solid ${data.endMonth === String(m.key) ? C.accent : C.border}`,
                      color: data.endMonth === String(m.key) ? C.accent : C.textMid,
                      cursor: "pointer", borderRadius: 2, textAlign: "center",
                    }}>{m.short}</button>
                  ))}
                </div>
              </div>
              <div style={{ width: 100 }}>
                <div style={{ fontSize: 11, fontFamily: C.mono, color: C.textLight, marginBottom: 4, letterSpacing: "0.05em" }}>YEAR</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {getYearOptions().map(y => (
                    <button key={y} onClick={() => {
                      update("endYear", String(y));
                      const pd = derivePeriodDates(data.endMonth, String(y));
                      update("periodLabel", pd.label);
                      update("periodFrom", pd.from);
                      update("periodTo", pd.to);
                    }} style={{
                      padding: "8px 12px", fontSize: 13, fontFamily: C.mono,
                      background: data.endYear === String(y) ? C.accentBg : C.surface,
                      border: `1px solid ${data.endYear === String(y) ? C.accent : C.border}`,
                      color: data.endYear === String(y) ? C.accent : C.textMid,
                      cursor: "pointer", borderRadius: 2, textAlign: "center",
                    }}>{y}</button>
                  ))}
                </div>
              </div>
            </div>
            {data.endMonth && data.endYear && (() => {
              const pd = derivePeriodDates(data.endMonth, data.endYear);
              return (
                <div style={{ marginTop: 10, padding: "8px 12px", background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 2, fontSize: 12, fontFamily: C.mono, color: C.green }}>
                  {pd.label} — {pd.fromNatural} to {pd.toNatural}
                </div>
              );
            })()}
          </Field>
          <Field label="Making Tax Digital">
            <button onClick={() => update("mtd", !data.mtd)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
              background: data.mtd ? C.accentBg : C.surface, border: `1px solid ${data.mtd ? C.accentBorder : C.border}`,
              cursor: "pointer", borderRadius: 2, width: "100%", textAlign: "left",
            }}>
              <span style={{
                width: 16, height: 16, border: `1.5px solid ${data.mtd ? C.accent : C.borderStrong}`,
                background: data.mtd ? C.accent : "transparent", display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0, fontSize: 10, color: "#fff", borderRadius: 2,
              }}>{data.mtd ? "✓" : ""}</span>
              <span style={{ fontSize: 13, color: data.mtd ? C.text : C.textMid }}>This period falls under MTD for VAT</span>
            </button>
          </Field>
          <Field label="Compare with previous quarter">
            <button onClick={() => update("comparePrev", !data.comparePrev)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
              background: data.comparePrev ? C.accentBg : C.surface, border: `1px solid ${data.comparePrev ? C.accentBorder : C.border}`,
              cursor: "pointer", borderRadius: 2, width: "100%", textAlign: "left",
            }}>
              <span style={{
                width: 16, height: 16, border: `1.5px solid ${data.comparePrev ? C.accent : C.borderStrong}`,
                background: data.comparePrev ? C.accent : "transparent", display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0, fontSize: 10, color: "#fff", borderRadius: 2,
              }}>{data.comparePrev ? "✓" : ""}</span>
              <div>
                <span style={{ fontSize: 13, color: data.comparePrev ? C.text : C.textMid }}>Compare Box 1–9 figures against the previous quarter's return</span>
                {data.comparePrev && data.client && data.endMonth && data.endYear && (() => {
                  const prevPath = buildPrevQuarterPath(data.client, data.endMonth, data.endYear, data.clientYEMonth);
                  if (!prevPath) return null;
                  return <div style={{ fontSize: 11, fontFamily: C.mono, color: C.textLight, marginTop: 4 }}>Cowork will look in: {prevPath}</div>;
                })()}
              </div>
            </button>
          </Field>
          <Field label="Prepared by">
            <Input value={data.preparedBy} onChange={v => update("preparedBy", v)} placeholder="Your name" />
          </Field>
          <Field label="Client year end month" note="The month this client's accounting year ends — determines the YE folder">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {MONTHS.map(m => (
                <button key={m.key} onClick={() => update("clientYEMonth", String(m.key))} style={{
                  padding: "6px 10px", fontSize: 11, fontFamily: C.mono,
                  background: data.clientYEMonth === String(m.key) ? C.accentBg : C.surface,
                  border: `1px solid ${data.clientYEMonth === String(m.key) ? C.accent : C.border}`,
                  color: data.clientYEMonth === String(m.key) ? C.accent : C.textMid,
                  cursor: "pointer", borderRadius: 2,
                }}>{m.short}</button>
              ))}
            </div>
          </Field>
          {data.client && data.endMonth && data.endYear && (() => {
            const fp = buildFolderPath(data.client, data.endMonth, data.endYear, data.clientYEMonth);
            if (!fp) return null;
            return (
              <div style={{ padding: "10px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 2, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontFamily: C.mono, color: C.textLight, marginBottom: 4, letterSpacing: "0.05em", textTransform: "uppercase" }}>Folder path (auto-generated)</div>
                <div style={{ fontSize: 12, fontFamily: C.mono, color: C.text, wordBreak: "break-all", lineHeight: 1.5 }}>{fp}</div>
              </div>
            );
          })()}
        </>}

        {/* Step 1: VAT Scheme */}
        {currentStep === 1 && <>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {VAT_SCHEMES.map(scheme => (
              <button key={scheme.key} onClick={() => update("vatScheme", scheme.key)} style={{
                display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
                background: data.vatScheme === scheme.key ? C.accentBg : C.surface,
                border: `2px solid ${data.vatScheme === scheme.key ? C.accent : C.border}`,
                cursor: "pointer", textAlign: "left", borderRadius: 2,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, color: C.text }}>{scheme.label}</div>
                  <div style={{ fontSize: 12, color: C.textLight, marginTop: 2 }}>{scheme.desc}</div>
                </div>
                {data.vatScheme === scheme.key && <span style={{ color: C.accent, fontSize: 18 }}>✓</span>}
              </button>
            ))}
          </div>
          {data.vatScheme === "flat_rate" && (
            <Field label="Flat rate percentage" note="The % agreed with HMRC for this trade sector">
              <Input value={data.flatRatePercent} onChange={v => update("flatRatePercent", v)} placeholder="e.g. 14.5" style={{ width: 120 }} />
            </Field>
          )}
        </>}

        {/* Step 2: Documents */}
        {currentStep === 2 && <>
          <div style={{ fontSize: 13, color: C.textLight, marginBottom: 16 }}>Mark which documents are in the client's VAT folder.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {VAT_DOCUMENTS.map(doc => (
              <div key={doc.key} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px",
                background: C.surface, border: `1px solid ${doc.critical && !data.documents[doc.key] ? "rgba(192,48,48,0.25)" : C.border}`, borderRadius: 2,
              }}>
                <div>
                  <span style={{ fontSize: 13, color: C.text }}>{doc.label}</span>
                  {doc.critical && <span style={{ fontSize: 10, color: C.red, fontFamily: C.mono, marginLeft: 8 }}>KEY</span>}
                </div>
                <TriToggle value={data.documents[doc.key] || ""} onChange={v => update("documents", { ...data.documents, [doc.key]: v })} />
              </div>
            ))}
          </div>
        </>}

        {/* Step 3: Client Rules */}
        {currentStep === 3 && <>
          <div style={{ fontSize: 13, color: C.textLight, marginBottom: 16 }}>Set any client-specific VAT rules. These carry over when you save the client.</div>

          <Field label="Zero-rated items" note="Describe any zero-rated supplies this client makes">
            <Input value={data.rules.zeroRated} onChange={v => update("rules", { ...data.rules, zeroRated: v })} placeholder="e.g. Children's clothing, exported goods" />
          </Field>
          <Field label="Exempt supplies" note="Describe any exempt supplies">
            <Input value={data.rules.exempt} onChange={v => update("rules", { ...data.rules, exempt: v })} placeholder="e.g. Insurance, financial services" />
          </Field>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
            <Checkbox
              checked={data.rules.partialExemption}
              onChange={v => update("rules", { ...data.rules, partialExemption: v })}
              label="Partial exemption applies — calculate recoverable input VAT proportion"
            />
            <Checkbox
              checked={data.rules.reverseCharge}
              onChange={v => update("rules", { ...data.rules, reverseCharge: v })}
              label="Domestic reverse charge applies (e.g. construction industry)"
            />
            <Checkbox
              checked={data.rules.cisDeductions}
              onChange={v => update("rules", { ...data.rules, cisDeductions: v })}
              label="CIS deductions — identify separately for PAYE/NI offset"
            />
          </div>

          <Field label="Other client-specific notes">
            <textarea
              value={data.rules.other}
              onChange={e => update("rules", { ...data.rules, other: e.target.value })}
              placeholder="Any other rules, quirks, or notes about this client's VAT..."
              rows={3}
              style={{
                width: "100%", padding: "10px 12px", background: C.surface, border: `1px solid ${C.border}`,
                color: C.text, fontSize: 14, fontFamily: "inherit", borderRadius: 2, outline: "none",
                resize: "vertical", boxSizing: "border-box",
              }}
            />
          </Field>
        </>}

        {/* Step 4: Sync Checklist */}
        {currentStep === 4 && <>
          <div style={{ fontSize: 13, color: C.textLight, marginBottom: 16 }}>Confirm everything is ready before generating the prompt.</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {SYNC_ITEMS.map(item => (
              <Checkbox
                key={item.key}
                checked={!!data.syncChecked[item.key]}
                onChange={v => update("syncChecked", { ...data.syncChecked, [item.key]: v })}
                label={item.label}
              />
            ))}
          </div>
          {!allSynced && (
            <div style={{ marginTop: 12, padding: "10px 16px", background: C.accentBg, border: `1px solid ${C.accentBorder}`, borderRadius: 2, fontSize: 12, color: C.accent }}>
              Complete all items before generating the prompt.
            </div>
          )}
        </>}

        {/* Step 5: Prompt */}
        {currentStep === 5 && <>
          <div style={{
            padding: "16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 2,
            maxHeight: 400, overflowY: "auto", marginBottom: 16,
          }}>
            <pre style={{ margin: 0, fontSize: 12, fontFamily: C.mono, color: C.textMid, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{prompt}</pre>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={handleCopy} style={{
              flex: 1, padding: "14px 20px", background: copied ? C.greenBg : C.accentBg,
              border: `2px solid ${copied ? C.greenBorder : C.accentBorder}`,
              color: copied ? C.green : C.accent, fontSize: 14, fontFamily: "inherit",
              cursor: "pointer", borderRadius: 2, minWidth: 140,
            }}>
              {copied ? "✓ Copied to clipboard" : "Copy Prompt"}
            </button>
            <button onClick={saveJob} style={{
              padding: "14px 20px", background: C.surface, border: `1px solid ${C.border}`,
              color: C.textMid, fontSize: 14, fontFamily: "inherit", cursor: "pointer", borderRadius: 2,
            }}>
              Save Job
            </button>
            <button onClick={saveClient} style={{
              padding: "14px 20px", background: C.surface, border: `1px solid ${C.border}`,
              color: C.textMid, fontSize: 14, fontFamily: "inherit", cursor: "pointer", borderRadius: 2,
            }}>
              Save Client
            </button>
          </div>

          <div style={{ marginTop: 16, padding: "12px 16px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 2, fontSize: 12, color: C.textLight, lineHeight: 1.5 }}>
            <strong style={{ color: C.textMid }}>Next steps:</strong> Paste this prompt into Claude Desktop (Cowork mode) with the client's VAT folder pointed. Cowork will read the spreadsheet, review it, and produce the Cowork_Notes with Box 1–9 figures ready for bridging software / IRIS.
          </div>
        </>}
      </div>

      {/* Footer nav */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px 32px",
        background: C.bg, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between",
      }}>
        <button
          onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          style={{
            padding: "10px 24px", background: "transparent", border: `1px solid ${C.border}`,
            color: currentStep === 0 ? C.textLight : C.textMid, fontSize: 13, fontFamily: "inherit",
            cursor: currentStep === 0 ? "default" : "pointer", borderRadius: 2, opacity: currentStep === 0 ? 0.4 : 1,
          }}
        >Previous</button>

        {currentStep < STEPS.length - 1 ? (
          <button
            onClick={() => setCurrentStep(s => Math.min(STEPS.length - 1, s + 1))}
            disabled={!stepValid(currentStep) || (currentStep === 4 && !allSynced)}
            style={{
              padding: "10px 24px", background: stepValid(currentStep) ? C.accentBg : C.surface,
              border: `1px solid ${stepValid(currentStep) ? C.accentBorder : C.border}`,
              color: stepValid(currentStep) ? C.accent : C.textLight, fontSize: 13, fontFamily: "inherit",
              cursor: stepValid(currentStep) ? "pointer" : "default", borderRadius: 2,
              opacity: (!stepValid(currentStep) || (currentStep === 4 && !allSynced)) ? 0.4 : 1,
            }}
          >Next</button>
        ) : (
          <button onClick={() => setView("home")} style={{
            padding: "10px 24px", background: C.greenBg, border: `1px solid ${C.greenBorder}`,
            color: C.green, fontSize: 13, fontFamily: "inherit", cursor: "pointer", borderRadius: 2,
          }}>Done</button>
        )}
      </div>
    </div>
  );
}
