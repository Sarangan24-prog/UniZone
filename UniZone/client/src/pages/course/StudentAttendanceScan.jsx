import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import Button from "../../components/Button";
import Card from "../../components/Card";

export default function StudentAttendanceScan() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  
  const [scannedData, setScannedData] = useState(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [isCollectingInfo, setIsCollectingInfo] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  
  const [regNo, setRegNo] = useState(user?.regNo || "");
  const [studentName, setStudentName] = useState(user?.name || "");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dataParam = params.get("sessionData");
    if (dataParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(dataParam));
        setScannedData(decoded);
        setHasScanned(true);
        setIsCollectingInfo(true);
      } catch (err) {
        console.error("Failed to parse session data from URL", err);
        setMessage("Invalid session link. Please try scanning the QR code again.");
        setIsError(true);
      }
    }
  }, []);

  const handleScan = (result) => {
    try {
      const rawValue = result?.[0]?.rawValue;
      if (!rawValue || hasScanned) return;

      // Handle both raw JSON and the full URL
      let data = rawValue;
      if (rawValue.startsWith('http')) {
        const url = new URL(rawValue);
        data = url.searchParams.get('sessionData');
        if (!data) throw new Error('No session data in URL');
        data = decodeURIComponent(data);
      }

      const parsed = JSON.parse(data);
      setScannedData(parsed);
      setHasScanned(true);
      setIsCollectingInfo(true);
      setMessage("");
      setIsError(false);
    } catch (error) {
      setMessage("Invalid QR code format.");
      setIsError(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setIsError(false);

    try {
      // Use the public endpoint that doesn't require authentication
      await api.post('/attendance/scan/public', {
        ...scannedData,
        regNo,
        studentName
      });
      
      setSuccess(true);
      setMessage("Attendance marked successfully!");
      setIsCollectingInfo(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to mark attendance. Please try again.");
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setScannedData(null);
    setHasScanned(false);
    setIsCollectingInfo(false);
    setMessage("");
    setIsError(false);
    setSuccess(false);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tight">
            Attendance <span className="text-blue-500">Check-in</span>
          </h1>
          <p className="text-slate-400 font-medium">
            {success ? "All set! You're marked present." : "Scan or confirm your details to mark attendance."}
          </p>
        </div>

        <Card glass className="border-white/10 shadow-2xl relative overflow-hidden">
          {/* Decorative background pulse */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>

          <div className="space-y-6 relative z-10">
            {/* Status Message */}
            {message && (
              <div className={`p-4 rounded-2xl border text-sm font-bold flex items-center gap-3 animate-in zoom-in duration-300 ${
                isError 
                ? "bg-red-500/10 border-red-500/20 text-red-400" 
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              }`}>
                <div className={`w-2 h-2 rounded-full ${isError ? "bg-red-500" : "bg-emerald-500"} animate-pulse`}></div>
                {message}
              </div>
            )}

            {/* Step 1: Scanner */}
            {!hasScanned && (
              <div className="space-y-4">
                <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-white/10 group">
                  <Scanner
                    onScan={handleScan}
                    onError={(error) => console.error(error)}
                    formats={["qr_code"]}
                  />
                  <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none"></div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-blue-500/50 rounded-2xl relative">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-500 -mt-1 -ml-1"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-500 -mt-1 -mr-1"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-500 -mb-1 -ml-1"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-500 -mb-1 -mr-1"></div>
                      <div className="w-full h-0.5 bg-blue-500/30 absolute top-1/2 -translate-y-1/2 animate-scan"></div>
                    </div>
                  </div>
                </div>
                <p className="text-center text-xs text-slate-500 font-bold uppercase tracking-widest">
                  Position QR code within frame
                </p>
              </div>
            )}

            {/* Step 2: Information Collection */}
            {isCollectingInfo && scannedData && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Session Identified</p>
                  <h3 className="text-xl font-bold text-white leading-tight">
                    {scannedData.courseCode}
                  </h3>
                  <p className="text-sm text-slate-400 font-medium">
                    {scannedData.courseTitle}
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                    <span>{scannedData.date}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                    <span>{scannedData.sessionId}</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Registration Index</label>
                    <input
                      type="text"
                      required
                      value={regNo}
                      onChange={(e) => setRegNo(e.target.value)}
                      placeholder="e.g. IT/2021/045"
                      className="w-full h-14 bg-slate-900/50 border border-white/10 rounded-2xl px-5 text-white font-bold placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Student Full Name</label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full h-14 bg-slate-900/50 border border-white/10 rounded-2xl px-5 text-white font-bold placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full h-14 !rounded-2xl text-lg font-black shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-transform"
                  >
                    {submitting ? "Processing..." : "Confirm Presence"}
                  </Button>
                </form>
              </div>
            )}

            {/* Step 3: Success View */}
            {success && (
              <div className="text-center py-8 space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-emerald-500 text-white rounded-[40px] flex items-center justify-center text-5xl shadow-2xl shadow-emerald-500/30 mx-auto transform rotate-12">
                  ✓
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white">Attendance Logged</h3>
                  <p className="text-slate-400 text-sm font-medium px-4">
                    Your attendance for <span className="text-white font-bold">{scannedData?.courseCode}</span> has been securely recorded in the system.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')} 
                  className="w-full h-12 !rounded-xl text-sm font-black border-white/10 hover:bg-white/5"
                >
                  Return to Dashboard
                </Button>
              </div>
            )}

            {(hasScanned && !submitting && !success) && (
              <button 
                onClick={handleReset}
                className="w-full text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
              >
                ← Scan a different code
              </button>
            )}
          </div>
        </Card>

        <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
          UniZone Authentication Service • Secure Check-In
        </p>
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { top: 10%; opacity: 0.2; }
          50% { top: 90%; opacity: 0.8; }
        }
        .animate-scan {
          animation: scan 2.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}