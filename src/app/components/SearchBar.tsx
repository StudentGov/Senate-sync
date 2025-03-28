import React, { useState } from "react";
import styles from "./navBar/SearchBar.module.css";

const SearchBar = ({ onSearch }: { onSearch: (query: string) => void }) => {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className={styles.searchBar}>
      <input
        type="text"
        placeholder="Search..."
        value={query}
        onChange={handleSearch}
        className={styles.input}
      />
    </div>
  );
};

export default SearchBar; 
