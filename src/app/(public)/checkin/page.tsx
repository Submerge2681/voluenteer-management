import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

type Status = 'success' | 'already' | 'error';
type Reason = 'invalid' | 'not_found' | 'invalid_code' | 'rate_limited' | 'checkin_failed';

const STATUS_CONFIG: Record<
  Status,
  { icon: typeof CheckCircle; iconClass: string; borderClass: string; title: string; message: string }
> = {
  success: {
    icon: CheckCircle,
    iconClass: 'text-emerald-500',
    borderClass: 'border-emerald-500',
    title: "You're Checked In!",
    message: 'Your attendance has been recorded. Thanks for showing up!',
  },
  already: {
    icon: CheckCircle,
    iconClass: 'text-indigo-500',
    borderClass: 'border-indigo-500',
    title: 'Already Checked In',
    message: "You're already recorded for this event — see you there!",
  },
  error: {
    icon: XCircle,
    iconClass: 'text-red-500',
    borderClass: 'border-red-500',
    title: 'Check-In Failed',
    message: 'Something went wrong. Please ask a coordinator to scan again.',
  },
};

const REASON_MESSAGES: Partial<Record<Reason, string>> = {
  invalid: 'The check-in link is missing required information.',
  not_found: 'This event could not be found.',
  invalid_code: 'The QR code has expired. Please scan the latest code shown on screen.',
  rate_limited: 'Too many attempts from your device. Please wait a moment and try again.',
  checkin_failed: 'A server error prevented check-in. Please try again or contact a coordinator.',
};

function isValidStatus(s: string | undefined): s is Status {
  return s === 'success' || s === 'already' || s === 'error';
}

export default async function CheckinResultPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; reason?: string }>;
}) {
  const { status, reason } = await searchParams;

  const resolvedStatus: Status = isValidStatus(status) ? status : 'error';
  const config = STATUS_CONFIG[resolvedStatus];
  const Icon = config.icon;

  // Only show reason messages we explicitly define — never reflect raw URL params
  const reasonMessage =
    reason && Object.prototype.hasOwnProperty.call(REASON_MESSAGES, reason)
      ? REASON_MESSAGES[reason as Reason]
      : undefined;

  const isSuccess = resolvedStatus === 'success' || resolvedStatus === 'already';

  return (
    <div className="flex min-h-[95vh] items-center justify-center bg-slate-50 p-4">
      <div
        className={`w-full max-w-md rounded-xl border-t-4 bg-white p-8 shadow-lg text-center ${config.borderClass}`}
      >
        <Icon className={`mx-auto mb-4 h-16 w-16 ${config.iconClass}`} aria-hidden="true" />
        <h1 className="text-2xl font-bold text-slate-900">{config.title}</h1>
        <p className="mt-2 text-slate-600">{reasonMessage ?? config.message}</p>

        <div className="mt-8 flex flex-col gap-3">
          {!isSuccess && (
            <p className="text-sm text-slate-400">
              If this keeps happening, ask an event coordinator for help.
            </p>
          )}
          <Link
            href={isSuccess ? '/dashboard' : '/'}
            className="inline-block w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            {isSuccess ? 'Go to Dashboard' : 'Back to Homepage'}
          </Link>
          {!isSuccess && (
            <Link
              href="/auth"
              className="inline-block w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
