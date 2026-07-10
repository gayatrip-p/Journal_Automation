import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly cookieAcceptButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="username"]:visible');
    this.passwordInput = page.locator('input[name="password"]:visible');
    this.submitButton = page.locator('button:has-text("Login"):visible, button:has-text("Log in"):visible, button:has-text("Sign in"):visible, button:has-text("Sign In"):visible');
    this.cookieAcceptButton = page.locator('button.iubenda-cs-accept-btn, button:has-text("Accept"):visible, button:has-text("Agree"):visible, button:has-text("Accept All"):visible, button:has-text("I Accept"):visible');
  }

  async goto(): Promise<void> {
    console.log('STEP 1: Navigating to login page');
    const base = process.env.BASE_URL || 'https://dev.jrnl.com';
    await this.page.goto(`${base}/login`);
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/login/);
  }

  async acceptCookiesIfVisible(): Promise<void> {
    if (await this.cookieAcceptButton.count() > 0 && await this.cookieAcceptButton.first().isVisible()) {
      console.log('Accepting cookie banner');
      await this.cookieAcceptButton.first().click();
    }
  }

  async login(email: string, password: string): Promise<void> {
    console.log('STEP 2: Logging in');
    await expect(this.emailInput).toBeVisible();
    await this.emailInput.fill(email);
    await expect(this.passwordInput).toBeVisible();
    await this.passwordInput.fill(password);
    await expect(this.submitButton).toBeVisible();
    await this.submitButton.first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async logout(): Promise<void> {
    console.log('STEP L: Logging out');

    // Wait for any modal frame or overlay from the prior book creation to disappear
    await Promise.all([
      this.page.waitForSelector('.modal-frame', { state: 'hidden', timeout: 30000 }).catch(() => null),
      this.page.waitForSelector('text=Saving...', { state: 'hidden', timeout: 30000 }).catch(() => null),
    ]);

    const avatar = this.page.locator("//img[@class='MuiAvatar-img']");
    await expect(avatar).toBeVisible();
    await avatar.first().click();

    const logoutOption = this.page.locator("//span[normalize-space()='Logout']");
    await expect(logoutOption).toBeVisible({ timeout: 10000 });

    // Click logout and wait for login page navigation or network idle
    await Promise.all([
      this.page.waitForLoadState('networkidle'),
      logoutOption.first().click(),
    ]).catch(() => {});

    try {
      await expect(this.page).toHaveURL(/login/, { timeout: 10000 });
    } catch {
      await expect(this.emailInput).toBeVisible({ timeout: 10000 });
    }
  }
}
