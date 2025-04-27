// 'use client'; 
// import { useState, useEffect } from 'react';
// import ReactDOM from "react-dom";
// import styles from './individual.module.css'
// import pusherClient from '@/app/lib/pusher';

// interface Props{
//     agenda_id:number,
//     agenda_title:string
// }
// interface VoteData{
//     id: number,
//     name: string,
//     option: string
// }

// export default function Individual({agenda_id, agenda_title}: Props){
//     const [modal, setModal] = useState<boolean>(false);
//     const [voteData, setVoteData] = useState<VoteData[]>([])

//     useEffect(() => {
//         const channel = pusherClient.subscribe('agenda-channel')
      
//         const handleVoteUpdated = (data: { message: string }) => {
//           console.log(data.message)
//           fetchVotes();
//         };
      
//         channel.bind('vote-updated', handleVoteUpdated)
      
//         return () => {
//           channel.unbind('vote-updated', handleVoteUpdated)
//         }
//       }, [])

//     const toggleModal = () => {
//         setModal(!modal);
//     };
//     // UseEffect to manage modal state safely on the client side
//     useEffect(() => {
//         if (modal) {
//             document.body.classList.add("active-modal");
//         } else {
//             document.body.classList.remove("active-modal");
//         }
//     }, [modal]);
//     async function fetchVotes() {
//         try {
//           const response = await fetch('/api/get-individual-votes', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ agenda_id: agenda_id }),
//           });
      
//           if (!response.ok) throw new Error('Failed to fetch votes');
      
//           const data = await response.json();
//           console.log(`Fetched individual votes for ${agenda_title}:`, data);
//           setVoteData(data.data)
//         } catch (error) {
//           console.error(`Error fetching individaul votes for ${agenda_title}:`, error);
//         }
//       }
      
//     return (
//         <>
//             <button onClick={() => {toggleModal(); fetchVotes();}} className={styles.btnModal}>Individual Stats</button>
//             {modal && ReactDOM.createPortal(
//                 <div className={styles.modal}>
//                     <div onClick={toggleModal} className={styles.overlay}></div>
//                     <div className={styles.modalContent}>
//                         <h2 className={styles.title}>Ind stats</h2>
//                         <button className={styles.closeModal} onClick={toggleModal}>back</button>
//                         <div className={styles.sections}>
//                             <div className={styles.content}>
//                                 {voteData?.map((item, indx) => {
//                                     return (
//                                         <div key={indx} className={styles.section}>
//                                             <h2 className={styles.name}>{item.id}. {item.name}</h2>   
//                                             <h2 className={styles.option}>{item.option}</h2>
//                                         </div>
//                                     )
//                                     })}
//                               </div>   
//                         </div>                      
//                     </div>
//                 </div>,
//                 document.body
//             )}
//         </>
//     )
// }

"use client"
import { useState, useEffect } from "react"
import ReactDOM from "react-dom"
import { Search, ArrowUpDown, X } from "lucide-react"
import pusherClient from "@/app/lib/pusher"

interface Props {
  agenda_id: number
  agenda_title: string
}

interface VoteData {
  id: number
  name: string
  option: string
}

type SortField = "id" | "name" | "option"

export default function Individual({ agenda_id, agenda_title }: Props) {
  const [modal, setModal] = useState<boolean>(false)
  const [voteData, setVoteData] = useState<VoteData[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterOption, setFilterOption] = useState<string | null>(null)

  useEffect(() => {
    const channel = pusherClient.subscribe("agenda-channel")

    const handleVoteUpdated = (data: { message: string }) => {
      console.log(data.message)
      fetchVotes()
    }

    channel.bind("vote-updated", handleVoteUpdated)
    return () => {
      channel.unbind("vote-updated", handleVoteUpdated)
    }
  }, [])

  const toggleModal = () => {
    setModal(!modal)
    if (!modal) fetchVotes()
  }

  useEffect(() => {
    if (modal) document.body.classList.add("active-modal")
    else document.body.classList.remove("active-modal")
  }, [modal])

  async function fetchVotes() {
    try {
      const response = await fetch("/api/get-individual-votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agenda_id }),
      })
      if (!response.ok) throw new Error("Failed to fetch votes")
      const data = await response.json()
      console.log(`Fetched individual votes for ${agenda_title}:`, data)
      setVoteData(data.data)
    } catch (error) {
      console.error(`Error fetching individual votes for ${agenda_title}:`, error)
    }
  }

  // Unique options and color mapping
  const voteOptions = Array.from(new Set(voteData.map(v => v.option)))
  const generateColor = (index: number, total: number) => {
    const hue = (index * (360 / total)) % 360
    return `hsl(${hue}, 70%, 60%)`
  }
  const voteColors = voteOptions.reduce((acc, opt, i) => {
    acc[opt] = generateColor(i, voteOptions.length)
    return acc
  }, {} as Record<string, string>)

  // Sorting and filtering
  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDirection(dir => (dir === "asc" ? "desc" : "asc"))
    else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredVotes = voteData.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterOption === null || v.option === filterOption
    return matchesSearch && matchesFilter
  })

  const sortedVotes = [...filteredVotes].sort((a, b) => {
    let cmp = 0
    if (sortField === "id") cmp = a.id - b.id
    else if (sortField === "name") cmp = a.name.localeCompare(b.name)
    else cmp = a.option.localeCompare(b.option)
    return sortDirection === "asc" ? cmp : -cmp
  })

  return (
    <>
      <button
        onClick={toggleModal}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
      >
        Individual Stats
      </button>
  
      {modal &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* BACKDROP */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={toggleModal}
            />
  
            {/* MODAL CONTENT */}
            <div
              className="relative bg-white rounded-lg shadow-xl w-[700px] max-w-[90vw] max-h-[90vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                    Individual Votes
                </h2>
                <button
                  onClick={toggleModal}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </button>
              </div>
  
              {/* Search & Filters */}
              <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterOption(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      filterOption === null
                        ? "bg-purple-600 text-white shadow"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  {voteOptions.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setFilterOption(opt)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                        filterOption === opt
                          ? "bg-purple-600 text-white shadow"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
  
              {/* Table */}
              <div className="flex-1 overflow-auto px-6 pb-6">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {/* Name column */}
                        <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort("name")}
                        >
                        <div className="flex items-center">
                            Name
                            <ArrowUpDown
                            className={`ml-2 h-4 w-4 transform ${
                                sortField === "name" && sortDirection === "desc" ? "rotate-180" : ""
                            }`}
                            />
                        </div>
                        </th>

                        {/* Vote column */}
                        <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort("option")}
                        >
                        <div className="flex items-center justify-end">
                            Vote
                            <ArrowUpDown
                            className={`ml-2 h-4 w-4 transform ${
                                sortField === "option" && sortDirection === "desc" ? "rotate-180" : ""
                            }`}
                            />
                        </div>
                        </th>
                    </tr>
                    </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedVotes.length > 0 ? (
                      sortedVotes.map(vote => (
                        <tr key={vote.id} className="hover:bg-gray-50">
                          {/* Name cell */}
                          <td className="px-6 py-4 max-w-[200px] truncate whitespace-nowrap overflow-hidden text-sm font-medium text-gray-900">
                            {vote.name}
                          </td>
                          {/* Vote cell, fills rest and right-aligns */}
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right"
                            style={{ width: "100%" }}
                          >
                            <span
                              className="inline-block px-2 py-1 text-xs font-semibold rounded-full text-white"
                              style={{
                                backgroundColor: voteColors[vote.option] || "#888",
                              }}
                            >
                              {vote.option}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={2}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No votes found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
  
              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Total: {sortedVotes.length} vote
                  {sortedVotes.length !== 1 ? "s" : ""}
                </div>
                <button
                  onClick={toggleModal}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-md shadow transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
  
}
