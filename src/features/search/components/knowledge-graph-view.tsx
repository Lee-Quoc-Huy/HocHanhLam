"use client";

import { Network, Sparkles, BookOpenText, BookMarked, FileText } from "lucide-react";
import { KnowledgeGraphNode, KnowledgeGraphEdge } from "../types";

interface KnowledgeGraphViewProps {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

export function KnowledgeGraphView({ nodes, edges }: KnowledgeGraphViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
          <Network className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Sơ Đồ Mối Liên Hệ Ngữ Nghĩa (Knowledge Graph)</span>
        </h3>
        <span className="text-xs text-muted-foreground">
          {nodes.length} Nút Thực Thể · {edges.length} Liên Kết Cấu Trúc
        </span>
      </div>

      {/* Visual Graph Layout */}
      <div className="rounded-2xl border border-border/80 bg-surface/90 p-6 shadow-xl backdrop-blur-md space-y-6">
        {/* Node Categories Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold border-b border-border/60 pb-3">
          <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
            <BookOpenText className="size-4" /> Từ Vựng (Vocabulary)
          </span>
          <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <BookMarked className="size-4" /> Ngữ Pháp (Grammar)
          </span>
          <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
            <Sparkles className="size-4" /> Chủ Đề (Topic)
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <FileText className="size-4" /> Tài Liệu (Document)
          </span>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {nodes.map((node) => {
            const connectedEdges = edges.filter(
              (e) => e.source === node.id || e.target === node.id
            );

            let typeBadge = "bg-blue-500/10 text-blue-600 border-blue-500/20";
            if (node.type === "grammar") typeBadge = "bg-indigo-500/10 text-indigo-600 border-indigo-500/20";
            else if (node.type === "topic") typeBadge = "bg-purple-500/10 text-purple-600 border-purple-500/20";
            else if (node.type === "document") typeBadge = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";

            return (
              <div
                key={node.id}
                className="rounded-xl border border-border bg-background p-4 shadow-2xs space-y-2 hover:border-emerald-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${typeBadge}`}>
                    {node.type}
                  </span>
                  {node.language && (
                    <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                      {node.language}
                    </span>
                  )}
                </div>

                <h4 className="font-display text-sm font-bold text-foreground">{node.label}</h4>

                {/* Connected Relationships */}
                <div className="border-t border-border/40 pt-2 space-y-1">
                  {connectedEdges.map((e, idx) => {
                    const targetNode = nodes.find(
                      (n) => n.id === (e.source === node.id ? e.target : e.source)
                    );
                    return (
                      <p key={idx} className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                        <span>↳ {e.relation}:</span>
                        <span className="font-bold text-foreground">{targetNode?.label}</span>
                      </p>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
