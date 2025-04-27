"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, FileText, ChevronDown, ChevronUp, Search, Filter } from "lucide-react";
import { useCollapsedContext } from "../../components/sideBar/sideBarContext";
import SideBar from "../../components/sideBar/SideBar";
import AgendaSection from "../../components/agendaSection/agendaSection";
import AddAgenda from "../../components/addAgenda/addAgenda";
import { useUser } from "@clerk/nextjs";
import pusherClient from "../../lib/pusher";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import AgendaNavigation from "../../components/agenda-navigation";
import { useAgendaStore } from "@/app/lib/store";

interface Option {
  id: number;
  optionText: string;
}

interface Agenda {
  id: number;
  speaker_id: string;
  title: string;
  description: string;
  is_visible: boolean;
  is_open: boolean;
  created_at: string;
  options: Option[];
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
}

export default function CurrentAgendas() {
  const { collapsed, setCollapsed } = useCollapsedContext();
  const { agendaType } = useAgendaStore();
  const { user, isSignedIn } = useUser();

  const [isMember, setIsMember] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [agendaData, setAgendaData] = useState<Agenda[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [sortField, setSortField] = useState<"date" | "title">("date");
  const [addAgendaModalOpen, setAddAgendaModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState("7days"); // NEW

  const handleSearch = (query: string) => {
    setSearchQuery(query.toLowerCase());
  };

  const applyDateFilter = (agenda: Agenda) => {
    if (dateFilter === "all") return true;
    const createdDate = new Date(agenda.created_at);
    const now = new Date();
    const compareDate = new Date();

    switch (dateFilter) {
      case "7days":
        compareDate.setDate(now.getDate() - 7);
        break;
      case "1month":
        compareDate.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        compareDate.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        compareDate.setMonth(now.getMonth() - 6);
        break;
      case "1year":
        compareDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return true;
    }

    return createdDate >= compareDate;
  };

  const filteredAndSortedAgendas = agendaData
    .filter(item =>
      (agendaType === "current" ? item.is_open : !item.is_open) &&
      item.title.toLowerCase().includes(searchQuery) &&
      applyDateFilter(item)
    )
    .sort((a, b) => {
      if (sortField === "title") {
        return sortDirection === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
      } else {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
    });

  useEffect(() => {
    const channel = pusherClient.subscribe('agenda-channel');
    const refresh = () => fetchAgendas();

    channel.bind('new-agenda', refresh);
    channel.bind('closed-agenda', refresh);
    channel.bind('changed-visibility', refresh);

    return () => {
      channel.unbind('new-agenda', refresh);
      channel.unbind('closed-agenda', refresh);
      channel.unbind('changed-visibility', refresh);
    };
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      const role = user?.publicMetadata?.role;
      if (role === "senate_member" || role === "super_admin") setIsMember(true);
      if (role === "senate_speaker" || role === "super_admin") setIsSpeaker(true);
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    if (isSignedIn) {
      fetchAgendas();
    }
  }, [agendaType, isSignedIn]);

  async function fetchAgendas() {
    try {
      const response = await fetch('/api/get-agendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_open: agendaType === "current" }),
      });
      if (!response.ok) throw new Error('Failed to fetch agendas');
      setSortField("date");
      setSortDirection("desc");
      const data = await response.json();
      setAgendaData(data.agendas);
    } catch (error) {
      console.error('Error fetching agendas:', error);
    } 
  }

  const userData: User = {
    id: user?.id || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
  };

  return (
    <div className="pt-10">
      <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="ml-0 sm:ml-64 p-6" onClick={() => setCollapsed(true)}>

        {/* Navigation and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <AgendaNavigation />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search agendas..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            {isSpeaker && (
              <Button onClick={() => setAddAgendaModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-1" /> Add Agenda
              </Button>
            )}
          </div>
        </div>

        {/* Filter and Sort Section */}
        <div className="flex justify-between items-center mb-4">
        
        {/* Left side: Filter button and selected filter */}
        <div className="flex items-center gap-2">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                Filter Dates
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setDateFilter("all")}>All Time</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("7days")}>Past 7 Days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("1month")}>Past Month</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("3months")}>Past 3 Months</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("6months")}>Past 6 Months</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDateFilter("1year")}>Past Year</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>

            {/* Selected filter badge */}
            {dateFilter !== "all" && (
                <span className="px-2 py-1 rounded-full text-xs sm:text-sm bg-purple-100 text-purple-800 whitespace-nowrap">
                    {dateFilter === "7days" && "Past 7 Days"}
                    {dateFilter === "1month" && "Past Month"}
                    {dateFilter === "3months" && "Past 3 Months"}
                    {dateFilter === "6months" && "Past 6 Months"}
                    {dateFilter === "1year" && "Past Year"}
                </span>
                )}

        </div>

        {/* Right side: Sort button */}
        <div className="flex items-center gap-2">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                Sort by {sortField === "date" ? "Date" : "Title"}
                {sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                onClick={() => {
                    if (sortField === "date") {
                    setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
                    } else {
                    setSortField("date");
                    setSortDirection("asc");
                    }
                }}
                >
                <Calendar className="h-4 w-4 mr-2" /> Date
                </DropdownMenuItem>

                <DropdownMenuItem
                onClick={() => {
                    if (sortField === "title") {
                    setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
                    } else {
                    setSortField("title");
                    setSortDirection("asc");
                    }
                }}
                >
                <FileText className="h-4 w-4 mr-2" /> Title
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>

        </div>
        {/* Labels Section */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-100 rounded-lg font-medium text-sm mb-4">
        <div className="col-span-6 sm:col-span-5">Title</div>
        <div className="hidden sm:block col-span-6 sm:col-span-3">Date</div>

        {isSpeaker ? (
            <div className="hidden sm:block sm:col-span-2 text-center">Visible</div>
        ) : (
            <div className="hidden sm:block sm:col-span-2 text-center">Your Vote</div>
        )}
            
        <div className="sm:col-span-2 text-center">Actions</div>
        </div>





        {/* Agenda List */}
        <div className="space-y-4">
          {filteredAndSortedAgendas.length > 0 ? (
            filteredAndSortedAgendas.map((item, index) => (
              <AgendaSection
                key={index}
                agenda={item}
                page={agendaType}
                isMember={isMember}
                isSpeaker={isSpeaker}
                user={userData}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">No agendas found</div>
          )}
        </div>

        {/* Add Agenda Modal */}
        {user && (
          <AddAgenda
            user={user}
            isOpen={addAgendaModalOpen}
            onClose={() => setAddAgendaModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}