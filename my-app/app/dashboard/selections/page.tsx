"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  UploadCloud, 
  Trash2, 
  FileSpreadsheet, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle,
  FileDown,
  RotateCcw
} from "lucide-react";
import { selectionService } from "@/services";
import { toast } from "react-hot-toast";
import ConfirmModal from "@/components/dashboard/ConfirmModal";

export default function SelectionsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "deleted">("active");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selections, setSelections] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [domainFilter, setDomainFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [resultFilter, setResultFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [evaluatorFilter, setEvaluatorFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    fetchSelections();
    setSelectedIds([]);
  }, [domainFilter, yearFilter, resultFilter, ratingFilter, evaluatorFilter, nameFilter, activeTab]);

  const fetchYears = async () => {
    try {
      const res = await selectionService.getDistinctYears();
      setAvailableYears(res.data || []);
    } catch (err) {
      console.error("Failed to load distinct years", err);
    }
  };

  const fetchSelections = async () => {
    try {
      setIsLoadingList(true);
      const params: any = {
        deleted: activeTab === "deleted" ? "true" : "false"
      };
      if (domainFilter !== "All") params.domain = domainFilter;
      if (yearFilter !== "All") params.year = yearFilter;
      if (resultFilter !== "All") params.result = resultFilter;
      if (ratingFilter !== "All") params.rating = ratingFilter;
      if (evaluatorFilter.trim()) params.evaluator = evaluatorFilter;
      if (nameFilter.trim()) params.name = nameFilter;

      const res = await selectionService.getSelections(params);
      setSelections(res.data || []);
    } catch (err) {
      console.error("Failed to load selections", err);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast.error("Please select a valid CSV file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast.error("Please select a valid CSV file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsUploading(true);
    try {
      const res = await selectionService.importSelections(formData);
      toast.success(res.data?.msg || "Club selection list imported successfully");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchSelections();
      fetchYears();
    } catch (err: any) {
      console.error("Upload failed", err);
      toast.error(err.response?.data?.msg || "Failed to upload club selection");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSelections = async () => {
    setIsDeleting(true);
    try {
      const res = await selectionService.deleteSelections(selectedIds);
      toast.success(res.data?.msg || "Selected club selections deleted successfully");
      setShowConfirmDelete(false);
      setSelectedIds([]);
      fetchSelections();
      fetchYears();
    } catch (err: any) {
      console.error("Failed to delete club selections", err);
      toast.error(err.response?.data?.msg || "Failed to delete club selections");
    } finally {
      setIsDeleting(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Student Name,Student Email,Domain,Date,Time Slot,Status,Panel,Result,Rating,Evaluator,Year of Selection\n"
      + "John Doe,johndoe@srmist.edu.in,Web Dev,2026-06-04,10:00 AM - 10:30 AM,Completed,Panel 1,SELECTED,9,Jane Evaluator,26\n"
      + "Jane Smith,janesmith@srmist.edu.in,AIML,2026-06-04,11:00 AM - 11:30 AM,Completed,Panel 2,REJECTED,4,Bob Evaluator,26";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_selections.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      <div className="bg-card/25 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <FileSpreadsheet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">Import Club Selection</h3>
              <p className="text-[10px] md:text-xs text-muted-foreground/40 uppercase tracking-widest font-black mt-1">Upload club selection CSV file</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={downloadSampleCSV}
            className="flex items-center justify-center gap-2 self-start sm:self-center px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-xs font-bold text-muted-foreground hover:text-white transition-all active:scale-95"
          >
            <FileDown className="w-4 h-4" /> Sample Format
          </button>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-primary/50 bg-white/[0.02] hover:bg-white/[0.04] transition-all rounded-2xl p-8 text-center cursor-pointer flex flex-col items-center justify-center gap-3 group/dropzone"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover/dropzone:bg-primary/10 flex items-center justify-center transition-all border border-white/5">
              <UploadCloud className="w-6 h-6 text-muted-foreground/40 group-hover/dropzone:text-primary transition-colors" />
            </div>
            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-white max-w-[250px] sm:max-w-md truncate mx-auto">{selectedFile.name}</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> CSV File Selected
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs font-bold text-muted-foreground group-hover/dropzone:text-white transition-colors">Drag and drop your club selection CSV here, or click to browse</p>
                <p className="text-[9px] text-muted-foreground/30 font-medium">Accepts .csv files matching standard template headers</p>
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={isUploading || !selectedFile}
            className="w-full flex items-center justify-center gap-2.5 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {isUploading ? "Processing Import..." : "Import Club Selection"}
          </button>
        </form>
      </div>

      <div className="bg-card/25 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden group max-w-full">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

        <div className="flex bg-white/5 p-1 rounded-xl w-fit mb-6">
          <button
            type="button"
            onClick={() => { setActiveTab("active"); setSelectedIds([]); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "active"
                ? "bg-primary text-white shadow-md"
                : "text-muted-foreground/60 hover:text-white"
            }`}
          >
            Active Club Selection
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("deleted"); setSelectedIds([]); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "deleted"
                ? "bg-primary text-white shadow-md"
                : "text-muted-foreground/60 hover:text-white"
            }`}
          >
            Deleted Folder
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
              {activeTab === "active" ? "Current Club Selection" : "Deleted Folder"}
            </h3>
            <p className="text-[10px] md:text-xs text-muted-foreground/40 uppercase tracking-widest font-black mt-1">Total Records: {selections.length}</p>
          </div>
          <div className="flex items-center gap-2">
            {(domainFilter !== "All" || yearFilter !== "All" || resultFilter !== "All" || ratingFilter !== "All" || evaluatorFilter.trim() || nameFilter.trim()) && (
              <button
                type="button"
                onClick={() => {
                  setDomainFilter("All");
                  setYearFilter("All");
                  setResultFilter("All");
                  setRatingFilter("All");
                  setEvaluatorFilter("");
                  setNameFilter("");
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-muted-foreground hover:text-white font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </button>
            )}
            {activeTab === "active" && selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-rose-500/20"
              >
                <Trash2 className="w-4 h-4" /> Delete Selected ({selectedIds.length})
              </button>
            )}
          </div>
        </div>

        {isLoadingList && selections.length === 0 ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin opacity-40" />
          </div>
        ) : selections.length > 0 ? (
          <div className="overflow-x-auto overflow-y-auto custom-scrollbar max-h-[500px] pb-3 -mx-6 md:-mx-8 px-6 md:px-8">
            <table className="w-full text-left text-xs text-muted-foreground min-w-[1200px]">
              <thead className="text-[10px] uppercase font-black tracking-wider text-muted-foreground/50 border-b border-white/5 sticky top-0 bg-[#09090b]/95 backdrop-blur-sm z-10">
                <tr>
                  {activeTab === "active" && (
                    <th className="pb-3 pl-4 pr-2 w-10">
                      <input
                        type="checkbox"
                        checked={selections.length > 0 && selectedIds.length === selections.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(selections.map(s => s._id));
                          } else {
                            setSelectedIds([]);
                          }
                        }}
                        className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-opacity-25 cursor-pointer"
                      />
                    </th>
                  )}
                  <th className={`pb-3 pr-6 min-w-[190px] ${activeTab === "active" ? "pl-2" : "pl-4"}`}>
                    <div className="flex items-center gap-1.5 w-full">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 shrink-0">Student Name</span>
                      <input 
                        type="text"
                        placeholder="Filter..."
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        className="bg-transparent border-none text-[10px] text-primary font-bold placeholder:text-muted-foreground/30 outline-none w-16 focus:w-20 transition-all m-0 p-0"
                      />
                    </div>
                  </th>
                  <th className="pb-3 pr-6 min-w-[220px]">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Student Email</span>
                  </th>
                  <th className="pb-3 pr-6 min-w-[150px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 shrink-0">Domain</span>
                      <select 
                        value={domainFilter} 
                        onChange={(e) => setDomainFilter(e.target.value)}
                        className="bg-transparent border-none text-[10px] text-primary font-black outline-none cursor-pointer p-0 hover:text-primary/80 transition-all"
                      >
                        <option value="All" className="bg-[#111] text-white">All</option>
                        <option value="Creatives" className="bg-[#111] text-white">Creatives</option>
                        <option value="Web Dev" className="bg-[#111] text-white">Web Dev</option>
                        <option value="Cloud" className="bg-[#111] text-white">Cloud</option>
                        <option value="Corporate" className="bg-[#111] text-white">Corporate</option>
                        <option value="AIML" className="bg-[#111] text-white">AIML</option>
                        <option value="APP DEV" className="bg-[#111] text-white">APP DEV</option>
                      </select>
                    </div>
                  </th>
                  <th className="pb-3 pr-6 min-w-[120px]">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Date</span>
                  </th>
                  <th className="pb-3 pr-6 min-w-[160px]">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Time Slot</span>
                  </th>
                  <th className="pb-3 pr-6 min-w-[130px]">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Status</span>
                  </th>
                  <th className="pb-3 pr-6 min-w-[100px]">
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">Panel</span>
                  </th>
                  <th className="pb-3 pr-6 min-w-[120px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 shrink-0">Rating</span>
                      <select 
                        value={ratingFilter} 
                        onChange={(e) => setRatingFilter(e.target.value)}
                        className="bg-transparent border-none text-[10px] text-primary font-black outline-none cursor-pointer p-0 hover:text-primary/80 transition-all"
                      >
                        <option value="All" className="bg-[#111] text-white">All</option>
                        {Array.from({ length: 5 }, (_, i) => i + 1).map((val) => (
                          <option key={val} value={String(val)} className="bg-[#111] text-white">{val}/5</option>
                        ))}
                      </select>
                    </div>
                  </th>
                  <th className="pb-3 pr-6 min-w-[170px]">
                    <div className="flex items-center gap-1.5 w-full">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 shrink-0">Evaluator</span>
                      <input 
                        type="text"
                        placeholder="Filter..."
                        value={evaluatorFilter}
                        onChange={(e) => setEvaluatorFilter(e.target.value)}
                        className="bg-transparent border-none text-[10px] text-primary font-bold placeholder:text-muted-foreground/30 outline-none w-16 focus:w-20 transition-all m-0 p-0"
                      />
                    </div>
                  </th>
                  <th className="pb-3 pr-4 text-right min-w-[155px]">
                    <div className="flex items-center gap-1.5 justify-end w-full">
                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 shrink-0">Year</span>
                      <select 
                        value={yearFilter} 
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="bg-transparent border-none text-[10px] text-primary font-black outline-none cursor-pointer p-0 hover:text-primary/80 transition-all text-right"
                      >
                        <option value="All" className="bg-[#111] text-white">All</option>
                        {availableYears.map((yr) => (
                          <option key={yr} value={String(yr)} className="bg-[#111] text-white">
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold text-white">
                {selections.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-white/[0.02] transition-colors">
                    {activeTab === "active" && (
                      <td className="py-3.5 pl-4 pr-2 w-10">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIds(prev => [...prev, item._id]);
                            } else {
                              setSelectedIds(prev => prev.filter(id => id !== item._id));
                            }
                          }}
                          className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary focus:ring-opacity-25 cursor-pointer"
                        />
                      </td>
                    )}
                    <td className={`py-3.5 pr-6 font-bold whitespace-nowrap ${activeTab === "active" ? "pl-2" : "pl-4"}`}>{item.name}</td>
                    <td className="py-3.5 pr-6 text-muted-foreground/60">{item.email}</td>
                    <td className="py-3.5 pr-6">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black text-primary bg-primary/10 border border-primary/20 uppercase tracking-widest whitespace-nowrap">
                        {item.domain}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6 text-muted-foreground/60 whitespace-nowrap">{item.date || "---"}</td>
                    <td className="py-3.5 pr-6 text-muted-foreground/60 whitespace-nowrap">{item.timeSlot || "---"}</td>
                    <td className="py-3.5 pr-6">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-widest whitespace-nowrap ${
                        item.status?.toUpperCase() === "COMPLETED" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                        item.status?.toUpperCase() === "PENDING" ? "text-amber-400 bg-amber-500/10 border-amber-500/20" :
                        "text-muted-foreground/60 bg-white/5 border-white/10"
                      }`}>
                        {item.status || "---"}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6 text-muted-foreground/80 font-bold whitespace-nowrap">{item.panel || "---"}</td>
                    <td className="py-3.5 pr-6 font-bold whitespace-nowrap">{item.rating || "---"}/5</td>
                    <td className="py-3.5 pr-6 text-muted-foreground/60 whitespace-nowrap">{item.evaluator || "---"}</td>
                    <td className="py-3.5 pr-4 text-right font-bold text-muted-foreground/80 whitespace-nowrap">{item.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-sm text-muted-foreground/40 font-medium">No selection records match the current filters.</p>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirmDelete}
        title="Delete Selected Club Selections"
        message={`Are you sure you want to move the selected ${selectedIds.length} records to the Deleted Folder?`}
        onConfirm={handleDeleteSelections}
        onCancel={() => setShowConfirmDelete(false)}
        isLoading={isDeleting}
        confirmText="Move to Deleted Folder"
      />
    </div>
  );
}
