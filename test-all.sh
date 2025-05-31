#!/bin/bash

echo "🧪 Running Crypto Portfolio Analyzer Test Suite"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Function to run command and track results
run_test() {
    local test_name="$1"
    local command="$2"
    
    echo -e "${YELLOW}Running $test_name...${NC}"
    eval $command
    local result=$?
    print_status $result "$test_name"
    return $result
}

# Track overall results
BACKEND_LINT_RESULT=0
BACKEND_TEST_RESULT=0
FRONTEND_LINT_RESULT=0
FRONTEND_TEST_RESULT=0
BUILD_RESULT=0

echo "📦 Installing dependencies..."
npm run install:all

echo ""
echo "🔍 Backend Tests"
echo "=================="

# Backend linting
run_test "Backend Linting" "cd backend && npm run lint"
BACKEND_LINT_RESULT=$?

# Backend unit tests
run_test "Backend Unit Tests" "cd backend && npm run test:unit"
BACKEND_TEST_RESULT=$?

# Backend integration tests
run_test "Backend Integration Tests" "cd backend && npm run test:integration"
BACKEND_INTEGRATION_RESULT=$?

echo ""
echo "🎨 Frontend Tests"
echo "=================="

# Frontend linting
run_test "Frontend Linting" "cd frontend && npm run lint"
FRONTEND_LINT_RESULT=$?

# Frontend tests
run_test "Frontend Tests" "cd frontend && npm test -- --watchAll=false"
FRONTEND_TEST_RESULT=$?

echo ""
echo "🏗️ Build Tests"
echo "==============="

# Build backend
run_test "Backend Build" "cd backend && npm run build"
BUILD_BACKEND_RESULT=$?

# Build frontend
run_test "Frontend Build" "cd frontend && npm run build"
BUILD_FRONTEND_RESULT=$?

echo ""
echo "📊 Test Summary"
echo "==============="

# Calculate overall results
TOTAL_TESTS=6
PASSED_TESTS=0

[ $BACKEND_LINT_RESULT -eq 0 ] && ((PASSED_TESTS++))
[ $BACKEND_TEST_RESULT -eq 0 ] && ((PASSED_TESTS++))
[ $BACKEND_INTEGRATION_RESULT -eq 0 ] && ((PASSED_TESTS++))
[ $FRONTEND_LINT_RESULT -eq 0 ] && ((PASSED_TESTS++))
[ $FRONTEND_TEST_RESULT -eq 0 ] && ((PASSED_TESTS++))
[ $BUILD_BACKEND_RESULT -eq 0 ] && [ $BUILD_FRONTEND_RESULT -eq 0 ] && ((PASSED_TESTS++))

print_status $BACKEND_LINT_RESULT "Backend Linting"
print_status $BACKEND_TEST_RESULT "Backend Unit Tests"
print_status $BACKEND_INTEGRATION_RESULT "Backend Integration Tests"
print_status $FRONTEND_LINT_RESULT "Frontend Linting"
print_status $FRONTEND_TEST_RESULT "Frontend Tests"

if [ $BUILD_BACKEND_RESULT -eq 0 ] && [ $BUILD_FRONTEND_RESULT -eq 0 ]; then
    print_status 0 "Build Tests"
else
    print_status 1 "Build Tests"
fi

echo ""
echo "Results: $PASSED_TESTS/$TOTAL_TESTS tests passed"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}💥 Some tests failed${NC}"
    exit 1
fi