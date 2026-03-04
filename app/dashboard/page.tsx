import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Briefcase, TrendingUp, Target } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { formatDate, getStatusColor } from '@/lib/utils';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const [resumes, jobs, stats] = await Promise.all([
    prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.job.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.job.groupBy({
      by: ['status'],
      where: { userId: session.user.id },
      _count: true,
    }),
  ]);

  const totalJobs = jobs.length;
  const avgScore = jobs.length > 0
    ? jobs.reduce((acc, job) => acc + (job.matchScore || 0), 0) / jobs.length
    : 0;

  const statusCounts = stats.reduce((acc, stat) => {
    acc[stat.status] = stat._count;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {session.user.name || session.user.email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Resumes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Job Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Match</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore.toFixed(0)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interviews</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.interview || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Resumes</CardTitle>
              <Link href="/upload">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {resumes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No resumes uploaded yet</p>
            ) : (
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <div key={resume.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{resume.fileName}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(resume.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <Link href="/jobs">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No job applications yet</p>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <div className="flex items-center justify-between hover:bg-gray-50 p-2 rounded">
                      <div>
                        <p className="font-medium">{job.role}</p>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.matchScore !== null && (
                          <span className="text-sm font-medium">{job.matchScore.toFixed(0)}%</span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
