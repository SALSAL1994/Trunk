import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataSharingService {
  private finalPriceSubject = new BehaviorSubject<number>(0);
  finalPrice$ = this.finalPriceSubject.asObservable();

  setFinalPrice(price: number) {
    this.finalPriceSubject.next(price);
  }
}
