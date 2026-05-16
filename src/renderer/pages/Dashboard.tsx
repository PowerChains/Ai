import React, { useState } from 'react'
import { useAppStore } from '../store/appStore'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import MonitoringPanel from '../components/MonitoringPanel'
import ChatBot from '../components/ChatBot'

type ActiveView =
  | 'dashboard'
  | 'monitoring'
  | 'repair'
  | 'optimize'
  | 'security'
  | 'localhost'
  | 'settings'

export default function Dashboard() {
  const { mode } = useAppStore()
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header mode={mode} />

        <div className="flex-1 overflow-auto bg-slate-900 p-6">
          {activeView === 'dashboard' && <MonitoringPanel />}
          {activeView === 'monitoring' && <MonitoringPanel />}
          {/* Other views will be added in Phase 2+ */}
        </div>
      </div>

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  )
}
