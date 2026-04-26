import React, { useMemo } from "react";
import { ContentCard } from "./ContentCard";
import { Content } from "../types/content";
import { AnimatePresence, motion, spring } from "framer-motion";

interface ContentGridProps {
    content: Content[];
    onContentClick?: (content: Content) => void;
    onStatusChange?: (id: number) => void;
    onRemoveContent?: (id: number) => void;
}

export const ContentGrid = React.memo(function ContentGrid({ content, onContentClick, onStatusChange, onRemoveContent }: ContentGridProps) {

    const { watchedContents, startedContents, toWatchContents } = useMemo(() => {

        console.log('CONTENT GRID')

        if (content && content.length > 0) {
            return {
                watchedContents: content.filter(c => c.watched === true && !c.logged).sort((a, b) => a.watchDate - b.watchDate),
                startedContents: content.filter(c => c.started === true && c.watched === false).sort((a, b) => a.startedDate - b.startedDate),
                toWatchContents: content.filter(c => c.watched === false && c.started === false).sort((a, b) => a.addedDate - b.addedDate)
            }
        } else {
            return {
                watchedContents: [],
                startedContents: [],
                toWatchContents: []
            }
        }
    }, [content])

    return (
        <div className="flex flex-col gap-5">
            <AnimatePresence mode="popLayout">
                {watchedContents.length > 0 && (
                    <div key="watched" className="flex flex-col gap-2">
                        <motion.h1 className="text-2xl font-bold" id="section-0">Watched</motion.h1>
                        <ul className="grid gap-3 md:gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                            {watchedContents.map(content => (
                                <motion.li
                                    key={content.id}
                                    layout
                                    layoutId={`content-${content.id}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        layout: { type: "spring", stiffness: 250, damping: 30 },
                                        opacity: { duration: 0.2 }
                                    }}
                                >
                                    <ContentCard content={content} onClick={onContentClick} onStatusChange={onStatusChange} onRemoveContent={onRemoveContent} />
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                )}
                {startedContents.length > 0 && (
                    <div key="started" className="flex flex-col gap-2">
                        <motion.h1 className="text-2xl font-bold" id="section-1">Started</motion.h1>
                        <ul className="grid gap-3 md:gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                            {startedContents.map(content => (
                                <motion.li
                                    key={content.id}
                                    layout
                                    layoutId={`content-${content.id}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        layout: { type: "spring", stiffness: 250, damping: 30 },
                                        opacity: { duration: 0.2 }
                                    }}
                                >
                                    <ContentCard content={content} onClick={onContentClick} onStatusChange={onStatusChange} onRemoveContent={onRemoveContent} />
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                )}
                {toWatchContents.length > 0 && (
                    <div key="towatch" className="flex flex-col gap-2">
                        <motion.h1 className="text-2xl font-bold" id="section-2">To Watch</motion.h1>
                        <ul className="grid gap-3 md:gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                            {toWatchContents.map(content => (
                                <motion.li
                                    key={content.id}
                                    layout
                                    layoutId={`content-${content.id}`}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        layout: { type: "spring", stiffness: 250, damping: 30 },
                                        opacity: { duration: 0.2 }
                                    }}
                                >
                                    <ContentCard content={content} onClick={onContentClick} onStatusChange={onStatusChange} onRemoveContent={onRemoveContent} />
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
});