import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { files } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import ImageKit from "imagekit"
import { v4 as uuidv4 } from "uuid"
import { NextRequest, NextResponse } from "next/server";


var imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
});

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const formData = await req.formData()
        const file = formData.get("files") as File
        const formUserId = formData.get("userId") as string
        const parentId = formData.get("parentId") as string || null

        if (formUserId !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 401 })
        }
        if (parentId) {
            const [parentFolder] = await db
                .select()
                .from(files)
                .where(
                    and(
                        eq(files.id, parentId),
                        eq(files.userId, userId),
                        eq(files.isFolder, true)
                    )
                )
        }
        else{
            return NextResponse.json({error: "Parent folder not found"}, {status: 401})
        }

        if(!file.type.startsWith("image/") && file.type !== "application/pdf"){
                return NextResponse.json({error: "Only image and pdf are supported"}, {status: 401})
        }

        const buffer = await file.arrayBuffer()
        const fileBuffer = Buffer.from(buffer)

        const folderPath = parentId ? `/droply/${userId}/folder/${parentId}` : `/droply/${userId}`
        const fileExtension = file.name.split(".").pop() || ""

        if(!fileExtension){
            return NextResponse.json({error: "No file extension found"}, {status: 401})
        }
        const uniqueFileName = `${uuidv4}.${fileExtension}`
        const uploadResponse = await imagekit.upload({
            file: fileBuffer,
            fileName: uniqueFileName,
            folder: folderPath,
            useUniqueFileName: false
        })
        const fileData = {
            name: file.name,
            path: uploadResponse.filePath,
            size: file.size,
            type: file.type,
            fileUrl: uploadResponse.url,
            thumbnailUrl: uploadResponse.thumbnailUrl || null,
            userId,
            parentId,
            isFolder: false,
            isStarred: false,
            isTrash: false
        }

        const [newFile] = await db.insert(files).values(fileData).returning()
        return NextResponse.json(newFile)
    } catch (error) {
        return NextResponse.json({error: "Failed to upload file"}, {status: 500})
    }
}