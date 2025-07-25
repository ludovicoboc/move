# Supabase Dashboard E2E Tests

Comprehensive end-to-end test suite for the Supabase Dashboard Application, designed to validate all functionalities identified in the system audit.

## Overview

This test suite covers all major modules of the application:
- 🔐 **Authentication** - Login/registration flows
- 👤 **Profile** - User settings and preferences
- 💰 **Finance** - Expense tracking and budget management
- 🏥 **Health** - Medication and mood monitoring
- 🎯 **Hyperfocus** - Focus management tools
- 🎮 **Leisure** - Activity and rest management
- 🍽️ **Recipes** - Recipe management and import
- 🧠 **Self-Awareness** - Reflection and analysis tools
- 😴 **Sleep** - Sleep tracking and hygiene
- 📚 **Studies** - Pomodoro timer and study management

## Quick Start

### Prerequisites

- Node.js 18 or higher
- A running instance of the Supabase Dashboard Application
- Test user account in your Supabase project

### Installation

1. Navigate to the e2e directory:
   ```bash
   cd e2e
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

4. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Running Tests

#### Using the Test Runner Script (Recommended)

```bash
# Run all tests
./run-tests.sh

# Run specific module tests
./run-tests.sh auth
./run-tests.sh profile
./run-tests.sh finance

# Run tests in headed mode (visible browser)
./run-tests.sh --headed

# Run tests with debug mode
./run-tests.sh --debug profile

# Run only smoke tests
./run-tests.sh smoke

# Run on specific browser
./run-tests.sh --chromium finance
```

#### Using NPM Scripts

```bash
# Run all tests
npm test

# Run specific test files
npm run test:auth
npm run test:profile
npm run test:finance
npm run test:health
npm run test:studies

# Run with UI mode
npm run test:ui

# Run in headed mode
npm run test:headed

# Run on mobile devices
npm run test:mobile
```

#### Using Playwright CLI Directly

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/01-authentication.spec.ts

# Run with specific browser
npx playwright test --project=chromium

# Run with retries
npx playwright test --retries=2

# Run in parallel with specific worker count
npx playwright test --workers=4
```

## Test Structure

### Test Files

- `01-authentication.spec.ts` - Authentication flows and session management
- `02-profile.spec.ts` - Profile management and settings
- `03-finance.spec.ts` - Finance module functionality
- `04-health.spec.ts` - Health tracking features
- `05-food.spec.ts` - Nutrition and meal planning
- `06-hyperfocus.spec.ts` - Focus management tools
- `07-leisure.spec.ts` - Leisure activity management
- `08-recipes.spec.ts` - Recipe management and import
- `09-self-awareness.spec.ts` - Self-reflection tools
- `10-sleep.spec.ts` - Sleep tracking and hygiene
- `11-studies.spec.ts` - Study tools and Pomodoro timer
- `12-integration.spec.ts` - Cross-module integration tests

### Test Categories

Tests are organized into several categories:

#### 🔥 Critical Tests (`@critical`)
Essential functionality that must work for the app to be usable:
- User authentication
- Core CRUD operations
- Data persistence
- Navigation between modules

#### 💨 Smoke Tests (`@smoke`)
Quick validation tests for basic functionality:
- Page loading
- Main components visibility
- Basic user flows

#### 📱 Responsive Tests
Tests that validate the application works across different screen sizes:
- Mobile (375x667)
- Tablet (768x1024)
- Desktop (1920x1080)

#### ♿ Accessibility Tests
Tests that ensure the application is accessible:
- Keyboard navigation
- Screen reader compatibility
- ARIA attributes
- Color contrast

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Application URL
BASE_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Test User Credentials
TEST_USER_EMAIL=test.user@example.com
TEST_USER_PASSWORD=TestPassword123!
```

### Playwright Configuration

The test suite is configured in `playwright.config.ts` with:

- **Multiple Browsers**: Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Parallel Execution**: Configurable worker count
- **Retry Logic**: Automatic retry on failure
- **Screenshots**: On failure
- **Video Recording**: On retry
- **Trace Files**: For debugging

## Test Data Management

### Test Data Generation

The test suite includes utilities for generating test data:

```typescript
import { generateTestData } from '../utils/test-helpers';

const expense = generateTestData.expense();
const recipe = generateTestData.recipe();
const medication = generateTestData.medication();
```

### Data Cleanup

Tests automatically clean up data after execution to prevent interference between test runs. The cleanup includes:

- User-generated test data
- Temporary files
- Browser cache and storage

## Reporting

### HTML Reports

After test execution, an HTML report is generated at:
```
test-results/html-report/index.html
```

The report includes:
- Test results summary
- Detailed test execution logs
- Screenshots of failures
- Trace files for debugging

### JSON Reports

Machine-readable test results are available at:
```
test-results/results.json
```

### JUnit Reports

For CI/CD integration:
```
test-results/junit.xml
```

## Debugging Tests

### Debug Mode

Run tests in debug mode to step through test execution:

```bash
./run-tests.sh --debug profile
```

### UI Mode

Use Playwright's UI mode for interactive debugging:

```bash
npm run test:ui
```

### Trace Viewer

View detailed execution traces:

```bash
npx playwright show-trace test-results/trace.zip
```

### Screenshots and Videos

Test artifacts are saved in `test-results/` directory:
- Screenshots on failure
- Videos on retry
- Trace files for debugging

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd e2e
          npm install
          npx playwright install --with-deps
          
      - name: Run E2E tests
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
        run: |
          cd e2e
          ./run-tests.sh
          
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: e2e/test-results/
```

## Best Practices

### Writing Tests

1. **Use Page Object Model**: Encapsulate page interactions in helper methods
2. **Independent Tests**: Each test should be able to run independently
3. **Descriptive Names**: Test names should clearly describe what is being tested
4. **Proper Cleanup**: Always clean up test data after execution
5. **Assertions**: Use appropriate assertions for better error messages

### Test Data

1. **Generate Dynamic Data**: Use random data to avoid conflicts
2. **Clean State**: Start each test with a clean state
3. **Realistic Data**: Use data that represents real user scenarios
4. **Edge Cases**: Test boundary conditions and edge cases

### Performance

1. **Parallel Execution**: Run tests in parallel when possible
2. **Selective Testing**: Use tags to run only necessary tests
3. **Efficient Selectors**: Use efficient CSS selectors and data attributes
4. **Minimize Waits**: Use smart waiting strategies

## Troubleshooting

### Common Issues

#### Tests Timing Out
- Increase timeout in playwright.config.ts
- Check if application is running and accessible
- Verify network connectivity

#### Authentication Failures
- Verify test user credentials in .env
- Check if test user exists in Supabase
- Ensure test user has proper permissions

#### Data Conflicts
- Run tests with cleanup enabled
- Use unique test data for each run
- Check database state between test runs

#### Browser Issues
- Update Playwright browsers: `npx playwright install`
- Try running on different browsers
- Check browser compatibility

### Debug Commands

```bash
# Check Playwright installation
npx playwright --version

# List installed browsers
npx playwright show

# Run doctor to check setup
npx playwright doctor

# Generate test code
npx playwright codegen http://localhost:3000
```

## Contributing

### Adding New Tests

1. Create new test file in `tests/` directory
2. Follow existing naming convention: `XX-module.spec.ts`
3. Use helper functions from `utils/test-helpers.ts`
4. Add appropriate test tags (@smoke, @critical, etc.)
5. Update this README if adding new test categories

### Test Utilities

Extend `utils/test-helpers.ts` with reusable functions:

```typescript
export class TestHelpers {
  // Add new helper methods here
  async customAction() {
    // Implementation
  }
}
```

### Reporting Issues

If you find issues with the tests:
1. Check existing issues in the repository
2. Provide detailed description of the problem
3. Include test output and error messages
4. Specify browser and environment details

## License

This test suite is part of the Supabase Dashboard Application project and follows the same licensing terms.