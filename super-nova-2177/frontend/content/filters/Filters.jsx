import { useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import content from "../../assets/content.json";

function Filters({filter, setFilter}) {
  const [open, setOpen] = useState(false);

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
          {Object.values(content.filters).map((filterItem, index) => (
            <li onClick={() => setFilter(filterItem)} key={index} className="hover:bg-[var(--gray)] rounded-full px-2">{filterItem}</li>
          ))}
        </ul>
      </div>
    </button>
  );
}

export default Filters;
