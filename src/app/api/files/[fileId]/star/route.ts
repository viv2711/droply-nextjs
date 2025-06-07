import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    req: NextRequest,
    props: { params: Promise<{ fileId: string }> }
) {
    const { userId } = await auth()

    try {
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const { fileId } = await props.params;
        if (!fileId) {
            return NextResponse.json({ error: "File id is required" }, { status: 401 })
        }
        const [file] = await db.select()
            .from(files)
            .where(
                and(
                    eq(files.id, fileId),
                    eq(files.userId, userId),
                )
            )
        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 401 })
        }

       const [updatedFile] = await db
        .update(files)
        .set({ isStarred: !file.isStarred })
        .where(
            and(
                eq(files.id, fileId),
                eq(files.userId, userId)
            )
        ).returning()

        return NextResponse.json(updatedFile)

    } catch (error) {
         return NextResponse.json({ error: "Failed to update the field" }, { status: 500 })
    }


}