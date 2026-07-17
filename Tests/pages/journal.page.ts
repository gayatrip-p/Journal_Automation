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
  this.standardJournalOption = page.locator('div.selection-card-wrapper:has-text("Standard Journal")');
  this.selectButton = page.locator('button:has-text("Select")');
  this.journalNameInput = page.locator('#edit-journal, input[placeholder*="journal"], input[placeholder*="Journal"]').first();
  this.descriptionInput = page.locator('textarea[placeholder*="Describe"], textarea[placeholder*="journal"], textarea[name*="description"], textarea[aria-label*="description"], textarea').first();
  this.addButton = page.locator('button:has-text("Add"), button:has-text("Create Journal")').first();
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
    // The app can present either a selection modal or an inline form directly.
    // Try the selection modal first, fall back to the inline form if it's not present.
    try {
      await expect(this.standardJournalOption).toBeVisible({ timeout: 3000 });
      await this.standardJournalOption.first().click();
      await expect(this.selectButton).toBeVisible({ timeout: 5000 });
      await this.selectButton.first().click();
      await this.page.waitForLoadState('networkidle');
    } catch (e) {
      console.log('Selection modal not present; proceeding with inline journal form');
    }
    await expect(this.journalNameInput).toBeVisible();
    await this.journalNameInput.fill(name);

    const descriptionField = this.descriptionInput;
    const descriptionVisible = await descriptionField.isVisible().catch(() => false);
    if (descriptionVisible) {
      await descriptionField.fill(description);
    } else {
      console.log('Description field not visible; continuing without filling it');
    }

    await expect(this.addButton).toBeVisible();
    await this.addButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async openNewJournalForm(): Promise<void> {
    await expect(this.newJournalButton).toBeVisible();
    await this.newJournalButton.first().click();
    await this.page.waitForLoadState('networkidle');
    try {
      await expect(this.standardJournalOption).toBeVisible({ timeout: 3000 });
      await this.standardJournalOption.first().click();
      await expect(this.selectButton).toBeVisible({ timeout: 5000 });
      await this.selectButton.first().click();
      await this.page.waitForLoadState('networkidle');
    } catch {
      console.log('Selection modal not present; proceeding with inline journal form');
    }
    await expect(this.journalNameInput).toBeVisible();
    await expect(this.descriptionInput).toBeVisible();
  }

  async enterJournalName(name: string): Promise<string> {
    await expect(this.journalNameInput).toBeVisible();
    await this.journalNameInput.fill('');
    await this.journalNameInput.type(name, { delay: 10 });
    return this.journalNameInput.inputValue();
  }

  async enterJournalDescription(description: string): Promise<string> {
    await expect(this.descriptionInput).toBeVisible();
    await this.descriptionInput.fill('');
    await this.descriptionInput.type(description, { delay: 10 });
    return this.descriptionInput.inputValue();
  }

  async submitJournalCreation(): Promise<void> {
    await expect(this.addButton).toBeVisible();
    await this.addButton.first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async verifyJournalCreated(name: string): Promise<void> {
    const journalCard = this.page.locator(`text=${name}`);
    await expect(journalCard.first()).toBeVisible({ timeout: 20000 });
  }
}

console.log('Loaded user:', process.env.TEST_USER);