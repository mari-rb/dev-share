"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { getProfile, saveProfile } from "@/lib/storage";
import { dispatchQoeStep } from "@/lib/qoe";
import {
  CATEGORIES,
  ALL_TOOLS,
  type Category,
  type UserProfile,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

export function ProfileForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [area, setArea] = useState<Category>("Dev");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [existingProfile, setExistingProfile] = useState<UserProfile | null>(
    null,
  );

  useEffect(() => {
    dispatchQoeStep("criar-perfil", "inicio-fluxo");
    const profile = getProfile();
    if (profile) {
      setName(profile.name);
      setBio(profile.bio);
      setArea(profile.area);
      setSelectedTools(profile.tools);
      setExistingProfile(profile);
    }
  }, []);

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool],
    );
    dispatchQoeStep("criar-perfil", "preenchimento-ferramentas");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatchQoeStep("criar-perfil", "clique-submit");

    const profile: UserProfile = {
      id: existingProfile?.id || `user-${Date.now()}`,
      name,
      bio,
      area,
      tools: selectedTools,
    };

    saveProfile(profile);
    dispatchQoeStep("criar-perfil", "confirmacao-salvo");

    // Problema de usabilidade proposital: delay de 5s sem feedback visual
    // Após 5s, retoma o fluxo redirecionando para o feed
    setTimeout(() => {
      router.push("/");
    }, 5000);
  };

  // Removida a tela de confirmação - sempre mostra o formulário

  return (
    <div data-testid="profile-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {existingProfile ? "Editar Perfil" : "Criar Perfil"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure seu perfil para compartilhar dicas
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">
                {name || "Seu nome"}
              </p>
              <p className="text-xs text-muted-foreground">{area}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <Label
                htmlFor="name"
                className="mb-1.5 block text-sm text-card-foreground"
              >
                Nome
              </Label>
              <Input
                id="name"
                data-testid="input-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  dispatchQoeStep("criar-perfil", "preenchimento-nome");
                }}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div>
              <Label
                htmlFor="bio"
                className="mb-1.5 block text-sm text-card-foreground"
              >
                Bio curta
              </Label>
              <Textarea
                id="bio"
                data-testid="input-bio"
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  dispatchQoeStep("criar-perfil", "preenchimento-bio");
                }}
                placeholder="Fale um pouco sobre você..."
                className="min-h-20"
                required
              />
            </div>

            <div>
              <Label className="mb-2 block text-sm text-card-foreground">
                Area principal
              </Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setArea(cat);
                      dispatchQoeStep("criar-perfil", "preenchimento-area");
                    }}
                    data-testid={`area-${cat.toLowerCase()}`}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      area === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <Label className="mb-3 block text-sm text-card-foreground">
            Ferramentas favoritas
          </Label>
          <div className="flex flex-wrap gap-2">
            {ALL_TOOLS.map((tool) => (
              <button
                key={tool}
                type="button"
                onClick={() => toggleTool(tool)}
                data-testid={`tool-${tool.toLowerCase().replace(/[\s.]/g, "-")}`}
                className="transition-colors"
              >
                <Badge
                  variant={selectedTools.includes(tool) ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer",
                    selectedTools.includes(tool) &&
                      "bg-primary text-primary-foreground",
                  )}
                >
                  {tool}
                </Badge>
              </button>
            ))}
          </div>
        </div>

        <Button
          type="submit"
          data-testid="submit-profile"
          disabled={!name.trim() || !bio.trim()}
          className="w-full"
          size="lg"
        >
          {existingProfile ? "Atualizar Perfil" : "Criar Perfil"}
        </Button>
      </form>
    </div>
  );
}

