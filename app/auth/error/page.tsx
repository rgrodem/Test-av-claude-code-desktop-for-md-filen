'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'Det er et problem med serverkonfigurasjonen.';
      case 'AccessDenied':
        return 'Du har ikke tilgang til dette systemet. Kontakt administratoren hvis du mener dette er en feil.';
      case 'Verification':
        return 'Verifiseringen feilet. Vennligst prøv igjen.';
      default:
        return 'En ukjent feil oppstod under innlogging.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Innlogging feilet</CardTitle>
          <CardDescription className="text-base">
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Kun autoriserte e-postadresser fra Rogaland Brann og Redning har tilgang.
          </p>
          <Button asChild className="w-full" size="lg">
            <Link href="/auth/signin">Prøv igjen</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
