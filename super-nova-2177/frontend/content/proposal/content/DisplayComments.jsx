function DisplayComments({ comment, name, image }) {

  const getInitials = (fullName) => {
    if (!fullName) return "";
    const parts = fullName.split(" ");
    const firstInitial = parts[0][0] || "";
    const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (firstInitial + lastInitial).toUpperCase();
  };

  const isValidImage = (url) => {
    if (!url) return false;
    return /\.(jpeg|jpg|png)$/i.test(url.trim());
  };

  const initials = getInitials(name);

  return (
    <div className="flex gap-2 items-start justify-start max-w-120">
 
      {isValidImage(image) ? (
        <img 
          src={image} 
          alt={name} 
          className="rounded-full shadow-md p-0 w-10 h-10 object-cover" 
          onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
        />
      ) : (
        <div className="flex items-center justify-center rounded-full bg-[var(--gray)] w-10 shadow-sm p-2">
          <p className={`${initials.length === 1 && "px-5"}`}>{initials}</p>
        </div>
      )}


      <div className="rounded-[15px] shadow-sm bg-[var(--gray)] p-2 flex flex-col gap-0">
        <p className="h-5 text-[var(--text-black)] font-[500]">{name}</p>
        <p>{comment}</p>
      </div>
    </div>
  );
}

export default DisplayComments;