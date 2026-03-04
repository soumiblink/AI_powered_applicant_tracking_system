'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }

      router.push('/login?registered=true');
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Create an account
          </CardTitle>
          <CardDescription className="text-base">
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                required
                disabled={isLoading}
                className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                disabled={isLoading}
                className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                minLength={8}
                required
                disabled={isLoading}
                className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all text-base font-medium" 
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Already have an account?</span>{' '}
            <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
