// frontend/utils/fakeApi.js
export function generateRandomProposals(count = 5, activeBE = false) {
  if (!activeBE) return [];

  const sampleTitles = [
    "Improve UI design",
    "Add new feature",
    "Bug fix required",
    "Refactor component",
    "Optimize performance",
  ];

  const sampleUsers = [
    { name: "Alice Johnson", initials: "AJ", type: "Human" },
    { name: "Bob Smith", initials: "BS", type: "Company" },
    { name: "Charlie Lee", initials: "CL", type: "AI" },
  ];

  const sampleMedia = [
    { type: "image", url: "https://picsum.photos/400/200" },
    { type: "video", url: "https://www.youtube.com/watch?v=jWQx2f-CErU&pp=ygUSYXN0YSBtdXNpY2Ega29yZWFu" },
    { type: "video", url: "https://www.youtube.com/watch?v=ZeerrnuLi5E&pp=ygUTYWVzcGEgbXVzaWNhIGtvcmVhbg%3D%3D" },
    { type: "link", url: "https://example.com" },
    { type: "file", url: "https://example.com/sample.pdf" },
    null,
  ];

  const proposals = Array.from({ length: count }).map((_, i) => {
    const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
    const media = sampleMedia[Math.floor(Math.random() * sampleMedia.length)];

    const comments = Array.from({ length: Math.floor(Math.random() * 5) }).map(
      (_, j) => ({
        id: j + 1,
        user: sampleUsers[Math.floor(Math.random() * sampleUsers.length)].name,
        text: "This is a sample comment " + (j + 1),
      })
    );

    return {
      id: `${i + 1}`,
      userName: user.name,
      userInitials: user.initials,
      author_type: user.type,
      title: sampleTitles[Math.floor(Math.random() * sampleTitles.length)],
      text: media ? "" : "This is a text-only post for proposal " + (i + 1),
      media: media
        ? {
            image: media.type === "image" ? media.url : null,
            video: media.type === "video" ? media.url : null,
            link: media.type === "link" ? media.url : null,
            file: media.type === "file" ? media.url : null,
          }
        : null,
      comments,
      likes: Math.floor(Math.random() * 100),
      dislikes: Math.floor(Math.random() * 20),
      time: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
    };
  });

  return proposals;
}