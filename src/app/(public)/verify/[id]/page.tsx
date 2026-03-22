import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PrintButton from './PrintButton';

export const revalidate = 300; // Cache for 5 min

export default async function VerificationPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  // Public profile check — RLS "Public profiles are viewable by everyone" applies
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, is_cert_public, created_at')
    .eq('id', id)
    .single();

  if (!profile || !profile.is_cert_public) {
    return notFound();
  }

  // Use service role to read participation for a public certificate viewer —
  // regular RLS only allows users to read their own participation rows.
  const admin = createAdminClient();
  const { data: history } = await admin
    .from('volunteer_history')
    .select('start_time, end_time')
    .eq('user_id', id)
    .eq('is_completed', true);

  const hours = Math.round(
    (history ?? []).reduce((acc, e) => {
      const diff = new Date(e.end_time).getTime() - new Date(e.start_time).getTime();
      return acc + Math.max(0, diff / 3_600_000);
    }, 0)
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div id="certificate-node" className="bg-white w-200 h-150 p-12 shadow-2xl border-8 border-double border-slate-200 relative flex flex-col items-center text-center mx-auto">

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
                {/* <p className="text-xs text-slate-400">Verified ID: {id.slice(0,8)}...</p>
                <p className="text-xs text-slate-400">{new Date().toLocaleDateString()}</p> */}
            </div>
        </div>
      </div>
      <div className="mt-8 flex gap-4 print:hidden">
         <PrintButton />
      </div>
    </div>
  );
}
