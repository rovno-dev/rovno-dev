import { ApiReferenceReact } from '@scalar/api-reference-react';
import '@scalar/api-reference-react/style.css'
import { Container } from '@/components/ui/container';

export default function Home() {
  return (
    <>
      <Container className='pt-8 pb-8'>
        <h1 className="text-display-4 sm:text-display-2">Rovno.dev Фейк АПИ</h1>
        <p className="text-(--on-bg-medium)">API для любой тестовой или образовательной задачи</p>
      </Container>
      <Container className='pt-8 pb-8'>
        <ApiReferenceReact
          configuration={{
            layout: 'classic',
            showDeveloperTools: 'never',
            url: 'https://petstore.swagger.io/v2/swagger.json',
            theme: 'none',
            hideDarkModeToggle: true,
            withDefaultFonts: false,
            customCss: `
            .scalar-app, 
            .dark-mode, 
            .light-mode {
              background-color: transparent !important;
              color: inherit !important;
            }
            [data-theme] .references-classic-content {
              background-color: transparent !important;
            }
            .references-classic,
            .references-classic-content,
            .scalar-card,
            .section-container {
              background-color: transparent !important;
            }

            .references-classic-header,
            .scalar-search-container {
              background-color: transparent !important;
            }

            .scalar-app {
              background-color: var(--bg) !important;
            }

            [data-theme='none'] .references-classic-content {
              background: none !important;
            }

            .scalar-app {
              background-color: transparent !important;
            }
            .references-classic {
              background-color: transparent !important;
            }
              .references-classic-content {
              padding: 0 !important;
              max-width: none !important;
            }

            .references-classic-sidebar {
              padding: 0 !important;
            }

            .section-container, 
            .references-classic-section {
              padding-inline: 0 !important;
              margin-inline: 0 !important;
            }

            .scalar-search-container {
              padding: 0 !important;
              margin: 0 !important;
            }
            .references-classic-header-container,
            .references-classic-content,
            .references-classic-sidebar,
            .references-classic-section {
              padding-inline: 0 !important;
              padding-left: 0 !important;
              padding-right: 0 !important;
            }

            .references-classic-container {
              padding: 0 !important;
              max-width: none !important;
            }

            .section-container {
              padding-inline: 0 !important;
            }

            .scalar-search-container {
              padding-inline: 0 !important;
              margin-inline: 0 !important;
            }
            .scalar-app {
              background-color: var(--bg) !important;
              --scalar-font: var(--font-sans) !important;
              --scalar-radius: var(--radius-lg) !important;

              --scalar-background-1: var(--bg) !important;
              --scalar-background-2: var(--card) !important;
              --scalar-background-3: var(--bg-disabled) !important;
              --scalar-background-accent: var(--primary-card) !important;

              --scalar-color-1: var(--on-bg-high) !important;
              --scalar-color-2: var(--on-bg-medium) !important;
              --scalar-color-3: var(--on-bg-low) !important;
              --scalar-color-accent: var(--primary) !important;
              
              --scalar-border-color: var(--outline) !important;
              --scalar-button-1: var(--primary) !important;
              --scalar-button-1-color: var(--on-primary) !important;
            }

            .references-classic-sidebar {
              background: var(--bg) !important;
              border-right: 1px solid var(--outline) !important;
            }
          `,
          }}
        />
      </Container >
    </>
  );
}
