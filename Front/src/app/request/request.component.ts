import { Component } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';  // Import Leaflet Routing Machine

// Define the interface for a request
interface Request {
  name: string;
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

  map!: L.Map;
  routingControl: any;
  newRequest: Request = {
    name: '',
    senderAddress: '',
    recipientAddress: '',
    productType: '',
    requestDate: '',
    requestTime: ''
  };

  ngOnInit() {
    // Initialize map
    this.map = L.map('map').setView([41.9028, 12.4964], 12); // Default to London

    // Set up tiles (Mapbox, OpenStreetMap, etc.)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this.map);
  }

  plotRoute(originCoords: [number, number], destinationCoords: [number, number]) {
    // Remove any existing route
    if (this.routingControl) {
      this.map.removeControl(this.routingControl);
    }

    // Add routing control for the path between origin and destination
    // this.routingControl = L.control({
    //   waypoints: [
    //     L.latLng(originCoords[0], originCoords[1]),
    //     L.latLng(destinationCoords[0], destinationCoords[1])
    //   ],
    //   routeWhileDragging: true
    // }).addTo(this.map);
  }

  // Mock geocoding function to return coordinates (In real-world, use an API like Google or OpenStreetMap)
  geocodeAddress(address: string): [number, number] {
    if (address.toLowerCase().includes('amsterdam')) {
      return [52.370216, 4.895168]; // Coordinates for Amsterdam
    } else if (address.toLowerCase().includes('rotterdam')) {
      return [51.9225, 4.47917]; // Coordinates for Rotterdam
    }
    return [51.505, -0.09]; // Default to London (fallback)
  }

  // Function to handle form submission
  onSubmit() {
    if (this.newRequest.name && this.newRequest.senderAddress && this.newRequest.recipientAddress) {
      // Add new request to the array
      this.requests.push({ ...this.newRequest });

      // Geocode addresses
      const senderCoords = this.geocodeAddress(this.newRequest.senderAddress);
      const recipientCoords = this.geocodeAddress(this.newRequest.recipientAddress);

      // Plot the route between sender and recipient
      this.plotRoute(senderCoords, recipientCoords);

      // Reset the form fields
      this.newRequest = {
        name: '',
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
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newRequest.productImage = e.target.result; // Store base64 image string
      };
      reader.readAsDataURL(file);
    }
  }
}
