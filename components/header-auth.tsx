import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link"; // Usamos Link de Next.js
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!hasEnvVars) {
    return (
      <>
        <div className="flex gap-4 items-center">
          <div>
            <Badge
              variant={"default"}
              className="font-normal pointer-events-none"
            >
              Please update .env.local file with anon key and url
            </Badge>
          </div>
          <div className="flex gap-4">
            {/* Botones con colores del gradiente */}
            <Button
              size="sm"
              variant={"outline"}
              disabled
              className="px-6 py-2 border-2 border-purple-600 text-purple-600 rounded-lg shadow-md transition-all hover:bg-purple-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <Link href="/auth-pages/sign-in">Sign in</Link>
            </Button>
            <Button
              size="sm"
              variant={"default"}
              disabled
              className="px-6 py-2 bg-purple-700 text-white rounded-lg shadow-md transition-all hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              <Link href="/auth-pages/sign-up">Sign up</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-4">
      {/* Botones con colores del gradiente */}
      <Button
        size="sm"
        variant={"outline"}
        className="px-6 py-2 border-2 border-purple-600 text-purple-600 rounded-lg shadow-md transition-all hover:bg-purple-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        <Link href="/auth-pages/sign-in">Sign in</Link>
      </Button>
      <Button
        size="sm"
        variant={"default"}
        className="px-6 py-2 bg-purple-700 text-white rounded-lg shadow-md transition-all hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
      >
        <Link href="/auth-pages/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
