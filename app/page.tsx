import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, Zap, Target } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI-Powered ATS
              </span>
            </div>
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-purple-50">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold">
                AI-Powered Resume Analysis
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6">
              Optimize Your Resume with{' '}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI-Powered
              </span>{' '}
              Analysis
            </h1>
            <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
              Get instant feedback on how well your resume matches job descriptions.
              Powered by advanced AI to help you land your dream job.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg" className="gap-2 h-12 px-8 text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all">
                  Start Analyzing <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-2 hover:bg-purple-50">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
              <div className="h-14 w-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Instant Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Get immediate feedback on your resume's compatibility with job descriptions
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
              <div className="h-14 w-14 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">ATS Optimization</h3>
              <p className="text-gray-600 leading-relaxed">
                Ensure your resume passes Applicant Tracking Systems
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
              <div className="h-14 w-14 bg-gradient-to-br from-orange-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Target className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">Match Scoring</h3>
              <p className="text-gray-600 leading-relaxed">
                See exactly how well you match job requirements
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
