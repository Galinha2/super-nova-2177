import Input from "./Input"
import Filters from "./Filters"

function FilterHeader() {
        return (
        <div className="lg:absolute min-w-100 lg:min-w-54 lg:right-[-230px] bg-white shadow-md p-2 rounded-[25px] flex flex-row lg:flex-col gap-2 lg:h-26 w-full justify-end lg:justify-between mb-[-20px] lg:mb-0 lg:w-fit">
            <Filters />
            <Input />
        </div>
    )
}

export default FilterHeader
