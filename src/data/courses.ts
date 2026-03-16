export interface CourseTimelineItem {
  day: string;
  title: string;
  topics?: string[];
}

export interface Course {
  id: string;
  slug: string;
  image: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  goal: { ar: string; en: string };
  timeline: { ar: CourseTimelineItem[]; en: CourseTimelineItem[] };
  requirements: { ar: string[]; en: string[] };
  duration: { ar: string; en: string };
  price: { ar: string; en: string };
  contact: {
    phone: string;
    email: string;
    address: { ar: string; en: string };
  };
}

export const courses: Course[] = [
  {
    id: "asic-course",
    slug: "asic-course",
    image: "/assets/courses/asic-course.jpg",
    name: {
      ar: "ASIC Course",
      en: "ASIC Course",
    },
    description: {
      ar: "تصميم الدوائر المتكاملة المتخصصة (ASIC) هو منهجية لتقليل التكلفة والحجم لدائرة إلكترونية أو منتج أو نظام من خلال تصغير الحجم ودمج المكونات الفردية ووظائفها في عنصر واحد - دائرة متكاملة خاصة بالتطبيق (ASIC).\n\nيتكون المنتج الإلكتروني عادةً من العديد من الدوائر المتكاملة (ICs) المترابطة معًا لأداء وظيفة معينة. على سبيل المثال، تم بناء كاشف الدخان في الثمانينات بالكامل من دوائر متكاملة عامة، مثل المكبرات والمقارنات ومنظمات الجهد والمكونات المنفصلة مثل المقاومات والمكثفات.",
      en: "Application-Specific Integrated Circuit (ASIC) design is a methodology to reduce the cost and size of an electronic circuit, product, or system by miniaturizing and integrating individual components and their functions into a single element — an Application-Specific Integrated Circuit (ASIC).\n\nAn electronic product typically consists of many interconnected Integrated Circuits (ICs) performing a specific function. For example, a smoke detector in the 1980s was built entirely from general-purpose ICs, such as amplifiers, comparators, voltage regulators, and discrete components like resistors and capacitors.",
    },
    goal: {
      ar: "التمكن من تحويل كود RTL (Verilog/VHDL) إلى الشريحة (Tape-out)",
      en: "Master the conversion of RTL code (Verilog/VHDL) to chip (Tape-out)",
    },
    timeline: {
      ar: [
        { day: "اليوم 1", title: "مقدمة في فيريلوج" },
        { day: "اليوم 2", title: "أساسيات فيريلوج" },
        { day: "اليوم 3", title: "المواضيع المتقدمة من فيريلوج" },
        { day: "اليوم 4", title: "التطبيق العملي لفيريلوج" },
        { day: "اليوم 5", title: "التطبيق العملي لفيريلوج" },
        { day: "اليوم 6", title: "التطبيق العملي لفيريلوج" },
        { day: "اليوم 7", title: "مقدمة في الدوائر المتكاملة" },
        {
          day: "اليوم 8",
          title: "أساسيات تحليل التوقيت الثابت STA",
          topics: [
            "مسارات التوقيت",
            "متطلبات أساسية للـ Flip-Flops",
            "قيود التوقيت",
          ],
        },
        {
          day: "اليوم 9",
          title: "أدوات سينوبسيس لتصميم الكائنات",
          topics: ["التركيب المنطقي", "التحقق الرسمي", "دليل حول التركيب"],
        },
        {
          day: "اليوم 10",
          title: "تخطيط الشريحة",
          topics: [
            "تخطيط الطاقة",
            "التوزيع",
            "مُجمِّع الدوائر المتكاملة ICC",
          ],
        },
        {
          day: "اليوم 11",
          title: "توليد شجرة الساعة CTS",
          topics: ["التوجيه", "إنهاء الشريحة"],
        },
        {
          day: "اليوم 12",
          title: "دليل كامل",
          topics: [
            "التركيب",
            "التحقق الرسمي",
            "التوزيع والتوجيه PNR",
            "تحليل التوقيت الثابت STA",
          ],
        },
        { day: "اليوم 13", title: "الاستخراج و تحليل التوقيت الثابت STA" },
        {
          day: "اليوم 14",
          title: "تقليل التداخل الكهرومغناطيسي EMIR",
          topics: ["تقدير الطاقة"],
        },
      ],
      en: [
        { day: "Day 1", title: "Introduction to Verilog" },
        { day: "Day 2", title: "Verilog Fundamentals" },
        { day: "Day 3", title: "Advanced Verilog Topics" },
        { day: "Day 4", title: "Verilog Practical Application" },
        { day: "Day 5", title: "Verilog Practical Application" },
        { day: "Day 6", title: "Verilog Practical Application" },
        { day: "Day 7", title: "Introduction to Integrated Circuits" },
        {
          day: "Day 8",
          title: "STA Static Timing Analysis Fundamentals",
          topics: [
            "Timing Paths",
            "Flip-Flop Basic Requirements",
            "Timing Constraints",
          ],
        },
        {
          day: "Day 9",
          title: "Synopsys Design Object Tools",
          topics: [
            "Logic Synthesis",
            "Formal Verification",
            "Synthesis Guide",
          ],
        },
        {
          day: "Day 10",
          title: "Chip Floorplanning",
          topics: [
            "Power Planning",
            "Placement",
            "ICC Integrated Circuit Compiler",
          ],
        },
        {
          day: "Day 11",
          title: "Clock Tree Synthesis CTS",
          topics: ["Routing", "Chip Finishing"],
        },
        {
          day: "Day 12",
          title: "Complete Guide",
          topics: [
            "Synthesis",
            "Formal Verification",
            "Place and Route PNR",
            "Static Timing Analysis STA",
          ],
        },
        { day: "Day 13", title: "Extraction & Static Timing Analysis STA" },
        {
          day: "Day 14",
          title: "EMIR Electromagnetic Interference Reduction",
          topics: ["Power Estimation"],
        },
      ],
    },
    requirements: {
      ar: [
        "يجب على الطالب أن يكون قد حضر الجلسات النظرية عبر الإنترنت قبل الجلسات العملية / التطبيقية.",
        "يجب أن يكون لديه معرفة جيدة بلغات HDL مثل VHDL / Verilog في حال أخذوا الدورة بدون جزء Verilog.",
      ],
      en: [
        "Students must have attended the online theoretical sessions before the practical/applied sessions.",
        "Must have good knowledge of HDL languages such as VHDL/Verilog if taking the course without the Verilog part.",
      ],
    },
    duration: {
      ar: "72 ساعة\n6 ساعات لكل جلسة ASIC\n4 ساعات لكل جلسة Verilog",
      en: "72 hours\n6 hours per ASIC session\n4 hours per Verilog session",
    },
    price: {
      ar: "تواصل معنا للسعر",
      en: "Contact us for pricing",
    },
    contact: {
      phone: "(+20) 120 882 2401",
      email: "info.qader.eg",
      address: {
        ar: "17 الزهور، الفردوس، مدينة 6 أكتوبر، الجيزة، مصر",
        en: "17 Al-Zuhour, Al-Firdous, 6th of October City, Giza, Egypt",
      },
    },
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find((c) => c.slug === slug);
}

export function getAllCourses(): Course[] {
  return courses;
}
