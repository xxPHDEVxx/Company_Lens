import { http, HttpResponse, delay } from 'msw';
import { usersDb, mockToken } from '../data/users';
import type { AuthResponse } from '../../types/api';

export const authHandlers = [
  // Login
  http.post('/api/auth/login', async ({ request }) => {
    await delay(1000);
    const { email, password } = await request.json() as { email: string; password: string };
    
    // Simple mock authentication
    const user = usersDb.find(u => u.email === email);
    
    if (!user || password !== 'password123') {
      return HttpResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    const response: AuthResponse = {
      token: mockToken,
      user,
    };
    
    return HttpResponse.json(response);
  }),

  // Signup
  http.post('/api/auth/signup', async ({ request }) => {
    await delay(1000);
    const signupData = await request.json() as {
      email: string;
      password: string;
      name: string;
      companyId?: string;
    };
    
    // Check if user already exists
    if (usersDb.find(u => u.email === signupData.email)) {
      return HttpResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }
    
    // Create new user
    const newUser = {
      id: (usersDb.length + 1).toString(),
      email: signupData.email,
      name: signupData.name,
      companyId: signupData.companyId,
    };
    
    usersDb.push(newUser);
    
    const response: AuthResponse = {
      token: mockToken,
      user: newUser,
    };
    
    return HttpResponse.json(response, { status: 201 });
  }),

  // Get current user
  http.get('/api/auth/me', async ({ request }) => {
    await delay(500);
    
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.substring(7);
    if (token !== mockToken) {
      return HttpResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Return the first user as the current user
    return HttpResponse.json(usersDb[0]);
  }),

  // Logout
  http.post('/api/auth/logout', async () => {
    await delay(300);
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),
];