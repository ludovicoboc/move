import { test, expect } from '@playwright/test';
import { TestHelpers, generateTestData, generateRandomString } from '../utils/test-helpers';

test.describe('Health Module', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.login();
    await helpers.navigateToModule('health');
  });

  test.describe('Dashboard Overview', () => {
    test('should display health dashboard with metrics', async ({ page }) => {
      await helpers.waitForLoadingToComplete();
      
      // Should show health overview cards
      await expect(page.locator('.health-dashboard, [data-testid="health-dashboard"]')).toBeVisible();
      
      // Should display metrics cards
      const expectedMetrics = ['Medicamentos', 'Humor', 'Saúde'];
      for (const metric of expectedMetrics) {
        await expect(page.locator(`.metric-card:has-text("${metric}"), [data-testid*="${metric.toLowerCase()}"]`)).toBeVisible();
      }
    });

    test('should show medication and mood sections', async ({ page }) => {
      await helpers.waitForLoadingToComplete();
      
      // Should show medication section
      await expect(page.locator('.medication-section, [data-testid="medication-section"]')).toBeVisible();
      
      // Should show mood monitoring section
      await expect(page.locator('.mood-section, [data-testid="mood-section"]')).toBeVisible();
    });
  });

  test.describe('Medication Management', () => {
    test('should add new medication', async ({ page }) => {
      const medicationData = generateTestData.medication();
      
      await page.click('button:has-text("Adicionar Medicamento"), [data-testid="add-medication"]');
      
      // Fill medication form
      await page.fill('input[name="name"]', medicationData.name);
      await page.fill('input[name="dosage"]', medicationData.dosage);
      
      // Select frequency
      await page.selectOption('select[name="frequency"]', medicationData.frequency);
      
      // Add time
      await page.fill('input[name="time"], input[type="time"]', medicationData.times[0]);
      
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Verify medication appears in list
      await expect(page.locator(`text="${medicationData.name}"`)).toBeVisible();
      await expect(page.locator(`text="${medicationData.dosage}"`)).toBeVisible();
    });

    test('should generate daily doses automatically', async ({ page }) => {
      // Add medication if none exists
      const medicationData = generateTestData.medication();
      
      await page.click('button:has-text("Adicionar Medicamento"), [data-testid="add-medication"]');
      await helpers.fillForm(medicationData);
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Should show daily doses section
      await expect(page.locator('.daily-doses, [data-testid="daily-doses"]')).toBeVisible();
      
      // Should show dose for today
      await expect(page.locator('.dose-item, [data-testid="dose-item"]')).toBeVisible();
      
      // Should show scheduled time
      await expect(page.locator(`text="${medicationData.times[0]}"`)).toBeVisible();
    });

    test('should mark dose as taken', async ({ page }) => {
      await helpers.waitForLoadingToComplete();
      
      // Find existing dose or create medication first
      let doseItem = page.locator('.dose-item, [data-testid="dose-item"]').first();
      
      if (await doseItem.count() === 0) {
        // Create medication first
        const medicationData = generateTestData.medication();
        await page.click('button:has-text("Adicionar Medicamento")');
        await helpers.fillForm(medicationData);
        await helpers.submitForm('Salvar');
        await helpers.waitForLoadingToComplete();
        
        doseItem = page.locator('.dose-item, [data-testid="dose-item"]').first();
      }
      
      // Mark dose as taken
      const takeButton = doseItem.locator('button:has-text("Tomar"), [data-testid="take-dose"]');
      await takeButton.click();
      
      // Should update visual state
      await expect(doseItem).toHaveClass(/taken|completed/);
      await expect(doseItem.locator('text="Tomado", text="✓"')).toBeVisible();
    });

    test('should show adherence statistics', async ({ page }) => {
      await helpers.waitForLoadingToComplete();
      
      // Should show adherence section
      const adherenceSection = page.locator('.adherence-stats, [data-testid="adherence-stats"]');
      await expect(adherenceSection).toBeVisible();
      
      // Should show percentage or metrics
      await expect(adherenceSection.locator('.percentage, .stats-number')).toBeVisible();
    });

    test('should edit medication details', async ({ page }) => {
      await helpers.waitForLoadingToComplete();
      
      // Find existing medication or create one
      let medicationCard = page.locator('.medication-card, .medication-item').first();
      
      if (await medicationCard.count() === 0) {
        const medicationData = generateTestData.medication();
        await page.click('button:has-text("Adicionar Medicamento")');
        await helpers.fillForm(medicationData);
        await helpers.submitForm('Salvar');
        await helpers.waitForLoadingToComplete();
        
        medicationCard = page.locator('.medication-card, .medication-item').first();
      }
      
      // Edit medication
      await medicationCard.locator('button:has-text("Editar"), [data-testid="edit-medication"]').click();
      
      // Update dosage
      const newDosage = '20mg';
      await page.fill('input[name="dosage"]', newDosage);
      
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Verify changes
      await expect(page.locator(`text="${newDosage}"`)).toBeVisible();
    });

    test('should delete medication with confirmation', async ({ page }) => {
      // Create medication to delete
      const medicationData = {
        name: `Delete Test Med ${generateRandomString()}`,
        dosage: '5mg',
        frequency: 'daily',
        times: ['09:00']
      };
      
      await page.click('button:has-text("Adicionar Medicamento")');
      await helpers.fillForm(medicationData);
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Delete medication
      const medicationCard = page.locator(`.medication-card:has-text("${medicationData.name}")`);
      await medicationCard.locator('button:has-text("Excluir"), [data-testid="delete-medication"]').click();
      
      // Confirm deletion
      await page.click('button:has-text("Confirmar"), [data-testid="confirm-delete"]');
      await helpers.waitForLoadingToComplete();
      
      // Medication should be removed
      await expect(page.locator(`text="${medicationData.name}"`)).not.toBeVisible();
    });

    test('should handle different frequency types', async ({ page }) => {
      const frequencies = ['daily', 'twice_daily', 'weekly', 'as_needed'];
      
      for (const frequency of frequencies) {
        const medicationData = {
          name: `Test Med ${frequency}`,
          dosage: '10mg',
          frequency: frequency,
          times: ['08:00']
        };
        
        await page.click('button:has-text("Adicionar Medicamento")');
        await helpers.fillForm(medicationData);
        await helpers.submitForm('Salvar');
        await helpers.waitForLoadingToComplete();
        
        // Verify medication was created with correct frequency
        await expect(page.locator(`text="${medicationData.name}"`)).toBeVisible();
      }
    });
  });

  test.describe('Mood Monitoring', () => {
    test('should record mood entry', async ({ page }) => {
      await page.click('button:has-text("Registrar Humor"), [data-testid="record-mood"]');
      
      const moodData = {
        mood_score: 7,
        notes: `Mood test entry ${generateRandomString()}`,
        energy_level: 6,
        sleep_quality: 8,
        stress_level: 4
      };
      
      // Set mood score (1-10 scale)
      const moodSlider = page.locator('input[name="mood_score"], [data-testid="mood-slider"]');
      await moodSlider.fill(String(moodData.mood_score));
      
      // Add notes
      await page.fill('textarea[name="notes"]', moodData.notes);
      
      // Set other metrics if available
      const energySlider = page.locator('input[name="energy_level"]');
      if (await energySlider.count() > 0) {
        await energySlider.fill(String(moodData.energy_level));
      }
      
      const sleepSlider = page.locator('input[name="sleep_quality"]');
      if (await sleepSlider.count() > 0) {
        await sleepSlider.fill(String(moodData.sleep_quality));
      }
      
      const stressSlider = page.locator('input[name="stress_level"]');
      if (await stressSlider.count() > 0) {
        await stressSlider.fill(String(moodData.stress_level));
      }
      
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Verify mood entry was recorded
      await expect(page.locator(`text="${moodData.notes}"`)).toBeVisible();
      await expect(page.locator(`text="${moodData.mood_score}"`)).toBeVisible();
    });

    test('should add activities and triggers', async ({ page }) => {
      await page.click('button:has-text("Registrar Humor"), [data-testid="record-mood"]');
      
      // Add activities
      const activities = ['trabalho', 'exercício', 'leitura'];
      const activitiesInput = page.locator('input[name="activities"], [data-testid="activities-input"]');
      
      if (await activitiesInput.count() > 0) {
        await activitiesInput.fill(activities.join(', '));
      }
      
      // Add triggers
      const triggers = ['estresse', 'fadiga'];
      const triggersInput = page.locator('input[name="triggers"], [data-testid="triggers-input"]');
      
      if (await triggersInput.count() > 0) {
        await triggersInput.fill(triggers.join(', '));
      }
      
      // Set basic mood score
      await page.fill('input[name="mood_score"]', '6');
      
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Verify activities and triggers were saved
      for (const activity of activities) {
        await expect(page.locator(`text="${activity}"`)).toBeVisible();
      }
    });

    test('should display mood calendar', async ({ page }) => {
      await helpers.waitForLoadingToComplete();
      
      // Should show mood calendar
      await expect(page.locator('.mood-calendar, [data-testid="mood-calendar"]')).toBeVisible();
      
      // Should show days of the month
      await expect(page.locator('.calendar-day, .mood-day')).toHaveCount(28, { timeout: 10000 }); // At least 28 days
      
      // Should show mood indicators
      await expect(page.locator('.mood-indicator, .mood-color')).toBeVisible();
    });

    test('should show mood history', async ({ page }) => {
      await helpers.waitForLoadingToComplete();
      
      // Should show mood history section
      await expect(page.locator('.mood-history, [data-testid="mood-history"]')).toBeVisible();
      
      // Should show recent entries or empty state
      const historyItems = page.locator('.mood-entry, .history-item');
      const emptyState = page.locator('.no-entries, .empty-state');
      
      const hasHistory = await historyItems.count() > 0;
      const hasEmptyState = await emptyState.count() > 0;
      
      expect(hasHistory || hasEmptyState).toBeTruthy();
    });

    test('should calculate mood trends', async ({ page }) => {
      await helpers.waitForLoadingToComplete();
      
      // Should show mood statistics or trends
      const trendsSection = page.locator('.mood-trends, .mood-stats, [data-testid="mood-trends"]');
      
      if (await trendsSection.count() > 0) {
        await expect(trendsSection).toBeVisible();
        
        // Should show average or trend indicators
        await expect(trendsSection.locator('.average, .trend, .statistic')).toBeVisible();
      }
    });

    test('should validate mood score range', async ({ page }) => {
      await page.click('button:has-text("Registrar Humor"), [data-testid="record-mood"]');
      
      // Try invalid mood score
      await page.fill('input[name="mood_score"]', '15'); // Above scale of 1-10
      
      await helpers.submitForm('Salvar');
      
      // Should show validation error
      await expect(page.locator('.error, input:invalid')).toBeVisible();
    });
  });

  test.describe('Health Metrics Integration', () => {
    test('should show correlation between medication adherence and mood', async ({ page }) => {
      await helpers.waitForLoadingToComplete();
      
      // Should show health overview with correlations
      const healthOverview = page.locator('.health-overview, [data-testid="health-overview"]');
      
      if (await healthOverview.count() > 0) {
        await expect(healthOverview).toBeVisible();
        
        // Should show some form of metrics or charts
        await expect(healthOverview.locator('.metric, .chart, .correlation')).toBeVisible();
      }
    });

    test('should export health data', async ({ page }) => {
      // Look for export functionality
      const exportButton = page.locator('button:has-text("Exportar"), [data-testid="export-health-data"]');
      
      if (await exportButton.count() > 0) {
        await exportButton.click();
        
        // Should show export options or start download
        await expect(page.locator('.export-dialog, .download-link')).toBeVisible();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await helpers.testMobileView();
      
      // Dashboard should be visible
      await expect(page.locator('.health-dashboard')).toBeVisible();
      
      // Should be able to add medication
      if (await page.locator('button:has-text("Adicionar Medicamento")').count() > 0) {
        await page.click('button:has-text("Adicionar Medicamento")');
        
        const medicationData = generateTestData.medication();
        await helpers.fillForm(medicationData);
        await helpers.submitForm('Salvar');
        
        await expect(page.locator(`text="${medicationData.name}"`)).toBeVisible();
      }
    });

    test('should adapt layout for tablets', async ({ page }) => {
      await helpers.testTabletView();
      
      // Should maintain functionality
      await helpers.waitForLoadingToComplete();
      await expect(page.locator('.health-dashboard')).toBeVisible();
      
      // Mood recording should work
      if (await page.locator('button:has-text("Registrar Humor")').count() > 0) {
        await page.click('button:has-text("Registrar Humor")');
        await page.fill('input[name="mood_score"]', '7');
        await helpers.submitForm('Salvar');
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      // Tab through medication list
      await page.keyboard.press('Tab');
      
      // Should be able to focus on interactive elements
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Should be able to navigate through form with keyboard
      if (await page.locator('button:has-text("Adicionar Medicamento")').count() > 0) {
        await page.keyboard.press('Enter'); // If focused on add button
        
        // Tab through form fields
        await page.keyboard.press('Tab');
        await expect(page.locator('input:focus')).toBeVisible();
      }
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await helpers.waitForLoadingToComplete();
      
      // Check for ARIA labels on interactive elements
      await expect(page.locator('button[aria-label], input[aria-label]')).toHaveCount(1, { timeout: 5000 }); // At least one
      
      // Sliders should have proper ARIA attributes
      const sliders = page.locator('input[type="range"]');
      if (await sliders.count() > 0) {
        await expect(sliders.first()).toHaveAttribute('aria-valuemin');
        await expect(sliders.first()).toHaveAttribute('aria-valuemax');
      }
    });

    test('should work with screen readers', async ({ page }) => {
      // Check for screen reader friendly elements
      await expect(page.locator('[role="main"], [role="region"], [aria-live]')).toHaveCount(1, { timeout: 5000 }); // At least one
      
      // Forms should have proper labels
      const inputs = page.locator('input[type="text"], input[type="number"]');
      if (await inputs.count() > 0) {
        await expect(inputs.first()).toHaveAttribute('id');
        
        const inputId = await inputs.first().getAttribute('id');
        await expect(page.locator(`label[for="${inputId}"]`)).toBeVisible();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle medication scheduling conflicts', async ({ page }) => {
      // Try to add medication with same time as existing one
      const timeConflict = '08:00';
      
      // Add first medication
      await page.click('button:has-text("Adicionar Medicamento")');
      await page.fill('input[name="name"]', 'First Med');
      await page.fill('input[name="dosage"]', '10mg');
      await page.fill('input[type="time"]', timeConflict);
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Add second medication with same time
      await page.click('button:has-text("Adicionar Medicamento")');
      await page.fill('input[name="name"]', 'Second Med');
      await page.fill('input[name="dosage"]', '5mg');
      await page.fill('input[type="time"]', timeConflict);
      await helpers.submitForm('Salvar');
      
      // Should either allow it or show a warning (both are valid UX choices)
      // Test that the system handles it gracefully without crashing
      await helpers.waitForLoadingToComplete();
      
      // Both medications should exist or there should be an error message
      const firstMed = page.locator('text="First Med"');
      const secondMed = page.locator('text="Second Med"');
      const errorMessage = page.locator('.error, [role="alert"]');
      
      const hasFirstMed = await firstMed.count() > 0;
      const hasSecondMed = await secondMed.count() > 0;
      const hasError = await errorMessage.count() > 0;
      
      expect(hasFirstMed && (hasSecondMed || hasError)).toBeTruthy();
    });

    test('should validate required fields', async ({ page }) => {
      await page.click('button:has-text("Adicionar Medicamento")');
      
      // Try to submit empty form
      await helpers.submitForm('Salvar');
      
      // Should show validation errors
      await expect(page.locator('.error, .field-error, input:invalid')).toHaveCount(2, { timeout: 5000 }); // At least name and dosage
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.context().setOffline(true);
      
      // Try to add medication
      await page.click('button:has-text("Adicionar Medicamento")');
      const medicationData = generateTestData.medication();
      await helpers.fillForm(medicationData);
      await helpers.submitForm('Salvar');
      
      // Should show error message
      await expect(page.locator('.error, [role="alert"]')).toBeVisible();
      
      // Restore connection
      await page.context().setOffline(false);
    });
  });
});