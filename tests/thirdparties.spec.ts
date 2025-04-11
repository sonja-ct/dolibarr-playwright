import { Page, test } from '@playwright/test'
import { PageManager } from '../page-objects/page-manager'
import { generateRandomData } from '../utils/generators'

test.describe.configure({ mode: 'serial' })

test.describe('Third party creation', () => {
  const partyRoles = [
    [['Customer'], ['C']],
    [['Vendor'], ['V']],
    [['Prospect'], ['P']],
    [
      ['Customer', 'Vendor'],
      ['C', 'V'],
    ],
  ]
  for (const [roleNames, roleTypes] of partyRoles) {
    test(`Validate creation of ${roleNames}`, async ({ page }) => {
      let pageManager: PageManager
      let thirdPartyName: string
      let thirdPartyAlias: string

      await test.step('Given user is on Third party page', async () => {
        ;({ pageManager, thirdPartyName, thirdPartyAlias } =
          await prepareThirdParty(page, { name: '' }))
      })
      await test.step('When user creates third party with name, alis and role', async () => {
        await pageManager
          .getThirdPartiesPage()
          .createNewThirdParty(thirdPartyName, thirdPartyAlias, ...roleNames)
      })

      await test.step('Then new third party is created', async () => {
        await pageManager
          .getThirdPartiesPage()
          .verifyNewThirdPartyIsCreated(
            thirdPartyName,
            thirdPartyAlias,
            ...roleTypes,
          )
      })
    })
  }

  test.only('Validate creation of new third party - Empty name', async ({
    page,
  }) => {
    let pageManager: PageManager
    let thirdPartyName: string
    let thirdPartyAlias: string

    await test.step('Given user is on Third party page', async () => {
      ;({ pageManager, thirdPartyName, thirdPartyAlias } =
        await prepareThirdParty(page, { name: '' }))
    })

    await test.step('When user tries to create third party with empty name', async () => {
      await pageManager
        .getThirdPartiesPage()
        .createNewThirdParty(thirdPartyName, thirdPartyAlias, 'Customer')
    })

    await test.step('Then error notification is displayed', async () => {
      await pageManager
        .getNotifications()
        .verifyNotificationIsDisplayed("Field 'Third-party name' is required")
    })
  })
})

test('Validate new third party appears on the list view', async ({ page }) => {
  const { pageManager, thirdPartyName, thirdPartyAlias } =
    await prepareThirdParty(page)

  await pageManager
    .getThirdPartiesPage()
    .createNewThirdParty(thirdPartyName, thirdPartyAlias, 'Customer', 'Vendor')
  await pageManager
    .getThirdPartiesPage()
    .verifyThirdPartyExistsInList(
      true,
      thirdPartyName,
      thirdPartyAlias,
      'C',
      'V',
    )
})

test.describe('Third party modification', () => {
  test('Validate modification of previously created third party', async ({
    page,
  }) => {
    let { pageManager, thirdPartyName, thirdPartyAlias } =
      await prepareThirdParty(page)
    let { name: newThirdPartyName, alias: newThirdPartyAlias } =
      generateRandomData()

    await pageManager
      .getThirdPartiesPage()
      .createNewThirdParty(thirdPartyName, thirdPartyAlias, 'Customer')

    await pageManager
      .getThirdPartiesPage()
      .modifyPreviouslyCreatedThirdPartyFromList(
        thirdPartyName,
        thirdPartyAlias,
        newThirdPartyName,
        newThirdPartyAlias,
        'Customer',
        'Prospect',
      )

    await pageManager
      .getThirdPartiesPage()
      .verifyThirdPartyExistsInList(
        true,
        newThirdPartyName,
        newThirdPartyAlias,
        'P',
        'C',
      )
  })

  test('Validate deletion of previously created third party', async ({
    page,
  }) => {
    const { pageManager, thirdPartyName, thirdPartyAlias } =
      await prepareThirdParty(page)

    await pageManager
      .getThirdPartiesPage()
      .createNewThirdParty(thirdPartyName, thirdPartyAlias, 'Customer')
    await pageManager
      .getThirdPartiesPage()
      .deletePreviouslyCreatedThirdPartyFromList(thirdPartyName)

    await pageManager
      .getNotifications()
      .verifyNotificationIsDisplayed('Record deleted')
    await pageManager
      .getThirdPartiesPage()
      .verifyThirdPartyExistsInList(
        false,
        thirdPartyName,
        thirdPartyAlias,
        'C',
        'V',
      )
  })
})

test.describe('Third Party Filters', () => {
  const thirdPartyNatureList = [
    ['Customer', 'C'],
    ['Vendor', 'V'],
    ['Prospect', 'P'],
  ]

  for (const [
    thirdPartyNatureName,
    thirdPartyNatureShort,
  ] of thirdPartyNatureList) {
    test(`Validate filter by nature of third party ${thirdPartyNatureName}`, async ({
      page,
    }) => {
      const pageManager = new PageManager(page)
      await pageManager.getThirdPartiesPage().navigateToThirdParties()

      await pageManager
        .getThirdPartiesPage()
        .filterByThirdPartyNature(
          'AutoCompany',
          thirdPartyNatureName,
          thirdPartyNatureShort,
        )
    })
  }
})

async function prepareThirdParty(
  page: Page,
  overrides?: { name?: string; alias?: string },
) {
  const pageManager = new PageManager(page)
  const { name, alias } = generateRandomData()

  await pageManager.getThirdPartiesPage().navigateToThirdParties()

  return {
    pageManager,
    thirdPartyName: overrides?.name ?? name,
    thirdPartyAlias: overrides?.alias ?? alias,
  }
}
