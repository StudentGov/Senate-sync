'use client';

import { useState } from 'react';
import styles from './pastAgendas.module.css';
import { useCollapsedContext } from '../../../components/sideBar/sideBarContext';
import SideBar from '../../../components/sideBar/SideBar';
import AgendaSection from '../../../components/agendaSection/agendaSection';
import AgendaData from '../../../agendas.json';
import SearchBar from '../../../components/SearchBar'; // Import SearchBar

export default function PastAgendas() {
  const { collapsed, setCollapsed } = useCollapsedContext();
  const [searchQuery, setSearchQuery] = useState(""); // State for search input
  const [sortOrder, setSortOrder] = useState("asc"); // State to manage sorting order

  // Function to handle search input
  const handleSearch = (query: string) => {
    setSearchQuery(query.toLowerCase()); // Store search query in lowercase for case-insensitive search
  };

  // Function to toggle sorting order
  const toggleSortOrder = () => {
    setSortOrder(prevOrder => (prevOrder === "asc" ? "desc" : "asc"));
  };

  // Filtered and sorted past agendas based on search query
  const filteredAndSortedAgendas = AgendaData
    .filter(item => item.agenda.toLowerCase().includes(searchQuery)) // Search filtering
    .sort((a, b) => { // Sorting logic
      if (sortOrder === "asc") {
        return a.agenda.localeCompare(b.agenda);
      } else {
        return b.agenda.localeCompare(a.agenda);
      }
    });

  return (
    <div className={styles.pastAgendas}>
      <div className={styles.top}>
        <h1>Past Agendas</h1>
        <div className={styles.searchAddContainer}>
          <SearchBar onSearch={handleSearch} />
          <button onClick={toggleSortOrder} className={styles.sortButton}>
            Sort ({sortOrder === "asc" ? "A-Z" : "Z-A"})
          </button>
        </div>
      </div>

      <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={styles.sections}>
        <div className={styles.labels}>
          <label>Title</label>
          <div className={styles.rightLabels}>
            <label>Voted</label>
            <label>Visible</label>
          </div>
        </div>

        {/* Map through filtered and sorted past agenda list */}
        {filteredAndSortedAgendas.map((item, index) =>
          !item.closed && <AgendaSection key={index} agenda={item} page={'past'} />
        )}
      </div>
    </div>
  );
}
