import { useState, useMemo, useCallback } from 'react';
import type { AppData, ViewKey } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { createSeedData } from './lib/seedData';
import { getCurrentYear, getWeekNumber } from './lib/constants';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { Dashboard } from './components/Dashboard';
import { AnnualVision } from './components/AnnualVision';
import { MonthlyMilestones } from './components/MonthlyMilestones';
import { WeeklyCommitments } from './components/WeeklyCommitments';
import { WeeklyReview } from './components/WeeklyReview';
import './App.css';

function App() {
  const [data, setData] = useLocalStorage<AppData>('goalflow-data-v1', createSeedData());
  const [activeView, setActiveView] = useState<ViewKey>('dashboard');

  const year = getCurrentYear();
  const week = getWeekNumber();

  const weeklyStats = useMemo(() => {
    const weekCommitments = data.commitments.filter(c => c.year === year && c.weekNumber === week);
    const completed = weekCommitments.filter(c => c.isCompleted).length;
    const active = weekCommitments.filter(c => !c.isCompleted).length;
    const rate = weekCommitments.length > 0 ? Math.round((completed / weekCommitments.length) * 100) : 0;
    return { rate, active };
  }, [data.commitments, year, week]);

  const setDataFn = useCallback((updater: (prev: AppData) => AppData) => {
    setData(updater);
  }, [setData]);

  function renderView() {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard data={data} onNavigate={setActiveView} />;
      case 'vision':
        return <AnnualVision data={data} setData={setDataFn} />;
      case 'milestones':
        return <MonthlyMilestones data={data} setData={setDataFn} />;
      case 'commitments':
        return <WeeklyCommitments data={data} setData={setDataFn} />;
      case 'review':
        return <WeeklyReview data={data} setData={setDataFn} />;
      default:
        return <Dashboard data={data} onNavigate={setActiveView} />;
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        weeklyProgress={weeklyStats.rate}
        activeCommitments={weeklyStats.active}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav activeView={activeView} onNavigate={setActiveView} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8 max-w-6xl w-full mx-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
