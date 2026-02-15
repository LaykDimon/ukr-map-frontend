describe('Admin Page', () => {
  beforeEach(() => {
    cy.stubPersonsApi();

    cy.intercept('GET', '**/proposed-edits*', {
      body: [
        {
          id: 1,
          personId: 1,
          person: { id: 1, name: 'Taras Shevchenko' },
          userId: 2,
          user: { id: 2, username: 'contributor1', email: 'c@test.com', role: 'student' },
          changes: {
            summary: {
              old: 'Old summary',
              new: 'Updated summary with more detail',
            },
          },
          comment: 'Improved the summary',
          status: 'pending',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
    }).as('getProposedEdits');

    cy.intercept('GET', '**/admin/stats', {
      body: { totalPersons: 100, totalUsers: 10 },
    }).as('getStats');
  });

  it('should load the admin page for admin users', () => {
    cy.login('admin');
    cy.visit('/admin');
    cy.contains('Admin').should('be.visible');
  });

  it('should display proposed edits moderation section', () => {
    cy.login('admin');
    cy.visit('/admin');
    cy.wait('@getProposedEdits');
    cy.contains('Proposed Edits').should('be.visible');
  });

  it('should show edit details with diff', () => {
    cy.login('admin');
    cy.visit('/admin');
    cy.wait('@getProposedEdits');
    cy.contains('Taras Shevchenko').should('be.visible');
    cy.contains('Old summary').should('be.visible');
    cy.contains('Updated summary with more detail').should('be.visible');
  });

  it('should allow filtering proposed edits by status', () => {
    cy.login('admin');
    cy.visit('/admin');
    cy.wait('@getProposedEdits');

    // Find the status filter select within the proposed edits section
    cy.contains('Proposed Edits')
      .parent()
      .find('select')
      .select('approved');
  });
});
