import FolderContentView from "@/components/FolderContentView";

type Props = {
    params: { id: number };
};

const FolderContentPage = async ({ params }: Props) => {
    const { id } = await params;

    return (
        <FolderContentView folderId={id} />
    );
};

export default FolderContentPage;