/Users/henriquegalinha/Documents/VS Code/super-nova-2177/super-nova-2177/frontend/content/proposal/content/ProposalCard.jsx
---
import React from "react";

const backendUrl = "http://localhost:8000";

export default function ProposalCard({ proposal }) {
  return (
    <div className="proposal-card">
      <h2>{proposal.title}</h2>
      <p>{proposal.text}</p>
      <div className="author">
        <img
          src={proposal.author_img}
          alt={proposal.userName}
          className="author-img"
        />
        <span>{proposal.userName}</span>
      </div>
      {proposal.media.image && (
        <img
          src={proposal.media.image.startsWith("http") ? proposal.media.image : backendUrl + proposal.media.image}
          alt="Proposal media"
          className="proposal-image"
        />
      )}
      {proposal.media.video && (
        <video controls src={proposal.media.video} />
      )}
      {proposal.media.link && (
        <a href={proposal.media.link} target="_blank" rel="noopener noreferrer">
          {proposal.media.link}
        </a>
      )}
      {proposal.media.file && (
        <a
          href={proposal.media.file.startsWith("http") ? proposal.media.file : backendUrl + proposal.media.file}
          target="_blank"
          rel="noopener noreferrer"
          download
        >
          Download File
        </a>
      )}
    </div>
  );
}

---

/Users/henriquegalinha/Documents/VS Code/super-nova-2177/super-nova-2177/frontend/content/proposal/Proposal.jsx
---
import React from "react";
import ProposalCard from "./content/ProposalCard";

const backendUrl = "http://localhost:8000";

export default function Proposal({ proposal }) {
  const mediaWithFullUrls = {
    ...proposal.media,
    image: proposal.media.image && !proposal.media.image.startsWith("http") ? backendUrl + proposal.media.image : proposal.media.image,
    file: proposal.media.file && !proposal.media.file.startsWith("http") ? backendUrl + proposal.media.file : proposal.media.file,
  };

  return (
    <div>
      <ProposalCard {...proposal} media={mediaWithFullUrls} />
    </div>
  );
}

---

/Users/henriquegalinha/Documents/VS Code/super-nova-2177/super-nova-2177/frontend/content/create post/InputFields.jsx
---
import React, { useState } from "react";

export default function InputFields({ onSubmit }) {
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [otherFields, setOtherFields] = useState({});

  async function handleFileUpload(fileToUpload, type) {
    const formData = new FormData();
    if (type === "image") {
      formData.append("file", fileToUpload);
      const res = await fetch("http://localhost:8000/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.url;
    } else if (type === "file") {
      formData.append("file", fileToUpload);
      const res = await fetch("http://localhost:8000/upload-file", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.url;
    }
    return "";
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = "";
    let fileUrl = "";

    if (image) {
      imageUrl = await handleFileUpload(image, "image");
    }
    if (file) {
      fileUrl = await handleFileUpload(file, "file");
    }

    onSubmit({
      ...otherFields,
      image: imageUrl,
      file: fileUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Other input fields */}
      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
        accept="image/*"
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button type="submit">Submit</button>
    </form>
  );
}

