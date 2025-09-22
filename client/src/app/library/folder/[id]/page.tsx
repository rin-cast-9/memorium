import FolderContentView from "@/components/FolderContentView";
import { getFolderApi } from "@/utils/ApiRequests";
import { Folder } from "@/utils/Folder";

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