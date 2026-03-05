import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { CosmicWeatherCard } from "@/components/dashboard/cosmic-weather-card";
import { SadeSatiProgress } from "@/components/dashboard/sade-sati-progress";
import { ActiveDashaCard } from "@/components/dashboard/active-dasha-card";
import { YantraGallery } from "@/components/dashboard/yantra-gallery";
import { BottomNav } from "@/components/dashboard/bottom-nav";

export default function CosmicDashboard() {
  return (
    <div className="min-h-screen bg-[#020617] flex">
      {/* Sidebar - Desktop only */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 pb-32 lg:pb-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <Header />

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Cosmic Weather - spans 2 columns on desktop */}
            <CosmicWeatherCard />

            {/* Saturn Dasha */}
            <ActiveDashaCard />

            {/* Sade Sati Progress */}
            <SadeSatiProgress />

            {/* Yantras - spans 2 columns on desktop */}
            <YantraGallery />
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Mobile only */}
      <BottomNav />
    </div>
  );
}
