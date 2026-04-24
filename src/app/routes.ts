import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { BusinessTrip } from "./pages/BusinessTrip";
import { TravelReimbursement } from "./pages/TravelReimbursement";
import { EmployeeReimbursement } from "./pages/EmployeeReimbursement";
import { ImageManagement } from "./pages/ImageManagement";
import { FieldConfig } from "./pages/FieldConfig";
import { RuleConfig } from "./pages/RuleConfig";
import { OperationLog } from "./pages/OperationLog";

export const router = createBrowserRouter([
  { path: "/", Component: Home },
  { path: "/business-trip", Component: BusinessTrip },
  { path: "/travel-reimbursement", Component: TravelReimbursement },
  { path: "/employee-reimbursement", Component: EmployeeReimbursement },
  { path: "/operation-log", Component: OperationLog },
  { path: "/image-management", Component: ImageManagement },
  { path: "/field-config", Component: FieldConfig },
  { path: "/rule-config", Component: RuleConfig },
]);