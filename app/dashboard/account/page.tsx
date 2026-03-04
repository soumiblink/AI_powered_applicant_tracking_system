'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function AccountPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;

    try {
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update profile');
        return;
      }

      setSuccess('Profile updated successfully!');
      setIsEditingProfile(false);
      
      // Update session
      await update({ name });
      router.refresh();
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to change password');
        return;
      }

      setSuccess('Password changed successfully!');
      setIsChangingPassword(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" className="gap-2 hover:bg-purple-50">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage your account information</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl shadow-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm">
          {error}
        </div>
      )}

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Profile Information</CardTitle>
          <CardDescription>Your personal details and account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
            <div className="h-16 w-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Full Name</p>
              <p className="text-lg font-semibold text-gray-900">{session.user.name || 'Not set'}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md mt-1">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Email Address</p>
              <p className="text-lg font-semibold text-gray-900">{session.user.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
            <div className="h-12 w-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md mt-1">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Member Since</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate((session.user as any).createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Update Profile</CardTitle>
          <CardDescription>Edit your name and other profile information</CardDescription>
        </CardHeader>
        <CardContent>
          {!isEditingProfile ? (
            <Button onClick={() => setIsEditingProfile(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Edit Profile
            </Button>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={session.user.name || ''}
                  placeholder="Enter your full name"
                  required
                  disabled={isLoading}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingProfile(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          {!isChangingPassword ? (
            <Button onClick={() => setIsChangingPassword(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              Change Password
            </Button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  disabled={isLoading}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  minLength={8}
                  required
                  disabled={isLoading}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  minLength={8}
                  required
                  disabled={isLoading}
                  className="border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setError('');
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg border-red-200">
        <CardHeader>
          <CardTitle className="text-xl text-red-900">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-xl bg-red-50">
            <div>
              <p className="font-medium text-red-900">Delete Account</p>
              <p className="text-sm text-red-700">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" disabled>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
