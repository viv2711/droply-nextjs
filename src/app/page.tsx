import SignUpForm from "@/components/SignupForm";
import Image from "next/image";
import { ClerkProvider } from "@clerk/nextjs";
export default function Home() {
  return(
    <ClerkProvider><SignUpForm/></ClerkProvider>
    
  )
}
