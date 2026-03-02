'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { headers } from 'next/headers'

// Define the state shape for React 19 useActionState
export type AuthState = {
  status: 'idle' | 'needs_name' | 'success' | 'error';
  message: string;
  email?: string;
};

export async function handleAuth(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string | null;
  const mode = formData.get('mode') as 'login' | 'signup'; 

  if (!email) {
    return { status: 'error', message: 'Email is required.' };
  }


  const head = await headers()
  const origin = await head.get('origin')
  const supabase = await createClient();
//   const adminClient = createAdminClient()
//   const { data: { users } } = await adminClient.auth.admin.listUsers()
//   const existingUser = users.find(u => u.email === email)
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  console.log(existingUser)

//   const supabase = await createClient();
  // --- PATH A: USER ALREADY EXISTS ---
  if (existingUser) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback` }
    });

    if (error) return { status: 'error', message: error.message, email };

    // If they clicked "Sign Up" but already had an account, gently correct them.
    if (mode === 'signup') {
      return { 
        status: 'success', 
        message: 'You already have an account! We have sent a secure login link to your email.' 
      };
    }

    return { status: 'success', message: 'Check your email for the magic link!' };
  } 
  
  // --- PATH B: NEW USER ---
  else {
    // If we don't have a name yet, pause the flow and ask the UI to collect it
    if (!name) {
      return { 
        status: 'needs_name', 
        message: 'Account not found. Please enter your full name to create one.', 
        email 
      };
    }

    // We have the name, proceed with account creation
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { full_name: name }, // Triggers our SQL function to populate the profile
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    });

    if (error) return { status: 'error', message: error.message, email };

    return { 
      status: 'success', 
      message: 'Welcome! Check your email for the registration link to verify your account.' 
    };
  }
}