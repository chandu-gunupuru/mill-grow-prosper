import { createClient } from '@supabase/supabase-js'
import { render } from '@react-email/components'
import * as React from 'react'
import { template as confirmationTemplate } from '@/lib/email-templates/help-center-confirmation'

const SITE_NAME = 'Gayathri Modern Rice Mill'
const SENDER_DOMAIN = 'notify.sendemail.com'
const FROM_DOMAIN = 'notify.sendemail.com'

function redactEmail(email: string | null | undefined): string {
  if (!email) return '***'
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return '***'
  return `${localPart[0]}***@${domain}`
}

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

interface SendHelpCenterConfirmationInput {
  name: string
  email: string
  topic: string
  message?: string
}

export async function sendHelpCenterConfirmation(input: SendHelpCenterConfirmationInput): Promise<{
  success: boolean
  reason?: string
}> {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service configuration for confirmation email.')
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  const normalizedEmail = input.email.toLowerCase()
  const messageId = crypto.randomUUID()
  const idempotencyKey = `help-confirm-${normalizedEmail}-${Date.now()}`

  // 1. Suppression check
  const { data: suppressed, error: suppressionError } = await supabase
    .from('suppressed_emails')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (suppressionError) {
    console.error('Suppression check failed for confirmation email', {
      error: suppressionError,
      recipient_redacted: redactEmail(normalizedEmail),
    })
    throw new Error('Failed to verify suppression status')
  }

  if (suppressed) {
    console.log('Confirmation email suppressed', {
      recipient_redacted: redactEmail(normalizedEmail),
    })
    return { success: false, reason: 'email_suppressed' }
  }

  // 2. Get or create unsubscribe token for this email address
  let unsubscribeToken: string
  const { data: existingToken, error: tokenLookupError } = await supabase
    .from('email_unsubscribe_tokens')
    .select('token, used_at')
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (tokenLookupError) {
    console.error('Token lookup failed for confirmation email', {
      error: tokenLookupError,
      email_redacted: redactEmail(normalizedEmail),
    })
    throw new Error('Failed to prepare confirmation email')
  }

  if (existingToken && !existingToken.used_at) {
    unsubscribeToken = existingToken.token
  } else if (!existingToken) {
    unsubscribeToken = generateToken()
    const { error: tokenError } = await supabase
      .from('email_unsubscribe_tokens')
      .upsert(
        { token: unsubscribeToken, email: normalizedEmail },
        { onConflict: 'email', ignoreDuplicates: true },
      )

    if (tokenError) {
      console.error('Failed to create unsubscribe token for confirmation email', {
        error: tokenError,
      })
      throw new Error('Failed to prepare confirmation email')
    }

    const { data: storedToken, error: reReadError } = await supabase
      .from('email_unsubscribe_tokens')
      .select('token')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (reReadError || !storedToken) {
      console.error('Failed to read back unsubscribe token for confirmation email', {
        error: reReadError,
        email_redacted: redactEmail(normalizedEmail),
      })
      throw new Error('Failed to prepare confirmation email')
    }
    unsubscribeToken = storedToken.token
  } else {
    console.warn('Unsubscribe token already used but email not suppressed', {
      email_redacted: redactEmail(normalizedEmail),
    })
    return { success: false, reason: 'email_suppressed' }
  }

  // 3. Render the email
  const element = React.createElement(confirmationTemplate.component, {
    name: input.name,
    topic: input.topic,
    message: input.message,
  })
  const html = await render(element)
  const plainText = await render(element, { plainText: true })
  const resolvedSubject =
    typeof confirmationTemplate.subject === 'function'
      ? confirmationTemplate.subject({
          name: input.name,
          topic: input.topic,
          message: input.message,
        })
      : confirmationTemplate.subject

  // 4. Log pending and enqueue
  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: 'help-center-confirmation',
    recipient_email: input.email,
    status: 'pending',
  })

  const { error: enqueueError } = await supabase.rpc('enqueue_email', {
    queue_name: 'transactional_emails',
    payload: {
      message_id: messageId,
      to: input.email,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject: resolvedSubject,
      html,
      text: plainText,
      purpose: 'transactional',
      label: 'help-center-confirmation',
      idempotency_key: idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    } as any,
  })

  if (enqueueError) {
    console.error('Failed to enqueue confirmation email', {
      error: enqueueError,
      recipient_redacted: redactEmail(input.email),
    })
    throw new Error('Failed to enqueue confirmation email')
  }

  console.log('Help center confirmation email enqueued', {
    recipient_redacted: redactEmail(input.email),
  })

  return { success: true }
}
