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
  title: z.string().min(1, 'Tittel er påkrevd'),
  description: z.string().min(1, 'Beskrivelse er påkrevd'),
  category: z.enum(['ROAD_CLOSURE', 'SMOKE_TEST', 'GAS_FLARING', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  validFrom: z.string().min(1, 'Gyldig fra er påkrevd'),
  validUntil: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface DailyInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingInfo?: any;
}

export function DailyInfoDialog({ open, onOpenChange, editingInfo }: DailyInfoDialogProps) {
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
      title: '',
      description: '',
      category: 'OTHER',
      priority: 'MEDIUM',
      validFrom: new Date().toISOString().slice(0, 16),
      validUntil: '',
    },
  });

  const category = watch('category');
  const priority = watch('priority');

  useEffect(() => {
    if (editingInfo) {
      setValue('title', editingInfo.title);
      setValue('description', editingInfo.description);
      setValue('category', editingInfo.category);
      setValue('priority', editingInfo.priority);
      setValue('validFrom', new Date(editingInfo.validFrom).toISOString().slice(0, 16));
      setValue('validUntil', editingInfo.validUntil ? new Date(editingInfo.validUntil).toISOString().slice(0, 16) : '');
    } else {
      reset({
        title: '',
        description: '',
        category: 'OTHER',
        priority: 'MEDIUM',
        validFrom: new Date().toISOString().slice(0, 16),
        validUntil: '',
      });
    }
  }, [editingInfo, setValue, reset, open]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const body = {
        ...data,
        validFrom: new Date(data.validFrom).toISOString(),
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : null,
      };

      const url = editingInfo ? `/api/daily-info/${editingInfo.id}` : '/api/daily-info';
      const method = editingInfo ? 'PUT' : 'POST';

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
      queryClient.invalidateQueries({ queryKey: ['daily-info'] });
      onOpenChange(false);
      reset();
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingInfo ? 'Rediger informasjon' : 'Ny daglig informasjon'}
          </DialogTitle>
          <DialogDescription>
            Fyll ut informasjonen som skal vises for operatørene
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tittel *</Label>
            <Input id="title" {...register('title')} placeholder="F.eks. E39 stengt" />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beskrivelse *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Detaljert beskrivelse av situasjonen..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select value={category} onValueChange={(value: any) => setValue('category', value)}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROAD_CLOSURE">Veisperring</SelectItem>
                  <SelectItem value="SMOKE_TEST">Røyktesting</SelectItem>
                  <SelectItem value="GAS_FLARING">Gass-fakkling</SelectItem>
                  <SelectItem value="OTHER">Annet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioritet *</Label>
              <Select value={priority} onValueChange={(value: any) => setValue('priority', value)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Lav</SelectItem>
                  <SelectItem value="MEDIUM">Middels</SelectItem>
                  <SelectItem value="HIGH">Høy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Gyldig fra *</Label>
              <Input
                id="validFrom"
                type="datetime-local"
                {...register('validFrom')}
              />
              {errors.validFrom && (
                <p className="text-sm text-destructive">{errors.validFrom.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Gyldig til (valgfritt)</Label>
              <Input
                id="validUntil"
                type="datetime-local"
                {...register('validUntil')}
              />
            </div>
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
              {mutation.isPending ? 'Lagrer...' : editingInfo ? 'Oppdater' : 'Opprett'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
