import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const file = formData.get('file')
    const reportNumber = formData.get('reportNumber')
    const token = formData.get('token')

    if (
      !(file instanceof File) ||
      typeof reportNumber !== 'string' ||
      typeof token !== 'string' ||
      !reportNumber ||
      !token
    ) {
      return NextResponse.json(
        { error: 'Missing proof file or report details' },
        { status: 400 }
      )
    }

    // Keep proof uploads reasonably small.
    const maxSize = 10 * 1024 * 1024

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Proof file must be 10 MB or smaller' },
        { status: 400 }
      )
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, WEBP, or PDF proof is allowed' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Validate the business's one-time secure response token
// using the same database function as the response page.
const { data: reportRows, error: reportError } = await supabase.rpc(
  'get_business_report',
  {
    p_report_number: reportNumber,
    p_token: token,
  }
)

if (reportError || !reportRows || reportRows.length === 0) {
  console.error('Business proof token validation failed:', reportError)

  return NextResponse.json(
    { error: 'Invalid or expired response link' },
    { status: 403 }
  )
}

const report = reportRows[0]

    const extension =
      file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') ||
      'bin'

    const storagePath =
      `business/${report.id}/${randomUUID()}.${extension}`

    const fileBuffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('report-evidence')
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error(uploadError)

      return NextResponse.json(
        { error: 'Unable to upload proof' },
        { status: 500 }
      )
    }

    const { error: evidenceError } = await supabase
  .from('evidence_files')
  .insert({
    report_id: report.id,
    file_url: storagePath,
    file_type: file.type,
    storage_path: storagePath,
    file_size_bytes: file.size,
    uploaded_by_role: 'business',
    evidence_stage: 'business_response',
    file_name: file.name,
  })

    if (evidenceError) {
      // Don't leave an orphaned Storage object if DB registration fails.
      await supabase.storage
        .from('report-evidence')
        .remove([storagePath])

      console.error(evidenceError)

      return NextResponse.json(
        { error: 'Unable to register proof' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      storagePath,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Unable to upload proof' },
      { status: 500 }
    )
  }
}