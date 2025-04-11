import { Page, expect } from '@playwright/test'

export class DashboardPage {
  private readonly page: Page

  constructor(page: Page) {
    this.page = page
  }
}
