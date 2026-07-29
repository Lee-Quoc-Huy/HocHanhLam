"use client";

import { Folder, FolderOpen, Layers, Check } from "lucide-react";
import { LibraryFolder, LibraryCollection } from "../types";

interface LibraryFolderTreeProps {
  folders: LibraryFolder[];
  collections: LibraryCollection[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
}

export function LibraryFolderTree({
  folders,
  collections,
  selectedFolderId,
  onSelectFolder,
}: LibraryFolderTreeProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-surface/80 p-4 shadow-xs backdrop-blur-md space-y-3">
      <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Folder className="size-4 text-emerald-600 dark:text-emerald-400" />
          <span>Cấu Trúc Thư Mục</span>
        </h3>
      </div>

      <div className="space-y-1 text-xs">
        {/* All Items Button */}
        <button
          onClick={() => onSelectFolder(null)}
          className={`w-full text-left rounded-xl px-3 py-2 font-semibold flex items-center justify-between transition-all ${
            selectedFolderId === null
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <div className="flex items-center gap-2">
            <FolderOpen className="size-4" />
            <span>Tất Cả Tài Nguyên</span>
          </div>
          {selectedFolderId === null && <Check className="size-3.5" />}
        </button>

        {/* Folders List */}
        {folders.map((folder) => {
          const isSelected = selectedFolderId === folder.id;
          const folderCollections = collections.filter((c) => c.folder_id === folder.id);

          return (
            <div key={folder.id} className="space-y-0.5">
              <button
                onClick={() => onSelectFolder(folder.id)}
                className={`w-full text-left rounded-xl px-3 py-2 font-semibold flex items-center justify-between transition-all ${
                  isSelected
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span>{folder.name}</span>
                </div>
                {isSelected && <Check className="size-3.5" />}
              </button>

              {/* Sub-Collections */}
              {folderCollections.length > 0 && (
                <div className="pl-6 space-y-0.5">
                  {folderCollections.map((c) => (
                    <div
                      key={c.id}
                      className="text-[11px] text-muted-foreground py-1 px-2 rounded-lg hover:text-foreground flex items-center gap-1.5 font-medium"
                    >
                      <Layers className="size-3 text-amber-500" />
                      <span>{c.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
