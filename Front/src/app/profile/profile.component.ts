import { Component, OnInit } from '@angular/core';
import { StorageService } from '../_services/storage.service';
import { AuthService } from '../_services/auth.service';
import { DataSharingService } from '../_services/data.sharing.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: any;
  acceptedRequests: any[] = [];
  finalPrice: number = 0;
acceptRequest: any;
  constructor(private storageService: StorageService, private authService: AuthService, private dataSharingService: DataSharingService) { }

  ngOnInit(): void {
    this.currentUser = this.storageService.getUser();
    if (this.currentUser) {
      this.fetchAcceptedRequests(this.currentUser.email);
    }
    this.dataSharingService.finalPrice$.subscribe(price => {
      this.finalPrice = price; // Update final price when it changes
      console.log(this.finalPrice);
    });
  }

  fetchAcceptedRequests(userEmail: string): void {
    this.authService.getAcceptedRequests(userEmail).subscribe(
      (data) => {
        console.log(data); // Log the data to check its structure
        this.acceptedRequests = data.map((item: { request: any; deliverer: any; }) => {
          return {
            request: item.request,
            deliverer: item.deliverer // Store deliverer info along with request
          };
        });
      },
      (error) => {
        console.error('Error fetching accepted requests:', error);
      }
    );
  }


}
