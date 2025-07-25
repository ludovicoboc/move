import { Page, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Test user credentials
export const TEST_USER = {
  email: 'test.user@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
};

// Supabase client for test cleanup
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for cleanup
  {
    auth: {
      persistSession: false,
    },
  }
);

export class TestHelpers {
  constructor(private page: Page) {}

  // Authentication helpers
  async login(email: string = TEST_USER.email, password: string = TEST_USER.password) {
    await this.page.goto('/auth/login');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/');
  }

  async logout() {
    // Look for logout button in sidebar or header
    await this.page.click('button:has-text("Sair"), button:has-text("Logout")');
    await this.page.waitForURL('/auth/login');
  }

  async register(email: string = TEST_USER.email, password: string = TEST_USER.password) {
    await this.page.goto('/auth/login');
    await this.page.click('text="Não tem conta? Cadastre-se"');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button:has-text("Criar Conta")');
  }

  // Navigation helpers
  async navigateToModule(module: string) {
    await this.page.click(`nav a[href="/${module}"], [data-testid="nav-${module}"]`);
    await this.page.waitForURL(`/${module}`);
  }

  // Form helpers
  async fillForm(formData: Record<string, string | number | boolean>) {
    for (const [field, value] of Object.entries(formData)) {
      const input = this.page.locator(`input[name="${field}"], textarea[name="${field}"], select[name="${field}"]`);
      
      if (typeof value === 'boolean') {
        if (value) {
          await input.check();
        } else {
          await input.uncheck();
        }
      } else {
        await input.fill(String(value));
      }
    }
  }

  async submitForm(buttonText: string = 'Salvar') {
    await this.page.click(`button:has-text("${buttonText}"), input[type="submit"]`);
  }

  // Wait helpers
  async waitForToast(message?: string) {
    if (message) {
      await this.page.waitForSelector(`.toast:has-text("${message}"), .notification:has-text("${message}")`);
    } else {
      await this.page.waitForSelector('.toast, .notification');
    }
  }

  async waitForLoadingToComplete() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForFunction(() => {
      const loaders = document.querySelectorAll('[data-testid="loading"], .loading, .spinner');
      return loaders.length === 0;
    }, { timeout: 10000 });
  }

  // Timer helpers
  async startTimer(duration?: number) {
    if (duration) {
      await this.page.fill('input[name="customTime"], input[name="duration"]', String(duration));
    }
    await this.page.click('button:has-text("Start"), button:has-text("Iniciar")');
  }

  async pauseTimer() {
    await this.page.click('button:has-text("Pause"), button:has-text("Pausar")');
  }

  async stopTimer() {
    await this.page.click('button:has-text("Stop"), button:has-text("Parar")');
  }

  // Data validation helpers
  async expectElementToContain(selector: string, text: string) {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  async expectFormField(name: string, value: string | number) {
    await expect(this.page.locator(`input[name="${name}"], textarea[name="${name}"]`)).toHaveValue(String(value));
  }

  async expectUrlToBe(path: string) {
    await expect(this.page).toHaveURL(new RegExp(`${path}$`));
  }

  // Tab navigation helpers
  async clickTab(tabName: string) {
    await this.page.click(`[role="tab"]:has-text("${tabName}"), button:has-text("${tabName}")`);
  }

  // Database cleanup helpers
  static async cleanupTestData(userId?: string) {
    if (!userId) return;

    const tables = [
      'expenses',
      'virtual_envelopes',
      'scheduled_payments',
      'meal_plans',
      'meal_logs',
      'hydration_logs',
      'medications',
      'medication_doses',
      'mood_records',
      'hyperfocuses',
      'hyperfocus_sessions',
      'toggle_sessions',
      'hyperfocus_projects',
      'leisure_activities',
      'leisure_sessions',
      'rest_suggestions',
      'recipes',
      'recipe_ingredients',
      'recipe_instructions',
      'self_awareness_notes',
      'refuge_sessions',
      'reflection_entries',
      'self_analysis_metrics',
      'sleep_records',
      'sleep_reminders',
      'study_sessions',
      'exams',
      'study_materials'
    ];

    for (const table of tables) {
      try {
        await supabase.from(table).delete().eq('user_id', userId);
      } catch (error) {
        console.warn(`Failed to cleanup table ${table}:`, error);
      }
    }
  }

  // Screenshot helpers
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  // Responsive design helpers
  async setViewportSize(width: number, height: number) {
    await this.page.setViewportSize({ width, height });
  }

  async testMobileView() {
    await this.setViewportSize(375, 667);
  }

  async testTabletView() {
    await this.setViewportSize(768, 1024);
  }

  async testDesktopView() {
    await this.setViewportSize(1920, 1080);
  }

  // Notification helpers
  async grantNotificationPermission() {
    await this.page.context().grantPermissions(['notifications']);
  }

  async expectNotification(title?: string) {
    // Wait for notification to appear
    await this.page.waitForFunction(() => {
      return Notification.permission === 'granted' && 
             document.visibilityState === 'hidden' || 
             document.querySelectorAll('.notification').length > 0;
    });
  }
}

// Utility functions
export function generateRandomEmail(): string {
  return `test.${Date.now()}@example.com`;
}

export function generateRandomString(length: number = 8): string {
  return Math.random().toString(36).substring(2, length + 2);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
}

// Test data generators
export const generateTestData = {
  expense: () => ({
    description: `Test Expense ${generateRandomString()}`,
    amount: Math.floor(Math.random() * 1000) + 10,
    category: 'Alimentação',
    date: new Date().toISOString().split('T')[0]
  }),

  recipe: () => ({
    name: `Test Recipe ${generateRandomString()}`,
    description: 'A delicious test recipe',
    category: 'Almoço',
    prep_time: 30,
    servings: 4,
    calories: 350,
    tags: 'test,recipe'
  }),

  medication: () => ({
    name: `Test Medicine ${generateRandomString()}`,
    dosage: '10mg',
    frequency: 'daily',
    times: ['08:00']
  }),

  sleepRecord: () => ({
    sleep_date: new Date().toISOString().split('T')[0],
    bedtime: '23:00',
    wake_time: '07:00',
    sleep_quality: Math.floor(Math.random() * 5) + 1,
    notes: 'Test sleep record'
  })
};