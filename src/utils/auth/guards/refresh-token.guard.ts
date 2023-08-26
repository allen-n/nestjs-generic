import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Injects the user into the request object if successful:
 * `{request & {user: {userId: number, email:string}}}`
 * @link https://docs.nestjs.com/security/authentication#implementing-passport-jwt
 */
@Injectable()
export class RefreshTokenGuard extends AuthGuard('jwt-refresh') {
  private readonly logger = new Logger(RefreshTokenGuard.name);

  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context, status) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      this.logger.error(info);
      throw err || new UnauthorizedException();
    }
    const authHeaders = context.switchToHttp().getRequest()
      .headers.authorization;
    const refreshToken: string = authHeaders.replace('Bearer', '').trim();
    return { ...user, refreshToken: refreshToken };
  }
}
