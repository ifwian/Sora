import { DriftingClouds } from '../components/common/DriftingClouds'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { useState } from 'react'

export function LoginPage() {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    try {
      // Store the name for the session
      localStorage.setItem('sora-user-name', name)
      // In a real app, this would authenticate; for now just navigate on
      window.location.href = '/'
    } catch {
      setError('Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <DriftingClouds className="opacity-30" />

      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-4xl font-semibold text-foreground tracking-tight">Sora</h1>
        <p className="text-lg text-muted">Your productivity companion</p>

        {error && (
          <div className="bg-danger/10 border border-danger rounded-md p-4 text-danger mb-6">
            {error}
          </div>
        )}

        <div>
          <Input
            label="Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error && !name.length ? 'Name is required' : undefined}
          />
        </div>

        <Button type="button" onClick={handleLogin} disabled={!name.trim()}>
          {name.trim() ? 'Continue' : 'Get Started'}
        </Button>
      </div>
    </div>
  )
}