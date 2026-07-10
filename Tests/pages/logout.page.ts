import { expect, type Page } from '@playwright/test';
import { LoginPage } from './login.page';

export class LogoutPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Performs logout via the account avatar -> Logout menu option and
   * verifies the app returned to the login page by reusing the locator
   * exposed by `LoginPage`.
   */
  async logout(): Promise<void> {
    console.log('STEP L1: Logging out');

    // If a modal from the prior book flow is still open, try the Close button first.
    const closeButton = this.page.locator("//button[normalize-space()='Close']");
    if ((await closeButton.count()) > 0 && (await closeButton.first().isVisible())) {
      console.log('STEP L0: Closing open modal via Close button');
      await closeButton.first().click();
      // Wait for the Close button to disappear (or continue if it doesn't)
      await closeButton.first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
        console.log('STEP L0: Close button did not hide within timeout, continuing');
      });
    }

    const accountAvatar = this.page.locator("//img[@class='MuiAvatar-img']");
    const logoutOption = this.page.locator("//span[normalize-space()='Logout']");

    // Debug: log how many avatar elements are present before asserting
    const avatarCount = await accountAvatar.count();
    console.log(`STEP L0.1: Account avatar count = ${avatarCount}`);
    await expect(accountAvatar).toBeVisible({ timeout: 20000 });
    await accountAvatar.first().click();

    await expect(logoutOption).toBeVisible({ timeout: 10000 });
    await logoutOption.first().click();

    // Reuse LoginPage's email input locator for the logged-out assertion
    const loginPage = new LoginPage(this.page);
    await expect(loginPage.emailInput).toBeVisible({ timeout: 15000 });

    console.log('STEP L2: Logout confirmed — back on login page');
  }
}
