import { AppProvider, useApp } from './store/AppContext'
import PinLock from './components/PinLock'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'
import AccountFilter from './components/AccountFilter'
import TaskModal from './components/TaskModal'
import GoalModal from './components/GoalModal'
import GroupModal from './components/GroupModal'
import TodayView from './views/TodayView'
import WeeklyView from './views/WeeklyView'
import KanbanView from './views/KanbanView'
import AllTasksView from './views/AllTasksView'
import GroupView from './views/GroupView'

function Main() {
  const { state } = useApp()
  const { currentView } = state

  const renderView = () => {
    if (currentView === 'group') return <GroupView />
    if (currentView === 'today') return <TodayView />
    if (currentView === 'weekly') return <WeeklyView />
    if (currentView === 'kanban') return <KanbanView />
    if (currentView === 'all') return <AllTasksView />
    return <TodayView />
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#141416' }}>
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <AccountFilter />
        {/* main gets bottom padding on mobile for the nav bar */}
        <main className="flex-1 overflow-hidden flex pb-0 md:pb-0">
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
              {renderView()}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      <TaskModal />
      <GoalModal />
      <GroupModal />
    </div>
  )
}

export default function App() {
  return (
    <PinLock>
      <AppProvider>
        <Main />
      </AppProvider>
    </PinLock>
  )
}
