import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { z } from 'zod';

const dailyInfoUpdateSchema = z.object({
  title: z.string().min(1, 'Tittel er påkrevd').optional(),
  description: z.string().min(1, 'Beskrivelse er påkrevd').optional(),
  category: z.enum(['ROAD_CLOSURE', 'SMOKE_TEST', 'GAS_FLARING', 'OTHER']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional().nullable(),
});

// GET - Get single daily info
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dailyInfo = await prisma.dailyInfo.findUnique({
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

    if (!dailyInfo) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(dailyInfo);
  } catch (error) {
    console.error('Error fetching daily info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily info' },
      { status: 500 }
    );
  }
}

// PUT - Update daily info
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
    const validatedData = dailyInfoUpdateSchema.parse(json);

    // Get old data for audit log
    const oldData = await prisma.dailyInfo.findUnique({
      where: { id: params.id },
    });

    if (!oldData) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updateData: any = { ...validatedData };
    if (validatedData.validFrom) {
      updateData.validFrom = new Date(validatedData.validFrom);
    }
    if (validatedData.validUntil !== undefined) {
      updateData.validUntil = validatedData.validUntil ? new Date(validatedData.validUntil) : null;
    }

    const dailyInfo = await prisma.dailyInfo.update({
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
      'DAILY_INFO',
      dailyInfo.id,
      { old: oldData, new: dailyInfo }
    );

    return NextResponse.json(dailyInfo);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating daily info:', error);
    return NextResponse.json(
      { error: 'Failed to update daily info' },
      { status: 500 }
    );
  }
}

// DELETE - Delete daily info
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
    const dailyInfo = await prisma.dailyInfo.findUnique({
      where: { id: params.id },
    });

    if (!dailyInfo) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.dailyInfo.delete({
      where: { id: params.id },
    });

    // Create audit log
    await createAuditLog(
      session.user.id,
      'DELETE',
      'DAILY_INFO',
      params.id,
      { title: dailyInfo.title, category: dailyInfo.category }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting daily info:', error);
    return NextResponse.json(
      { error: 'Failed to delete daily info' },
      { status: 500 }
    );
  }
}
