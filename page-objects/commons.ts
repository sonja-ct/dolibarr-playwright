import { Locator, Page, expect } from '@playwright/test'

export class Commons {
  protected readonly page: Page
  protected readonly tableCell: Locator
  protected readonly actionButton: (actionName: string) => Locator
  protected readonly actionButtonLink: (actionName: string) => Locator
  protected readonly formArea: Locator
  protected readonly leftMenuActionLink: (actionName: string) => Locator
  protected readonly topPageTitle: Locator
  protected readonly searchIcon: Locator
  protected readonly rightPaginationArrow: Locator

  constructor(page: Page) {
    this.page = page
    this.tableCell = page.locator('tbody tr td')
    this.actionButton = (actionName: string) =>
      page.getByRole('button', { name: actionName })
    this.actionButtonLink = (actionName: string) =>
      page.getByRole('link', { name: actionName, exact: true })
    this.formArea = page.locator('#dragDropAreaTabBar')
    this.leftMenuActionLink = (actionName: string) =>
      page.locator('.blockvmenufirst').locator(actionName)
    this.topPageTitle = page.locator('.toptitle')
    this.searchIcon = page.locator('[name="button_search_x"]')
    this.rightPaginationArrow = page.locator('[title="Next"]')
  }

  async verifyElementContainsText(element: Locator, name: string) {
    await expect(
      element,
      `Expected element to contain text: "${name}"`,
    ).toContainText(name)
  }

  async fillTableCell(locatorId: string, data: string) {
    await this.tableCell.locator(locatorId).fill(data)
  }
}
