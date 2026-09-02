'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitScamReport(formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const scam_type = formData.get('scam_type') as string
  const website_url = formData.get('website_url') as string
  const description = formData.get('description') as string

  if (!title || !scam_type || !description) {
    throw new Error('Title, scam type, and description are required.')
  }

  const { error } = await supabase.from('scams').insert([
    {
      title,
      scam_type,
      website_url: website_url || null,
      description,
    },
  ])

  if (error) {
    console.error('Error inserting report:', error.message)
    throw new Error('Failed to submit report.')
  }

  revalidatePath('/')
}