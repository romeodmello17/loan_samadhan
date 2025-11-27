import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LeadService } from '../services/lead.service';
import { response } from 'express';
import { error } from 'console';

@Component({
  selector: 'app-lead-form',
  imports: [ReactiveFormsModule],
  templateUrl: './lead-form.html',
  styleUrl: './lead-form.css',
})
export class LeadForm {
  applyForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  loading = false;

  constructor(private fb: FormBuilder, private leadService: LeadService) {
    this.applyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],

      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{10}$/), // 10-digit Indian number
        ],
      ],

      email: ['', [Validators.email]],

      city: ['', Validators.required],

      loanAmount: ['', [Validators.required, Validators.min(1000), Validators.max(5000000)]],

      loanType: ['', Validators.required],

      leadSource: ['Website'], // default
    });
  }

  // Getters
  get name() {
    return this.applyForm.get('name');
  }
  get phone() {
    return this.applyForm.get('phone');
  }
  get email() {
    return this.applyForm.get('email');
  }
  get city() {
    return this.applyForm.get('city');
  }
  get loanAmount() {
    return this.applyForm.get('loanAmount');
  }
  get loanType() {
    return this.applyForm.get('loanType');
  }
  get leadSource() {
    return this.applyForm.get('leadSource');
  }

  submit() {
    // if (this.applyForm.valid) {
    //   console.log('Lead Data:', this.applyForm.value);
    //   alert('Lead submitted successfully!');
    //   this.applyForm.reset();
    // } else {
    //   this.applyForm.markAllAsTouched();
    // }

    if (!this.applyForm.valid) {
      this.applyForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const leadData = this.applyForm.value;

    this.leadService.createLead(leadData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Form submitted successfully! We will contact you soon.';
        console.log('BACKEND RESPONSE', response);
        this.applyForm.reset();
      },
      error: (err) => {
        this.loading = false;

        if (err.error?.error) {
          // from GlobalExceptionHandler
          this.errorMessage = err.error.error;
        } else {
          this.errorMessage = 'Something went wrong. Try again.';
        }

        console.error('API ERROR:', err);
      },
    });
  }
}
