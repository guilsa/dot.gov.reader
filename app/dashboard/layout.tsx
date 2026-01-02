import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'eCFR Analysis Dashboard',
  description: 'Analyze word counts and agency statistics across CFR titles',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                eCFR Analysis Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Electronic Code of Federal Regulations Data Analysis
              </p>
            </div>
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
