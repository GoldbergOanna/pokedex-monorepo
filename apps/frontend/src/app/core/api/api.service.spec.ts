/// <reference types="jest" />

import { TestBed } from '@angular/core/testing';
import { ApiService } from './api.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

describe('ApiService', () => {
  let service: ApiService;
  let httpClientSpy: jest.Mocked<HttpClient>;

  beforeEach(() => {
    httpClientSpy = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
      head: jest.fn(),
      jsonp: jest.fn(),
      options: jest.fn(),
      patch: jest.fn(),
    } as unknown as jest.Mocked<HttpClient>;

    TestBed.configureTestingModule({
      providers: [ApiService, { provide: HttpClient, useValue: httpClientSpy }],
    });
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call HttpClient.get with correct URL and options', () => {
    const endpoint = 'test-endpoint';
    const options = { params: { foo: 'bar' } };
    const expectedResult = { data: 'test' };
    httpClientSpy.get.mockReturnValue(of(expectedResult));

    service
      .get<typeof expectedResult>(endpoint, options)
      .subscribe((result) => {
        expect(result).toEqual(expectedResult);
      });

    expect(httpClientSpy.get).toHaveBeenCalledWith(
      'http://localhost:3000/test-endpoint',
      options,
    );
  });

  it('should call HttpClient.post with correct URL, body and options', () => {
    const endpoint = 'test-endpoint';
    const body = { name: 'test' };
    const options = { headers: { foo: 'bar' } };
    const expectedResult = { success: true };
    httpClientSpy.post.mockReturnValue(of(expectedResult));

    service
      .post<typeof expectedResult, typeof body>(endpoint, body, options)
      .subscribe((result) => {
        expect(result).toEqual(expectedResult);
      });

    expect(httpClientSpy.post).toHaveBeenCalledWith(
      'http://localhost:3000/test-endpoint',
      body,
      options,
    );
  });

  it('should call HttpClient.put with correct URL, body and options', () => {
    const endpoint = 'test-endpoint';
    const body = { name: 'updated' };
    const options = { headers: { foo: 'bar' } };
    const expectedResult = { success: true };
    httpClientSpy.put.mockReturnValue(of(expectedResult));

    service
      .put<typeof expectedResult, typeof body>(endpoint, body, options)
      .subscribe((result) => {
        expect(result).toEqual(expectedResult);
      });

    expect(httpClientSpy.put).toHaveBeenCalledWith(
      'http://localhost:3000/test-endpoint',
      body,
      options,
    );
  });

  it('should call HttpClient.delete with correct URL and options', () => {
    const endpoint = 'test-endpoint';
    const options = { params: { id: 1 } };
    const expectedResult = { deleted: true };
    httpClientSpy.delete.mockReturnValue(of(expectedResult));

    service
      .delete<typeof expectedResult>(endpoint, options)
      .subscribe((result) => {
        expect(result).toEqual(expectedResult);
      });

    expect(httpClientSpy.delete).toHaveBeenCalledWith(
      'http://localhost:3000/test-endpoint',
      options,
    );
  });
});
