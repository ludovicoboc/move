#!/bin/bash

# Supabase Dashboard E2E Test Runner
# This script provides various options for running the test suite

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RESULTS_DIR="test-results"
REPORTS_DIR="$RESULTS_DIR/reports"
SCREENSHOTS_DIR="$RESULTS_DIR/screenshots"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
        exit 1
    fi
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_warning "Please update .env file with your configuration before running tests."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Function to setup test environment
setup_environment() {
    print_info "Setting up test environment..."
    
    # Create results directories
    mkdir -p "$RESULTS_DIR"
    mkdir -p "$REPORTS_DIR"
    mkdir -p "$SCREENSHOTS_DIR"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_info "Installing dependencies..."
        npm install
    fi
    
    # Install Playwright browsers
    print_info "Installing Playwright browsers..."
    npx playwright install
    
    print_success "Environment setup complete"
}

# Function to run specific test suite
run_test_suite() {
    local suite=$1
    local options=$2
    
    print_info "Running $suite test suite..."
    
    case $suite in
        "auth"|"authentication")
            npx playwright test tests/01-authentication.spec.ts $options
            ;;
        "profile")
            npx playwright test tests/02-profile.spec.ts $options
            ;;
        "finance")
            npx playwright test tests/03-finance.spec.ts $options
            ;;
        "health")
            npx playwright test tests/04-health.spec.ts $options
            ;;
        "studies")
            npx playwright test tests/12-studies.spec.ts $options
            ;;
        "smoke")
            npx playwright test --grep="@smoke" $options
            ;;
        "critical")
            npx playwright test --grep="@critical" $options
            ;;
        "all"|"")
            npx playwright test $options
            ;;
        *)
            print_error "Unknown test suite: $suite"
            print_info "Available suites: auth, profile, finance, health, studies, smoke, critical, all"
            exit 1
            ;;
    esac
}

# Function to generate and display reports
generate_reports() {
    print_info "Generating test reports..."
    
    # Open HTML report if it exists
    if [ -f "$RESULTS_DIR/html-report/index.html" ]; then
        print_success "HTML report generated: $RESULTS_DIR/html-report/index.html"
        
        # Try to open report automatically
        if command -v xdg-open &> /dev/null; then
            xdg-open "$RESULTS_DIR/html-report/index.html"
        elif command -v open &> /dev/null; then
            open "$RESULTS_DIR/html-report/index.html"
        fi
    fi
    
    # Display summary if JSON report exists
    if [ -f "$RESULTS_DIR/results.json" ]; then
        print_info "Test results summary available in: $RESULTS_DIR/results.json"
    fi
}

# Function to cleanup test artifacts
cleanup() {
    print_info "Cleaning up test artifacts..."
    
    if [ -d "$RESULTS_DIR" ]; then
        rm -rf "$RESULTS_DIR"
        print_success "Test artifacts cleaned up"
    fi
}

# Function to display help
show_help() {
    echo "Supabase Dashboard E2E Test Runner"
    echo ""
    echo "Usage: $0 [OPTIONS] [TEST_SUITE]"
    echo ""
    echo "TEST_SUITES:"
    echo "  auth, authentication  Run authentication tests"
    echo "  profile              Run profile management tests"
    echo "  finance              Run finance module tests"
    echo "  health               Run health module tests"
    echo "  studies              Run studies module tests"
    echo "  smoke                Run smoke tests (@smoke tagged)"
    echo "  critical             Run critical tests (@critical tagged)"
    echo "  all                  Run all tests (default)"
    echo ""
    echo "OPTIONS:"
    echo "  -h, --help           Show this help message"
    echo "  -s, --setup          Setup test environment"
    echo "  -c, --cleanup        Cleanup test artifacts"
    echo "  -r, --report         Generate and show reports"
    echo "  --headed             Run tests in headed mode (visible browser)"
    echo "  --debug              Run tests in debug mode"
    echo "  --ui                 Run tests with Playwright UI"
    echo "  --chromium           Run tests on Chromium only"
    echo "  --firefox            Run tests on Firefox only"
    echo "  --webkit             Run tests on WebKit only"
    echo "  --mobile             Run tests on mobile browsers"
    echo "  --parallel=N         Run tests with N parallel workers"
    echo "  --retries=N          Set number of retries for failed tests"
    echo ""
    echo "Examples:"
    echo "  $0                   Run all tests"
    echo "  $0 auth              Run authentication tests"
    echo "  $0 --headed finance  Run finance tests in headed mode"
    echo "  $0 --debug profile   Run profile tests in debug mode"
    echo "  $0 --mobile smoke    Run smoke tests on mobile"
}

# Main script logic
main() {
    local test_suite=""
    local playwright_options=""
    local setup_env=false
    local cleanup_artifacts=false
    local show_reports=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -s|--setup)
                setup_env=true
                shift
                ;;
            -c|--cleanup)
                cleanup_artifacts=true
                shift
                ;;
            -r|--report)
                show_reports=true
                shift
                ;;
            --headed)
                playwright_options="$playwright_options --headed"
                shift
                ;;
            --debug)
                playwright_options="$playwright_options --debug"
                shift
                ;;
            --ui)
                playwright_options="$playwright_options --ui"
                shift
                ;;
            --chromium)
                playwright_options="$playwright_options --project=chromium"
                shift
                ;;
            --firefox)
                playwright_options="$playwright_options --project=firefox"
                shift
                ;;
            --webkit)
                playwright_options="$playwright_options --project=webkit"
                shift
                ;;
            --mobile)
                playwright_options="$playwright_options --project=mobile-chrome --project=mobile-safari"
                shift
                ;;
            --parallel=*)
                workers="${1#*=}"
                playwright_options="$playwright_options --workers=$workers"
                shift
                ;;
            --retries=*)
                retries="${1#*=}"
                playwright_options="$playwright_options --retries=$retries"
                shift
                ;;
            -*)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
            *)
                if [ -z "$test_suite" ]; then
                    test_suite=$1
                else
                    print_error "Multiple test suites specified. Please specify only one."
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # Execute requested actions
    if [ "$cleanup_artifacts" = true ]; then
        cleanup
        exit 0
    fi
    
    if [ "$show_reports" = true ]; then
        generate_reports
        exit 0
    fi
    
    # Always check prerequisites and setup environment
    check_prerequisites
    
    if [ "$setup_env" = true ]; then
        setup_environment
        exit 0
    fi
    
    setup_environment
    
    # Run tests
    print_info "Starting test execution..."
    start_time=$(date +%s)
    
    if run_test_suite "$test_suite" "$playwright_options"; then
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        print_success "Tests completed successfully in ${duration}s"
        
        # Generate reports automatically
        generate_reports
        exit 0
    else
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        print_error "Tests failed after ${duration}s"
        
        # Still generate reports to see what failed
        generate_reports
        exit 1
    fi
}

# Run main function with all arguments
main "$@"