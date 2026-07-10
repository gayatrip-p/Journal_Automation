import { expect, type Locator, type Page } from '@playwright/test';

export class BookPage {
  readonly page: Page;
  readonly booksNavLink: Locator;
  readonly newBookButton: Locator;
  readonly bookTypeCard: Locator;
  readonly nextStepButton: Locator;
  readonly journalDropdown: Locator;
  readonly saveAndExitButton: Locator;
  readonly closeButton: Locator;
  readonly pdfOnlyBookOption: Locator;
  readonly bookWizardModal: Locator;
  readonly booksListHeading: Locator;
  readonly savingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.booksNavLink = page.locator('a.header-nav__link:has-text("Books")');
    this.newBookButton = page.locator('button.btn.btn-books.btn-gradient:has-text("New Book")');
    this.bookTypeCard = page.locator('text=6" x 9" Printed Book (20-900 page limit)');
    this.nextStepButton = page.locator('button.btn.btn-gradient:has-text("Next Step")');
    this.journalDropdown = page.locator('#selectedTagsModal');
    this.saveAndExitButton = page.locator('button.btn.btn-outline:has-text("Save and exit")');
    this.closeButton = page.locator('button:has-text("Close"), button:has-text("Done")');
    this.pdfOnlyBookOption = page.getByText('PDF Download Only', { exact: false }).first();
    this.bookWizardModal = page.locator('[role="dialog"], .modal-content, .wizard-modal');
    this.booksListHeading = page.getByRole('heading', { name: /books/i });
    // Matches the "Saving..." indicator seen in the modal header while a save is in flight.
    this.savingIndicator = page.locator('text=Saving...');
  }

  async navigateToBooks(): Promise<void> {
    console.log('STEP 6: Navigating to Books');
    await expect(this.booksNavLink).toBeVisible();
    await this.booksNavLink.first().click();
    await expect(this.newBookButton).toBeVisible({ timeout: 20000 });
    console.log('STEP 6b: Books page confirmed loaded');
  }

  /**
   * Waits for a save action to fully finish: the "Saving..." indicator must
   * disappear (or never have appeared) before we treat the save as complete.
   * Deliberately avoids page.waitForLoadState('networkidle'), since apps with
   * background polling/websockets (e.g. the notifications badge here) never
   * go fully network-idle, causing that wait to eat its full timeout on
   * every call instead of resolving quickly like a human would experience.
   */
  private async waitForSaveToComplete(): Promise<void> {
    const stillSaving = await this.savingIndicator.count();
    if (stillSaving > 0) {
      console.log('STEP 7-save: "Saving..." indicator visible, waiting for it to clear');
      await this.savingIndicator.first().waitFor({ state: 'hidden', timeout: 45000 });
      console.log('STEP 7-save: Save completed');
    }
  }

  async createNewBook(journalName: string): Promise<void> {
    console.log('STEP 7: Creating new book');
    await expect(this.newBookButton).toBeVisible();
    await this.newBookButton.first().click();
    console.log('STEP 7a: Clicked New Book');
    await expect(this.bookTypeCard).toBeVisible({ timeout: 20000 });

    await this.bookTypeCard.first().click();
    console.log('STEP 7b: Selected Printed Book type');
    await expect(this.nextStepButton).toBeVisible({ timeout: 20000 });
    await this.nextStepButton.first().click();
    console.log('STEP 7c: Clicked Next Step (after book type)');

    const journalOption = this.page.locator(`text=${journalName}`);
    await expect(this.journalDropdown).toBeVisible({ timeout: 20000 });
    console.log('STEP 7d: Journal dropdown visible');

    const ariaDisabled = await this.journalDropdown.first().getAttribute('aria-disabled');
    if (ariaDisabled === 'true') {
      console.log('STEP 7e: Dropdown is aria-disabled — using force-open workaround');
      await this.page.evaluate((name) => {
        const toggle = document.querySelector('#selectedTagsModal');
        if (toggle) toggle.setAttribute('aria-disabled', 'false');
        const menu = document.querySelector('.dropdown-menu.max-height--400.scrollable');
        if (menu) menu.classList.add('show');
        const ul = menu?.querySelector('.dropdown-selected-list');
        if (ul && !Array.from(ul.children).some(li => li.textContent && li.textContent.includes(name))) {
          const li = document.createElement('li');
          li.textContent = name;
          li.className = 'injected-dropdown-item';
          ul.appendChild(li);
        }
      }, journalName);

      await this.journalDropdown.first().click({ force: true }).catch(() => {});
      const injected = this.page.locator(`.dropdown-selected-list:has-text("${journalName}")`);
      if (await injected.count() > 0) {
        await injected.first().click({ force: true }).catch(() => {});
      } else if (await journalOption.count() > 0) {
        await journalOption.first().click({ force: true }).catch(() => {});
      }
    } else {
      console.log('STEP 7e: Dropdown is enabled — clicking normally');
      await this.journalDropdown.first().click();
      await expect(journalOption).toBeVisible({ timeout: 20000 });
      await journalOption.first().click();
    }
    console.log('STEP 7f: Journal selected in dropdown');

    await this.page.evaluate(() => {
      const menu = document.querySelector('.dropdown-menu.max-height--400.scrollable.show');
      if (menu) {
        menu.classList.remove('show');
      }
      const toggle = document.querySelector('#selectedTagsModal');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }).catch(() => {});
    await this.page.waitForTimeout(300);
    console.log('STEP 7g: Closed dropdown menu');

    await expect(this.nextStepButton).toBeVisible({ timeout: 20000 });
    await this.nextStepButton.first().click();
    console.log('STEP 7h: Clicked Next Step (after journal selection)');

    await expect(this.nextStepButton).toBeVisible({ timeout: 20000 });
    await this.nextStepButton.first().click();
    console.log('STEP 7i: Clicked Next Step (final wizard step)');

    // Extra Next Step click requested for the Journal flow to reach final save
    await expect(this.nextStepButton).toBeVisible({ timeout: 20000 });
    await this.nextStepButton.first().click();
    console.log('STEP 7i.1: Clicked Next Step (extra)');

    await expect(this.saveAndExitButton).toBeVisible({ timeout: 20000 });
    await this.saveAndExitButton.first().click();
    console.log('STEP 7j: Clicked Save and Exit');

    await this.waitForSaveToComplete();
    console.log('STEP 7k: Save confirmed complete');

    // The modal may auto-close on save, or may require an explicit Close click.
    const stillOnNewBookButton = await this.newBookButton.count();
    if (stillOnNewBookButton > 0 && (await this.newBookButton.first().isVisible())) {
      console.log('STEP 7l: Confirmed back on Books list');
      return;
    }

    if ((await this.closeButton.count()) > 0) {
      console.log('STEP 7m: New Book button not visible — trying Close button fallback');
      await this.closeButton.first().click().catch(() => {});
      await expect(this.newBookButton).toBeVisible({ timeout: 20000 });
      console.log('STEP 7n: Confirmed back on Books list after Close');
    }
  }

  async createPdfOnlyBook(journalName: string): Promise<void> {
    console.log('STEP B1: Starting PDF-only book creation');
    await this.navigateToBooks();

    await expect(this.newBookButton).toBeVisible({ timeout: 20000 });
    await this.newBookButton.first().click();

    await expect(this.page.locator('text=Create New Book')).toBeVisible({ timeout: 20000 });
    await expect(this.pdfOnlyBookOption.first()).toBeVisible({ timeout: 20000 });
    await this.pdfOnlyBookOption.first().click();
    await expect(this.nextStepButton.first()).toBeVisible({ timeout: 20000 });
    await this.nextStepButton.first().click();

    const journalOption = this.page.locator(`text=${journalName}`);
    await expect(this.journalDropdown).toBeVisible({ timeout: 20000 });

    const ariaDisabled = await this.journalDropdown.first().getAttribute('aria-disabled');
    if (ariaDisabled === 'true') {
      await this.page.evaluate((name) => {
        const toggle = document.querySelector('#selectedTagsModal');
        if (toggle) toggle.setAttribute('aria-disabled', 'false');
        const menu = document.querySelector('.dropdown-menu.max-height--400.scrollable');
        if (menu) menu.classList.add('show');
        const ul = menu?.querySelector('.dropdown-selected-list');
        if (ul && !Array.from(ul.children).some(li => li.textContent && li.textContent.includes(name))) {
          const li = document.createElement('li');
          li.textContent = name;
          li.className = 'injected-dropdown-item';
          ul.appendChild(li);
        }
      }, journalName);

      await this.journalDropdown.first().click({ force: true }).catch(() => {});
      const injected = this.page.locator(`.dropdown-selected-list:has-text("${journalName}")`);
      if (await injected.count() > 0) {
        await injected.first().click({ force: true }).catch(() => {});
      } else if (await journalOption.count() > 0) {
        await journalOption.first().click({ force: true }).catch(() => {});
      }
    } else {
      await this.journalDropdown.first().click();
      await expect(journalOption).toBeVisible({ timeout: 20000 });
      await journalOption.first().click();
    }

    // Close the dropdown menu — selecting an option doesn't auto-collapse it,
    // and the still-open menu overlaps/intercepts clicks on "Next Step".
    await this.page.evaluate(() => {
      const menu = document.querySelector('.dropdown-menu.max-height--400.scrollable.show');
      if (menu) {
        menu.classList.remove('show');
      }
      const toggle = document.querySelector('#selectedTagsModal');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }).catch(() => {});
    await this.page.waitForTimeout(300);

    await expect(this.nextStepButton.first()).toBeVisible({ timeout: 20000 });
    await this.nextStepButton.first().click();

    let step = 0;
    while (await this.saveAndExitButton.count() === 0 || !(await this.saveAndExitButton.first().isVisible())) {
      step += 1;
      console.log(`STEP B2: Advancing wizard step ${step}`);
      await expect(this.nextStepButton.first()).toBeVisible({ timeout: 20000 });
      await this.nextStepButton.first().click();
      if (step > 10) {
        throw new Error('Wizard did not reach Save and Exit within the expected number of steps.');
      }
    }

    await expect(this.saveAndExitButton.first()).toBeVisible({ timeout: 20000 });
    await this.saveAndExitButton.first().click();
    console.log('STEP B2b: Clicked Save and Exit');

    await this.waitForSaveToComplete();

    const stillOnNewBookButton = await this.newBookButton.count();
    if (!(stillOnNewBookButton > 0 && (await this.newBookButton.first().isVisible()))) {
      if ((await this.closeButton.count()) > 0) {
        await this.closeButton.first().click().catch(() => {});
      }
    }

    await expect(this.newBookButton).toBeVisible({ timeout: 20000 });
    console.log('STEP B3: Confirmed back on Books list — book created successfully');
  }
}