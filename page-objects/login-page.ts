import { expect, Locator, Page } from '@playwright/test'
import { Commons } from './commons'

export class LoginPage extends Commons {
  private readonly demoProfile: (profileName: string) => Locator
  private readonly usernameInput: Locator
  private readonly passwordInput: Locator
  private readonly userProfileImage: Locator

  constructor(page: Page) {
    super(page)
    this.demoProfile = (profileName) => page.getByText(profileName)
    this.usernameInput = page.getByPlaceholder('Login')
    this.passwordInput = page.getByPlaceholder('Password')
    this.userProfileImage = page.locator('.dropdown-toggle .photouserphoto')
  }

  async login(demoProfile: string, username: string, password: string) {
    await this.page.goto('/')
    await this.demoProfile(demoProfile).click()
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.actionButton('Login').click()
  }

  async verifyUserIsLoggedIn() {
    await expect(this.userProfileImage).toBeVisible()
  }
}
