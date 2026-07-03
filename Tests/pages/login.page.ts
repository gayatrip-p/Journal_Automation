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
    await this.page.goto('https://dev.jrnl.com/login');
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
}
