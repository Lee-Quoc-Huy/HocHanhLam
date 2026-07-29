"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { SearchBar } from "./search-bar";
import { SearchResultsList } from "./search-results-list";
import { KnowledgeGraphView } from "./knowledge-graph-view";
import { useSemanticSearch } from "../hooks/use-semantic-search";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CommandKModal() {
  const {
    filter,
    results,
    autocompleteSuggestions,
    history,
    knowledgeNodes,
    knowledgeEdges,
    isSearching,
    isCommandKOpen,
    activeView,
    setFilter,
    executeSearch,
    fetchAutocomplete,
    clearHistory,
    setCommandKOpen,
    setActiveView,
  } = useSemanticSearch();

  return (
    <Dialog.Root open={isCommandKOpen} onOpenChange={setCommandKOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in" />
        <Dialog.Content className="fixed left-1/2 top-12 z-50 w-full max-w-4xl -translate-x-1/2 rounded-2xl border border-border bg-surface-raised p-6 shadow-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <h2 className="font-display text-base font-bold text-foreground">
              Tìm Kiếm Thông Minh Học Hành Lắm 🍃 (Semantic Search & Knowledge Graph)
            </h2>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" className="size-8 rounded-full">
                <X className="size-4" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Search Bar Input & Domain Tabs */}
          <SearchBar
            query={filter.query}
            domain={filter.domain}
            activeView={activeView}
            autocompleteSuggestions={autocompleteSuggestions}
            history={history}
            isSearching={isSearching}
            onQueryChange={(q) => {
              setFilter({ query: q });
              fetchAutocomplete(q);
            }}
            onDomainChange={(d) => setFilter({ domain: d })}
            onExecuteSearch={executeSearch}
            onClearHistory={clearHistory}
            onActiveViewChange={setActiveView}
          />

          {/* Body Content (Results or Knowledge Graph) */}
          <div className="flex-1 overflow-y-auto mt-4 pr-1">
            {activeView === "results" ? (
              <SearchResultsList
                results={results}
                isSearching={isSearching}
                query={filter.query}
              />
            ) : (
              <KnowledgeGraphView nodes={knowledgeNodes} edges={knowledgeEdges} />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
