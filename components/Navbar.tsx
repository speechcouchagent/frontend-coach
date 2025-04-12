// // app/components/Navbar.tsx
// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// export default function Navbar() {
//   const [userEmail, setUserEmail] = useState<string | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     const email = localStorage.getItem("userEmail");
//     if (email) {
//       setUserEmail(email);
//     }
//   }, []);

//   const handleSignOut = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("userEmail");
//     setUserEmail(null);
//     router.push("/login");
//   };

//   return (
//     <nav className="navbar p-4 text-white flex justify-between items-center">
//       <ul className="flex space-x-6">
//         <li>
//           <Link href="/home">Home</Link>
//         </li>
//         <li>
//           <Link href="/signup">Sign Up</Link>
//         </li>
//         <li>
//           <Link href="/login">Login</Link>
//         </li>
//         <li>
//           <Link href="/profile">Profile</Link>
//         </li>
//         <li>
//           <Link href="/subscription">Subscription</Link>
//         </li>
//       </ul>
//       {userEmail && (
//         <div className="flex items-center space-x-4">
//           <span>{userEmail}</span>
//           <button className="btn bg-red-500" onClick={handleSignOut}>
//             Sign Out
//           </button>
//         </div>
//       )}
//     </nav>
//   );
// }
