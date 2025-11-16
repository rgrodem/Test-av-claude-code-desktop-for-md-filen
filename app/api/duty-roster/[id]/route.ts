import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { z } from 'zod';

const dutyRosterUpdateSchema = z.object({
  date: z.string().datetime().optional(),
  operatorName: z.string().min(1, 'Operatørnavn er påkrevd').optional(),
  shift: z.enum(['DAY', 'NIGHT', 'EVENING']).optional(),
  notes: z.string().optional().nullable(),
});

// GET - Get single duty roster entry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dutyRoster = await prisma.dutyRoster.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!dutyRoster) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(dutyRoster);
  } catch (error) {
    console.error('Error fetching duty roster:', error);
    return NextResponse.json(
      { error: 'Failed to fetch duty roster entry' },
      { status: 500 }
    );
  }
}

// PUT - Update duty roster entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = dutyRosterUpdateSchema.parse(json);

    // Get old data for audit log
    const oldData = await prisma.dutyRoster.findUnique({
      where: { id: params.id },
    });

    if (!oldData) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updateData: any = { ...validatedData };
    if (validatedData.date) {
      updateData.date = new Date(validatedData.date);
    }

    const dutyRoster = await prisma.dutyRoster.update({
      where: { id: params.id },
      data: updateData,
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
      'UPDATE',
      'DUTY_ROSTER',
      dutyRoster.id,
      { old: oldData, new: dutyRoster }
    );

    return NextResponse.json(dutyRoster);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating duty roster:', error);
    return NextResponse.json(
      { error: 'Failed to update duty roster entry' },
      { status: 500 }
    );
  }
}

// DELETE - Delete duty roster entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get data for audit log
    const dutyRoster = await prisma.dutyRoster.findUnique({
      where: { id: params.id },
    });

    if (!dutyRoster) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.dutyRoster.delete({
      where: { id: params.id },
    });

    // Create audit log
    await createAuditLog(
      session.user.id,
      'DELETE',
      'DUTY_ROSTER',
      params.id,
      { operatorName: dutyRoster.operatorName, shift: dutyRoster.shift }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting duty roster:', error);
    return NextResponse.json(
      { error: 'Failed to delete duty roster entry' },
      { status: 500 }
    );
  }
}
