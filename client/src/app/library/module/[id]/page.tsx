import ModuleContentView from "@/components/ModuleContentView";

type Props = {
    params: { id: number };
};

const ModuleContentPage = async ({ params }: Props) => {
    const { id } = await params;

    return (
        <ModuleContentView moduleId={id} />
    );
};

export default ModuleContentPage;