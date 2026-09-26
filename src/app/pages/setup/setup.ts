import { Component, signal } from '@angular/core';
import { InitializeSystemRequest } from '../../models/initialize-system.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SystemService } from '../../services/system';
import { InitializeSystemResponse } from '../../models/initialize-system-response.model';
import { AlertService } from '../../services/alert';
import { DialogModule } from 'primeng/dialog';
import { ApiResponse } from '../../interfaces/apiResponse';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    DividerModule,
    DialogModule
  ],
  templateUrl: './setup.html',
  styleUrl: './setup.css',
})
export class SetupPage {
  setupForm: FormGroup;
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  currentStep = signal(1);
  showSuccessModal = signal(false);
  setupResult = signal<InitializeSystemResponse | null>(null);
  passwordCopied = signal(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private setupService: SystemService,
    private alertService: AlertService
  ) {
    this.setupForm = this.fb.group({
      branchName: ['', [Validators.required, Validators.minLength(3)]],
      branchCnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/)]],
      adminName: ['', [Validators.required, Validators.minLength(3)]],
      adminEmail: ['', [Validators.required, Validators.email]]
    });
  }

  get branchName() { return this.setupForm.get('branchName'); }
  get branchCnpj() { return this.setupForm.get('branchCnpj'); }
  get adminName() { return this.setupForm.get('adminName'); }
  get adminEmail() { return this.setupForm.get('adminEmail'); }

  nextStep(): void {
    if (this.currentStep() === 1) {
      if (this.branchName?.invalid || this.branchCnpj?.invalid) {
        this.branchName?.markAsTouched();
        this.branchCnpj?.markAsTouched();
        return;
      }
      this.currentStep.set(2);
    }
  }

  prevStep(): void {
    this.currentStep.set(1);
  }

  onSubmit(): void {
    if (this.setupForm.invalid) {
      this.setupForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const payload: InitializeSystemRequest = {
      branchName: this.setupForm.value.branchName,
      branchCnpj: this.setupForm.value.branchCnpj.replace(/\D/g, ''),
      adminName: this.setupForm.value.adminName,
      adminEmail: this.setupForm.value.adminEmail
    };

    this.setupService.initialize(payload).subscribe({
      next: (response: ApiResponse<InitializeSystemResponse>) => {
        this.alertService.showAlert('Sistema inicializado com sucesso!', 'success', 15, true);
        this.setupResult.set(response.data!);
        this.showSuccessModal.set(true);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro ao inicializar o sistema:', error);
        error.error.errors.forEach((errorMessage: string) => {
          this.alertService.showAlert(errorMessage, 'error', 10);
        });
        this.loading.set(false);
      }
    });
  }

  copyPassword(): void {
    const password = this.setupResult()?.temporaryPassword;
    if (!password) return;

    navigator.clipboard.writeText(password).then(() => {
      this.passwordCopied.set(true);
      setTimeout(() => this.passwordCopied.set(false), 2500);
    });
  }

  goToLogin(): void {
    this.showSuccessModal.set(false);
    this.router.navigate(['/index']);
  }

  onCnpjInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 14) value = value.slice(0, 14);

    if (value.length > 12) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*/, '$1.$2.$3/$4-$5');
    } else if (value.length > 8) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*/, '$1.$2.$3/$4');
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,3}).*/, '$1.$2');
    }

    this.setupForm.patchValue({ branchCnpj: value }, { emitEvent: false });
  }
}
