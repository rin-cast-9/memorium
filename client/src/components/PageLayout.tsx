import Footer from "./Footer";
import Header from "./Header";

const PageLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    )
};

export default PageLayout;