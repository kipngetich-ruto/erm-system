import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditService } from './audit.service';
import { SKIP_AUDIT_KEY } from './decorators/skip-audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Skip if decorated with @SkipAudit()
    const skipAudit = this.reflector.get<boolean>(
      SKIP_AUDIT_KEY,
      context.getHandler(),
    );
    if (skipAudit) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const method = request.method;
    const url = request.url;
    const user = request.user; // from JWT guard – may be undefined
    const userId = user?.userId || null;
    const ip = request.ip || request.connection?.remoteAddress || null;
    const userAgent = request.headers['user-agent'] || null;

    const action = `${method} ${url}`;
    const resource = url;

    // Capture request body (sanitize sensitive fields)
    let details = null;
    if (request.body && Object.keys(request.body).length > 0) {
      // Clone and remove sensitive data (e.g., password)
      const sanitized = { ...request.body };
      if (sanitized.password) delete sanitized.password;
      if (sanitized.currentPassword) delete sanitized.currentPassword;
      if (sanitized.newPassword) delete sanitized.newPassword;
      if (sanitized.totp) delete sanitized.totp;
      details = sanitized;
    } else if (request.params && Object.keys(request.params).length > 0) {
      details = request.params;
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        // Success
        const statusCode = response.statusCode;
        this.auditService.log({
          userId,
          action,
          resource,
          details,
          ip,
          userAgent,
          status: statusCode < 400 ? 'success' : 'error',
        }).catch(err => console.error('Failed to log audit:', err));
      }),
      catchError((err) => {
        // Error
        const statusCode = err.status || 500;
        this.auditService.log({
          userId,
          action,
          resource,
          details,
          ip,
          userAgent,
          status: statusCode >= 400 ? 'error' : 'success',
        }).catch(logErr => console.error('Failed to log audit (error):', logErr));
        return throwError(() => err);
      }),
    );
  }
}