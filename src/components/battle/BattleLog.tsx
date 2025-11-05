import { useEffect, useRef } from 'react';
import type { BattleLogEntry } from '../../types/battle';

interface BattleLogProps {
  entries: BattleLogEntry[];
}

export function BattleLog({ entries }: BattleLogProps) {
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const getEntryColor = (type: BattleLogEntry['type']) => {
    switch (type) {
      case 'action':
        return 'text-blue-700 bg-blue-50';
      case 'damage':
        return 'text-red-700 bg-red-50';
      case 'ko':
        return 'text-purple-700 bg-purple-50';
      case 'switch':
        return 'text-green-700 bg-green-50';
      case 'status':
        return 'text-yellow-700 bg-yellow-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };

  const getEntryIcon = (type: BattleLogEntry['type']) => {
    switch (type) {
      case 'action':
        return '⚔️';
      case 'damage':
        return '💥';
      case 'ko':
        return '💀';
      case 'switch':
        return '🔄';
      case 'status':
        return '✨';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-96 flex flex-col">
      <h3 className="text-lg font-bold mb-3 text-gray-800 border-b pb-2">
        Battle Log
      </h3>

      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-gray-300">
        {entries.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            Battle log will appear here...
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`p-3 rounded-lg ${getEntryColor(entry.type)} border border-opacity-20`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{getEntryIcon(entry.type)}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{entry.message}</div>
                  {entry.data && (
                    <div className="text-xs opacity-75 mt-1">
                      {entry.data.isCritical && <span className="font-bold">CRITICAL! </span>}
                      {entry.data.effectiveness !== undefined &&
                        entry.data.effectiveness !== 1 && (
                          <span>
                            {entry.data.effectiveness > 1
                              ? 'Super Effective!'
                              : 'Not very effective...'}
                          </span>
                        )}
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  Turn {entry.turn}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

