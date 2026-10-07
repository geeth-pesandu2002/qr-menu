import { Category, MenuItem, RestaurantTable, Order } from "../lib/types";

export const mockCategories: Category[] = [];

export const mockMenuItems: MenuItem[] = [];

export const mockTables: RestaurantTable[] = [
  { id: "01", label: "Table 01", seats: 2, isActive: true, qrToken: "tbl_01", qrUrl: "/t/01" },
  { id: "02", label: "Table 02", seats: 4, isActive: true, qrToken: "tbl_02", qrUrl: "/t/02" },
  { id: "03", label: "Table 03", seats: 4, isActive: true, qrToken: "tbl_03", qrUrl: "/t/03" },
  { id: "04", label: "Table 04", seats: 2, isActive: true, qrToken: "tbl_04", qrUrl: "/t/04" },
  { id: "05", label: "Table 05", seats: 4, isActive: true, qrToken: "tbl_05", qrUrl: "/t/05" },
  { id: "06", label: "Table 06", seats: 6, isActive: true, qrToken: "tbl_06", qrUrl: "/t/06" },
  { id: "07", label: "Table 07", seats: 2, isActive: true, qrToken: "tbl_07", qrUrl: "/t/07" },
  { id: "08", label: "Table 08", seats: 4, isActive: true, qrToken: "tbl_08", qrUrl: "/t/08" },
];

export const mockInitialOrders: Order[] = [];
