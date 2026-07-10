import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { JournalPage } from '../pages/journal.page';
import { BookPage } from '../pages/book.page';
import { LogoutPage } from '../pages/logout.page';

test.describe('Journal and Book creation flow', () => {
  test('should create a journal and then create a book from it', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const journalPage = new JournalPage(page);
    const bookPage = new BookPage(page);
    const logoutPage = new LogoutPage(page);

    const journalName = `Journal_${Date.now()}`;
    const journalDescription = 'This is a test journal created by automation for validation purposes only.';

    console.log('Starting test run for journal and book creation');

    await loginPage.goto();
    await loginPage.acceptCookiesIfVisible();
    const testUser = process.env.TEST_USER ?? 'CHANGE_ME';
    const testPass = process.env.TEST_PASS ?? 'CHANGE_ME';
    await loginPage.login(testUser, testPass);
    await journalPage.skipOnboardingIfVisible();

    await journalPage.navigateToJournals();
    await journalPage.createNewJournal(journalName, journalDescription);
    await journalPage.verifyJournalCreated(journalName);

    await bookPage.navigateToBooks();
    await bookPage.createNewBook(journalName);

    console.log('Completed test run successfully');
    await expect(page).toHaveURL(/books|dashboard|home|journals/);
    await logoutPage.logout();
  });
});
