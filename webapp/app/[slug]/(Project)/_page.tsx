// "use client";

// import React from "react";
// import { projects } from "./data";
// import { Container } from "@/components/ui/container";

// export default function ProjectsPage() {
//   return (
//     <main className="bg-[#0A0A0A] min-h-screen pt-20 pb-20">
//       <Container variant="full-width" className="max-w-[1440px] mx-auto px-4">

//         <div className="grid grid-cols-1 md:grid-cols-6 overflow-hidden rounded-[2.5rem] border border-white/5 mt-[30px]">
//           {projects.map((project) => (
//             <div
//               key={project.id}
//               className={`
//                 flex flex-col group border-[0.5px] border-white/5
//                 ${project.gridSize === "half" ? "md:col-span-3" : ""}
//                 ${project.gridSize === "small" ? "md:col-span-2" : ""}
//                 ${project.gridSize === "full" ? "md:col-span-6" : ""}
//               `}
//             >

//               <div className="relative aspect-[16/10] overflow-hidden bg-[#141414]">
//                 <img
//                   src={project.image}
//                   alt={project.title}
//                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
//                 />
//               </div>

//               <div
//                 className="py-5 px-6"
//                 style={{ backgroundColor: '#25262B' }}
//               >
//                 <h3 className="text-white text-[18px] font-bold leading-tight">
//                   {project.title}
//                 </h3>
//               </div>
//             </div>
//           ))}
//         </div>

//       </Container>
//     </main>
//   );
// }
