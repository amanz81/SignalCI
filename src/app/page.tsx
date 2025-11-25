import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Activity, LayoutDashboard } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Activity className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SignalCI
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            A CI/CD Pipeline for Trading Signals
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Build visual pipelines that trigger from TradingView webhooks and execute step-by-step conditions before alerting you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/builder">
            <div className="p-8 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Pipeline Builder</h2>
              <p className="text-gray-600">
                Create and configure your signal validation pipelines with a visual drag-and-drop editor.
              </p>
              <Button className="mt-4 w-full">Get Started</Button>
            </div>
          </Link>

          <Link href="/dashboard">
            <div className="p-8 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-500">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <LayoutDashboard className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
              <p className="text-gray-600">
                View your pipelines, monitor execution logs, and manage webhook URLs.
              </p>
              <Button className="mt-4 w-full" variant="outline">View Dashboard</Button>
            </div>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-3">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-bold text-blue-600 mb-1">1. Create</div>
              <p className="text-gray-600">Build your pipeline visually</p>
            </div>
            <div>
              <div className="font-bold text-blue-600 mb-1">2. Configure</div>
              <p className="text-gray-600">Set conditions and delays</p>
            </div>
            <div>
              <div className="font-bold text-blue-600 mb-1">3. Trigger</div>
              <p className="text-gray-600">Connect via webhook</p>
            </div>
            <div>
              <div className="font-bold text-blue-600 mb-1">4. Monitor</div>
              <p className="text-gray-600">Track execution logs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
