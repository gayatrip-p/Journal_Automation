import { expect, type Locator, type Page } from '@playwright/test';

export class JournalPage {
  readonly page: Page;
  readonly onboardingModal: Locator;
  readonly skipOnboardingButton: Locator;
  readonly journalsNavLink: Locator;
  readonly newJournalButton: Locator;
  readonly standardJournalOption: Locator;
  readonly selectButton: Locator;
  readonly journalNameInput: Locator;
  readonly descriptionInput: Locator;
  readonly addButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.onboardingModal = page.locator('#delete-sender-modal');
    this.skipOnboardingButton = page.locator('#delete-sender-modal button:has-text("Skip Onboarding"), #delete-sender-modal button:has-text("Skip"), button.btn-skip');
    this.journalsNavLink = page.locator('a.header-nav__link:has-text("Journals")');
    this.newJournalButton = page.locator('button.btn-journal.btn-gradient:has-text("New Journal")');
    this.standardJournalOption = page.locator('div.selection-card-wrapper:has(.selection-card__label:text("Standard Journal"))');
    this.selectButton = page.locator('button:has-text("Select")');
    this.journalNameInput = page.locator('input#edit-journal, input[name="name"], input[placeholder="New Journal Name"]');
    this.descriptionInput = page.locator('textarea.edit-journal-input, textarea[name="Description"], textarea[placeholder*="journal"]');
    this.addButton = page.locator('button.btn-gradient:has-text("Add")');
  }

  async skipOnboardingIfVisible(): Promise<void> {
    const modalAppeared = await this.onboardingModal.first().waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
    if (modalAppeared) {
      console.log('STEP 3: Skipping onboarding modal');
      await expect(this.skipOnboardingButton).toBeVisible({ timeout: 20000 });
      await this.skipOnboardingButton.first().click({ force: true });
      await expect(this.onboardingModal).toBeHidden({ timeout: 20000 });
      await this.page.waitForLoadState('networkidle');
    } else {
      console.log('No onboarding modal displayed after login');
    }
  }

  async navigateToJournals(): Promise<void> {
    console.log('STEP 4: Navigating to Journals');
    await expect(this.journalsNavLink).toBeVisible();
    await this.journalsNavLink.first().click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.locator('#journals.tab-pane, div#journals.tab-pane, section#journals')).toBeVisible({ timeout: 20000 });
    await expect(this.newJournalButton).toBeVisible({ timeout: 20000 });
  }

  async createNewJournal(name: string, description: string): Promise<void> {
    console.log('STEP 5: Creating new journal');
    await expect(this.newJournalButton).toBeVisible();
    await this.newJournalButton.first().click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.standardJournalOption).toBeVisible();
    await this.standardJournalOption.first().click();
    await expect(this.selectButton).toBeVisible();
    await this.selectButton.first().click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.journalNameInput).toBeVisible();
    await this.journalNameInput.fill(name);
    await expect(this.descriptionInput).toBeVisible();
    await this.descriptionInput.fill(description);
    await expect(this.addButton).toBeVisible();
    await this.addButton.first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async verifyJournalCreated(name: string): Promise<void> {
    const journalCard = this.page.locator(`text=${name}`);
    await expect(journalCard).toBeVisible({ timeout: 20000 });
  }
}
