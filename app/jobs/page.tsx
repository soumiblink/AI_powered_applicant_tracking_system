'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Briefcase, Loader2 } from 'lucide-react';
import { formatDate, getStatusColor } from '@/lib/utils';

interface Job {
  id: string;
  company: string;
  role: string;
  status: string;
  matchScore: number | null;
  createdAt: string;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      setJobs(data.jobs);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      company: formData.get('company'),
      role: formData.get('role'),
      jobDescription: formData.get('jobDescription'),
      status: 'applied',
    };

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowForm(false);
        fetchJobs();
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      console.error('Failed to create job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Job Applications</h1>
          <p className="mt-2 text-slate-600">Track and manage your job applications</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          Add Job
        </Button>
      </div>

      {/* Add Job Form */}
      {showForm && (
        <Card className="overflow-hidden border-slate-200 bg-white shadow-lg animate-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Add New Job Application
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-slate-700">
                    Company
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="e.g., Google"
                    required
                    disabled={isSubmitting}
                    className="h-11 border-slate-300 bg-white transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-slate-700">
                    Role
                  </Label>
                  <Input
                    id="role"
                    name="role"
                    placeholder="e.g., Software Engineer"
                    required
                    disabled={isSubmitting}
                    className="h-11 border-slate-300 bg-white transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobDescription" className="text-sm font-medium text-slate-700">
                  Job Description
                </Label>
                <Textarea
                  id="jobDescription"
                  name="jobDescription"
                  placeholder="Paste the job description here..."
                  rows={6}
                  required
                  disabled={isSubmitting}
                  className="border-slate-300 bg-white transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all duration-300 hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Job'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                  className="border-slate-300 hover:bg-slate-50 transition-all duration-200"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Empty State or Jobs List */}
      {jobs.length === 0 ? (
        <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-slate-100 p-6 mb-6">
              <Briefcase className="h-12 w-12 text-slate-400" />
            </div>
            <p className="mb-6 text-lg font-medium text-slate-900">No job applications yet</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all duration-300 hover:scale-105"
            >
              Add Your First Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="group overflow-hidden border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {job.role}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">{job.company}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Applied {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    {job.matchScore !== null && (
                      <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">
                          {job.matchScore.toFixed(0)}%
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Match</p>
                      </div>
                    )}
                    <span
                      className={`rounded-full px-4 py-2 text-sm font-medium ${getStatusColor(
                        job.status
                      )}`}
                    >
                      {job.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
