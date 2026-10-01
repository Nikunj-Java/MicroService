import { Routes } from '@angular/router';
import { UserComponent } from './user-component/user-component';
import { HoldingSummary } from './holding-summary/holding-summary';
import { authGuard } from './auth/auth-guard';
import { AuthLogin } from './auth-login/auth-login';



export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    { path: 'users', component: UserComponent,canActivate: [authGuard] },
    { path: 'summary', component: HoldingSummary, canActivate: [authGuard] },
    { path: 'login', component: AuthLogin}
    
];
