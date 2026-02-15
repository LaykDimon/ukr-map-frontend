describe('Map Page', () => {
  beforeEach(() => {
    cy.stubPersonsApi();
    cy.login('student');
    cy.visit('/');
    cy.wait('@getPersons');
  });

  it('should render the Leaflet map container', () => {
    cy.get('.leaflet-container').should('be.visible');
  });

  it('should display map tile layers', () => {
    cy.get('.leaflet-tile-pane').should('exist');
    cy.get('.leaflet-tile').should('have.length.greaterThan', 0);
  });

  it('should show marker clusters on the map', () => {
    cy.get('.leaflet-marker-pane').should('exist');
  });

  it('should show the search panel for logged-in users', () => {
    cy.get('input[placeholder="Search a famous person..."]').should('be.visible');
  });

  it('should show the filter panel for logged-in users', () => {
    cy.contains('Filters').should('be.visible');
    cy.contains('Category').should('be.visible');
  });

  it('should show the reset view button', () => {
    cy.get('.leaflet-control').should('exist');
  });
});

describe('Map Page (Guest)', () => {
  beforeEach(() => {
    cy.stubPersonsApi();
    cy.visit('/');
    cy.wait('@getPersons');
  });

  it('should render the map for guests', () => {
    cy.get('.leaflet-container').should('be.visible');
  });

  it('should show Login button for guests', () => {
    cy.contains('button', 'Log In').should('be.visible');
  });

  it('should not show the search panel for guests', () => {
    cy.get('input[placeholder="Search a famous person..."]').should('not.exist');
  });

  it('should not show the filter panel for guests', () => {
    cy.contains('Filters').should('not.exist');
  });
});
