import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "not authed" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        currentPlan: true,
        meetingsThisMonth: true,
        chatMessagesToday: true,
      },
    });

    // If user doesn't exist, create them
    if (!user) {
      const newUser = await prisma.user.create({
        data: {
          id: userId,
          clerkId: userId,
          currentPlan: "premium", // Set new users to premium plan for unlimited access
        },
        select: {
          currentPlan: true,
          meetingsThisMonth: true,
          chatMessagesToday: true,
        },
      });
      return NextResponse.json(newUser);
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "failed to fetch usaged" },
      { status: 500 }
    );
  }
}
