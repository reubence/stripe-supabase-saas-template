import DashboardHeader from "@/components/DashboardHeader";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { createClient } from '@/utils/supabase/server'
import { redirect } from "next/navigation"
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SAAS Starter Kit",
    description: "SAAS Starter Kit with Stripe, Supabase, Postgres",
};

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // check user plan in db
    const checkUserInDB = await db.select().from(usersTable).where(eq(usersTable.email, user.email!))
    
    if (!checkUserInDB.length) {
        console.log("User not found in database")
        return redirect('/subscribe')
    }

    if (checkUserInDB[0].plan === "none") {
        console.log("User has no active subscription")
        return redirect('/subscribe')
    }

    return (
        <html lang="en">
            <body className={inter.className}>
                <DashboardHeader />
                {children}
            </body>
        </html>
    );
}
