import { useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import content from "../../assets/content.json";

function Filters() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  return (
    <button
      className="absolute top-2 left-2 lg:top-14 bg-white shadow-md rounded-[15px] px-2 py-1 min-h-10 w-27"
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between items-center">
          <p>{filter}</p>
          {open ? <FaAngleUp /> : <FaAngleDown />}
      </div>
      <div className={`${
            open ? "" : "hidden"
          } border-t border-t-[var(--horizontal-line)]`}>
        <ul
          className={` text-left flex flex-col gap-1 py-2`}
        >
          {Object.values(content.filters).map((filter, index) => (
            <li onClick={() => setFilter(filter)} key={index} className="hover:bg-[var(--gray)] rounded-full px-2">{filter}</li>
          ))}
        </ul>
      </div>
    </button>
  );
}

export default Filters;
