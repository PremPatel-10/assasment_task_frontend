import { Routes } from '@angular/router';
import { ItemList } from './pages/item-list/item-list';
import { OrderList } from './pages/order-list/order-list';
import { HomePage } from './pages/home-page/home-page';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'itemlist', component: ItemList },
  { path: 'orderlist', component: OrderList },
];
