export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">Invoice App</h1>
          <p className="text-slate-600 mt-2">Manage your invoices efficiently</p>
        </div>
        {children}
      </div>
    </div>
  );
}