"use client";

import {
  BookOpenText,
  BookMarked,
  GraduationCap,
  MessagesSquare,
  CalendarDays,
  Search,
  Languages,
  Sparkles,
} from "lucide-react";
import { AGENT_TEMPLATES } from "../lib/prompt-templates";
import { AgentType } from "../types";

const ICON_MAP = {
  BookOpenText,
  BookMarked,
  GraduationCap,
  MessagesSquare,
  CalendarDays,
  Search,
  Languages,
  Sparkles,
};

interface AgentSelectorProps {
  activeAgent: AgentType;
  onSelectAgent: (agent: AgentType) => void;
  onSelectPresetPrompt: (prompt: string) => void;
}

export function AgentSelector({
  activeAgent,
  onSelectAgent,
  onSelectPresetPrompt,
}: AgentSelectorProps) {
  const activeTemplate = AGENT_TEMPLATES[activeAgent];

  return (
    <div className="space-y-4">
      {/* 8 Agent Cards Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {(Object.keys(AGENT_TEMPLATES) as AgentType[]).map((agentKey) => {
          const t = AGENT_TEMPLATES[agentKey];
          const Icon = ICON_MAP[t.iconName as keyof typeof ICON_MAP] || Sparkles;
          const isActive = activeAgent === agentKey;

          return (
            <button
              key={agentKey}
              onClick={() => onSelectAgent(agentKey)}
              className={`group flex flex-col items-center justify-between rounded-xl border p-3 text-center transition-all duration-200 ${
                isActive
                  ? "border-emerald-600 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-600"
                  : "border-border bg-surface/60 hover:border-emerald-500/40 hover:bg-surface"
              }`}
            >
              <div
                className={`flex size-9 items-center justify-center rounded-lg border ${t.badgeColor} transition-transform group-hover:scale-105`}
              >
                <Icon className="size-4" />
              </div>
              <span className="mt-2 font-display text-xs font-bold text-foreground line-clamp-1">
                {t.name.replace(" Agent", "")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Preset Prompt Chips for Active Agent */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-semibold text-muted-foreground">Gợi ý nhanh ({activeTemplate.name}):</span>
        {activeTemplate.presetPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelectPresetPrompt(prompt)}
            className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-emerald-500 hover:text-foreground hover:shadow-2xs"
          >
            💡 {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
