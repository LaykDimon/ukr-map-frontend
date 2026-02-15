import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/authSlice';
import personsReducer from '../store/personsSlice';
import filtersReducer from '../store/filtersSlice';
import Navbar from './Navbar';

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
        token: 'token',
      },
    });
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('should NOT show Admin link for student users', () => {
    renderWithProviders(<Navbar />, {
      auth: {
        user: { id: 2, email: 's@b.com', username: 'student', role: 'student' },
        token: 'token',
      },
    });
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});
