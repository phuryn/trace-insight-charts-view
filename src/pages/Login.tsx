
import LoginForm from '@/components/LoginForm';
import { ClipboardCheck } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ClipboardCheck className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-semibold">LLM Trace Evaluator</h1>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-6">
        <LoginForm />
      </div>
      <footer className="bg-white py-4 px-6 text-center text-gray-500 text-sm border-t">
        <p>&copy; {new Date().getFullYear()} LLM Trace Evaluator</p>
      </footer>
    </div>
  );
};

export default Login;
