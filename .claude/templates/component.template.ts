import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

// Import your services and models
// import { YourService } from '../../services/your.service';
// import { YourModel } from '../../models/your.model';

@Component({
  selector: 'app-[component-name]',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>[Component Title]</mat-card-title>
        <mat-card-subtitle>[Component Description]</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        <!-- Your component content here -->
      </mat-card-content>

      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="onAction()">
          Action
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
      padding: 16px;
    }

    mat-card {
      max-width: 800px;
      margin: 0 auto;
    }

    mat-card-actions {
      display: flex;
      justify-content: flex-end;
      padding: 16px;
    }
  `]
})
export class [ComponentName]Component implements OnInit {
  // Input/Output properties
  @Input() inputData: any;
  @Output() actionCompleted = new EventEmitter<any>();

  // Component properties
  form: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder
    // Inject your services here
    // private yourService: YourService
  ) {
    // Initialize form
    this.form = this.fb.group({
      // Define your form controls
      // fieldName: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Component initialization logic
    this.initializeComponent();
  }

  private initializeComponent(): void {
    // Setup logic here
    if (this.inputData) {
      // Process input data
    }
  }

  onAction(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      // Your action logic here
      const result = this.processAction();
      this.actionCompleted.emit(result);
    } catch (error) {
      this.error = 'An error occurred. Please try again.';
      console.error('[ComponentName] Error:', error);
    } finally {
      this.loading = false;
    }
  }

  private processAction(): any {
    // Process your action and return result
    const formValue = this.form.value;
    return formValue;
  }
}