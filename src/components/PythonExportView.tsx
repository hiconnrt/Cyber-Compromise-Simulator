import React, { useState } from 'react';
import {
  Code2,
  Download,
  Copy,
  Check,
  FileCode,
  Terminal,
  FolderDown,
} from 'lucide-react';
import { PYTHON_REFERENCE_FILES, PythonFile } from '../data/pythonReferenceCode';
import { downloadFile } from '../utils/exportUtils';

export const PythonExportView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PythonFile>(
    PYTHON_REFERENCE_FILES[3] || PYTHON_REFERENCE_FILES[0] // Default to app.py
  );
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (file: PythonFile) => {
    downloadFile(
      file.content,
      file.filename,
      file.filename.endsWith('.py') ? 'text/x-python;' : 'text/plain;'
    );
  };

  const handleDownloadAllFiles = () => {
    PYTHON_REFERENCE_FILES.forEach((file, idx) => {
      setTimeout(() => {
        handleDownloadFile(file);
      }, idx * 250);
    });
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            Python + Streamlit Standalone Project Export
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Need to run the simulator locally in Python &amp; Streamlit? Download the
            complete, self-contained Python project codebase below.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadAllFiles}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
          >
            <FolderDown className="w-4 h-4" /> Download All Python Files (6 files)
          </button>
        </div>
      </div>

      {/* Quick Run Terminal Card */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300">
        <div className="flex items-center gap-2 text-slate-400 mb-2 font-sans font-bold">
          <Terminal className="w-4 h-4 text-emerald-400" />
          Terminal Launch Commands (Windows PowerShell / macOS / Linux):
        </div>
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-1 text-emerald-300">
          <div>$ python -m pip install -r requirements.txt</div>
          <div>$ python -m streamlit run app.py</div>
        </div>
      </div>

      {/* File Browser and Editor Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* File List */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
            Project Files
          </div>
          {PYTHON_REFERENCE_FILES.map((file) => {
            const isSelected = file.filename === selectedFile.filename;
            return (
              <button
                key={file.filename}
                onClick={() => setSelectedFile(file)}
                className={`w-full p-2.5 rounded-lg text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-xs font-mono font-bold truncate">
                    {file.filename}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Code View Card */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold font-mono text-white">
                {selectedFile.filename}
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedFile.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>

              <button
                onClick={() => handleDownloadFile(selectedFile)}
                className="px-3 py-1.5 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download {selectedFile.filename}
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="p-4 bg-slate-950 overflow-auto max-h-[500px]">
            <pre className="text-xs font-mono text-slate-300 leading-relaxed">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
