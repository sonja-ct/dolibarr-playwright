import { Page } from '@playwright/test'
import { LoginPage } from './login-page'
import { ThirdPartiesPage } from './thirdparties-page'
import { Notifications } from './notifications'
import { ServicesPage } from './services-page'

export class PageManager {
  private readonly page: Page
  private readonly loginPage: LoginPage
  private readonly thirdPartiesPage: ThirdPartiesPage
  private readonly servicesPage: ServicesPage
  private readonly notifications: Notifications

  constructor(page: Page) {
    this.page = page
    this.loginPage = new LoginPage(page)
    this.thirdPartiesPage = new ThirdPartiesPage(page)
    this.servicesPage = new ServicesPage(page)
    this.notifications = new Notifications(page)
  }

  getLoginPage() {
    return this.loginPage
  }

  getThirdPartiesPage() {
    return this.thirdPartiesPage
  }

  getServicesPage() {
    return this.servicesPage
  }

  getNotifications() {
    return this.notifications
  }
}
