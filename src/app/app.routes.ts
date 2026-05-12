import { Routes } from '@angular/router';
import { App } from './app';
import { ItemList } from './pages/item-list/item-list';
import { OrderList } from './pages/order-list/order-list';

export const routes: Routes = [
  { path: '', component: App },
  { path: 'itemlist', component: ItemList },
  { path: 'Orderlist', component: OrderList },
];
