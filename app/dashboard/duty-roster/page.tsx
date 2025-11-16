'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { DutyRosterDialog } from '@/components/duty-roster-dialog';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval } from 'date-fns';
import { nb } from 'date-fns/locale';

interface DutyRoster {
  id: string;
  date: string;
  operatorName: string;
  shift: string;
  notes: string | null;
  createdBy: {
    name: string | null;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const shiftLabels: Record<string, string> = {
  DAY: 'Dag',
  EVENING: 'Kveld',
  NIGHT: 'Natt',
};

const shiftOrder = ['DAY', 'EVENING', 'NIGHT'];

export default function DutyRosterPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoster, setEditingRoster] = useState<DutyRoster | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const queryClient = useQueryClient();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const { data: dutyRosters, isLoading } = useQuery<DutyRoster[]>({
    queryKey: ['duty-roster', weekStart.toISOString()],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('weekStart', weekStart.toISOString());

      const res = await fetch(`/api/duty-roster?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/duty-roster/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duty-roster'] });
    },
  });

  const handleEdit = (roster: DutyRoster) => {
    setEditingRoster(roster);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Er du sikker på at du vil slette denne vaktoppføringen?')) {
      deleteMutation.mutate(id);
    }
  };

  const getRosterForDayAndShift = (date: Date, shift: string) => {
    if (!dutyRosters) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    return dutyRosters.find((r) => {
      const rosterDate = format(new Date(r.date), 'yyyy-MM-dd');
      return rosterDate === dateStr && r.shift === shift;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vaktliste</h1>
          <p className="text-muted-foreground">
            Oversikt over hvem som er på vakt denne uken
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingRoster(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Legg til vakt
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Forrige uke
        </Button>
        <h2 className="text-lg font-semibold">
          Uke {format(weekStart, 'w, yyyy', { locale: nb })} ({format(weekStart, 'd. MMM', { locale: nb })} - {format(weekEnd, 'd. MMM', { locale: nb })})
        </h2>
        <Button
          variant="outline"
          onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
        >
          Neste uke
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Laster...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {daysInWeek.map((day) => (
            <Card key={day.toISOString()}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(day, 'EEEE d. MMMM', { locale: nb })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {shiftOrder.map((shift) => {
                    const roster = getRosterForDayAndShift(day, shift);
                    return (
                      <div
                        key={shift}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium min-w-[80px]">
                              {shiftLabels[shift]}:
                            </span>
                            {roster ? (
                              <div className="flex-1">
                                <p className="font-semibold">{roster.operatorName}</p>
                                {roster.notes && (
                                  <p className="text-sm text-muted-foreground">{roster.notes}</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-muted-foreground italic">Ingen vakt registrert</p>
                            )}
                          </div>
                        </div>
                        {roster && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(roster)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(roster.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DutyRosterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingRoster={editingRoster}
      />
    </div>
  );
}
