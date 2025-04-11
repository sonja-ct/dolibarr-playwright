import { expect, Page } from '@playwright/test'
import { Commons } from './commons'
import { Services } from '../constants/services'
import { ButtonsAndLinks } from '../constants/buttons-and-links'

export class ServicesPage extends Commons {
  constructor(page: Page) {
    super(page)
  }

  async navigateToServices() {
    await this.page.goto('/')
    await this.actionButtonLink(ButtonsAndLinks.upperMenu.services).click()
    await expect(this.topPageTitle).toContainText(Services.titleHeader)
  }

  async createNewService(
    productRef: string,
    label: string,
    ...additionInfo: any[]
  ) {
    await this.leftMenuActionLink(
      ButtonsAndLinks.leftMenu.createNewService,
    ).click()
    await this.fillTableCell('#ref', productRef)
    await this.fillTableCell('#label', label)

    if (additionInfo.includes(true)) {
      this.inputAdditionServiceInfo(additionInfo[1])
    }
    await this.actionButton(ButtonsAndLinks.createButton).click()
  }

  async inputAdditionServiceInfo(price: string) {
    await this.fillTableCell('[name="price"]', price)
  }

  async verifyNewServiceIsCreated(productRef: string, label: string) {
    await this.verifyElementContainsText(this.formArea, productRef)
    await this.verifyElementContainsText(this.formArea, label)
  }

  async verifyServicePrice(price: string) {
    await this.actionButtonLink('Selling prices').click()
    await expect(this.page.locator('tbody tr').nth(1)).toHaveText(
      'Selling price' + price + '  Excl. tax',
    )
  }
}
