
import { memo, useEffect, useRef, useState } from "react";
import settings from "../../constants/settings.json";
import { motion, AnimatePresence } from "framer-motion";
import { RippleExplosion } from "../RippleExplosion";
import { BiCheck, BiPlus, BiX } from "react-icons/bi";
import { Content } from "../../types/content";
import { useSearchParams, useRouter } from "next/navigation";
import { useContent } from "@/app/hooks/useContent";
import { ContentView } from "./views/ContentView";
import { PersonView } from "./views/PersonView";
import { CollectionView } from "./views/CollectionView";
import { EpisodeView } from "./views/EpisodeView";

interface ContentDetailsModalProps {
    selectedContent: Content;
    onClose: () => void;
    open: boolean;
}

export const ContentDetailsModal = memo(function ContentDetailsModal({ selectedContent, onClose, open }: ContentDetailsModalProps) {
    const modalRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;

        const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        };
    }, [open]);

    const router = useRouter();

    const [stack, setStack] = useState<ModalPage[]>([]);

    const currentPage = stack[stack.length - 1];

    // const handleOnClick = (content: any, selectedType: string) => {
    //     router.push(`?${selectedType}=${content.id}`);
    // }

    const handleOnClick = (
        content: any,
        selectedType: string
    ) => {

        console.log({ content, selectedType });

        let id = content.tmdbId ? content.tmdbId : content.id;

        if(content.episode) {
            setStack(prev => [
                ...prev,
                {
                    type: prev[prev.length - 1].type,
                    id: content.selectedContent.tmdbId ? content.selectedContent.tmdbId : content.selectedContent.id,
                    episode: content.episode,
                    content: content.selectedContent
                },
            ]);
        } else {
            setStack(prev => [
                ...prev,
                {
                    type: selectedType as any,
                    id: String(id),
                    episode: null,
                    content: null
                },
            ]);
        }

    }

    // useEffect(() => {
    //     if(!open || !type || !id) return
    //     setSelectedType(type)
    //     setSelectedId(id)
    // }, [type, id, open])

    useEffect(() => {
        console.log({selectedContent, open})
        if (!open || !selectedContent) return;

        console.log({ selectedContent });

        let type = selectedContent.type ? selectedContent.type : selectedContent.media_type ? selectedContent.media_type : selectedContent.contentType;

        setStack([
            {
                type: type,
                id: String(selectedContent.tmdbId ? selectedContent.tmdbId : selectedContent.id),
                content: null,
                episode: null
            },
        ]);
    }, [open, selectedContent]);

    // const handleOnClose = () => {
    //     setSelectedType('')
    //     setSelectedId('')
    //     router.push(`?`, { scroll: false })
    //     onClose && onClose()
    // }

    const handleOnClose = () => {
        setStack([]);
        onClose();
    }

    const handleGoBack = () => {
        setStack(prev => {
            if (prev.length <= 1) {
                handleOnClose();
                return prev;
            }

            return prev.slice(0, -1);
        });
    }

    useEffect(() => {
        if (stack.length < 1) return router.push(`?`, { scroll: false });
        if(stack[stack.length - 1].episode !== null) {
            router.push(`?${stack[stack.length - 1].type}=${stack[stack.length - 1].id}&episode=${stack[stack.length - 1].episode.seasonNumber}&episode=${stack[stack.length - 1].episode.episodeNumber}`, { scroll: false });
        } else {
            router.push(`?${stack[stack.length - 1].type}=${stack[stack.length - 1].id}`, { scroll: false });
        }
    }, [stack]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        key="backdrop"
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    />

                    <motion.div
                        key="modal"
                        className="fixed top-0 left-0 w-full h-full bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleOnClose}
                    >
                        <motion.div
                            ref={modalRef}
                            className="relative flex flex-col gap-2 rounded-2xl shadow-inner shadow-zinc-200/30 w-[95%] lg:w-3/5 max-w-[1000px] max-h-[95%] md:max-h-[85%] z-10 bg-black/60 overflow-hidden"
                            initial={{ opacity: 0, y: 20, scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.5 }}
                            transition={{ duration: 0.25 }}
                            onClick={(e) => e.stopPropagation()}
                        >

                            {/* {(selectedType && selectedId) && (
                                (selectedType === "person") ? (
                                    <PersonView info={{ id: selectedId, type: selectedType }} onClose={handleOnClose} onClick={handleOnClick} />
                                ) : 
                                (selectedType === "collection") ? (
                                    <CollectionView info={{ id: selectedId, type: selectedType }} onClose={handleOnClose} onClick={handleOnClick} />
                                ) :
                                (
                                    <ContentView info={{ id: selectedId, type: selectedType }} onClose={handleOnClose} onClick={handleOnClick} />
                                )
                            )} */}

                            {currentPage && (
                                currentPage.type === "person" ? (
                                    <PersonView
                                        info={{
                                            id: currentPage.id,
                                            type: currentPage.type
                                        }}
                                        onClose={handleOnClose}
                                        onBack={handleGoBack}
                                        onClick={handleOnClick}
                                    />
                                ) : currentPage.type === "collection" ? (
                                    <CollectionView
                                        info={{
                                            id: currentPage.id,
                                            type: currentPage.type
                                        }}
                                        onClose={handleOnClose}
                                        onBack={handleGoBack}
                                        onClick={handleOnClick}
                                    />
                                )  : currentPage.episode !== null ? (
                                    <EpisodeView
                                        info={{
                                            id: currentPage.id,
                                            type: currentPage.type,
                                            content: currentPage.content,
                                            episode: currentPage.episode
                                        }}
                                        onClose={handleOnClose}
                                        onBack={handleGoBack}
                                        onClick={handleOnClick}
                                    />
                                ) : (
                                    <ContentView
                                        info={{
                                            id: currentPage.id,
                                            type: currentPage.type
                                        }}
                                        onClose={handleOnClose}
                                        onBack={handleGoBack}
                                        onClick={handleOnClick}
                                    />
                                )
                            )}

                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
});