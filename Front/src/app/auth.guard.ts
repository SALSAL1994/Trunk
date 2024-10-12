import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from './_services/storage.service';  // Use StorageService instead of AuthService

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private storageService: StorageService, private router: Router) {}

  canActivate(): boolean {
    if (this.storageService.isLoggedIn()) {  // Check if the user is logged in
      return true;  // Allow access to the route if authenticated
    } else {
      this.router.navigate(['/login']);  // Redirect to the login page if not authenticated
      return false;  // Block route access
    }
  }
}
