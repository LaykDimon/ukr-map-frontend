describe('Navigation', () => {
  beforeEach(() => {
    cy.stubPersonsApi();
  });

  it('should display the navbar with Map, Statistics, Timeline links', () => {
    cy.visit('/');
    cy.contains('a', 'Map').should('be.visible');
    cy.contains('a', 'Statistics').should('be.visible');
    cy.contains('a', 'Timeline').should('be.visible');
  });

  it('should not show Admin link for non-admin users', () => {
    cy.login('student');
    cy.visit('/');
    cy.contains('a', 'Admin').should('not.exist');
  });

  it('should show Admin link for admin users', () => {
    cy.login('admin');
    cy.visit('/');
    cy.contains('a', 'Admin').should('be.visible');
  });

  it('should navigate to Statistics page', () => {
    cy.visit('/');
    cy.contains('a', 'Statistics').click();
    cy.url().should('include', '/statistics');
  });

  it('should navigate to Timeline page', () => {
    cy.visit('/');
    cy.contains('a', 'Timeline').click();
    cy.url().should('include', '/timeline');
  });

  it('should navigate back to Map', () => {
    cy.visit('/statistics');
    cy.contains('a', 'Map').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should navigate to Admin page as admin', () => {
    cy.login('admin');
    cy.visit('/');
    cy.contains('a', 'Admin').click();
    cy.url().should('include', '/admin');
  });
});
