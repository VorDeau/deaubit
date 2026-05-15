//app/register/page.tsx

import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="db-card w-full max-w-md mx-auto p-8 sm:p-10 shadow-2xl animate-reveal border-(--db-border)">
      <RegisterForm />
    </div>
  );
}
