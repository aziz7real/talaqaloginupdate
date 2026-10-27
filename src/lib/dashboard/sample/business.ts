import type { Branch, Business, Customer, Member, Service } from "../types";

/*
 * SAMPLE DATA. An invented barbershop (the same Rukn Barbers the marketing
 * demo uses), its team and its customers. No real business or person is
 * described; names and numbers are illustrative. Replaced by Supabase in Phase 3.
 */

/** The sample snapshot is frozen at this moment so every figure agrees. */
export const SAMPLE_NOW = "2026-10-26T14:20:00+03:00";

export const SAMPLE_BUSINESS_ID = "biz_rukn";

export const business: Business = {
  id: SAMPLE_BUSINESS_ID,
  name: { ar: "ركن للحلاقة", en: "Rukn Barbers" },
  category: { ar: "صالون حلاقة رجالي", en: "Men's barbershop" },
  timezone: "Asia/Riyadh",
  whatsappNumber: "+966500000417",
  whatsappConnected: false,
};

const hours: Branch["hours"] = [
  { days: [6, 0, 1, 2, 3, 4], opens: "10:00", closes: "23:00" },
  { days: [5], opens: "16:00", closes: "23:00" },
];

export const branches: Branch[] = [
  { id: "br_olaya", businessId: SAMPLE_BUSINESS_ID, name: { ar: "العليا", en: "Olaya" }, hours },
  { id: "br_yasmin", businessId: SAMPLE_BUSINESS_ID, name: { ar: "الياسمين", en: "Al Yasmin" }, hours },
];

export const members: Member[] = [
  { id: "m_abdullah", businessId: SAMPLE_BUSINESS_ID, name: { ar: "عبدالله", en: "Abdullah" }, role: "owner", branchIds: "all", bookable: false, daysOff: [] },
  { id: "m_majed", businessId: SAMPLE_BUSINESS_ID, name: { ar: "ماجد", en: "Majed" }, role: "manager", branchIds: ["br_olaya"], bookable: false, daysOff: [5] },
  { id: "m_yousef", businessId: SAMPLE_BUSINESS_ID, name: { ar: "يوسف", en: "Yousef" }, role: "manager", branchIds: ["br_yasmin"], bookable: false, daysOff: [5] },
  { id: "m_ahmed", businessId: SAMPLE_BUSINESS_ID, name: { ar: "أحمد", en: "Ahmed" }, role: "staff", branchIds: ["br_olaya"], bookable: true, daysOff: [5] },
  { id: "m_khalid", businessId: SAMPLE_BUSINESS_ID, name: { ar: "خالد", en: "Khalid" }, role: "staff", branchIds: ["br_olaya"], bookable: true, daysOff: [2] },
  { id: "m_sultan", businessId: SAMPLE_BUSINESS_ID, name: { ar: "سلطان", en: "Sultan" }, role: "staff", branchIds: ["br_olaya"], bookable: true, daysOff: [3] },
  { id: "m_fahad", businessId: SAMPLE_BUSINESS_ID, name: { ar: "فهد", en: "Fahad" }, role: "staff", branchIds: ["br_yasmin"], bookable: true, daysOff: [6] },
  { id: "m_omar", businessId: SAMPLE_BUSINESS_ID, name: { ar: "عمر", en: "Omar" }, role: "staff", branchIds: ["br_yasmin"], bookable: true, daysOff: [3] },
];

export const services: Service[] = [
  { id: "sv_cut", businessId: SAMPLE_BUSINESS_ID, name: { ar: "قص شعر", en: "Haircut" }, durationMin: 30, priceSar: 80 },
  { id: "sv_cut_beard", businessId: SAMPLE_BUSINESS_ID, name: { ar: "قص شعر ولحية", en: "Haircut and beard" }, durationMin: 45, priceSar: 110 },
  { id: "sv_beard", businessId: SAMPLE_BUSINESS_ID, name: { ar: "تهذيب لحية", en: "Beard trim" }, durationMin: 30, priceSar: 50 },
  { id: "sv_kids", businessId: SAMPLE_BUSINESS_ID, name: { ar: "قص شعر أطفال", en: "Kids' haircut" }, durationMin: 30, priceSar: 60 },
  { id: "sv_facial", businessId: SAMPLE_BUSINESS_ID, name: { ar: "تنظيف بشرة", en: "Facial" }, durationMin: 60, priceSar: 180 },
  { id: "sv_groom", businessId: SAMPLE_BUSINESS_ID, name: { ar: "باكج العريس", en: "Groom package" }, durationMin: 120, priceSar: 450 },
];

/** Invented first names with an initial. Phone numbers are never real or shown in full. */
const customerNames = [
  "بندر ق.", "تركي ح.", "عبدالمجيد ص.", "نواف س.", "هيفاء ع.", "سلمان ر.", "Daniel R.", "مشعل د.", "راكان ب.",
  "عبدالرحمن ك.", "يزيد ن.", "حمد ع.",
  // Appointment-only customers
  "فيصل م.", "سعد ج.", "ريان ش.", "مازن ط.", "زياد ه.", "عادل خ.", "بدر ل.", "سامي و.", "طلال ز.", "وليد أ.",
  "هشام ي.", "أنس ف.", "إبراهيم ق.", "ثامر ر.", "ياسر ك.", "معاذ ح.", "عمار ن.", "منصور ب.", "باسل ت.", "حسام د.",
  "Omar K.", "Ryan P.", "صالح م.", "غازي س.", "لؤي ع.", "نايف ج.", "جابر ش.", "رائد غ.",
];

export const customers: Customer[] = customerNames.map((name, i) => ({
  id: `cu_${String(i + 1).padStart(2, "0")}`,
  businessId: SAMPLE_BUSINESS_ID,
  name,
  phoneLast4: String(1000 + ((i * 7919 + 4127) % 9000)),
}));

/**
 * A second, unrelated business. Its rows sit in the same sample tables so the
 * repository's tenant filter has something to keep out; it must never appear
 * in the Rukn dashboard.
 */
export const OTHER_BUSINESS_ID = "biz_other";
