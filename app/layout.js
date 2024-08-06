import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Header from "./components/Header";


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pantry Tracker",
  description: "Created by Karl Fernandes",
};

export default function RootLayout({ children }) {
  

  return (
    <ClerkProvider 
    appearance={{
      baseTheme: dark,
    }}>
      
      <html lang="en">
        <body className={inter.className}>
          <Header />
          
          <main className="container mx-auto">
            <div className="flex items-start justify-center min-h-screen">
              <div className='mt-20'>
              {children}
              </div>
            </div>
          </main>

        </body>
      </html>
    </ClerkProvider>
  );
}
