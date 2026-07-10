import { expect, type Locator, type Page } from '@playwright/test';
import { formatDateForInput, getNextMissionStatus } from '../utils/testData';

export class MissionJournalPage {
  readonly page: Page;
  readonly journalsNavLink: Locator;
  readonly newJournalButton: Locator;
  readonly journalTypeSelectionModal: Locator;
  readonly missionJournalOption: Locator;
  readonly selectButton: Locator;
  readonly journalTitleInput: Locator;
  readonly addButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.journalsNavLink = page.locator('a.header-nav__link:has-text("Journals")');
    this.newJournalButton = page.locator('button.btn-journal.btn-gradient:has-text("New Journal")');
    // Target the modal body specifically for journal type selection so tests
    // consistently interact with the selection modal (not other inline forms).
    this.journalTypeSelectionModal = page.locator('div.selection-card-wrapper, div.selection-card, section.journal-type-selection, .selection-modal');
    this.missionJournalOption = page.locator('div.selection-card-wrapper:has-text("Mission JRNL"), div.selection-card:has-text("Mission JRNL"), .selection-card:has-text("Mission JRNL")');
    this.selectButton = page.locator('button', { hasText: /^Select$/ });
    // Match several possible input attributes used by the app for the journal title.
    // Prefer inputs within the Journals panel or setup modal to avoid matching
    // unrelated inputs (e.g., CloudSponge widgets) elsewhere on the page.
    this.journalTitleInput = page.locator('input[placeholder="Your journal title"]');
    this.addButton = page.locator('button.btn-gradient:has-text("Create Journal"), button.btn-gradient:has-text("Add")');
  }

  async navigateToJournals(): Promise<void> {
    await expect(this.journalsNavLink).toBeVisible();
    await this.journalsNavLink.first().click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.newJournalButton).toBeVisible({ timeout: 20000 });
  }

  async createMissionJournal(title: string): Promise<string> {
    const selectedStatus = getNextMissionStatus();
    console.log(`STEP A1: Creating mission journal with title ${title}`);

    await this.navigateToJournals();
    await expect(this.newJournalButton).toBeVisible();
    await this.newJournalButton.first().click();
    await this.page.waitForTimeout(5000); // Wait for potential modal animation to complete
    await this.page.waitForLoadState('networkidle');

    // Try selection modal for mission journal; if modal doesn't appear, fall back
    // to the inline flow where the form inputs are available immediately.
  try {
    await expect(this.journalTypeSelectionModal.first()).toBeVisible({ timeout: 5000 });
    await expect(this.missionJournalOption).toBeVisible({ timeout: 5000 });
    await this.missionJournalOption.click();
    await expect(this.selectButton).toBeVisible({ timeout: 5000 });
    await this.selectButton.first().click();
    await this.page.waitForLoadState('networkidle');
  } catch (e) {
    console.log('Journal type modal not shown; continuing with inline mission journal flow');
  }

    // The input for the journal title can appear in different places
    // (add-journal dialog, inline journals panel, or other setup modals).
    // Try several likely containers and pick the first visible input.
    const titleInput = this.page.locator('input[placeholder="Your journal title"]');
    await expect(titleInput).toBeVisible({ timeout: 20000 });

    
    await titleInput.fill(title);
    await expect(titleInput).toHaveValue(title);

    console.log(`STEP A2: Selected mission status ${selectedStatus}`);
    const missionStatusField = this.page.locator('select.setup-select, select[name="status"], select#status, select[aria-label*="status"], select').first();
    await expect(missionStatusField).toBeVisible({ timeout: 10000 }).catch(() => {
      console.log('Mission status select not found with primary selectors; attempting to continue');
    });
    await missionStatusField.selectOption({ label: selectedStatus }).catch(() => {
      console.log('Could not select mission status via select element; skipping select step');
    });
    await expect(missionStatusField).toHaveValue(
      selectedStatus === 'Starting the mission' ? 'starting_the_mission'
      : selectedStatus === 'Currently serving' ? 'currently_serving'
      : 'ended_the_mission'
    );
    console.log(`STEP A2b: Confirmed mission status set to ${selectedStatus}`);

    const today = new Date();
    const isoDateValue = today.toISOString().split('T')[0]; // yields "2026-07-06" — required format for input[type="date"]

    const startDateField = this.page.locator('input[type="date"]').first();
    await expect(startDateField).toBeVisible({ timeout: 10000 });
    await startDateField.fill(isoDateValue);
    await expect(startDateField).toHaveValue(isoDateValue);
    console.log(`STEP A3: Filled mission start date with ${isoDateValue}`);

    await expect(this.addButton.first()).toBeVisible({ timeout: 20000 });
    await this.addButton.first().click();
    await this.page.waitForLoadState('networkidle');

    await expect(this.page.locator(`text=${title}`)).toBeVisible({ timeout: 20000 });
    return title;
  }
}
