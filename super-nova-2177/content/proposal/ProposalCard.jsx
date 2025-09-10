import LiquidGlass from "../liquid glass/LiquidGlass";

function ProposalCard() {
  return (
    <LiquidGlass className={"rounded-[25px]"}>
        <div className="p-4 flex flex-col items-center gap-4">
          {/* Initials or logo */}
          <div className="flex">
              <p className="rounded-full bg-white px-3 py-2">HG</p>
              {/* Name */}
              <p>Henrique Galinha</p>
          </div>
          {/* Title */}
          <div className="flex flex-col">
              <h1>Title Ipsum</h1>
        
              {/* YouTube video below the image */}
              <div className="w-full aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/ZeerrnuLi5E"
                  title="YouTube video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-md"
                ></iframe>
          </div>
          </div>
    </div>
    </LiquidGlass>
  );
}

export default ProposalCard;