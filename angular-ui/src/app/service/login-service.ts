import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs/internal/operators/map';

type LoginResponse = | { accessToken?: string; token?: string; jwt?: string } | string;

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    private readonly http = inject(HttpClient);

    //JWT: http://localhost:8083/login
    login(username: string, password: string) {
        return this.http.post<LoginResponse>('http://localhost:8083/login', { username, password })
            .pipe(
                map((response) => {
                    if (typeof response === 'string') {
                        return { accessToken: response };
                    }
                    const accessToken =
                        response.accessToken ??
                        response.token ??
                        response.jwt;
                    if (!accessToken) {
                        throw new Error('Login response did not contain a token.');
                    }
                    return { accessToken };
                })
            );
    }
}
