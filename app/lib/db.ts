import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || "";

export async function createClerkSupabaseClient(req: NextRequest) {
  return createClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      const { getToken } = getAuth(req);
      const token = await getToken();
      return token || '';
    },
  });
} 