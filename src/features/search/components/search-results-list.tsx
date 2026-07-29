"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, BookOpenText, BookMarked, MessagesSquare, FileText, Layers, HelpCircle, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchResultItem, SearchDomain } from "../types";

interface SearchResultsListProps {
  results: SearchResultItem[];
  isSearching: boolean;
  query: string;
}

const DOMAIN_ICON_MAP: Record<string, any> = {
  vocabulary: BookOpenText,
  grammar: BookMarked,
  conversation: MessagesSquare,
  documents: FileText,
  flashcards: Layers,
  quizzes: HelpCircle,
  collections: Layers,
  knowledge_graph: Network,
  recommendation: Sparkles,
};

const DOMAIN_LABEL_MAP: Record<string, string> = {
  vocabulary: "Từ Vựng",
  grammar: "Ngữ Pháp",
  conversation: "Hội Thoại AI",
  documents: "Tài Liệu",
  flashcards: "Thẻ Flashcards",
  quizzes: "Bài Quiz",
  collections: "Bộ Thẻ",
  knowledge_graph: "Knowledge Graph",
  recommendation: "Gợi Ý AI",
};

export function SearchResultsList({ results, isSearching, query }: SearchResultsListProps) {
  if (isSearching) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-surface/40">
        <Sparkles className="size-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3 animate-spin" />
        <h4 className="font-display text-base font-bold text-foreground">
          Đang quét vector ngữ nghĩa & tính toán độ tương đồng...
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">Truy vấn: &quot;{query}&quot;</p>
      </div>
    );
  }

  if (results.length === 0 && query.trim()) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-surface/40">
        <Sparkles className="size-8 text-muted-foreground mx-auto mb-3" />
        <h4 className="font-display text-base font-bold text-foreground">Không Tìm Thấy Kết Quả Phù Hợp</h4>
        <p className="mt-1 text-xs text-muted-foreground">Thử tìm kiếm với từ khóa khác hoặc chuyển sang chế độ Sơ Đồ Tri Thức.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((item) => {
        const Icon = DOMAIN_ICON_MAP[item.domain] || Sparkles;
        const domainLabel = DOMAIN_LABEL_MAP[item.domain] || item.domain;

        return (
          <div
            key={item.id}
            className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl border border-border/80 bg-surface/80 p-5 shadow-xs backdrop-blur-md transition-all duration-200 hover:border-emerald-500/50 hover:shadow-md gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                {/* Domain badge */}
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <Icon className="size-3" />
                  <span>{domainLabel}</span>
                </span>

                {/* Similarity Score Badge */}
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles className="size-3 text-amber-500" />
                  <span>{item.similarityScore}% Vector Match</span>
                </span>

                {item.language && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {item.language}
                  </span>
                )}
              </div>

              {/* Title & Subtitle */}
              <h3 className="font-display text-base font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                {item.title}
              </h3>
              {item.subtitle && (
                <p className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {item.subtitle}
                </p>
              )}

              {/* Snippet */}
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {item.snippet}
              </p>
            </div>

            {/* Jump Action Link */}
            {item.url && (
              <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs gap-1.5 shrink-0">
                <Link href={item.url}>
                  <span>Xem Chi Tiết</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
