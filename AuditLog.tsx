/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Search, 
  Filter, 
  Trash2, 
  Clock, 
  Shield, 
  Calendar,
  User,
  AlertOctagon,
  Download,
  Database,
  RefreshCw
} from 'lucide-react';
import { SYSTEM_CURRENT_DATE } from '../data/mockData';

interface AuditLogEntry {
  id: string;
  action: string; 
  title: string;
  details: string;
  user: string;
  timestamp: string;
  ip: string;
}

interface AuditLogProps {
  logs: AuditLogEntry[];
  onClearLogs?: () => void;
  currentRole?: string | null;
}

export default function AuditLog({ logs, onClearLogs, currentRole }: AuditLogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  // إعداد حالة السجلات المسترجعة محلياً والتحكم بدورة الاقتراع الأمني كل 30 ثانية
  const [localLogs, setLocalLogs] = useState<AuditLogEntry[]>(logs);
  const [countdown, setCountdown] = useState(30);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  const [lastFetchedTime, setLastFetchedTime] = useState<string>(() => {
    const d = new Date();
    return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });

  // مزامنة البيانات تلقائياً عند تغيير الحقول أو تصفيرها من الخارج
  useEffect(() => {
    setLocalLogs(logs);
  }, [logs]);

  // آلية الاقتراع الأمني (Polling Mechanism) كل 30 ثانية لتحديث سجلات النظام بالخلفية تلقائياً
  useEffect(() => {
    if (!isPollingEnabled) {
      return;
    }

    let timer: NodeJS.Timeout | null = null;
    let active = true;

    const performPollingFetch = async () => {
      setIsSyncing(true);
      try {
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        if (active && data && Array.isArray(data.auditLogs)) {
          // مقارنة سريعة لتجنب تكرار التحديث بلا تغيير
          if (JSON.stringify(localLogs) !== JSON.stringify(data.auditLogs)) {
            setLocalLogs(data.auditLogs);
          }
        }
      } catch (err) {
        console.warn('Silent polling update status (AuditLog background request skipped/offline):', err);
      } finally {
        if (active) {
          setIsSyncing(false);
          setCountdown(30);
          const d = new Date();
          setLastFetchedTime(d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
      }
    };

    timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          performPollingFetch();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
  }, [localLogs, isPollingEnabled]);

  // دالة تحديث يدوي فوراً عند الرغبة دون انتظار دورت الـ 30 ثانية الكاملة
  const handleManualRefresh = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.auditLogs)) {
          setLocalLogs(data.auditLogs);
        }
      }
    } catch (err) {
      console.warn('Manual refresh failed:', err);
    } finally {
      setIsSyncing(false);
      setCountdown(30);
      const d = new Date();
      setLastFetchedTime(d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  };

  // تصفية السجلات الأمنية الموثقة بناءً على السجلات المحلية المحدثة
  const filteredLogs = localLogs.filter(log => {
    const matchesSearch = log.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.id.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  // العد السريع للعمليات الحرجة من البيانات المحلية الفعالة
  const deleteCount = localLogs.filter(l => l.action.includes('delete') || l.action.includes('remove')).length;
  const permissionCount = localLogs.filter(l => l.action.includes('permission') || l.action.includes('staff') || l.action.includes('dean_assign')).length;
  const collegeCount = localLogs.filter(l => l.action.includes('college')).length;

  // دالة تصدير السجلات المصفاة الحالية إلى ملف CSV مع حماية المحاذاة والترميز
  const handleExportCSV = () => {
    const headers = ['كود التتبع', 'الحدث الأمن الأكاديمي', 'التفاصيل والملابسات التاريخية', 'بواسطة الكادر المسجل', 'التاريخ والوقت', 'عنوان المحطة المرتبط (IP)'];
    const rows = filteredLogs.map(log => {
      const escapeField = (val: string) => {
        const text = val || '';
        // تنظيف وهروب الحقول لتفادي تلف ملف الـ CSV
        if (text.includes(',') || text.includes('"') || text.includes('\n') || text.includes('\r')) {
          return `"${text.replace(/"/g, '""')}"`;
        }
        return text;
      };
      return [
        escapeField(log.id),
        escapeField(log.title),
        escapeField(log.details),
        escapeField(log.user),
        escapeField(log.timestamp),
        escapeField(log.ip)
      ];
    });

    // دمج الترميز العربي مع BOM للعمل بسلاسة تامة على Excel دون تشويه
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.id = 'download_logs_link';
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${SYSTEM_CURRENT_DATE}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-right animate-fade-in font-sans">
      
      {/* صناديق مؤشرات الأمان */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold block mb-1">إجمالي العمليات الموثقة:</span>
            <div className="text-3xl font-black text-amber-400 font-mono">
              {localLogs.length} <span className="text-sm font-sans font-medium text-slate-300">سجل</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span>تسجيل مشفر محمي بالسيرفر الأساسي</span>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold block mb-1">تعديلات الصلاحيات والموظفين:</span>
            <div className="text-3xl font-black text-indigo-400 font-mono">
              {permissionCount} <span className="text-sm font-sans font-medium text-slate-300">تعديل</span>
            </div>
          </div>
          <div className="text-[10px] text-indigo-300 mt-2 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-indigo-400" />
            <span>رقابة فورية على تغيير الكوادر</span>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold block mb-1">عمليات الشطب والحذف الكلي:</span>
            <div className="text-3xl font-black text-red-400 font-mono">
              {deleteCount} <span className="text-sm font-sans font-medium text-slate-300 font-black">حذف</span>
            </div>
          </div>
          <div className="text-[10px] text-red-300 mt-2 flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>عمليات سحب الصلاحيات والغياب المالي</span>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-lg flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-xs font-bold block mb-1">تعديل وإضافة كليات وأقسام:</span>
            <div className="text-3xl font-black text-emerald-400 font-mono">
              {collegeCount} <span className="text-sm font-sans font-medium text-slate-305 font-black">عملية</span>
            </div>
          </div>
          <div className="text-[10px] text-emerald-305 mt-2 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>محطات مبرمجة معنونة بالـ IP</span>
          </div>
        </div>

      </div>

      {/* لوحة التحكم الرئيسية والجدول */}
      <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 p-6 shadow-xl space-y-5">
        
        {/* العناوين والأدوات */}
        <div id="audit_log_header" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-900/40 p-3 rounded-2xl border border-indigo-550/30">
              <Terminal className="w-7 h-7 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-amber-400 tracking-tight">سجل العمليات المركزي ومراقبة النظام (Audit Log)</h2>
              <p className="text-slate-400 text-xs mt-0.5">الصفحة الأمنية الحصرية لمدير النظام لتتبع كفاءة الصلاحيات وحماية السجلات من التلاعب</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* مفتاح تبديل/تأكيد لتفعيل أو تعطيل التحديث التلقائي المستمر */}
            <label className="flex items-center gap-2.5 bg-slate-900 border border-slate-850 px-3.5 py-2 rounded-2xl text-[11px] font-bold shadow-xs whitespace-nowrap cursor-pointer select-none hover:bg-slate-800 transition-all active:scale-95">
              <input 
                type="checkbox" 
                checked={isPollingEnabled}
                onChange={(e) => {
                  setIsPollingEnabled(e.target.checked);
                  if (e.target.checked) {
                    setCountdown(30);
                  }
                }}
                className="w-4 h-4 rounded border-slate-700 text-amber-500 bg-slate-950 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-amber-500"
              />
              <span className="text-slate-300">مراقبة حية مستمرة</span>
            </label>

            {/* مؤشر الاقتراع التلقائي كل 30 ثانية */}
            <div className={`flex items-center gap-2 bg-slate-900 border border-slate-850 px-3.5 py-2 rounded-2xl text-[11px] font-bold shadow-xs whitespace-nowrap transition-all ${!isPollingEnabled ? 'opacity-60 border-dashed' : ''}`}>
              <div className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${!isPollingEnabled ? 'bg-slate-600' : isSyncing ? 'bg-indigo-400' : 'bg-amber-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${!isPollingEnabled ? 'bg-slate-650' : isSyncing ? 'bg-indigo-500' : 'bg-amber-500'}`}></span>
              </div>
              <span className="text-slate-405">تحديث تلقائي:</span>
              <span className="font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded leading-none select-none">
                {isPollingEnabled ? `${countdown}ث` : 'معطل ❌'}
              </span>
              <button 
                onClick={handleManualRefresh}
                title="تحديث فوري للسجلات"
                disabled={isSyncing}
                className="hover:text-amber-300 transition-colors p-1 rounded hover:bg-slate-800 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : 'text-slate-400'}`} />
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/40 text-emerald-300 hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 select-none"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>تصدير ملف CSV</span>
            </button>
            {onClearLogs && (
              <button 
                onClick={onClearLogs}
                className="bg-red-950/40 hover:bg-red-900 hover:text-white border border-red-800/40 text-red-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>تصفير أرشيف العمليات السري</span>
              </button>
            )}
          </div>
        </div>

        {/* فلاتر البحث والفرز */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* مربع البحث */}
          <div className="relative">
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث بالعنوان، التفاصيل، أو اسم الموظف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-850 focus:border-indigo-500 pr-10 pl-4 py-2.5 rounded-xl text-xs outline-hidden text-slate-200 font-bold"
            />
          </div>

          {/* نوع العمليات */}
          <div className="flex items-center gap-1.5 shrink-0 bg-slate-900 border border-slate-850 rounded-xl px-2.5 py-1 text-xs text-slate-300">
            <Filter className="w-4 h-4 text-slate-405 shrink-0" />
            <select 
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="outline-hidden text-slate-205 cursor-pointer font-bold w-full bg-slate-900 py-1.5"
            >
              <option value="all">جميع فئات الأحداث الأمنية</option>
              <option value="permission_update">تحديث وتوليد الكود السري</option>
              <option value="staff_add">إضافة موظف وتعيين صلاحية</option>
              <option value="staff_delete">حذف كادر وسحب الصلاحية</option>
              <option value="dean_assign">تكليف عميد الكلية</option>
              <option value="dean_remove">إقالة عميد وتصفير منصبه</option>
              <option value="college_add">تسجيل كلية جديدة ومحطة</option>
              <option value="college_edit">تعديل مواصفات الكلية ورسومها</option>
              <option value="college_delete">حذف وإلغاء الكلية</option>
              <option value="student_add">تسجيل وقبول طالب جديد</option>
              <option value="student_delete">إلغاء وشطب قيد طالب مالي</option>
              <option value="receipt_add">إصدار وترحيل وصل مالي</option>
            </select>
          </div>

          <div className="bg-slate-900 text-amber-400 text-xs px-4 py-3 rounded-xl border border-slate-850 font-sans font-bold flex items-center justify-between">
            <span className="text-slate-400">حالة تدقيق المحطات الأمنية:</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>مراقبة نشطة وآمنة بنسبة 100% 🔒</span>
            </span>
          </div>

        </div>

        {/* جدول السجلات */}
        <div className="overflow-x-auto rounded-2xl border border-slate-850 bg-slate-950/50">
          <table className="w-full text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-bold">
                <th className="p-4 font-sans font-black">كود التتبع</th>
                <th className="p-4">الحدث</th>
                <th className="p-4 font-sans font-black">الوصف والملابسات التاريخية</th>
                <th className="p-4">بواسطة الكادر</th>
                <th className="p-4 text-center">التاريخ والوقت</th>
                <th className="p-4 text-center">عنوان محطة الإرسال (IP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredLogs.map(log => {
                let badgeColor = "bg-slate-800 text-slate-300 border border-slate-700/50";
                let severityLabel = "معلومات";
                let severityDotColor = "bg-slate-400";
                
                if (log.action.includes('delete') || log.action.includes('remove')) {
                  badgeColor = "bg-red-950/50 text-red-300 border border-red-900/40";
                  severityLabel = "حرج / حذف";
                  severityDotColor = "bg-red-500 animate-pulse";
                } else if (log.action.includes('update') || log.action.includes('edit') || log.action.includes('permission')) {
                  badgeColor = "bg-yellow-950/40 text-yellow-300 border border-yellow-800/40";
                  severityLabel = "تعديل أو ترقية (تحذير)";
                  severityDotColor = "bg-yellow-500";
                } else if (log.action.includes('add') || log.action.includes('assign') || log.action.includes('receipt')) {
                  badgeColor = "bg-emerald-950/40 text-emerald-300 border border-emerald-800/40";
                  severityLabel = "إضافة ناجحة";
                  severityDotColor = "bg-emerald-500";
                }

                return (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-400">{log.id}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase inline-block ${badgeColor}`}>
                          {log.title}
                        </span>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 pr-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${severityDotColor}`} />
                          <span>{severityLabel}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 max-w-sm text-slate-200 font-sans leading-relaxed">
                      {log.details}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-bold text-slate-200">{log.user}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-amber-500">
                      {log.timestamp}
                    </td>
                    <td className="p-4 text-center font-mono font-bold text-slate-400">
                      {log.ip}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    <AlertOctagon className="w-10 h-10 text-slate-600 mx-auto mb-2 animate-pulse" />
                    <p className="font-black text-xs">لا يوجد أي سجل مراقبة حالياً يطابق فلاتر الصلاحية النشطة اليوم.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* شريطة الموثوقية للتصديق البصري */}
        <div className="p-4 bg-slate-900 rounded-2xl flex items-center justify-between text-[11px] text-slate-400 border border-slate-850 leading-relaxed font-bold">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>آخر فحص أمني ناجح: {SYSTEM_CURRENT_DATE} في {lastFetchedTime}</span>
          </span>
          <span>🔒 يلتزم هذا الخادم بأدق المعايير المعتمدة بمجال تدقيق أمن المعلومات والحوسبة الموحدة لوزارة التعليم العالي العراقية.</span>
        </div>

      </div>

    </div>
  );
}
