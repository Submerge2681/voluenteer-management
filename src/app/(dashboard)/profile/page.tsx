import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { User, Mail, Save } from 'lucide-react';
import LocationSelector from '@/components/profile/LocationSelector';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Server Action
  async function updateProfile(formData: FormData) {
    'use server';
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const full_name = formData.get('full_name') as string;
    const is_cert_public = formData.get('is_cert_public') === 'on';

    // === PHONE (country code + number) ===
    const cc = (formData.get('cc') as string) || '';
    const pn = (formData.get('pn') as string) || '';
    const phone = { cc, pn };

    // === LOCATIONS (array / JSONB) ===
    const locationsStr = formData.get('locations') as string;
    const locations: string[] = locationsStr ? JSON.parse(locationsStr) : [];

    await supabase
      .from('profiles')
      .update({
        full_name,
        phone,          // JSONB
        locations,      // JSONB array
        is_cert_public,
      })
      .eq('id', user.id);

    redirect('/profile?success=true');
  }


  return (
    <div className="max-w-2xl mx-auto p-6 text-slate-900">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Edit Profile</h1>
      
      <form action={updateProfile} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-6">
          
          {/* Read Only Field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                disabled
                value={profile?.email}
                className="block w-full pl-10 sm:text-sm border-slate-300 rounded-md bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <p className="mt-1 text-xs text-slate-400">Email cannot be changed manually.</p>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="full_name"
                id="full_name"
                defaultValue={profile?.full_name || ''}
                required
                className="block w-full pl-10 py-2 sm:text-sm border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* PHONE – Dropdown + Input (combined look) */}
          <div>
            <label htmlFor="pn" className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <div className="flex">
              {/* Country Code Dropdown */}
              <select
                name="cc"
                defaultValue={profile?.phone?.cc || '+91'}
                className="block w-32 border border-slate-300 border-r-0 rounded-l-md py-2 sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              >
                <option value="+91">🇮🇳 +91 India</option>
                {/* <option value="+1">🇺🇸 +1 USA/Canada</option>
                <option value="+44">🇬🇧 +44 UK</option>
                <option value="+61">🇦🇺 +61 Australia</option>
                <option value="+65">🇸🇬 +65 Singapore</option>
                <option value="+971">🇦🇪 +971 UAE</option>
                <option value="+49">🇩🇪 +49 Germany</option>
                <option value="+33">🇫🇷 +33 France</option>
                <option value="+81">🇯🇵 +81 Japan</option>
                <option value="+7">🇷🇺 +7 Russia</option> */}
              </select>

              {/* Phone Number Input */}
              <div className="relative flex-1">
                <input
                  type="tel"
                  name="pn"
                  id="pn"
                  placeholder="9876543210"
                  defaultValue={profile?.phone?.pn || ''}
                  className="block w-full pl-10 py-2 sm:text-sm border border-slate-300 border-l-0 rounded-r-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-400">Country code + number (without leading zero)</p>
          </div>

          {/* LOCATIONS – Search + Bubbles (client component) */}
          <LocationSelector initialLocations={profile?.locations || []} />        

          {/* Privacy Toggle */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="is_cert_public"
                name="is_cert_public"
                type="checkbox"
                defaultChecked={profile?.is_cert_public}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-slate-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="is_cert_public" className="font-medium text-slate-700">Make Certificate Public</label>
              <p className="text-slate-500">Allow others to view your volunteer achievements via a public link.</p>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="bg-slate-50 px-8 py-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}