import { chromium } from '@playwright/test'
import fs from 'fs'

async function globalSetup() {
  const browser = await chromium.launch({})
  const page = await browser.newPage()

  await page.goto('https://demo.dolibarr.org')
  await page.getByText('Company or freelance selling service only').click()
  await page.getByPlaceholder('Login').fill('demo')
  await page.getByPlaceholder('Password').fill('demo')
  await page.click('input[type="submit"]')

  // Wait for the user to be logged in (some reliable UI element)
  await page.waitForSelector('#topmenu-login-dropdown')

  // Save storage state to file
  await page.context().storageState({ path: 'storage/state.json' })

  await browser.close()
}

export default globalSetup
