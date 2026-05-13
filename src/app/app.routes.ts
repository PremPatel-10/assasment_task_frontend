import { Routes } from '@angular/router';
import { ItemList } from './pages/item-list/item-list';
import { OrderList } from './pages/order-list/order-list';
import { UpdatePage } from './pages/update-page/update-page';

export const routes: Routes = [
  { path: '', component: ItemList },
  { path: 'itemlist', component: ItemList },
  { path: 'orderlist', component: OrderList },
  { path: 'edit/:id', component: UpdatePage },
];
