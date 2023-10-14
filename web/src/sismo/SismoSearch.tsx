// components/SearchBar.tsx
import { Badge } from "../logic/services";
import React from 'react';
import AsyncSelect from 'react-select/async';

interface SearchBarProps {
  loadOptions: (inputValue: string) => Promise<any>;
  onSelect: (selected: Badge[]) => void;
}

const SismoSearch: React.FC<SearchBarProps> = ({ loadOptions, onSelect }) => {
  return (
    <>
    <span className="font-bold mb--2">Search group in SISMO</span>
    <AsyncSelect
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      onChange={onSelect as any}
      select-option={onSelect as any}
    />
    </>
    
  );
};

export default SismoSearch;