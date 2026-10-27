import type { Locale } from "@/i18n/config";
import type { LegalDoc } from "./types";

/*
 * TODO(legal): have this reviewed by a lawyer before launch, and add the
 * company's registered legal name and commercial registration details.
 */

export const privacy: Record<Locale, LegalDoc> = {
  en: {
    title: "Privacy Policy",
    description: "How Talaqa collects, uses and protects information on the talaqa.ai website and in the Talaqa service.",
    updated: "2026-10-23",
    intro:
      "This policy explains what information Talaqa collects, how we use it, and the choices you have. It covers the talaqa.ai website and the Talaqa service we provide to businesses.",
    sections: [
      {
        id: "who-we-are",
        heading: "Who we are",
        body: [
          "Talaqa (“Talaqa”, “we”, “us”) provides an AI receptionist service that helps businesses answer customer messages, manage appointments and hand conversations to their teams. You can contact us at {email}.",
        ],
      },
      {
        id: "roles",
        heading: "Businesses and their customers",
        body: [
          "Businesses that use Talaqa (“our customers”) decide how Talaqa is used with their own customers. When Talaqa handles a conversation for a business, that business is responsible for the personal data in it, and we process that data on its behalf and according to its instructions.",
          "If you messaged a business that uses Talaqa and have a question about your data, please contact that business first. We will help it respond.",
        ],
      },
      {
        id: "collect",
        heading: "Information we collect",
        body: [
          [
            "Information you send us: your name, email address, phone number, business name and message when you request a demo or contact us.",
            "Business information: details our customers provide to set up Talaqa, such as services, staff names, branches, opening hours, prices, policies and booking rules, and contact details for their team.",
            "Conversation data: when someone messages a business that uses Talaqa, the messages, the name or number they use on that channel, and booking details such as the service, time and branch.",
            "Technical information: basic information your browser or device sends when you visit the website, such as IP address, browser type and the pages requested, which our hosting provider may log for security and reliability.",
          ],
        ],
      },
      {
        id: "use",
        heading: "How we use information",
        body: [
          [
            "To reply to demo requests and enquiries.",
            "To set up, provide and support the service for our customers.",
            "To answer customer messages and complete bookings according to each business’s rules.",
            "To hand conversations to a business’s team when needed.",
            "To keep the service secure, prevent misuse and fix problems.",
            "To improve how Talaqa responds for the business it is set up for.",
            "To meet our legal obligations.",
          ],
          "We do not sell personal data.",
        ],
      },
      {
        id: "sharing",
        heading: "Who we share it with",
        body: [
          "We share information only as needed to run the service:",
          [
            "With the business you are communicating with.",
            "With service providers that help us operate Talaqa, such as hosting, messaging (for example WhatsApp, provided by Meta) and AI and language-processing providers. They may use it only to provide their services to us.",
            "With systems a business chooses to connect to Talaqa, such as its booking or calendar system.",
            "When required by law, or to protect the rights, safety and security of others.",
            "As part of a merger, acquisition or sale of our business, in which case we will let affected customers know.",
          ],
        ],
      },
      {
        id: "transfers",
        heading: "Processing outside your country",
        body: [
          "Some of our service providers may process information outside your country. When that happens, we take steps to protect it in line with applicable law.",
        ],
      },
      {
        id: "retention",
        heading: "How long we keep it",
        body: [
          "We keep information only as long as we need it for the purposes above. Conversation data is kept according to each business’s settings and our agreement with that business. Information from demo requests is kept while we are in touch with you and deleted when it is no longer needed.",
        ],
      },
      {
        id: "security",
        heading: "Security",
        body: [
          "We use reasonable technical and organisational measures to protect information, such as encrypted connections and limited access. No system is completely secure, so we cannot guarantee absolute security.",
        ],
      },
      {
        id: "rights",
        heading: "Your choices and rights",
        body: [
          "Depending on where you live, you may have the right to ask for access to, correction of, or deletion of your personal data, to object to or restrict certain processing, and to withdraw your consent.",
          "To make a request, email {email}. If your request is about a conversation with a business, we may pass it to that business.",
        ],
      },
      {
        id: "cookies",
        heading: "Cookies",
        body: [
          "This website does not use advertising or analytics cookies. It may use essential storage that the site needs to work.",
        ],
      },
      {
        id: "children",
        heading: "Children",
        body: [
          "Talaqa is a service for businesses and is not directed at children. We do not knowingly collect information from children through this website.",
        ],
      },
      {
        id: "changes",
        heading: "Changes to this policy",
        body: [
          "We may update this policy from time to time. We will change the date at the top, and where changes are significant, we will let our customers know in advance.",
        ],
      },
      {
        id: "contact",
        heading: "Contact us",
        body: ["For questions or requests about this policy, email {email}."],
      },
    ],
  },
  ar: {
    title: "سياسة الخصوصية",
    description: "كيف يجمع طلاقة المعلومات ويستخدمها ويحميها في موقع talaqa.ai وفي خدمة طلاقة.",
    updated: "2026-10-23",
    intro:
      "توضح هذه السياسة المعلومات التي يجمعها طلاقة، وكيف نستخدمها، والخيارات المتاحة لك. وتشمل موقع talaqa.ai وخدمة طلاقة التي نقدّمها للأنشطة التجارية.",
    sections: [
      {
        id: "who-we-are",
        heading: "من نحن",
        body: [
          "طلاقة («طلاقة» أو «نحن») يقدّم خدمة موظف استقبال ذكي يساعد الأنشطة التجارية على الرد على رسائل عملائها، وإدارة المواعيد، وتحويل المحادثات لفرقها. تقدر تتواصل معنا على {email}.",
        ],
      },
      {
        id: "roles",
        heading: "الأنشطة التجارية وعملاؤها",
        body: [
          "الأنشطة التي تستخدم طلاقة («عملاؤنا») هي التي تحدد طريقة استخدام طلاقة مع عملائها. وعندما يتولى طلاقة محادثة نيابةً عن نشاط معيّن، يكون هذا النشاط مسؤولًا عن البيانات الشخصية في المحادثة، ونعالج نحن هذه البيانات نيابةً عنه ووفق تعليماته.",
          "إذا راسلت نشاطًا يستخدم طلاقة وعندك سؤال عن بياناتك، تواصل مع النشاط نفسه أولًا، وبنساعده في الرد عليك.",
        ],
      },
      {
        id: "collect",
        heading: "المعلومات التي نجمعها",
        body: [
          [
            "المعلومات التي ترسلها لنا: اسمك، بريدك الإلكتروني، رقم جوالك، اسم نشاطك ورسالتك عند طلب عرض تجريبي أو التواصل معنا.",
            "معلومات النشاط: التفاصيل التي يزوّدنا بها عملاؤنا لإعداد طلاقة، مثل الخدمات، أسماء الموظفين، الفروع، أوقات الدوام، الأسعار، السياسات وقواعد الحجز، وبيانات التواصل مع فريقهم.",
            "بيانات المحادثات: عندما يراسل شخص نشاطًا يستخدم طلاقة، نتعامل مع الرسائل، والاسم أو الرقم الذي يستخدمه على تلك القناة، وتفاصيل الحجز مثل الخدمة والوقت والفرع.",
            "المعلومات التقنية: معلومات أساسية يرسلها متصفحك أو جهازك عند زيارة الموقع، مثل عنوان IP ونوع المتصفح والصفحات المطلوبة، وقد يسجّلها مزوّد الاستضافة لأغراض الأمان والاستقرار.",
          ],
        ],
      },
      {
        id: "use",
        heading: "كيف نستخدم المعلومات",
        body: [
          [
            "للرد على طلبات العرض التجريبي والاستفسارات.",
            "لإعداد الخدمة وتقديمها ودعم عملائنا فيها.",
            "للرد على رسائل العملاء وإتمام الحجوزات حسب قواعد كل نشاط.",
            "لتحويل المحادثات لفريق النشاط عند الحاجة.",
            "لحماية الخدمة ومنع إساءة استخدامها وإصلاح المشاكل.",
            "لتحسين ردود طلاقة للنشاط الذي أُعدّ له.",
            "للالتزام بمتطلباتنا النظامية.",
          ],
          "لا نبيع البيانات الشخصية.",
        ],
      },
      {
        id: "sharing",
        heading: "مع من نشارك المعلومات",
        body: [
          "نشارك المعلومات فقط بالقدر اللازم لتشغيل الخدمة:",
          [
            "مع النشاط الذي تتواصل معه.",
            "مع مزوّدي الخدمات الذين يساعدوننا في تشغيل طلاقة، مثل الاستضافة، والمراسلة (مثل واتساب المقدّم من Meta)، ومزوّدي الذكاء الاصطناعي ومعالجة اللغة، ولا يحق لهم استخدامها إلا لتقديم خدماتهم لنا.",
            "مع الأنظمة التي يختار النشاط ربطها بطلاقة، مثل نظام الحجز أو التقويم.",
            "عندما يتطلب النظام ذلك، أو لحماية حقوق الآخرين وسلامتهم وأمنهم.",
            "في حال اندماج أو استحواذ أو بيع لنشاطنا، وفي هذه الحالة نبلغ العملاء المتأثرين.",
          ],
        ],
      },
      {
        id: "transfers",
        heading: "المعالجة خارج بلدك",
        body: [
          "قد يعالج بعض مزوّدي الخدمات المعلومات خارج بلدك، وفي هذه الحالة نتخذ الخطوات اللازمة لحمايتها وفق الأنظمة المعمول بها.",
        ],
      },
      {
        id: "retention",
        heading: "مدة الاحتفاظ بالمعلومات",
        body: [
          "نحتفظ بالمعلومات فقط طوال المدة اللازمة للأغراض المذكورة. وتُحفظ بيانات المحادثات حسب إعدادات كل نشاط واتفاقنا معه. أما معلومات طلبات العرض التجريبي فنحتفظ بها طوال فترة تواصلنا معك، ونحذفها عند انتهاء الحاجة إليها.",
        ],
      },
      {
        id: "security",
        heading: "الأمان",
        body: [
          "نستخدم إجراءات تقنية وتنظيمية معقولة لحماية المعلومات، مثل الاتصالات المشفّرة وتقييد الوصول. ومع ذلك لا يوجد نظام آمن بالكامل، ولذلك لا نستطيع ضمان الأمان المطلق.",
        ],
      },
      {
        id: "rights",
        heading: "خياراتك وحقوقك",
        body: [
          "حسب مكان إقامتك، قد يحق لك طلب الاطلاع على بياناتك الشخصية أو تصحيحها أو حذفها، والاعتراض على بعض أنواع المعالجة أو تقييدها، وسحب موافقتك.",
          "لتقديم طلب، راسلنا على {email}. وإذا كان طلبك يخص محادثة مع نشاط معيّن، قد نحوّله لذلك النشاط.",
        ],
      },
      {
        id: "cookies",
        heading: "ملفات تعريف الارتباط",
        body: [
          "لا يستخدم هذا الموقع ملفات تعريف ارتباط إعلانية أو تحليلية، وقد يستخدم تخزينًا أساسيًا يحتاجه الموقع ليعمل.",
        ],
      },
      {
        id: "children",
        heading: "الأطفال",
        body: [
          "طلاقة خدمة موجّهة للأنشطة التجارية وليست موجّهة للأطفال، ولا نجمع عن قصد معلومات من الأطفال عبر هذا الموقع.",
        ],
      },
      {
        id: "changes",
        heading: "التغييرات على هذه السياسة",
        body: [
          "قد نحدّث هذه السياسة من وقت لآخر. سنغيّر التاريخ في أعلى الصفحة، وإذا كانت التغييرات جوهرية سنبلغ عملاءنا مسبقًا.",
        ],
      },
      {
        id: "contact",
        heading: "تواصل معنا",
        body: ["لأي سؤال أو طلب يخص هذه السياسة، راسلنا على {email}."],
      },
    ],
  },
};
