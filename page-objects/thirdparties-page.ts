import { expect, Locator, Page } from '@playwright/test'
import { Commons } from './commons'
import { ButtonsAndLinks } from '../constants/buttons-and-links'

export class ThirdPartiesPage extends Commons {
  private customerNumber: any
  private supplierCode: any

  private readonly thirdPartyNameSearchBox: Locator
  private readonly thirdPariesTableRows: Locator
  private readonly selectThirdPartyCheckbox: (thirdPartyName: string) => Locator
  private readonly selectActionDropdown: Locator
  private readonly selectThirdPartyNatureDropdown: Locator
  private readonly selectActionDropdownOption: (actionName: string) => Locator
  private readonly confirmActionDropdown: Locator

  constructor(page: Page) {
    super(page)

    //third party list

    this.thirdPartyNameSearchBox = page.locator('[name="search_nom"]')
    this.thirdPariesTableRows = page.locator('.tagtable tbody .oddeven')
    this.selectThirdPartyCheckbox = (thirdPartyName: string) =>
      this.thirdPariesTableRows
        .filter({ hasText: thirdPartyName })
        .getByRole('checkbox')

    //dropdowns
    this.selectActionDropdown = page.locator('#select2-massaction-container')
    this.selectThirdPartyNatureDropdown = page.locator(
      '#select2-search_type-container',
    )

    this.selectActionDropdownOption = (actionName: string) =>
      page.getByRole('option', { name: actionName })

    this.confirmActionDropdown = page.locator('#confirm')
  }

  async navigateToThirdParties() {
    await this.page.goto('/')
    await this.actionButtonLink(ButtonsAndLinks.upperMenu.thirdParty).click()
    await expect(this.topPageTitle).toContainText('Third Parties/Contacts')
  }

  async createNewThirdParty(
    name: string,
    aliasName: string,
    ...types: string[]
  ) {
    await this.leftMenuActionLink(
      ButtonsAndLinks.leftMenu.createNewThirdParty,
    ).click()
    await this.fillTableCell('#name', name)
    await this.fillTableCell('#name_alias_input', aliasName)
    for (const type of types) {
      await this.checkboxTableCell(type)
    }

    this.customerNumber = await this.page
      .locator('#customer_code')
      .getAttribute('value')

    this.supplierCode = await this.page
      .locator('#supplier_code')
      .getAttribute('value')
    await this.actionButton(ButtonsAndLinks.createThirdParty).click()
  }

  async verifyNewThirdPartyIsCreated(
    name: string,
    aliasName: string,
    ...types: string[]
  ) {
    await this.verifyElementContainsText(this.formArea, name)
    await this.verifyElementContainsText(this.formArea, aliasName)

    const isCustomer = types.includes('C') || types.includes('P')
    const isVendor = types.includes('V')

    if (isCustomer && isVendor) {
      console.log(
        `Customer #: ${this.customerNumber}, Vendor #: ${this.supplierCode}`,
      )
      await this.verifyElementContainsText(this.formArea, this.customerNumber)
      await this.verifyElementContainsText(this.formArea, this.supplierCode)
    }
    // If only customer or prospect
    else if (isCustomer) {
      console.log(`Customer #: ${this.customerNumber}`)
      await this.verifyElementContainsText(this.formArea, this.customerNumber)
    }

    // If only vendor
    else if (isVendor) {
      console.log(`Vendor #: ${this.supplierCode}`)
      await this.verifyElementContainsText(this.formArea, this.supplierCode)
    } else {
      throw new Error(
        `Unsupported third party type combination: [${types.join(', ')}] — no valid type (C, P, or V) provided.`,
      )
    }
  }

  async verifyThirdPartyExistsInList(
    exists: boolean,
    thirdPartyName: string,
    thirdPartyAlias: string,
    ...types: string[]
  ) {
    await this.leftMenuActionLink(ButtonsAndLinks.leftMenu.list).click()
    await this.thirdPartyNameSearchBox.fill(thirdPartyName)
    await this.page.keyboard.press('Enter')

    if (exists) {
      await this.page.waitForSelector('.oddeven')
      const value = types.join('')
      for (let row of await this.thirdPariesTableRows.all()) {
        await expect(row.locator('td').nth(1)).toHaveText(
          thirdPartyName + ' (' + thirdPartyAlias + ')',
        )
        await expect(row.locator('td').nth(2)).toHaveText(this.customerNumber)
        await expect(row.locator('td').nth(4)).toHaveText(value)
      }
    } else {
      await expect(this.tableCell.getByText('No record found')).toBeVisible()
    }
  }

  async deletePreviouslyCreatedThirdPartyFromList(thirdPartyName: string) {
    await this.leftMenuActionLink(ButtonsAndLinks.leftMenu.list).click()
    await this.thirdPartyNameSearchBox.fill(thirdPartyName)
    await this.page.keyboard.press('Enter')

    await this.selectThirdPartyCheckbox(thirdPartyName).check()
    await this.selectActionDropdown.click()
    await this.selectActionDropdownOption('Delete').click()
    await this.actionButton(ButtonsAndLinks.confirm).click()
    await this.confirmActionDropdown.click()
    await this.confirmActionDropdown.selectOption('Yes')
    await this.actionButton(ButtonsAndLinks.validate).click()
  }

  async modifyPreviouslyCreatedThirdPartyFromList(
    thirdPartyName: string,
    thirdPartyAlias: string,
    thirdPartyNewName: string,
    thirdPartyNewAlias: string,
    ...types: string[]
  ) {
    await this.leftMenuActionLink(ButtonsAndLinks.leftMenu.list).click()
    await this.thirdPartyNameSearchBox.fill(thirdPartyName)
    await this.page.keyboard.press('Enter')

    await this.page
      .getByText(thirdPartyName + ' (' + thirdPartyAlias + ')')
      .click()
    await this.actionButtonLink(ButtonsAndLinks.modify).click()

    await this.createOrSaveThirdParty(
      thirdPartyNewName,
      thirdPartyNewAlias,
      ...types,
    )
  }

  async filterByThirdPartyNature(
    thirdPartyName: string,
    thirdPartyNature: string,
    type: string,
  ) {
    await this.leftMenuActionLink(ButtonsAndLinks.leftMenu.list).click()
    await this.selectThirdPartyNatureDropdown.click()
    await this.selectActionDropdownOption(thirdPartyNature).click()
    await this.thirdPartyNameSearchBox.fill(thirdPartyName)
    await this.searchIcon.click()

    await this.page.waitForSelector('.oddeven')

    let pageCounter = 1

    while (true) {
      console.log(`Checking page ${pageCounter}...`)

      const rows = this.thirdPariesTableRows
      const rowCount = await rows.count()

      for (let i = 0; i < rowCount; i++) {
        const row = rows.nth(i)
        const name = (await row.locator('td').nth(1).textContent())?.trim()
        const typeText =
          (await row.locator('td').nth(4).textContent())?.trim() ?? ''

        console.log(`▶ ${name} → ${typeText}`)
        expect(
          typeText,
          `Row "${name}" does not contain expected type "${type}"`,
        ).toContain(type)
      }

      const isNextVisible = await this.rightPaginationArrow.isVisible()

      if (isNextVisible) {
        await this.rightPaginationArrow.click()
        await this.page.waitForSelector('.oddeven')
        pageCounter++
      } else {
        console.log('Reached last page.')
        break
      }
    }
  }

  private async checkboxTableCell(name: string) {
    await this.tableCell.getByRole('checkbox', { name: name }).check()
  }

  private async createOrSaveThirdParty(
    name: string,
    aliasName: string,
    ...types: string[]
  ) {
    await this.fillTableCell('#name', name)
    await this.fillTableCell('#name_alias_input', aliasName)
    for (const type of types) {
      await this.checkboxTableCell(type)
    }

    this.customerNumber = await this.page
      .locator('#customer_code')
      .getAttribute('value')

    this.supplierCode = await this.page.locator('#supplier_code').textContent()

    await this.actionButton('Save').click()
  }
}
