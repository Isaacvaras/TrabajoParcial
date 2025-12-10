import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Recuperar } from './pages/recuperar/recuperar';
import { Catalog } from './pages/catalog/catalog';
import { Cart } from './pages/cart/cart';
import { Direccion } from './pages/direccion/direccion';
import { AuthGuard } from './guards/auth.guards';
import { Admin } from './pages/administracion/administracion';
import { CatalogManage } from './pages/catalog-manage/catalog-manage';
import { CatalogHistory } from './pages/catalog-history/catalog-history';
import { ReviewService } from './services/review.service';
import { Reviews } from './pages/reviews/reviews';
import { ReturnsComponent } from './pages/returns/returns';
import { PurchaseHistoryComponent } from './pages/purchase-history/purchase-history';

export const routes: Routes = [
    {path:"home",component:Home},
    {path:"login",component:Login},
    {path:"register",component:Register},
    {path:"recuperar",component:Recuperar},
    {path:"catalog",component:Catalog},
    {path:"catalog/manage",component: CatalogManage, canActivate:[AuthGuard]},
    {path:"catalog/history",component:CatalogHistory, canActivate:[AuthGuard]},
    {path:"reviews",component:Reviews},
    {path:"returns",component:ReturnsComponent, canActivate:[AuthGuard]},
    {path:"purchases",component:PurchaseHistoryComponent, canActivate:[AuthGuard]},
    {path:"cart",component:Cart, canActivate:[AuthGuard]},
    {path:"direccion",component:Direccion, canActivate:[AuthGuard]},
    {path:"", redirectTo:"home", pathMatch:"full"},
    {path:"administracion",component:Admin},



];

