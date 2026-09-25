import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import { Alert } from '../interfaces/alert';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  public alerts$: Observable<Alert[]> = this.alertsSubject.asObservable();

  private sessionExpired = false;

  constructor(private router: Router) {

    this.router.events.pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      this.clearAllAlerts(false);
    });

  }

  showAlert(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
    seconds: number = 8,
    persistent: boolean = false,
    force: boolean = false
  ) {

    if (this.sessionExpired && !force) {
      return;
    }

    const newAlert: Alert = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type,
      seconds,
      persistent
    };

    const currentAlerts = this.alertsSubject.getValue();

    let updatedAlerts = [...currentAlerts, newAlert];

    const maxAlerts = 5;
    if (updatedAlerts.length > maxAlerts) {
      updatedAlerts = updatedAlerts.slice(-maxAlerts);
    }

    this.alertsSubject.next(updatedAlerts);
  }

  startSessionExpired(): boolean {
    if (this.sessionExpired) {
      return false;
    }

    this.sessionExpired = true;
    this.clearAllAlerts(true);
    return true;
  }

  resetSessionExpired() {
    this.sessionExpired = false;
  }

  removeAlert(id: string) {
    const currentAlerts = this.alertsSubject.getValue();

    const updatedAlerts = currentAlerts.filter(
      alert => alert.id !== id
    );

    this.alertsSubject.next(updatedAlerts);
  }

  clearAllAlerts(clearPersistent: boolean = false) {
    const currentAlerts = this.alertsSubject.getValue();
    let alertsToKeep: Alert[];

    if (clearPersistent) {
      alertsToKeep = [];
    } else {
      alertsToKeep = currentAlerts.filter(
        alert => alert.persistent
      );
    }
    this.alertsSubject.next(alertsToKeep);
  }

  getAlertClass(type: 'success' | 'error' | 'warning' | 'info'): string {
    switch (type) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-danger';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return '';
    }
  }

  getAlertIcon(type: 'success' | 'error' | 'warning' | 'info'): string {
    switch (type) {
      case 'success':
        return 'fa-solid fa-circle-check';
      case 'error':
        return 'fa-solid fa-circle-radiation';
      case 'warning':
        return 'fa-solid fa-circle-exclamation';
      case 'info':
        return 'fa-solid fa-circle-info';
      default:
        return '';
    }
  }
}
