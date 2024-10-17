import { Component } from '@angular/core';

// Define the interface for a request
interface Request {
  packageId: string;
  senderAddress: string;
  recipientAddress: string;
  productType: string;
  requestDate: string;  // Store date as string for simplicity
  requestTime: string;  // Store time as string for simplicity
  productImage?: string; // Store base64 image string
}

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css']
})
export class RequestComponent {
  // Array to hold submitted requests
  requests: Request[] = [];

  // Object to store the new request input
  newRequest: Request = {
    packageId: '',
    senderAddress: '',
    recipientAddress: '',
    productType: '',
    requestDate: '',
    requestTime: ''
  };

  // Function to handle form submission
  onSubmit() {
    if (this.newRequest.packageId && this.newRequest.senderAddress && this.newRequest.recipientAddress) {
      // Add new request to the array
      this.requests.push({ ...this.newRequest });

      // Reset the form fields
      this.newRequest = {
        packageId: '',
        senderAddress: '',
        recipientAddress: '',
        productType: '',
        requestDate: '',
        requestTime: ''
      };
    }
  }

  // Handle file selection for image upload
  onFileSelected(event: Event) {
    // const file = (event.target as HTMLInputElement).files[0];
    // if (file) {
    //   const reader = new FileReader();
    //   reader.onload = (e: any) => {
    //     this.newRequest.productImage = e.target.result; // Store base64 image string
    //   };
    //   reader.readAsDataURL(file);
    // }
  }
}
