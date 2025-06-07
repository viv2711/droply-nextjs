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

if (!imagekit) {
    throw new Error("Not able to initialize the imagekit")
}

export async function DELETE() {
    const { userId } = await auth()

    try {
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const fileArray = await db.select({ id: files.id })
            .from(files)
            .where(
                and(
                    eq(files.isTrash, true),
                    eq(files.userId, userId)
                )
            )

        if (!fileArray) {
            return NextResponse.json({ error: "File not found" }, { status: 401 })
        }
        const filesId = fileArray.map((file) => file.id)
        const imagekitDeleteResponse = await imagekit.bulkDeleteFiles(filesId)
        console.log(imagekitDeleteResponse + "image deleted successfully")
        const response = await db
            .delete(files)
            .where(
                and(
                    eq(files.isTrash, true),
                    eq(files.userId, userId)
                )
            )
        return NextResponse.json({ response }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ error: "Failed to update the field" + error}, { status: 500 })
    }


}