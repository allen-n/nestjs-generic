import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Logger } from '@nestjs/common';
/**
 * Injects the user into the request object if successful:
 * `{request & {user: {userId: number, email:string}}}`
 * @link https://docs.nestjs.com/security/authentication#implementing-passport-jwt
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  async canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    // return super.canActivate(context);
    const result = (await super.canActivate(context)) as boolean;
    if (!result) {
      throw new UnauthorizedException('Authorization failed.');
    }
    return result;
  }

  handleRequest(err, user, info, context, status) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      this.logger.error(info);
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
