import NavBar from "../components/NavBar";
import Footer from "../components/footer";

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100 antialiased flex flex-col">
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
