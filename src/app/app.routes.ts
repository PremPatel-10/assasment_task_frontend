import { Routes } from '@angular/router';
import { ItemList } from './pages/item-list/item-list';
import { OrderList } from './pages/order-list/order-list';
import { UpdatePage } from './pages/item-list/update-page/update-page';
import { OrderForm } from './pages/order-list/order-form/order-form';
import { HomePage } from './pages/home-page/home-page';
import { OrderDetails } from './pages/order-details/order-details';

export const routes: Routes = [
  { path: '', component: HomePage },
  { path: 'itemlist', component: ItemList },
  { path: 'orderlist', component: OrderList },
  { path: 'itemlist/edit/item/:id', component: UpdatePage },
  { path: 'orderlist/add', component: OrderForm },
  { path: 'orderlist/edit/order/:id', component: OrderForm },
  { path: 'orderdetails/order/:id', component: OrderDetails },
];
