import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
  effect,
  PLATFORM_ID,
  Inject,
} from '@angular/core';
import { CommonModule, DecimalPipe, isPlatformBrowser } from '@angular/common';

/**
 * Utility function to format numbers as Indian Rupees (INR) for enhanced readability.
 * @param value The number to format.
 * @returns Formatted string (e.g., "₹ 5,00,000.00")
 */
const formatINR = (value: number | undefined): string => {
  if (value === undefined || isNaN(value) || !isFinite(value) || value < 0) return '₹ 0.00';

  // Round to 2 decimal places before formatting
  const roundedValue = value.toFixed(2);

  // Split into integer and decimal parts
  const parts = roundedValue.split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

  // Apply Indian numbering system (Lakhs/Crores)
  if (integerPart.length > 3) {
    let lastThree = integerPart.substring(integerPart.length - 3);
    let otherNumbers = integerPart.substring(0, integerPart.length - 3);

    // Apply comma separation for the rest of the numbers (groups of 2)
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  return '₹ ' + integerPart + decimalPart;
};

@Component({
  selector: 'app-emi-calculator',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './emi-calculator.html',
  styleUrls: ['./emi-calculator.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmiCalculator {
  // Inputs as Signals
  principal = signal(500000);
  annualRate = signal(8.5);
  years = signal(5);

  // Pagination State
  readonly pageSize = 12;
  currentPage = signal(1);

  // Define professional colors for the chart, now matching the website theme
  private readonly PRINCIPAL_COLOR = '#007bff'; // Primary Blue
  private readonly INTEREST_COLOR = '#ff9933'; // Accent Orange

  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Angular Effect to redraw the chart whenever calculation inputs change
    // This ensures the chart updates automatically without manual subscription/unsubscription.
    effect(() => {
      // Only run this effect in the browser environment
      if (!this.isBrowser) {
        return;
      }

      // Accessing signals makes this effect reactive
      const P = this.principal();
      const I = this.totalInterest();
      const E = this.emi();

      // Use a brief delay to ensure the canvas element has rendered in the DOM
      setTimeout(() => {
        if (E > 0) {
          this.drawDonutChart(P, I);
        }
      }, 50);
    });
  }

  // Computed Properties (Derived State)

  // Monthly rate (r)
  monthlyRate = computed(() => {
    const rate = this.annualRate();
    // Guard against division by zero and convert percentage to monthly decimal
    return rate > 0 ? rate / 12 / 100 : 0;
  });

  // Total number of payments (n)
  numMonths = computed(() => this.years() * 12);

  // EMI Calculation
  emi = computed(() => {
    const P = this.principal();
    const r = this.monthlyRate();
    const n = this.numMonths();

    // Guard against invalid/zero inputs
    if (P <= 0 || r <= 0 || n <= 0) return 0;

    // EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const term = Math.pow(1 + r, n);
    const emiValue = (P * r * term) / (term - 1);

    // Check for calculation errors (NaN or Infinity)
    return isNaN(emiValue) || !isFinite(emiValue) ? 0 : emiValue;
  });

  // Total Interest Payable
  totalInterest = computed(() => {
    const totalPayment = this.emi() * this.numMonths();
    return totalPayment > 0 ? totalPayment - this.principal() : 0;
  });

  // Total Amount Payable
  totalPayment = computed(() => {
    return this.emi() * this.numMonths();
  });

  /**
   * Generates the detailed, month-by-month amortization schedule.
   * NOTE: Floating point precision issues are mitigated by ensuring the last balance is zero.
   */
  amortizationSchedule = computed(() => {
    const P = this.principal();
    const emi = this.emi();
    const r = this.monthlyRate();
    const n = this.numMonths();

    if (P <= 0 || emi <= 0 || n <= 0) return [];

    const schedule: {
      month: number;
      principalComponent: number;
      interestComponent: number;
      balance: number;
    }[] = [];
    let remainingBalance = P;

    for (let i = 1; i <= n; i++) {
      // Interest paid this month
      const interestComponent = remainingBalance * r;

      // Principal paid this month
      let principalComponent = emi - interestComponent;

      // Handle the last payment to ensure the balance is exactly zero
      if (i === n) {
        // Principal component = remaining balance + (EMI - interest component)
        // This effectively ensures the last payment matches the exact remaining amount + interest.
        principalComponent = remainingBalance;
      }

      // Calculate new remaining balance
      remainingBalance -= principalComponent;

      // Force balance to zero on the final month, or if it somehow went slightly negative due to rounding
      if (i === n || remainingBalance < 0) remainingBalance = 0;

      schedule.push({
        month: i,
        // Using Math.max(0, ...) to guard against tiny negative numbers on the last month's calculation
        principalComponent: Math.max(0, principalComponent),
        interestComponent: Math.max(0, interestComponent),
        balance: remainingBalance,
      });
    }
    return schedule;
  });

  // --- PAGINATION COMPUTED SIGNALS ---

  // Total number of pages
  totalPages = computed(() => {
    return Math.ceil(this.amortizationSchedule().length / this.pageSize);
  });

  // The slice of the schedule for the current page
  paginatedSchedule = computed(() => {
    const schedule = this.amortizationSchedule();
    const page = this.currentPage();

    const startIndex = (page - 1) * this.pageSize;
    const endIndex = page * this.pageSize;

    return schedule.slice(startIndex, endIndex);
  });

  /**
   * Draws the Principal vs Interest breakdown donut chart on the canvas
   * using the standard Canvas API.
   * @param principal The total principal amount.
   * @param interest The total interest amount.
   */
  drawDonutChart(principal: number, interest: number): void {
    // FIX: Only attempt to access the document object if running in a browser
    if (!this.isBrowser) {
      return;
    }

    const canvas = document.getElementById('emiDonutChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const total = principal + interest;
    if (total === 0) return;

    const principalRatio = principal / total;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 90;
    const innerRadius = 55; // Creates the donut shape

    let startAngle = 0;
    // Define segments using the website color scheme
    const segments = [
      { ratio: principalRatio, color: this.PRINCIPAL_COLOR, label: 'Principal' },
      { ratio: 1 - principalRatio, color: this.INTEREST_COLOR, label: 'Interest' },
    ];

    segments.forEach((segment) => {
      const endAngle = startAngle + segment.ratio * 2 * Math.PI;

      ctx.beginPath();
      ctx.fillStyle = segment.color;

      // Draw the outer arc
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);

      // Draw the inner arc backward (to cut out the donut hole)
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);

      ctx.closePath();
      ctx.fill();

      startAngle = endAngle;
    });

    // Draw Principal percentage text in the center
    ctx.fillStyle = '#1c1c1c';
    ctx.font = '20px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const principalPercent = (principalRatio * 100).toFixed(0);
    ctx.fillText(`${principalPercent}%`, centerX, centerY - 8);

    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Principal', centerX, centerY + 10);
  }

  // --- PAGINATION METHODS ---
  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
    }
  }

  // Expose the utility function to the template
  formatINR = formatINR;

  // Input Handlers: Parse event value from either number input or range slider
  updatePrincipal(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.principal.set(isNaN(value) ? 0 : value);
    this.currentPage.set(1); // Reset to first page on input change
  }

  updateRate(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.annualRate.set(isNaN(value) ? 0 : value);
    this.currentPage.set(1); // Reset to first page on input change
  }

  updateYears(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    this.years.set(isNaN(value) ? 0 : value);
    this.currentPage.set(1); // Reset to first page on input change
  }
}
