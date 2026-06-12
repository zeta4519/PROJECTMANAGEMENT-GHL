import { AppProvider, useApp } from './store/AppContext'
import Sidebar from './components/Sidebar'
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
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AccountFilter />
        <main className="flex-1 overflow-hidden flex">
          {renderView()}
        </main>
      </div>
      <TaskModal />
      <GoalModal />
      <GroupModal />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  )
}
