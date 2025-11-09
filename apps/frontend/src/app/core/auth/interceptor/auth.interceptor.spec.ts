import { TestBed } from '@angular/core/testing';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../service/auth.service';
import { authInterceptor } from './auth.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

describe('AuthInterceptor (Jest)', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(() => {
    const authServiceMock = {
      getAccessToken: jest.fn(),
      logout: jest.fn(),
      login: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService) as jest.Mocked<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  it('should add Authorization header when token exists', () => {
    authService.getAccessToken.mockReturnValue('abc123');

    http.get('/data').subscribe();
    const req = httpMock.expectOne('/data');

    expect(req.request.headers.get('Authorization')).toBe('Bearer abc123');
    req.flush({});
  });

  it('should not add Authorization header when no token', () => {
    authService.getAccessToken.mockReturnValue(null);

    http.get('/data').subscribe();
    const req = httpMock.expectOne('/data');

    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should call logout on 401 response', () => {
    authService.getAccessToken.mockReturnValue('abc123');

    http.get('/protected').subscribe({
      error: () => {
        expect(authService.logout).toHaveBeenCalled();
      },
    });

    const req = httpMock.expectOne('/protected');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });
});
