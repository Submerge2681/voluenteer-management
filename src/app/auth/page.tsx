'use client';

import { useActionState } from 'react';
import { handleAuth, type AuthState } from './actions';
import { useSearchParams } from 'next/navigation';

const initialState: AuthState = {
  status: 'idle',
  message: '',
};

export default function UnifiedAuthPage() {
  const [state, formAction, isPending] = useActionState(handleAuth, initialState);
  const searchParams = useSearchParams();
  const defaultMessage = searchParams.get('message');

  if (state.status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg text-center border-t-4 border-emerald-500">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
          <p className="text-slate-600">{state.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">
            {state.status === 'needs_name' ? 'Complete Registration' : 'Welcome'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {state.status === 'needs_name' 
              ? state.message 
              : 'Sign in or create an account to continue.'}
          </p>
        </div>

        {(state.status === 'error' || defaultMessage) && (
          <div className="mb-6 p-4 text-sm text-amber-800 bg-amber-50 rounded-md border border-amber-200">
            {state.message || defaultMessage}
          </div>
        )}

        <form action={formAction} className="space-y-6">
          {/* Hidden input to track user's intent if needed, though the server handles it intelligently */}
          <input type="hidden" name="mode" value={state.status === 'needs_name' ? 'signup' : 'login'} />

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={state.email || ''}
              readOnly={state.status === 'needs_name'} // Lock email if we are asking for name
              className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 sm:text-sm ${
                state.status === 'needs_name' ? 'bg-slate-100 border-slate-200 text-slate-500' : 'border-slate-300'
              }`}
            />
          </div>

          {state.status === 'needs_name' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 sm:text-sm"
                placeholder="e.g., Jane Doe"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className={`flex w-full justify-center rounded-md border border-transparent py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isPending ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isPending ? 'Processing...' : state.status === 'needs_name' ? 'Create Account' : 'Continue with Email'}
          </button>
        </form>
      </div>
    </div>
  );
}