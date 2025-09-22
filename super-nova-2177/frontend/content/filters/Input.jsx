import { useState } from "react";
import { CiSearch } from "react-icons/ci";

function Input({ setSearch, search }) {
  
  return (
    <div className="relative w-auto min-w-65 md:min-w-95 lg:min-w-50 lg:w-50">
      <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        onChange={(e) => setSearch(e.target.value)}
        value={search}
        type="text"
        placeholder="Search for Post"
        className="w-full pl-10 pr-3 h-10 rounded-full shadow-md focus:outline-none"
      />
    </div>
  );
}

export default Input;
