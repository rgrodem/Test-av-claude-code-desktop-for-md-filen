'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { DailyInfoDialog } from '@/components/daily-info-dialog';
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DailyInfo {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  validFrom: string;
  validUntil: string | null;
  createdBy: {
    name: string | null;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const categoryLabels: Record<string, string> = {
  ROAD_CLOSURE: 'Veisperring',
  SMOKE_TEST: 'Røyktesting',
  GAS_FLARING: 'Gass-fakkling',
  OTHER: 'Annet',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Lav',
  MEDIUM: 'Middels',
  HIGH: 'Høy',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
};

export default function DailyInfoPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState<DailyInfo | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState('true');
  const queryClient = useQueryClient();

  const { data: dailyInfos, isLoading } = useQuery<DailyInfo[]>({
    queryKey: ['daily-info', categoryFilter, activeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      params.append('active', activeFilter);

      const res = await fetch(`/api/daily-info?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/daily-info/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-info'] });
    },
  });

  const handleEdit = (info: DailyInfo) => {
    setEditingInfo(info);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Er du sikker på at du vil slette denne informasjonen?')) {
      deleteMutation.mutate(id);
    }
  };

  const isActive = (info: DailyInfo) => {
    const now = new Date();
    const validFrom = new Date(info.validFrom);
    const validUntil = info.validUntil ? new Date(info.validUntil) : null;

    return validFrom <= now && (!validUntil || validUntil >= now);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daglig Informasjon</h1>
          <p className="text-muted-foreground">
            Håndter viktig daglig informasjon for 110-sentralen
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingInfo(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Ny informasjon
        </Button>
      </div>

      <div className="flex gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="Velg kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Alle kategorier</SelectItem>
            <SelectItem value="ROAD_CLOSURE">Veisperring</SelectItem>
            <SelectItem value="SMOKE_TEST">Røyktesting</SelectItem>
            <SelectItem value="GAS_FLARING">Gass-fakkling</SelectItem>
            <SelectItem value="OTHER">Annet</SelectItem>
          </SelectContent>
        </Select>

        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="Velg status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Kun aktive</SelectItem>
            <SelectItem value="false">Alle</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Laster...</p>
        </div>
      ) : dailyInfos && dailyInfos.length > 0 ? (
        <div className="grid gap-4">
          {dailyInfos.map((info) => (
            <Card key={info.id} className={!isActive(info) ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{info.title}</CardTitle>
                      {isActive(info) && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Aktiv
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{categoryLabels[info.category]}</Badge>
                      <Badge className={priorityColors[info.priority]}>
                        {priorityLabels[info.priority]} prioritet
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(info)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(info.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{info.description}</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    <strong>Gyldig fra:</strong>{' '}
                    {format(new Date(info.validFrom), 'PPP HH:mm', { locale: nb })}
                  </p>
                  {info.validUntil && (
                    <p>
                      <strong>Gyldig til:</strong>{' '}
                      {format(new Date(info.validUntil), 'PPP HH:mm', { locale: nb })}
                    </p>
                  )}
                  <p>
                    <strong>Opprettet av:</strong> {info.createdBy.name || info.createdBy.email}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Ingen informasjon funnet</p>
            <p className="text-sm text-muted-foreground">
              Klikk på &quot;Ny informasjon&quot; for å legge til
            </p>
          </CardContent>
        </Card>
      )}

      <DailyInfoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingInfo={editingInfo}
      />
    </div>
  );
}
