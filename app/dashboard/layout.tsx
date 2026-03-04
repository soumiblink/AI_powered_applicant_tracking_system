import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Upload, Briefcase, LogOut, Target, User } from 'lucide-react';
import SessionWrapper from './session-wrapper';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <SessionWrapper session={session}>
      <div className="min-h-screen bg-slate-50">
        {/* Top Navigation */}
        <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-slate-900">
                  AI-Powered ATS
                </span>
              </Link>

              {/* Center Navigation */}
              <div className="hidden md:flex items-center gap-1">
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/upload">
                  <Button
                    variant="ghost"
                    className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                </Link>
                <Link href="/jobs">
                  <Button
                    variant="ghost"
                    className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
                  >
                    <Briefcase className="h-4 w-4" />
                    Jobs
                  </Button>
                </Link>
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-3">
                <Link href="/dashboard/account">
                  <Button
                    variant="ghost"
                    className="gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm">
                      {session.user.name || session.user.email}
                    </span>
                  </Button>
                </Link>
                <form action="/api/auth/signout" method="POST">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-6 py-12">
          {children}
        </main>
      </div>
    </SessionWrapper>
  );
}
