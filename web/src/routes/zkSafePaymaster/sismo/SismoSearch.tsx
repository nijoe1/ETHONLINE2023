// components/SearchBar.tsx
import { Badge } from "../../../logic/services";
import React from "react";
import AsyncSelect from "react-select/async";
import "./styles.css";
interface SearchBarProps {
  loadOptions: (inputValue: string) => Promise<any>;
  onSelect: (selected: Badge[]) => void;
}

const SismoSearch: React.FC<SearchBarProps> = ({ loadOptions, onSelect }) => {
  return (
    <div>
      <div className="flex flex-col items-center mt-5">
        <span className="font-bold mt-5 mx-2">Search sismo groups</span>
        <AsyncSelect
          cacheOptions
          defaultOptions
          loadOptions={loadOptions}
          onChange={onSelect as any}
          select-option={onSelect as any}
          classNamePrefix="testSelect"
        />
      </div>
    </div>
  );
};

export default SismoSearch;
