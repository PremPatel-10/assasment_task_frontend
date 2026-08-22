export interface Order {
  orderId: number;
  orderNumber: number;
  vendorName: string;
  orderDate: string;
  orderTotal: number;
}

export interface OrderReq {
  orderNumber: number;
  vendorName: string;
  orderDate: string;
}
