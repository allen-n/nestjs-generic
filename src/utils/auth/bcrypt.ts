import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BcryptService {
  /**
   * Generate a secure hash (including a salt) for a password
   * By default, uses 10 rounds of salt, which is a good balance between security and performance
   * On a 2GHz machine, 10 rounds takes about 100ms to complete (10 hashes per second)
   * @param password
   * @returns
   */
  async hash(password: string) {
    return bcrypt.hash(password, 10);
  }

  /**
   * Checks if a given password matches a given hash
   * @param password
   * @param hash
   * @returns
   */
  async compare(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }
}
