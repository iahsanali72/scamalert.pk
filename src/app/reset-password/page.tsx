'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
export default function ResetPasswordPage(){
  const [supabase]=useState(()=>createClient()); const [password,setPassword]=useState(''); const [message,setMessage]=useState(''); const [error,setError]=useState('');
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setError('');const {error}=await supabase.auth.updateUser({password});if(error)setError(error.message);else setMessage('Password updated. You can return to ScamAlert.pk and sign in.');};
  return <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 flex items-center justify-center"><form onSubmit={submit} className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-4"><h1 className="text-2xl font-bold">Choose a new password</h1>{error&&<p className="text-red-400 text-sm">{error}</p>}{message&&<p className="text-emerald-400 text-sm">{message}</p>}<input type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Minimum 8 characters" className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3"/><button className="w-full bg-red-600 rounded-xl py-3 font-bold">Update password</button></form></main>
}
