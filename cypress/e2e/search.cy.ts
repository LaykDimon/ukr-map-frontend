describe('Search Panel', () => {
  beforeEach(() => {
    cy.stubPersonsApi();
    cy.login('student');
    cy.visit('/');
    cy.wait('@getPersons');
  });

  it('should filter results as user types', () => {
    cy.intercept('GET', '**/persons/search*', {
      body: [
        {
          person: {
            id: 1,
            name: 'Taras Shevchenko',
            lat: 49.0,
            lng: 30.5,
            views: 100000,
            rating: 99,
          },
          similarity: 0.95,
        },
      ],
    }).as('searchApi');

    cy.get('input[placeholder="Search a famous person..."]').type('Taras');
    cy.wait('@searchApi');
    cy.contains('Taras Shevchenko').should('be.visible');
  });

  it('should show "No results" when nothing matches', () => {
    cy.intercept('GET', '**/persons/search*', { body: [] }).as('searchEmpty');
    cy.get('input[placeholder="Search a famous person..."]').type('zzzzzzz');
    cy.wait('@searchEmpty');
    cy.contains('No results').should('be.visible');
  });

  it('should clear search when X button is clicked', () => {
    cy.get('input[placeholder="Search a famous person..."]').type('Taras');
    cy.get('[aria-label="Clear search"]').click();
    cy.get('input[placeholder="Search a famous person..."]').should('have.value', '');
  });

  it('should clear search on Escape key', () => {
    cy.get('input[placeholder="Search a famous person..."]').type('Taras');
    cy.get('input[placeholder="Search a famous person..."]').type('{esc}');
    cy.get('input[placeholder="Search a famous person..."]').should('have.value', '');
  });

  it('should allow selecting max people count', () => {
    cy.get('select').first().select('100');
    cy.get('select').first().should('have.value', '100');
  });
});
