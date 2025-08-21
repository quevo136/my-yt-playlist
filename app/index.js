// // app/page.tsx
// import React from "react";
// import styles from "./page.module.css";

// const YOUTUBE_PLAYLIST_ITEM_API =
//   "https://www.googleapis.com/youtube/v3/playlistItems";

// async function getPlaylistData() {
//   const res = await fetch(
//     `${YOUTUBE_PLAYLIST_ITEM_API}?part=snippet&playlistId=RDJI4B8pj5G1M&maxResults=10&key=${process.env.YOUTUBE_APIKEY}`,
//     { cache: "no-store" } // ensures fresh server-side fetch
//   );
//   const data = await res.json();
//   return data;
// }

// export default async function Page() {
//   const data = await getPlaylistData();

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-6">My YouTube Playlist</h1>

//       <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {data.items?.map((item, index) => {

//           console.log('item',item);
//           const { id, snippet ={}} = item;
//           const { title, thumbnails = {} , resourceId} = snippet;
//           const { medium = {} } = thumbnails;
//           return(
//             <li key={id} className = {styles.card}>
//               <a href = {`https://www.youtube.com/watch?v=${resourceId?.videoId}`} >
//                 <p>
//                   <img width={medium.width} height={medium.height} src = {medium.url} alt= ""/>
//                 </p>
//                 <h3 className="font-semibold">{item.snippet?.title}</h3>
//               </a>
            
//             <p className="text-gray-600">{item.snippet?.description}</p>
//           </li>
//           )}
          
//         )}
//       </ul>
//     </div>
//   );
// }
