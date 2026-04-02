import { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import Card from "../../components/Card";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";

export default function StudentAttendanceScan() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [scannedData, setScannedData] = useState(null);
  const [hasScanned, setHasScanned] = useState(false);

  const handleScan = (result) => {
    try {
      const rawValue = result?.[0]?.rawValue;
      if (!rawValue || hasScanned) return;

      const parsed = JSON.parse(rawValue);
      setScannedData(parsed);
      setMessage("QR scanned successfully. Backend can be connected later.");
      setHasScanned(true);
    } catch (error) {
      setMessage("Invalid QR code.");
      setHasScanned(true);
    }
  };

  const handleScanAgain = () => {
    setMessage("");
    setScannedData(null);
    setHasScanned(false);
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
          <div className="overflow-hidden rounded-2xl border border-white/20">
            <Scanner
              onScan={handleScan}
              onError={(error) => console.error(error)}
              formats={["qr_code"]}
            />
          </div>

          {message && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/20 px-4 py-3 text-sm text-blue-300">
              {message}
            </div>
          )}

          {scannedData && (
            <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Scanned QR Data</h3>
              <div className="space-y-1 text-sm text-slate-300">
                <p><strong>Session ID:</strong> {scannedData.sessionId}</p>
                <p><strong>Course Code:</strong> {scannedData.courseCode}</p>
                <p><strong>Course Title:</strong> {scannedData.courseTitle}</p>
                <p><strong>Date:</strong> {scannedData.date}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={handleScanAgain}>Scan Again</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}