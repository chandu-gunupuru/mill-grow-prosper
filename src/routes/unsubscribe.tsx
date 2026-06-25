import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/unsubscribe')({
  component: UnsubscribePage,
})

function UnsubscribePage() {
  const { token } = Route.useSearch() as { token?: string }
  const [status, setStatus] = useState<
    'loading' | 'valid' | 'invalid' | 'used' | 'success' | 'error'
  >('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      return
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Invalid token')
        const data = await res.json()
        if (data.valid === false && data.reason === 'already_unsubscribed') {
          setStatus('used')
        } else if (data.valid) {
          setStatus('valid')
        } else {
          setStatus('invalid')
        }
      })
      .catch(() => setStatus('invalid'))
  }, [token])

  const handleUnsubscribe = async () => {
    if (!token) return
    setStatus('loading')
    try {
      const res = await fetch('/email/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
      } else if (data.reason === 'already_unsubscribed') {
        setStatus('used')
      } else {
        setStatus('error')
        setErrorMsg(data.error || 'Could not process your request.')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Network error. Please try again.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Unsubscribe</CardTitle>
          <CardDescription>
            Manage your email preferences for Gayathri Modern Rice Mill.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <p className="text-sm text-muted-foreground">Checking your request...</p>
          )}
          {status === 'invalid' && (
            <p className="text-sm text-destructive">
              This link is invalid or has expired.
            </p>
          )}
          {status === 'used' && (
            <p className="text-sm text-muted-foreground">
              You're already unsubscribed from these emails.
            </p>
          )}
          {status === 'valid' && (
            <>
              <p className="text-sm text-foreground">
                Click below to stop receiving confirmation and notification emails from us.
              </p>
              <Button onClick={handleUnsubscribe} className="w-full">
                Unsubscribe
              </Button>
            </>
          )}
          {status === 'success' && (
            <p className="text-sm text-green-600">
              You've been unsubscribed successfully.
            </p>
          )}
          {status === 'error' && (
            <p className="text-sm text-destructive">{errorMsg}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
