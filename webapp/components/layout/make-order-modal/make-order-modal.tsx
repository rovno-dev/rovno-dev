// "use client"

// import { colorStyles } from "@/utils/styles/colors";
// import { DialogContent, SnackbarCloseReason, useMediaQuery, useTheme } from "@mui/material";
// import { ReactNode, useState, useEffect, useRef } from "react";
// import { Dialog, DialogTitle, RDDialogProps } from "../core/data-display/Dialog";
// import MakeOrderModalVideo from "../MakeOrderModalVideo";

// export interface MakeOrderModalProps extends RDDialogProps {
//   videoIframe?: ReactNode;
// }

// export default function MakeOrderModal({ ...props }: MakeOrderModalProps) {

//   const [open, setOpen] = useState(false);
//   const scrollContainerRef = useRef<HTMLDivElement>(null);
//   const theme = useTheme();
//   const isSM = useMediaQuery(theme.breakpoints.down('sm'));

//   useEffect(() => {
//     const handleMessage = (event: MessageEvent) => {
//       if (event.origin.includes("forms.yandex.ru")) {
//         if (scrollContainerRef.current) {
//           scrollContainerRef.current.scrollTo({
//             top: 0,
//             behavior: "smooth",
//           });
//         }
//       }
//     };

//     window.addEventListener("message", handleMessage);
//     return () => window.removeEventListener("message", handleMessage);
//   }, []);

//   const handleClose = (
//     event: React.SyntheticEvent | Event,
//     reason?: SnackbarCloseReason,
//   ) => {
//     if (reason === 'clickaway') {
//       return;
//     }

//     setOpen(false);
//   };

//   return (
//     <>
//       <Dialog
//         fullScreen
//         slotProps={{
//           paper: {
//             sx: {
//               height: '100%', // Sets height to 100% of container
//               maxHeight: "calc(100% - 10rem)",
//               maxWidth: isSM ? "calc(100% - 8px)" : "calc(100% - 40px)",
//               m: 0, // Removes default margin
//             },
//           }
//         }}
//         sx={{
//           "& .MuiDialogContent-root": {
//             padding: 0,
//             overflow: 'hidden',
//           },
//         }}
//         fullWidth
//         maxWidth="md"
//         {...props}
//       >
//         <DialogContent>
//           <div className="grid grid-cols-[1fr] lg:grid-cols-[500px_1fr] xl:grid-cols-[800px_1fr] gap-x-[1rem] h-full">
//             <div className="pr-0 flex flex-col min-h-0">
//               <DialogTitle
//                 style={{
//                   marginBottom: "calc(1.5rem - 6px)"
//                 }}
//                 className="!pl-[1rem] sm:!pl-[2.25rem] !pt-[1rem] sm:!pt-[2.25rem]"
//               >
//                 Оформить заказ
//               </DialogTitle>
//               <div
//                 ref={scrollContainerRef}
//                 style={{
//                   //flex: 1,
//                   height: 'auto',
//                   overflowY: 'auto',
//                   paddingBottom: '1rem',
//                 }}
//                 className="
//                 !pl-[0.25rem] sm:!pl-[calc(2.25rem-12px)] 
//                 !pr-[0.5rem] sm:!pr-[calc(1rem-6px)]
//                 "
//               >
//                 <script src="https://forms.yandex.ru/_static/embed.js"></script>
//                 <iframe
//                   src="https://forms.yandex.ru/cloud/6936a4b1d0468820623c548e?iframe=1"
//                   name="ya-form-6936a4b1d0468820623c548e"
//                   style={{ width: '100%', border: 'none', borderRadius: '16px', overflow: 'hidden' }}
//                   className="md:h-[1500px] lg:h-[1550px]  overflow-x-hidden "
//                 />
//               </div>
//             </div>
//             {/* TODO: preload before modal opened */}
//             <MakeOrderModalVideo />
//           </div>
//         </DialogContent>
//       </Dialog>
//       {/* {message && (
//         <Portal>
//           <Snackbar
//             open={open}
//             autoHideDuration={6000}
//             onClose={handleClose}
//             message={message}
//             action={<>
//               <IconButton
//                 size="large"
//                 aria-label="close"
//                 color="inherit"
//                 onClick={handleClose}
//               >
//                 <CloseIcon fontSize="small" />
//               </IconButton>
//             </>}
//           />
//         </Portal>
//       )} */}
//     </>
//   );
// }