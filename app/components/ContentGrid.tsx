"use client";

import React, { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { motion } from "motion/react";
import { ContentCard } from "./ContentCard";
import { Content } from "../types/content";

export interface ContentGridHandle {
    scrollToSection: (section: number) => void;
}

interface ContentGridProps {
    content: Content[];
    onContentClick?: (content: Content) => void;
    onStatusChange?: (id: number) => void;
    onRemoveContent?: (id: number) => void;
    fromWatchlist?: boolean;
    focusedTitle: string;
    ownerPage: boolean;
}

interface VirtualContentSectionProps {
    title: string;
    sectionId: string;
    items: Content[];
    onContentClick?: (content: Content) => void;
    onStatusChange?: (id: number) => void;
    onRemoveContent?: (id: number) => void;
    fromWatchlist?: boolean;
    focusedTitle: string;
    ownerPage: boolean;
}

const MIN_COLUMN_WIDTH = 180;
const GRID_GAP_MOBILE = 12;
const GRID_GAP_DESKTOP = 20;
const ROW_ESTIMATE_HEIGHT = 400;
const SECTION_SCROLL_OFFSET = 100;

function getGridGap() {
    if (typeof window === "undefined") return GRID_GAP_MOBILE;
    return window.matchMedia("(min-width: 768px)").matches ? GRID_GAP_DESKTOP : GRID_GAP_MOBILE;
}

function getColumnCount(width: number, gap: number) {
    return Math.max(1, Math.floor((width + gap) / (MIN_COLUMN_WIDTH + gap)));
}

const VirtualContentSection = React.memo(
    forwardRef<HTMLDivElement, VirtualContentSectionProps>(function VirtualContentSection(
        {
            title,
            sectionId,
            items,
            onContentClick,
            onStatusChange,
            onRemoveContent,
            fromWatchlist,
            focusedTitle,
            ownerPage,
        },
        ref
    ) {
    const listRef = useRef<HTMLDivElement>(null);
    const [scrollMargin, setScrollMargin] = useState(0);
    const [columnCount, setColumnCount] = useState(1);
    const [gridGap, setGridGap] = useState(GRID_GAP_MOBILE);

    useLayoutEffect(() => {
        const updateLayout = () => {
            if (!listRef.current) return;

            const gap = getGridGap();
            setGridGap(gap);
            setScrollMargin(listRef.current.offsetTop);
            setColumnCount(getColumnCount(listRef.current.offsetWidth, gap));
        };

        updateLayout();

        const resizeObserver = new ResizeObserver(updateLayout);
        if (listRef.current) {
            resizeObserver.observe(listRef.current);
        }

        window.addEventListener("resize", updateLayout);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updateLayout);
        };
    }, [items.length]);

    const rowCount = Math.ceil(items.length / columnCount);

    const virtualizer = useWindowVirtualizer({
        count: rowCount,
        estimateSize: () => ROW_ESTIMATE_HEIGHT,
        overscan: 3,
        scrollMargin,
        gap: gridGap,
    });

    if (items.length === 0) {
        return (
            <div
                ref={ref}
                className="flex flex-col gap-2"
                data-section={sectionId}
            >
                {/* <motion.h1 className="text-2xl font-bold" id={sectionId}>
                    {title}
                </motion.h1> */}
            </div>
        );
    }

    return (
        <div
            ref={ref}
            className="flex flex-col gap-2"
            data-section={sectionId}
        >
            <motion.h1 className="text-2xl font-bold" id={sectionId}>
                {title}
            </motion.h1>

            <div ref={listRef} className="w-full">
                <div
                    style={{
                        height: `${virtualizer.getTotalSize()}px`,
                        width: "100%",
                        position: "relative",
                    }}
                >
                    {virtualizer.getVirtualItems().map((virtualRow) => {
                        const rowItems = items.slice(
                            virtualRow.index * columnCount,
                            virtualRow.index * columnCount + columnCount
                        );

                        return (
                            <div
                                key={virtualRow.key}
                                data-index={virtualRow.index}
                                ref={virtualizer.measureElement}
                                className="absolute left-0 top-0 grid w-full gap-3 md:gap-5"
                                style={{
                                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                                    transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                                }}
                            >
                                {rowItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="content-card"
                                        id={item.title}
                                    >
                                        <ContentCard
                                            content={item}
                                            onClick={onContentClick}
                                            onStatusChange={onStatusChange}
                                            onRemoveContent={onRemoveContent}
                                            fromWatchlist={fromWatchlist}
                                            focusedTitle={focusedTitle}
                                            ownerPage={ownerPage}
                                        />
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
    })
);

export const ContentGrid = React.memo(
    forwardRef<ContentGridHandle, ContentGridProps>(function ContentGrid(
        {
            content,
            onContentClick,
            onStatusChange,
            onRemoveContent,
            fromWatchlist,
            focusedTitle,
            ownerPage,
        },
        ref
    ) {
    const section0Ref = useRef<HTMLDivElement>(null);
    const section1Ref = useRef<HTMLDivElement>(null);
    const section2Ref = useRef<HTMLDivElement>(null);
    const sectionRefs = useMemo(() => [section0Ref, section1Ref, section2Ref], []);

    useImperativeHandle(ref, () => ({
        scrollToSection: (section: number) => {
            const sectionElement = sectionRefs[section]?.current;
            if (!sectionElement) return;

            const top = sectionElement.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top: top - SECTION_SCROLL_OFFSET, behavior: 'smooth' });
        },
    }), [sectionRefs]);
    const { watchedContents, startedContents, toWatchContents } = useMemo(() => {
        if (content && content.length > 0) {
            return {
                watchedContents: content
                    .filter((c) => c.watched === true && !c.logged)
                    .sort((a, b) => a.watchDate - b.watchDate),
                startedContents: content
                    .filter((c) => c.started === true && c.watched === false)
                    .sort((a, b) => a.startedDate - b.startedDate),
                toWatchContents: content
                    .filter((c) => c.watched === false && c.started === false)
                    .sort((a, b) => a.addedDate - b.addedDate),
            };
        }

        return {
            watchedContents: [],
            startedContents: [],
            toWatchContents: [],
        };
    }, [content]);

    return (
        <div className="flex flex-col gap-5">
            <VirtualContentSection
                ref={section0Ref}
                title="Watched"
                sectionId="section-0"
                items={watchedContents}
                onContentClick={onContentClick}
                onStatusChange={onStatusChange}
                onRemoveContent={onRemoveContent}
                fromWatchlist={fromWatchlist}
                focusedTitle={focusedTitle}
                ownerPage={ownerPage}
            />
            <VirtualContentSection
                ref={section1Ref}
                title="Started"
                sectionId="section-1"
                items={startedContents}
                onContentClick={onContentClick}
                onStatusChange={onStatusChange}
                onRemoveContent={onRemoveContent}
                fromWatchlist={fromWatchlist}
                focusedTitle={focusedTitle}
                ownerPage={ownerPage}
            />
            <VirtualContentSection
                ref={section2Ref}
                title="To Watch"
                sectionId="section-2"
                items={toWatchContents}
                onContentClick={onContentClick}
                onStatusChange={onStatusChange}
                onRemoveContent={onRemoveContent}
                fromWatchlist={fromWatchlist}
                focusedTitle={focusedTitle}
                ownerPage={ownerPage}
            />
        </div>
    );
    })
);
