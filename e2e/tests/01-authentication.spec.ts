import { test, expect } from '@playwright/test';
import { TestHelpers, TEST_USER, generateRandomEmail } from '../utils/test-helpers';

test.describe('Authentication Module', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
  });

  test.describe('Login Functionality', () => {
    test('should login with valid credentials', async ({ page }) => {
      await helpers.login();
      
      // Verify redirect to main dashboard
      await helpers.expectUrlToBe('/');
      
      // Verify user session is established by checking for user-specific elements
      await expect(page.locator('[data-testid="user-menu"], .user-info')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Should stay on login page
      await helpers.expectUrlToBe('/auth/login');
      
      // Should show error message
      await expect(page.locator('.error, [role="alert"]')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/auth/login');
      await page.click('button[type="submit"]');
      
      // Should show validation errors
      await expect(page.locator('input:invalid, .field-error')).toHaveCount(2);
    });

    test('should toggle between login and signup modes', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Should start in login mode
      await expect(page.locator('h1, .card-title')).toContainText('Entrar');
      await expect(page.locator('button[type="submit"]')).toContainText('Entrar');
      
      // Toggle to signup mode
      await page.click('text="Não tem conta? Cadastre-se", a:has-text("Cadastre-se")');
      await expect(page.locator('h1, .card-title')).toContainText('Criar Conta');
      await expect(page.locator('button[type="submit"]')).toContainText('Criar Conta');
      
      // Toggle back to login mode
      await page.click('text="Já tem conta? Entre", a:has-text("Entre")');
      await expect(page.locator('h1, .card-title')).toContainText('Entrar');
    });
  });

  test.describe('Registration Functionality', () => {
    test('should register new user', async ({ page }) => {
      const newEmail = generateRandomEmail();
      
      await page.goto('/auth/login');
      await page.click('text="Não tem conta? Cadastre-se", a:has-text("Cadastre-se")');
      
      await page.fill('input[type="email"]', newEmail);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // Should show email confirmation message
      await expect(page.locator('text="Verifique seu email", .success-message')).toBeVisible();
    });

    test('should show error for existing email', async ({ page }) => {
      await page.goto('/auth/login');
      await page.click('text="Não tem conta? Cadastre-se", a:has-text("Cadastre-se")');
      
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // Should show error for existing email
      await expect(page.locator('.error, [role="alert"]')).toContainText(/já existe|already/i);
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/auth/login');
      await page.click('text="Não tem conta? Cadastre-se", a:has-text("Cadastre-se")');
      
      await page.fill('input[type="email"]', 'invalid-email');
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // Should show email validation error
      await expect(page.locator('input[type="email"]:invalid')).toBeVisible();
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto('/auth/login');
      await page.click('text="Não tem conta? Cadastre-se", a:has-text("Cadastre-se")');
      
      await page.fill('input[type="email"]', generateRandomEmail());
      await page.fill('input[type="password"]', '123'); // Too short
      await page.click('button[type="submit"]');
      
      // Should show password validation error
      await expect(page.locator('.error, [role="alert"], input:invalid')).toBeVisible();
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session after page refresh', async ({ page }) => {
      await helpers.login();
      
      // Refresh the page
      await page.reload();
      
      // Should still be logged in
      await helpers.expectUrlToBe('/');
      await expect(page.locator('[data-testid="user-menu"], .user-info')).toBeVisible();
    });

    test('should redirect to login when accessing protected page without auth', async ({ page }) => {
      await page.goto('/profile');
      
      // Should redirect to login
      await helpers.expectUrlToBe('/auth/login');
    });

    test('should logout successfully', async ({ page }) => {
      await helpers.login();
      
      // Logout
      await helpers.logout();
      
      // Should be redirected to login
      await helpers.expectUrlToBe('/auth/login');
      
      // Try accessing protected page - should redirect to login
      await page.goto('/profile');
      await helpers.expectUrlToBe('/auth/login');
    });

    test('should maintain session across tabs', async ({ context, page }) => {
      await helpers.login();
      
      // Open new tab
      const newPage = await context.newPage();
      await newPage.goto('/profile');
      
      // Should be logged in on new tab
      await expect(newPage).toHaveURL(/\/profile/);
      await expect(newPage.locator('[data-testid="user-menu"], .user-info')).toBeVisible();
      
      await newPage.close();
    });
  });

  test.describe('Loading States', () => {
    test('should show loading state during login', async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      
      // Click submit and immediately check for loading state
      await page.click('button[type="submit"]');
      await expect(page.locator('button:has-text("Carregando"), button[disabled]')).toBeVisible();
    });

    test('should disable form during submission', async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      
      await page.click('button[type="submit"]');
      
      // Form should be disabled during submission
      await expect(page.locator('input[type="email"]')).toBeDisabled();
      await expect(page.locator('input[type="password"]')).toBeDisabled();
      await expect(page.locator('button[type="submit"]')).toBeDisabled();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper form labels', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Check for proper labels
      await expect(page.locator('label[for*="email"], input[type="email"][aria-label]')).toBeVisible();
      await expect(page.locator('label[for*="password"], input[type="password"][aria-label]')).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="email"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="password"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('button[type="submit"]')).toBeFocused();
      
      // Submit with Enter key
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.keyboard.press('Enter');
      
      await helpers.expectUrlToBe('/');
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Check for ARIA attributes
      await expect(page.locator('form[role="form"], form[aria-label]')).toBeVisible();
      await expect(page.locator('input[type="email"][required][aria-required]')).toBeVisible();
      await expect(page.locator('input[type="password"][required][aria-required]')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await helpers.testMobileView();
      
      await page.goto('/auth/login');
      
      // Form should be visible and usable
      await expect(page.locator('form')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Should be able to login
      await helpers.login();
      await helpers.expectUrlToBe('/');
    });

    test('should work on tablet devices', async ({ page }) => {
      await helpers.testTabletView();
      
      await page.goto('/auth/login');
      
      // Test login functionality
      await helpers.login();
      await helpers.expectUrlToBe('/');
    });

    test('should adapt layout to screen size', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Desktop view
      await helpers.testDesktopView();
      const desktopWidth = await page.locator('.card, .login-form').boundingBox();
      
      // Mobile view
      await helpers.testMobileView();
      const mobileWidth = await page.locator('.card, .login-form').boundingBox();
      
      // Mobile should use full width or be narrower
      expect(mobileWidth!.width).toBeLessThanOrEqual(desktopWidth!.width);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline condition
      await page.context().setOffline(true);
      
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // Should show network error
      await expect(page.locator('.error, [role="alert"]')).toBeVisible();
      
      // Restore connection
      await page.context().setOffline(false);
    });

    test('should clear error messages on retry', async ({ page }) => {
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Should show error
      await expect(page.locator('.error, [role="alert"]')).toBeVisible();
      
      // Clear and retry with valid credentials
      await page.fill('input[type="email"]', TEST_USER.email);
      await page.fill('input[type="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      
      // Error should be cleared and login should succeed
      await helpers.expectUrlToBe('/');
    });
  });

  test.describe('Security', () => {
    test('should mask password field', async ({ page }) => {
      await page.goto('/auth/login');
      
      await page.fill('input[type="password"]', 'testpassword');
      
      // Password should be masked
      const passwordValue = await page.inputValue('input[type="password"]');
      const passwordType = await page.getAttribute('input[type="password"]', 'type');
      
      expect(passwordType).toBe('password');
      expect(passwordValue).toBe('testpassword'); // Value is correct but display is masked
    });

    test('should not expose credentials in URL', async ({ page }) => {
      await helpers.login();
      
      // URL should not contain credentials
      const url = page.url();
      expect(url).not.toContain(TEST_USER.email);
      expect(url).not.toContain(TEST_USER.password);
    });

    test('should handle session timeout', async ({ page }) => {
      await helpers.login();
      
      // Simulate session expiry by clearing auth tokens
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      
      // Try to access protected resource
      await page.goto('/profile');
      
      // Should redirect to login
      await helpers.expectUrlToBe('/auth/login');
    });
  });
});