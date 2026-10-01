import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AccountRequestDTO } from '../generated/api-client';

export interface User {
    id: number;
    name: string;
    balance: number;
}
@Injectable({
    providedIn: 'root'
})
export class UserService {
    //Dependency injection for HttpClient to make HTTP requests
    //constructor(private http: HttpClient) {}
    private readonly http = inject(HttpClient);
    private readonly apiUrl = 'http://localhost:8081/v1/accounts';

    // get all users
    getAllUsers() {
        return this.http.get<User[]>(this.apiUrl + '/');
    }
    // get user by id
    getUserById(id: number) {
        return this.http.get<User>(`${this.apiUrl}/${id}`);
    }
    //create user
    createAccount(account: AccountRequestDTO) {
        return this.http.post<User>(
            this.apiUrl+'/',
            account
        );
    }
     
  
    // update user
    updateAccount(id: number, account: User) {
        return this.http.put<User>(
            `${this.apiUrl}/${id}`,
            account
        );
    }
    // delete user
    deleteAccount(id: number) {
        return this.http.delete(`${this.apiUrl}/${id}`);
        
    }
   

}
