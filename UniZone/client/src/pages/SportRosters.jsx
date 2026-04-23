import { useEffect, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import Card from "../components/Card";
import Button from "../components/Button";
import Loading from "../components/Loading";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SportRosters() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSports = async () => {
    try {
      const res = await api.get("/sports");
      setSports(res.data);
    } catch (err) {
      console.error("Failed to fetch sports rosters", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSports();
  }, []);

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.text("UniZone Sports Participation Roster", 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

      let currentY = 40;

      sports.forEach((sport, index) => {
        // Add page if near bottom
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(`${index + 1}. ${sport.name} (${sport.players.length}/${sport.maxPlayers})`, 14, currentY);
        currentY += 5;

        const tableData = sport.players.map((p, i) => [
          i + 1,
          p.name || "N/A",
          p.email || "N/A",
          "Joined"
        ]);

        autoTable(doc, {
          startY: currentY + 2,
          head: [['#', 'Student Name', 'Email', 'Status']],
          body: tableData.length > 0 ? tableData : [['-', 'No players yet', '-', '-']],
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] }, // UniZone Blue
          margin: { left: 14 },
        });

        // Use the finalY from the table we just drew
        currentY = doc.lastAutoTable.finalY + 15;
      });

      doc.save("UniZone_Sports_Roster.pdf");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      alert("Failed to generate PDF. Please check the console for details.");
    }
  };

  return (
    <PageShell 
      title="Sport Participation" 
      subtitle="View and export student rosters for all registered campus sports"
      right={
        <Button 
          onClick={downloadPDF} 
          disabled={loading || sports.length === 0}
          className="bg-emerald-600 hover:bg-emerald-500 text-white !px-6"
        >
          Download PDF Report
        </Button>
      }
    >
      {loading ? (
        <Loading />
      ) : sports.length === 0 ? (
        <Card className="text-center p-20 bg-slate-900/50 border-white/5">
           <p className="text-slate-400 font-bold italic">No sports found in the registry.</p>
        </Card>
      ) : (
        <div className="space-y-8 pb-20">
          {sports.map(sport => (
            <Card key={sport._id} glass className="border-white/10 overflow-hidden">
              <div className="p-6 bg-white/5 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-white">{sport.name}</h2>
                  <p className="text-[10px] uppercase tracking-widest font-black text-slate-500 mt-1">
                    TEAM CAPACITY: {sport.players.length} / {sport.maxPlayers}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl">
                  {sport.players.length >= sport.maxPlayers ? "🔒" : "👥"}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-white">
                  <thead className="bg-white/5 border-b border-white/10 text-[10px] uppercase font-black tracking-widest text-slate-400">
                    <tr>
                      <th className="p-4 w-16 text-center">#</th>
                      <th className="p-4">Student Name</th>
                      <th className="p-4 text-right">Email Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {sport.players.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="p-10 text-center text-slate-500 italic uppercase text-xs font-bold">No students have joined this sport yet</td>
                      </tr>
                    ) : (
                      sport.players.map((p, i) => (
                        <tr key={p._id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-4 text-center text-slate-600 group-hover:text-blue-400 transition-colors">{i + 1}</td>
                          <td className="p-4 font-black">{p.name}</td>
                          <td className="p-4 text-right text-slate-400 font-bold ">{p.email}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
