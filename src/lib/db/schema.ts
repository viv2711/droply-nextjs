import { relations } from "drizzle-orm"
import {integer, pgTable, text, uuid, boolean, timestamp} from "drizzle-orm/pg-core"

export const files = pgTable("files", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    path: text("path").notNull(),
    size: integer("size").notNull(),
    type: text("type").notNull(), // mime type - whether it is a folder or a file
    
    //storage information
    fileUrl: text("file_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),

    //Ownership
    userId: text("user_id").notNull(),
    parentId: uuid("parent_id"), 

    // file folder flags
    isFolder: boolean("is_folder").default(false).notNull(),
    isStarred: boolean("is_starred").default(false).notNull(),
    isTrash: boolean("is_trash").default(false).notNull(),

    //Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated-at").defaultNow().notNull()
})

/*
    parent: Each file/folder can have one parent folder
    children: Each folder can have manch child file/folder
 */

export const fileRelations = relations(files, ({one, many}) => ({
    parent: one(files, {
        fields: [files.parentId],
        references: [files.id]
    }),

    //relationships to child files/folder
    children: many(files)
}))

// Type definition
export const File = typeof files.$inferSelect;
export const NewFile = typeof files.$inferInsert;