"use client";

import ModuleEditView from "@/components/ModuleEditView";
import { getModuleApi, listCardsByModuleApi } from "@/utils/ApiRequests";
import { CardApi } from "@/utils/Card";
import { Module } from "@/utils/Module";
import { use, useEffect, useState } from "react";

type Props = {
    params: Promise<{ id: number }>;
};

const EditModulePage = ({ params }: Props) => {
    const { id } = use(params);

    const [module, setModule] = useState<Module | null>(null);
    const [cards, setCards] = useState<CardApi[]>([]);

    useEffect(() => {
        const load = async () => {
            const { data: module } = await getModuleApi(id);
            const { data: cards } = await listCardsByModuleApi(id);

            if (module) {
                setModule(module);
            }

            if (cards) {
                setCards(cards);
            }
        };
        load();
    }, [id]);

    if (!module) {
        return (
            <p>Loading...</p>
        );
    }

    return (
        <ModuleEditView
            existingModule={module}
            existingCards={cards ?? []}
        />
    );
};

export default EditModulePage;