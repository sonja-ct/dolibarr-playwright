import { test, expect } from '@playwright/test'
import { PageManager } from '../page-objects/page-manager'

let pageManager: PageManager

test('Verify home page', async ({ page }) => {
  await page.context().clearCookies()
  pageManager = new PageManager(page)

  await pageManager
    .getLoginPage()
    .login('Company or freelance selling service only', 'demo', 'demo')
  await pageManager.getLoginPage().verifyUserIsLoggedIn()
})
