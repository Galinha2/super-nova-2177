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
      {/* Bolinha com iniciais ou imagem */}
      {isValidImage(image) ? (
        <img 
          src={image} 
          alt={name} 
          className="rounded-full shadow-sm p-0 w-[2.3em] h-[2.3em] object-cover" 
          onError={(e) => { e.target.onerror = null; e.target.src = "/default-avatar.png"; }}
        />
      ) : (
        <p className="rounded-full bg-[var(--gray)] shadow-sm p-2">{initials}</p>
      )}

      {/* Comentário */}
      <div className="rounded-[15px] shadow-sm bg-[var(--gray)] p-2 flex flex-col gap-0">
        <p className="h-5 text-[var(--text-black)] font-[500]">{name}</p>
        <p>{comment}</p>
      </div>
    </div>
  );
}

export default DisplayComments;