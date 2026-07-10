Journal Automation – Test Coverage
This repository contains Playwright + TypeScript end-to-end tests for the Journal application (https://dev.jrnl.com), built using the Page Object Model (POM) design pattern.
Test Scenarios Automated

1. Journal Creation & Book Generation (journal.spec.ts)
Login with cookie consent and onboarding modal handling
Navigate to Journals section
Create a new Standard Journal with a unique, timestamp-based name and description
Verify the journal appears in the journal list
Navigate to Books section
Create a new printed book (6"x9") linked to the created journal, walking through the multi-step book creation wizard
Save and confirm the book was created successfully
Logout

2. Mission Journal & PDF-Only Book Flow (mission-journal-book.spec.ts)
Login and onboarding handling
Create a Mission Journal (selected via the journal type modal)
Set mission status (Starting the mission / Currently serving / Ended the mission) and start date
Verify mission journal creation
Create a PDF-only book linked to the mission journal
Logout

3. Journal Edit Workflow (journal-edit.spec.ts)
Login and onboarding handling
Create a new journal with a unique name and description
Open the journal's options menu (three-dot icon) and select "Edit Journal"
Update the journal name and description with new values
Verify the updated name is displayed and the old name no longer appears
Logout

Page Objects (POM)
Page ObjectResponsibilitylogin.page.tsLogin, cookie consent handlingjournal.page.tsStandard journal creation and verificationmissionJournal.page.tsMission journal creation, status, and date handlingjournalEdit.page.tsJournal edit menu, update, and verificationbook.page.tsBook creation wizard (printed & PDF-only books)logout.page.tsSession logout
Environment Setup
Test credentials are managed via environment variables (not hardcoded) using a .env file:
TEST_USER=<test_username>
TEST_PASS=<test_password>
BASE_URL=https://dev.jrnl.com
See .env.example for the required format. .env is excluded from version control via .gitignore.
Running Tests
Run all tests (headed):
bashnpx playwright test Tests/specs --headed --reporter=list --workers=1
Run all tests (headless):
bashnpx playwright test Tests/specs --reporter=list --workers=1
Run a specific test file:
bashnpx playwright test Tests/specs/journal.spec.ts --headed --reporter=list
