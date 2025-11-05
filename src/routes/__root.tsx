import { useState } from 'react';
import { Outlet, Link } from '@tanstack/react-router';
import SettingsModal from '../components/SettingsModal';

export default function Root() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                ⚡ PokéBattle
              </Link>
              <div className="flex space-x-4">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors"
                  activeProps={{ className: 'text-blue-600 bg-blue-50' }}
                >
                  Pokémon
                </Link>
                <Link
                  to="/teams"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors"
                  activeProps={{ className: 'text-blue-600 bg-blue-50' }}
                >
                  Teams
                </Link>
                <Link
                  to="/battle"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md font-medium transition-colors"
                  activeProps={{ className: 'text-blue-600 bg-blue-50' }}
                >
                  ⚔️ Battle
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">Redux + RTK Query Battle System</div>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Outlet />
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
