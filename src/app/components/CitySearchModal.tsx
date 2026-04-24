import { useState } from "react";
import { X, MapPin } from "lucide-react";

interface CitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (city: string) => void;
  title?: string;
}

interface CityItem {
  country: string;
  chineseName: string;
}

export function CitySearchModal({ isOpen, onClose, onSelect, title = "城市表" }: CitySearchModalProps) {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  // Mock city/country data
  const cities: CityItem[] = [
    { country: "Argentina", chineseName: "阿根廷" },
    { country: "Australia", chineseName: "澳大利亚" },
    { country: "Austria", chineseName: "奥地利" },
    { country: "Belgium", chineseName: "比利时" },
    { country: "Brazil", chineseName: "巴西" },
    { country: "Cambodia", chineseName: "柬埔寨" },
    { country: "Canada", chineseName: "加拿大" },
    { country: "Chile", chineseName: "智利" },
    { country: "China Hong Kong", chineseName: "中国香港" },
    { country: "China Taiwan", chineseName: "中国台湾" },
    { country: "China", chineseName: "中国" },
    { country: "Cuba", chineseName: "古巴" },
    { country: "Czech Republic", chineseName: "捷克" },
    { country: "Denmark", chineseName: "丹麦" },
    { country: "Finland", chineseName: "芬兰" },
    { country: "France", chineseName: "法国" },
    { country: "German", chineseName: "德国" },
    { country: "Greece", chineseName: "希腊" },
    { country: "India", chineseName: "印度" },
    { country: "Indonesia", chineseName: "印度尼西亚" },
    { country: "Italy", chineseName: "意大利" },
    { country: "Japan", chineseName: "日本" },
    { country: "Korea", chineseName: "韩国" },
    { country: "Malaysia", chineseName: "马来西亚" },
    { country: "Mexico", chineseName: "墨西哥" },
    { country: "Netherlands", chineseName: "荷兰" },
    { country: "New Zealand", chineseName: "新西兰" },
    { country: "Norway", chineseName: "挪威" },
    { country: "Philippines", chineseName: "菲律宾" },
    { country: "Poland", chineseName: "波兰" },
    { country: "Portugal", chineseName: "葡萄牙" },
    { country: "Russia", chineseName: "俄罗斯" },
    { country: "Singapore", chineseName: "新加坡" },
    { country: "Spain", chineseName: "西班牙" },
    { country: "Sweden", chineseName: "瑞典" },
    { country: "Switzerland", chineseName: "瑞士" },
    { country: "Thailand", chineseName: "泰国" },
    { country: "Turkey", chineseName: "土耳其" },
    { country: "United Kingdom", chineseName: "英国" },
    { country: "United States", chineseName: "美国" },
    { country: "Vietnam", chineseName: "越南" },
  ];

  // Chinese cities
  const chineseCities = [
    "北京", "上海", "广州", "深圳", "成都", "武汉", "杭州", "南京",
    "天津", "重庆", "西安", "苏州", "郑州", "长沙", "沈阳", "青岛",
    "济南", "哈尔滨", "福州", "厦门", "昆明", "南昌", "合肥", "太原",
    "石家庄", "南宁", "贵阳", "乌鲁木齐", "兰州", "海口", "大连", "宁波"
  ];

  const handleConfirm = () => {
    if (selectedCity) {
      onSelect(selectedCity);
      onClose();
      setSelectedCity(null);
    }
  };

  const handleClear = () => {
    setSelectedCity(null);
  };

  const handleCancel = () => {
    onClose();
    setSelectedCity(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#4A90E2] text-white flex items-center justify-center">
              <MapPin size={16} />
            </div>
            <h2 className="text-base font-semibold text-gray-800">{title}</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Chinese Cities Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3"></h3>
            <div className="space-y-1">
              {chineseCities.map((city) => (
                null
              ))}
            </div>
          </div>

          {/* International Cities Section */}
          <div>
            
            <div className="space-y-1">
              {cities.map((item) => (
                <div
                  key={item.country}
                  className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors ${
                    selectedCity === item.chineseName
                      ? "bg-blue-100 text-gray-800"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  onClick={() => setSelectedCity(item.chineseName)}
                >
                  <span className="text-gray-400 text-xs">▶</span>
                  <span className="text-sm">
                    {item.country} {item.chineseName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleClear}
            className="px-6 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            清空
          </button>
          <button
            onClick={handleClear}
            className="px-6 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            清除
          </button>
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
