import '@testing-library/cypress/add-commands';

// Seed localStorage with an authenticated user session
Cypress.Commands.add('login', (role: string = 'student') => {
  const user = {
    id: 1,
    email: `test-${role}@example.com`,
    username: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    role,
  };
  const token = 'fake-jwt-token';

  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('token', token);
});

// Intercept the persons API with fixture data
Cypress.Commands.add('stubPersonsApi', () => {
  cy.intercept('GET', '**/persons*', {
    fixture: 'persons.json',
  }).as('getPersons');
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(role?: string): Chainable<void>;
      stubPersonsApi(): Chainable<void>;
    }
  }
}
