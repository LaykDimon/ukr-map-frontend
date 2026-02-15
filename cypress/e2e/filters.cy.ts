describe('Filter Panel', () => {
  beforeEach(() => {
    cy.stubPersonsApi();
    cy.login('student');
    cy.visit('/');
    cy.wait('@getPersons');
  });

  it('should display all filter controls', () => {
    cy.contains('Filters').should('be.visible');
    cy.contains('Category').should('be.visible');
    cy.contains('Birth place').should('be.visible');
    cy.contains('Birth year from').should('be.visible');
    cy.contains('Birth year to').should('be.visible');
  });

  it('should filter by category', () => {
    // The select should have populated category options from fixture data
    cy.get('select').contains('All categories');
    cy.get('select').last().select('writer');
    cy.get('select').last().should('have.value', 'writer');
  });

  it('should filter by birth place', () => {
    cy.get('input[placeholder="Type to filter..."]').type('Kyiv');
    cy.get('input[placeholder="Type to filter..."]').should('have.value', 'Kyiv');
  });

  it('should filter by birth year range', () => {
    cy.get('input[placeholder="e.g. 1800"]').type('1800');
    cy.get('input[placeholder="e.g. 1900"]').type('1900');
    cy.get('input[placeholder="e.g. 1800"]').should('have.value', '1800');
    cy.get('input[placeholder="e.g. 1900"]').should('have.value', '1900');
  });

  it('should show reset button when filters are active', () => {
    // Initially no reset button
    cy.contains('button', 'Reset filters').should('not.exist');

    // Set a filter
    cy.get('input[placeholder="Type to filter..."]').type('Kyiv');
    cy.contains('button', 'Reset filters').should('be.visible');
  });

  it('should reset all filters when reset button is clicked', () => {
    cy.get('input[placeholder="Type to filter..."]').type('Kyiv');
    cy.get('input[placeholder="e.g. 1800"]').type('1800');

    cy.contains('button', 'Reset filters').click();

    cy.get('input[placeholder="Type to filter..."]').should('have.value', '');
    cy.get('input[placeholder="e.g. 1800"]').should('have.value', '');
  });
});
