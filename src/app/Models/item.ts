export interface Item {
  itemId: number;
  itemName: string;
  itemCode: number;
  isActive: boolean;
}

export interface ItemReq {
  itemName: string;
  itemCode: number;
  isActive: boolean;
}
