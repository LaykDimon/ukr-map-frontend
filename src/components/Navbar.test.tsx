import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import personsReducer from '../store/personsSlice';
import filtersReducer from '../store/filtersSlice';
import Navbar from './Navbar';

// Build a fake JWT with a far-future expiry so isTokenExpired() returns false.
function makeFakeJwt() {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: 1, exp: Math.floor(Date.now() / 1000) + 86400 }));
  return `${header}.${payload}.fake-signature`;
}

function createTestStore(preloadedState?: any) {
  return configureStore({
    reducer: {
      auth: authReducer,
      persons: personsReducer,
      filters: filtersReducer,
    } as any,
    preloadedState,
  });
}

function renderWithProviders(
  ui: React.ReactElement,
  preloadedState?: any,
) {
  const store = createTestStore(preloadedState);
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>,
  );
}

describe('Navbar', () => {
  it('should render Map, Statistics, and Timeline links', () => {
    renderWithProviders(<Navbar />);
    expect(screen.getByText('Map')).toBeInTheDocument();
    expect(screen.getByText('Statistics')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
  });

  it('should NOT show Admin link for non-admin users', () => {
    renderWithProviders(<Navbar />);
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('should show Admin link for admin users', () => {
    renderWithProviders(<Navbar />, {
      auth: {
        user: { id: 1, email: 'a@b.com', username: 'admin', role: 'admin' },
        token: makeFakeJwt(),
      },
    });
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should NOT show Admin link for student users', () => {
    renderWithProviders(<Navbar />, {
      auth: {
        user: { id: 2, email: 's@b.com', username: 'student', role: 'student' },
        token: makeFakeJwt(),
      },
    });
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});
