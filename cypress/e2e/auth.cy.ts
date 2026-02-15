describe('Authentication', () => {
  beforeEach(() => {
    cy.stubPersonsApi();
  });

  it('should show login modal when Log In button is clicked', () => {
    cy.visit('/');
    cy.contains('button', 'Log In').click();
    cy.get('.modal-overlay').should('be.visible');
    cy.get('input[placeholder="Email"]').should('be.visible');
    cy.get('input[placeholder="Password"]').should('be.visible');
  });

  it('should close the modal when X is clicked', () => {
    cy.visit('/');
    cy.contains('button', 'Log In').click();
    cy.get('.modal-overlay').should('be.visible');
    cy.get('.close-x-btn').click();
    cy.get('.modal-overlay').should('not.exist');
  });

  it('should close the modal when overlay is clicked', () => {
    cy.visit('/');
    cy.contains('button', 'Log In').click();
    cy.get('.modal-overlay').click('topLeft');
    cy.get('.modal-overlay').should('not.exist');
  });

  it('should switch between login and registration forms', () => {
    cy.visit('/');
    cy.contains('button', 'Log In').click();
    // Default is login mode
    cy.contains('Вхід').should('be.visible');
    cy.get('input[placeholder="Username"]').should('not.exist');

    // Switch to registration
    cy.contains('button', 'Немає акаунту? Реєстрація').click();
    cy.contains('Створити акаунт').should('be.visible');
    cy.get('input[placeholder="Username"]').should('be.visible');

    // Switch back to login
    cy.contains('button', 'Вже є акаунт? Увійти').click();
    cy.contains('Вхід').should('be.visible');
  });

  it('should login successfully and show user info', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      username: 'TestUser',
      role: 'student',
    };

    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: { accessToken: 'fake-jwt', user: mockUser },
    }).as('loginRequest');

    cy.visit('/');
    cy.contains('button', 'Log In').click();
    cy.get('input[placeholder="Email"]').type('test@example.com');
    cy.get('input[placeholder="Password"]').type('password123');
    cy.get('.submit-btn').click();
    cy.wait('@loginRequest');

    // Modal should close and user info should appear
    cy.get('.modal-overlay').should('not.exist');
    cy.contains('TestUser').should('be.visible');
    cy.contains('Logout').should('be.visible');
  });

  it('should show error on failed login', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' },
    }).as('loginFailed');

    cy.visit('/');
    cy.contains('button', 'Log In').click();
    cy.get('input[placeholder="Email"]').type('wrong@example.com');
    cy.get('input[placeholder="Password"]').type('wrongpassword');
    cy.get('.submit-btn').click();
    cy.wait('@loginFailed');

    cy.get('.error-message').should('contain', 'Invalid credentials');
  });

  it('should logout and return to guest state', () => {
    cy.login('student');
    cy.visit('/');
    cy.wait('@getPersons');

    cy.contains('Test Student').should('be.visible');
    cy.contains('button', 'Logout').click();

    cy.contains('button', 'Log In').should('be.visible');
    cy.contains('Test Student').should('not.exist');
  });
});
