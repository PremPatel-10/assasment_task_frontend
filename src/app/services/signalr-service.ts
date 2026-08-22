import { Injectable, effect } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { AuthService } from './auth-service';
import { environment } from '../../environments/environment';

/**
 * Connects to the backend's InventoryHub (`/hubs/inventory`) and re-broadcasts its two events
 * ("itemsChanged" / "ordersChanged") as observables — components just refetch when either fires,
 * they don't need to know the payload (there isn't one; the hub only signals "something changed").
 * Connection lifecycle tracks login state: connects once authenticated, disconnects on logout.
 */
@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  private connection: signalR.HubConnection | null = null;

  private itemsChangedSource = new Subject<void>();
  private ordersChangedSource = new Subject<void>();

  itemsChanged$ = this.itemsChangedSource.asObservable();
  ordersChanged$ = this.ordersChangedSource.asObservable();

  constructor(private authService: AuthService) {
    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  private connect() {
    if (this.connection) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/inventory`, {
        accessTokenFactory: () => this.authService.token ?? '',
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('itemsChanged', () => this.itemsChangedSource.next());
    this.connection.on('ordersChanged', () => this.ordersChangedSource.next());

    this.connection.start().catch((err) => console.error('SignalR connection failed:', err));
  }

  private disconnect() {
    this.connection?.stop();
    this.connection = null;
  }
}
