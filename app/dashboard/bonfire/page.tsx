import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, MapPin, Clock, Users } from 'lucide-react';

export default function BonfirePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bålmeldinger</h1>
        <p className="text-muted-foreground">
          Interaktivt kart over registrerte bålmeldinger i regionen
        </p>
      </div>

      <Card className="border-2 border-dashed border-yellow-300 bg-yellow-50/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Flame className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">Kommer snart!</CardTitle>
              <CardDescription className="text-base">
                Bålmeldingssystemet er under utvikling
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Denne funksjonen vil gi deg mulighet til raskt å verifisere om røykmeldinger fra publikum
            er fra registrerte bål i området.
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Interaktivt kart</h3>
                <p className="text-sm text-muted-foreground">
                  Google Maps-integrasjon med alle registrerte bål
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Sanntidsoppdateringer</h3>
                <p className="text-sm text-muted-foreground">
                  Nye bålmeldinger vises umiddelbart på kartet
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-lg">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold">Offentlig registrering</h3>
                <p className="text-sm text-muted-foreground">
                  Innbyggere kan selv registrere planlagte bål
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Planlagte funksjoner:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Geografisk søk og filtrering basert på kommune</li>
              <li>Automatisk utløp av gamle bålmeldinger</li>
              <li>Kontaktinformasjon til person som registrerte bålet</li>
              <li>Adressevalidering med Google Maps API</li>
              <li>Eksport av data til CSV/PDF for rapportering</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Status:</strong> Systemet er teknisk klart for å implementere denne funksjonen.
              Database-modeller og API-struktur er på plass. Implementering starter når Google Maps API
              er konfigurert og testet.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
