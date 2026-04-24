import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Camera,
  Upload,
  Trash2,
  FileImage,
  FileText,
  Plus,
  Mic,
  PenLine,
  RefreshCw,
  CheckCircle,
  XCircle,
  Hourglass,
  Search,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { StepIndicator } from "../components/StepIndicator";
import { VoiceModal } from "../components/VoiceModal";
import { HRSearchModal } from "../components/HRSearchModal";
import { CostCenterSearchModal } from "../components/CostCenterSearchModal";
import { TicketSelectorModal } from "../components/TicketSelectorModal";
import { toast } from "sonner";

const STEPS = [
  { label: "票据上传" },
  { label: "票据稽查" },
  { label: "信息填充" },
];

interface UploadedFile {
  id: number;
  name: string;
  type: "image" | "pdf";
}

interface ReimburseRow {
  id: number;
  costCenter: string;
  category: string;
  item: string;
  amount: string;
  period: string;
  plate: string;
  userId: string;
  remark: string;
  remark2: string;
  k2Module: string;
  k2Link: string;
  poNumber: string;
  supplierNumber: string;
}

interface InvoiceRow {
  id: number;
  no: string;
  date: string;
  tax: string;
  total: string;
  buyer: string;
  buyerId: string;
  seller: string;
  sellerId: string;
  type: string;
}

interface LoanRow {
  id: number;
  process: string;
  no: string;
  seq: string;
  amount: string;
  repaid: string;
  pending: string;
  unpaid: string;
  thisRepay: string;
}

const inputCls =
  "w-full border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-[#8B1450]";
const readonlyCls =
  "w-full border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-600 bg-gray-50";
const selectCls =
  "w-full border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-[#8B1450] appearance-none";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-gray-600 mb-0.5 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function EmployeeReimbursement() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [auditState, setAuditState] = useState<"checking" | "pass" | "fail"> ("checking");
  const [hasUploadedCamera, setHasUploadedCamera] = useState(false); // Track if camera upload was clicked
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [reasonAbnormalModalOpen, setReasonAbnormalModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "员工报销申请-张XX-2026-03-05",
    reimburser: "张XX",
    employeeId: "2412",
    employeeClientId: "",
    reason: "",
    settlementAmount: "",
    invoiceAmount: "",
    writeOffAmount: "",
    financeAdjustmentAmount: "",
    adjustmentNote: "",
    signatureComment: "",
    createDate: "2026-03-05",
    creator: "张XX",
    creatorEmployeeId: "2412",
    creatorCompany: "林德叉车总部",
    creatorDepartment: "FSS2",
    costCenter: "",
    internalOrderNo: "",
    isUploadInvoice: "",
  });

  const [hrSearchOpen, setHRSearchOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{
    name: string;
    employeeId: string;
  } | null>(null);
  
  // Cost center search modal state
  const [costCenterSearchOpen, setCostCenterSearchOpen] = useState(false);
  const [selectedCostCenterRow, setSelectedCostCenterRow] = useState<number | null>(null);
  
  // Expense category search modal state
  const [categorySearchOpen, setCategorySearchOpen] = useState(false);
  const [selectedCategoryRow, setSelectedCategoryRow] = useState<number | null>(null);
  
  // Expense item search modal state
  const [itemSearchOpen, setItemSearchOpen] = useState(false);
  const [selectedItemRow, setSelectedItemRow] = useState<number | null>(null);
  
  // Expense period search modal state
  const [periodSearchOpen, setPeriodSearchOpen] = useState(false);
  const [selectedPeriodRow, setSelectedPeriodRow] = useState<number | null>(null);
  
  // Ticket selector modal state
  const [ticketSelectorOpen, setTicketSelectorOpen] = useState(false);

  const [reimburseRows, setReimburseRows] = useState<ReimburseRow[]>([
    { id: 1, costCenter: "", category: "", item: "", amount: "", period: "", plate: "", userId: "", remark: "", remark2: "", k2Module: "", k2Link: "", poNumber: "", supplierNumber: "" },
  ]);
  const [invoiceRows, setInvoiceRows] = useState<InvoiceRow[]>([
    { id: 1, no: "", date: "", tax: "", total: "", buyer: "", buyerId: "", seller: "", sellerId: "", type: "" },
  ]);
  const [loanRows, setLoanRows] = useState<LoanRow[]>([
    { id: 1, process: "", no: "", seq: "", amount: "", repaid: "", pending: "", unpaid: "", thisRepay: "" },
  ]);



  const removeFile = (id: number) => setFiles((f) => f.filter((x) => x.id !== id));

  const addFile = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    setFiles((f) => [...f, { id: Date.now(), name, type: ext === "pdf" ? "pdf" : "image" }]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach((f) => addFile(f.name));
  };

  const removeAttachment = (id: number) => setAttachmentFiles((f) => f.filter((x) => x.id !== id));

  const addAttachment = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    setAttachmentFiles((f) => [...f, { id: Date.now(), name, type: ext === "pdf" ? "pdf" : "image" }]);
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach((f) => addAttachment(f.name));
  };

  const handleStep0Confirm = () => {
    if (files.length === 0) { toast.error("请至少上传一张票据"); return; }
    setStep(1);
    setAuditState("checking");
    // If camera upload was clicked, set to fail after checking
    if (hasUploadedCamera) {
      setTimeout(() => setAuditState("fail"), 2500);
    } else {
      setTimeout(() => setAuditState("pass"), 2500);
    }
  };

  const checkAbnormalSignature = (comment: string): boolean => {
    // Define abnormal keywords or patterns
    const abnormalKeywords = [
      "异常",
      "错误",
      "不符合",
      "超标",
      "问题",
      "违规",
    ];
    return abnormalKeywords.some((keyword) =>
      comment.includes(keyword),
    );
  };

  const checkAbnormalReason = (reason: string): boolean => {
    // Define abnormal keywords or patterns for reimbursement reason
    const abnormalKeywords = [
      "异常",
      "错误",
      "不符合",
      "超标",
      "问题",
      "违规",
      "虚假",
      "伪造",
      "重复",
      "无效"
    ];
    return abnormalKeywords.some((keyword) =>
      reason.includes(keyword),
    );
  };

  const handleStep2Confirm = () => {
    // Check if reimbursement reason contains abnormal content
    const isReasonAbnormal = checkAbnormalReason(form.reason);
    if (isReasonAbnormal) {
      setReasonAbnormalModalOpen(true);
      return;
    }
    
    // Directly submit the employee reimbursement application
    handleSubmit();
  };

  const handleSubmit = () => {
    toast.success("员工报销申请已成功提交！");
    setTimeout(() => navigate("/"), 1500);
  };

  const updateForm = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleVoiceConfirm = (text: string) => {
    setVoiceOpen(false);
    toast.success("语音信息已录入，表单已自动填充！");
  };

  const handleHRSearch = () => {
    setHRSearchOpen(true);
  };

  const handleHRSearchClose = () => {
    setHRSearchOpen(false);
  };

  const handleHRSearchSelect = (employee: {
    name: string;
    employeeId: string;
  }) => {
    setSelectedEmployee(employee);
    setForm((prev) => ({
      ...prev,
      reimburser: employee.name,
      employeeId: employee.employeeId,
    }));
    setHRSearchOpen(false);
  };
  
  // Handle ticket selection from modal
  const handleTicketSelect = (selectedTickets: any[]) => {
    selectedTickets.forEach(ticket => {
      addFile(ticket.name);
    });
    setTicketSelectorOpen(false);
  };
  
  // Handle cost center search
  const handleCostCenterSearch = (rowIndex: number) => {
    setSelectedCostCenterRow(rowIndex);
    setCostCenterSearchOpen(true);
  };
  
  // Handle cost center select
  const handleCostCenterSelect = (costCenter: { code: string; isRD: string }) => {
    if (selectedCostCenterRow !== null) {
      setReimburseRows((rs) => rs.map((r, index) => 
        index === selectedCostCenterRow ? { ...r, costCenter: costCenter.code } : r
      ));
    }
    setCostCenterSearchOpen(false);
    setSelectedCostCenterRow(null);
  };
  
  // Handle expense category search
  const handleCategorySearch = (rowIndex: number) => {
    setSelectedCategoryRow(rowIndex);
    setCategorySearchOpen(true);
  };
  
  // Handle expense category select
  const handleCategorySelect = (category: string) => {
    if (selectedCategoryRow !== null) {
      setReimburseRows((rs) => rs.map((r, index) => 
        index === selectedCategoryRow ? { ...r, category: category } : r
      ));
    }
    setCategorySearchOpen(false);
    setSelectedCategoryRow(null);
  };
  
  // Handle expense item search
  const handleItemSearch = (rowIndex: number) => {
    setSelectedItemRow(rowIndex);
    setItemSearchOpen(true);
  };
  
  // Handle expense item select
  const handleItemSelect = (item: string) => {
    if (selectedItemRow !== null) {
      setReimburseRows((rs) => rs.map((r, index) => 
        index === selectedItemRow ? { ...r, item: item } : r
      ));
    }
    setItemSearchOpen(false);
    setSelectedItemRow(null);
  };
  
  // Handle expense period search
  const handlePeriodSearch = (rowIndex: number) => {
    setSelectedPeriodRow(rowIndex);
    setPeriodSearchOpen(true);
  };
  
  // Handle expense period select
  const handlePeriodSelect = (period: string) => {
    if (selectedPeriodRow !== null) {
      setReimburseRows((rs) => rs.map((r, index) => 
        index === selectedPeriodRow ? { ...r, period: period } : r
      ));
    }
    setPeriodSearchOpen(false);
    setSelectedPeriodRow(null);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F0F0F0]">
      <header className="bg-[#8B1450] text-white flex items-center px-4 py-3 shadow-md flex-shrink-0">
        <button onClick={() => (step > 0 ? setStep(step - 1) : navigate("/"))} className="mr-4 hover:bg-white/10 rounded-full p-1.5">
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">员工报销</h1>
        {step === 2 ? (
          <>
            <button
              onClick={() => attachmentInputRef.current?.click()}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors mr-2"
            >
              <Upload size={20} />
            </button>
            <button
              onClick={() => setVoiceOpen(true)}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
            >
              <Mic size={20} />
            </button>
          </>
        ) : (
          <div className="w-10" />
        )}
      </header>

      <StepIndicator steps={STEPS} currentStep={step} />

      <div className="flex-1 overflow-y-auto p-4">
        {/* STEP 0: Upload */}
        {step === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-1">票据上传说明</p>
              <p className="text-xs text-yellow-700">
                请上传相关发票、邮件说明、附件等，电子发票只支持上传XML的数据电文、PDF、OFD格式；附件支持pdf、ofd、png、jpg、word、XLSX、EML等格式
              </p>
            </div>

            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" />

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { fileInputRef.current?.click(); setHasUploadedCamera(true); }} className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 text-sm text-gray-600 hover:bg-gray-50">
                <Camera size={18} /> 拍照上传
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 text-sm text-gray-600 hover:bg-gray-50">
                <Upload size={18} /> 上传已有附件
              </button>
              <button onClick={() => setTicketSelectorOpen(true)} className="col-span-2 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 text-sm text-gray-600 hover:bg-gray-50">
                <FolderOpen size={18} /> 票据夹上传
              </button>
            </div>

            {files.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">已上传票据</p>
                <div className="space-y-2">
                  {files.map((f) => (
                    <div key={f.id} className="flex items-center justify-between border border-gray-200 rounded px-3 py-2 bg-gray-50">
                      <div className="flex items-center gap-2">
                        {f.type === "pdf" ? <FileText size={16} className="text-red-500" /> : <FileImage size={16} className="text-blue-500" />}
                        <span className="text-sm text-gray-700">{f.name}</span>
                      </div>
                      <button onClick={() => removeFile(f.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 1: Audit */}
        {step === 1 && (
          <div className="space-y-4">
            {auditState === "checking" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <Hourglass size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">票据稽查中</p>
                  <p className="text-xs text-yellow-700 mt-0.5">系统正在自动检测票据合规性等信息，请稍候...</p>
                </div>
              </div>
            )}
            
            {auditState === "pass" && (
              <div className="bg-green-400 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle size={20} className="text-white flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">票据稽查通过</p>
                  <p className="text-xs text-white/90 mt-0.5">您上传的票据符合公司规定，可以继续报销流程。</p>
                </div>
              </div>
            )}
            
            <div className="flex flex-col items-center py-8">
              <div className={`w-20 h-20 ${auditState === "checking" ? "text-[#8B1450] animate-spin" : auditState === "pass" ? "text-green-500" : "text-yellow-500"}`}>
                {auditState === "checking" ? <RefreshCw size={80} strokeWidth={1.5} /> : auditState === "pass" ? <CheckCircle size={80} strokeWidth={1.5} /> : <AlertCircle size={80} strokeWidth={1.5} />}
              </div>
              <p className="mt-4 text-sm text-gray-500">{auditState === "checking" ? "正在识别分析票据内容中..." : "票据识别完成"}</p>
            </div>

            {auditState === "fail" && (
              <>
                <div className="bg-pink-100 border border-pink-300 rounded-lg p-4 flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    !
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-red-900 mb-2">票据信息不通过</p>
                    <div className="text-sm text-red-800 space-y-2">
                      <p className="font-medium">【票据不合规】检1号发票已进行报销，存在重复报销，请重新上传合规票据！</p>
                      <p className="font-medium">【票据不合规】检2号发票识别异常，未识别出有效票据信息，请提供正确的合规票据！</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { fileInputRef.current?.click(); setHasUploadedCamera(true); }}
                    className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <Camera size={18} /> 拍照上传
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <Upload size={18} /> 上传已有附件
                  </button>
                </div>
                
                <button
                  onClick={() => setStep(2)}
                  className="w-full flex items-center justify-center gap-2 border border-yellow-300 bg-yellow-50 rounded-lg py-3 text-sm text-yellow-700 hover:bg-yellow-100"
                >
                  <AlertCircle size={18} /> 忽略并继续
                </button>
              </>
            )}
          </div>
        )}

        {/* STEP 2: Fill Info */}
        {step === 2 && (
          <div className="space-y-4">
            <input
              ref={attachmentInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleAttachmentChange}
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
            />

            {/* 基本信息区域 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">基本信息</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="标题">
                  <input className={readonlyCls} value={form.title} readOnly />
                </Field>
                <Field label="创建日期">
                  <input className={readonlyCls} value={form.createDate} readOnly />
                </Field>
                <Field label="创建人">
                  <input className={readonlyCls} value={form.creator} readOnly />
                </Field>
                <Field label="员工号">
                  <input className={readonlyCls} value={form.creatorEmployeeId} readOnly />
                </Field>
                <Field label="创建人公司">
                  <input className={readonlyCls} value={form.creatorCompany} readOnly />
                </Field>
                <Field label="创建人部门">
                  <input className={readonlyCls} value={form.creatorDepartment} readOnly />
                </Field>
                <Field label="成本中心">
                  <input className={readonlyCls} value={form.costCenter} readOnly />
                </Field>
                <Field label="内部订单号">
                  <input className={inputCls} value={form.internalOrderNo} onChange={(e) => updateForm("internalOrderNo", e.target.value)} />
                </Field>
              </div>
            </div>

            {/* 详细信息区域 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">详细信息</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="实际报销人" required>
                  <div className="relative">
                    <input className={inputCls} value={form.reimburser} onChange={(e) => updateForm("reimburser", e.target.value)} />
                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors" onClick={handleHRSearch}>
                      <Search size={14} />
                    </button>
                  </div>
                </Field>
                <Field label="实际报销人工号">
                  <input className={inputCls} value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))} />
                </Field>
                <Field label="员工客户号">
                  <input className={inputCls} value={form.employeeClientId} onChange={(e) => setForm((f) => ({ ...f, employeeClientId: e.target.value }))} />
                </Field>
                <div className="sm:col-span-2 lg:col-span-3">
                  <Field label="报销事由" required>
                    <input className={inputCls} value={form.reason} onChange={(e) => updateForm("reason", e.target.value)} placeholder="请输入报销事由" />
                  </Field>
                </div>
              </div>
            </div>

            {/* 报销信息 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">报销信息</h2>
                <button onClick={() => setReimburseRows((r) => [...r, { id: Date.now(), costCenter: "", category: "", item: "", amount: "", period: "", plate: "", userId: "", remark: "", remark2: "", k2Module: "", k2Link: "", poNumber: "", supplierNumber: "" }])} className="flex items-center gap-1 text-[#8B1450] hover:text-[#6e1040] text-xs">
                  <Plus size={16} /> 添加
                </button>
              </div>
              <div className="space-y-3">
                {reimburseRows.map((row, index) => (
                  <div key={row.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
                    <div className="absolute top-3 right-3">
                      <button onClick={() => setReimburseRows((rs) => rs.filter((r) => r.id !== row.id))} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs font-medium text-gray-500 mb-3">报销项目 #{index + 1}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Field label="费用成本中心" required>
                        <div className="relative">
                          <input className={inputCls} value={row.costCenter} onChange={(e) => setReimburseRows((rs) => rs.map((r) => r.id === row.id ? { ...r, costCenter: e.target.value } : r))} />
                          <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors" onClick={() => handleCostCenterSearch(index)}>
                            <Search size={14} />
                          </button>
                        </div>
                      </Field>
                      <Field label="费用分类" required>
                        <div className="relative">
                          <select className={selectCls} value={row.category} onChange={(e) => setReimburseRows((rs) => rs.map((r) => r.id === row.id ? { ...r, category: e.target.value } : r))}>
                            <option value="">请选择</option>
                            <option>交通费</option>
                            <option>餐饮费</option>
                            <option>办公用品</option>
                            <option>招待费</option>
                            <option>其他</option>
                          </select>
                          <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors" onClick={() => handleCategorySearch(index)}>
                            <Search size={14} />
                          </button>
                        </div>
                      </Field>
                      <Field label="费用项目" required>
                        <div className="relative">
                          <input className={inputCls} value={row.item} onChange={(e) => setReimburseRows((rs) => rs.map((r) => r.id === row.id ? { ...r, item: e.target.value } : r))} />
                          <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors" onClick={() => handleItemSearch(index)}>
                            <Search size={14} />
                          </button>
                        </div>
                      </Field>
                      <Field label="支出金额" required>
                        <input className={inputCls} value={row.amount} onChange={(e) => setReimburseRows((rs) => rs.map((r) => r.id === row.id ? { ...r, amount: e.target.value } : r))} />
                      </Field>
                      <Field label="费用归属期间" required>
                        <div className="relative">
                          <input className={inputCls} value={row.period} onChange={(e) => setReimburseRows((rs) => rs.map((r) => r.id === row.id ? { ...r, period: e.target.value } : r))} />
                          <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors" onClick={() => handlePeriodSearch(index)}>
                            <Search size={14} />
                          </button>
                        </div>
                      </Field>
                      <Field label="车牌号">
                        <input className={inputCls} value={row.plate} onChange={(e) => setReimburseRows((rs) => rs.map((r) => r.id === row.id ? { ...r, plate: e.target.value } : r))} />
                      </Field>
                      <Field label="使用人工号">
                        <input className={inputCls} value={row.userId} onChange={(e) => setReimburseRows((rs) => rs.map((r) => r.id === row.id ? { ...r, userId: e.target.value } : r))} />
                      </Field>
                      <Field label="说明一" required>
                        <input className={inputCls} value={row.remark} onChange={(e) => setReimburseRows((rs) => rs.map((r) => r.id === row.id ? { ...r, remark: e.target.value } : r))} />
                      </Field>
                      <Field label="说明二">
                        <input className={inputCls} value={row.remark2} onChange={(e) => setReimburseRows((rs) => rs.map((r) => r.id === row.id ? { ...r, remark2: e.target.value } : r))} />
                      </Field>
                      <Field label="K2系统模块">
                        <input className={inputCls} value={row.k2Module} onChange={(e) => setReimburseRows((rs) => rs.map((r) => r.id === row.id ? { ...r, k2Module: e.target.value } : r))} />
                      </Field>
                      <Field label="K2系统链接">
                        <input className={inputCls} value={row.k2Link} onChange={(e) => setReimburseRows((rs) => rs.map((r) => r.id === row.id ? { ...r, k2Link: e.target.value } : r))} />
                      </Field>
                      {(row.item === "PO采购" || row.item === "低值资产（有投资申请）") && (
                        <>
                          <Field label="采购订单号(PO)">
                            <input className={inputCls} value={row.poNumber} onChange={(e) => setReimburseRows((rs) => rs.map((r) => r.id === row.id ? { ...r, poNumber: e.target.value } : r))} />
                          </Field>
                          <Field label="供应商号">
                            <input className={inputCls} value={row.supplierNumber} onChange={(e) => setReimburseRows((rs) => rs.map((r) => r.id === row.id ? { ...r, supplierNumber: e.target.value } : r))} />
                          </Field>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 发票信息 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">发票信息</h2>
                <button onClick={() => setInvoiceRows((r) => [...r, { id: Date.now(), no: "", date: "", tax: "", total: "", buyer: "", buyerId: "", seller: "", sellerId: "", type: "" }])} className="flex items-center gap-1 text-[#8B1450] hover:text-[#6e1040] text-xs">
                  <Plus size={16} /> 添加
                </button>
              </div>
              <div className="space-y-3">
                {invoiceRows.map((row, index) => (
                  <div key={row.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
                    <div className="absolute top-3 right-3">
                      <button onClick={() => setInvoiceRows((rs) => rs.filter((r) => r.id !== row.id))} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs font-medium text-gray-500 mb-3">发票 #{index + 1}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Field label="发票号码" required>
                        <input className={inputCls} value={row.no} onChange={(e) => setInvoiceRows((rs) => rs.map((r) => r.id === row.id ? { ...r, no: e.target.value } : r))} />
                      </Field>
                      <Field label="发票日期">
                        <input className={inputCls} type="date" value={row.date} onChange={(e) => setInvoiceRows((rs) => rs.map((r) => r.id === row.id ? { ...r, date: e.target.value } : r))} />
                      </Field>
                      <Field label="税额">
                        <input className={inputCls} value={row.tax} onChange={(e) => setInvoiceRows((rs) => rs.map((r) => r.id === row.id ? { ...r, tax: e.target.value } : r))} />
                      </Field>
                      <Field label="发票总额">
                        <input className={inputCls} value={row.total} onChange={(e) => setInvoiceRows((rs) => rs.map((r) => r.id === row.id ? { ...r, total: e.target.value } : r))} />
                      </Field>
                      <Field label="购买方">
                        <input className={inputCls} value={row.buyer} onChange={(e) => setInvoiceRows((rs) => rs.map((r) => r.id === row.id ? { ...r, buyer: e.target.value } : r))} />
                      </Field>
                      <Field label="购买方识别号">
                        <input className={inputCls} value={row.buyerId} onChange={(e) => setInvoiceRows((rs) => rs.map((r) => r.id === row.id ? { ...r, buyerId: e.target.value } : r))} />
                      </Field>
                      <Field label="销售方">
                        <input className={inputCls} value={row.seller} onChange={(e) => setInvoiceRows((rs) => rs.map((r) => r.id === row.id ? { ...r, seller: e.target.value } : r))} />
                      </Field>
                      <Field label="销售方识别号">
                        <input className={inputCls} value={row.sellerId} onChange={(e) => setInvoiceRows((rs) => rs.map((r) => r.id === row.id ? { ...r, sellerId: e.target.value } : r))} />
                      </Field>
                      <Field label="发票类型">
                        <select className={selectCls} value={row.type} onChange={(e) => setInvoiceRows((rs) => rs.map((r) => r.id === row.id ? { ...r, type: e.target.value } : r))}>
                          <option value=""> </option>
                          <option>无</option>
                          <option>增值税普通发票</option>
                          <option>增值税专用发票</option>
                          <option>通用机打发票</option>
                          <option>卷式发票</option>
                          <option>定额发票</option>
                          <option>地铁票</option>
                          <option>出租发票</option>
                          <option>动车/高铁票</option>
                          <option>过路费发票</option>
                          <option>客运汽车发票</option>
                          <option>二手车销售统一发票表</option>
                          <option>机动车销售发票表</option>
                          <option>国际小票</option>
                          <option>航空运输电子客票行程单</option>
                          <option>增值税电子发票</option>
                          <option>增值税普通发票（卷票）</option>
                          <option>可报销其他发票</option>
                          <option>完税证明</option>
                          <option>区块链发票</option>
                          <option>增值税电子票（通行费）20</option>
                          <option>电子发票（增值税专用发票）</option>
                          <option>电子发票（普通发票）</option>
                          <option>火车电子票</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 预借款 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">预借款</h2>
                <button onClick={() => setLoanRows((r) => [...r, { id: Date.now(), process: "", no: "", seq: "", amount: "", repaid: "", pending: "", unpaid: "", thisRepay: "" }])} className="flex items-center gap-1 text-[#8B1450] hover:text-[#6e1040] text-xs">
                  <Plus size={16} /> 添加
                </button>
              </div>
              <div className="space-y-3">
                {loanRows.map((row, index) => (
                  <div key={row.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
                    <div className="absolute top-3 right-3">
                      <button onClick={() => setLoanRows((rs) => rs.filter((r) => r.id !== row.id))} className="text-gray-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs font-medium text-gray-500 mb-3">借款记录 #{index + 1}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Field label="借款流程">
                        <input className={inputCls} value={row.process} onChange={(e) => setLoanRows((rs) => rs.map((r) => r.id === row.id ? { ...r, process: e.target.value } : r))} />
                      </Field>
                      <Field label="借款单号">
                        <input className={inputCls} value={row.no} onChange={(e) => setLoanRows((rs) => rs.map((r) => r.id === row.id ? { ...r, no: e.target.value } : r))} />
                      </Field>
                      <Field label="单内序号" required>
                        <input className={inputCls} value={row.seq} onChange={(e) => setLoanRows((rs) => rs.map((r) => r.id === row.id ? { ...r, seq: e.target.value } : r))} />
                      </Field>
                      <Field label="借款金额">
                        <input className={inputCls} value={row.amount} onChange={(e) => setLoanRows((rs) => rs.map((r) => r.id === row.id ? { ...r, amount: e.target.value } : r))} />
                      </Field>
                      <Field label="已还金额">
                        <input className={inputCls} value={row.repaid} onChange={(e) => setLoanRows((rs) => rs.map((r) => r.id === row.id ? { ...r, repaid: e.target.value } : r))} />
                      </Field>
                      <Field label="审批中待还金额">
                        <input className={inputCls} value={row.pending} onChange={(e) => setLoanRows((rs) => rs.map((r) => r.id === row.id ? { ...r, pending: e.target.value } : r))} />
                      </Field>
                      <Field label="未还金额">
                        <input className={inputCls} value={row.unpaid} onChange={(e) => setLoanRows((rs) => rs.map((r) => r.id === row.id ? { ...r, unpaid: e.target.value } : r))} />
                      </Field>
                      <Field label="本次还款金额">
                        <input className={inputCls} value={row.thisRepay} onChange={(e) => setLoanRows((rs) => rs.map((r) => r.id === row.id ? { ...r, thisRepay: e.target.value } : r))} />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 报销合计区域 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">报销合计</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="结算金额">
                  <input className={inputCls} value={form.settlementAmount} onChange={(e) => updateForm("settlementAmount", e.target.value)} />
                </Field>
                <Field label="发票金额">
                  <input className={inputCls} value={form.invoiceAmount} onChange={(e) => updateForm("invoiceAmount", e.target.value)} />
                </Field>
                <Field label="是否上传发票" required>
                  <select
                    className={selectCls}
                    value={form.isUploadInvoice}
                    onChange={(e) =>
                      updateForm("isUploadInvoice", e.target.value)
                    }
                  >
                    <option></option>
                    <option>是</option>
                    <option>否</option>
                  </select>
                </Field>
                <Field label="冲销金额">
                  <input className={inputCls} value={form.writeOffAmount} onChange={(e) => updateForm("writeOffAmount", e.target.value)} />
                </Field>
                
                <Field label="财务审核调整金额">
                  <input className={inputCls} value={form.financeAdjustmentAmount} onChange={(e) => updateForm("financeAdjustmentAmount", e.target.value)} />
                </Field>
                
                <Field label="调整金额说明">
                  <input className={inputCls} value={form.adjustmentNote} onChange={(e) => updateForm("adjustmentNote", e.target.value)} />
                </Field>
                
                {attachmentFiles.length > 0 && (
                  <div className="lg:col-span-3">
                    <Field label="相关附件">
                      <div className="space-y-2">
                        {attachmentFiles.map((f) => (
                          <div key={f.id} className="flex items-center justify-between border border-gray-200 rounded px-3 py-2 bg-gray-50">
                            <div className="flex items-center gap-2">
                              {f.type === "pdf" ? <FileText size={16} className="text-red-500" /> : <FileImage size={16} className="text-blue-500" />}
                              <span className="text-sm text-gray-700 cursor-pointer hover:text-[#8B1450]" onClick={() => {
                                // 模拟附件预览功能
                                alert(`预览附件: ${f.name}`);
                                // 实际项目中可以使用 window.open() 或其他预览组件
                              }}>{f.name}</span>
                            </div>
                            <button onClick={() => removeAttachment(f.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                    </Field>
                  </div>
                )}
              </div>
            </div>

            {/* 审批意见区域 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">审批意见</h2>
              </div>
              <Field label="签字意见">
                <div className="relative">
                  <textarea className={`${inputCls} resize-none`} rows={3} value={form.signatureComment} onChange={(e) => updateForm("signatureComment", e.target.value)} />
                  <button className="absolute bottom-2 right-2 flex items-center gap-1 text-gray-400 hover:text-[#8B1450] text-xs">
                    <PenLine size={14} /> 手写签批
                  </button>
                </div>
              </Field>
            </div>
          </div>
        )}


      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <button 
          onClick={() => {
            if (step > 0) {
              setStep(step - 1);
              if (step === 1) {
                // Reset camera upload flag when going back to step 0
                setHasUploadedCamera(false);
              }
            } else {
              navigate("/");
            }
          }} 
          className="px-6 py-2 bg-gray-200 text-gray-600 rounded text-sm hover:bg-gray-300"
        >
          {step === 0 ? "取消" : "上一步"}
        </button>
        <button
          onClick={() => {
            if (step === 0) handleStep0Confirm();
            else if (step === 1 && auditState === "pass") setStep(2);
            else if (step === 2) handleStep2Confirm();
          }}
          disabled={(step === 1 && auditState === "checking")}
          className="px-6 py-2 bg-[#1890FF] text-white rounded text-sm hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {step === 2 ? "提交" : "确认"}
        </button>
      </div>

      {/* 报销事由异常弹窗 */}
      {reasonAbnormalModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">员工报销申请单存在异常</h3>
                  <p className="text-sm text-gray-600">AI审批意见：</p>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-800">
                  根据系统分析，您的员工报销申请单存在以下异常：
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">1.</span>
                    <span>附件内容与报销内容不一致</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">2.</span>
                    <span>票据上的"交款人"与受伤人员不一致</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">3.</span>
                    <span>同一份报销单中，同一个"销售方"合计金额超过2000元的，应对公转账！</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setReasonAbnormalModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-600 text-sm hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={() => setReasonAbnormalModalOpen(false)}
                  className="px-4 py-2 bg-[#8B1450] text-white rounded text-sm hover:bg-[#6e1040]"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <VoiceModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onConfirm={handleVoiceConfirm}
        template="我需要进行员工报销此次报销事由为..."
      />
      <HRSearchModal
        isOpen={hrSearchOpen}
        onClose={handleHRSearchClose}
        onSelect={handleHRSearchSelect}
      />
      <CostCenterSearchModal
        isOpen={costCenterSearchOpen}
        onClose={() => setCostCenterSearchOpen(false)}
        onSelect={handleCostCenterSelect}
      />
      {/* Expense Category Search Modal */}
      {categorySearchOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8B1450]">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  对私费用分类-流程使用
                </h3>
                <button
                  onClick={() => setCategorySearchOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  placeholder="搜索费用分类"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <button className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
                <button className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-200">
                  高级搜索
                </button>
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">费用分类</div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="space-y-0">
                    {[
                      "市内交通费",
                      "通讯、网络及快递费",
                      "汽车费用",
                      "交际应酬费",
                      "运费",
                      "其他杂费",
                      "租金、物业及水电费",
                      "培训费",
                      "办公用品及印刷费"
                    ].map((category, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleCategorySelect(category)}
                      >
                        {category}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">共31条</div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                    &lt;
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                    &lt;
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-[#8B1450] text-white">
                    1
                  </button>
                  <span className="text-sm text-gray-500">/ 4页</span>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                    &gt;
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                    &gt;
                  </button>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setCategorySearchOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-600 text-sm hover:bg-gray-50"
                >
                  清除
                </button>
                <button
                  onClick={() => setCategorySearchOpen(false)}
                  className="px-4 py-2 bg-[#8B1450] text-white rounded text-sm hover:bg-[#6e1040]"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Expense Item Search Modal */}
      {itemSearchOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8B1450]">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  费用项目-流程使用
                </h3>
                <button
                  onClick={() => setItemSearchOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  placeholder="搜索费用项目"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <button className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
                <button className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-200">
                  高级搜索
                </button>
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">费用项目</div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="space-y-0">
                    {[
                      "市内交通费",
                      "工伤交通费",
                      "驻地高速过路费"
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleItemSelect(item)}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">共3条</div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                    &lt;
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                    &lt;
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-[#8B1450] text-white">
                    1
                  </button>
                  <span className="text-sm text-gray-500">/ 1页</span>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                    &gt;
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                    &gt;
                  </button>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setItemSearchOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-600 text-sm hover:bg-gray-50"
                >
                  清除
                </button>
                <button
                  onClick={() => setItemSearchOpen(false)}
                  className="px-4 py-2 bg-[#8B1450] text-white rounded text-sm hover:bg-[#6e1040]"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Expense Period Search Modal */}
      {periodSearchOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8B1450]">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  费用期间
                </h3>
                <button
                  onClick={() => setPeriodSearchOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="text"
                  placeholder="搜索费用期间"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <button className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
                <button className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-200">
                  高级搜索
                </button>
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-2">期间</div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="space-y-0">
                    {[
                      "202603",
                      "202602",
                      "202601",
                      "202512",
                      "202511",
                      "202510",
                      "202509",
                      "202508",
                      "202507"
                    ].map((period, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handlePeriodSelect(period)}
                      >
                        {period}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">共89条</div>
                <div className="flex items-center gap-2">
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                    &lt;
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                    &lt;
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded bg-[#8B1450] text-white">
                    1
                  </button>
                  <span className="text-sm text-gray-500">/ 9页</span>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                    &gt;
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed" disabled>
                    &gt;
                  </button>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setPeriodSearchOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-600 text-sm hover:bg-gray-50"
                >
                  清除
                </button>
                <button
                  onClick={() => setPeriodSearchOpen(false)}
                  className="px-4 py-2 bg-[#8B1450] text-white rounded text-sm hover:bg-[#6e1040]"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <TicketSelectorModal
        isOpen={ticketSelectorOpen}
        onClose={() => setTicketSelectorOpen(false)}
        onConfirm={handleTicketSelect}
      />
    </div>
  );
}