import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Loader } from '@googlemaps/js-api-loader';
import { config } from '../../../../Front/config';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuthService } from '../_services/auth.service';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../_services/storage.service';


interface NewRequest {
  userEmail:string;
  name: string;
  senderAddress: string;
  senderLat: number;
  senderLng: number;
  recipientAddress: string;
  recipientLat: number;
  recipientLng: number;
  productType: string;
  requestDate: string;
  requestTime: string;
  productSize: string;
  productImage: File | null;
  accepted: boolean;
}

@Component({
  selector: 'app-request',
  templateUrl: './request.component.html',
  styleUrls: ['./request.component.css']
})
export class RequestComponent implements OnInit {
  @ViewChild('map', { static: false }) mapElementRef!: ElementRef;

  requests: Request[] = [];
  map!: google.maps.Map;
  originMarker: google.maps.Marker | undefined;
  destinationMarker: google.maps.Marker | undefined;
  directionsService!: google.maps.DirectionsService;
  directionsRenderer!: google.maps.DirectionsRenderer;
  geocoder!: google.maps.Geocoder;

  newRequest: NewRequest = {
    userEmail:'',
    name: '',
    senderAddress: '',
    recipientAddress: '',
    productType: '',
    requestDate: '',
    requestTime: '',
    productSize: '',
    senderLat:0,
    senderLng:0,
    recipientLat: 0,
    recipientLng: 0,
    productImage: null,
    accepted:false
  };


  routeDistance: string = '';
  routeCost: string = '';

  private originAddressSubject = new Subject<string>();
  private destinationAddressSubject = new Subject<string>();

  constructor(private authService: AuthService, private formModule:FormsModule, private storageService: StorageService) { }

  ngOnInit() {
    const loader = new Loader({
      apiKey: config.googleMapsApiKey,
      version: 'weekly',
      libraries: ['places']
    });

    // Load the Google Maps API
    loader.load().then(() => {
      this.initializeMap();
      this.directionsService = new google.maps.DirectionsService(); // Initialize inside loader
      this.directionsRenderer = new google.maps.DirectionsRenderer(); // Initialize inside loader
      this.directionsRenderer.setMap(this.map); // Attach the renderer to the map
      this.geocoder = new google.maps.Geocoder(); // Initialize the geocoder
    }).catch(err => {
      console.error("Error loading Google Maps API", err);
    });


    this.originAddressSubject.pipe().subscribe(address => {
      this.geocodeAddress(address, 'origin');
    });

    this.destinationAddressSubject.pipe().subscribe(address => {
      this.geocodeAddress(address, 'destination');
    });
  }

  initializeMap() {
    const mapOptions: google.maps.MapOptions = {
      center: { lat: 41.9028, lng: 12.4964 }, // Rome
      zoom: 12,
    };

    this.map = new google.maps.Map(this.mapElementRef.nativeElement, mapOptions);

    let clickCount = 0;
    this.map.addListener('click', (e: google.maps.MapMouseEvent) => {
      this.reverseGeocode(e.latLng!, clickCount === 0 ? 'origin' : 'destination');
      if (clickCount === 0) {
        this.setMarker(e.latLng, 'origin');
        clickCount++;
      } else {
        this.setMarker(e.latLng, 'destination');
        this.calculateAndDisplayRoute(); // Calculate and show the route
        clickCount = 0;
      }
    });
  }

  setMarker(position: google.maps.LatLng | null, type: 'origin' | 'destination') {
    if (!position) return;

    if (type === 'origin') {
      if (this.originMarker) {
        this.originMarker.setPosition(position);
      } else {
        this.originMarker = new google.maps.Marker({
          position,
          map: this.map,
          label: 'O',
        });
      }
      this.reverseGeocode(position, 'origin'); // Get address for origin and update input field
    } else if (type === 'destination') {
      if (this.destinationMarker) {
        this.destinationMarker.setPosition(position);
      } else {
        this.destinationMarker = new google.maps.Marker({
          position,
          map: this.map,
          label: 'D',
        });
      }
      this.reverseGeocode(position, 'destination'); // Get address for destination and update input field
    }
  }

  calculateAndDisplayRoute() {
    if (this.originMarker && this.originMarker.getPosition() && this.destinationMarker && this.destinationMarker.getPosition()) {
      this.directionsService.route({
        origin: this.originMarker.getPosition() as google.maps.LatLng,
        destination: this.destinationMarker.getPosition() as google.maps.LatLng,
        travelMode: google.maps.TravelMode.DRIVING,
      }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsRenderer.setDirections(response);

          const route = response!.routes[0];
          const distanceInKm = route!.legs[0].distance!.value / 1000;
          const cost = this.calculateCost(distanceInKm);
          this.routeDistance = `${distanceInKm.toFixed(2)} km`;
          this.routeCost = `€${cost.toFixed(2)}`;
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
    } else {
      window.alert('Please select both origin and destination on the map.');
    }
  }

  // Method to calculate cost based on distance
  calculateCost(distanceInKm: number): number {
    const costPerKm = 0.2;
    return distanceInKm * costPerKm;
  }

  geocodeAddress(address: string, type: 'origin' | 'destination') {
    this.geocoder.geocode({ address: address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        const position = results![0].geometry.location;
        this.map.setCenter(position);
        this.setMarker(position, type);


        if (this.originMarker && this.destinationMarker) {
          this.calculateAndDisplayRoute();
        }
      } else {
        window.alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  reverseGeocode(latLng: google.maps.LatLng, type: 'origin' | 'destination') {
    this.geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        if (results && results[0]) {
          const address = results[0].formatted_address;
          if (type === 'origin') {
            this.newRequest.senderAddress = address;
            this.newRequest.senderLat = latLng.lat();
            this.newRequest.senderLng = latLng.lng();
          } else if (type === 'destination') {
            this.newRequest.recipientAddress = address;
            this.newRequest.recipientLat = latLng.lat();
            this.newRequest.recipientLng = latLng.lng();
          }
        }
      } else {
        window.alert('Reverse Geocoding failed due to ' + status);
      }
    });
  }



  onSubmit() {
    const userInfo = this.storageService.getUser();
    this.newRequest.userEmail= userInfo.email;
    this.newRequest.accepted = false;

    this.authService.request(this.newRequest).subscribe(
      response => {
        console.log('Request submitted successfully:', response);
        alert('Your request has been submitted successfully!');
        this.resetFormAndMap();
      },
      error => {
        console.error('Error submitting request:', error);
        alert('There was an error submitting your request. Please try again.');
      }
    );
  }



  clearMap() {
  if (this.originMarker) {
      this.originMarker.setMap(null);
      this.originMarker = undefined;
  }
  if (this.destinationMarker) {
      this.destinationMarker.setMap(null);
      this.destinationMarker = undefined;
  }
  this.map.setCenter({ lat: 41.9028, lng: 12.4964 }); // Reset to initial center
  this.map.setZoom(12); // Reset to initial zoom
}




resetFormAndMap() {

  this.newRequest = {
    userEmail:'',
    name: '',
    senderAddress: '',
    recipientAddress: '',
    productType: '',
    requestDate: '',
    requestTime: '',
    productSize: '',
    recipientLat: 0,
    recipientLng:0,
    senderLat:0,
    senderLng:0,
    productImage: null,
    accepted:false
  };


  this.routeDistance = '';
  this.routeCost = '';


  if (this.originMarker) {
    this.originMarker.setMap(null);
    this.originMarker = undefined;
  }

  if (this.destinationMarker) {
    this.destinationMarker.setMap(null);
    this.destinationMarker = undefined;


  if (this.directionsRenderer) {
    this.directionsRenderer.setMap(null);
  }
}}



  onOriginAddressChange() {
    this.originAddressSubject.next(this.newRequest.senderAddress);
  }


  onDestinationAddressChange() {
    this.destinationAddressSubject.next(this.newRequest.recipientAddress);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.newRequest.productImage = file;
    }
  }

}
