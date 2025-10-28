import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We've sent you a verification link to confirm your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
            <p className="font-medium mb-2">Next steps:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Check your inbox for the verification email</li>
              <li>Click the verification link in the email</li>
              <li>You'll be redirected back to complete your salon setup</li>
            </ol>
          </div>
          <p className="text-sm text-gray-600">
            Didn't receive the email? Check your spam folder or try signing up again.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
