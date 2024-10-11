import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    form: any = {
      username: null,
      email: null,
      password: null,
      deliverer: false,  // Initialize as false
      requester: false   // Initialize as false
    };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  onSubmit(): void {
    const { username, email, password, deliverer, requester } = this.form;

    // Collect selected roles
    const roles = [];
    if (deliverer) roles.push('deliverer');
    if (requester) roles.push('requester');

    // Pass the roles along with other form data to the AuthService
    this.authService.register(username, email, password, roles).subscribe({
      next: data => {
        console.log(data);
        this.isSuccessful = true;
        this.isSignUpFailed = false;
      },
      error: err => {
        this.errorMessage = err.error.message;
        this.isSignUpFailed = true;
      }
    });
  }
}
