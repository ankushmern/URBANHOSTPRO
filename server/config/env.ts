import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/cookmantra'),
  REDIS_URI: z.string().optional().default('redis://127.0.0.1:6379'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long').default('cookmantra_jwt_secret_dev_2026_super_secure'),
  JWT_EXPIRES_IN: z.string().default('30d'),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_cookmantra2026'),
  RAZORPAY_KEY_SECRET: z.string().default('secret_cookmantra_test_key_9988'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('whsec_cookmantra_webhook_secret'),
  GEMINI_API_KEY: z.string().optional().default('MY_GEMINI_API_KEY'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ Invalid environment variable configuration:');
    console.error(JSON.stringify(result.error.format(), null, 2));

    if (process.env.NODE_ENV === 'production') {
      console.error('Fatal environment validation error in production. Shutting down application...');
      process.exit(1);
    }
  }

  return result.success ? result.data : envSchema.parse({});
};

const parsedEnv = parseEnv();

export const config = {
  port: parsedEnv.PORT,
  nodeEnv: parsedEnv.NODE_ENV,
  mongoUri: parsedEnv.MONGODB_URI,
  redisUri: parsedEnv.REDIS_URI,
  jwtSecret: parsedEnv.JWT_SECRET,
  jwtExpiresIn: parsedEnv.JWT_EXPIRES_IN,
  razorpayKeyId: parsedEnv.RAZORPAY_KEY_ID,
  razorpayKeySecret: parsedEnv.RAZORPAY_KEY_SECRET,
  razorpayWebhookSecret: parsedEnv.RAZORPAY_WEBHOOK_SECRET,
  geminiApiKey: parsedEnv.GEMINI_API_KEY,
};

export const validateEnv = (): void => {
  console.log(`✅ [Env Validator] Environment validated successfully (${config.nodeEnv} mode)`);
};
