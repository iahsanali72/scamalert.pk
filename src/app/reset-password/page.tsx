'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
export default function ResetPasswordPage(){
  const [supabase]=useState(()=>createClient()); const [password,setPassword]=useState(''); const [message,setMessage]=useState(''); const [error,setError]=useState('');
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setError('');const {error}=await supabase.auth.updateUser({password});if(error)setError(error.message);else setMessage('Password updated. You can return to ScamAlert.pk and sign in.');};
  return <main className="min-h-screen bg-[var(--sa-paper)] text-[var(--sa-ink)] p-4 flex items-center justify-center"><form onSubmit={submit} className="w-full max-w-md bg-[var(--sa-surface)] border border-[var(--sa-border)] rounded-[16px] p-6 sm:p-8 space-y-4 shadow-[var(--sa-shadow-md)]"><h1 className="sa-display text-2xl font-semibold tracking-tight">Choose a new password</h1>{error&&<p className="text-[var(--sa-red-deep)] text-sm">{error}</p>}{message&&<p className="text-[var(--sa-green)] text-sm">{message}</p>}<input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 8 characters" className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] p-3 text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] transition"/><button className="w-full bg-[var(--sa-red)] hover:bg-[var(--sa-red-deep)] text-white rounded-[8px] py-3 font-semibold transition cursor-pointer">Update password</button></form></main>
}
