import { Injectable } from '@angular/core';
import {
    HttpEvent,
    HttpInterceptor,
    HttpHandler,
    HttpRequest,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Não adicionar token em requisições de login ou refresh
        if (this.isAuthRequest(request.url)) {
            return next.handle(request);
        }

        // Adicionar token se disponível
        const token = this.authService.getToken();
        if (token) {
            request = this.addToken(request, token);
        }

        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                // Se erro 401 (não autorizado) e não é refresh token
                if (error.status === 401 && !this.isAuthRequest(request.url)) {
                    return this.handle401Error(request, next);
                }

                return throwError(() => error);
            })
        );
    }

    private isAuthRequest(url: string): boolean {
        return url.includes('/auth/login') ||
            url.includes('/auth/refresh') ||
            url.includes('/auth/login-responsavel');
    }

    private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            const refreshToken = this.authService.getRefreshToken();

            if (refreshToken) {
                return this.authService.refreshAccessToken().pipe(
                    switchMap((response: any) => {
                        this.isRefreshing = false;
                        const newToken = response.accessToken || response.token;
                        this.refreshTokenSubject.next(newToken);
                        return next.handle(this.addToken(request, newToken));
                    }),
                    catchError((error) => {
                        this.isRefreshing = false;
                        // Se falhou o refresh, redirecionar para login
                        this.authService.logout();
                        this.router.navigate(['/login']);
                        return throwError(() => error);
                    })
                );
            } else {
                // Sem refresh token, fazer logout
                this.isRefreshing = false;
                this.authService.logout();
                this.router.navigate(['/login']);
                return throwError(() => new Error('No refresh token available'));
            }
        } else {
            // Aguardar o refresh token ser processado
            return this.refreshTokenSubject.pipe(
                filter(token => token != null),
                take(1),
                switchMap(token => {
                    return next.handle(this.addToken(request, token));
                })
            );
        }
    }
}
