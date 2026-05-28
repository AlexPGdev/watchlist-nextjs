
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

interface ContentDetailsModalProps {
    selectedContent: Content;
    onClose: () => void;
    open: boolean;
}

export const ContentDetailsModal = memo(function ContentDetailsModal({ selectedContent, onClose, open }: ContentDetailsModalProps) {
    const modalRef = useRef<HTMLDivElement | null>(null);

    const router = useRouter();
    const searchParams = useSearchParams();
    const [type, id] = [...searchParams.entries()][0] || [];
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedId, setSelectedId] = useState<string>('');

    const handleOnClick = (content: any, selectedType: string) => {
        router.push(`?${selectedType}=${content.id}`);
    }

    useEffect(() => {
        if(!open || !type || !id) return
        setSelectedType(type)
        setSelectedId(id)
    }, [type, id, open])

    const handleOnClose = () => {
        setSelectedType('')
        setSelectedId('')
        router.push(`?`, { scroll: false })
        onClose && onClose()
    }

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
                            className="relative flex flex-col gap-2 rounded-2xl shadow-inner shadow-zinc-200/30 w-[95%] lg:w-3/5 max-h-[95%] md:max-h-[85%] z-10 bg-black/60 overflow-hidden"
                            initial={{ opacity: 0, y: 20, scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.5 }}
                            transition={{ duration: 0.25 }}
                            onClick={(e) => e.stopPropagation()}
                        >

                            {(selectedType && selectedId) && (
                                (selectedType === "person") ? (
                                    <PersonView info={{ id: selectedId, type: selectedType }} onClose={handleOnClose} onClick={handleOnClick} />
                                ) : (
                                    <ContentView info={{ id: selectedId, type: selectedType }} onClose={handleOnClose} onClick={handleOnClick} />
                                )
                            )}
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
});