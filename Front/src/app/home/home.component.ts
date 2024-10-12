import { Component, OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';
import { Location } from '@angular/common'; // Import Location service

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  content?: string;

  constructor(private userService: UserService, private location: Location) { }

  ngOnInit(): void {
    // Check if the page has already been refreshed
    if (!localStorage.getItem('reloaded')) {
      localStorage.setItem('reloaded', 'true');  // Set a flag in localStorage
      this.location.go(this.location.path());    // Reload the current path
      window.location.reload();                  // Trigger reload
    } else {
      localStorage.removeItem('reloaded');       // Reset the flag after refresh

      // Fetch the public content after reload
      this.userService.getPublicContent().subscribe({
        next: data => {
          this.content = data;
        },
        error: err => {
          console.log(err);
          if (err.error) {
            this.content = JSON.parse(err.error).message;
          } else {
            this.content = "Error with status: " + err.status;
          }
        }
      });
    }
    this.userService.getPublicContent().subscribe({
      next: data => {
        this.content = data;
      },
      error: err => {console.log(err)
        if (err.error) {
          this.content = JSON.parse(err.error).message;
        } else {
          this.content = "Error with status: " + err.status;
        }
      }
    });
  }
}
