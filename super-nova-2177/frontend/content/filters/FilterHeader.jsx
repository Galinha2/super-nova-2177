import Input from "./Input"
import Filters from "./Filters"

function FilterHeader({filter, setFilter, setSearch, search}) {
        return (
        <div className="fixed top-1 lg:top-50 lg:right-10 lg:w-10 xl:top-50 xl:left-1/2 xl:translate-x-[415px] max-w-65 md:max-w-130 min-w-100 lg:min-w-54 bg-white shadow-md p-2 rounded-[25px] flex flex-row lg:flex-col gap-2 lg:h-26 w-full justify-end lg:justify-between mb-[-20px] lg:mb-0 ">
            <Filters filter={filter} setFilter={setFilter} />
            <Input setSearch={setSearch} search={search}/>
        </div>
    )
}

export default FilterHeader
