import assert from 'assert';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { signupSchema } from '../validators/authValidator.js';
import { createBookingSchema } from '../validators/bookingValidator.js';
import { cacheService } from '../utils/cacheService.js';
import { AppError } from '../utils/AppError.js';

export async function runAllTests() {
  console.log('🧪 Starting CookMantra Backend Unit & Integration Test Suite...');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name} - ${err.message}`);
      failed++;
    }
  }

  // 1. Password Hashing Test
  await test('Password Hashing & Verification', async () => {
    const rawPass = 'Secret123!';
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(rawPass, salt);
    const isMatch = await bcrypt.compare(rawPass, hashed);
    assert.strictEqual(isMatch, true, 'Bcrypt compare should return true for correct password');
  });

  // 2. JWT Generation & Verification Test
  await test('JWT Token Generation & Verification', () => {
    const payload = { userId: 'user_123', role: 'user' };
    const secret = 'test_secret_key';
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    const decoded: any = jwt.verify(token, secret);
    assert.strictEqual(decoded.userId, 'user_123');
    assert.strictEqual(decoded.role, 'user');
  });

  // 3. Zod Signup Validation Test
  await test('Zod Signup Schema Validation - Success', async () => {
    const validBody = {
      name: 'Priya Patel',
      phone: '9876543210',
      email: 'priya@example.com',
      password: 'password123',
    };
    const parsed = await signupSchema.parseAsync({ body: validBody });
    assert.strictEqual(parsed.body.name, 'Priya Patel');
  });

  await test('Zod Signup Schema Validation - Invalid Phone Failure', async () => {
    const invalidBody = {
      name: 'Priya Patel',
      phone: '12345', // invalid phone
    };
    try {
      await signupSchema.parseAsync({ body: invalidBody });
      assert.fail('Should have thrown Zod validation error for invalid phone');
    } catch (e: any) {
      assert.ok(e.name === 'ZodError');
    }
  });

  // 4. Zod Booking Validation Test
  await test('Zod Booking Schema Validation', async () => {
    const validBooking = {
      name: 'Aarti Sharma',
      phone: '9876543210',
      serviceDetail: 'Paneer Butter Masala',
      date: '2026-08-10',
      quantity: 2,
    };
    const parsed = await createBookingSchema.parseAsync({ body: validBooking });
    assert.strictEqual(parsed.body.serviceDetail, 'Paneer Butter Masala');
  });

  // 5. In-Memory Cache Service Test
  await test('In-Memory Cache Service (Get, Set, Delete)', async () => {
    await cacheService.set('test_key', { data: 'hello' }, 10);
    const cached = await cacheService.get<any>('test_key');
    assert.deepStrictEqual(cached, { data: 'hello' });

    await cacheService.del('test_key');
    const afterDel = await cacheService.get<any>('test_key');
    assert.strictEqual(afterDel, null);
  });

  // 6. Custom AppError Test
  await test('Custom AppError Formatter', () => {
    const err = new AppError('Unauthorized access', 401, 'UNAUTHORIZED');
    assert.strictEqual(err.statusCode, 401);
    assert.strictEqual(err.errorCode, 'UNAUTHORIZED');
  });

  console.log(`\n🎉 Test Suite Completed: ${passed} Passed, ${failed} Failed.`);
  return { passed, failed };
}

// Auto-run if executed directly
if (process.argv[1]?.includes('runTests')) {
  runAllTests();
}
