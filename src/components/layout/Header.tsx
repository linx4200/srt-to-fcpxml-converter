import { Type, Download } from 'lucide-react';

interface HeaderProps {
  fileName: string;
  canExport: boolean;
  onExport: () => void;
}

export function Header({ fileName, canExport, onExport }: HeaderProps) {
  return (
    <header className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#1a1a1a] shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-theme-primary rounded-lg flex items-center justify-center">
          <Type size={18} className="text-black" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight">SRT to FCPXML</h1>
      </div>
      <div className="flex items-center gap-4">
        {fileName && (
          <span className="text-sm text-white/50 truncate max-w-[200px]">
            {fileName}
          </span>
        )}
        <button
          onClick={onExport}
          disabled={!canExport}
          className="flex items-center gap-2 bg-theme-primary hover:bg-theme-primary-soft disabled:opacity-50 disabled:hover:bg-theme-primary text-black px-4 py-1.5 rounded-full text-sm font-medium transition-all"
        >
          <Download size={16} />
          Export FCPXML
        </button>
      </div>
    </header>
  );
}
