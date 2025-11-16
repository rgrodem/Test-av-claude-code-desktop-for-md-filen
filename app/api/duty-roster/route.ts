import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { z } from 'zod';
import { startOfWeek, endOfWeek, parseISO } from 'date-fns';

const dutyRosterSchema = z.object({
  date: z.string().datetime(),
  operatorName: z.string().min(1, 'Operatørnavn er påkrevd'),
  shift: z.enum(['DAY', 'NIGHT', 'EVENING']),
  notes: z.string().optional().nullable(),
});

// GET - List duty roster
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const weekStart = searchParams.get('weekStart');

    let where: any = {};

    if (weekStart) {
      const startDate = parseISO(weekStart);
      const weekStartDate = startOfWeek(startDate, { weekStartsOn: 1 }); // Monday
      const weekEndDate = endOfWeek(startDate, { weekStartsOn: 1 });

      where.date = {
        gte: weekStartDate,
        lte: weekEndDate,
      };
    }

    const dutyRosters = await prisma.dutyRoster.findMany({
      where,
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { date: 'asc' },
        { shift: 'asc' },
      ],
    });

    return NextResponse.json(dutyRosters);
  } catch (error) {
    console.error('Error fetching duty roster:', error);
    return NextResponse.json(
      { error: 'Failed to fetch duty roster' },
      { status: 500 }
    );
  }
}

// POST - Create new duty roster entry
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = dutyRosterSchema.parse(json);

    const dutyRoster = await prisma.dutyRoster.create({
      data: {
        date: new Date(validatedData.date),
        operatorName: validatedData.operatorName,
        shift: validatedData.shift,
        notes: validatedData.notes || null,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Create audit log
    await createAuditLog(
      session.user.id,
      'CREATE',
      'DUTY_ROSTER',
      dutyRoster.id,
      { operatorName: dutyRoster.operatorName, shift: dutyRoster.shift, date: dutyRoster.date }
    );

    return NextResponse.json(dutyRoster, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating duty roster:', error);
    return NextResponse.json(
      { error: 'Failed to create duty roster entry' },
      { status: 500 }
    );
  }
}
