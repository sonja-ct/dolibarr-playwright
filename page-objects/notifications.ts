import { expect, Locator, Page } from '@playwright/test'
import { Commons } from './commons'

export class Notifications extends Commons {
  private readonly errorNotification: Locator

  constructor(page: Page) {
    super(page)
    this.errorNotification = page.locator('.jnotify-message')
  }

  async verifyNotificationIsDisplayed(message: string) {
    await expect(this.errorNotification).toContainText(message)
  }
}
