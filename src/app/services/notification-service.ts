import { Injectable } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';

/**
 * Thin wrapper around PrimeNG's MessageService/ConfirmationService so call sites read the same
 * way the old alert()/confirm() calls did, without every component repeating the same
 * summary/detail/life boilerplate. Replaces every alert()/confirm() in the app.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  success(message: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 3000,
    });
  }

  error(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message, life: 5000 });
  }

  info(message: string) {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: message, life: 3000 });
  }

  confirm(message: string, onAccept: () => void, onReject?: () => void) {
    this.confirmationService.confirm({
      message,
      header: 'Please Confirm',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Yes' },
      rejectButtonProps: { severity: 'secondary', outlined: true, label: 'No' },
      accept: onAccept,
      reject: onReject,
    });
  }
}
