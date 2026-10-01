import { UserService } from './user-service';
// angular testing environment
import { TestBed } from '@angular/core/testing';

import { provideHttpClient } from '@angular/common/http';
import {provideHttpClientTesting,HttpTestingController} from '@angular/common/http/testing';
describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should return user',()=>{
    service.getUserById(1).subscribe(user => {
      expect(user.name).toBe('Nikunj');
    });
    
    
  });
  it('should return user balance',()=>{
    service.getUserById(1).subscribe(user => {
      expect(user.balance).toBe(5000.00);
    });
  });
  it('should return user',()=>{
    service.getUserById(2).subscribe(user => {
      expect(user.name).toBe('Sameer P');
    });
    
  });
  //npx ng test --include=src/app/service/user-service.spec.ts

});
