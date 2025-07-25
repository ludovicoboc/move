import { test, expect } from '@playwright/test';
import { TestHelpers, generateTestData, formatCurrency } from '../utils/test-helpers';

test.describe('Finance Module', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.login();
    await helpers.navigateToModule('finance');
  });

  test.describe('Expense Tracking', () => {
    test('should display expense tracker with categories', async ({ page }) => {
      // Wait for data to load
      await helpers.waitForLoadingToComplete();
      
      // Should show expense tracker section
      await expect(page.locator('.expense-tracker, [data-testid="expense-tracker"]')).toBeVisible();
      
      // Should display default categories
      const expectedCategories = ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Lazer'];
      for (const category of expectedCategories) {
        await expect(page.locator(`text="${category}"`)).toBeVisible();
      }
      
      // Should show totals and percentages
      await expect(page.locator('.total-amount, [data-testid="total-amount"]')).toBeVisible();
      await expect(page.locator('.percentage, [data-testid="percentage"]')).toBeVisible();
    });

    test('should format currency correctly', async ({ page }) => {
      await helpers.waitForLoadingToComplete();
      
      // Check that amounts are formatted in BRL
      const amountElements = page.locator('.amount, .currency, [data-testid*="amount"]');
      
      if (await amountElements.count() > 0) {
        const firstAmount = await amountElements.first().textContent();
        expect(firstAmount).toMatch(/R\$|BRL/);
      }
    });

    test('should show placeholder chart', async ({ page }) => {
      await helpers.waitForLoadingToComplete();
      
      // Should show chart placeholder or actual chart
      await expect(page.locator('.chart-placeholder, .expense-chart, canvas')).toBeVisible();
    });
  });

  test.describe('Add New Expense', () => {
    test('should add expense successfully', async ({ page }) => {
      const expenseData = generateTestData.expense();
      
      // Click add expense button
      await page.click('button:has-text("Adicionar"), button:has-text("Add"), [data-testid="add-expense"]');
      
      // Fill expense form
      await page.fill('input[name="description"]', expenseData.description);
      await page.fill('input[name="amount"]', String(expenseData.amount));
      await page.fill('input[name="date"]', expenseData.date);
      
      // Select category
      await page.click('select[name="category"], [data-testid="category-select"]');
      await page.click(`option:has-text("${expenseData.category}"), [data-value="${expenseData.category}"]`);
      
      // Submit form
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Verify expense appears in tracker
      await expect(page.locator(`text="${expenseData.description}"`)).toBeVisible();
      await expect(page.locator(`text="${formatCurrency(expenseData.amount)}"`)).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.click('button:has-text("Adicionar"), [data-testid="add-expense"]');
      
      // Try to submit empty form
      await helpers.submitForm('Salvar');
      
      // Should show validation errors
      await expect(page.locator('.error, .field-error, input:invalid')).toHaveCount(3); // description, amount, category
    });

    test('should validate amount is positive', async ({ page }) => {
      await page.click('button:has-text("Adicionar"), [data-testid="add-expense"]');
      
      await page.fill('input[name="description"]', 'Test Expense');
      await page.fill('input[name="amount"]', '-100');
      await page.fill('input[name="date"]', new Date().toISOString().split('T')[0]);
      
      await helpers.submitForm('Salvar');
      
      // Should show error for negative amount
      await expect(page.locator('.error, input:invalid')).toBeVisible();
    });

    test('should show expense in selected category', async ({ page }) => {
      const expenseData = generateTestData.expense();
      
      await page.click('button:has-text("Adicionar"), [data-testid="add-expense"]');
      await helpers.fillForm(expenseData);
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Find the category section and verify expense is there
      const categorySection = page.locator(`.category-section:has-text("${expenseData.category}")`);
      await expect(categorySection.locator(`text="${expenseData.description}"`)).toBeVisible();
    });
  });

  test.describe('Virtual Envelopes', () => {
    test('should create virtual envelope', async ({ page }) => {
      const envelopeData = {
        name: `Test Envelope ${Date.now()}`,
        total_amount: 500,
        color: '#4CAF50'
      };
      
      // Navigate to envelopes section
      await page.click('button:has-text("Envelope"), [data-testid="envelopes-tab"]');
      
      // Create new envelope
      await page.click('button:has-text("Criar Envelope"), [data-testid="create-envelope"]');
      
      await page.fill('input[name="name"]', envelopeData.name);
      await page.fill('input[name="total_amount"]', String(envelopeData.total_amount));
      
      // Select color
      const colorPicker = page.locator('input[type="color"], [data-testid="color-picker"]');
      if (await colorPicker.count() > 0) {
        await colorPicker.fill(envelopeData.color);
      }
      
      await helpers.submitForm('Criar');
      await helpers.waitForLoadingToComplete();
      
      // Verify envelope was created
      await expect(page.locator(`text="${envelopeData.name}"`)).toBeVisible();
      await expect(page.locator(`text="${formatCurrency(envelopeData.total_amount)}"`)).toBeVisible();
    });

    test('should register expense against envelope', async ({ page }) => {
      // First create an envelope
      await page.click('button:has-text("Envelope"), [data-testid="envelopes-tab"]');
      
      // Find existing envelope or create one
      const existingEnvelope = page.locator('.envelope-card').first();
      if (await existingEnvelope.count() === 0) {
        // Create envelope first
        await page.click('button:has-text("Criar Envelope")');
        await page.fill('input[name="name"]', 'Test Envelope');
        await page.fill('input[name="total_amount"]', '1000');
        await helpers.submitForm('Criar');
        await helpers.waitForLoadingToComplete();
      }
      
      // Register expense against envelope
      const envelope = page.locator('.envelope-card').first();
      await envelope.locator('button:has-text("Gastar"), [data-testid="spend-from-envelope"]').click();
      
      await page.fill('input[name="amount"]', '50');
      await page.fill('input[name="description"]', 'Test envelope expense');
      
      await helpers.submitForm('Registrar');
      await helpers.waitForLoadingToComplete();
      
      // Verify progress bar updated
      await expect(envelope.locator('.progress-bar, [data-testid="envelope-progress"]')).toBeVisible();
    });

    test('should prevent overspending envelope limit', async ({ page }) => {
      await page.click('button:has-text("Envelope"), [data-testid="envelopes-tab"]');
      
      // Create small envelope
      await page.click('button:has-text("Criar Envelope")');
      await page.fill('input[name="name"]', 'Small Envelope');
      await page.fill('input[name="total_amount"]', '10');
      await helpers.submitForm('Criar');
      await helpers.waitForLoadingToComplete();
      
      // Try to spend more than limit
      const envelope = page.locator('.envelope-card:has-text("Small Envelope")');
      await envelope.locator('button:has-text("Gastar")').click();
      
      await page.fill('input[name="amount"]', '20'); // More than envelope limit
      await page.fill('input[name="description"]', 'Overspend test');
      
      await helpers.submitForm('Registrar');
      
      // Should show validation error
      await expect(page.locator('.error, [role="alert"]')).toContainText(/limite|limit|insuficiente/i);
    });

    test('should delete envelope with confirmation', async ({ page }) => {
      await page.click('button:has-text("Envelope"), [data-testid="envelopes-tab"]');
      
      // Create envelope to delete
      await page.click('button:has-text("Criar Envelope")');
      await page.fill('input[name="name"]', 'Delete Test Envelope');
      await page.fill('input[name="total_amount"]', '100');
      await helpers.submitForm('Criar');
      await helpers.waitForLoadingToComplete();
      
      // Delete envelope
      const envelope = page.locator('.envelope-card:has-text("Delete Test Envelope")');
      await envelope.locator('button:has-text("Excluir"), [data-testid="delete-envelope"]').click();
      
      // Confirm deletion
      await page.click('button:has-text("Confirmar"), [data-testid="confirm-delete"]');
      await helpers.waitForLoadingToComplete();
      
      // Envelope should be removed
      await expect(page.locator('text="Delete Test Envelope"')).not.toBeVisible();
    });

    test('should show visual progress bar', async ({ page }) => {
      await page.click('button:has-text("Envelope"), [data-testid="envelopes-tab"]');
      await helpers.waitForLoadingToComplete();
      
      // Check for progress bars on existing envelopes
      const envelopes = page.locator('.envelope-card');
      if (await envelopes.count() > 0) {
        const firstEnvelope = envelopes.first();
        await expect(firstEnvelope.locator('.progress-bar, [role="progressbar"]')).toBeVisible();
        
        // Progress bar should have appropriate attributes
        const progressBar = firstEnvelope.locator('[role="progressbar"]');
        if (await progressBar.count() > 0) {
          const ariaValueNow = await progressBar.getAttribute('aria-valuenow');
          const ariaValueMax = await progressBar.getAttribute('aria-valuemax');
          expect(ariaValueNow).toBeTruthy();
          expect(ariaValueMax).toBeTruthy();
        }
      }
    });
  });

  test.describe('Payment Calendar', () => {
    test('should create one-time payment', async ({ page }) => {
      await page.click('button:has-text("Calendário"), [data-testid="calendar-tab"]');
      
      const paymentData = {
        title: `Payment ${Date.now()}`,
        amount: 150,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Next week
      };
      
      await page.click('button:has-text("Novo Pagamento"), [data-testid="new-payment"]');
      
      await page.fill('input[name="title"]', paymentData.title);
      await page.fill('input[name="amount"]', String(paymentData.amount));
      await page.fill('input[name="due_date"]', paymentData.due_date);
      
      // Leave as one-time payment (don't check recurring)
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Verify payment appears in calendar
      await expect(page.locator(`text="${paymentData.title}"`)).toBeVisible();
    });

    test('should create recurring payment', async ({ page }) => {
      await page.click('button:has-text("Calendário"), [data-testid="calendar-tab"]');
      
      const recurringPayment = {
        title: `Recurring Payment ${Date.now()}`,
        amount: 500,
        due_date: new Date().toISOString().split('T')[0],
        recurrence_type: 'monthly'
      };
      
      await page.click('button:has-text("Novo Pagamento"), [data-testid="new-payment"]');
      
      await page.fill('input[name="title"]', recurringPayment.title);
      await page.fill('input[name="amount"]', String(recurringPayment.amount));
      await page.fill('input[name="due_date"]', recurringPayment.due_date);
      
      // Enable recurring
      await page.check('input[name="is_recurring"], [data-testid="recurring-checkbox"]');
      
      // Select recurrence type
      await page.selectOption('select[name="recurrence_type"]', recurringPayment.recurrence_type);
      
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Verify recurring payment is created
      await expect(page.locator(`text="${recurringPayment.title}"`)).toBeVisible();
      await expect(page.locator('text="Mensal", text="Recorrente"')).toBeVisible();
    });

    test('should mark payment as paid/unpaid', async ({ page }) => {
      await page.click('button:has-text("Calendário"), [data-testid="calendar-tab"]');
      await helpers.waitForLoadingToComplete();
      
      // Find existing payment or create one
      let paymentItem = page.locator('.payment-item, .calendar-event').first();
      
      if (await paymentItem.count() === 0) {
        // Create a payment first
        await page.click('button:has-text("Novo Pagamento")');
        await page.fill('input[name="title"]', 'Test Payment');
        await page.fill('input[name="amount"]', '100');
        await page.fill('input[name="due_date"]', new Date().toISOString().split('T')[0]);
        await helpers.submitForm('Salvar');
        await helpers.waitForLoadingToComplete();
        
        paymentItem = page.locator('.payment-item, .calendar-event').first();
      }
      
      // Toggle payment status
      const statusButton = paymentItem.locator('button:has-text("Pago"), button:has-text("Não Pago"), [data-testid="toggle-paid"]');
      await statusButton.click();
      
      // Verify status change is reflected visually
      await expect(paymentItem).toHaveClass(/paid|unpaid|completed/);
    });

    test('should navigate between months', async ({ page }) => {
      await page.click('button:has-text("Calendário"), [data-testid="calendar-tab"]');
      
      // Get current month display
      const currentMonth = await page.locator('.month-display, .calendar-header h2').textContent();
      
      // Click next month
      await page.click('button:has-text("›"), [data-testid="next-month"]');
      
      // Month should change
      const newMonth = await page.locator('.month-display, .calendar-header h2').textContent();
      expect(newMonth).not.toBe(currentMonth);
      
      // Click previous month
      await page.click('button:has-text("‹"), [data-testid="prev-month"]');
      
      // Should return to original month
      const returnedMonth = await page.locator('.month-display, .calendar-header h2').textContent();
      expect(returnedMonth).toBe(currentMonth);
    });

    test('should delete payment with confirmation', async ({ page }) => {
      await page.click('button:has-text("Calendário"), [data-testid="calendar-tab"]');
      
      // Create payment to delete
      await page.click('button:has-text("Novo Pagamento")');
      await page.fill('input[name="title"]', 'Delete Test Payment');
      await page.fill('input[name="amount"]', '50');
      await page.fill('input[name="due_date"]', new Date().toISOString().split('T')[0]);
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Delete payment
      const payment = page.locator('.payment-item:has-text("Delete Test Payment")');
      await payment.locator('button:has-text("Excluir"), [data-testid="delete-payment"]').click();
      
      // Confirm deletion
      await page.click('button:has-text("Confirmar"), [data-testid="confirm-delete"]');
      await helpers.waitForLoadingToComplete();
      
      // Payment should be removed
      await expect(page.locator('text="Delete Test Payment"')).not.toBeVisible();
    });
  });

  test.describe('Data Synchronization', () => {
    test('should update expense tracker after adding expense', async ({ page }) => {
      // Get initial total
      await helpers.waitForLoadingToComplete();
      const initialTotalElement = page.locator('.total-amount, [data-testid="total-amount"]');
      const initialTotal = await initialTotalElement.textContent();
      
      // Add new expense
      const expenseData = generateTestData.expense();
      await page.click('button:has-text("Adicionar"), [data-testid="add-expense"]');
      await helpers.fillForm(expenseData);
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Total should update
      const newTotal = await initialTotalElement.textContent();
      expect(newTotal).not.toBe(initialTotal);
    });

    test('should sync envelope spending with expense tracker', async ({ page }) => {
      // Create envelope
      await page.click('button:has-text("Envelope"), [data-testid="envelopes-tab"]');
      await page.click('button:has-text("Criar Envelope")');
      await page.fill('input[name="name"]', 'Sync Test Envelope');
      await page.fill('input[name="total_amount"]', '200');
      await helpers.submitForm('Criar');
      await helpers.waitForLoadingToComplete();
      
      // Spend from envelope
      const envelope = page.locator('.envelope-card:has-text("Sync Test Envelope")');
      await envelope.locator('button:has-text("Gastar")').click();
      await page.fill('input[name="amount"]', '50');
      await page.fill('input[name="description"]', 'Sync test expense');
      await page.selectOption('select[name="category"]', 'Alimentação');
      await helpers.submitForm('Registrar');
      await helpers.waitForLoadingToComplete();
      
      // Check that expense appears in expense tracker
      await page.click('button:has-text("Gastos"), [data-testid="expenses-tab"]');
      await expect(page.locator('text="Sync test expense"')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await helpers.testMobileView();
      
      // All main sections should be accessible
      await expect(page.locator('.expense-tracker, [data-testid="expense-tracker"]')).toBeVisible();
      
      // Should be able to add expense
      await page.click('button:has-text("Adicionar"), [data-testid="add-expense"]');
      const expenseData = generateTestData.expense();
      await helpers.fillForm(expenseData);
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      await expect(page.locator(`text="${expenseData.description}"`)).toBeVisible();
    });

    test('should adapt layout for different screen sizes', async ({ page }) => {
      // Test desktop layout
      await helpers.testDesktopView();
      const desktopLayout = await page.locator('.finance-dashboard, .main-content').boundingBox();
      
      // Test mobile layout
      await helpers.testMobileView();
      const mobileLayout = await page.locator('.finance-dashboard, .main-content').boundingBox();
      
      // Layout should adapt (different width/height ratios)
      expect(mobileLayout!.width).toBeLessThan(desktopLayout!.width);
    });
  });

  test.describe('Performance and Loading', () => {
    test('should show loading states', async ({ page }) => {
      // Reload page to see loading states
      await page.reload();
      
      // Should show skeleton loading or loading indicators
      await expect(page.locator('.loading, .skeleton, [data-testid="loading"]')).toBeVisible();
      
      // Loading should complete
      await helpers.waitForLoadingToComplete();
      await expect(page.locator('.loading, .skeleton')).not.toBeVisible();
    });

    test('should handle large amounts of data', async ({ page }) => {
      // This test assumes there might be performance issues with many expenses
      // In a real scenario, you'd create many test expenses first
      
      await helpers.waitForLoadingToComplete();
      
      // Page should still be responsive
      const startTime = Date.now();
      await page.click('button:has-text("Adicionar"), [data-testid="add-expense"]');
      const clickTime = Date.now() - startTime;
      
      expect(clickTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.context().setOffline(true);
      
      // Try to add expense
      await page.click('button:has-text("Adicionar"), [data-testid="add-expense"]');
      const expenseData = generateTestData.expense();
      await helpers.fillForm(expenseData);
      await helpers.submitForm('Salvar');
      
      // Should show error message
      await expect(page.locator('.error, [role="alert"]')).toBeVisible();
      
      // Restore connection
      await page.context().setOffline(false);
    });

    test('should validate data types correctly', async ({ page }) => {
      await page.click('button:has-text("Adicionar"), [data-testid="add-expense"]');
      
      // Try invalid amount format
      await page.fill('input[name="description"]', 'Test Expense');
      await page.fill('input[name="amount"]', 'invalid amount');
      await page.fill('input[name="date"]', new Date().toISOString().split('T')[0]);
      
      await helpers.submitForm('Salvar');
      
      // Should show validation error
      await expect(page.locator('.error, input:invalid')).toBeVisible();
    });
  });
});