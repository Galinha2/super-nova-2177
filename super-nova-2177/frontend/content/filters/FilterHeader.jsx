import Input from "./Input"
import Filters from "./Filters"

function FilterHeader({filter, setFilter, setSearch, search}) {
        return (
        <div className="lg:absolute min-w-100 lg:min-w-54 lg:right-[-230px] bg-white shadow-md p-2 rounded-[25px] flex flex-row lg:flex-col gap-2 lg:h-26 w-full justify-end lg:justify-between mb-[-20px] lg:mb-0 lg:w-fit">
            <Filters filter={filter} setFilter={setFilter} />
            <Input setSearch={setSearch} search={search}/>
        </div>
    )
}

export default FilterHeader
