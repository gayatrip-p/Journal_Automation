import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { JournalPage } from '../pages/journal.page';

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 100;

function generateString(length: number): string {
  return 'DUMMY123Test123'.repeat(length);
}

test.describe('Journal character limit validation', () => {
  test('should enforce journal name and description limits and allow journal creation once', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const journalPage = new JournalPage(page);

    console.log('STEP 1: Navigate and login');
    await loginPage.goto();
    await loginPage.rejectCookiesIfVisible();
    const testUser = process.env.TEST_USER || 'CHANGE_ME';
    const testPass = process.env.TEST_PASS || 'CHANGE_ME';
    await loginPage.login(testUser, testPass);
    await journalPage.skipOnboardingIfVisible();

    console.log('STEP 2.1: Navigate to Journals and open New Journal');
    await journalPage.navigateToJournals();
    await journalPage.openNewJournalForm();

    const journalNameExact = `${generateString(MAX_NAME_LENGTH - 1)}1`.slice(0, MAX_NAME_LENGTH);
    const journalNameOverflow = `${journalNameExact}X`;
    const journalDescriptionExact = `${generateString(MAX_DESCRIPTION_LENGTH - 1)}1`.slice(0, MAX_DESCRIPTION_LENGTH);
    const journalDescriptionOverflow = `${journalDescriptionExact}X`;

    console.log(`STEP 3.1: Enter journal name with exact ${MAX_NAME_LENGTH} chars`);
    const nameValueExact = await journalPage.enterJournalName(journalNameExact);
    console.log(`Journal name exact value length: ${nameValueExact.length}`);
    await expect(nameValueExact.length).toBe(MAX_NAME_LENGTH);

    console.log(`STEP 4.1: Verify overflow is blocked at ${MAX_NAME_LENGTH} chars`);
    const nameValueOverflow = await journalPage.enterJournalName(journalNameOverflow);
    console.log(`Journal name overflow value length: ${nameValueOverflow.length}`);
    await expect(nameValueOverflow.length).toBe(MAX_NAME_LENGTH);

    console.log(`STEP 5.1: Enter journal description with exact ${MAX_DESCRIPTION_LENGTH} chars`);
    const descriptionValueExact = await journalPage.enterJournalDescription(journalDescriptionExact);
    console.log(`Journal description exact value length: ${descriptionValueExact.length}`);
    await expect(descriptionValueExact.length).toBe(MAX_DESCRIPTION_LENGTH);

    console.log(`STEP 6.1: Verify description overflow is blocked at ${MAX_DESCRIPTION_LENGTH} chars`);
    const descriptionValueOverflow = await journalPage.enterJournalDescription(journalDescriptionOverflow);
    console.log(`Journal description overflow value length: ${descriptionValueOverflow.length}`);
    await expect(descriptionValueOverflow.length).toBe(MAX_DESCRIPTION_LENGTH);

    const finalJournalName = `${journalNameExact}-${Date.now()}`.slice(0, MAX_NAME_LENGTH);
    console.log(`STEP 7.1: Save journal and verify creation for ${finalJournalName}`);
    await journalPage.enterJournalName(finalJournalName);
    await journalPage.enterJournalDescription(journalDescriptionExact);
    await journalPage.submitJournalCreation();
    await journalPage.verifyJournalCreated(finalJournalName);
    console.log(`Created journal with name length ${finalJournalName.length} and description length ${journalDescriptionExact.length}`);

    console.log('STEP 8: Logging out');
    await loginPage.logout();
  });
});
