"use client"
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs'
import { useAgendaStore } from "../lib/store"

export default function AgendaNavigation() {
  const { setAgendaType, agendaType } = useAgendaStore()

  return (
    <div className="w-full sm:w-auto">
      <Tabs value={agendaType} onValueChange={(value) => setAgendaType(value as "current" | "past")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="current"
            className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900"
          >
            Current Agendas
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-900"
          >
            Past Agendas
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

