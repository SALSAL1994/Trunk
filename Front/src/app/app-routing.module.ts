import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { BoardUserComponent } from './board-user/board-user.component';
import { BoardModeratorComponent } from './board-moderator/board-moderator.component';
import { BoardAdminComponent } from './board-admin/board-admin.component';
import { AuthGuard } from './auth.guard'; // Import AuthGuard
import { SidebarComponent } from './sidebar/sidebar.component';
import { RequestComponent } from './request/request.component';
import { DeliveryComponent } from './delivery/delivery.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] }, // Protect route
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] }, // Protect route
  { path: 'user', component: BoardUserComponent, canActivate: [AuthGuard] }, // Protect route
  { path: 'mod', component: BoardModeratorComponent, canActivate: [AuthGuard] }, // Protect route
  { path: 'admin', component: BoardAdminComponent, canActivate: [AuthGuard] }, // Protect route
  { path: 'sidebar', component: SidebarComponent, canActivate: [AuthGuard] },
  { path: 'request', component: RequestComponent, canActivate: [AuthGuard] },

  { path: 'deliveries', component: DeliveryComponent, canActivate: [AuthGuard] }, // Protect route
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
