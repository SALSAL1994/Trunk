  import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
  import { Loader } from '@googlemaps/js-api-loader';
  import { config } from '../../../../Front/config/config';
  import { AuthService } from '../_services/auth.service';
  import { StorageService } from '../_services/storage.service';
  import Swal from 'sweetalert2';
  import { Router } from '@angular/router';
  import {DataSharingService} from '../_services/data.sharing.service'


  interface DelivererRequest {
    name: string;
    departureDate: string;
    departureTime: string;
    origin: string;
    destination: string;
  }

  interface Request {
    _id: string;
    name: string;
    senderAddress: string;
    senderLat: number;
    senderLng: number;
    recipientAddress: string;
    recipientLat: number;
    recipientLng: number;
    productType: string;
    productSize?: string;
    productImage?: string;
    requestDate: string;
    requestTime: string;
    createdAt: string;
  }

  @Component({
    selector: 'app-delivery',
    templateUrl: './delivery.component.html',
    styleUrls: ['./delivery.component.css'],
  })
  export class DeliveryComponent implements OnInit {
    finalDetails!: {
      delivererOrigin: string;
      delivererDestination: string;
      requesterOrigin: string;
      requesterDestination: string;
      finalPrice: number;
      requesterName: string;
    };

    @ViewChild('mapElement', { static: false }) mapElementRef!: ElementRef;
    @ViewChild('originInput', { static: false }) originInputRef!: ElementRef;
    @ViewChild('destinationInput', { static: false })
    destinationInputRef!: ElementRef;
    submitAttempted = false;
    currentSlide = 1;
    delivererRequest: DelivererRequest = {
      name: '',
      departureDate: '',
      departureTime: '',
      origin: '',
      destination: '',
    };

    map!: google.maps.Map;
    originMarker!: google.maps.Marker;
    destinationMarker!: google.maps.Marker;
    originAutocomplete!: google.maps.places.Autocomplete;
    destinationAutocomplete!: google.maps.places.Autocomplete;
    nearbyRequests: Request[] = [];
    selectedRequest!: Request;
    constructor( private dataSharingService: DataSharingService,private authService: AuthService, private storageService: StorageService, private router: Router) {}

    ngOnInit(): void {
      this.loadMap();
    }

    loadMap() {
      const loader = new Loader({
        apiKey: config.googleMapsApiKey,
        version: 'weekly',
        libraries: ['places'],
      });

      loader.load().then(() => {
        const mapOptions = {
          center: { lat: 41.9028, lng: 12.4964 },
          zoom: 12,
        };
        this.map = new google.maps.Map(
          this.mapElementRef.nativeElement,
          mapOptions
        );

        // Create markers for origin and destination
        this.originMarker = new google.maps.Marker({
          map: this.map,
          draggable: true,
          // position: mapOptions.center
        });

        this.destinationMarker = new google.maps.Marker({
          map: this.map,
          draggable: true,
          // position: { lat: 41.9028, lng: 12.4964 }
        });

        this.originAutocomplete = new google.maps.places.Autocomplete(
          this.originInputRef.nativeElement
        );
        this.originAutocomplete.bindTo('bounds', this.map);

        this.originAutocomplete.addListener('place_changed', () => {
          const place = this.originAutocomplete.getPlace();
          if (!place.geometry) return;

          // Update marker position
          this.originMarker.setPosition(place.geometry.location);
          // this.map.panTo(place.geometry.location);
          this.delivererRequest.origin = place.formatted_address!;
        });

        // Autocomplete for destination
        this.destinationAutocomplete = new google.maps.places.Autocomplete(
          this.destinationInputRef.nativeElement
        );
        this.destinationAutocomplete.bindTo('bounds', this.map);

        this.destinationAutocomplete.addListener('place_changed', () => {
          const place = this.destinationAutocomplete.getPlace();
          if (!place.geometry) return;

          // Update marker position
          this.destinationMarker.setPosition(place.geometry.location);
          // this.map.panTo(place.geometry.location);
          this.delivererRequest.destination = place.formatted_address!;
        });

        // Update address when marker is dragged
        google.maps.event.addListener(this.originMarker, 'dragend', () => {
          this.updateAddressFromMarker(this.originMarker, 'origin');
        });

        google.maps.event.addListener(this.destinationMarker, 'dragend', () => {
          this.updateAddressFromMarker(this.destinationMarker, 'destination');
        });
      });
    }

    updateAddressFromMarker(
      marker: google.maps.Marker,
      type: 'origin' | 'destination'
    ) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode(
        { location: marker.getPosition() as google.maps.LatLng },
        (results, status) => {
          if (status === 'OK' && results![0]) {
            if (type === 'origin') {
              this.delivererRequest.origin = results![0].formatted_address;
            } else if (type === 'destination') {
              this.delivererRequest.destination = results![0].formatted_address;
            }
          }
        }
      );
    }

    nextSlide() {
      this.submitAttempted = true;
      if (this.isStep1Valid()) {
        this.submitDelivererRequest();
      }
    }


    prevSlide() {
      this.loadMap();
      this.currentSlide--;
    }

    submitDelivererRequest() {
      const delivererEmail = this.storageService.getUser().email;
      const delivererData = {
        name: this.delivererRequest.name,
        departureDate: this.delivererRequest.departureDate,
        departureTime: this.delivererRequest.departureTime,
        origin: this.delivererRequest.origin,
        destination: this.delivererRequest.destination,
        originLat: this.originMarker.getPosition()?.lat(),
        originLng: this.originMarker.getPosition()?.lng(),
        destinationLat: this.destinationMarker.getPosition()?.lat(),
        destinationLng: this.destinationMarker.getPosition()?.lng(),
        delivererEmail:delivererEmail
      };

      this.authService.submitDelivererRequest(delivererData).subscribe(
        (response: { nearbyRequests: Request[] }) => {
          console.log('Deliverer data submitted:', response);
          if (response.nearbyRequests && response.nearbyRequests.length > 0) {
            this.nearbyRequests = response.nearbyRequests;
          } else {
            console.warn('No nearby requests found in response:', response);
          }

          // Move to the next slide to show available requests
          this.currentSlide++; // You can directly increment to slide showing requests
        },
        (error) => {
          console.error('Error submitting deliverer data:', error);
        }
      );
    }

    calculatePrice(request: Request): Promise<number> {
      const service = new google.maps.DistanceMatrixService();

      const delivererOrigin = new google.maps.LatLng(
        this.originMarker.getPosition()!.lat(),
        this.originMarker.getPosition()!.lng()
      );
      const delivererDestination = new google.maps.LatLng(
        this.destinationMarker.getPosition()!.lat(),
        this.destinationMarker.getPosition()!.lng()
      );

      const requesterOrigin = new google.maps.LatLng(
        request.senderLat,
        request.senderLng
      );
      const requesterDestination = new google.maps.LatLng(
        request.recipientLat,
        request.recipientLng
      );

      return new Promise<number>((resolve, reject) => {
        service.getDistanceMatrix(
          {
            origins: [delivererOrigin, delivererDestination],
            destinations: [requesterOrigin, requesterDestination],
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (response, status) => {
            if (
              status === google.maps.DistanceMatrixStatus.OK &&
              response!.rows[0].elements[0].status === 'OK'
            ) {
              const distanceDeliverer =
                response!.rows[0].elements[0].distance.value; // Distance from deliverer origin to requester origin
              const distanceDestination =
                response!.rows[1].elements[1].distance.value; // Distance from deliverer destination to requester destination

              const detourDistance = distanceDeliverer + distanceDestination; // Calculate detour distance

              // Calculate the base price based on the requester's origin to destination
              const baseDistance = response!.rows[0].elements[1].distance.value; // Distance from requester origin to destination
              const basePrice = (baseDistance / 1000) * 0.3 ;

              const detourPrice = detourDistance * 0.001; // Price per meter of detour
              const finalPrice = basePrice + detourPrice; // Final price calculation

              resolve(finalPrice);
            } else {
              reject('Distance Matrix request failed or returned invalid status'); // Reject the promise in case of failure
            }
          }
        );
      });
    }



    acceptRequest(request: Request): void {
        this.calculatePrice(request).then((price) => {
            this.showFinalSlide(request, price);
            this.selectedRequest = request;
        });
    }


    showFinalSlide(request: Request, price: number) {
      this.finalDetails = {
        delivererOrigin: this.delivererRequest.origin,
        delivererDestination: this.delivererRequest.destination,
        requesterOrigin: request.senderAddress,
        requesterDestination: request.recipientAddress,
        requesterName: request.name,

        finalPrice: price,
      };

      //To do: implementation of adding price to deliverer request and show on profile of requester
      // this.dataSharingService.setFinalPrice(this.finalDetails.finalPrice);
      // console.log(this.finalDetails.finalPrice)
      this.currentSlide++;
    }


    finishDelivery(request: Request): void {
      const userEmail = this.storageService.getUser();
      if (!userEmail) {
        Swal.fire({
          icon: 'warning',
          title: 'Warning',
          text: 'You must be logged in to accept requests.',
        });
        return;
      }
      const requestId = request._id;
      this.authService.acceptRequest(requestId, userEmail).subscribe(
        (response) => {
          console.log('Request submitted successfully:', response);
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'You have successfully submitted the request!',
            confirmButtonText: 'OK',
          }).then(() => {
            this.router.navigate(['/home']);
          });
        },
        (error) => {
          console.error('Error accepting request:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'There was an error accepting the request.',
          });
        }
      );
    }



    isStep1Valid(): boolean {
      return (
        this.delivererRequest.name.trim() !== '' &&
        this.delivererRequest.departureDate.trim() !== '' &&
        this.delivererRequest.departureTime.trim() !== '' &&
        this.delivererRequest.origin.trim() !== '' &&
        this.delivererRequest.destination.trim() !== ''
      );
    }
  }
