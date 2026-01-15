import { verifyPortfolioService } from '@/app/actions/verify_service';

export default async function TestServicePage() {
  const logs = await verifyPortfolioService();

  return (
    <div className="p-10 bg-black text-white min-h-screen font-mono">
      <h1 className="text-2xl font-bold mb-4">Portfolio Service Verification</h1>
      <div className="bg-neutral-900 p-4 rounded border border-white/20">
        {logs.map((log, i) => (
          <div key={i} className="mb-1 border-b border-white/5 pb-1">
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
