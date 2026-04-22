import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";

export default function StudentAttendanceScan() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [message, setMessage] = useState("");
  const [scannedData, setScannedData] = useState(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [isCollectingInfo, setIsCollectingInfo] = useState(false);
  const [regNo, setRegNo] = useState(user?.regNo || "");
  const [studentName, setStudentName] = useState(user?.name || "");
  const [submitting, setSubmitting] = useState(false);

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
      }
    }
  }, []);

  const handleScan = (result) => {
    try {
      const rawValue = result?.[0]?.rawValue;
      if (!rawValue || hasScanned) return;

      const parsed = JSON.parse(rawValue);
      setScannedData(parsed);
      setHasScanned(true);
      setIsCollectingInfo(true);
    } catch (error) {
      setMessage("Invalid QR code.");
      setHasScanned(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      await api.post('/attendance/scan', {
        ...scannedData,
        regNo,
        studentName
      });
      setMessage("Attendance marked successfully!");
      setIsCollectingInfo(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to mark attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleScanAgain = () => {
    setMessage("");
    setScannedData(null);
    setHasScanned(false);
    setIsCollectingInfo(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Scan Attendance QR</h2>
          <p className="text-sm text-slate-400 mt-1">
            Scan the QR code shown by your lecturer to mark attendance.
          </p>
        </div>

        <Button variant="outline" onClick={() => navigate("/attendance")}>
          Back
        </Button>
      </div>

      <Card glass>
        <div className="space-y-4">
          {!hasScanned && (
            <div className="overflow-hidden rounded-2xl border border-white/20">
              <Scanner
                onScan={handleScan}
                onError={(error) => console.error(error)}
                formats={["qr_code"]}
              />
            </div>
          )}

          {message && (
            <div className={`rounded-xl border px-4 py-3 text-sm ${
              message.includes("successfully") 
              ? "border-green-500/30 bg-green-500/20 text-green-300"
              : "border-red-500/30 bg-red-500/20 text-red-300"
            }`}>
              {message}
            </div>
          )}

          {isCollectingInfo && (
            <div className="rounded-2xl border border-white/20 bg-white/5 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Confirm Your Details</h3>
              <p className="text-sm text-slate-400">
                Please enter your registration number and name to mark attendance for:
                <br />
                <span className="text-blue-300 font-medium">{scannedData?.courseCode} - {scannedData?.courseTitle}</span>
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registration No</label>
                  <input
                    type="text"
                    required
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="e.g. SE/2020/001"
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full mt-4">
                  {submitting ? "Submitting..." : "Submit Attendance"}
                </Button>
              </form>
            </div>
          )}

          {scannedData && !isCollectingInfo && (
            <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Session Scanned</h3>
              <div className="space-y-1 text-sm text-slate-300">
                <p><strong>Course:</strong> {scannedData.courseCode} - {scannedData.courseTitle}</p>
                <p><strong>Date:</strong> {scannedData.date}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" onClick={handleScanAgain}>Scan Again</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}