"use client";

import { ModalTitleAlignment } from "@/utils/ModalTitleAlignment";
import CircleButton from "./CircleButton";

type ModalProps = {
    title: string;
    titleAlign?: ModalTitleAlignment;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal = ({
    title,
    titleAlign = ModalTitleAlignment.CENTER,
    onClose,
    children
}: ModalProps) => {
    const close = () => {

    }

    return (
        <div className="fixed inset-0 bg-black/20 flex justify-center items-center">
            <div className="flex flex-col bg-[var(--color-black-3)] w-[580px] rounded-[20px] p-[40px] relative max-h-[calc(100vh-80px)]">
                <h1 className={`mb-[20px] font-h1 flex-1 ${titleAlign === ModalTitleAlignment.CENTER ? "text-center" : "text-left"}`}>
                    {title}
                </h1>

                <div className="flex-1 overflow-y-auto">
                    {children}
                </div>

                <CircleButton
                    onClick={onClose}
                    icon="/icons/icon-close.svg"
                    className="absolute -right-[60px] top-0"
                />
            </div>
        </div>
    );
};

export default Modal;