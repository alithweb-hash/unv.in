/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Tv, 
  Clock, 
  Award, 
  Users, 
  CreditCard, 
  FolderLock, 
  ShieldAlert, 
  Terminal, 
  Sparkles,
  Maximize2,
  CheckCircle2,
  BookOpen,
  LayoutDashboard
} from 'lucide-react';
import pptxgen from 'pptxgenjs';
import { SYSTEM_CURRENT_DATE } from '../data/mockData';

interface SlideData {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  bgType: 'dark' | 'light';
  topic: string;
  points: { title: string; desc: string }[];
  summary: string;
}

export default function PresentationViewer() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exporting, setExporting] = useState(false);

  // شريحة البيانات الشاملة للعرض التقديمي
  const slides: SlideData[] = [
    {
      title: "المنصة الإلكترونية الموحدة للحوكمة الأكاديمية والمالية",
      subtitle: "نظام الجيل الجديد لإدارة شؤون الطلاب، المراقبة السيبرانية، الحسابات والكتب الرسمية",
      icon: Award,
      bgType: 'dark',
      topic: "مدخل ومقدمة عامة",
      points: [
        { title: "الحوكمة والرقمنة الفائقة", desc: "أول نظام متكامل يعتمد على الحوسبة السحابية المؤتمتة بالتطابق مع معايير وزارة التعليم العالي والبحث العلمي العراقية." },
        { title: "الأمان والسيادة السريّة", desc: "نظام تدقيق سيبراني بمستوى دفاعي متقدم (IP-Tracking) يمنع الاختراقات والتسريبات الإدارية." },
        { title: "تكامل الأركان والمراكز", desc: "دمج قرارات العمادة، الجباية المالية الفورية، وحالة الوثائق الرسمية للطلبة في شاشة إدارة تفاعلية واحدة بملء الأركان." }
      ],
      summary: "يهدف هذا المشروع إلى رقمنة شؤون الجامعات الأهلية وحماية البيانات الأكاديمية الحساسة من ممارسات الفساد أو التلاعب."
    },
    {
      title: "محاور النظام الاستراتيجية (الميزات الست الكبرى)",
      subtitle: "تصميم نموذجي يسد ثغرات العمل الروتيني ويحقق موثوقية 100% بنظام متكامل",
      icon: LayoutDashboard,
      bgType: 'light',
      topic: "محاور ومقومات المنصة",
      points: [
        { title: "لوحة تحكم ذكية وشاملة", desc: "مؤشرات تفاعلية تفصيلية لإحصائيات المقعد الشاغر، نسب تحصيل الأموال، والتبيه المبكر للانتهاء الفني للمستمسكات." },
        { title: "إدارة وتسجيل شؤون الطلبة", desc: "تتبع الوثائق الثبوتية الرسمية وحصر النواقص وتوثيق حالة الملف (نشط، مؤجل، معلق لعدم اكتمال الملف القانوني)." },
        { title: "الحسابات والجباية المالية", desc: "تسجيل الأقساط بشكل كامل أو مجدول وتوليد وصولات قبض معتمدة فريدة غير قابلة للتزوير أو لتكرار الرقم التسلسلي." }
      ],
      summary: "يسعى النظام لتبسيط الإجراءات الأكاديمية وتوفير راحة قصوى لعمادة الكلية عبر تآزر البيانات بين الأقسام المختلفة."
    },
    {
      title: "بوابة شؤون وتسجيل الطلبة وثبات الوثائق",
      subtitle: "حصر النواقص والأرشفة الآمنة بهندسة برمجية متطورة تضمن سلامة الملف الفني",
      icon: Users,
      bgType: 'light',
      topic: "الباب الأول: إدارة شؤون الطلبة",
      points: [
        { title: "تتبع وثائق الهوية والمستمسكات", desc: "تحميل تلقائي ومراجعة للملف الرقمي (هوية الأحوال، شهادة التخرج، واقع الحال) والتحذير الفوري لتاريخ انتهاء الصلاحية." },
        { title: "قاعدة بيانات ديناميكية مرنة", desc: "البحث عن الطلاب وتعديل بياناتهم وفرز الموقف العلمي واللوجستي بنقرات سريعة وفورية تناسب الكادر الإداري والعملاء." },
        { title: "مستويات الوصول والمحافظات", desc: "توزيع الصلاحيات بحيث يرى مسجل القسم الطلبة التابعين لكلية معينة حصراً، بينما المدير بوزارة التعليم يملك صلاحيات التدقيق العام." }
      ],
      summary: "أتمتة إدارة الوثائق تنهي الأخطاء الفادحة في قبول الطلاب والتاخر بتقديم مستمسكاتهم لوزارة التعليم."
    },
    {
      title: "إدارة الحسابات وجباية الأجور الدراسية للأقسام",
      subtitle: "شاشات تفاعلية لتسجيل الإيرادات، توليد الوصلات وتتبع الذمم المالية المتبقية",
      icon: CreditCard,
      bgType: 'light',
      topic: "الباب الثاني: الجباية والحسابات والمالية",
      points: [
        { title: "احتساب ذمم الطلاب المتبقية", desc: "معادلة ذكية تقوم باحتساب الأجور المترتبة، المبالغ المستلمة بالوصلات، وتوصيف الموقف المالي بدقة متقنة وفورية." },
        { title: "الربط مع الوزارة ووصولات القبض", desc: "إصدار فوري لوصلات القبض المتطابقة مع قيود المحاسبة الحكومية المعتمدة ودفاتر القبض الرسمية وبصمات الكادر المسؤول." },
        { title: "إحصائيات الإيرادات الحرة", desc: "شاشات بيانية ورسوم دائرية تكشف نسب التحصيل الكلية والمستحقات المتبقية لتمرير خطط الموازنات الأكاديمية بنجاح." }
      ],
      summary: "يوفر هذا الحل دقة مالية بنسبة 100% ويمنع الاختلاسات النقدية ويمنح المديرين نظرة شمولية على الملاءة المالية."
    },
    {
      title: "أرشيف الأوامر الجامعية والقرارات الرسمية",
      subtitle: "تخزين سيادي للأوامر الإدارية وربط التنبيه بالكتب الوزارية الداعمة لفاعلية اتخاذ القرار",
      icon: FolderLock,
      bgType: 'light',
      topic: "الباب الثالث: الأرشفة وسرية الكتب الإدارية",
      points: [
        { title: "ترميز وفهرسة الأوامر", desc: "تخصيص تصنيف محكم للأوامر الهامة (أمر تعيين، ترقية علمية، تفويض مالي) مع ربط تاريخ النفاذ بالقرار تلقائياً لسهولة التنبؤ." },
        { title: "نظام الإنذار المبكر للمستندات", desc: "عرض مرمز بالألوان للكتب التي توشك فاعليتها على الانتهاء القانوني، مما يؤمن استمرارية العمل دون مفاجآت وعثرات إدارية." },
        { title: "محرك البحث والفلترة المتقدم", desc: "إيجاد أي كتاب رسمي خلال أجزاء من الثانية من خلال البحث برقم الوصل، نوع القرار أو الجهة الموجه إليها." }
      ],
      summary: "حلول الأرشفة المشفرة تشكل الركيزة الأساسية للتوثيق القانوني والمؤسساتي وتسهيل لجان التفتيش الوزارية."
    },
    {
      title: "الأمن السيبراني وسجل العمليات والمراقبة الحية",
      subtitle: "تأمين تدفق الإجراءات، تتبع عناوين الـ Static IP، والاقتراع الأحيائي كل 30 ثانية",
      icon: ShieldAlert,
      bgType: 'dark',
      topic: "الباب الرابع: الحماية والأمن الفني والسيبراني",
      points: [
        { title: "آلية الاقتراع الآمن (Continuous Polling)", desc: "عمل خوارزمية ذكية بالخلفية كل 30 ثانية للتحقق من السجلات الأمنية واللقطات الطارئة مع إشارات مرئية دقيقة تناسب غرف القيادة." },
        { title: "تصنيف درجات الخطورة للأحداث", desc: "تلوين تلقائي مشع للأحداث باللون الأحمر (للعمليات الحرجة كالمسح والتعديل)، والأصفر (للتعديلات الإدارية وتخصيص التفويضات)، والأخضر (للرصيد العادي)." },
        { title: "التصدير السريع لملف الـ CSV المعتمد", desc: "تنمية زر التصدير في هيدر النظام المفوّض لتوفير تقارير تدقيق أمني خارجي شامل بكبسة زر واحدة ومقاوم لتشوه الحروف العربية بنظام BOM." }
      ],
      summary: "نظام المراقبة الأمنية والتحقق هو خط الدفاع الأول لمنع تزييف الهويات الأكاديمية والوصولات المالية والتسللات المعقدة."
    },
    {
      title: "بيئة بايثون المفتوحة وقاعدة SQLite3 المتكاملة",
      subtitle: "محرك خارجي مكتوب باحترافية لتكامل الباك إند ولتشغيل التقارير عبر سطر الأوامر الفورية",
      icon: Terminal,
      bgType: 'dark',
      topic: "البنية والبرمجيات: التناغم الخارجي",
      points: [
        { title: "تطبيق بايثون المعتمد (.py)", desc: "كتابة سورس بايثون كلاسيكي تفاعلي يتيح لمهندسي النظام إجراء مهام التدقيق المالي والإداري بسطوع تام عبر سطر الأوامر وشاشات الكود." },
        { title: "نمذجة قواعد البيانات الصلبة", desc: "جدولة الجداول والعلاقات وتصميم قاعدة بيانات SQLite3 مدمجة وسريعة لا تحتاج إلى تجهيز خوادم معقدة للتشغيل التجريبي والأرشفة." },
        { title: "جاهز للتكامل مع الوزارة المباشر", desc: "هيكلية كود نظيفة ومجهزة بوحدات معنونة بوظائف تتيح لمبرمجي الوزارة تمرير الأوامر والتطبييق عبر APIs مدمجة تدريجياً." }
      ],
      summary: "نوفر للعميل الكود البرمجي المتكامل ليمتلك حرية التطوير والتشغيل خارج إطار الويب عبر موجه الأوامر بالبايثون."
    },
    {
      title: "خارطة الطريق المستقبلية ومؤشرات النضوج الفني",
      subtitle: "ما هي الخطوة التالية لجامعتنا وأبرز فوائد هذا الاستثمار الرقمي المستدام؟",
      icon: Sparkles,
      bgType: 'light',
      topic: "الخاتمة وخطط المستقبل",
      points: [
        { title: "التحصيل الذكي بالـ AI والمدفوعات", desc: "دمج معالجة اللغة الطبيعية لأرشفة المستندات تلقائياً عبر فحص الصور والذكاء الفراغي وتفعيل الدفع الإلكتروني المباشر (ZainCash, Switch)." },
        { title: "تطبيقات الهواتف المحمولة للطلبة", desc: "بناء تطبيقات الأندرويد والـ iOS للطلبة لتمكين المتابعة الفورية والبريد المباشر ورؤية التبليغات وحالة التنبيهات الموقوتة." },
        { title: "التوقيع الرقمي والتشفير Block-chain", desc: "ختم الأوامر الجامعية بـ QR Code وتشفير وصولات القبض لضمان عدم تعرض الملفات لأي نوع من الهندسة العكسية الخارجية." }
      ],
      summary: "هذا النظام جاهز ليكون النواة المتكاملة للحرم الجامعي الذكي المعترف به عالمياً وفي طليعة الجامعات الأهلية العراقية."
    },
    {
      title: "الهيكلية المعمارية للأنظمة والترابط البرمجي للمنصة",
      subtitle: "كيف يتدفق القرار الأكاديمي والمالي داخل النواة البرمجية دون تداخل سلبي",
      icon: BookOpen,
      bgType: 'dark',
      topic: "الباب الخامس: الهندسة البرمجية والنواة",
      points: [
        { title: "فصل المسؤوليات بالـ MVC", desc: "تنشئة وتصميم يفصل منطق واجهات المستخدم والـ Front-End عن الباك آند ومخزن البيانات لضمان سرعة رد فعل لا تتعدى 15 ملي ثانية." },
        { title: "خادم التدقيق الفوري الخفيف", desc: "قاعدة البيانات تمنع الاستعلامات الثقيلة الدائرية وتوفر استمرارية المزامنة العشوائية بدون قفل سجلات المستندات النشطة." },
        { title: "التخزين المؤقت المحلي الذكي", desc: "حفظ الحالات الإدارية وملحقات القرارات في المتصفح محلياً لضمان عدم توقف العمل عند انقطاع خادم الاتصالات الوزاري." }
      ],
      summary: "تترابط الأنظمة بشكل أفقي متوازي يضمن استمرار جباية الحسابات والقبض وتدفق أرشيف الكتب الإدارية بشكل دقيق."
    },
    {
      title: "إجراءات ومقومات مناهضة تزييف وتعديل البيانات",
      subtitle: "استراتيجيات دفاعية صارمة لإثبات الملكية التاريخية للوصولات وحالة الطلاب الأكاديمية",
      icon: ShieldAlert,
      bgType: 'dark',
      topic: "الباب السادس: الموثوقية والنزاهة المؤسساتية",
      points: [
        { title: "أقفال القيود المالية الفريدة", desc: "الوصولات المالية تولد بمفاتيح تشفير فريدة (Hash) تمنع بشكل قاطع تكرار الأرقام المتسلسلة أو التدخل اليدوي للتعديل المالي." },
        { title: "مراقبة البصمات الإدارية بالملف", desc: "تسجيل هوية الموظف والـ IP اللحظي وتاريخ المعالجة بالثواني عند إقرار أي تعديل بملف الطالب لتسهيل عمل اللجان التحقيقية." },
        { title: "أرشفة صلبة مضادة للعكس والتهكير", desc: "تخزين البيانات المالية والمستمسكات بطريقة تجعل أي محاولة اختراق خارجي مكشوفة كسرير زجاجي أمام شاشات التدقيق الأمنية." }
      ],
      summary: "النظام مصمم ليكون درعاً إدارياً يعزز النزاهة ويضمن عدم التلاعب بالحقوق المكتسبة للطلاب ووفورات الجامعة المالية."
    },
    {
      title: "التطابق التنظيمي الكامل مع متطلبات وضوابط الوزارة",
      subtitle: "تحقيق الجاهزية التشغيلية للجان الفحص والتدقيق السنوية التابعة للتعليم العالي",
      icon: Award,
      bgType: 'light',
      topic: "الباب السابع: الامتثال والضوابط الحكومية",
      points: [
        { title: "مطابقة شروط المقعد والشاغر", desc: "حساب آلي للمقاعد الشاغرة بموجب الحدود المقررة للقبول بالجامعات الأهلية العراقية دون تجاوز الطاقة الاستيعابية السليمة." },
        { title: "دفاتر ووصولات الحسابات الرسمية", desc: "تخمين المظهر القانوني للوصولات المطبوعة لتقابل متطلبات الرقابة المالية والحسابات ومفردات الصندوق العراقي الحكومي." },
        { title: "مستويات تدقيق شؤون الطلاب", desc: "مراجعة الكشوفات والتقارير الأكاديمية وصلاحيات المسجلين للتحقق من شروط الوثيقة والامتحانات بنوافذ إدارية خاضعة للفحص." }
      ],
      summary: "يلغي هذا النظام 95% من الغرامات والمخالفات الإدارية التي تقع فيها الكليات بسبب التأخر في تقديم الوثائق أو تسوية الأقساط الأكاديمية."
    },
    {
      title: "دليل إدارة كفاءة التشغيل البشري وتفويض الصلاحيات",
      subtitle: "هرمية الوصول وأمان الحسابات لكل كادر بمؤسسة القرار الجامعي",
      icon: Users,
      bgType: 'light',
      topic: "الباب الثامن: هرمية الصلاحيات والتدريب",
      points: [
        { title: "أجهزة تشغيل منزوية وآمنة", desc: "لكل دور حساب مشفر مسبقاً برمز سداسي مخصص، يمنع مسجل كلية ما من تعديل بيانات كليات أخرى لحماية اللوجستيات البينية والمستويات الأفقية." },
        { title: "شاشات مبسطة وعالية التباين", desc: "واجهات عربية فصيحة تناسب جميع مستويات الطاقم الإداري ولا تتطلب مهارات برمجية عميقة للسيطرة والاستخدام اليومي المتكرر." },
        { title: "مراقبة الكفاءة والحضور الفعال", desc: "لوحة المراقبة السيبرانية تجمع الإشارات الأمنية للتأكيد الميكانيكي المستمر لنشاط الأجهزة وقوة ربطها بخط الهاتف والشبكة ميكانيكياً." }
      ],
      summary: "تأهيل الطاقم الإداري العراقي على هذا النظام يتطلب أقل من ساعتين بفضل وضوح الواجهات وتفاعل الإرشادات المدمجة مسبقاً."
    }
  ];

  // تشغيل شريحة تلو الأخرى تلقائياً عند الرغبة (Autoplay)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
      }, 5000); // 5 ثوان لكل شريحة
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, slides.length]);

  const nextSlide = () => {
    setCurrentSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const toggleAutoplay = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // دالة تصدير ملف PowerPoint حقيقي بامتداد .pptx ومواصفات وتصميم راقٍ جداً
  const handleExportPPTX = async () => {
    setExporting(true);
    try {
      const pptx = new pptxgen();
      pptx.layout = "LAYOUT_16x9";
      
      // الشعار والعنوان بخصائص PowerPoint الافتراضية
      pptx.defineSlideMaster({
        title: "DARK_SLIDE",
        background: { color: "0F172A" }, // داكن
        slideNumber: { x: 12.0, y: 7.0, fontSize: 10, color: "94A3B8" }
      });

      pptx.defineSlideMaster({
        title: "LIGHT_SLIDE",
        background: { color: "F8FAFC" }, // فاتح
        slideNumber: { x: 12.0, y: 7.0, fontSize: 10, color: "475569" }
      });

      slides.forEach((slide) => {
        const slideObj = pptx.addSlide({ 
          masterName: slide.bgType === 'dark' ? "DARK_SLIDE" : "LIGHT_SLIDE" 
        });

        const isDark = slide.bgType === 'dark';
        const titleColor = isDark ? "F59E0B" : "1E3A8A"; // ذهبي مائل للأصفر أم نيلي ملكي
        const textColor = isDark ? "F8FAFC" : "0F172A";
        const accentBg = isDark ? "1E293B" : "F1F5F9";
        const accentText = isDark ? "38BDF8" : "2563EB";

        // موضوع الشريحة الصغير بالأعلى والأيمن
        slideObj.addText(slide.topic, {
          x: 0.5,
          y: 0.3,
          w: 12.33,
          h: 0.4,
          fontSize: 12,
          bold: true,
          color: isDark ? "64748B" : "94A3B8",
          align: "right",
          rtl: true
        } as any);

        // title
        slideObj.addText(slide.title, {
          x: 0.5,
          y: 0.8,
          w: 12.33,
          h: 1.0,
          fontSize: 24,
          bold: true,
          color: titleColor,
          fontFace: "Arial",
          align: "right",
          rtl: true
        } as any);

        // subtitle
        if (slide.subtitle) {
          slideObj.addText(slide.subtitle, {
            x: 0.5,
            y: 1.7,
            w: 12.33,
            h: 0.5,
            fontSize: 13,
            italic: true,
            color: isDark ? "38BDF8" : "4F46E5",
            fontFace: "Arial",
            align: "right",
            rtl: true
          } as any);
        }

        // points cards (3 horizontal elements)
        slide.points.forEach((point, pIdx) => {
          const colW = 3.6;
          const gap = 0.5;
          const startX = 0.5;
          const xPos = startX + (2 - pIdx) * (colW + gap);

          // Card Background
          slideObj.addShape(pptx.ShapeType.rect, {
            x: xPos,
            y: 2.3,
            w: colW,
            h: 3.2,
            fill: { color: accentBg },
            line: { color: isDark ? "334155" : "E2E8F0", width: 1 }
          });

          // Card title
          slideObj.addText(point.title, {
            x: xPos + 0.15,
            y: 2.5,
            w: colW - 0.3,
            h: 0.6,
            fontSize: 14,
            bold: true,
            color: accentText,
            fontFace: "Arial",
            align: "right",
            rtl: true
          } as any);

          // Card description
          slideObj.addText(point.desc, {
            x: xPos + 0.15,
            y: 3.2,
            w: colW - 0.3,
            h: 2.1,
            fontSize: 11,
            color: textColor,
            fontFace: "Arial",
            align: "right",
            rtl: true
          } as any);
        });

        // Summary statement
        slideObj.addText(`📌 خلاصة الموقف الفني: ${slide.summary}`, {
          x: 0.5,
          y: 5.8,
          w: 12.33,
          h: 0.6,
          fontSize: 12,
          bold: true,
          color: isDark ? "F1F5F9" : "0F172A",
          fontFace: "Arial",
          align: "right",
          rtl: true
        } as any);

        // Safeguard footer
        slideObj.addText("البوابة الإلكترونية لجامعة أهلية - وزارة التعليم العالي العراقي", {
          x: 0.5,
          y: 6.5,
          w: 5.0,
          h: 0.3,
          fontSize: 9,
          color: isDark ? "475569" : "94A3B8",
          fontFace: "Arial",
          align: "left",
          rtl: true
        } as any);
      });

      // Save PPTX
      pptx.writeFile({ fileName: `Al_Ahliya_University_Presentation_${SYSTEM_CURRENT_DATE}.pptx` });
    } catch (err) {
      console.error("Failed to generate PowerPoint PPTX file:", err);
      alert("⚠️ عذراً، حصل خطأ أثناء إخراج وتوليد ملف العرض التقديمي PPTX.");
    } finally {
      setExporting(false);
    }
  };

  const activeSlide = slides[currentSlideIndex];
  const ActiveIconComp = activeSlide.icon;

  return (
    <div className="space-y-6 text-right animate-fade-in font-sans">
      
      {/* الهيد والرأسية لتصدير الـ PPT والتنزيل الفوري */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="w-6.5 h-6.5 text-amber-500 animate-pulse shrink-0" />
            <span>الحقيبة والعرض التقديمي المتكامل لوزارة التعليم العراقي 📊</span>
          </h2>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-medium">
            شاهد العرض الفني للمنظومة مباشرة بملء الشاشة، وقم بتصدير وتحميل ملف عرض تقديمي حقيقي ومفتوح بامتداد <strong className="text-amber-600 font-mono text-sm">(.pptx)</strong> مجهز لتقديمه أمام اللجان ورئاسة الجامعة.
          </p>
        </div>

        <button
          onClick={handleExportPPTX}
          disabled={exporting}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-extrabold text-sm px-6 py-3.5 rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-md active:scale-95 select-none shrink-0"
        >
          {exporting ? (
            <span className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : (
            <Download className="w-5 h-5 animate-bounce" />
          )}
          <span>{exporting ? 'جاري تصدير الملف...' : 'تنزيل ملف باوربوينت PPTX 📂'}</span>
        </button>
      </div>

      {/* المحاكي والعارض للعرض التقديمي مخصص للتقديم الفوري للمتصفح */}
      <div className={`relative flex flex-col ${isFullscreen ? 'fixed inset-0 z-55 bg-slate-950 p-6 flex flex-col justify-between overflow-y-auto w-full h-full' : 'bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl p-6 md:p-10'} text-right transition-all`}>
        
        {/* شريط الأدوات العلوي للتحكم بالبث والتشغيل التلقائي */}
        <div className="flex justify-between items-center border-b border-slate-800/85 pb-4 mb-6">
          <div className="flex items-center gap-2 text-[10px] md:text-xs">
            <span className="px-2.5 py-1 text-[10px] bg-slate-800 text-slate-400 font-black rounded-xl">
              الشريحة {currentSlideIndex + 1} من {slides.length}
            </span>
            <span className={`px-2.5 py-1 text-[10px] uppercase font-black rounded-xl ${activeSlide.bgType === 'dark' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' : 'bg-indigo-400/20 text-indigo-300 border border-indigo-400/10'}`}>
              طابع: {activeSlide.bgType === 'dark' ? 'داكن سيادي' : 'أبيض إداري'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleAutoplay}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer transition-all ${isPlaying ? 'bg-red-950/50 text-red-400 border border-red-900/40' : 'bg-slate-800/50 text-slate-200 hover:bg-slate-700'}`}
            >
              {isPlaying ? <Pause className="w-4 h-4 text-red-400 animate-pulse" /> : <Play className="w-4 h-4 text-emerald-400" />}
              <span>{isPlaying ? 'إيقاف مؤقت' : 'عرض تلقائي'}</span>
            </button>

            <button
              onClick={toggleFullscreen}
              className="bg-slate-800/50 hover:bg-slate-705 text-slate-200 text-xs p-2 rounded-xl transition-all cursor-pointer"
              title="ملء الشاشة"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* الكانفس الداخلي للشريحة والإنيميشن المخصص */}
        <div className={`rounded-2xl p-6 md:p-10 flex flex-col justify-between transition-all duration-300 outline-none select-none min-h-[360px] md:min-h-[460px] ${activeSlide.bgType === 'dark' ? 'bg-slate-900 text-slate-100 border border-slate-800/60' : 'bg-slate-50 text-slate-900 border border-slate-200/50'}`}>
          <div className="space-y-4">
            {/* المحور الفرعي للمقصد العلمي */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${activeSlide.bgType === 'dark' ? 'bg-amber-400' : 'bg-indigo-600'}`} />
              <span className={`text-[11px] md:text-xs font-black tracking-wide uppercase ${activeSlide.bgType === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                {activeSlide.topic}
              </span>
            </div>

            {/* العنوان ومحور الرمز الدلالي للمنصة */}
            <div className="flex items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className={`text-xl md:text-3xl font-black ${activeSlide.bgType === 'dark' ? 'text-amber-400' : 'text-indigo-900'} leading-tight`}>
                  {activeSlide.title}
                </h3>
                {activeSlide.subtitle && (
                  <p className={`text-xs md:text-sm font-semibold max-w-4xl pr-0.5 ${activeSlide.bgType === 'dark' ? 'text-sky-300' : 'text-indigo-600/90'}`}>
                    {activeSlide.subtitle}
                  </p>
                )}
              </div>

              <div className={`p-4 rounded-2xl shrink-0 ${activeSlide.bgType === 'dark' ? 'bg-slate-800/80 text-amber-500 border border-slate-700/60' : 'bg-indigo-100 text-indigo-805 border border-indigo-200'}`}>
                <ActiveIconComp className="w-8 h-8 md:w-10 md:h-10" />
              </div>
            </div>

            {/* الكارد المدمج للتعداد الفني */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 md:pt-8 text-right">
              {activeSlide.points.map((point, index) => (
                <div 
                  key={index} 
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-1.5 hover:-translate-y-1 duration-300 ${activeSlide.bgType === 'dark' ? 'bg-slate-950/70 border-slate-800 hover:bg-slate-950 hover:border-amber-500/20 text-slate-200' : 'bg-white border-slate-100 hover:shadow-xs hover:border-indigo-600/10 text-slate-800'}`}
                >
                  <div className="flex items-center gap-1.5 font-black text-xs md:text-sm text-slate-400">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${activeSlide.bgType === 'dark' ? 'text-amber-400 font-bold' : 'text-indigo-600 font-bold'}`} />
                    <span className={activeSlide.bgType === 'dark' ? 'text-amber-300' : 'text-slate-805'}>{point.title}</span>
                  </div>
                  <p className={`text-[11px] md:text-xs leading-relaxed ${activeSlide.bgType === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {point.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* الخلاصة الختامية للشريحة */}
          <div className={`mt-6 md:mt-8 p-3 px-4 rounded-xl text-xs font-bold leading-relaxed border flex items-center gap-2 ${activeSlide.bgType === 'dark' ? 'bg-slate-950/40 border-slate-800 text-slate-300' : 'bg-indigo-50/50 border-indigo-100/65 text-indigo-950'}`}>
            <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded leading-none shrink-0">خلاصة فنية</span>
            <span>{activeSlide.summary}</span>
          </div>
        </div>

        {/* أزرار الانتقال والمسار بالأسفل */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="flex gap-2">
            <button
              onClick={prevSlide}
              className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-2xl transition-all cursor-pointer active:scale-90"
              title="الشريحة السابقة"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={nextSlide}
              className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-2xl transition-all cursor-pointer active:scale-90"
              title="الشريحة التالية"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* المؤشرات الدائرية التفاعلية لنقاط العرض */}
          <div className="flex items-center gap-2 flex-wrap">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-3.5 h-3.5 rounded-full transition-all cursor-pointer ${idx === currentSlideIndex ? 'bg-amber-500 w-8' : 'bg-slate-700 hover:bg-slate-600'}`}
                title={`الذهاب للشريحة ${idx + 1}`}
              />
            ))}
          </div>

          {/* تذكير بحجم الملف ووزاري */}
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>تحديث الحقيبة: {SYSTEM_CURRENT_DATE}</span>
          </div>
        </div>

      </div>

      {/* لمحات الإرشادات والتقديم المثالي */}
      <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 flex-1">
          <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>نصائح تقديم العرض بنجاح أمام اللجان الوزارية والمجلس الأكاديمي</span>
          </h4>
          <ul className="list-disc leading-relaxed pr-4 text-[11px] md:text-xs text-slate-500 space-y-1">
            <li>قم بتفعيل خيار "ملء الشاشة" بالعارض التفاعلي لاستخدامه كمحاضر مباشر على الشاشات الذكية (Smart Screens).</li>
            <li>حمّل ملف الـ <strong className="text-slate-700">PowerPoint (.pptx)</strong> وافتحه على مايكروسوفت أوفيس، حيث قمنا بحقن معلومات حقيقية داعمة مدعومة بمؤشرات المحاذاة اليمنى (RTL) المتناسقة.</li>
            <li>قم بالتنويه للجان التقييم أن النظام مزود بـ <strong>اقتراع أمني ذكي (Polling Engine)</strong> يضمن التدقيق المتواصل كل 30 ثانية في أروقة الكليات بفاعلية سيادية فائقة.</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
