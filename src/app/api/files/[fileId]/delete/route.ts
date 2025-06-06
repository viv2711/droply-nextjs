import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
});

if(!imagekit){
    throw new Error("Not able to initialize the imagekit")
}

export async function DELETE(
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
       await imagekit.deleteFile(fileId)
       const [updatedFile] = await db
        .delete(files)
        .where(
            and(
                eq(files.id, fileId),
                eq(files.userId, userId)
            )
        ).returning()

        return NextResponse.json({message: "File deleted successfully"}, {status: 200})

    } catch (error) {
         return NextResponse.json({ error: "Failed to update the field" }, { status: 500 })
    }


}