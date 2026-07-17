import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { JournalPage } from '../pages/journal.page';
import { BookPage } from '../pages/book.page';
import { MissionJournalPage } from '../pages/missionJournal.page';
import { generateUniqueTitle } from '../utils/testData';
import { LogoutPage } from '../pages/logout.page';

test.describe('Mission journal and PDF-only book flow', () => {
  test('should create a mission journal and a PDF-only book from it', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const journalPage = new JournalPage(page);
    const missionJournalPage = new MissionJournalPage(page);
    const bookPage = new BookPage(page);
    const logoutPage = new LogoutPage(page);

    const journalTitle = generateUniqueTitle();
    const journalDescription = 'Mission journal created through the new Playwright workflow.';

    console.log('Starting mission journal and PDF-only book workflow');

    await loginPage.goto();
    await loginPage.rejectCookiesIfVisible();
    const testUser = process.env.TEST_USER || 'CHANGE_ME';
    const testPass = process.env.TEST_PASS || 'CHANGE_ME';
    await loginPage.login(testUser, testPass);
    await journalPage.skipOnboardingIfVisible();

    const createdJournalTitle = await missionJournalPage.createMissionJournal(journalTitle);
    await expect(page.locator(`text=${createdJournalTitle}`)).toBeVisible({ timeout: 20000 });

    await bookPage.createPdfOnlyBook(createdJournalTitle);

    console.log('Mission journal and PDF-only book workflow completed successfully');
    await expect(page).toHaveURL(/books|dashboard|home|journals/);
    await logoutPage.logout();
  });
});
