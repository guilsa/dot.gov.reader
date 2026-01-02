import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="w-full max-w-4xl px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              eCFR Data Reader
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Analyze and explore the Electronic Code of Federal Regulations with advanced data insights
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Agency Analysis
              </h2>
              <p className="text-sm text-blue-700 mb-4">
                Explore 153 federal agencies and their CFR title references across 50 titles.
              </p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Agency-to-title mappings</li>
                <li>• Reference statistics</li>
                <li>• Distribution analysis</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                Word Count Analysis
              </h2>
              <p className="text-sm text-green-700 mb-4">
                Detailed word count breakdowns by hierarchy level and structural elements.
              </p>
              <ul className="text-sm text-green-600 space-y-1">
                <li>• Hierarchy-level analysis</li>
                <li>• Section word counts</li>
                <li>• Content statistics</li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              View Analysis Dashboard →
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">153</div>
                <div className="text-sm text-gray-600">Federal Agencies</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">50</div>
                <div className="text-sm text-gray-600">CFR Titles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">315</div>
                <div className="text-sm text-gray-600">Agency References</div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              Data sourced from{" "}
              <a
                href="https://www.ecfr.gov"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                ecfr.gov
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
