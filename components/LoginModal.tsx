// // app/components/LoginModal.tsx
// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// type Props = {
//   onClose: () => void;
// };

// export default function LoginModal({ onClose }: Props) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isSignUp, setIsSignUp] = useState(false);
//   const router = useRouter();

//   const handleSubmit = async () => {
//     const url = isSignUp
//       ? "http://localhost:5000/api/auth/signup"
//       : "http://localhost:5000/api/auth/login";

//     const res = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email, password }),
//     });
//     const data = await res.json();
//     if (res.ok) {
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("userEmail", email);
//       alert(`${isSignUp ? "Signup" : "Login"} successful!`);
//       onClose();
//       router.push("/profile");
//     } else {
//       alert(data.msg);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
//       <div className="bg-white p-6 w-[400px]">
//         <h2 className="text-xl font-bold mb-2">
//           {isSignUp ? "Sign Up" : "Login"}
//         </h2>
//         <input
//           className="border p-2 w-full my-2"
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <input
//           className="border p-2 w-full my-2"
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <div className="flex justify-between">
//           <button
//             className="bg-blue-500 text-white px-4 py-2"
//             onClick={handleSubmit}
//           >
//             {isSignUp ? "Sign Up" : "Login"}
//           </button>
//           <button
//             className="text-blue-500 underline"
//             onClick={() => setIsSignUp(!isSignUp)}
//           >
//             {isSignUp ? "Already have an account?" : "Create an account?"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
