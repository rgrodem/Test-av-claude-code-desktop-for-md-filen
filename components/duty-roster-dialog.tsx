'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const formSchema = z.object({
  date: z.string().min(1, 'Dato er påkrevd'),
  operatorName: z.string().min(1, 'Operatørnavn er påkrevd'),
  shift: z.enum(['DAY', 'EVENING', 'NIGHT']),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface DutyRosterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRoster?: any;
}

export function DutyRosterDialog({ open, onOpenChange, editingRoster }: DutyRosterDialogProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      operatorName: '',
      shift: 'DAY',
      notes: '',
    },
  });

  const shift = watch('shift');

  useEffect(() => {
    if (editingRoster) {
      setValue('date', new Date(editingRoster.date).toISOString().slice(0, 10));
      setValue('operatorName', editingRoster.operatorName);
      setValue('shift', editingRoster.shift);
      setValue('notes', editingRoster.notes || '');
    } else {
      reset({
        date: new Date().toISOString().slice(0, 10),
        operatorName: '',
        shift: 'DAY',
        notes: '',
      });
    }
  }, [editingRoster, setValue, reset, open]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const body = {
        ...data,
        date: new Date(data.date).toISOString(),
        notes: data.notes || null,
      };

      const url = editingRoster ? `/api/duty-roster/${editingRoster.id}` : '/api/duty-roster';
      const method = editingRoster ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['duty-roster'] });
      onOpenChange(false);
      reset();
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingRoster ? 'Rediger vakt' : 'Legg til vakt'}
          </DialogTitle>
          <DialogDescription>
            Fyll inn informasjon om hvem som er på vakt
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="operatorName">Operatørnavn *</Label>
            <Input
              id="operatorName"
              {...register('operatorName')}
              placeholder="F.eks. Ola Nordmann"
            />
            {errors.operatorName && (
              <p className="text-sm text-destructive">{errors.operatorName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Dato *</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shift">Skift *</Label>
              <Select value={shift} onValueChange={(value: any) => setValue('shift', value)}>
                <SelectTrigger id="shift">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAY">Dag</SelectItem>
                  <SelectItem value="EVENING">Kveld</SelectItem>
                  <SelectItem value="NIGHT">Natt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Merknader (valgfritt)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Eventuelle merknader..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Lagrer...' : editingRoster ? 'Oppdater' : 'Legg til'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
