import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/audit';
import { z } from 'zod';

const dailyInfoSchema = z.object({
  title: z.string().min(1, 'Tittel er påkrevd'),
  description: z.string().min(1, 'Beskrivelse er påkrevd'),
  category: z.enum(['ROAD_CLOSURE', 'SMOKE_TEST', 'GAS_FLARING', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime().optional().nullable(),
});

// GET - List all daily info
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const active = searchParams.get('active');

    const now = new Date();

    const where: any = {};

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (active === 'true') {
      where.validFrom = { lte: now };
      where.OR = [
        { validUntil: null },
        { validUntil: { gte: now } }
      ];
    }

    const dailyInfos = await prisma.dailyInfo.findMany({
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
        { priority: 'desc' },
        { validFrom: 'desc' },
      ],
    });

    return NextResponse.json(dailyInfos);
  } catch (error) {
    console.error('Error fetching daily info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily info' },
      { status: 500 }
    );
  }
}

// POST - Create new daily info
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await request.json();
    const validatedData = dailyInfoSchema.parse(json);

    const dailyInfo = await prisma.dailyInfo.create({
      data: {
        ...validatedData,
        validFrom: new Date(validatedData.validFrom),
        validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : null,
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
      'DAILY_INFO',
      dailyInfo.id,
      { title: dailyInfo.title, category: dailyInfo.category }
    );

    return NextResponse.json(dailyInfo, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating daily info:', error);
    return NextResponse.json(
      { error: 'Failed to create daily info' },
      { status: 500 }
    );
  }
}
