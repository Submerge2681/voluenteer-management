import { cookies } from 'next/headers';
import { login } from '../login/actions'; // Re-use login action for magic link sending

export default async function RegisterPage() {
  // Check if this user arrived via a QR Scan
  const cookieStore = await cookies()
  const pendingCookie = await cookieStore.get('pending_checkin');
  const isGuestScan = !!pendingCookie;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border-t-4 border-indigo-600">
        <h2 className="text-2xl font-bold mb-4">
          {isGuestScan ? 'Complete Check-in' : 'Join as Volunteer'}
        </h2>
        
        {isGuestScan && (
          <div className="mb-6 bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded text-sm">
            <strong>Event Detected!</strong> Create an account to confirm your attendance automatically.
          </div>
        )}

        <form action={login} className="space-y-4">
           {/* In a real app, you might collect Full Name here and pass it via metadata */}
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input name="email" type="email" required className="w-full mt-1 p-2 border rounded-md" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">
            {isGuestScan ? 'Register & Check-in' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}