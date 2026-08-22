import { Routes } from '@angular/router';
import { ItemList } from './pages/item-list/item-list';
import { OrderList } from './pages/order-list/order-list';
import { UpdatePage } from './pages/item-list/update-page/update-page';
import { OrderForm } from './pages/order-list/order-form/order-form';
import { HomePage } from './pages/home-page/home-page';
import { OrderDetails } from './pages/order-details/order-details';
import { Dashboard } from './pages/dashboard/dashboard';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: '', component: HomePage, canActivate: [authGuard] },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'itemlist', component: ItemList, canActivate: [authGuard] },
  { path: 'orderlist', component: OrderList, canActivate: [authGuard] },
  { path: 'itemlist/edit/item/:id', component: UpdatePage, canActivate: [adminGuard] },
  { path: 'orderlist/add', component: OrderForm, canActivate: [adminGuard] },
  { path: 'orderlist/edit/order/:id', component: OrderForm, canActivate: [adminGuard] },
  {
    path: 'orderlist/orderdetails/add-details/:id',
    component: OrderDetails,
    canActivate: [adminGuard],
  },
  {
    path: 'orderlist/orderdetails/edit-details/:id',
    component: OrderDetails,
    canActivate: [adminGuard],
  },
];
