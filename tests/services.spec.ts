import { Page, test } from '@playwright/test'
import { PageManager } from '../page-objects/page-manager'
import { generateRandomData, generateRandomNumber } from '../utils/generators'

test.describe('Services creation', () => {
  test('Validate creation of service', async ({ page }) => {
    let pageManager: PageManager
    let productRef: string
    let label: string

    await test.step('Given user is on Services page', async () => {
      ;({ pageManager, productRef, label } = await prepareService(page))
    })

    await test.step('When user creates new service with product ref and label', async () => {
      await pageManager
        .getServicesPage()
        .createNewService(productRef, label, false)
    })

    await test.step('Then new service is created', async () => {
      await pageManager
        .getServicesPage()
        .verifyNewServiceIsCreated(productRef, label)
    })
  })

  test('Validate creation of service with sale price', async ({ page }) => {
    let pageManager: PageManager
    let productRef: string
    let label: string
    const price = generateRandomNumber().toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    await test.step('Given user is on Services page', async () => {
      ;({ pageManager, productRef, label } = await prepareService(page))
    })

    await test.step('When user creates new service with product ref and label', async () => {
      await pageManager
        .getServicesPage()
        .createNewService(productRef, label, true, price)
    })

    await test.step('Then new service is created', async () => {
      await pageManager
        .getServicesPage()
        .verifyNewServiceIsCreated(productRef, label)
      await pageManager.getServicesPage().verifyServicePrice(price)
    })
  })

  const invalidFields = [
    {
      title: 'empty product ref',
      override: { productRef: '' },
      expectedErrorMessage: "Field 'Product ref.' is required",
    },
    {
      title: 'empty label',
      override: { label: '' },
      expectedErrorMessage: "Field 'Label' is required",
    },
  ]
  for (const { title, override, expectedErrorMessage } of invalidFields) {
    test(`Validate creation of service with ${title}`, async ({ page }) => {
      let pageManager: PageManager
      let productRef: string
      let label: string

      await test.step('Given user is on Services page', async () => {
        ;({ pageManager, productRef, label } = await prepareService(
          page,
          override,
        ))
      })

      await test.step('When user creates new service with product ref and label', async () => {
        await pageManager
          .getServicesPage()
          .createNewService(productRef, label, false)
      })

      await test.step('Then error notification is displayed', async () => {
        await pageManager
          .getNotifications()
          .verifyNotificationIsDisplayed(expectedErrorMessage)
      })
    })
  }
})

async function prepareService(
  page: Page,
  overrides?: { productRef?: string; label?: string },
) {
  const pageManager = new PageManager(page)
  const { name, alias } = generateRandomData()

  await pageManager.getServicesPage().navigateToServices()

  return {
    pageManager,
    productRef: overrides?.productRef ?? name,
    label: overrides?.label ?? alias,
  }
}
