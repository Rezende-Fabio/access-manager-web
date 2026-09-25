import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Alert } from '../../interfaces/alert';
import { AlertService } from '../../services/alert';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alert-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert-component.html',
  styleUrl: './alert-component.css',
  animations: [
    trigger('alertAnimation', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-18px) scale(0.96)'
        }),
        animate('320ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({
            opacity: 1,
            transform: 'translateY(0) scale(1)'
          })
        )
      ]),
      transition(':leave', [
        animate('250ms ease',
          style({
            opacity: 0,
            transform: 'translateY(-12px) scale(0.96)'
          })
        )
      ])
    ])
  ],
})
export class AlertComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  private alertSubscription!: Subscription;
  private autoCloseTimeouts: { [id: string]: any } = {};

  constructor(
    private alertService: AlertService,
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.alertSubscription = this.alertService.alerts$.subscribe(alerts => {
      const removedAlertIds = this.alerts.filter(existingAlert => !alerts.some(newAlert => newAlert.id === existingAlert.id)).map(a => a.id);

      removedAlertIds.forEach(id => {
        if (this.autoCloseTimeouts[id]) {
          clearTimeout(this.autoCloseTimeouts[id]);
          delete this.autoCloseTimeouts[id];
        }
      });

      this.alerts = alerts;

      this.alerts.forEach(alert => {
        if (!this.autoCloseTimeouts[alert.id] && alert.seconds > 0) {
          this.ngZone.runOutsideAngular(() => {
            this.autoCloseTimeouts[alert.id] = setTimeout(() => {
              this.ngZone.run(() => {
                this.removeAlert(alert.id);
              });
            }, alert.seconds * 1000);
          });
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.alertSubscription) {
      this.alertSubscription.unsubscribe();
    }

    for (const id in this.autoCloseTimeouts) {
      if (this.autoCloseTimeouts.hasOwnProperty(id)) {
        clearTimeout(this.autoCloseTimeouts[id]);
      }
    }
    this.autoCloseTimeouts = {};
  }

  removeAlert(id: string) {
    this.alertService.removeAlert(id);
    if (this.autoCloseTimeouts[id]) {
      clearTimeout(this.autoCloseTimeouts[id]);
      delete this.autoCloseTimeouts[id];
    }
  }

  getAlertClass(alert: Alert): string {
    return this.alertService.getAlertClass(alert.type);
  }

  getAlertIcon(alert: Alert): string {
    return this.alertService.getAlertIcon(alert.type);
  }
}
