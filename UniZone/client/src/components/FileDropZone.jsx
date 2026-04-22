import { useCallback, useRef, useState } from "react";

/**
 * FileDropZone
 * Props:
 *   files         – array of File objects (controlled)
 *   onChange      – (files: File[]) => void
 *   accept        – string  e.g. ".pdf,.docx,image/*"
 *   multiple      – bool  (default true)
 *   maxSizeMB     – number (default 10)
 *   label         – string
 *   error         – string
 */
export default function FileDropZone({
  files = [],
  onChange,
  accept = "*",
  multiple = true,
  maxSizeMB = 10,
  label = "Attachments",
  error,
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const processFiles = useCallback(
    (incoming) => {
      const maxBytes = maxSizeMB * 1024 * 1024;
      const valid = Array.from(incoming).filter((f) => f.size <= maxBytes);
      const next = multiple ? [...files, ...valid] : valid.slice(0, 1);
      // deduplicate by name+size
      const seen = new Set();
      const deduped = next.filter((f) => {
        const key = `${f.name}-${f.size}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      onChange?.(deduped);
    },
    [files, multiple, maxSizeMB, onChange]
  );

  const onDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };
  const onInputChange = (e) => {
    processFiles(e.target.files);
    e.target.value = "";
  };
  const removeFile = (idx) =>
    onChange?.(files.filter((_, i) => i !== idx));

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-300">{label}</label>
      )}

      {/* Drop area */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`flex min-h-[110px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center transition-all duration-200
          ${
            dragging
              ? "border-blue-400 bg-blue-500/15 scale-[1.01]"
              : "border-white/20 bg-white/5 hover:border-blue-400/60 hover:bg-blue-500/10"
          }
          ${error ? "border-red-500/50" : ""}
        `}
      >
        <span className="text-3xl select-none">{dragging ? "📂" : "📁"}</span>
        <p className="text-sm font-medium text-slate-200">
          {dragging ? "Release to attach files" : "Drag & drop files here"}
        </p>
        <p className="text-xs text-slate-400">
          or <span className="text-blue-400 underline underline-offset-2">browse</span> — max {maxSizeMB} MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={onInputChange}
        />
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* File list */}
      {files.length > 0 && (
        <ul className="flex flex-col gap-2 mt-1">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0">
                  {/\.(pdf)$/i.test(f.name)
                    ? "📄"
                    : /\.(docx?|odt)$/i.test(f.name)
                    ? "📝"
                    : /\.(xlsx?|csv)$/i.test(f.name)
                    ? "📊"
                    : /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name)
                    ? "🖼️"
                    : /\.(mp4|mov|avi|mkv)$/i.test(f.name)
                    ? "🎥"
                    : "📎"}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {f.name}
                  </p>
                  <p className="text-xs text-slate-400">{formatSize(f.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-red-500/20 hover:text-red-400"
                title="Remove"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
