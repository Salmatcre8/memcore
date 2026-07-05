"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrainCircuit, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("ada@memcore.dev");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("That email and password combination didn't work.");
      return;
    }
    router.push(params.get("callbackUrl") ?? "/workspace/search");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-dim text-emerald">
          <BrainCircuit size={20} />
        </span>
        <h1 className="font-display text-[22px] text-warmwhite">Sign in to MemCore</h1>
        <p className="mt-1 text-[13px] text-muted">Your team's collective memory, one login away.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl bg-card/70 hairline p-6">
        <div>
          <label className="mb-1.5 block text-[12px] text-muted">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@memcore.dev"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] text-muted">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error && <p className="text-[12.5px] text-red-400">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : "Sign in"}
        </Button>
      </form>

      <div className="mt-4 rounded-xl bg-surface/60 hairline px-4 py-3 text-[12px] leading-relaxed text-muted">
        Demo credentials — <span className="text-warmwhite">ada@memcore.dev</span> or{" "}
        <span className="text-warmwhite">femi@memcore.dev</span>, password{" "}
        <span className="text-warmwhite">memcore-demo</span>.
      </div>
    </div>
  );
}
