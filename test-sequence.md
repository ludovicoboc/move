# Test Sequence for Supabase Dashboard Application

## Overview
This test sequence covers all major functionalities identified in the audit files for the Supabase Dashboard Application. The application is designed for individuals with ADHD/neurodivergent needs and includes modules for finance, food/nutrition, health, hyperfocus, leisure, authentication, profile, recipes, self-awareness, sleep, and studies.

## Prerequisites
- Application deployed and accessible
- Valid user account for testing
- Modern browser with JavaScript enabled
- Notifications permission (for timer and reminder features)

---

## 1. Authentication Module Tests

### 1.1 Login Functionality
**Test Case**: Verify user can log in with valid credentials
- [ ] Navigate to `/auth/login`
- [ ] Enter valid email and password
- [ ] Click "Entrar" button
- [ ] Verify redirect to main dashboard
- [ ] Verify user session is established

### 1.2 Registration Functionality
**Test Case**: Verify new user registration
- [ ] Navigate to `/auth/login`
- [ ] Toggle to "Cadastro" mode
- [ ] Enter valid email and password
- [ ] Click "Criar Conta" button
- [ ] Verify email confirmation message appears
- [ ] Check email for confirmation link

### 1.3 Session Management
**Test Case**: Verify session persistence and logout
- [ ] Log in successfully
- [ ] Refresh the page
- [ ] Verify user remains logged in
- [ ] Log out from any page
- [ ] Verify redirect to login page
- [ ] Try accessing protected pages - should redirect to login

---

## 2. Profile Module Tests

### 2.1 Basic Information Management
**Test Case**: User can update basic profile information
- [ ] Navigate to `/profile`
- [ ] Click on "Básico" tab
- [ ] Edit name, bio, timezone, and language
- [ ] Save changes
- [ ] Verify data persistence after page refresh

### 2.2 Accessibility Preferences
**Test Case**: Accessibility settings work correctly
- [ ] Navigate to "Acessibilidade" tab
- [ ] Toggle high contrast mode
- [ ] Adjust text size settings
- [ ] Enable screen reader support
- [ ] Test motion reduction settings
- [ ] Verify changes are applied immediately

### 2.3 Theme Customization
**Test Case**: Theme preferences are applied
- [ ] Navigate to "Tema" tab
- [ ] Switch between light/dark modes
- [ ] Customize primary colors
- [ ] Test theme persistence across page reloads

### 2.4 Daily Goals Settings
**Test Case**: Goals can be configured and tracked
- [ ] Navigate to "Metas" tab
- [ ] Set daily goals for different categories
- [ ] Save settings
- [ ] Verify goals appear on relevant module pages

### 2.5 Data Management
**Test Case**: User can export and manage their data
- [ ] Navigate to "Dados" tab
- [ ] Request data export
- [ ] Verify export request is logged
- [ ] Test data deletion with proper confirmations

---

## 3. Finance Module Tests

### 3.1 Expense Tracking
**Test Case**: User can track expenses by category
- [ ] Navigate to `/finance`
- [ ] View expense tracker section
- [ ] Verify categories are loaded (Moradia, Alimentação, etc.)
- [ ] Check expense totals and percentages display
- [ ] Verify currency formatting (BRL)

### 3.2 Add New Expense
**Test Case**: Expenses can be added with proper validation
- [ ] Click "Add Expense" button
- [ ] Fill in description, amount, date, category
- [ ] Select envelope (if available)
- [ ] Submit expense
- [ ] Verify expense appears in tracker
- [ ] Test envelope limit validation

### 3.3 Virtual Envelopes
**Test Case**: Virtual envelope system works correctly
- [ ] Create new envelope with name, amount, and color
- [ ] Register expenses against the envelope
- [ ] Verify progress bar updates correctly
- [ ] Test limit validation (should prevent overspending)
- [ ] Delete envelope with confirmation

### 3.4 Payment Calendar
**Test Case**: Scheduled payments can be managed
- [ ] Navigate to payment calendar section
- [ ] Create one-time payment
- [ ] Create recurring payment (weekly/monthly/yearly)
- [ ] Mark payment as paid/unpaid
- [ ] Navigate between months
- [ ] Delete payment with confirmation

---

## 4. Food/Nutrition Module Tests

### 4.1 Meal Planning
**Test Case**: Meal planning functionality works
- [ ] Navigate to `/food`
- [ ] View meal planner section
- [ ] Add new meal with time, name, and description
- [ ] Verify meals are organized by time
- [ ] Edit existing meal plan
- [ ] Delete meal plan

### 4.2 Meal Logging
**Test Case**: Meal consumption can be tracked
- [ ] Navigate to meal log section
- [ ] Add consumed meal with optional calories
- [ ] View daily meal history
- [ ] Edit meal log entry
- [ ] Delete meal log entry

### 4.3 Hydration Tracking
**Test Case**: Hydration reminder works correctly
- [ ] View hydration section
- [ ] Add glasses of water consumed
- [ ] Verify progress bar updates (target: 8 glasses)
- [ ] Test goal achievement notification
- [ ] Adjust daily water goal
- [ ] View hydration tips

---

## 5. Health Module Tests

### 5.1 Medication Management
**Test Case**: Medications can be tracked and managed
- [ ] Navigate to `/health`
- [ ] Add new medication with dosage and frequency
- [ ] Set medication times and schedules
- [ ] Mark doses as taken
- [ ] View adherence statistics
- [ ] Edit medication details
- [ ] Delete medication with confirmation

### 5.2 Mood Monitoring
**Test Case**: Mood tracking functionality works
- [ ] Navigate to mood monitoring section
- [ ] Record mood score (1-10)
- [ ] Add activities and triggers
- [ ] Record energy, sleep, and stress levels
- [ ] View mood calendar
- [ ] View mood history
- [ ] Analyze mood trends

---

## 6. Hyperfocus Module Tests

### 6.1 Interest Converter
**Test Case**: Interests can be converted to structured hyperfocus
- [ ] Navigate to `/hyperfocus`
- [ ] Go to "Conversor de Interesses" tab
- [ ] Create new hyperfocus with title, description, color
- [ ] Add multiple tasks dynamically
- [ ] Set time limits
- [ ] Save hyperfocus
- [ ] Verify creation triggers refresh

### 6.2 Toggle System
**Test Case**: Hyperfocus alternation system works
- [ ] Navigate to "Sistema de Alternância" tab
- [ ] Create toggle session with minimum 2 hyperfocus
- [ ] Configure session and break durations
- [ ] Start toggle session
- [ ] Verify automatic switching between focus areas
- [ ] Stop session
- [ ] View session progress

### 6.3 Project Viewer
**Test Case**: Project hierarchy is displayed correctly
- [ ] Navigate to "Estrutura de Projetos" tab
- [ ] View projects organized by hyperfocus
- [ ] Check project status indicators (active, paused, completed)
- [ ] View project milestones
- [ ] Test project progress indicators

### 6.4 Focus Timer
**Test Case**: Focus timer functionality works
- [ ] Navigate to "Temporizador" tab
- [ ] Select hyperfocus for session
- [ ] Set custom time or use hyperfocus default
- [ ] Start timer and verify countdown
- [ ] Test pause/resume functionality
- [ ] Complete session and verify browser notification
- [ ] Verify session is saved to database

---

## 7. Leisure Module Tests

### 7.1 Leisure Timer
**Test Case**: Timer for leisure activities works
- [ ] Navigate to `/leisure`
- [ ] Use leisure timer with presets (5, 15, 30, 45, 60, 90 minutes)
- [ ] Set custom duration
- [ ] Start timer with optional activity selection
- [ ] Complete session and verify notification
- [ ] Verify session is saved

### 7.2 Activity Management
**Test Case**: Leisure activities can be managed
- [ ] View leisure activities section
- [ ] Create new activity with all attributes (category, difficulty, location, equipment, energy, mood boost)
- [ ] Mark activity as favorite
- [ ] Edit activity details
- [ ] Delete activity
- [ ] Filter activities by category
- [ ] View activity statistics

### 7.3 Rest Suggestions
**Test Case**: Rest suggestion system works
- [ ] View rest suggestions section
- [ ] Generate random rest suggestion
- [ ] View suggestion details (instructions, benefits, duration)
- [ ] Create custom rest suggestion
- [ ] Edit custom suggestion
- [ ] Delete custom suggestion
- [ ] Filter suggestions by category

---

## 8. Recipes Module Tests

### 8.1 Recipe CRUD Operations
**Test Case**: Full recipe management works
- [ ] Navigate to `/recipes`
- [ ] Create new recipe with all fields (name, category, description, prep time, servings, calories, tags)
- [ ] Add ingredients dynamically
- [ ] Add step-by-step instructions
- [ ] Save recipe
- [ ] Edit existing recipe
- [ ] Delete recipe with confirmation

### 8.2 Recipe Search and Filtering
**Test Case**: Search and filter functionality works
- [ ] Use search bar to find recipes by name
- [ ] Search by ingredient
- [ ] Filter by category using dropdown
- [ ] Combine search and category filters
- [ ] Verify results update in real-time

### 8.3 Recipe Import
**Test Case**: JSON import functionality works
- [ ] Navigate to recipe importer
- [ ] Upload valid JSON file with multiple recipes
- [ ] Verify import progress feedback
- [ ] Check that recipes are created correctly
- [ ] Test error handling with invalid JSON
- [ ] Verify partial imports work (some recipes fail, others succeed)

### 8.4 Category Management
**Test Case**: Recipe categories work correctly
- [ ] View available categories (Café da Manhã, Almoço, Jantar, etc.)
- [ ] Filter recipes by each category
- [ ] Verify category assignments in recipe forms

---

## 9. Self-Awareness Module Tests

### 9.1 Organized Notes
**Test Case**: Self-awareness notes can be managed
- [ ] Navigate to `/self-awareness`
- [ ] Go to organized notes section
- [ ] Create note with category, tags, and mood rating
- [ ] Search notes by title, content, and tags
- [ ] Filter notes by category
- [ ] Edit note content
- [ ] Delete note

### 9.2 Refuge Mode
**Test Case**: Refuge mode for overwhelming moments works
- [ ] Navigate to refuge mode section
- [ ] Start refuge session with trigger description
- [ ] Use accessibility settings (animations, contrast, text)
- [ ] Select coping strategies
- [ ] Complete session with effectiveness rating
- [ ] Verify session is saved with duration

### 9.3 Reflective Journal
**Test Case**: Reflective journaling works
- [ ] Navigate to reflective journal section
- [ ] Use random prompt for reflection
- [ ] Create custom prompt
- [ ] Write journal entry with mood before/after
- [ ] Add insights and learnings
- [ ] View recent reflections
- [ ] View reflection history

### 9.4 Self-Analysis Tools
**Test Case**: Metrics tracking and analysis works
- [ ] Navigate to self-analysis section
- [ ] Record metrics for different types (humor, energia, estresse, etc.)
- [ ] View metrics with different time periods (week, month, quarter)
- [ ] Analyze trends and averages
- [ ] View analytical summary
- [ ] Filter metrics by type

---

## 10. Sleep Module Tests

### 10.1 Sleep Recording
**Test Case**: Sleep data can be recorded and tracked
- [ ] Navigate to `/sleep`
- [ ] Go to "Registrar Sono" tab
- [ ] Record comprehensive sleep data (bedtime, wake time, quality, environment, etc.)
- [ ] Include optional factors (caffeine, exercise, screen time, stress)
- [ ] Add sleep notes
- [ ] Save sleep record
- [ ] View recent sleep records (last 7 days)

### 10.2 Sleep Visualization
**Test Case**: Sleep data visualization works
- [ ] Navigate to "Visualizar Sono" tab
- [ ] View weekly sleep calendar with quality indicators
- [ ] Navigate between different weeks
- [ ] View calculated statistics (average duration, quality, efficiency, consistency)
- [ ] Identify best and worst sleep days
- [ ] Check sleep score calculation

### 10.3 Sleep Reminders
**Test Case**: Sleep reminder system works
- [ ] Navigate to "Lembretes" tab
- [ ] Create bedtime reminder with specific time and days
- [ ] Create wake-up reminder
- [ ] Configure reminder for specific days of week
- [ ] Activate/deactivate reminders
- [ ] Edit existing reminders
- [ ] Delete reminders

### 10.4 Sleep Hygiene Tips
**Test Case**: Personalized sleep tips work
- [ ] Navigate to "Dicas" tab
- [ ] View general sleep hygiene tips
- [ ] View personalized tips based on sleep patterns
- [ ] Check sleep score calculation (0-100 points)
- [ ] Filter tips by category (environment, routine, lifestyle, diet)
- [ ] Verify tips are relevant to recent sleep data

---

## 11. Studies Module Tests

### 11.1 Pomodoro Timer
**Test Case**: Study timer with Pomodoro technique works
- [ ] Navigate to `/studies`
- [ ] Configure Pomodoro settings (focus, short break, long break durations)
- [ ] Start focus session with required subject/topic
- [ ] Complete focus session and verify break starts automatically
- [ ] Test pause/resume functionality
- [ ] Complete full Pomodoro cycle
- [ ] Verify sessions are saved to database

### 11.2 Study Log
**Test Case**: Study session tracking works
- [ ] View study log section
- [ ] See daily study sessions
- [ ] View total time studied and session count
- [ ] Check session details (subject, duration, type)
- [ ] Verify data updates after completing Pomodoro sessions

### 11.3 Exam Management
**Test Case**: Exam scheduling and tracking works
- [ ] Navigate to exam management section
- [ ] Create new exam with name, date, institution
- [ ] View next upcoming exam highlighted
- [ ] Edit exam details
- [ ] Change exam status (planned, in_progress, completed)
- [ ] Delete exam with confirmation
- [ ] View status badges (hoje, esta semana, etc.)

### 11.4 Study Materials
**Test Case**: Study materials organization works
- [ ] Navigate to study materials section
- [ ] View materials organized by 8 categories
- [ ] Add new material to specific category
- [ ] Toggle simplified mode view
- [ ] Expand categories to view materials
- [ ] View material counters per category
- [ ] Edit material details
- [ ] Delete materials

### 11.5 Study Preferences
**Test Case**: Study preferences can be configured
- [ ] Access study settings
- [ ] Modify Pomodoro durations
- [ ] Toggle simplified mode
- [ ] Set daily study goals
- [ ] Enable/disable notifications
- [ ] Save preferences
- [ ] Verify preferences persist across sessions

---

## 12. Cross-Module Integration Tests

### 12.1 Navigation Between Modules
**Test Case**: Seamless navigation works across all modules
- [ ] Use sidebar navigation to visit each module
- [ ] Verify breadcrumbs work correctly
- [ ] Test quick navigation shortcuts
- [ ] Verify user context is maintained across modules

### 12.2 Data Consistency
**Test Case**: User data is consistent across modules
- [ ] Create data in one module (e.g., set daily goals in profile)
- [ ] Verify data appears correctly in related modules
- [ ] Test data synchronization after updates
- [ ] Verify user preferences affect all relevant modules

### 12.3 Responsive Design
**Test Case**: Application works on different screen sizes
- [ ] Test desktop layout (1920x1080)
- [ ] Test tablet layout (768x1024)
- [ ] Test mobile layout (375x667)
- [ ] Verify sidebar collapses appropriately
- [ ] Test touch interactions on mobile
- [ ] Verify all functionality remains accessible

### 12.4 Notification System
**Test Case**: Browser notifications work across modules
- [ ] Enable browser notifications
- [ ] Test timer completion notifications (hyperfocus, leisure, studies)
- [ ] Test hydration goal notifications
- [ ] Test sleep reminder notifications
- [ ] Verify notifications work when tab is not active

---

## 13. Error Handling and Edge Cases

### 13.1 Network Connectivity
**Test Case**: Application handles network issues gracefully
- [ ] Simulate slow network connection
- [ ] Test offline behavior
- [ ] Verify loading states display correctly
- [ ] Test error messages for failed operations
- [ ] Verify data persistence after network recovery

### 13.2 Data Validation
**Test Case**: Input validation works correctly
- [ ] Test required field validation across all forms
- [ ] Test data type validation (numbers, dates, emails)
- [ ] Test maximum length validation for text fields
- [ ] Test special character handling
- [ ] Verify error messages are clear and helpful

### 13.3 Browser Compatibility
**Test Case**: Application works across browsers
- [ ] Test in Chrome (latest)
- [ ] Test in Firefox (latest)
- [ ] Test in Safari (latest)
- [ ] Test in Edge (latest)
- [ ] Verify core functionality works in all browsers

---

## 14. Performance Tests

### 14.1 Page Load Performance
**Test Case**: Pages load within acceptable time limits
- [ ] Measure initial page load time
- [ ] Test navigation speed between modules
- [ ] Verify skeleton loading states appear quickly
- [ ] Test with large amounts of user data

### 14.2 Memory Usage
**Test Case**: Application doesn't have memory leaks
- [ ] Monitor memory usage during extended use
- [ ] Test timer cleanup (ensure intervals are cleared)
- [ ] Verify component unmounting cleans up properly
- [ ] Test with multiple tabs open

---

## 15. Security Tests

### 15.1 Authentication Security
**Test Case**: Authentication is secure
- [ ] Verify sessions expire appropriately
- [ ] Test invalid session handling
- [ ] Verify protected routes redirect to login
- [ ] Test password field masking

### 15.2 Data Privacy
**Test Case**: User data is properly isolated
- [ ] Create two user accounts
- [ ] Verify users can only see their own data
- [ ] Test data isolation across all modules
- [ ] Verify RLS (Row Level Security) is working

---

## Test Execution Guidelines

### Before Testing
1. Ensure clean test environment
2. Clear browser cache and cookies
3. Create fresh test user account
4. Have sample data ready for import tests

### During Testing
1. Document any bugs or issues found
2. Take screenshots of unexpected behavior
3. Note performance issues or slow operations
4. Record browser console errors

### After Testing
1. Clean up test data
2. Document test results
3. Report critical issues immediately
4. Provide feedback on user experience

---

## Success Criteria

The application passes testing if:
- [ ] All core CRUD operations work correctly
- [ ] Authentication and authorization function properly
- [ ] Data persistence works across browser sessions
- [ ] Responsive design works on different screen sizes
- [ ] Timer and notification features work reliably
- [ ] No critical security vulnerabilities are found
- [ ] Performance is acceptable for typical use cases
- [ ] Error handling provides helpful feedback to users

---

## Priority Levels

**P1 (Critical)**: Authentication, data persistence, core CRUD operations
**P2 (High)**: Timer functionality, navigation, responsive design
**P3 (Medium)**: Advanced features, analytics, import/export
**P4 (Low)**: Cosmetic issues, minor UX improvements

This comprehensive test sequence covers all major functionalities identified in the audit files and ensures the application meets its requirements for supporting individuals with ADHD and neurodivergent needs.