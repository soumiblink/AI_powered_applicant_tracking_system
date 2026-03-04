'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Trash2, Edit, Sparkles, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDate, getStatusColor, getScoreColor } from '@/lib/utils';

interface Job {
  id: string;
  company: string;
  role: string;
  jobDescription: string;
  status: string;
  notes: string | null;
  matchScore: number | null;
  matchingSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  atsScore: number | null;
  createdAt: string;
}

interface Resume {
  id: string;
  fileName: string;
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  useEffect(() => {
    fetchJob();
    fetchResumes();
  }, [params.id]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${params.id}`);
      const data = await response.json();
      setJob(data.job);
    } catch (error) {
      console.error('Failed to fetch job:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/upload/resumes');
      if (response.ok) {
        const data = await response.json();
        setResumes(data.resumes || []);
      }
    } catch (error) {
      console.error('Failed to fetch resumes:', error);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedResumeId) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jobId: params.id,
        }),
      });

      if (response.ok) {
        fetchJob();
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: formData.get('status'),
          notes: formData.get('notes'),
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchJob();
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const response = await fetch(`/api/jobs/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/jobs');
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!job) {
    return <div>Job not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/jobs">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{job.role}</CardTitle>
              <p className="text-lg text-gray-600 mt-1">{job.company}</p>
              <p className="text-sm text-gray-500 mt-2">
                Applied {formatDate(job.createdAt)}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Job Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{job.jobDescription}</p>
          </div>

          {job.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{job.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Update Job</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={job.status}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="applied">Applied</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={job.notes || ''}
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {!job.matchScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Analyze your resume against this job description to get match scores and recommendations.
            </p>
            <div className="space-y-2">
              <Label htmlFor="resume">Select Resume</Label>
              <select
                id="resume"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                disabled={isAnalyzing}
              >
                <option value="">Choose a resume...</option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.fileName}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!selectedResumeId || isAnalyzing}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze Resume
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {job.matchScore !== null && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Match Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(job.matchScore)}`}>
                  {job.matchScore.toFixed(0)}%
                </div>
                <p className="text-gray-600 mt-2">Overall Match</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ATS Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(job.atsScore || 0)}`}>
                  {job.atsScore?.toFixed(0)}%
                </div>
                <p className="text-gray-600 mt-2">ATS Compatibility</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Matching Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.matchingSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Missing Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.missingSkills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span className="text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
