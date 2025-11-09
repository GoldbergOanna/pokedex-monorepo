import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiService } from '@core/api/api.service';
import { of, throwError } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let apiServiceSpy: jest.Mocked<ApiService>;

  beforeEach(() => {
    localStorage.clear();

    const spy: Partial<jest.Mocked<ApiService>> = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [AuthService, { provide: ApiService, useValue: spy }],
    });

    service = TestBed.inject(AuthService);
    apiServiceSpy = TestBed.inject(ApiService) as jest.Mocked<ApiService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and save token', () => {
    const mockToken = 'abc123';
    apiServiceSpy.post.mockReturnValue(of({ accessToken: mockToken }));

    service.login('test@example.com', 'password').subscribe();

    expect(apiServiceSpy.post).toHaveBeenCalledWith('auth/login', {
      email: 'test@example.com',
      password: 'password',
    });
    expect(service.getAccessToken()).toBe(mockToken);
    expect(localStorage.getItem('accessToken')).toBe(mockToken);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should handle login errors', () => {
    apiServiceSpy.post.mockReturnValue(
      throwError(() => new Error('Invalid credentials')),
    );

    service.login('bad@example.com', 'wrong').subscribe((result) => {
      expect(result).toBeNull();
    });
  });

  it('should logout and clear token', () => {
    localStorage.setItem('accessToken', 'test-token');
    service['_isAuthenticated'].set('test-token');

    service.logout();

    expect(service.getAccessToken()).toBeNull();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });
});
