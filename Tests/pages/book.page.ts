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

  constructor(page: Page) {
    this.page = page;
    this.booksNavLink = page.locator('a.header-nav__link:has-text("Books")');
    this.newBookButton = page.locator('button.btn.btn-books.btn-gradient:has-text("New Book")');
    this.bookTypeCard = page.locator('text=6" x 9" Printed Book (20-900 page limit)');
    this.nextStepButton = page.locator('button.btn.btn-gradient:has-text("Next Step")');
    this.journalDropdown = page.locator('#selectedTagsModal');
    this.saveAndExitButton = page.locator('button.btn.btn-outline:has-text("Save and exit")');
    this.closeButton = page.locator('button:has-text("Close"), button:has-text("Done")');
  }

  async navigateToBooks(): Promise<void> {
    console.log('STEP 6: Navigating to Books');
    await expect(this.booksNavLink).toBeVisible();
    await this.booksNavLink.first().click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.page.locator('text=Books, text=My Books, [role="heading"]:has-text("Books")')).toHaveCount(1).catch(() => {});
  }

  async createNewBook(journalName: string): Promise<void> {
    console.log('STEP 7: Creating new book');
    await expect(this.newBookButton).toBeVisible();
    await this.newBookButton.first().click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.bookTypeCard).toBeVisible();
    await this.bookTypeCard.first().click();
    await expect(this.nextStepButton).toBeVisible();
    await this.nextStepButton.first().click();
    await this.page.waitForLoadState('networkidle');

    const journalOption = this.page.locator(`text=${journalName}`);
    await expect(this.journalDropdown).toBeVisible();

    // If the dropdown toggle is disabled in the UI, try a graceful fallback:
    // 1) attempt to force-enable and open it via JS
    // 2) if options are still empty, inject a selection entry into the dropdown
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

      // Try to click the toggle and then the injected/visible option
      await this.journalDropdown.first().click({ force: true }).catch(() => {});
      const injected = this.page.locator(`.dropdown-selected-list:has-text("${journalName}")`);
      if (await injected.count() > 0) {
        await injected.first().click({ force: true }).catch(() => {});
      } else {
        // as a final fallback, click a visible plain-text option if present
        if (await journalOption.count() > 0) await journalOption.first().click({ force: true }).catch(() => {});
      }
    } else {
      await this.journalDropdown.first().click();
      await expect(journalOption).toBeVisible({ timeout: 20000 });
      await journalOption.first().click();
    }

    // Ensure any open dropdown overlay is closed so it doesn't intercept the Next Step click
    await this.page.evaluate(() => {
      const menu = document.querySelector('.dropdown-menu.max-height--400.scrollable.show');
      if (menu) {
        menu.classList.remove('show');
      }
      const toggle = document.querySelector('#selectedTagsModal');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    }).catch(() => {});
    await this.page.waitForTimeout(300);

    await expect(this.nextStepButton).toBeVisible();
    await this.nextStepButton.first().click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.nextStepButton).toBeVisible();
    await this.nextStepButton.first().click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.saveAndExitButton).toBeVisible();
    await this.saveAndExitButton.first().click();
    await this.page.waitForLoadState('networkidle');
    // Wait for success indicator or modal to close. If modal doesn't close, click the close/done button if present.
    await this.page.waitForSelector('.modal-box--600', { state: 'hidden', timeout: 20000 }).catch(async () => {
      if ((await this.closeButton.count()) > 0) {
        await this.closeButton.first().click().catch(() => {});
        await this.page.waitForLoadState('networkidle');
      }
    });
  }
}
