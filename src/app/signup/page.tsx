import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignupForm } from "@/components/auth/signup-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function SignupPage() {
  const supabase = await createClient();
  const { data: chapters } = await supabase.from("chapters").select("id, name").order("name");
  const chapter = chapters?.[0];
  const { data: zones } = chapter
    ? await supabase.from("zones").select("*").eq("chapter_id", chapter.id).eq("active", true).order("sort_order")
    : { data: [] };

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            RescueLink
          </Link>
          <p className="text-sm text-muted-foreground">Register as a volunteer (&ldquo;Robin&rdquo;)</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Join {chapter?.name ?? "your chapter"}</CardTitle>
            <CardDescription>
              New accounts start as <strong>pending</strong> until a coordinator verifies you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chapter ? (
              <SignupForm chapterId={chapter.id} zones={zones ?? []} />
            ) : (
              <p className="text-sm text-muted-foreground">
                No chapter is configured yet. Ask an admin to run the database setup.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
