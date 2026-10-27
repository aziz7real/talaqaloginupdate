import type { Dictionary } from "../types";

/*
 * English edition. Customer messages stay in their original Gulf Arabic with
 * an English gloss underneath — showing the real input is the product story.
 */

const en: Dictionary = {
  meta: {
    title: "Talaqa  — طلاقة",
    description:
      "Talaqa answers your customers on WhatsApp, books and changes their appointments, and hands off to your team when it should. An AI receptionist set up around your services, branches and rules.",
  },
  common: {
    skip: "Skip to content",
    requestDemo: "Request a demo",
    menu: "Menu",
    close: "Close",
    switchShort: "عربي",
    switchLabel: "التبديل إلى العربية",
    statuses: { available: "Available", beta: "Beta", soon: "Coming soon" },
  },
  nav: {
    label: "Main navigation",
    product: "What it does",
    demo: "Try it",
    how: "How it works",
    pricing: "Pricing",
    clientLogin: "Client login",
  },
  hero: {
    titleLines: ["Your AI receptionist,", "built around your business."],
    lead: "Talaqa answers your customers on WhatsApp and books and changes their appointments — by your rules.",
    tryDemo: "Try the conversation",
    preview: {
      label: "Example · translated",
      caption:
        "Example: a customer writes on WhatsApp “أبي موعد بكرا بعد ٥” (I’d like an appointment tomorrow after 5). Talaqa understands the request, checks availability, offers two times, and once the customer picks one, records the booking in the booking system.",
      business: "Rukn Barbers",
      channel: "WhatsApp",
      replay: "Replay example",
      steps: [
        { kind: "customer", text: "أبي موعد بكرا بعد ٥", gloss: "I’d like an appointment tomorrow after 5." },
        { kind: "action", text: "Understood the request", detail: "Booking · Haircut · Tomorrow after 5 PM" },
        { kind: "action", text: "Checked availability", detail: "6:00 PM Ahmed · 7:30 PM Khalid" },
        { kind: "talaqa", text: "Sure — tomorrow we have 6:00 PM with Ahmed or 7:30 PM with Khalid. Which works for you?" },
        { kind: "customer", text: "٦ تمام", gloss: "6 works." },
        {
          kind: "booked",
          title: "Booked",
          detail: "Tomorrow · 6:00 PM · Haircut with Ahmed",
          system: "Added to the booking system, confirmation sent",
        },
      ],
    },
  },
  capabilities: {
    title: "The whole front desk, in one conversation.",
    lead: "All of it runs on your business information and your rules.",
    items: [
      { id: "answer", name: "Answers questions", desc: "Prices, services, branches and hours — from information you approve." },
      { id: "availability", name: "Checks availability", desc: "Reads real availability from your booking system." },
      { id: "book", name: "Books appointments", desc: "Completes the booking inside the chat. No links." },
      { id: "reschedule", name: "Reschedules", desc: "Finds the appointment and moves it to a time that works." },
      { id: "cancel", name: "Cancels by your rules", desc: "And offers another slot when it makes sense." },
      { id: "branches", name: "Knows every branch", desc: "Each with its own team, hours and services." },
      { id: "handoff", name: "Hands over to your team", desc: "When a person is needed, with a clear summary." },
      { id: "followups", name: "Confirms and reminds", desc: "A confirmation after booking, a reminder before." },
    ],
  },
  demo: {
    title: "Try it yourself.",
    lead: "A sample barbershop on WhatsApp. Reply as the customer and watch what Talaqa does at each step.",
    note: "A guided demo with set replies. In your business, Talaqa reads real availability from your own system.",
    businessName: "Rukn Barbers",
    sampleBadge: "Sample business",
    channel: "WhatsApp",
    replyAs: "Reply as the customer",
    inputPlaceholder: "Type a message",
    restart: "Start over",
    typing: "Talaqa is typing…",
    typingShort: "typing…",
    today: "Today",
    pmSuffix: "PM",
    widgetLabel: "Sample WhatsApp conversation with Talaqa",
    legendChat: "The conversation, as the customer sees it on WhatsApp",
    legendActions: "What Talaqa does in your systems (not shown to the customer)",
    dashboardLead: "And this is what your team sees: the same barbershop in the dashboard, with sample data.",
    dashboardCta: "Explore the sample dashboard",
    script: {
      opening: "Hi, can I book something for tomorrow evening?",
      start: "askService",
      vars: { service: "Haircut & beard", time: "6:00 PM", barber: "Ahmed" },
      nodes: {
        askService: {
          assistant: ["Hi, welcome. Of course — which service would you like?"],
          activity: ["Understood the request: new booking · tomorrow evening"],
          choices: [
            { id: "cut-beard", label: "Haircut & beard", next: "slots", set: { service: "Haircut & beard" } },
            { id: "cut", label: "Haircut", next: "slots", set: { service: "Haircut" } },
            { id: "facial", label: "Facial", next: "slots", set: { service: "Facial" } },
          ],
        },
        slots: {
          assistant: ["Tomorrow evening we have:\n6:00 PM with Ahmed\n7:30 PM with Khalid\nWhich suits you?"],
          activity: ["Checked tomorrow after 6 PM · Olaya branch"],
          choices: [
            { id: "six", label: "6 works", next: "booked", set: { time: "6:00 PM", barber: "Ahmed" } },
            { id: "seven", label: "7:30 with Khalid", next: "booked", set: { time: "7:30 PM", barber: "Khalid" } },
          ],
        },
        booked: {
          assistant: ["Done — you’re booked for tomorrow at {time} with {barber}. See you then!"],
          activity: ["Recorded the booking in the booking system", "Sent the confirmation to the customer"],
          card: true,
          choices: [{ id: "thanks", label: "Thanks", say: "Perfect, thanks!", next: "end" }],
        },
        end: {
          assistant: ["You’re welcome — see you tomorrow."],
          activity: [],
          choices: [],
        },
      },
      card: {
        title: "Booking confirmed",
        system: "Added to the booking system",
        rows: [
          { label: "Service", value: "{service}" },
          { label: "When", value: "Tomorrow · {time}" },
          { label: "Barber", value: "{barber}" },
          { label: "Branch", value: "Olaya" },
        ],
      },
    },
  },
  personalization: {
    title: "Built around the way you work.",
    lead: "A salon isn’t a workshop, and a workshop isn’t a restaurant. We set Talaqa up around your services, team and rules.",
    same: "Every business has its own rules, and Talaqa replies by them.",
    tablistLabel: "Choose a business type",
    messageLabel: "The customer writes",
    replyLabel: "Talaqa replies (translated)",
    ruleLabel: "Business rule",
    businesses: [
      {
        id: "salon",
        name: "Salon",
        profile: "Example: women’s salon · 3 branches",
        message: { text: "أبي صبغة وقص بكرا العصر", gloss: "I’d like a colour and cut tomorrow afternoon." },
        rule: "Colour with a cut is booked as one two-hour slot",
        reply: "Tomorrow afternoon, Noura is free at 4:30 PM. Colour and cut takes about two hours — shall I confirm it?",
      },
      {
        id: "auto",
        name: "Auto workshop",
        profile: "Example: workshop · 2 branches · home pickup",
        message: { text: "أبي صيانة دورية للسيارة بكرا العصر", gloss: "I need a routine service for my car tomorrow afternoon." },
        rule: "Home pickup must be booked 12 hours ahead",
        reply: "Tomorrow at 3:00 PM works at our Malaz branch for an oil change and inspection on your Camry — about 45 minutes. Want us to collect the car from home?",
      },
      {
        id: "fitness",
        name: "Fitness studio",
        profile: "Example: studio · session packs",
        message: { text: "فيه حصة مع فيصل بكرا العصر؟", gloss: "Is there a session with Faisal tomorrow afternoon?" },
        rule: "Cancelling under 6 hours before counts as a used session",
        reply: "Faisal has 4:00 PM and 5:00 PM tomorrow, and you have 4 sessions left. Which works for you?",
      },
      {
        id: "restaurant",
        name: "Restaurant",
        profile: "Example: restaurant · indoor and outdoor seating",
        message: { text: "عندكم جلسات خارجية بكرا العصر؟", gloss: "Any outdoor seating tomorrow afternoon?" },
        rule: "Groups over 8 are passed to the manager",
        reply: "Tomorrow afternoon we have outdoor seating from 5:30 PM. How many of you will there be?",
      },
    ],
  },
  workflow: {
    title: "How it fits into your business.",
    lead: "From the customer’s message to the booking in your system — with your team there when it matters.",
    stages: [
      { id: "customer", name: "Your customer", body: "Writes on WhatsApp in their own words, at any hour." },
      {
        id: "talaqa",
        name: "Talaqa",
        body: "Understands the request, answers only from information you approve, and follows your booking and cancellation rules.",
      },
      { id: "systems", name: "Your systems", body: "Reads real availability and records the booking in your system or calendar." },
      {
        id: "team",
        name: "Your team",
        body: "If Talaqa can’t complete a request, or the customer asks for a person, it hands over with a summary.",
      },
    ],
    channelsTitle: "Works on",
    channels: [
      { id: "whatsapp", name: "WhatsApp" },
      { id: "web", name: "Website chat" },
      { id: "phone", name: "Phone calls" },
    ],
    systemsNote:
      "Booking systems and calendars vary, so in your demo we confirm exactly what connects from day one. We only name a system once a live integration with it is confirmed.",
  },
  start: {
    title: "What would Talaqa look like in your business?",
    lead: "We build it around how you already work. It starts with an email.",
    steps: [
      { title: "You email us", body: "Tell us a little about your business, and we’ll reply to set a time for your demo." },
      { title: "We set it up", body: "We configure Talaqa around your services, team and rules, and connect your systems." },
      { title: "You go live on WhatsApp", body: "Customers start talking to it, and we keep refining it with you." },
    ],
    cta: "Request a demo",
    opensEmail: "Opens an email to",
    mailSubject: "Talaqa demo request",
  },
  footer: {
    tagline: "Your AI receptionist, built around your business.",
    groups: { product: "Product", company: "Talaqa", legal: "Legal" },
    links: { contact: "Contact", privacy: "Privacy", terms: "Terms" },
    rights: "Talaqa",
    languages: "Language",
  },
  pricing: {
    metaTitle: "Pricing",
    metaDescription: "Talaqa plans for your AI receptionist on WhatsApp: for single-location businesses, growing multi-branch teams, and groups with their own systems.",
    title: "Pricing that fits how you work.",
    lead: "Every plan is set up around your business. Pick the size that fits today, and move up as you grow.",
    currency: "SAR",
    perMonth: "/ month including setup",
    custom: "Tailored",
    customNote: "Priced on your branches and systems",
    recommended: "Recommended",
    cta: "Request a demo",
    ctaCustom: "Email us",
    plans: [
      {
        id: "starter",
        name: "Starter",
        desc: "For a single-location business that wants to start quickly.",
        features: [
          { text: "WhatsApp for one branch" },
          { text: "Booking, rescheduling and cancellations" },
          { text: "Answers from your business information" },
          { text: "Hand-off to your team when needed" },
          { text: "Up to 1,000 conversations a month" },
        ],
      },
      {
        id: "growth",
        name: "Growth",
        desc: "For businesses with several branches and a bigger team.",
        features: [
          { text: "Everything in Starter" },
          { text: "Up to 3 branches" },
          { text: "WhatsApp and website chat" },
          { text: "Connected to your booking system" },
          { text: "Confirmations and reminders", status: "beta" },
          { text: "Up to 3,000 conversations a month" },
        ],
      },
      {
        id: "scale",
        name: "Multi-branch",
        desc: "For groups and businesses with their own systems.",
        features: [
          { text: "Everything in Growth" },
          { text: "Unlimited branches" },
          { text: "Custom integrations via API" },
          { text: "Branch-specific rules and routing" },
          { text: "Phone calls", status: "soon" },
          { text: "Ongoing optimisation with our team" },
        ],
      },
    ],
    includedTitle: "Every plan includes",
    included: [
      "Arabic and English, including Gulf dialect as customers really write it",
      "Setup built around your services, team and rules",
      "The booking and escalation rules you set",
      "Continuous improvement of responses",
    ],
    setupTitle: "Setup is on us",
    setupBody:
      "Setup is included in your monthly plan — no separate fee. Before Talaqa talks to your customers, we learn your business and build it around your services, team and rules.",
    faqTitle: "Questions about plans",
    faqs: [
      {
        q: "Is there a separate setup fee?",
        a: "No. Setup is included in the monthly price of Starter and Growth. Multi-branch is priced around your business, and we spell out everything it includes up front.",
      },
      {
        q: "Can I change plans later?",
        a: "Yes. If your business grows or your needs change, we’ll move you to the plan that fits.",
      },
      {
        q: "Does Talaqa work with my booking system?",
        a: "It depends on the system. In your demo we’ll look at what you use and tell you clearly what connects from day one.",
      },
      {
        q: "What happens when Talaqa can’t answer?",
        a: "It hands the conversation to your team with a summary, following the escalation rules you set.",
      },
      {
        q: "Do I need a new WhatsApp number?",
        a: "We’ll go through this with you in the demo and recommend the best way to connect your business number.",
      },
    ],
  },
  legal: { back: "Back to home" },
};

export default en;
