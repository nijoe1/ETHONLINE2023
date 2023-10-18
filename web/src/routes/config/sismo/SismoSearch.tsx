// components/SearchBar.tsx
import { Badge } from "../../../logic/services";
import React from "react";
import AsyncSelect from "react-select/async";
import "./styles.css"
interface SearchBarProps {
  loadOptions: (inputValue: string) => Promise<any>;
  onSelect: (selected: Badge[]) => void;
}

const SismoSearch: React.FC<SearchBarProps> = ({ loadOptions, onSelect }) => {
  return (
    <div>
      <span className="font-bold mb--2">Search group in SISMO</span>
      <AsyncSelect
        cacheOptions
        defaultOptions
        loadOptions={loadOptions}
        onChange={onSelect as any}
        select-option={onSelect as any}
        classNamePrefix="testSelect"
      />
    </div>
  );
};

export default SismoSearch;
