import { test, expect } from '@playwright/test';

test.describe('Rovno.dev Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('home page loads and displays hero section', async ({ page }) => {
    // Check that the page title is correct
    await expect(page).toHaveTitle(/Rovno.dev/);

    // Check that the hero heading is visible
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText('РАЗРАБОТКА');

    // Check that the header is present
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // Check that the footer is present
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('home page has working navigation links', async ({ page }) => {
    // Click on "Проекты" link in the header
    const projectsLink = page.locator('nav a', { hasText: 'Проекты' });
    await expect(projectsLink).toBeVisible();
    await projectsLink.click();

    // Should navigate to the projects page (external link to dprofile)
    await expect(page).toHaveURL(/dprofile/);
  });

  test('home page displays selected works section', async ({ page }) => {
    // Scroll to the selected works section
    const selectedWorksHeading = page.locator('h2', { hasText: 'ИЗБРАННЫЕ ПРОЕКТЫ' });
    await expect(selectedWorksHeading).toBeVisible();

    // Check that project cards are rendered
    const projectCards = page.locator('[data-slot="card"]');
    await expect(projectCards.first()).toBeVisible();
  });

  test('home page displays services section', async ({ page }) => {
    // Scroll to the services section
    const servicesHeading = page.locator('h2', { hasText: 'НАШИ УСЛУГИ' });
    await expect(servicesHeading).toBeVisible();

    // Check that service cards are rendered
    const serviceCards = page.locator('[data-slot="card"]');
    await expect(serviceCards).toHaveCount(4);
  });

  test('home page has working CTA buttons', async ({ page }) => {
    // Check the "Бесплатный аудит проекта" button
    const auditButton = page.locator('a', { hasText: 'Бесплатный аудит проекта' });
    await expect(auditButton).toBeVisible();
    await expect(auditButton).toHaveAttribute('href', /forms\.yandex/);

    // Check the "Наши проекты" button
    const projectsButton = page.locator('a', { hasText: 'Наши проекты' });
    await expect(projectsButton).toBeVisible();
    await expect(projectsButton).toHaveAttribute('href', /dprofile/);
  });

  test('about page loads correctly', async ({ page }) => {
    await page.goto('/about');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Rovno.dev/);

    // Check that the hero section is visible
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText('Создаем цифровые продукты');

    // Check that expert cards are rendered
    const expertCards = page.locator('[data-slot="card"]');
    await expect(expertCards).toHaveCount(3);
  });

  test('about page expert cards have correct links', async ({ page }) => {
    await page.goto('/about');

    // Click on the first expert card
    const firstExpertCard = page.locator('a[href^="/"]').first();
    await expect(firstExpertCard).toBeVisible();
    await firstExpertCard.click();

    // Should navigate to the expert page
    await expect(page).toHaveURL(/\/niyazgim/);
  });

  test('expert page loads correctly', async ({ page }) => {
    await page.goto('/niyazgim');

    // Check that the expert name is visible
    const expertName = page.locator('h1');
    await expect(expertName).toBeVisible();
    await expect(expertName).toContainText('Нияз Гимадиев');

    // Check that the tags are visible
    const tags = page.locator('[data-slot="badge"]');
    await expect(tags.first()).toBeVisible();

    // Check that the tabs are visible
    const tabs = page.locator('[data-slot="tabs-trigger"]');
    await expect(tabs).toHaveCount(1);
    await expect(tabs).toContainText('Проекты');
  });

  test('expert page displays projects', async ({ page }) => {
    await page.goto('/niyazgim');

    // Check that project cards are rendered
    const projectCards = page.locator('[data-slot="card"]');
    await expect(projectCards.first()).toBeVisible();
  });

  test('project page loads correctly', async ({ page }) => {
    await page.goto('/vanguard');

    // Check that the project title is visible
    const projectTitle = page.locator('h1');
    await expect(projectTitle).toBeVisible();
    await expect(projectTitle).toContainText('Vanguard');

    // Check that the description is visible
    const description = page.locator('p');
    await expect(description.first()).toBeVisible();

    // Check that the tech stack badges are visible
    const techBadges = page.locator('[data-slot="badge"]');
    await expect(techBadges.first()).toBeVisible();
  });

  test('project page displays metrics', async ({ page }) => {
    await page.goto('/vanguard');

    // Check that the metrics section is visible
    const metricsHeading = page.locator('h2', { hasText: 'Результаты внедрения' });
    await expect(metricsHeading).toBeVisible();

    // Check that metric cards are rendered
    const metricCards = page.locator('[data-slot="card"]');
    await expect(metricCards).toHaveCount(3);
  });

  test('project page has working demo button', async ({ page }) => {
    await page.goto('/vanguard');

    // Check the "Запустить демо" button
    const demoButton = page.locator('a', { hasText: 'Запустить демо' });
    await expect(demoButton).toBeVisible();
    await expect(demoButton).toHaveAttribute('href', /dprofile/);
  });

  test('contacts page loads correctly', async ({ page }) => {
    await page.goto('/contacts');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/Rovno.dev/);

    // Check that the hero section is visible
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText('ЮРИДИЧЕСКАЯ ИНФОРМАЦИЯ');

    // Check that the company details card is visible
    const companyDetailsCard = page.locator('h2', { hasText: 'Реквизиты компании' });
    await expect(companyDetailsCard).toBeVisible();

    // Check that the documents card is visible
    const documentsCard = page.locator('h2', { hasText: 'Документы' });
    await expect(documentsCard).toBeVisible();
  });

  test('contacts page displays certificates', async ({ page }) => {
    await page.goto('/contacts');

    // Check that the certificates section is visible
    const certificatesHeading = page.locator('h2', { hasText: 'Сертификаты и лицензии' });
    await expect(certificatesHeading).toBeVisible();

    // Check that certificate cards are rendered
    const certificateCards = page.locator('[data-slot="card"]');
    await expect(certificateCards).toHaveCount(6); // 2 from details + 4 certificates
  });

  test('404 page for non-existent routes', async ({ page }) => {
    await page.goto('/non-existent-page');

    // Check that the page shows a 404 error
    await expect(page.locator('body')).toBeVisible();
    // The app should show a not found message
    await expect(page.locator('h1, h2')).toContainText(/404|not found/i);
  });

  test('theme switcher works', async ({ page }) => {
    // Check that the theme switcher button is visible
    const themeSwitcher = page.locator('button[aria-label="Поменять тему"]');
    await expect(themeSwitcher).toBeVisible();

    // Click the theme switcher
    await themeSwitcher.click();

    // Check that the dropdown menu appears
    const dropdownMenu = page.locator('[data-slot="dropdown-menu-content"]');
    await expect(dropdownMenu).toBeVisible();

    // Click on "Тёмная" option
    const darkOption = dropdownMenu.locator('span', { hasText: 'Тёмная' });
    await expect(darkOption).toBeVisible();
    await darkOption.click();

    // Check that the dark class is added to the html element
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('mobile bottom app bar is visible on small screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 390, height: 844 });

    // Check that the bottom app bar is visible
    const bottomAppBar = page.locator('nav[aria-label="Bottom app bar"]');
    await expect(bottomAppBar).toBeVisible();

    // Check that the navigation links are present
    const navLinks = bottomAppBar.locator('a');
    await expect(navLinks).toHaveCount(4);
  });

  test('header navigation links work correctly', async ({ page }) => {
    // Check that the header has the correct number of navigation links
    const headerNav = page.locator('header nav');
    const navLinks = headerNav.locator('a');
    await expect(navLinks).toHaveCount(3);

    // Check that the "О нас" link navigates to the about page
    const aboutLink = navLinks.filter({ hasText: 'О нас' });
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();
    await expect(page).toHaveURL('/about');
  });

  test('footer contains social media links', async ({ page }) => {
    // Scroll to the footer
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();

    // Check that social media icons are present
    const socialLinks = footer.locator('a[target="_blank"]');
    await expect(socialLinks.first()).toBeVisible();
  });

  test('page has correct meta tags', async ({ page }) => {
    // Check that the page has a description meta tag
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /Rovno.dev/);
  });
});
