import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Mic,
  PenLine,
  ChevronDown,
  Plus,
  Trash2,
  Upload,
  Hourglass,
  CheckCircle,
  RefreshCw,
  Search,
  AlertCircle,
  FileImage,
  FileText,
  File,
} from "lucide-react";
import { StepIndicator } from "../components/StepIndicator";
import { VoiceModal } from "../components/VoiceModal";
import { HRSearchModal } from "../components/HRSearchModal";
import { DepartmentSearchModal } from "../components/DepartmentSearchModal";
import { CostCenterSearchModal } from "../components/CostCenterSearchModal";
import { CitySearchModal } from "../components/CitySearchModal";
import { toast } from "sonner";



const TRIP_TYPES = [
  "国内出差",
  "国外出差",
  "国内出差（培训）",
  "国外出差（培训）",
  "国内出差（总部销售培训）",
  "国内出差（总部售后培训）",
];

const TRANSPORT_OPTIONS = [
  "飞机",
  "客运大巴",
  "船",
  "火车/动车/高铁",
  "自驾车",
];
const YES_NO = ["是", "否"];
const YES_NO_OPTIONS = ["", "是", "否"]; // 空白、是、否
const CURRENCY = ["RMB", "USD", "EUR", "JPY"];

// City distance lookup (simplified, km round trip)
const CITY_DISTANCES: Record<string, number> = {
  "上海-北京": 2636,
  "上海-广州": 2430,
  "上海-深圳": 2550,
  "上海-成都": 3378,
  "上海-武汉": 1282,
  "上海-杭州": 338,
  "上海-南京": 588,
  "北京-广州": 4372,
  "北京-上海": 2636,
  "北京-深圳": 4492,
  "北京-成都": 3616,
  "广州-北京": 4372,
  "深圳-上海": 2550,
  "成都-北京": 3616,
};

const FIRST_TIER = ["北京", "上海", "广州", "深圳"];
const ALLOWANCE_PER_DAY = 90;
const HOTEL_FIRST_TIER = 330;
const HOTEL_OTHER = 220;

function calcDistance(from: string, to: string): number {
  const key = `${from}-${to}`;
  const rev = `${to}-${from}`;
  return CITY_DISTANCES[key] || CITY_DISTANCES[rev] || 500;
}

function calcDays(start: string, end: string): number {
  if (!start || !end) return 0;
  const diff =
    new Date(end).getTime() - new Date(start).getTime();
  return Math.max(
    1,
    Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1,
  );
}

function calcAllowance(
  tripType: string,
  km: number,
  days: number,
): number {
  const noAllowanceTypes = [
    "国内出差（总部售后培训）",
    "国内出差（总部销售培训）",
  ];
  if (noAllowanceTypes.includes(tripType) || km < 200) return 0;
  return days * ALLOWANCE_PER_DAY;
}

function calcTransportCost(
  transport: string,
  km: number,
): number {
  const one = km / 2;
  if (transport === "飞机") return Math.round(one * 0.8 + 300);
  if (transport === "高铁") return Math.round(one * 0.45);
  if (transport === "火车") return Math.round(one * 0.25);
  return Math.round(one * 0.3);
}

function calcHotel(dest: string, days: number): number {
  const nights = Math.max(0, days - 1);
  const perNight = FIRST_TIER.some((c) => dest.includes(c))
    ? HOTEL_FIRST_TIER
    : HOTEL_OTHER;
  return nights * perNight;
}

interface UploadedFile {
  id: number;
  name: string;
  type: "image" | "pdf" | "doc" | "other";
}

interface FormData {
  title: string;
  tripType: string;
  traveler: string;
  employeeId: string;
  startDate: string;
  returnDate: string;
  departure: string;
  destination: string;
  company: string;
  reason: string;
  transport: string;
  tripDays: number;
  roundKm: number;
  hasAllowance: string;
  isThirdParty: string;
  thirdPartyUnit: string;
  k2Module: string;
  trainingNo: string;
  bookedByTrip: string;
  canResolveRemotely: string;
  needAdvance: string;
  advanceAmount: string;
  currency: string;
  allowance: number;
  allowanceCurrency: string;
  transportCost: number;
  transportCostCurrency: string;
  localTransport: number;
  localTransportCurrency: string;
  hotelCost: number;
  hotelCostCurrency: string;
  totalCost: number;
  totalCostCurrency: string;
  trainingCourse: string;
  signatureComment: string;
  tripCost: string;
  colleagues: string;
  costConfirmation: string;
  accommodationStandard: string;
  ticketHandlingUnit: string;
  createDate: string;
  creator: string;
  creatorEmployeeId: string;
  creatorCompany: string;
  creatorDepartment: string;
  costBearingDepartment: string;
  costBearingCostCenter: string;
  costCenter: string;
  internalOrderNo: string;
}

interface TripDetail {
  id: number;
  departure: string;
  destination: string;
  company: string;
  reason: string;
  transport: string;
  startDate: string;
  returnDate: string;
}

const defaultForm: FormData = {
  title: "出差申请-张XX-2026-03-05",
  tripType: "国内出差",
  traveler: "张三",
  employeeId: "1311",
  startDate: "2026-03-03",
  returnDate: "2026-03-05",
  departure: "上海",
  destination: "北京",
  company: "北京XX信息公司",
  reason: "商务访谈",
  transport: "飞机",
  tripDays: 3,
  roundKm: 2636,
  hasAllowance: "是",
  isThirdParty: "",
  thirdPartyUnit: "",
  k2Module: "",
  trainingNo: "",
  bookedByTrip: "否",
  canResolveRemotely: "否",
  needAdvance: "",
  advanceAmount: "",
  currency: "RMB",
  allowance: 270,
  allowanceCurrency: "RMB",
  transportCost: 2100,
  transportCostCurrency: "RMB",
  localTransport: 200,
  localTransportCurrency: "RMB",
  hotelCost: 660,
  hotelCostCurrency: "RMB",
  totalCost: 3230,
  totalCostCurrency: "RMB",
  trainingCourse: "",
  signatureComment: "",
  tripCost: "",
  colleagues: "",
  costConfirmation: "",
  accommodationStandard: "2231",
  ticketHandlingUnit: "",
  createDate: "2026-03-05",
  creator: "张三",
  creatorEmployeeId: "1311",
  creatorCompany: "林德叉车总部",
  creatorDepartment: "FSS3",
  costBearingDepartment: "财务部",
  costBearingCostCenter: "成本中心1",
  costCenter: "成本中心1",
  internalOrderNo: "123456",
};

function FormField({
  label,
  required,
  badge,
  children,
}: {
  label: string;
  required?: boolean;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-600 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
        {badge !== undefined && null}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#8B1450] focus:ring-1 focus:ring-[#8B1450]/30";
const selectCls =
  "w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#8B1450] appearance-none cursor-pointer";
const readonlyCls =
  "w-full border border-gray-300 rounded px-2.5 py-1.5 text-sm text-gray-600 bg-gray-50";

export function BusinessTrip() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [signatureAbnormalModalOpen, setSignatureAbnormalModalOpen] = useState(false);
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
  const [attachmentFiles, setAttachmentFiles] = useState<UploadedFile[]>([]);



  // Auto-calculate derived fields
  useEffect(() => {
    const days = calcDays(form.startDate, form.returnDate);
    const km = calcDistance(form.departure, form.destination);
    const noAllowanceTypes = [
      "国内出差（总部售后培训）",
      "国内出差（总部销售培训）",
    ];
    const allowanceYes =
      !noAllowanceTypes.includes(form.tripType) && km >= 200;
    const allowance = allowanceYes
      ? calcAllowance(form.tripType, km, days)
      : 0;
    const transportCost = calcTransportCost(form.transport, km);
    const hotelCost = calcHotel(form.destination, days);
    const localTransport = days * 60 + 80;
    const totalCost =
      transportCost + hotelCost + localTransport + allowance;

    setForm((prev) => ({
      ...prev,
      tripDays: days,
      roundKm: km,
      hasAllowance: allowanceYes ? "是" : "否",
      allowance,
      transportCost,
      localTransport,
      hotelCost,
      totalCost,
    }));
  }, [
    form.startDate,
    form.returnDate,
    form.departure,
    form.destination,
    form.tripType,
    form.transport,
  ]);

  const update = (
    field: keyof FormData,
    value: string | number,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isTraining =
    form.tripType.includes("培训") &&
    !form.tripType.includes("售后") &&
    !form.tripType.includes("销售");



  const checkAbnormalSignature = (comment: string): boolean => {
    // Define abnormal keywords or patterns
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
      comment.includes(keyword),
    );
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!form.title) errs.push("标题");
    if (!form.tripType) errs.push("出差类型");
    if (!form.traveler) errs.push("出差人");
    if (!form.startDate) errs.push("出差开始日期");
    if (!form.returnDate) errs.push("出差返程日期");
    if (!form.departure) errs.push("出发地");
    if (!form.destination) errs.push("目的地");
    if (!form.reason) errs.push("出差原因");
    if (!form.transport) errs.push("交通工具");
    if (!form.hasAllowance) errs.push("是否享受差旅补贴");
    if (!form.bookedByTrip) errs.push("是否通过携程预定酒店");
    setErrors(errs);
    if (errs.length > 0) {
      toast.error(`请填写必填项：${errs.join("、")}`);
      return false;
    }
    return true;
  };

  const handleConfirm = () => {
    if (validate()) {
      // Check if signature comment contains abnormal content
      const isSignatureAbnormal = checkAbnormalSignature(form.signatureComment);
      if (isSignatureAbnormal) {
        setSignatureAbnormalModalOpen(true);
        return;
      }
      
      toast.success("出差申请已成功提交！");
      setTimeout(() => navigate("/"), 1500);
    }
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
      traveler: employee.name,
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
      costBearingDepartment: department.name,
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
      costBearingCostCenter: costCenter.code,
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
    setForm((prev) => ({
      ...prev,
      departure: city,
    }));
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
    setForm((prev) => ({
      ...prev,
      destination: destination,
    }));
    setDestinationSearchOpen(false);
  };

  const removeAttachment = (id: number) =>
    setAttachmentFiles((f) => f.filter((x) => x.id !== id));

  const addAttachment = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    let type: "image" | "pdf" | "doc" | "other" = "other";
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
      type = "image";
    } else if (ext === "pdf") {
      type = "pdf";
    } else if (['doc', 'docx', 'xls', 'xlsx'].includes(ext || '')) {
      type = "doc";
    }
    setAttachmentFiles((f) => [
      ...f,
      {
        id: Date.now(),
        name,
        type,
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#F0F0F0]">
      {/* Header */}
      <header className="bg-[#8B1450] text-white flex items-center px-4 py-3 shadow-md flex-shrink-0">
        <button
          onClick={() =>
            step > 0 ? setStep(0) : navigate("/")
          }
          className="mr-4 hover:bg-white/10 rounded-full p-1.5 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">
          出差申请
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = '.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx';
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) {
                  Array.from(files).forEach((f) => addAttachment(f.name));
                  if (files.length > 0) {
                    toast.success(`已上传 ${files.length} 个附件`);
                  }
                }
              };
              input.click();
            }}
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
        </div>
      </header>

      {/* Step indicator */}


      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">

            {/* 基本信息区域 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">
                  基本信息
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="标题">
                  <input
                    className={readonlyCls}
                    value={form.title}
                    readOnly
                  />
                </FormField>
                <FormField label="创建日期">
                  <input
                    className={readonlyCls}
                    value={form.createDate}
                    readOnly
                  />
                </FormField>
                <FormField label="创建人">
                  <input
                    className={readonlyCls}
                    value={form.creator}
                    readOnly
                  />
                </FormField>
                <FormField label="员工号">
                  <input
                    className={readonlyCls}
                    value={form.creatorEmployeeId}
                    readOnly
                  />
                </FormField>
                <FormField label="创建人公司">
                  <input
                    className={readonlyCls}
                    value={form.creatorCompany}
                    readOnly
                  />
                </FormField>
                <FormField label="创建人部门">
                  <input
                    className={readonlyCls}
                    value={form.creatorDepartment}
                    readOnly
                  />
                </FormField>
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
                {/* Row 1: 实际出差人、实际出差人工号、成本中心 */}
                <FormField label="实际出差人" required>
                  <div className="relative">
                    <input
                      className={inputCls}
                      value={form.traveler}
                      onChange={(e) =>
                        update("traveler", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors"
                      onClick={handleHRSearch}
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </FormField>
                <FormField label="实际出差人工号">
                  <input
                    className={inputCls}
                    value={form.employeeId}
                    onChange={(e) =>
                      update("employeeId", e.target.value)
                    }
                  />
                </FormField>
                <FormField label="成本中心">
                  <input
                    className={inputCls}
                    value={form.costCenter}
                    onChange={(e) =>
                      update("costCenter", e.target.value)
                    }
                  />
                </FormField>
                <FormField label="内部订单号">
                  <input
                    className={inputCls}
                    value={form.internalOrderNo}
                    onChange={(e) =>
                      update("internalOrderNo", e.target.value)
                    }
                  />
                </FormField>

                {/* Row 2: 是否第三方承担费用、第三方费用承担单位、费用承担确认函 */}
                <FormField label="是否第三方承担费用">
                  <select
                    className={selectCls}
                    value={form.isThirdParty}
                    onChange={(e) =>
                      update("isThirdParty", e.target.value)
                    }
                  >
                    <option value=""></option>
                    <option value="是">是</option>
                    <option value="否">否</option>
                  </select>
                </FormField>
                {form.isThirdParty !== "否" && (
                  <>
                    <FormField label="第三方费用承担单位">
                      <input
                        className={inputCls}
                        value={form.thirdPartyUnit}
                        onChange={(e) =>
                          update(
                            "thirdPartyUnit",
                            e.target.value,
                          )
                        }
                      />
                    </FormField>
                    <FormField label="费用承担确认函">
                      <div className="flex gap-2">
                        <input
                          className={inputCls}
                          value={form.costConfirmation}
                          onChange={(e) =>
                            update(
                              "costConfirmation",
                              e.target.value,
                            )
                          }
                          placeholder="未上传"
                          readOnly
                        />
                        <button className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-200 flex items-center gap-1 whitespace-nowrap">
                          <Upload size={14} /> 上传附件
                        </button>
                      </div>
                    </FormField>
                  </>
                )}

                {/* Row 3: 费用承担部门、费用承担成本中心 - 当第三方承担费用为"是"时隐藏 */}
                {form.isThirdParty !== "是" && (
                  <>
                    <FormField label="费用承担部门">
                      <div className="relative">
                        <input
                          className={inputCls}
                          value={form.costBearingDepartment}
                          onChange={(e) =>
                            update(
                              "costBearingDepartment",
                              e.target.value,
                            )
                          }
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors"
                          onClick={handleDepartmentSearch}
                        >
                          <Search size={16} />
                        </button>
                      </div>
                    </FormField>
                    <FormField label="费用承担成本中心">
                      <div className="relative">
                        <input
                          className={inputCls}
                          value={form.costBearingCostCenter}
                          onChange={(e) =>
                            update(
                              "costBearingCostCenter",
                              e.target.value,
                            )
                          }
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors"
                          onClick={handleCostCenterSearch}
                        >
                          <Search size={16} />
                        </button>
                      </div>
                    </FormField>
                  </>
                )}

                {/* Row 4: 出差类型、是否通过携程预定酒店、往返公里数 */}
                <FormField label="出差类型" required>
                  <select
                    className={selectCls}
                    value={form.tripType}
                    onChange={(e) =>
                      update("tripType", e.target.value)
                    }
                  >
                    {TRIP_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </FormField>
                <FormField
                  label="是否通过携程预订酒店"
                  required
                >
                  <select
                    className={selectCls}
                    value={form.bookedByTrip}
                    onChange={(e) =>
                      update("bookedByTrip", e.target.value)
                    }
                  >
                    {YES_NO.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="往返公里数">
                  <input
                    className={inputCls}
                    value={form.accommodationStandard}
                    onChange={(e) =>
                      update(
                        "accommodationStandard",
                        e.target.value,
                      )
                    }
                  />
                </FormField>

                {/* Row 5: 是否享受差旅补贴、K2系统模块训申请单号 */}
                <FormField label="是否享受差旅补贴" required>
                  <select
                    className={selectCls}
                    value={form.hasAllowance}
                    onChange={(e) =>
                      update("hasAllowance", e.target.value)
                    }
                  >
                    {YES_NO_OPTIONS.map((v) => (
                      <option key={v} value={v}>
                        {v || "请选择"}
                      </option>
                    ))}
                  </select>
                </FormField>
                {(form.tripType === "国内出差（培训）" ||
                  form.tripType === "国外出差（培训）") && (
                  <>
                    <FormField label="K2系统模块" required>
                      <select
                        className={selectCls}
                        value={form.k2Module}
                        onChange={(e) =>
                          update("k2Module", e.target.value)
                        }
                      >
                        <option value=""></option>
                        <option value="培训申请">培训申请</option>
                      </select>
                    </FormField>
                    <FormField label="培训申请单号" required>
                      <input
                        className={inputCls}
                        value={form.trainingNo}
                        onChange={(e) =>
                          update("trainingNo", e.target.value)
                        }
                      />
                    </FormField>
                  </>
                )}

                {/* Row 6: 是否可通过邮件、电话、Teams沟通解决 */}
                <FormField
                  label="是否可以通过邮件、电话、Teams沟通解决？"
                  required
                >
                  <select
                    className={selectCls}
                    value={form.canResolveRemotely}
                    onChange={(e) =>
                      update(
                        "canResolveRemotely",
                        e.target.value,
                      )
                    }
                  >
                    {YES_NO.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </FormField>
              </div>
            </div>

            {/* 出差明细区域 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-3 border-b pb-2">
                <h2 className="text-sm font-semibold text-gray-700">
                  出差明细
                </h2>
                <button className="flex items-center gap-1 text-[#8B1450] hover:text-[#6e1040] text-xs">
                  <Plus size={16} /> 添加
                </button>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
                  <div className="absolute top-3 right-3">
                    <button className="text-gray-400 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-xs font-medium text-gray-500 mb-3">
                    出差记录 #1
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <FormField label="出发地" required>
                      <div className="relative">
                        <input
                          className={inputCls}
                          value={form.departure}
                          onChange={(e) =>
                            update("departure", e.target.value)
                          }
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors"
                          onClick={handleCitySearch}
                        >
                          <Search size={16} />
                        </button>
                      </div>
                    </FormField>
                    <FormField label="目的地" required>
                      <div className="relative">
                        <input
                          className={inputCls}
                          value={form.destination}
                          onChange={(e) =>
                            update("destination", e.target.value)
                          }
                        />
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B1450] transition-colors"
                          onClick={handleDestinationSearch}
                        >
                          <Search size={16} />
                        </button>
                      </div>
                    </FormField>
                    <FormField label="出差公司">
                      <input
                        className={inputCls}
                        value={form.company}
                        onChange={(e) =>
                          update("company", e.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="出差原因" required>
                      <input
                        className={inputCls}
                        value={form.reason}
                        onChange={(e) =>
                          update("reason", e.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="交通工具" required>
                      <select
                        className={selectCls}
                        value={form.transport}
                        onChange={(e) =>
                          update("transport", e.target.value)
                        }
                      >
                        {TRANSPORT_OPTIONS.map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="出差开始日期" required>
                      <input
                        type="date"
                        className={inputCls}
                        value={form.startDate}
                        onChange={(e) =>
                          update("startDate", e.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="出差返回日期" required>
                      <input
                        type="date"
                        className={inputCls}
                        value={form.returnDate}
                        onChange={(e) =>
                          update("returnDate", e.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="出差天数">
                      <input
                        className={readonlyCls}
                        value={form.tripDays}
                        readOnly
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </div>

            {/* 预借款区域 - 仅在国外出差时显示 */}
            {(form.tripType === "国外出差" ||
              form.tripType === "国外出差（培训）") && (
              <div className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-700">
                    预借款
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField label="是否需要预借款" required>
                    <select
                      className={selectCls}
                      value={form.needAdvance}
                      onChange={(e) =>
                        update("needAdvance", e.target.value)
                      }
                    >
                      <option value=""></option>
                      <option value="是">是</option>
                      <option value="否">否</option>
                    </select>
                  </FormField>
                  {form.needAdvance === "是" && (
                    <>
                      <FormField label="借款金额" required>
                        <input
                          className={inputCls}
                          value={form.advanceAmount}
                          onChange={(e) =>
                            update("advanceAmount", e.target.value)
                          }
                        />
                      </FormField>
                      <FormField label="币别（借款）" required>
                        <select
                          className={selectCls}
                          value={form.currency}
                          onChange={(e) =>
                            update("currency", e.target.value)
                          }
                        >
                          {CURRENCY.map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </FormField>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 费用预估区域 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">
                  预计费用
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Row 1 */}
                <FormField label="长途交通费(机票、火车等)">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#8B1450]"
                      value={form.transportCost}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          transportCost: e.target.value,
                        }))
                      }
                    />
                    <select
                      className="w-24 border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#8B1450] appearance-none bg-white"
                      value={form.transportCostCurrency || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          transportCostCurrency: e.target.value,
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
                  </div>
                </FormField>
                <FormField label="市内交通费">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#8B1450]"
                      value={form.localTransport}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          localTransport: e.target.value,
                        }))
                      }
                    />
                    <select
                      className="w-24 border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#8B1450] appearance-none bg-white"
                      value={form.localTransportCurrency || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          localTransportCurrency: e.target.value,
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
                  </div>
                </FormField>
                <FormField label="总预计住宿费">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#8B1450]"
                      value={form.hotelCost}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          hotelCost: e.target.value,
                        }))
                      }
                    />
                    <select
                      className="w-24 border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#8B1450] appearance-none bg-white"
                      value={form.hotelCostCurrency || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          hotelCostCurrency: e.target.value,
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
                  </div>
                </FormField>

                {/* Row 2 */}
                <FormField label="补贴">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#8B1450]"
                      value={form.allowance}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          allowance: e.target.value,
                        }))
                      }
                    />
                    <select
                      className="w-24 border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#8B1450] appearance-none bg-white"
                      value={form.allowanceCurrency || ""}
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
                  </div>
                </FormField>
                <FormField label="本次出差预计费用合计">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-[#8B1450]"
                      value={form.totalCost}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          totalCost: e.target.value,
                        }))
                      }
                    />
                    <select
                      className="w-24 border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#8B1450] appearance-none bg-white"
                      value={form.totalCostCurrency || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          totalCostCurrency: e.target.value,
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
                  </div>
                </FormField>
              </div>
            </div>

            {/* 相关附件区域 */}
            {attachmentFiles.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-5">
                <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-700">
                    相关附件
                  </h2>
                </div>
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
                        ) : f.type === "image" ? (
                          <FileImage
                            size={16}
                            className="text-blue-500"
                          />
                        ) : (
                          <File
                            size={16}
                            className="text-green-500"
                          />
                        )}
                        <span 
                          className="text-sm text-gray-700 cursor-pointer hover:text-[#8B1450]"
                          onClick={() => {
                            // 模拟附件预览功能
                            alert(`预览附件: ${f.name}`);
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
              </div>
            )}

            {/* 签字意见区域 */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">
                  审批意见
                </h2>
              </div>
              <FormField label="签字意见">
                <div className="relative">
                  <textarea
                    className={`${inputCls} resize-none`}
                    rows={3}
                    value={form.signatureComment}
                    onChange={(e) =>
                      update("signatureComment", e.target.value)
                    }
                  />
                  <button className="absolute bottom-2 right-2 flex items-center gap-1 text-gray-400 hover:text-[#8B1450] text-xs">
                    <PenLine size={14} />
                    手写签批
                  </button>
                </div>
              </FormField>
            </div>
          </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <button
          onClick={() => {
            if (step > 0) {
              setStep(0);
              setHasAbnormal(false); // Reset abnormal flag when going back
            } else {
              navigate("/");
            }
          }}
          className="px-6 py-2 bg-gray-200 text-gray-600 rounded text-sm hover:bg-gray-300 transition-colors"
        >
          {step > 0 ? "上一步" : "取消"}
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2 bg-[#1890FF] text-white rounded text-sm hover:bg-blue-600 transition-colors"
        >
          提交
        </button>
      </div>

      {/* 签字意见异常弹窗 */}
      {signatureAbnormalModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">出差申请存在异常</h3>
                  <p className="text-sm text-gray-600">AI审批意见：</p>
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-800">
                  根据系统分析，您的出差申请存在以下异常：
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-0.5">1.</span>
                    <span>出差申请的创建日期晚于出差开始日期</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSignatureAbnormalModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-600 text-sm hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={() => setSignatureAbnormalModalOpen(false)}
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
    </div>
  );
}