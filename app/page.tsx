import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            AI Conditioner
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Generate dynamic and personalized hypnosis sessions with advanced templating, 
            text-to-speech integration, and sophisticated content management.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/auth/signup"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Get started
            </a>
            <a
              href="/auth/signin"
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600"
            >
              Sign in <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Advanced Templating
              </h3>
              <p className="text-gray-600">
                Sophisticated template system with automatic verb conjugation and 
                persona-aware content generation.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Audio Generation
              </h3>
              <p className="text-gray-600">
                AWS Polly integration for high-quality neural voice synthesis 
                with progressive difficulty levels.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Session Builder
              </h3>
              <p className="text-gray-600">
                Create complete hypnosis sessions with multiple themes, 
                customizable duration, and personalized content flow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
