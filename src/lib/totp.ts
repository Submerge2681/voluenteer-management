// lib/totp.ts
import { generateSecret, generate, verify } from 'otplib';


interface ValidationResult {
  success: boolean;
  message: string;
}

interface EventConfig {
  checkin_type: 'totp' | 'static_otp';
  checkin_secret: string; // Base32 for TOTP, 6-digit string for static_otp
}

/**
 * Validates an incoming code against an event's configuration.
 * Now uses the modern otplib v13+ API (async, no deprecated `authenticator` singleton).
 *
 * @param inputCode - Code from QR scan or user input
 * @param event     - Event configuration
 */
export async function validateEventCheckin(
  inputCode: string,
  event: EventConfig
): Promise<ValidationResult> {
  const trimmedCode = inputCode.trim();

  // 1. Static OTP (low-security fallback)
  if (event.checkin_type === 'static_otp') {
    if (trimmedCode === event.checkin_secret) {
      return { success: true, message: 'Static Check-in Verified' };
    }
    return { success: false, message: 'Invalid Static Code' };
  }

  // 2. TOTP (high-security rolling code)
  if (event.checkin_type === 'totp') {
    try {
      const result = await verify({
        secret: event.checkin_secret,
        token: trimmedCode,
        // window: 1,   // That window closed
      });

      if (result.valid) {
        return { success: true, message: 'Secure TOTP Verified' };
      }
      return { success: false, message: 'Code expired or invalid' };
    } catch (error) {
      console.error('TOTP Validation Error:', error);
      return { success: false, message: 'Validation System Error' };
    }
  }

  return { success: false, message: 'Unknown Check-in Type' };
}

/**
 * Helper to generate a new secret / PIN when creating an event.
 * Uses the official `generateSecret()` from otplib (Base32, 20 bytes).
 */
export function generateEventSecret(type: 'totp' | 'static_otp'): string {
  if (type === 'totp') {
    return generateSecret(); // e.g. "JBSWY3DPEHPK3PXP"
  }
  // 6-digit static PIN
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate the current TOTP token or return the static OTP.
 */
export async function generateEventCode(
  secret: string,
  type: 'totp' | 'static_otp'
): Promise<string> {
  if (type === 'static_otp') {
    return secret;
  }
  return generate({ secret });
}

/**
 * Get the time remaining for the current TOTP period.
 */
export function getTotpTimeRemaining(): number {
  const step = 30;
  const current = Math.floor(Date.now() / 1000);
  return step - (current % step);
}