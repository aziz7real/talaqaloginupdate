import type { ChatMessage, Conversation, Localized } from "../types";
import { at } from "../time";
import { OTHER_BUSINESS_ID, SAMPLE_BUSINESS_ID } from "./business";

/*
 * SAMPLE DATA. Invented WhatsApp conversations for the sample barbershop,
 * written the way customers in Riyadh actually write. Talaqa's replies follow
 * the brand voice. Times are on the sample day (Monday 26 October 2026).
 */

const TODAY = "2026-10-26";
const YESTERDAY = "2026-10-25";

let seq = 0;
const id = () => `msg_${String(++seq).padStart(3, "0")}`;

const customer = (time: string, text: string, lang: "ar" | "en" = "ar", day = TODAY): ChatMessage => ({
  id: id(),
  at: at(day, time),
  kind: "customer",
  text,
  lang,
});
const talaqa = (time: string, text: string, lang: "ar" | "en" = "ar", day = TODAY): ChatMessage => ({
  id: id(),
  at: at(day, time),
  kind: "talaqa",
  text,
  lang,
});
const staff = (time: string, memberId: string, text: string): ChatMessage => ({
  id: id(),
  at: at(TODAY, time),
  kind: "staff",
  memberId,
  text,
  lang: "ar",
});
const event = (time: string, kind: Extract<ChatMessage, { kind: "event" }>["event"], text: Localized, day = TODAY): ChatMessage => ({
  id: id(),
  at: at(day, time),
  kind: "event",
  event: kind,
  text,
});

const base = { businessId: SAMPLE_BUSINESS_ID, channel: "whatsapp" as const };

export const conversations: Conversation[] = [
  {
    ...base,
    id: "cv_01",
    branchId: "br_olaya",
    customerId: "cu_01",
    status: "handover",
    topic: "complaint",
    unread: 1,
    handoverReason: {
      ar: "شكوى على زيارة سابقة. حسب قاعدتك، الشكاوى تروح لمدير الفرع.",
      en: "A complaint about a past visit. Your rule sends complaints to the branch manager.",
    },
    messages: [
      customer("13:58", "السلام عليكم، أمس قصيت عند سلطان والجهة اليسار طلعت أقصر بشكل واضح. مو راضي أبداً"),
      event("13:58", "found", { ar: "لقى زيارته: أمس، قص شعر مع سلطان", en: "Found his visit: yesterday, haircut with Sultan" }),
      talaqa("13:59", "وعليكم السلام بندر، آسفين على هالتجربة. أبي الموضوع ينحل صح، فبحوّلك الحين لمدير الفرع ماجد يتابع معك بنفسه."),
      event("13:59", "handover", { ar: "حوّل المحادثة لماجد، مدير فرع العليا", en: "Handed over to Majed, Olaya branch manager" }),
      customer("14:02", "طيب، متى يرد؟"),
      talaqa("14:02", "بلّغته الحين، ويرد عليك هنا في نفس المحادثة."),
    ],
  },
  {
    ...base,
    id: "cv_02",
    branchId: "br_yasmin",
    customerId: "cu_02",
    status: "handover",
    topic: "booking",
    unread: 1,
    handoverReason: {
      ar: "حجز جماعي لستة أشخاص. حسب قاعدتك، أكثر من 4 يحتاج تأكيد المدير.",
      en: "A group booking for six. Your rule needs a manager to confirm groups over 4.",
    },
    messages: [
      customer("12:40", "مساء الخير، عندنا زواج الخميس الجاي. نبي حجز للمعرس وخمسة من الربع، بعد العصر لو أمكن"),
      event("12:40", "checked", { ar: "شيّك المواعيد: الخميس 29 أكتوبر، فرع الياسمين، بعد 4:00 م", en: "Checked availability: Thu 29 Oct, Al Yasmin, after 4:00 PM" }),
      talaqa("12:41", "مبروك مقدماً! باكج العريس ياخذ ساعتين تقريباً بـ 450 ريال، والربع قص شعر ولحية بـ 110 ريال للشخص. الخميس بعد العصر عندنا مكان في فرع الياسمين من 4:00 م."),
      customer("12:46", "تمام، نبي نكون مع بعض لو ينفع"),
      event("12:47", "rule", { ar: "طبّق قاعدة: المجموعات فوق 4 أشخاص يأكدها المدير", en: "Applied rule: groups over 4 are confirmed by a manager" }),
      event("12:47", "handover", { ar: "حوّل المحادثة ليوسف، مدير فرع الياسمين", en: "Handed over to Yousef, Al Yasmin branch manager" }),
      talaqa("12:47", "حجز بهالحجم يأكده مدير الفرع عشان يرتب لكم الحلاقين مع بعض. حوّلت طلبك ليوسف ويرد عليك هنا."),
    ],
  },
  {
    ...base,
    id: "cv_03",
    branchId: "br_olaya",
    customerId: "cu_03",
    status: "team",
    topic: "other",
    unread: 0,
    handoverReason: {
      ar: "سؤال عن بطاقات الإهداء، وما له جواب في معلومات النشاط.",
      en: "A question about gift cards that your business information doesn't answer.",
    },
    messages: [
      customer("11:05", "عندكم بطاقات إهداء؟ أبي أهدي أخوي"),
      talaqa("11:05", "سؤال حلو، بس ما عندي معلومة مؤكدة عن بطاقات الإهداء وما أبي أعطيك جواب غلط. بحوّلك لفريق الفرع يردون عليك."),
      event("11:05", "handover", { ar: "حوّل المحادثة لفريق فرع العليا", en: "Handed over to the Olaya team" }),
      event("11:21", "takeover", { ar: "ماجد استلم المحادثة", en: "Majed took over" }),
      staff("11:22", "m_majed", "هلا فيك، معك ماجد مدير فرع العليا. إيه عندنا بطاقات إهداء بأي مبلغ، تقدر تاخذها من الفرع أو أجهزها لك."),
      customer("11:30", "ممتاز، جهزها بـ 200 وأمر عليها بكرا"),
      staff("11:32", "m_majed", "أبشر، تكون جاهزة بكرا من 4 العصر."),
    ],
  },
  {
    ...base,
    id: "cv_04",
    branchId: "br_olaya",
    customerId: "cu_04",
    status: "talaqa",
    topic: "booking",
    unread: 0,
    messages: [
      customer("14:11", "أبي موعد بكرا مع خالد بعد المغرب"),
      event("14:11", "checked", { ar: "شيّك جدول خالد: إجازة بكرا (الثلاثاء)", en: "Checked Khalid's schedule: off tomorrow (Tuesday)" }),
      event("14:11", "checked", { ar: "شيّك المواعيد المتاحة بكرا بعد 6:00 م", en: "Checked availability tomorrow after 6:00 PM" }),
      talaqa("14:12", "خالد إجازة بكرا للأسف. يرجع الأربعاء وعنده 7:00 م أو 8:30 م. وإذا تبي بكرا، أحمد متاح 8:00 م. وش يناسبك؟"),
    ],
  },
  {
    ...base,
    id: "cv_05",
    branchId: "br_yasmin",
    customerId: "cu_05",
    status: "talaqa",
    topic: "booking",
    unread: 0,
    messages: [
      customer("14:15", "عندكم قص أطفال؟ ولدي عمره ٦ سنين"),
      event("14:15", "checked", { ar: "شيّك المواعيد المتاحة اليوم: فرع الياسمين", en: "Checked availability today: Al Yasmin" }),
      talaqa("14:16", "إيه نعم، قص الأطفال بـ 60 ريال وياخذ نص ساعة تقريباً. اليوم متاح في فرع الياسمين 5:00 م أو 6:30 م مع عمر. أي وقت يناسبك؟"),
    ],
  },
  {
    ...base,
    id: "cv_06",
    branchId: "br_olaya",
    customerId: "cu_06",
    status: "resolved",
    topic: "booking",
    unread: 0,
    appointmentId: "ap_salman",
    messages: [
      customer("09:41", "أبي موعد بكرا بعد ٥"),
      event("09:41", "checked", { ar: "شيّك المواعيد: بكرا بعد 5:00 م · 6:00 م أحمد · 7:00 م سلطان", en: "Checked availability: tomorrow after 5:00 PM · 6:00 PM Ahmed · 7:00 PM Sultan" }),
      talaqa("09:41", "أبشر، متاح بكرا 6:00 م مع أحمد أو 7:00 م مع سلطان. وش يناسبك؟"),
      customer("09:43", "٦ تمام، قص ولحية"),
      event("09:43", "booked", { ar: "سجّل الحجز: الثلاثاء 27 أكتوبر · 6:00 م · قص شعر ولحية مع أحمد", en: "Booked: Tue 27 Oct · 6:00 PM · Haircut and beard with Ahmed" }),
      talaqa("09:44", "تم حجزك بكرا الثلاثاء 6:00 م، قص شعر ولحية مع أحمد في فرع العليا. نشوفك بكرا!"),
    ],
  },
  {
    ...base,
    id: "cv_07",
    branchId: "br_olaya",
    customerId: "cu_07",
    status: "resolved",
    topic: "booking",
    unread: 0,
    appointmentId: "ap_daniel",
    messages: [
      customer("08:12", "Hi, do you do beard trims? Any slot this afternoon?", "en"),
      event("08:12", "checked", { ar: "شيّك المواعيد: اليوم بعد 2:00 م، فرع العليا", en: "Checked availability: today after 2:00 PM, Olaya" }),
      talaqa("08:13", "Yes, a beard trim is SAR 50 and takes about 30 minutes. This afternoon we have 3:00 PM or 4:30 PM at our Olaya branch.", "en"),
      customer("08:14", "4:30 works", "en"),
      event("08:14", "booked", { ar: "سجّل الحجز: اليوم · 4:30 م · تهذيب لحية مع سلطان", en: "Booked: today · 4:30 PM · Beard trim with Sultan" }),
      talaqa("08:15", "Done. You're booked today at 4:30 PM for a beard trim with Sultan at Olaya. See you then.", "en"),
    ],
  },
  {
    ...base,
    id: "cv_08",
    branchId: "br_yasmin",
    customerId: "cu_08",
    status: "resolved",
    topic: "reschedule",
    unread: 0,
    appointmentId: "ap_mishal",
    messages: [
      customer("10:20", "عندي موعد الأربعاء الساعة ٧ مع فهد، أقدر أأجله للخميس؟"),
      event("10:20", "found", { ar: "لقى الموعد: الأربعاء 28 أكتوبر · 7:00 م · قص شعر مع فهد", en: "Found the appointment: Wed 28 Oct · 7:00 PM · Haircut with Fahad" }),
      event("10:20", "checked", { ar: "شيّك جدول فهد: الخميس 29 أكتوبر", en: "Checked Fahad's schedule: Thu 29 Oct" }),
      talaqa("10:21", "أكيد. فهد متاح الخميس 8:00 م أو 9:00 م. أي واحد تبي؟"),
      customer("10:22", "٨"),
      event("10:22", "rescheduled", { ar: "عدّل الموعد: الخميس 29 أكتوبر · 8:00 م مع فهد", en: "Rescheduled: Thu 29 Oct · 8:00 PM with Fahad" }),
      talaqa("10:23", "تم، موعدك صار الخميس 8:00 م مع فهد في فرع الياسمين."),
    ],
  },
  {
    ...base,
    id: "cv_09",
    branchId: "br_olaya",
    customerId: "cu_09",
    status: "resolved",
    topic: "cancel",
    unread: 0,
    appointmentId: "ap_rakan",
    messages: [
      customer("07:50", "ألغِ موعدي اليوم الساعة ٣ لو سمحت، طرأ علي شغل"),
      event("07:50", "found", { ar: "لقى الموعد: اليوم · 3:00 م · قص شعر مع خالد", en: "Found the appointment: today · 3:00 PM · Haircut with Khalid" }),
      event("07:50", "cancelled", { ar: "ألغى الموعد وفتح الوقت لغيره", en: "Cancelled it and reopened the slot" }),
      talaqa("07:51", "ألغيت موعدك اليوم 3:00 م. إذا تبي موعد ثاني أنا موجود."),
    ],
  },
  {
    ...base,
    id: "cv_10",
    branchId: "br_yasmin",
    customerId: "cu_10",
    status: "resolved",
    topic: "prices",
    unread: 0,
    messages: [
      customer("01:12", "كم سعر تنظيف البشرة؟ وتفتحون الجمعة؟"),
      event("01:12", "answered", { ar: "جاوب من معلومات النشاط: الأسعار وأوقات الدوام", en: "Answered from your business information: prices and hours" }),
      talaqa("01:12", "تنظيف البشرة بـ 180 ريال وياخذ ساعة تقريباً. الجمعة نفتح من 4:00 العصر إلى 11:00 الليل، وباقي الأيام من 10:00 الصبح."),
      customer("01:14", "شكراً"),
      talaqa("01:14", "العفو، حياك."),
    ],
  },
  {
    ...base,
    id: "cv_11",
    branchId: "br_olaya",
    customerId: "cu_11",
    status: "resolved",
    topic: "other",
    unread: 0,
    messages: [
      customer("12:58", "أنا متأخر ١٠ دقايق على موعد ١، عادي؟"),
      event("12:58", "rule", { ar: "طبّق قاعدة التأخير: سماح حتى 15 دقيقة", en: "Applied the late rule: up to 15 minutes' grace" }),
      talaqa("12:58", "عادي، نمسك لك الموعد لين 1:15 م. إذا بتتأخر أكثر قل لي وأشوف لك وقت ثاني."),
      customer("12:59", "تمام"),
    ],
  },
  {
    ...base,
    id: "cv_12",
    branchId: "br_yasmin",
    customerId: "cu_12",
    status: "resolved",
    topic: "other",
    unread: 0,
    messages: [
      customer("21:30", "تقدرون تجون البيت؟ أبي حلاق للوالد", "ar", YESTERDAY),
      event("21:30", "rule", { ar: "طبّق قاعدة: الخدمة داخل الفرع فقط", en: "Applied rule: services are in the branch only" }, YESTERDAY),
      talaqa("21:31", "للأسف ما نقدم خدمة في البيت حالياً، الخدمة داخل الفرع فقط. فرع الياسمين بابه على الشارع وفيه مواقف قريبة لو يناسب الوالد.", "ar", YESTERDAY),
      customer("21:33", "تمام مشكور", "ar", YESTERDAY),
    ],
  },
  // Another tenant's row: present in the table, never visible to Rukn.
  {
    businessId: OTHER_BUSINESS_ID,
    channel: "whatsapp",
    id: "cv_x1",
    branchId: "br_x",
    customerId: "cu_x1",
    status: "handover",
    topic: "booking",
    unread: 1,
    messages: [customer("10:00", "This message belongs to another business.", "en")],
  },
];
