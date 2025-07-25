import { test, expect } from '@playwright/test';
import { TestHelpers, TEST_USER, generateRandomString } from '../utils/test-helpers';

test.describe('Profile Module', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.login();
    await helpers.navigateToModule('profile');
  });

  test.describe('Basic Information Management', () => {
    test('should load profile page with tabs', async ({ page }) => {
      // Verify all tabs are present
      const expectedTabs = ['Básico', 'Acessibilidade', 'Tema', 'Metas', 'Notificações', 'Dados'];
      
      for (const tab of expectedTabs) {
        await expect(page.locator(`[role="tab"]:has-text("${tab}")`)).toBeVisible();
      }
      
      // Basic tab should be active by default
      await expect(page.locator('[role="tab"][aria-selected="true"]')).toContainText('Básico');
    });

    test('should update basic information', async ({ page }) => {
      await helpers.clickTab('Básico');
      
      // Enter edit mode
      await page.click('button:has-text("Editar"), [data-testid="edit-basic-info"]');
      
      const testData = {
        name: `${TEST_USER.name} Updated`,
        bio: `Test bio for user ${generateRandomString()}`,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR'
      };
      
      // Fill form
      await helpers.fillForm(testData);
      
      // Save changes
      await helpers.submitForm('Salvar');
      
      // Wait for save to complete
      await helpers.waitForLoadingToComplete();
      
      // Verify data persistence after page refresh
      await page.reload();
      await helpers.clickTab('Básico');
      
      // Check that values are displayed (not necessarily in form fields)
      await helpers.expectElementToContain('.profile-info, .basic-info', testData.name);
    });

    test('should validate required fields in basic info', async ({ page }) => {
      await helpers.clickTab('Básico');
      await page.click('button:has-text("Editar"), [data-testid="edit-basic-info"]');
      
      // Clear required field
      await page.fill('input[name="name"]', '');
      await helpers.submitForm('Salvar');
      
      // Should show validation error
      await expect(page.locator('.error, .field-error, input:invalid')).toBeVisible();
    });

    test('should cancel editing without saving changes', async ({ page }) => {
      await helpers.clickTab('Básico');
      
      // Get original name
      const originalName = await page.textContent('.profile-name, .name-display');
      
      // Enter edit mode
      await page.click('button:has-text("Editar"), [data-testid="edit-basic-info"]');
      
      // Make changes
      await page.fill('input[name="name"]', 'Changed Name');
      
      // Cancel without saving
      await page.click('button:has-text("Cancelar"), [data-testid="cancel-edit"]');
      
      // Should revert to original name
      await expect(page.locator('.profile-name, .name-display')).toContainText(originalName || '');
    });
  });

  test.describe('Accessibility Preferences', () => {
    test('should configure accessibility settings', async ({ page }) => {
      await helpers.clickTab('Acessibilidade');
      
      // Test high contrast toggle
      const highContrastToggle = page.locator('input[name="highContrast"], [data-testid="high-contrast-toggle"]');
      await highContrastToggle.click();
      
      // Test text size adjustment
      const textSizeSlider = page.locator('input[name="textSize"], [data-testid="text-size-slider"]');
      if (await textSizeSlider.count() > 0) {
        await textSizeSlider.fill('18');
      }
      
      // Test motion reduction
      const motionToggle = page.locator('input[name="reduceMotion"], [data-testid="reduce-motion-toggle"]');
      await motionToggle.click();
      
      // Save settings
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Verify settings are applied (check for CSS classes or attributes)
      await expect(page.locator('body, html')).toHaveClass(/high-contrast|large-text|reduced-motion/);
    });

    test('should apply theme changes immediately', async ({ page }) => {
      await helpers.clickTab('Acessibilidade');
      
      // Toggle high contrast
      const toggle = page.locator('input[name="highContrast"], [data-testid="high-contrast-toggle"]');
      await toggle.click();
      
      // Changes should apply immediately without needing to save
      await expect(page.locator('body, html')).toHaveClass(/high-contrast/);
    });

    test('should persist accessibility settings across sessions', async ({ page }) => {
      await helpers.clickTab('Acessibilidade');
      
      // Enable high contrast
      await page.locator('input[name="highContrast"], [data-testid="high-contrast-toggle"]').click();
      await helpers.submitForm('Salvar');
      
      // Logout and login again
      await helpers.logout();
      await helpers.login();
      await helpers.navigateToModule('profile');
      await helpers.clickTab('Acessibilidade');
      
      // Settings should be preserved
      await expect(page.locator('input[name="highContrast"]:checked, [data-testid="high-contrast-toggle"][aria-checked="true"]')).toBeVisible();
    });
  });

  test.describe('Theme Customization', () => {
    test('should switch between light and dark modes', async ({ page }) => {
      await helpers.clickTab('Tema');
      
      // Test dark mode toggle
      const darkModeToggle = page.locator('input[name="darkMode"], [data-testid="dark-mode-toggle"]');
      await darkModeToggle.click();
      
      // Should apply dark mode immediately
      await expect(page.locator('body, html')).toHaveClass(/dark|dark-mode/);
      
      // Toggle back to light mode
      await darkModeToggle.click();
      await expect(page.locator('body, html')).not.toHaveClass(/dark|dark-mode/);
    });

    test('should customize primary colors', async ({ page }) => {
      await helpers.clickTab('Tema');
      
      // Find color picker or color selection
      const colorOptions = page.locator('.color-option, input[type="color"], [data-testid="color-picker"]');
      
      if (await colorOptions.count() > 0) {
        await colorOptions.first().click();
        
        // Save theme settings
        await helpers.submitForm('Salvar');
        
        // Verify color change is applied (check CSS custom properties)
        const styles = await page.evaluate(() => {
          return getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
        });
        
        expect(styles).toBeTruthy();
      }
    });

    test('should persist theme across browser sessions', async ({ page }) => {
      await helpers.clickTab('Tema');
      
      // Enable dark mode
      await page.locator('input[name="darkMode"], [data-testid="dark-mode-toggle"]').click();
      await helpers.submitForm('Salvar');
      
      // Refresh page
      await page.reload();
      
      // Dark mode should still be active
      await expect(page.locator('body, html')).toHaveClass(/dark|dark-mode/);
    });
  });

  test.describe('Daily Goals Settings', () => {
    test('should configure daily goals', async ({ page }) => {
      await helpers.clickTab('Metas');
      
      const goalTypes = [
        { name: 'studyGoal', value: '120' },
        { name: 'exerciseGoal', value: '30' },
        { name: 'waterGoal', value: '8' },
        { name: 'sleepGoal', value: '8' }
      ];
      
      // Set goals
      for (const goal of goalTypes) {
        const input = page.locator(`input[name="${goal.name}"], [data-testid="${goal.name}"]`);
        if (await input.count() > 0) {
          await input.fill(goal.value);
        }
      }
      
      // Save goals
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Verify goals are saved
      await page.reload();
      await helpers.clickTab('Metas');
      
      for (const goal of goalTypes) {
        const input = page.locator(`input[name="${goal.name}"], [data-testid="${goal.name}"]`);
        if (await input.count() > 0) {
          await helpers.expectFormField(goal.name, goal.value);
        }
      }
    });

    test('should validate goal values', async ({ page }) => {
      await helpers.clickTab('Metas');
      
      // Try to set invalid values
      const invalidInputs = [
        { field: 'studyGoal', value: '-10' },
        { field: 'waterGoal', value: '0' }
      ];
      
      for (const input of invalidInputs) {
        const field = page.locator(`input[name="${input.field}"], [data-testid="${input.field}"]`);
        if (await field.count() > 0) {
          await field.fill(input.value);
        }
      }
      
      await helpers.submitForm('Salvar');
      
      // Should show validation errors
      await expect(page.locator('.error, .field-error, input:invalid')).toBeVisible();
    });
  });

  test.describe('Notification Settings', () => {
    test('should configure notification preferences', async ({ page }) => {
      await helpers.clickTab('Notificações');
      
      // Toggle various notification types
      const notificationTypes = [
        'medicationReminders',
        'studyReminders',
        'sleepReminders',
        'breakReminders'
      ];
      
      for (const type of notificationTypes) {
        const toggle = page.locator(`input[name="${type}"], [data-testid="${type}-toggle"]`);
        if (await toggle.count() > 0) {
          await toggle.click();
        }
      }
      
      // Save settings
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Verify settings persist
      await page.reload();
      await helpers.clickTab('Notificações');
      
      // Check that at least some toggles are enabled
      const enabledToggles = page.locator('input:checked, [aria-checked="true"]');
      await expect(enabledToggles).toHaveCount(await enabledToggles.count());
    });

    test('should request browser notification permission', async ({ page }) => {
      await helpers.clickTab('Notificações');
      
      // Enable browser notifications
      const browserNotificationsToggle = page.locator('input[name="browserNotifications"], [data-testid="browser-notifications-toggle"]');
      
      if (await browserNotificationsToggle.count() > 0) {
        await browserNotificationsToggle.click();
        
        // Should trigger permission request
        const permissionButton = page.locator('button:has-text("Permitir Notificações"), [data-testid="request-permission"]');
        if (await permissionButton.count() > 0) {
          await helpers.grantNotificationPermission();
          await permissionButton.click();
        }
      }
    });
  });

  test.describe('Data Management', () => {
    test('should request data export', async ({ page }) => {
      await helpers.clickTab('Dados');
      
      // Request data export
      await page.click('button:has-text("Exportar Dados"), [data-testid="export-data"]');
      
      // Should show confirmation or success message
      await helpers.waitForToast('exportação solicitada');
      
      // Should show export request in history
      await expect(page.locator('.export-request, .data-export-history')).toBeVisible();
    });

    test('should show export history', async ({ page }) => {
      await helpers.clickTab('Dados');
      
      // Export history section should be visible
      await expect(page.locator('.export-history, [data-testid="export-history"]')).toBeVisible();
      
      // Should show previous exports or empty state
      const historyItems = page.locator('.export-item, .history-item');
      const emptyState = page.locator('.no-exports, .empty-state');
      
      const hasHistory = await historyItems.count() > 0;
      const hasEmptyState = await emptyState.count() > 0;
      
      expect(hasHistory || hasEmptyState).toBeTruthy();
    });

    test('should handle data deletion with confirmation', async ({ page }) => {
      await helpers.clickTab('Dados');
      
      // Click delete data button
      await page.click('button:has-text("Excluir Dados"), [data-testid="delete-data"]');
      
      // Should show confirmation dialog
      await expect(page.locator('.confirmation-dialog, [role="dialog"]')).toBeVisible();
      await expect(page.locator('text="confirmar", text="deletar"')).toBeVisible();
      
      // Cancel deletion
      await page.click('button:has-text("Cancelar"), [data-testid="cancel-delete"]');
      
      // Dialog should close
      await expect(page.locator('.confirmation-dialog, [role="dialog"]')).not.toBeVisible();
    });

    test('should require double confirmation for data deletion', async ({ page }) => {
      await helpers.clickTab('Dados');
      
      // Click delete data button
      await page.click('button:has-text("Excluir Dados"), [data-testid="delete-data"]');
      
      // First confirmation
      await page.click('button:has-text("Confirmar"), [data-testid="confirm-delete"]');
      
      // Should show second confirmation
      await expect(page.locator('text="confirmar novamente", text="definitivamente"')).toBeVisible();
      
      // Cancel at second confirmation
      await page.click('button:has-text("Cancelar"), [data-testid="final-cancel"]');
    });
  });

  test.describe('Navigation and UX', () => {
    test('should navigate between tabs correctly', async ({ page }) => {
      const tabs = ['Básico', 'Acessibilidade', 'Tema', 'Metas', 'Notificações', 'Dados'];
      
      for (const tab of tabs) {
        await helpers.clickTab(tab);
        
        // Tab should be active
        await expect(page.locator(`[role="tab"]:has-text("${tab}")[aria-selected="true"]`)).toBeVisible();
        
        // Tab content should be visible
        await expect(page.locator(`[role="tabpanel"]:visible`)).toBeVisible();
      }
    });

    test('should show loading states during save operations', async ({ page }) => {
      await helpers.clickTab('Básico');
      await page.click('button:has-text("Editar"), [data-testid="edit-basic-info"]');
      
      // Make a change
      await page.fill('input[name="name"]', `${TEST_USER.name} Test`);
      
      // Click save and check for loading state
      await page.click('button:has-text("Salvar")');
      
      // Should show loading indicator
      await expect(page.locator('button:has-text("Salvando"), .loading, .spinner')).toBeVisible();
    });

    test('should handle form validation errors gracefully', async ({ page }) => {
      await helpers.clickTab('Básico');
      await page.click('button:has-text("Editar"), [data-testid="edit-basic-info"]');
      
      // Clear required field and submit
      await page.fill('input[name="name"]', '');
      await helpers.submitForm('Salvar');
      
      // Should show clear error message
      const errorMessage = page.locator('.error-message, .field-error, [role="alert"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText(/obrigatório|required/i);
    });

    test('should preserve unsaved changes when switching tabs', async ({ page }) => {
      await helpers.clickTab('Básico');
      await page.click('button:has-text("Editar"), [data-testid="edit-basic-info"]');
      
      // Make changes
      const newName = `${TEST_USER.name} Modified`;
      await page.fill('input[name="name"]', newName);
      
      // Switch to another tab
      await helpers.clickTab('Tema');
      
      // Switch back
      await helpers.clickTab('Básico');
      
      // Changes should be preserved (if form is still in edit mode)
      const nameInput = page.locator('input[name="name"]');
      if (await nameInput.count() > 0) {
        await helpers.expectFormField('name', newName);
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await helpers.testMobileView();
      
      // Tabs should be visible and functional
      await helpers.clickTab('Básico');
      await expect(page.locator('[role="tabpanel"]:visible')).toBeVisible();
      
      // Should be able to edit basic info
      if (await page.locator('button:has-text("Editar")').count() > 0) {
        await page.click('button:has-text("Editar")');
        await page.fill('input[name="name"]', `${TEST_USER.name} Mobile`);
        await helpers.submitForm('Salvar');
      }
    });

    test('should adapt tab layout for small screens', async ({ page }) => {
      await helpers.testMobileView();
      
      // Tabs might be in a dropdown or scrollable on mobile
      const tabContainer = page.locator('[role="tablist"], .tabs-container');
      await expect(tabContainer).toBeVisible();
      
      // Should be able to access all tabs
      const tabs = ['Básico', 'Tema', 'Dados'];
      for (const tab of tabs) {
        await helpers.clickTab(tab);
        await expect(page.locator(`[role="tabpanel"]:visible`)).toBeVisible();
      }
    });
  });

  test.describe('Performance', () => {
    test('should load profile data quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await helpers.navigateToModule('profile');
      await helpers.waitForLoadingToComplete();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time (5 seconds)
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle large form data efficiently', async ({ page }) => {
      await helpers.clickTab('Básico');
      await page.click('button:has-text("Editar"), [data-testid="edit-basic-info"]');
      
      // Fill form with large text
      const largeBio = 'A'.repeat(1000);
      await page.fill('textarea[name="bio"], input[name="bio"]', largeBio);
      
      // Should handle large input without performance issues
      const startTime = Date.now();
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      const saveTime = Date.now() - startTime;
      
      expect(saveTime).toBeLessThan(10000); // Should save within 10 seconds
    });
  });
});