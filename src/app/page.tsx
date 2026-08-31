import BackgroundLayers from "@/components/bus/BackgroundLayers";
import Header from "@/components/bus/Header";
import BusHero from "@/components/bus/BusHero";
import BottomPlayer from "@/components/bus/BottomPlayer";
import ClientModals from "@/components/bus/ClientModals";

export default function Home() {
  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <BackgroundLayers />

      {/* Header: fixed to top */}
      <Header />

      {/* Hero: fills the space between header and player, centers content slightly above middle */}
      <main
        className="absolute inset-0 flex items-center justify-center"
        style={{
          paddingTop: "calc(var(--header-h) + 8px)",
          paddingBottom: "calc(var(--player-h) + var(--road-h) - 40px)",
        }}
      >
        <BusHero />
      </main>

      {/* Player bar: fixed to bottom */}
      <BottomPlayer />

      {/* Modals */}
      <ClientModals />
    </div>
  );
}
