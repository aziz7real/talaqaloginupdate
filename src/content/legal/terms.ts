import type { Locale } from "@/i18n/config";
import type { LegalDoc } from "./types";

/*
 * TODO(legal): have this reviewed by a lawyer before launch. In particular
 * confirm: the registered legal entity, governing law, the liability cap,
 * and the cancellation terms for paid plans.
 */

export const terms: Record<Locale, LegalDoc> = {
  en: {
    title: "Terms of Service",
    description: "The terms for using the talaqa.ai website and the Talaqa AI receptionist service.",
    updated: "2026-10-23",
    intro:
      "These terms govern your use of the talaqa.ai website and the Talaqa service. By using the website or the service, you agree to them. If you have a separate signed agreement with us, that agreement takes priority where the two differ.",
    sections: [
      {
        id: "service",
        heading: "The service",
        body: [
          "Talaqa provides an AI receptionist that replies to customer messages on behalf of businesses, answers questions from information the business provides, manages bookings in connected systems, and hands conversations to the business’s team.",
          "Features marked Beta or Coming soon may change, may be limited, or may not be available to every customer.",
        ],
      },
      {
        id: "setup",
        heading: "Setup and accounts",
        body: [
          "To use Talaqa, a business works with us to set it up. You must give us accurate information about your business and keep it up to date. You are responsible for anyone you allow to manage Talaqa for your business.",
        ],
      },
      {
        id: "responsibilities",
        heading: "Your responsibilities",
        body: [
          "If you use Talaqa for your business, you agree to:",
          [
            "Provide accurate services, prices, opening hours and policies, and update them when they change.",
            "Set the rules Talaqa follows for bookings, cancellations and handing conversations to your team.",
            "Only connect systems, numbers and channels you have the right to use.",
            "Tell your customers they may be talking with an automated assistant where this is required, and have a lawful basis for processing their data.",
            "Follow the terms of any third-party platform you use with Talaqa, such as WhatsApp.",
          ],
        ],
      },
      {
        id: "acceptable-use",
        heading: "Acceptable use",
        body: [
          "You must not use Talaqa to:",
          [
            "Send spam or unsolicited messages.",
            "Mislead, harass or harm anyone.",
            "Break any law or infringe anyone’s rights.",
            "Try to access systems or data you are not authorised to access.",
            "Copy, reverse engineer, overload or disrupt the service.",
          ],
        ],
      },
      {
        id: "ai",
        heading: "Automated responses",
        body: [
          "Talaqa uses automated systems to understand and reply to messages. It is designed to answer from information you approve and to hand over to your team when it cannot complete a request, but automated replies can occasionally be wrong or incomplete.",
          "You should review your setup, keep an eye on important conversations, and tell us straight away if something looks wrong.",
        ],
      },
      {
        id: "data",
        heading: "Your data",
        body: [
          "You keep ownership of your business information and your customers’ data. You give us permission to use it only to provide, secure, support and improve the service for you, as described in our Privacy Policy.",
        ],
      },
      {
        id: "fees",
        heading: "Fees",
        body: [
          "Fees, plan limits and billing terms are set out in your plan or order. Prices shown on our website are a guide and may change; we will tell you in advance before changing the price of an active plan. Fees do not include applicable taxes unless stated otherwise.",
        ],
      },
      {
        id: "third-party",
        heading: "Third-party services",
        body: [
          "Talaqa works with services we do not control, such as messaging platforms, booking systems and calendars. Their availability and terms are their own, and we are not responsible for them.",
        ],
      },
      {
        id: "availability",
        heading: "Availability and changes",
        body: [
          "We work to keep Talaqa available and reliable, but we do not guarantee that it will be uninterrupted or error-free. We may improve or change features over time, and will give you notice of changes that significantly affect how you use the service.",
        ],
      },
      {
        id: "ip",
        heading: "Our intellectual property",
        body: [
          "Talaqa, the talaqa.ai website, and our software, design and branding belong to us. These terms do not give you any rights to them other than the right to use the service as described here.",
        ],
      },
      {
        id: "ending",
        heading: "Suspension and ending",
        body: [
          "You can stop using Talaqa at any time, subject to the terms of your plan. We may suspend or end access if these terms are seriously or repeatedly broken, or where needed to protect the service or other people. When the service ends, we will handle your data as described in our Privacy Policy and our agreement with you.",
        ],
      },
      {
        id: "liability",
        heading: "Disclaimers and liability",
        body: [
          "To the extent the law allows, the service is provided “as is”. We are not liable for indirect or consequential losses, such as lost profits or lost bookings. Our total liability for any claim relating to the service is limited to the fees you paid us in the twelve months before the claim.",
        ],
      },
      {
        id: "law",
        heading: "Governing law",
        body: ["These terms are governed by the laws of the Kingdom of Saudi Arabia."],
      },
      {
        id: "changes",
        heading: "Changes to these terms",
        body: [
          "We may update these terms from time to time. We will change the date at the top, and where changes are significant, we will let our customers know in advance. Continuing to use the service after changes take effect means you accept them.",
        ],
      },
      {
        id: "contact",
        heading: "Contact us",
        body: ["For questions about these terms, email {email}."],
      },
    ],
  },
  ar: {
    title: "الشروط والأحكام",
    description: "شروط استخدام موقع talaqa.ai وخدمة طلاقة لموظف الاستقبال الذكي.",
    updated: "2026-10-23",
    intro:
      "تنظّم هذه الشروط استخدامك لموقع talaqa.ai وخدمة طلاقة. وباستخدامك للموقع أو للخدمة فأنت توافق عليها. وإذا كان بينك وبيننا اتفاقية موقّعة منفصلة، فتُقدَّم تلك الاتفاقية عند وجود أي اختلاف.",
    sections: [
      {
        id: "service",
        heading: "الخدمة",
        body: [
          "يقدّم طلاقة موظف استقبال ذكي يرد على رسائل العملاء نيابةً عن الأنشطة التجارية، ويجيب على الأسئلة من المعلومات التي يزوّدنا بها النشاط، ويدير الحجوزات في الأنظمة المرتبطة، ويحوّل المحادثات لفريق النشاط.",
          "المزايا المشار إليها بـ «تجريبي» أو «قريبًا» قد تتغير، أو تكون محدودة، أو لا تكون متاحة لجميع العملاء.",
        ],
      },
      {
        id: "setup",
        heading: "الإعداد والحسابات",
        body: [
          "لاستخدام طلاقة، يعمل النشاط معنا على إعداده. ويجب أن تزوّدنا بمعلومات صحيحة عن نشاطك وتحدّثها باستمرار، وتكون مسؤولًا عن أي شخص تسمح له بإدارة طلاقة نيابةً عن نشاطك.",
        ],
      },
      {
        id: "responsibilities",
        heading: "مسؤولياتك",
        body: [
          "إذا استخدمت طلاقة لنشاطك، فأنت توافق على ما يلي:",
          [
            "تقديم معلومات صحيحة عن الخدمات والأسعار وأوقات الدوام والسياسات، وتحديثها عند تغيّرها.",
            "تحديد القواعد التي يتبعها طلاقة في الحجز والإلغاء وتحويل المحادثات لفريقك.",
            "عدم ربط أي أنظمة أو أرقام أو قنوات إلا التي يحق لك استخدامها.",
            "إبلاغ عملائك بأنهم قد يتحدثون مع مساعد آلي متى ما كان ذلك مطلوبًا، ووجود أساس نظامي لمعالجة بياناتهم.",
            "الالتزام بشروط أي منصة خارجية تستخدمها مع طلاقة، مثل واتساب.",
          ],
        ],
      },
      {
        id: "acceptable-use",
        heading: "الاستخدام المقبول",
        body: [
          "لا يجوز لك استخدام طلاقة في:",
          [
            "إرسال رسائل مزعجة أو غير مرغوب فيها.",
            "تضليل أي شخص أو مضايقته أو الإضرار به.",
            "مخالفة أي نظام أو التعدّي على حقوق الآخرين.",
            "محاولة الوصول إلى أنظمة أو بيانات غير مصرّح لك بالوصول إليها.",
            "نسخ الخدمة أو الهندسة العكسية لها أو إثقالها أو تعطيلها.",
          ],
        ],
      },
      {
        id: "ai",
        heading: "الردود الآلية",
        body: [
          "يستخدم طلاقة أنظمة آلية لفهم الرسائل والرد عليها. وهو مصمّم ليرد من المعلومات التي تعتمدها، ويحوّل المحادثة لفريقك إذا ما قدر يكمّل الطلب، ولكن قد تكون الردود الآلية أحيانًا غير دقيقة أو غير مكتملة.",
          "ننصحك بمراجعة إعداداتك، ومتابعة المحادثات المهمة، وإبلاغنا فورًا إذا لاحظت شيئًا غير صحيح.",
        ],
      },
      {
        id: "data",
        heading: "بياناتك",
        body: [
          "تبقى ملكية معلومات نشاطك وبيانات عملائك لك. وتمنحنا الإذن باستخدامها فقط لتقديم الخدمة لك وحمايتها ودعمها وتحسينها، كما هو موضح في سياسة الخصوصية.",
        ],
      },
      {
        id: "fees",
        heading: "الرسوم",
        body: [
          "تُحدَّد الرسوم وحدود الباقة وشروط الفوترة في باقتك أو طلبك. والأسعار المعروضة على موقعنا استرشادية وقد تتغير، وسنبلغك مسبقًا قبل تغيير سعر أي باقة فعّالة. ولا تشمل الرسوم الضرائب المعمول بها ما لم يُذكر خلاف ذلك.",
        ],
      },
      {
        id: "third-party",
        heading: "الخدمات الخارجية",
        body: [
          "يعمل طلاقة مع خدمات لا نتحكم فيها، مثل منصات المراسلة وأنظمة الحجز والتقاويم. ولهذه الخدمات شروطها ومستوى توفرها الخاص، ولسنا مسؤولين عنها.",
        ],
      },
      {
        id: "availability",
        heading: "توفّر الخدمة والتغييرات",
        body: [
          "نعمل على أن يكون طلاقة متاحًا وموثوقًا، لكننا لا نضمن أن يعمل دون انقطاع أو أخطاء. وقد نطوّر المزايا أو نغيّرها مع الوقت، وسنبلغك مسبقًا بأي تغيير يؤثر بشكل كبير على طريقة استخدامك للخدمة.",
        ],
      },
      {
        id: "ip",
        heading: "الملكية الفكرية",
        body: [
          "طلاقة وموقع talaqa.ai وبرمجياتنا وتصميمنا وهويتنا التجارية ملك لنا. ولا تمنحك هذه الشروط أي حقوق فيها سوى حق استخدام الخدمة كما هو موضح هنا.",
        ],
      },
      {
        id: "ending",
        heading: "الإيقاف وإنهاء الخدمة",
        body: [
          "تقدر توقف استخدام طلاقة في أي وقت، مع مراعاة شروط باقتك. ويحق لنا إيقاف الوصول أو إنهاؤه عند مخالفة هذه الشروط مخالفة جسيمة أو متكررة، أو عند الحاجة لحماية الخدمة أو الآخرين. وعند انتهاء الخدمة، نتعامل مع بياناتك كما هو موضح في سياسة الخصوصية واتفاقنا معك.",
        ],
      },
      {
        id: "liability",
        heading: "إخلاء المسؤولية وحدودها",
        body: [
          "في الحدود التي يسمح بها النظام، تُقدَّم الخدمة «كما هي». ولسنا مسؤولين عن الخسائر غير المباشرة أو التبعية، مثل خسارة الأرباح أو الحجوزات. ويقتصر إجمالي مسؤوليتنا عن أي مطالبة تتعلق بالخدمة على الرسوم التي دفعتها لنا خلال الاثني عشر شهرًا السابقة للمطالبة.",
        ],
      },
      {
        id: "law",
        heading: "النظام الواجب التطبيق",
        body: ["تخضع هذه الشروط لأنظمة المملكة العربية السعودية."],
      },
      {
        id: "changes",
        heading: "التغييرات على هذه الشروط",
        body: [
          "قد نحدّث هذه الشروط من وقت لآخر. سنغيّر التاريخ في أعلى الصفحة، وإذا كانت التغييرات جوهرية سنبلغ عملاءنا مسبقًا. واستمرارك في استخدام الخدمة بعد سريان التغييرات يعني موافقتك عليها.",
        ],
      },
      {
        id: "contact",
        heading: "تواصل معنا",
        body: ["لأي سؤال عن هذه الشروط، راسلنا على {email}."],
      },
    ],
  },
};
