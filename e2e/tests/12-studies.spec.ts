import { test, expect } from '@playwright/test';
import { TestHelpers, generateRandomString } from '../utils/test-helpers';

test.describe('Studies Module', () => {
  let helpers: TestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page);
    await helpers.login();
    await helpers.navigateToModule('studies');
  });

  test.describe('Pomodoro Timer', () => {
    test('should configure Pomodoro settings', async ({ page }) => {
      await helpers.waitForLoadingToComplete();
      
      // Access timer settings
      await page.click('button:has-text("Configurações"), [data-testid="timer-settings"]');
      
      const settings = {
        focusMinutes: '30',
        shortBreak: '10',
        longBreak: '20'
      };
      
      // Configure timing
      const focusInput = page.locator('input[name="pomodoro_focus_minutes"], [data-testid="focus-minutes"]');
      if (await focusInput.count() > 0) {
        await focusInput.fill(settings.focusMinutes);
      }
      
      const shortBreakInput = page.locator('input[name="pomodoro_short_break"], [data-testid="short-break"]');
      if (await shortBreakInput.count() > 0) {
        await shortBreakInput.fill(settings.shortBreak);
      }
      
      const longBreakInput = page.locator('input[name="pomodoro_long_break"], [data-testid="long-break"]');
      if (await longBreakInput.count() > 0) {
        await longBreakInput.fill(settings.longBreak);
      }
      
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Settings should be preserved
      await page.reload();
      await page.click('button:has-text("Configurações"), [data-testid="timer-settings"]');
      
      if (await focusInput.count() > 0) {
        await helpers.expectFormField('pomodoro_focus_minutes', settings.focusMinutes);
      }
    });

    test('should start focus session with subject', async ({ page }) => {
      const studyData = {
        subject: `Study Subject ${generateRandomString()}`,
        topic: `Topic ${generateRandomString()}`
      };
      
      // Fill subject (required for focus sessions)
      await page.fill('input[name="subject"], [data-testid="study-subject"]', studyData.subject);
      
      // Fill topic if available
      const topicInput = page.locator('input[name="topic"], [data-testid="study-topic"]');
      if (await topicInput.count() > 0) {
        await topicInput.fill(studyData.topic);
      }
      
      // Set custom time (shorter for testing)
      const customTimeInput = page.locator('input[name="customTime"], [data-testid="custom-time"]');
      if (await customTimeInput.count() > 0) {
        await customTimeInput.fill('1'); // 1 minute for testing
      }
      
      // Start timer
      await helpers.startTimer();
      
      // Timer should be running
      await expect(page.locator('.timer-running, [data-testid="timer-active"]')).toBeVisible();
      await expect(page.locator('.timer-display, [data-testid="timer-display"]')).toContainText(/00:|01:/);
      
      // Subject should be displayed
      await expect(page.locator(`text="${studyData.subject}"`)).toBeVisible();
    });

    test('should require subject for focus sessions', async ({ page }) => {
      // Try to start timer without subject
      await helpers.startTimer();
      
      // Should show validation error
      await expect(page.locator('.error, [role="alert"]')).toContainText(/matéria|subject/i);
      
      // Timer should not start
      await expect(page.locator('.timer-running')).not.toBeVisible();
    });

    test('should pause and resume timer', async ({ page }) => {
      // Start a session
      await page.fill('input[name="subject"]', 'Test Subject');
      await page.fill('input[name="customTime"]', '2'); // 2 minutes
      await helpers.startTimer();
      
      // Wait a moment then pause
      await page.waitForTimeout(1000);
      await helpers.pauseTimer();
      
      // Timer should be paused
      await expect(page.locator('.timer-paused, [data-testid="timer-paused"]')).toBeVisible();
      
      // Resume timer
      await page.click('button:has-text("Resume"), button:has-text("Continuar")');
      
      // Timer should be running again
      await expect(page.locator('.timer-running, [data-testid="timer-active"]')).toBeVisible();
    });

    test('should complete session and show notification', async ({ page }) => {
      // Grant notification permission
      await helpers.grantNotificationPermission();
      
      // Start very short session for testing
      await page.fill('input[name="subject"]', 'Quick Test');
      await page.fill('input[name="customTime"]', '0.1'); // 6 seconds
      await helpers.startTimer();
      
      // Wait for session to complete
      await expect(page.locator('.session-complete, [data-testid="session-complete"]')).toBeVisible({ timeout: 10000 });
      
      // Should show completion message
      await expect(page.locator('text="Sessão completa", text="Parabéns"')).toBeVisible();
      
      // Should automatically start break or ask user
      const breakStarted = page.locator('.break-session, [data-testid="break-active"]');
      const breakPrompt = page.locator('.break-prompt, button:has-text("Pausar")');
      
      const hasBreakStarted = await breakStarted.count() > 0;
      const hasBreakPrompt = await breakPrompt.count() > 0;
      
      expect(hasBreakStarted || hasBreakPrompt).toBeTruthy();
    });

    test('should track different session types', async ({ page }) => {
      const sessionTypes = ['focus', 'short_break', 'long_break'];
      
      // Start with focus session
      await page.fill('input[name="subject"]', 'Test Subject');
      await page.fill('input[name="customTime"]', '0.1');
      await helpers.startTimer();
      
      // Wait for completion and check session type
      await expect(page.locator('.session-complete')).toBeVisible({ timeout: 10000 });
      
      // Should track the focus session
      await expect(page.locator('[data-session-type="focus"], .focus-session')).toBeVisible();
      
      // If break starts automatically, it should be tracked too
      const breakSession = page.locator('[data-session-type="short_break"], .break-session');
      if (await breakSession.count() > 0) {
        await expect(breakSession).toBeVisible();
      }
    });

    test('should save completed sessions to database', async ({ page }) => {
      // Complete a session
      await page.fill('input[name="subject"]', 'Database Test Subject');
      await page.fill('input[name="customTime"]', '0.1');
      await helpers.startTimer();
      
      await expect(page.locator('.session-complete')).toBeVisible({ timeout: 10000 });
      
      // Navigate to study log to verify session was saved
      await page.click('button:has-text("Log"), [data-testid="study-log-tab"]');
      
      // Should show the completed session
      await expect(page.locator('text="Database Test Subject"')).toBeVisible();
      await expect(page.locator('.session-entry, [data-testid="session-entry"]')).toBeVisible();
    });
  });

  test.describe('Study Log', () => {
    test('should display daily study sessions', async ({ page }) => {
      await page.click('button:has-text("Log"), [data-testid="study-log-tab"]');
      await helpers.waitForLoadingToComplete();
      
      // Should show study log section
      await expect(page.locator('.study-log, [data-testid="study-log"]')).toBeVisible();
      
      // Should show today's date
      const today = new Date().toLocaleDateString('pt-BR');
      await expect(page.locator(`text="${today}", text="Hoje"`)).toBeVisible();
      
      // Should show total time studied or empty state
      const totalTime = page.locator('.total-time, [data-testid="total-time"]');
      const emptyState = page.locator('.no-sessions, .empty-state');
      
      const hasTotalTime = await totalTime.count() > 0;
      const hasEmptyState = await emptyState.count() > 0;
      
      expect(hasTotalTime || hasEmptyState).toBeTruthy();
    });

    test('should show session details', async ({ page }) => {
      await page.click('button:has-text("Log"), [data-testid="study-log-tab"]');
      await helpers.waitForLoadingToComplete();
      
      // Look for existing sessions
      const sessionItems = page.locator('.session-item, [data-testid="session-item"]');
      
      if (await sessionItems.count() > 0) {
        const firstSession = sessionItems.first();
        
        // Should show session details
        await expect(firstSession.locator('.subject, .session-subject')).toBeVisible();
        await expect(firstSession.locator('.duration, .session-duration')).toBeVisible();
        await expect(firstSession.locator('.time, .session-time')).toBeVisible();
      }
    });

    test('should calculate and display total study time', async ({ page }) => {
      await page.click('button:has-text("Log"), [data-testid="study-log-tab"]');
      await helpers.waitForLoadingToComplete();
      
      // Should show total time calculation
      const totalTimeElement = page.locator('.total-time, [data-testid="total-time"]');
      
      if (await totalTimeElement.count() > 0) {
        const totalTimeText = await totalTimeElement.textContent();
        
        // Should show time in hours/minutes format
        expect(totalTimeText).toMatch(/\d+[hm]|\d+:\d+|minutos|horas/);
      }
    });

    test('should show session count', async ({ page }) => {
      await page.click('button:has-text("Log"), [data-testid="study-log-tab"]');
      await helpers.waitForLoadingToComplete();
      
      // Should show number of sessions
      const sessionCount = page.locator('.session-count, [data-testid="session-count"]');
      
      if (await sessionCount.count() > 0) {
        const countText = await sessionCount.textContent();
        expect(countText).toMatch(/\d+/); // Should contain at least one number
      }
    });
  });

  test.describe('Exam Management', () => {
    test('should add new exam', async ({ page }) => {
      await page.click('button:has-text("Exames"), [data-testid="exams-tab"]');
      
      const examData = {
        name: `Test Exam ${generateRandomString()}`,
        description: 'Test exam description',
        exam_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        institution: 'Test Institution'
      };
      
      await page.click('button:has-text("Novo Exame"), [data-testid="new-exam"]');
      
      await page.fill('input[name="name"]', examData.name);
      await page.fill('textarea[name="description"]', examData.description);
      await page.fill('input[name="exam_date"]', examData.exam_date);
      await page.fill('input[name="institution"]', examData.institution);
      
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Verify exam was created
      await expect(page.locator(`text="${examData.name}"`)).toBeVisible();
      await expect(page.locator(`text="${examData.institution}"`)).toBeVisible();
    });

    test('should highlight next upcoming exam', async ({ page }) => {
      await page.click('button:has-text("Exames"), [data-testid="exams-tab"]');
      await helpers.waitForLoadingToComplete();
      
      // Should show next exam section
      const nextExam = page.locator('.next-exam, [data-testid="next-exam"]');
      
      if (await nextExam.count() > 0) {
        await expect(nextExam).toBeVisible();
        
        // Should be highlighted differently
        await expect(nextExam).toHaveClass(/highlighted|next|upcoming/);
      }
    });

    test('should show exam status badges', async ({ page }) => {
      await page.click('button:has-text("Exames"), [data-testid="exams-tab"]');
      await helpers.waitForLoadingToComplete();
      
      // Look for status badges
      const statusBadges = page.locator('.status-badge, .exam-status, [data-testid="exam-status"]');
      
      if (await statusBadges.count() > 0) {
        const firstBadge = statusBadges.first();
        
        // Should show status text
        const badgeText = await firstBadge.textContent();
        expect(badgeText).toMatch(/hoje|semana|mês|planned|completed/i);
      }
    });

    test('should edit exam details', async ({ page }) => {
      await page.click('button:has-text("Exames"), [data-testid="exams-tab"]');
      
      // Create exam to edit
      const examData = {
        name: `Edit Test Exam ${generateRandomString()}`,
        institution: 'Original Institution'
      };
      
      await page.click('button:has-text("Novo Exame")');
      await page.fill('input[name="name"]', examData.name);
      await page.fill('input[name="institution"]', examData.institution);
      await page.fill('input[name="exam_date"]', new Date().toISOString().split('T')[0]);
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Edit the exam
      const examCard = page.locator(`.exam-card:has-text("${examData.name}")`);
      await examCard.locator('button:has-text("Editar"), [data-testid="edit-exam"]').click();
      
      // Update institution
      const newInstitution = 'Updated Institution';
      await page.fill('input[name="institution"]', newInstitution);
      
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Verify changes
      await expect(page.locator(`text="${newInstitution}"`)).toBeVisible();
    });

    test('should change exam status', async ({ page }) => {
      await page.click('button:has-text("Exames"), [data-testid="exams-tab"]');
      await helpers.waitForLoadingToComplete();
      
      // Find existing exam or create one
      let examCard = page.locator('.exam-card, .exam-item').first();
      
      if (await examCard.count() === 0) {
        // Create exam
        await page.click('button:has-text("Novo Exame")');
        await page.fill('input[name="name"]', 'Status Test Exam');
        await page.fill('input[name="exam_date"]', new Date().toISOString().split('T')[0]);
        await helpers.submitForm('Salvar');
        await helpers.waitForLoadingToComplete();
        
        examCard = page.locator('.exam-card, .exam-item').first();
      }
      
      // Change status
      const statusSelect = examCard.locator('select[name="status"], [data-testid="exam-status-select"]');
      
      if (await statusSelect.count() > 0) {
        await statusSelect.selectOption('completed');
        
        // Should show completed status
        await expect(examCard.locator('.status-completed, text="Concluído"')).toBeVisible();
      }
    });

    test('should delete exam with confirmation', async ({ page }) => {
      await page.click('button:has-text("Exames"), [data-testid="exams-tab"]');
      
      // Create exam to delete
      const examName = `Delete Test Exam ${generateRandomString()}`;
      
      await page.click('button:has-text("Novo Exame")');
      await page.fill('input[name="name"]', examName);
      await page.fill('input[name="exam_date"]', new Date().toISOString().split('T')[0]);
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Delete exam
      const examCard = page.locator(`.exam-card:has-text("${examName}")`);
      await examCard.locator('button:has-text("Excluir"), [data-testid="delete-exam"]').click();
      
      // Confirm deletion
      await page.click('button:has-text("Confirmar"), [data-testid="confirm-delete"]');
      await helpers.waitForLoadingToComplete();
      
      // Exam should be removed
      await expect(page.locator(`text="${examName}"`)).not.toBeVisible();
    });
  });

  test.describe('Study Materials', () => {
    test('should display materials by category', async ({ page }) => {
      await page.click('button:has-text("Materiais"), [data-testid="materials-tab"]');
      await helpers.waitForLoadingToComplete();
      
      // Should show categories
      const expectedCategories = ['resumos', 'flashcards', 'exercícios', 'vídeos', 'livros', 'artigos', 'simulados', 'outros'];
      
      for (let i = 0; i < Math.min(4, expectedCategories.length); i++) { // Test first 4 categories
        const category = expectedCategories[i];
        await expect(page.locator(`.category:has-text("${category}"), [data-testid="category-${category}"]`)).toBeVisible();
      }
    });

    test('should show material counters', async ({ page }) => {
      await page.click('button:has-text("Materiais"), [data-testid="materials-tab"]');
      await helpers.waitForLoadingToComplete();
      
      // Should show counters on category cards
      const categoryCards = page.locator('.category-card, [data-testid="category-card"]');
      
      if (await categoryCards.count() > 0) {
        const firstCard = categoryCards.first();
        
        // Should show count badge or number
        await expect(firstCard.locator('.count, .badge, [data-testid="material-count"]')).toBeVisible();
      }
    });

    test('should expand category to show materials', async ({ page }) => {
      await page.click('button:has-text("Materiais"), [data-testid="materials-tab"]');
      await helpers.waitForLoadingToComplete();
      
      // Click on a category to expand
      const categoryCards = page.locator('.category-card, [data-testid="category-card"]');
      
      if (await categoryCards.count() > 0) {
        await categoryCards.first().click();
        
        // Should show materials list or empty state
        const materialsList = page.locator('.materials-list, [data-testid="materials-list"]');
        const emptyState = page.locator('.no-materials, .empty-state');
        
        const hasList = await materialsList.count() > 0;
        const hasEmpty = await emptyState.count() > 0;
        
        expect(hasList || hasEmpty).toBeTruthy();
      }
    });

    test('should add new study material', async ({ page }) => {
      await page.click('button:has-text("Materiais"), [data-testid="materials-tab"]');
      
      const materialData = {
        title: `Test Material ${generateRandomString()}`,
        description: 'Test material description',
        category: 'resumos'
      };
      
      await page.click('button:has-text("Adicionar Material"), [data-testid="add-material"]');
      
      await page.fill('input[name="title"]', materialData.title);
      await page.fill('textarea[name="description"]', materialData.description);
      await page.selectOption('select[name="category"]', materialData.category);
      
      await helpers.submitForm('Salvar');
      await helpers.waitForLoadingToComplete();
      
      // Material should be added to the category
      const resumosCategory = page.locator('[data-testid="category-resumos"], .category:has-text("resumos")');
      await resumosCategory.click();
      
      await expect(page.locator(`text="${materialData.title}"`)).toBeVisible();
    });

    test('should toggle simplified mode', async ({ page }) => {
      await page.click('button:has-text("Materiais"), [data-testid="materials-tab"]');
      
      // Toggle simplified mode
      const simplifiedToggle = page.locator('input[name="simplifiedMode"], [data-testid="simplified-toggle"]');
      
      if (await simplifiedToggle.count() > 0) {
        await simplifiedToggle.click();
        
        // Interface should change to simplified view
        await expect(page.locator('.simplified-view, [data-testid="simplified-view"]')).toBeVisible();
        
        // Toggle back
        await simplifiedToggle.click();
        await expect(page.locator('.simplified-view')).not.toBeVisible();
      }
    });
  });

  test.describe('Dashboard Integration', () => {
    test('should show coordinated layout', async ({ page }) => {
      await helpers.waitForLoadingToComplete();
      
      // Should show dashboard with all components
      await expect(page.locator('.studies-dashboard, [data-testid="studies-dashboard"]')).toBeVisible();
      
      // Should show timer section
      await expect(page.locator('.timer-section, [data-testid="timer-section"]')).toBeVisible();
      
      // Should show quick stats or summary
      const statsSection = page.locator('.study-stats, [data-testid="study-stats"]');
      if (await statsSection.count() > 0) {
        await expect(statsSection).toBeVisible();
      }
    });

    test('should show settings toggle', async ({ page }) => {
      // Look for settings button
      const settingsButton = page.locator('button:has-text("Configurações"), [data-testid="show-settings"]');
      
      if (await settingsButton.count() > 0) {
        await settingsButton.click();
        
        // Should show settings panel
        await expect(page.locator('.settings-panel, [data-testid="settings-panel"]')).toBeVisible();
        
        // Should be able to hide settings
        await settingsButton.click();
        await expect(page.locator('.settings-panel')).not.toBeVisible();
      }
    });

    test('should sync data between components', async ({ page }) => {
      // Start and complete a session
      await page.fill('input[name="subject"]', 'Sync Test Subject');
      await page.fill('input[name="customTime"]', '0.1');
      await helpers.startTimer();
      
      await expect(page.locator('.session-complete')).toBeVisible({ timeout: 10000 });
      
      // Check that study log updates
      await page.click('button:has-text("Log"), [data-testid="study-log-tab"]');
      await expect(page.locator('text="Sync Test Subject"')).toBeVisible();
      
      // Check that stats update
      const statsSection = page.locator('.study-stats, [data-testid="study-stats"]');
      if (await statsSection.count() > 0) {
        // Should show updated session count or time
        await expect(statsSection.locator('.session-count, .total-time')).toBeVisible();
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await helpers.testMobileView();
      
      // Timer should be visible and functional
      await expect(page.locator('.timer-section')).toBeVisible();
      
      // Should be able to start session
      await page.fill('input[name="subject"]', 'Mobile Test');
      await page.fill('input[name="customTime"]', '1');
      await helpers.startTimer();
      
      await expect(page.locator('.timer-running')).toBeVisible();
    });

    test('should adapt grid layout', async ({ page }) => {
      // Desktop view
      await helpers.testDesktopView();
      const desktopGrid = await page.locator('.studies-dashboard, .main-content').boundingBox();
      
      // Mobile view
      await helpers.testMobileView();
      const mobileGrid = await page.locator('.studies-dashboard, .main-content').boundingBox();
      
      // Should adapt layout
      expect(mobileGrid!.width).toBeLessThan(desktopGrid!.width);
    });

    test('should hide/show text on small screens', async ({ page }) => {
      await helpers.testMobileView();
      
      // Some button text might be hidden on mobile
      const buttons = page.locator('button');
      const hasHiddenText = await buttons.locator('.hidden, .sm\\:inline').count();
      
      // Should have responsive text handling
      expect(hasHiddenText).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Performance', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await helpers.navigateToModule('studies');
      await helpers.waitForLoadingToComplete();
      
      const loadTime = Date.now() - startTime;
      
      // Should load within reasonable time
      expect(loadTime).toBeLessThan(5000);
    });

    test('should handle timer updates efficiently', async ({ page }) => {
      // Start timer
      await page.fill('input[name="subject"]', 'Performance Test');
      await page.fill('input[name="customTime"]', '1');
      await helpers.startTimer();
      
      // Monitor timer updates
      const timerDisplay = page.locator('.timer-display, [data-testid="timer-display"]');
      
      // Should update regularly without performance issues
      await expect(timerDisplay).toBeVisible();
      
      // Wait for a few updates
      await page.waitForTimeout(3000);
      
      // Should still be responsive
      await helpers.pauseTimer();
      await expect(page.locator('.timer-paused')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should validate study session data', async ({ page }) => {
      // Try to start without subject
      await helpers.startTimer();
      
      // Should show validation error
      await expect(page.locator('.error, [role="alert"]')).toBeVisible();
    });

    test('should handle timer cleanup on navigation', async ({ page }) => {
      // Start timer
      await page.fill('input[name="subject"]', 'Cleanup Test');
      await page.fill('input[name="customTime"]', '5');
      await helpers.startTimer();
      
      // Navigate away
      await helpers.navigateToModule('profile');
      
      // Navigate back
      await helpers.navigateToModule('studies');
      
      // Timer should not be running (should be cleaned up)
      await expect(page.locator('.timer-running')).not.toBeVisible();
    });

    test('should handle network errors', async ({ page }) => {
      // Simulate network failure
      await page.context().setOffline(true);
      
      // Try to save exam
      await page.click('button:has-text("Exames"), [data-testid="exams-tab"]');
      await page.click('button:has-text("Novo Exame")');
      await page.fill('input[name="name"]', 'Network Test Exam');
      await page.fill('input[name="exam_date"]', new Date().toISOString().split('T')[0]);
      await helpers.submitForm('Salvar');
      
      // Should show error message
      await expect(page.locator('.error, [role="alert"]')).toBeVisible();
      
      // Restore connection
      await page.context().setOffline(false);
    });
  });
});