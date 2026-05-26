import { Item } from './item';
import { Order } from './Order';

export interface Details {
  orderDetailId: number;
  orderId: number;
  itemId: number;
  price: number;
  quantity: number;
  total: number;
  item?: Item;
  order?: Order;
}

export interface DetailsReq {
  orderId: number;
  itemId: number;
  price: Number;
  quantity: number;
  total: Number;
}
