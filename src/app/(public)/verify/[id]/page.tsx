import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/cert/PrintButton'; // Client component

// Cache for 60 seconds (ISR)
export const revalidate = 60;

export default async function VerificationPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  // Fetch Profile - RLS 'Public profiles' policy will apply
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, is_cert_public, created_at')
    .eq('id', params.id)
    .single();

  if (!profile || !profile.is_cert_public) {
    return notFound(); // Or return a "Private Profile" UI
  }

  // Calculate stats (Server-side for security)
  const { count } = await supabase
    .from('participation')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', params.id);

  const hours = (count || 0) * 2; // Logic placeholder

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div id="certificate-node" className="bg-white w-[800px] h-[600px] p-12 shadow-2xl border-8 border-double border-slate-200 relative flex flex-col items-center text-center mx-auto">
        
        {/* Decorative Corner */}
        <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-indigo-900"/>
        <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-indigo-900"/>

        <div className="mt-8">
            <h1 className="text-5xl font-serif text-slate-900 tracking-wider uppercase">Certificate</h1>
            <h2 className="text-2xl font-light text-slate-500 mt-2 uppercase tracking-widest">of Appreciation</h2>
        </div>

        <div className="mt-12 flex-1">
            <p className="text-lg text-slate-600 italic">This is to certify that</p>
            <h3 className="text-4xl font-bold text-indigo-900 my-4 border-b-2 border-slate-300 pb-2 px-8 inline-block">
                {profile.full_name || 'Volunteer'}
            </h3>
            <p className="text-lg text-slate-600 mt-4">
                Has successfully contributed <strong>{hours} hours</strong> of service<br/>
                to community development initiatives.
            </p>
        </div>

        <div className="w-full flex justify-between items-end mt-auto px-12">
            <div className="text-center">
                <div className="w-48 border-b border-slate-400 mb-2"></div>
                <p className="text-sm font-bold uppercase text-slate-500">Organization Lead</p>
            </div>
            <div className="text-center">
                <p className="text-xs text-slate-400">Verified ID: {params.id.slice(0,8)}...</p>
                <p className="text-xs text-slate-400">{new Date().toLocaleDateString()}</p>
            </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4 print:hidden">
         <PrintButton />
      </div>
    </div>
  );
}