import { auth } from "@clerk/nextjs/server";
import {files} from "@/lib/db/schema"
import { db } from "@/lib/db";
import {eq, and} from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server";
import {v4 as uuidv4} from "uuid"

export async function POST(req: NextRequest){
    try {
        const {userId} = await auth()
        if(!userId){
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }
        const body = await req.json()
        const {name, userId: bodyUserId, parentId = null} = body; 

        if(bodyUserId !== userId){
            return NextResponse.json({error: "Unauthorized"}, {status: 401})
        }
        if(!name || typeof name !== "string" || name.trim() === ""){
            return NextResponse.json({error: "Folder name is required"}, {status: 400})
        }
        if(parentId){
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
            if(!parentFolder){
                return NextResponse.json({error: "Parent Folder not found"}, {status: 401})
            }
        }

        //creating a folder in db
        const folderData = {
            id: uuidv4(),
            name: name.trim(),
            path: `/folders/${userId}/${uuidv4}`,
            size: 0,
            type: "folder",
            fileUrl: "",
            thumbnailUrl: null,
            userId,
            parentId,
            isFolder: true,
            isStarred: false,
            isTrash: false
        }

        const [newFolder] = await db.insert(files).values(folderData).returning();
        return NextResponse.json({
            success: true,
            message: "Folder created successfully",
            folder: newFolder
        })
    } catch (error) {
        return NextResponse.json({error: "Error while creating folder" + error})
    }
}