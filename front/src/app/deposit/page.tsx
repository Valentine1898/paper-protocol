import DepositForm from '@/components/DepositForm';

export default function DepositPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Deposit
            </h1>
            <p className="text-gray-600">
              Deposit tokens with target price conditions
            </p>
          </div>
          
          <DepositForm />
        </div>
      </div>
    </main>
  );
} 