import { useState, useRef } from "react";
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
  X,
  Hourglass,
  Folder,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { StepIndicator } from "../components/StepIndicator";
import { VoiceModal } from "../components/VoiceModal";
import { TicketSelectorModal } from "../components/TicketSelectorModal";
import { HRSearchModal } from "../components/HRSearchModal";
import { DepartmentSearchModal } from "../components/DepartmentSearchModal";
import { CostCenterSearchModal } from "../components/CostCenterSearchModal";
import { CitySearchModal } from "../components/CitySearchModal";
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

interface TransportRow {
  id: number;
  date: string;
  from: string;
  to: string;
  reason: string;
  amount: string;
  currency: string;
}

interface HotelRow {
  id: number;
  city: string;
  days: string;
  exTax: string;
  tax: string;
  total: string;
  currency: string;
  reason: string;
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

const inputCls =
  "w-full border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-[#8B1450]";
const readonlyCls =
  "w-full border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-600 bg-gray-50";
const selectCls =
  "w-full border border-gray-300 rounded px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:border-[#8B1450] appearance-none";

function SmLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-xs text-gray-600 mb-0.5 block">
      {children}
      {required && (
        <span className="text-red-500 ml-0.5">*</span>
      )}
    </label>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <SmLabel required={required}>{label}</SmLabel>
      {children}
    </div>
  );
}

export function TravelReimbursement() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [ticketSelectorOpen, setTicketSelectorOpen] =
    useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [attachmentFiles, setAttachmentFiles] = useState<
    UploadedFile[]
  >([]);
  const [isDragging, setIsDragging] = useState(false);
  const [auditState, setAuditState] = useState<
    "checking" | "pass" | "fail"
  >("checking");
  const [hasUploadedCamera, setHasUploadedCamera] =
    useState(false); // Track if camera upload was clicked
  const [hrSearchOpen, setHRSearchOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<{
    name: string;
    employeeId: string;
  } | null>(null);
  const [departmentSearchOpen, setDepartmentSearchOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<{
    name: string;
    code: string;
  } | null>(null);
  const [costCenterSearchOpen, setCostCenterSearchOpen] = useState(false);
  const [selectedCostCenter, setSelectedCostCenter] = useState<{
    name: string;
    code: string;
  } | null>(null);
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<{
    name: string;
    code: string;
  } | null>(null);
  const [destinationSearchOpen, setDestinationSearchOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<{
    name: string;
    code: string;
  } | null>(null);
  const [workOrderDestSearchOpen, setWorkOrderDestSearchOpen] = useState(false);
  const [selectedWorkOrderDest, setSelectedWorkOrderDest] = useState<{
    name: string;
    code: string;
  } | null>(null);
  const [reimburseTypeModalOpen, setReimburseTypeModalOpen] = useState(false);
  const [tripTypeModalOpen, setTripTypeModalOpen] = useState(false);
  const [invoiceWarningModalOpen, setInvoiceWarningModalOpen] = useState(false);
  const [crmWorkOrderModalOpen, setCrmWorkOrderModalOpen] = useState(false);
  const [noAttachmentModalOpen, setNoAttachmentModalOpen] = useState(false);

  interface WorkOrderRow {
    id: number;
    crmWorkOrder: string;
    departureDate: string;
    departureTime: string;
    returnDate: string;
    returnTime: string;
    licensePlate: string;
    customerName: string;
    customerAddress: string;
  }

  const [workOrderRows, setWorkOrderRows] = useState<WorkOrderRow[]>([
    {
      id: 1,
      crmWorkOrder: '',
      departureDate: '2026-02-25',
      departureTime: '10:30',
      returnDate: '2026-02-27',
      returnTime: '10:30',
      licensePlate: '闽D35636',
      customerName: '',
      customerAddress: '',
    },
  ]);
  
  // 模拟未报销的CRM工单和出差申请数据
  const pendingItems = [
    { id: 1, type: 'CRM工单', name: 'CRM' },
    { id: 2, type: '出差申请', name: '出差申请' },
  ];
  
  // 模拟出差申请数据
  const tripApplications = [
    { id: 1, processNo: 'CCSQ10202 5030006', applicant: '张XX', traveler: '张XX', startDate: '2025-03-30', endDate: '2025-03-31', destination: 'Shanghai上海', reason: '456' },
    { id: 2, processNo: 'CCSQ10202 5030003', applicant: '张XX', traveler: '张XX', startDate: '2025-03-25', endDate: '2025-03-26', destination: 'Changsha长沙', reason: '123' },
    { id: 3, processNo: 'CCSQ10202 5030001', applicant: '张XX', traveler: '张XX', startDate: '2025-03-13', endDate: '2025-03-15', destination: 'Guangzhou广州', reason: '123' },
    { id: 4, processNo: 'CCSQ10202 5030002', applicant: '张XX', traveler: '张XX', startDate: '2025-03-01', endDate: '2025-03-03', destination: 'Beijing北京', reason: '789' },
  ];
  const [form, setForm] = useState({
    title: "差旅报销申请-张XX-2026-03-05",
    reimburseType: "出差申请",
    reimburser: "张XX",
    employeeId: "2412",
    costCenter: "",
    tripApplicationList: "",
    isThirdParty: "否",
    thirdPartyUnit: "",
    costBearingDept: "",
    costBearingCenter: "",
    isCtripHotel: "否",
    tripType: "",
    hasAllowance: "是",
    allowance: "270",
    allowanceCurrency: "RMB",
    deductAmount: "",
    otherAllowance: "",
    allowanceSubtotal: "270",
    applyTotal: "",
    applyTotalAmount: "",
    financeAdjustmentAmount: "",
    accountName: "",
    accountNumber: "",
    bankName: "",
    signatureComment: "",
    createDate: "2026-03-05",
    creator: "张XX",
    creatorEmployeeId: "2412",
    creatorCompany: "林德叉车总部",
    creatorDepartment: "FSS3",
    internalOrderNo: "",
    reimburserDepartment: "",
    reimburseReason: "",
    isUploadInvoice: "",
    preLoan: "",
    repaidAmount: "",
    actualRepayAmount: "",
    loanCurrency: "",
  });
  const [transportRows, setTransportRows] = useState<
    TransportRow[]
  >([
    {
      id: 1,
      date: "2026-03-03",
      from: "上海",
      to: "北京",
      reason: "商务访谈",
      amount: "2100",
      currency: "RMB",
    },
  ]);
  const [hotelRows, setHotelRows] = useState<HotelRow[]>([
    {
      id: 1,
      city: "北京",
      days: "2",
      exTax: "586",
      tax: "74",
      total: "660",
      currency: "RMB",
      reason: "",
    },
  ]);
  const [invoiceRows, setInvoiceRows] = useState<InvoiceRow[]>([
    {
      id: 1,
      no: "12345678",
      date: "2026-03-03",
      tax: "74",
      total: "660",
      buyer: "XX公司",
      buyerId: "91310000XXXX",
      seller: "北京希尔顿酒店",
      sellerId: "91110000XXXX",
      type: "增值税专用发票",
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const removeFile = (id: number) =>
    setFiles((f) => f.filter((x) => x.id !== id));

  const addFile = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    setFiles((f) => [
      ...f,
      {
        id: Date.now(),
        name,
        type: ext === "pdf" ? "pdf" : "image",
      },
    ]);
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    Array.from(e.target.files || []).forEach((f) =>
      addFile(f.name),
    );
  };

  const removeAttachment = (id: number) =>
    setAttachmentFiles((f) => f.filter((x) => x.id !== id));

  const addAttachment = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    setAttachmentFiles((f) => [
      ...f,
      {
        id: Date.now(),
        name,
        type: ext === "pdf" ? "pdf" : "image",
      },
    ]);
  };

  const handleAttachmentChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    Array.from(e.target.files || []).forEach((f) =>
      addAttachment(f.name),
    );
  };

  const handleStep0Confirm = () => {
    if (files.length === 0) {
      setNoAttachmentModalOpen(true);
      return;
    }
    setStep(1);
    setAuditState("checking");
    // If camera upload was clicked, set to fail after checking
    if (hasUploadedCamera) {
      setTimeout(() => setAuditState("fail"), 2500);
    } else {
      setTimeout(() => setAuditState("pass"), 2500);
    }
  };

  const handleNoAttachmentConfirm = () => {
    setNoAttachmentModalOpen(false);
    setStep(2);
  };

  const handleNoAttachmentCancel = () => {
    setNoAttachmentModalOpen(false);
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

  const [reasonAbnormalModalOpen, setReasonAbnormalModalOpen] = useState(false);
  
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
    const isReasonAbnormal = checkAbnormalReason(form.reimburseReason);
    if (isReasonAbnormal) {
      setReasonAbnormalModalOpen(true);
      return;
    }
    
    // If reason is normal, directly submit
    handleSubmit();
  };

  const handleSubmit = () => {
    toast.success("差旅报销申请已成功提交！");
    setTimeout(() => navigate("/"), 1500);
  };

  const handleVoiceConfirm = () => {
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

  const handleDepartmentSearch = () => {
    setDepartmentSearchOpen(true);
  };

  const handleDepartmentSearchClose = () => {
    setDepartmentSearchOpen(false);
  };

  const handleDepartmentSearchSelect = (department: {
    name: string;
    code: string;
  }) => {
    setSelectedDepartment(department);
    setForm((prev) => ({
      ...prev,
      costBearingDept: department.name,
    }));
    setDepartmentSearchOpen(false);
  };

  const handleCostCenterSearch = () => {
    setCostCenterSearchOpen(true);
  };

  const handleCostCenterSearchClose = () => {
    setCostCenterSearchOpen(false);
  };

  const handleCostCenterSearchSelect = (costCenter: {
    code: string;
    isRD: string;
  }) => {
    setSelectedCostCenter({ name: costCenter.code, code: costCenter.code });
    setForm((prev) => ({
      ...prev,
      costBearingCenter: costCenter.code,
    }));
    setCostCenterSearchOpen(false);
  };

  const handleCitySearch = () => {
    setCitySearchOpen(true);
  };

  const handleCitySearchClose = () => {
    setCitySearchOpen(false);
  };

  const handleCitySearchSelect = (city: string) => {
    setSelectedCity({ name: city, code: city });
    // Update the first transport row's 'from' field
    if (transportRows.length > 0) {
      setTransportRows((prev) =>
        prev.map((row, index) =>
          index === 0 ? { ...row, from: city } : row
        )
      );
    }
    setCitySearchOpen(false);
  };

  const handleDestinationSearch = () => {
    setDestinationSearchOpen(true);
  };

  const handleDestinationSearchClose = () => {
    setDestinationSearchOpen(false);
  };

  const handleDestinationSearchSelect = (destination: string) => {
    setSelectedDestination({ name: destination, code: destination });
    // Update the first transport row's 'to' field
    if (transportRows.length > 0) {
      setTransportRows((prev) =>
        prev.map((row, index) =>
          index === 0 ? { ...row, to: destination } : row
        )
      );
    }
    setDestinationSearchOpen(false);
  };

  const handleWorkOrderDestSearch = () => {
    setWorkOrderDestSearchOpen(true);
  };

  const handleWorkOrderDestSearchClose = () => {
    setWorkOrderDestSearchOpen(false);
  };

  const handleWorkOrderDestSearchSelect = (destination: string) => {
    setSelectedWorkOrderDest({ name: destination, code: destination });
    setWorkOrderDestSearchOpen(false);
  };

  const handleTicketSelect = (selectedTickets: any[]) => {
    // Add selected tickets from image management to files
    selectedTickets.forEach((ticket) => {
      const ext = ticket.name.split(".").pop()?.toLowerCase();
      const newFile: UploadedFile = {
        id: Date.now() + Math.random(),
        name: ticket.name,
        type: ext === "pdf" ? "pdf" : "image",
      };
      setFiles((f) => [...f, newFile]);
    });
    setTicketSelectorOpen(false);
    toast.success(
      `已从票据夹添加 ${selectedTickets.length} 张票据！`,
    );
  };

  const calcTransportTotal = () =>
    transportRows
      .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0)
      .toFixed(0);
  const calcHotelTotal = () =>
    hotelRows
      .reduce((s, r) => s + (parseFloat(r.total) || 0), 0)
      .toFixed(0);
  const calcInvoiceTotal = () =>
    invoiceRows
      .reduce((s, r) => s + (parseFloat(r.total) || 0), 0)
      .toFixed(0);
  const totalExpense = (
    parseFloat(calcTransportTotal()) +
    parseFloat(calcHotelTotal())
  ).toFixed(0);
  const applyTotal = parseFloat(totalExpense).toFixed(0);

  const updateForm = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));



  return (
    <div className="flex flex-col h-screen bg-[#F0F0F0]">
      {/* Header */}
      <header className="bg-[#8B1450] text-white flex items-center px-4 py-3 shadow-md flex-shrink-0">
        <button
          onClick={() =>
            step > 0 ? setStep(step - 1) : navigate("/")
          }
          className="mr-4 hover:bg-white/10 rounded-full p-1.5"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">
          差旅报销
        </h1>
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
        {/* ─── STEP 0: Upload ─── */}
        {step === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 cursor-pointer hover:bg-yellow-100 transition-colors" onClick={() => setInvoiceWarningModalOpen(true)}>
              <p className="text-sm font-semibold text-yellow-800 mb-1">
                票据上传说明
              </p>
              <p className="text-xs text-yellow-700">
                请上传相关发票、水单、里程截图、邮件说明等，电子发票只支持上传XML的数据电文、PDF、OFD格式；附件支持pdf、ofd、png、jpg、word、XLSX、EML等格式
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.pdf"
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setHasUploadedCamera(true);
                }}
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
              onClick={() => setTicketSelectorOpen(true)}
              className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 text-sm text-gray-600 hover:bg-gray-50"
            >
              <Folder size={18} /> 票据夹上传
            </button>

            {files.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">
                  已上传票据
                </p>
                <div className="space-y-2">
                  {files.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between border border-gray-200 rounded px-3 py-2 bg-gray-50"
                    >
                      <div className="flex items-center gap-2">
                        {f.type === "pdf" ? (
                          <FileText
                            size={16}
                            className="text-red-500"
                          />
                        ) : (
                          <FileImage
                            size={16}
                            className="text-blue-500"
                          />
                        )}
                        <span className="text-sm text-gray-700">
                          {f.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(f.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── STEP 1: Audit ─── */}
        {step === 1 && (
          <div className="space-y-4">
            {auditState === "checking" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <Hourglass
                  size={20}
                  className="text-yellow-600 flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">
                    票据稽查中
                  </p>
                  <p className="text-xs text-yellow-700 mt-0.5">
                    系统正在自动分析票据合规性信息，请稍候
                  </p>
                </div>
              </div>
            )}
            
            {auditState === "pass" && (
              <div className="bg-green-400 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle
                  size={20}
                  className="text-white flex-shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold text-white">
                    票据稽查通过
                  </p>
                  <p className="text-xs text-white/90 mt-0.5">
                    您上传的票据符合公司规定，可以继续报销流程。
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center py-8">
              <div
                className={`w-20 h-20 ${auditState === "checking" ? "text-[#8B1450] animate-spin" : auditState === "pass" ? "text-green-500" : "text-yellow-500"}`}
              >
                {auditState === "checking" ? <RefreshCw size={80} strokeWidth={1.5} /> : auditState === "pass" ? <CheckCircle size={80} strokeWidth={1.5} /> : <AlertCircle size={80} strokeWidth={1.5} />}
              </div>
              <p className="mt-4 text-sm text-gray-500">
                {auditState === "checking"
                  ? "正在深度分析票据中的内容..."
                  : "票据识别完成"}
              </p>
            </div>

            {auditState === "fail" && (
              <>
                <div className="bg-red-50 border border-red-300 rounded-lg p-4 flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    !
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-red-900 mb-2">
                      票据信息不通过
                    </p>
                    <div className="text-sm text-red-800 space-y-2">
                      <p className="font-medium">【票据不合规】检1号发票已进行报销，存在重复报销，请重新上传合规票据！</p>
                      <p className="font-medium">【票据不合规】检2号发票识别异常，未识别出有效票据信息，请提供正确的合规票据！</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setHasUploadedCamera(true);
                    }}
                    className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <Camera size={18} /> 拍照上传
                  </button>
                  <button
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    <Upload size={18} /> 上传已有附件
                  </button>
                </div>

                <button
                  onClick={() => setTicketSelectorOpen(true)}
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-3 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <Folder size={18} /> 票据夹上传
                </button>
                
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

        {/* ─── STEP 2: Fill Info ─── */}
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
                <h2 className="text-sm font-semibold text-gray-700">
                  基本信息
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="标题">
                  <input
                    className={readonlyCls}
                    value={form.title}
                    readOnly
                  />
                </Field>
                <Field label="创建日期">
                  <input
                    className={readonlyCls}
                    value={form.createDate}
                    readOnly
                  />
                </Field>
                <Field label="创建人">
                  <input
                    className={readonlyCls}
                    value={form.creator}
                    readOnly
                  />
                </Field>
                <Field label="员工号">
                  <input
                    className={readonlyCls}
                    value={form.creatorEmployeeId}
                    readOnly
                  />
                </Field>
                <Field label="创建人公司">
                  <input
                    className={readonlyCls}
                    value={form.creatorCompany}
                    readOnly
                  />
                </Field>
                <Field label="创建人部门">
                  <input
                    className={readonlyCls}
                    value={form.creatorDepartment}
                    readOnly
                  />
                </Field>
              </div>
            </div>

            {/* 详细信息区域 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">
                  详细信息
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Row 1: 报销类型、内部订单号、报销人 */}
                <Field label={<span onClick={() => setReimburseTypeModalOpen(true)} className="cursor-pointer hover:text-[#8B1450]">报销类型</span>} required>
                  <select
                    className={selectCls}
                    value={form.reimburseType}
                    onChange={(e) =>
                      updateForm(
                        "reimburseType",
                        e.target.value,
                      )
                    }
                  >
                    <option> </option>
                    <option>出差申请</option>
                    <option>CRM工单</option>
                  </select>
                </Field>
                <Field label="内部订单号">
                  <input
                    className={inputCls}
                    value={form.internalOrderNo}
                    onChange={(e) =>
                      updateForm(
                        "internalOrderNo",
                        e.target.value,
                      )
                    }
                  />
                </Field>
                <Field label="实际报销人" required>
                  <div className="relative">
                    <input
                      className={inputCls}
                      value={form.reimburser}
                      onChange={(e) =>
                        updateForm("reimburser", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors"
                      onClick={handleHRSearch}
                    >
                      <Search size={14} />
                    </button>
                  </div>
                </Field>

                {/* Row 2: 实际报销人部门、报销人工号、成本中心 */}
                <Field label="实际报销人部门">
                  <input
                    className={inputCls}
                    value={form.reimburserDepartment}
                    onChange={(e) =>
                      updateForm(
                        "reimburserDepartment",
                        e.target.value,
                      )
                    }
                  />
                </Field>
                <Field label="实际报销人工号">
                  <input
                    className={inputCls}
                    value={form.employeeId}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        employeeId: e.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="成本中心">
                  <input
                    className={inputCls}
                    value={form.costCenter}
                    onChange={(e) =>
                      updateForm("costCenter", e.target.value)
                    }
                  />
                </Field>
                <Field label="出差申请列表" required>
                  <input
                    className={inputCls}
                    value={form.tripApplicationList}
                    onChange={(e) =>
                      updateForm(
                        "tripApplicationList",
                        e.target.value,
                      )
                    }
                  />
                </Field>
                <Field label="是否第三方承担费用" required>
                  <select
                    className={selectCls}
                    value={form.isThirdParty}
                    onChange={(e) =>
                      updateForm("isThirdParty", e.target.value)
                    }
                  >
                    <option>否</option>
                    <option>是</option>
                  </select>
                </Field>
                <Field label="第三方费用承担单位" required={form.isThirdParty === "是" ? true : false}>
                  <input
                    className={inputCls}
                    value={form.thirdPartyUnit}
                    onChange={(e) =>
                      updateForm(
                        "thirdPartyUnit",
                        e.target.value,
                      )
                    }
                  />
                </Field>
                <Field label="费用承担部门">
                  <div className="relative">
                    <input
                      className={inputCls}
                      value={form.costBearingDept}
                      onChange={(e) =>
                        updateForm(
                          "costBearingDept",
                          e.target.value,
                        )
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors"
                      onClick={handleDepartmentSearch}
                    >
                      <Search size={14} />
                    </button>
                  </div>
                </Field>
                <Field label="费用承担成本中心">
                  <div className="relative">
                    <input
                      className={inputCls}
                      value={form.costBearingCenter}
                      onChange={(e) =>
                        updateForm(
                          "costBearingCenter",
                          e.target.value,
                        )
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors"
                      onClick={handleCostCenterSearch}
                    >
                      <Search size={14} />
                    </button>
                  </div>
                </Field>
                <Field label="是否通过携程预订酒店">
                  <select
                    className={selectCls}
                    value={form.isCtripHotel}
                    onChange={(e) =>
                      updateForm("isCtripHotel", e.target.value)
                    }
                  >
                    <option>否</option>
                    <option>是</option>
                  </select>
                </Field>
                <Field label={<span onClick={() => setTripTypeModalOpen(true)} className="cursor-pointer hover:text-[#8B1450]">出差类型</span>}>
                  <input
                    className={inputCls}
                    value={form.tripType}
                    onChange={(e) =>
                      updateForm("tripType", e.target.value)
                    }
                  />
                </Field>

                {/* Row 3: 是否享受差旅补贴、报销事由 */}
                <Field label="是否享受差旅补贴">
                  <input
                    className={inputCls}
                    value={form.hasAllowance}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        hasAllowance: e.target.value,
                      }))
                    }
                  />
                </Field>
                <div className="sm:col-span-2 lg:col-span-2">
                  <Field label="报销事由">
                    <input
                      className={inputCls}
                      value={form.reimburseReason}
                      onChange={(e) =>
                        updateForm(
                          "reimburseReason",
                          e.target.value,
                        )
                      }
                      placeholder="请输入报销事由"
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* 差旅信息 */}
            {form.reimburseType === "出差申请" && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-3 border-b pb-1">
                  差旅信息
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Field label="出发地">
                      <div className="relative">
                        <input
                          className={inputCls}
                          defaultValue="Xiamen厦门"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors"
                          onClick={handleCitySearch}
                        >
                          <Search size={14} />
                        </button>
                      </div>
                    </Field>
                    <Field label="目的地">
                      <div className="relative">
                        <input
                          className={inputCls}
                          defaultValue="Shanghai上海"
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors"
                          onClick={handleDestinationSearch}
                        >
                          <Search size={14} />
                        </button>
                      </div>
                    </Field>
                    <Field label="申请出发日">
                      <input
                        className={inputCls}
                        type="date"
                        defaultValue="2026-02-25"
                      />
                    </Field>
                    <Field label="申请返程日">
                      <input
                        className={inputCls}
                        type="date"
                        defaultValue="2026-02-27"
                      />
                    </Field>
                    <Field label="申请天数">
                      <input
                        className={inputCls}
                        defaultValue="3"
                      />
                    </Field>
                    <Field label="实际出发日" required>
                      <input
                        className={inputCls}
                        type="date"
                        defaultValue="2026-02-25"
                      />
                    </Field>
                    <Field label="出发时间" required>
                      <input
                        className={inputCls}
                        type="time"
                        defaultValue="10:30"
                      />
                    </Field>
                    <Field label="实际返程日" required>
                      <input
                        className={inputCls}
                        type="date"
                        defaultValue="2026-02-27"
                      />
                    </Field>
                    <Field label="返程时间" required>
                      <input
                        className={inputCls}
                        type="time"
                        defaultValue="10:30"
                      />
                    </Field>
                    <Field label="实际天数">
                      <input
                        className={inputCls}
                        defaultValue="3"
                      />
                    </Field>
                    <Field label="交通工具">
                      <select className={selectCls}>
                        <option value=""> </option>
                        <option>飞机</option>
                        <option>客运大巴</option>
                        <option>船</option>
                        <option>火车/动车/高铁</option>
                        <option>自驾车</option>
                        <option>售后服务车</option>
                      </select>
                    </Field>
                    <Field label="早餐">
                      <input
                        className={inputCls}
                        defaultValue="3"
                      />
                    </Field>
                    <Field label="午餐">
                      <input
                        className={inputCls}
                        defaultValue=""
                      />
                    </Field>
                    <Field label="晚餐">
                      <input
                        className={inputCls}
                        defaultValue=""
                      />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {/* 工单信息 */}
            {form.reimburseType === "CRM工单" && (
              <div className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-700">
                    工单信息
                  </h2>
                  <button
                    onClick={() =>
                      setWorkOrderRows((r) => [
                        ...r,
                        {
                          id: Date.now(),
                          crmWorkOrder: '',
                          departureDate: '2026-02-25',
                          departureTime: '10:30',
                          returnDate: '2026-02-27',
                          returnTime: '10:30',
                          licensePlate: '',
                          customerName: '',
                          customerAddress: '',
                        },
                      ])
                    }
                    className="flex items-center gap-1 text-[#8B1450] hover:text-[#6e1040] text-xs"
                  >
                    <Plus size={16} /> 添加
                  </button>
                </div>
                <div className="space-y-3">
                  {workOrderRows.map((row, index) => (
                    <div
                      key={row.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative"
                    >
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() =>
                            setWorkOrderRows((rs) =>
                              rs.filter((r) => r.id !== row.id),
                            )
                          }
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-xs font-medium text-gray-500 mb-3">
                        工单 #{index + 1}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <Field label="CRM工单" required>
                          <div className="relative">
                            <input
                              className={inputCls}
                              value={row.crmWorkOrder}
                              onChange={(e) =>
                                setWorkOrderRows((rs) =>
                                  rs.map((r) =>
                                    r.id === row.id
                                      ? {
                                          ...r,
                                          crmWorkOrder: e.target.value,
                                        }
                                      : r,
                                  ),
                                )
                              }
                            />
                            <button 
                              type="button" 
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors"
                              onClick={() => setCrmWorkOrderModalOpen(true)}
                            >
                              <Search size={14} />
                            </button>
                          </div>
                        </Field>
                        <Field label="出发日期">
                          <input
                            className={inputCls}
                            type="date"
                            value={row.departureDate}
                            onChange={(e) =>
                              setWorkOrderRows((rs) =>
                                rs.map((r) =>
                                  r.id === row.id
                                    ? {
                                        ...r,
                                        departureDate: e.target.value,
                                      }
                                    : r,
                                ),
                              )
                            }
                          />
                        </Field>
                        <Field label="出发时间">
                          <input
                            className={inputCls}
                            type="time"
                            value={row.departureTime}
                            onChange={(e) =>
                              setWorkOrderRows((rs) =>
                                rs.map((r) =>
                                  r.id === row.id
                                    ? {
                                        ...r,
                                        departureTime: e.target.value,
                                      }
                                    : r,
                                ),
                              )
                            }
                          />
                        </Field>
                        <Field label="返程日期">
                          <input
                            className={inputCls}
                            type="date"
                            value={row.returnDate}
                            onChange={(e) =>
                              setWorkOrderRows((rs) =>
                                rs.map((r) =>
                                  r.id === row.id
                                    ? {
                                        ...r,
                                        returnDate: e.target.value,
                                      }
                                    : r,
                                ),
                              )
                            }
                          />
                        </Field>
                        <Field label="返程时间">
                          <input
                            className={inputCls}
                            type="time"
                            value={row.returnTime}
                            onChange={(e) =>
                              setWorkOrderRows((rs) =>
                                rs.map((r) =>
                                  r.id === row.id
                                    ? {
                                        ...r,
                                        returnTime: e.target.value,
                                      }
                                    : r,
                                ),
                              )
                            }
                          />
                        </Field>
                        <Field label="车牌号">
                          <input
                            className={inputCls}
                            value={row.licensePlate}
                            onChange={(e) =>
                              setWorkOrderRows((rs) =>
                                rs.map((r) =>
                                  r.id === row.id
                                    ? {
                                        ...r,
                                        licensePlate: e.target.value,
                                      }
                                    : r,
                                ),
                              )
                            }
                          />
                        </Field>
                        <Field label="客户名称">
                          <input
                            className={inputCls}
                            value={row.customerName}
                            onChange={(e) =>
                              setWorkOrderRows((rs) =>
                                rs.map((r) =>
                                  r.id === row.id
                                    ? {
                                        ...r,
                                        customerName: e.target.value,
                                      }
                                    : r,
                                ),
                              )
                            }
                          />
                        </Field>
                        <Field label="客户地址">
                          <input
                            className={inputCls}
                            value={row.customerAddress}
                            onChange={(e) =>
                              setWorkOrderRows((rs) =>
                                rs.map((r) =>
                                  r.id === row.id
                                    ? {
                                        ...r,
                                        customerAddress: e.target.value,
                                      }
                                    : r,
                                ),
                              )
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 出差详情信息 */}
            {form.reimburseType === "CRM工单" && (
              <div className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-700">
                    CRM工单信息
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="出发地" required>
                    <div className="relative">
                      <input
                        className={inputCls}
                        defaultValue=""
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors"
                        onClick={handleCitySearch}
                      >
                        <Search size={14} />
                      </button>
                    </div>
                  </Field>
                  <Field label="目的地" required>
                    <div className="relative">
                      <input
                        className={inputCls}
                        defaultValue=""
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors"
                        onClick={handleWorkOrderDestSearch}
                      >
                        <Search size={14} />
                      </button>
                    </div>
                  </Field>
                  <Field label="实际出差天数">
                    <input
                      className={inputCls}
                      defaultValue=""
                    />
                  </Field>
                  <Field label="往返公里数" required>
                    <input
                      className={inputCls}
                      defaultValue=""
                    />
                  </Field>
                  <Field label="交通工具">
                    <select className={selectCls}>
                      <option value=""> </option>
                      <option>飞机</option>
                      <option>客运大巴</option>
                      <option>船</option>
                      <option>火车/动车/高铁</option>
                      <option>自驾车</option>
                      <option>售后服务车</option>
                    </select>
                  </Field>
                  <Field label="非自费早餐">
                    <input
                      className={inputCls}
                      defaultValue=""
                    />
                  </Field>
                  <Field label="非自费午餐">
                    <input
                      className={inputCls}
                      defaultValue=""
                    />
                  </Field>
                  <Field label="非自费晚餐">
                    <input
                      className={inputCls}
                      defaultValue=""
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* 交通费 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">
                  交通费
                </h2>
                <button
                  onClick={() =>
                    setTransportRows((r) => [
                      ...r,
                      {
                        id: Date.now(),
                        date: "",
                        from: "",
                        to: "",
                        reason: "",
                        amount: "",
                        currency: "RMB",
                      },
                    ])
                  }
                  className="flex items-center gap-1 text-[#8B1450] hover:text-[#6e1040] text-xs"
                >
                  <Plus size={16} /> 添加
                </button>
              </div>
              <div className="space-y-3">
                {transportRows.map((row, index) => (
                  <div
                    key={row.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative"
                  >
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() =>
                          setTransportRows((rs) =>
                            rs.filter((r) => r.id !== row.id),
                          )
                        }
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs font-medium text-gray-500 mb-3">
                      交通费 #{index + 1}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Field label="日期" required>
                        <input
                          className={inputCls}
                          type="date"
                          value={row.date}
                          onChange={(e) =>
                            setTransportRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      date: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="出发地" required>
                        <input
                          className={inputCls}
                          value={row.from}
                          onChange={(e) =>
                            setTransportRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      from: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="目的地" required>
                        <input
                          className={inputCls}
                          value={row.to}
                          onChange={(e) =>
                            setTransportRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? { ...r, to: e.target.value }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="公务事由" required>
                        <input
                          className={inputCls}
                          value={row.reason}
                          onChange={(e) =>
                            setTransportRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      reason: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="金额">
                        <input
                          className={inputCls}
                          value={row.amount}
                          onChange={(e) =>
                            setTransportRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      amount: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="币别">
                        <select
                          className={selectCls}
                          value={row.currency}
                          onChange={(e) =>
                            setTransportRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      currency: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        >
                          <option>RMB</option>
                          <option>EUR</option>
                          <option>USD</option>
                          <option>GBP</option>
                          <option>SGD</option>
                          <option>HKD</option>
                          <option>JPY</option>
                          <option>KRM</option>
                          <option>MYR</option>
                          <option>PHP</option>
                          <option>TWD</option>
                          <option>VND</option>
                          <option>IDR</option>
                          <option>INR</option>
                          <option>BRL</option>
                          <option>THB</option>
                          <option>ZAR</option>
                          <option>AUD</option>
                          <option>PLN</option>
                          <option>NZD</option>
                          <option>ATS</option>
                          <option>CZK</option>
                          <option>AED</option>
                          <option>SEK</option>
                          <option>CHF</option>
                          <option>CLP</option>
                          <option>HUF</option>
                          <option>NOK</option>
                          <option>RUB</option>
                          <option>TRY</option>
                          <option>MOP</option>
                          <option>CAD</option>
                        </select>
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 住宿费 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">
                  住宿费
                </h2>
                <button
                  onClick={() =>
                    setHotelRows((r) => [
                      ...r,
                      {
                        id: Date.now(),
                        city: "",
                        days: "",
                        exTax: "",
                        tax: "",
                        total: "",
                        currency: "RMB",
                        reason: "",
                      },
                    ])
                  }
                  className="flex items-center gap-1 text-[#8B1450] hover:text-[#6e1040] text-xs"
                >
                  <Plus size={16} /> 添加
                </button>
              </div>
              <div className="space-y-3">
                {hotelRows.map((row, index) => (
                  <div
                    key={row.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative"
                  >
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() =>
                          setHotelRows((rs) =>
                            rs.filter((r) => r.id !== row.id),
                          )
                        }
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs font-medium text-gray-500 mb-3">
                      住宿费 #{index + 1}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Field label="住宿城市" required>
                        <input
                          className={inputCls}
                          value={row.city}
                          onChange={(e) =>
                            setHotelRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      city: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="住宿天数" required>
                        <input
                          className={inputCls}
                          value={row.days}
                          onChange={(e) =>
                            setHotelRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      days: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="不含税金额">
                        <input
                          className={inputCls}
                          value={row.exTax}
                          onChange={(e) =>
                            setHotelRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      exTax: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="进项税额">
                        <input
                          className={inputCls}
                          value={row.tax}
                          onChange={(e) =>
                            setHotelRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      tax: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="总金额">
                        <input
                          className={inputCls}
                          value={row.total}
                          onChange={(e) =>
                            setHotelRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      total: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="币别">
                        <select
                          className={selectCls}
                          value={row.currency}
                          onChange={(e) =>
                            setHotelRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      currency: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        >
                          <option>RMB</option>
                          <option>EUR</option>
                          <option>USD</option>
                          <option>GBP</option>
                          <option>SGD</option>
                          <option>HKD</option>
                          <option>JPY</option>
                          <option>KRM</option>
                          <option>MYR</option>
                          <option>PHP</option>
                          <option>TWD</option>
                          <option>VND</option>
                          <option>IDR</option>
                          <option>INR</option>
                          <option>BRL</option>
                          <option>THB</option>
                          <option>ZAR</option>
                          <option>AUD</option>
                          <option>PLN</option>
                          <option>NZD</option>
                          <option>ATS</option>
                          <option>CZK</option>
                          <option>AED</option>
                          <option>SEK</option>
                          <option>CHF</option>
                          <option>CLP</option>
                          <option>HUF</option>
                          <option>NOK</option>
                          <option>RUB</option>
                          <option>TRY</option>
                          <option>MOP</option>
                          <option>CAD</option>
                        </select>
                      </Field>
                      <Field label="超标原因">
                        <input
                          className={inputCls}
                          value={row.reason}
                          onChange={(e) =>
                            setHotelRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      reason: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 报销合计区域 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">
                  报销合计
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="交通费与住宿费合计">
                  <input
                    className={inputCls}
                    value={totalExpense}
                    onChange={(e) => {
                      const transport =
                        parseFloat(form.transportExpense) || 0;
                      const hotel =
                        parseFloat(form.hotelExpense) || 0;
                      const newTotal =
                        parseFloat(e.target.value) || 0;
                      // Update totalExpense directly
                      setForm((f) => ({
                        ...f,
                        transportExpense: String(
                          newTotal - hotel,
                        ),
                      }));
                    }}
                  />
                </Field>
                <Field label="发票金额">
                  <input
                    className={inputCls}
                    value={calcInvoiceTotal()}
                    onChange={(e) => {
                      // Allow editing but recalculate on blur
                    }}
                  />
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
              </div>
            </div>

            {/* 发票信息 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">
                  发票信息
                </h2>
                <button
                  onClick={() =>
                    setInvoiceRows((r) => [
                      ...r,
                      {
                        id: Date.now(),
                        no: "",
                        date: "",
                        tax: "",
                        total: "",
                        buyer: "",
                        buyerId: "",
                        seller: "",
                        sellerId: "",
                        type: "",
                      },
                    ])
                  }
                  className="flex items-center gap-1 text-[#8B1450] hover:text-[#6e1040] text-xs"
                >
                  <Plus size={16} /> 添加
                </button>
              </div>
              <div className="space-y-3">
                {invoiceRows.map((row, index) => (
                  <div
                    key={row.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative"
                  >
                    <div className="absolute top-3 right-3">
                      <button
                        onClick={() =>
                          setInvoiceRows((rs) =>
                            rs.filter((r) => r.id !== row.id),
                          )
                        }
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs font-medium text-gray-500 mb-3">
                      发票 #{index + 1}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <Field label="发票号码" required>
                        <input
                          className={inputCls}
                          value={row.no}
                          onChange={(e) =>
                            setInvoiceRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? { ...r, no: e.target.value }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="发票日期">
                        <input
                          className={inputCls}
                          type="date"
                          value={row.date}
                          onChange={(e) =>
                            setInvoiceRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      date: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="税额">
                        <input
                          className={inputCls}
                          value={row.tax}
                          onChange={(e) =>
                            setInvoiceRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      tax: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="发票总额">
                        <input
                          className={inputCls}
                          value={row.total}
                          onChange={(e) =>
                            setInvoiceRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      total: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="购买方">
                        <input
                          className={inputCls}
                          value={row.buyer}
                          onChange={(e) =>
                            setInvoiceRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      buyer: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="购买方识别号">
                        <input
                          className={inputCls}
                          value={row.buyerId}
                          onChange={(e) =>
                            setInvoiceRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      buyerId: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="销售方">
                        <input
                          className={inputCls}
                          value={row.seller}
                          onChange={(e) =>
                            setInvoiceRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      seller: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="销售方识别号">
                        <input
                          className={inputCls}
                          value={row.sellerId}
                          onChange={(e) =>
                            setInvoiceRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      sellerId: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        />
                      </Field>
                      <Field label="发票类型">
                        <select
                          className={selectCls}
                          value={row.type}
                          onChange={(e) =>
                            setInvoiceRows((rs) =>
                              rs.map((r) =>
                                r.id === row.id
                                  ? {
                                      ...r,
                                      type: e.target.value,
                                    }
                                  : r,
                              ),
                            )
                          }
                        >
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

            {/* 补贴信息区域 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">
                  补贴信息
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="差旅补贴">
                  <input
                    className={inputCls}
                    value={form.allowance}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        allowance: e.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="补贴币别">
                  <select
                    className={selectCls}
                    value={form.allowanceCurrency}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        allowanceCurrency: e.target.value,
                      }))
                    }
                  >
                    <option> </option>
                    <option>RMB</option>
                    <option>EUR</option>
                    <option>USD</option>
                    <option>GBP</option>
                    <option>SGD</option>
                    <option>HKD</option>
                    <option>JPY</option>
                    <option>KRM</option>
                    <option>MYR</option>
                    <option>PHP</option>
                    <option>TWD</option>
                    <option>VND</option>
                    <option>IDR</option>
                    <option>INR</option>
                    <option>BRL</option>
                    <option>THB</option>
                    <option>ZAR</option>
                    <option>AUD</option>
                    <option>PLN</option>
                    <option>NZD</option>
                    <option>ATS</option>
                    <option>CZK</option>
                    <option>AED</option>
                    <option>SEK</option>
                    <option>CHF</option>
                    <option>CLP</option>
                    <option>HUF</option>
                    <option>NOK</option>
                    <option>RUB</option>
                    <option>TRY</option>
                    <option>MOP</option>
                    <option>CAD</option>
                  </select>
                </Field>
                <Field label="扣除金额">
                  <input
                    className={inputCls}
                    value={form.deductAmount}
                    onChange={(e) =>
                      updateForm("deductAmount", e.target.value)
                    }
                  />
                </Field>
                <Field label="其他补贴">
                  <input
                    className={inputCls}
                    value={form.otherAllowance}
                    onChange={(e) =>
                      updateForm(
                        "otherAllowance",
                        e.target.value,
                      )
                    }
                  />
                </Field>
                <Field label="补贴小计">
                  <input
                    className={inputCls}
                    value={form.allowanceSubtotal}
                    onChange={(e) =>
                      updateForm(
                        "allowanceSubtotal",
                        e.target.value,
                      )
                    }
                  />
                </Field>
                <Field label="申请金额合计">
                  <input
                    className={inputCls}
                    value={form.applyTotal}
                    onChange={(e) =>
                      updateForm("applyTotal", e.target.value)
                    }
                  />
                </Field>

                <Field label="财务审核调整金额">
                  <input
                    className={inputCls}
                    value={form.applyTotalAmount}
                    onChange={(e) =>
                      updateForm(
                        "applyTotalAmount",
                        e.target.value,
                      )
                    }
                  />
                </Field>

                <Field label="调整金额说明">
                  <input
                    className={inputCls}
                    value={form.financeAdjustmentAmount}
                    onChange={(e) =>
                      updateForm(
                        "financeAdjustmentAmount",
                        e.target.value,
                      )
                    }
                  />
                </Field>

                <Field label="户名">
                  <input
                    className={inputCls}
                    value={form.accountName}
                    onChange={(e) =>
                      updateForm(
                        "accountName",
                        e.target.value,
                      )
                    }
                  />
                </Field>

                <Field label="收款人账号">
                  <input
                    className={inputCls}
                    value={form.accountNumber}
                    onChange={(e) =>
                      updateForm(
                        "accountNumber",
                        e.target.value,
                      )
                    }
                  />
                </Field>

                <Field label="收款人开户行">
                  <input
                    className={inputCls}
                    value={form.bankName}
                    onChange={(e) =>
                      updateForm(
                        "bankName",
                        e.target.value,
                      )
                    }
                  />
                </Field>
                
                {attachmentFiles.length > 0 && (
                  <div className="lg:col-span-3">
                    <Field label="相关附件">
                      <div className="space-y-2">
                        {attachmentFiles.map((f) => (
                          <div
                            key={f.id}
                            className="flex items-center justify-between border border-gray-200 rounded px-3 py-2 bg-gray-50"
                          >
                            <div className="flex items-center gap-2">
                              {f.type === "pdf" ? (
                                <FileText
                                  size={16}
                                  className="text-red-500"
                                />
                              ) : (
                                <FileImage
                                  size={16}
                                  className="text-blue-500"
                                />
                              )}
                              <span 
                                className="text-sm text-gray-700 cursor-pointer hover:text-[#8B1450]"
                                onClick={() => {
                                  // 模拟附件预览功能
                                  alert(`预览附件: ${f.name}`);
                                  // 实际项目中可以使用 window.open() 或其他预览组件
                                }}
                              >
                                {f.name}
                              </span>
                            </div>
                            <button
                              onClick={() => removeAttachment(f.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </Field>
                  </div>
                )}
              </div>
            </div>

            {/* 预借款信息区域 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">
                  预借款信息
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="预借款">
                  <input
                    className={inputCls}
                    value={form.preLoan}
                    onChange={(e) =>
                      updateForm("preLoan", e.target.value)
                    }
                  />
                </Field>
                <Field label="已还款">
                  <input
                    className={inputCls}
                    value={form.repaidAmount}
                    onChange={(e) =>
                      updateForm("repaidAmount", e.target.value)
                    }
                  />
                </Field>
                <Field label="实际借款">
                  <input
                    className={inputCls}
                    value={form.actualRepayAmount}
                    onChange={(e) =>
                      updateForm("actualRepayAmount", e.target.value)
                    }
                  />
                </Field>
                <Field label="借款币别">
                  <select
                    className={selectCls}
                    value={form.loanCurrency}
                    onChange={(e) =>
                      updateForm("loanCurrency", e.target.value)
                    }
                  >
                    <option> </option>
                    <option>RMB</option>
                    <option>EUR</option>
                    <option>USD</option>
                    <option>GBP</option>
                    <option>SGD</option>
                    <option>HKD</option>
                    <option>JPY</option>
                    <option>KRM</option>
                    <option>MYR</option>
                    <option>PHP</option>
                    <option>TWD</option>
                    <option>VND</option>
                    <option>IDR</option>
                    <option>INR</option>
                    <option>BRL</option>
                    <option>THB</option>
                    <option>ZAR</option>
                    <option>AUD</option>
                    <option>PLN</option>
                    <option>NZD</option>
                    <option>ATS</option>
                    <option>CZK</option>
                    <option>AED</option>
                    <option>SEK</option>
                    <option>CHF</option>
                    <option>CLP</option>
                    <option>HUF</option>
                    <option>NOK</option>
                    <option>RUB</option>
                    <option>TRY</option>
                    <option>MOP</option>
                    <option>CAD</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* 签字意见区域 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">
                  签字意见
                </h2>
              </div>
              <Field label="签字意见">
                <div className="relative">
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={3}
                    value={form.signatureComment}
                    onChange={(e) =>
                      updateForm(
                        "signatureComment",
                        e.target.value,
                      )
                    }
                  />
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
          className="px-6 py-2 bg-gray-200 text-gray-600 rounded text-sm hover:bg-gray-300 transition-colors"
        >
          {step === 0 ? "取消" : "上一步"}
        </button>
        <button
          onClick={() => {
            if (step === 0) handleStep0Confirm();
            else if (step === 1 && auditState === "pass")
              setStep(2);
            else if (step === 2) handleStep2Confirm();
          }}
          disabled={
            step === 1 && auditState === "checking"
          }
          className="px-6 py-2 bg-[#1890FF] text-white rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {step === 2 ? "提交" : "确认"}
        </button>
      </div>

      <VoiceModal
        isOpen={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        onConfirm={handleVoiceConfirm}
        template="我需要进行差旅报销，报销事由为：..."
      />

      <TicketSelectorModal
        isOpen={ticketSelectorOpen}
        onClose={() => setTicketSelectorOpen(false)}
        onConfirm={handleTicketSelect}
      />

      <HRSearchModal
        isOpen={hrSearchOpen}
        onClose={handleHRSearchClose}
        onSelect={handleHRSearchSelect}
      />

      <DepartmentSearchModal
        isOpen={departmentSearchOpen}
        onClose={handleDepartmentSearchClose}
        onSelect={handleDepartmentSearchSelect}
      />

      <CostCenterSearchModal
        isOpen={costCenterSearchOpen}
        onClose={handleCostCenterSearchClose}
        onSelect={handleCostCenterSearchSelect}
      />

      <CitySearchModal
        isOpen={citySearchOpen}
        onClose={handleCitySearchClose}
        onSelect={handleCitySearchSelect}
      />

      <CitySearchModal
        isOpen={destinationSearchOpen}
        onClose={handleDestinationSearchClose}
        onSelect={handleDestinationSearchSelect}
      />

      <CitySearchModal
        isOpen={workOrderDestSearchOpen}
        onClose={handleWorkOrderDestSearchClose}
        onSelect={handleWorkOrderDestSearchSelect}
      />

      {/* 报销类型选择弹窗 */}
      {reimburseTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReimburseTypeModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">选择报销类型</h3>
              <p className="text-sm text-gray-600 mb-4">当前同时存在未报销的CRM工单和出差申请，请选择报销类型：</p>
              <div className="space-y-3">
                {pendingItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => {
                      updateForm("reimburseType", item.type);
                      setReimburseTypeModalOpen(false);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{item.type}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-end">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                  onClick={() => setReimburseTypeModalOpen(false)}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 出差类型选择弹窗 */}
      {tripTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setTripTypeModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">多条未报销的出差申请，请选择！</h3>
              <div className="mb-4 flex justify-between items-center">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="搜索" 
                    className="pl-8 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1450]/50 focus:border-[#8B1450]"
                  />
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm hover:bg-gray-200">
                  高级搜索
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-600">申请人</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">实际出差人</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">出差开始日期</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">出差返回日期</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">目的地</th>
                      <th className="text-left py-2 px-3 font-medium text-gray-600">出差原因</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tripApplications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => {
                        updateForm("tripType", app.processNo);
                        setTripTypeModalOpen(false);
                      }}>
                        <td className="py-2 px-3">{app.applicant}</td>
                        <td className="py-2 px-3">{app.traveler}</td>
                        <td className="py-2 px-3">{app.startDate}</td>
                        <td className="py-2 px-3">{app.endDate}</td>
                        <td className="py-2 px-3">{app.destination}</td>
                        <td className="py-2 px-3">{app.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">共 4 条</div>
                <div className="flex items-center gap-1">
                  <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-400 disabled:cursor-not-allowed" disabled>
                    <ChevronLeft size={14} />
                  </button>
                  <button className="w-6 h-6 flex items-center justify-center rounded bg-[#8B1450] text-white">1</button>
                  <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-400 disabled:cursor-not-allowed" disabled>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                  onClick={() => setTripTypeModalOpen(false)}
                >
                  清除
                </button>
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                  onClick={() => setTripTypeModalOpen(false)}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 发票警告弹窗 */}
      {invoiceWarningModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-800 mb-3">
                当前上传的发票非交通费/住宿费发票，请处理！
              </p>
              <p className="text-sm text-gray-700 mb-6">
                是否删除该发票！
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setInvoiceWarningModalOpen(false);
                  // 这里可以添加删除发票的逻辑
                  toast.success("发票已删除");
                }}
                className="flex-1 py-2 bg-[#8B1450] text-white rounded text-sm hover:bg-[#6e1040]"
              >
                是
              </button>
              <button
                onClick={() => setInvoiceWarningModalOpen(false)}
                className="flex-1 py-2 border border-gray-300 rounded text-gray-600 text-sm hover:bg-gray-50"
              >
                忽略
              </button>
            </div>
          </div>
        </div>
      )}
      
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">差旅报销申请单存在异常</h3>
                  <p className="text-sm text-gray-600">AI审批意见：</p>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-800">
                  根据系统分析，您的差旅报销申请单存在以下异常：
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">1.</span>
                    <span>住宿标准超标</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">2.</span>
                    <span>实际出差天数与计划偏差过大</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">3.</span>
                    <span>水单存在额外消费</span>
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
      


      {/* CRM工单选择弹窗 */}
      {crmWorkOrderModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  CRM工单
                </h3>
              </div>
              <button
                onClick={() => setCrmWorkOrderModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-end">
              <div className="relative">
                <input 
                  type="text" 
                  className="border border-gray-300 rounded-l px-3 py-2 text-sm"
                  placeholder="搜索"
                />
                <button className="bg-gray-100 border border-gray-300 rounded-r px-3 py-2 text-sm text-gray-600 hover:bg-gray-200">
                  <Search size={14} />
                </button>
              </div>
              <button className="ml-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
                高级搜索
              </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">服务单号</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">客户名称</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">出发日期</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">出发时间</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">返程日期</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">返程时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                          <Search size={24} className="text-gray-400" />
                        </div>
                        <span>暂无数据</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-4 pb-4 pt-3 border-t border-gray-100 flex-shrink-0 justify-end">
              <button
                onClick={() => setCrmWorkOrderModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm hover:bg-gray-50"
              >
                清除
              </button>
              <button
                onClick={() => setCrmWorkOrderModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 无附件提示弹窗 */}
      {noAttachmentModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                当前没有上传票据/附件，请问是否进行差补报销
              </h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleNoAttachmentCancel}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleNoAttachmentConfirm}
                className="flex-1 py-2 bg-[#8B1450] text-white rounded-lg text-sm hover:bg-[#6e1040]"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}