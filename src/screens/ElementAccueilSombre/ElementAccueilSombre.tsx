import React from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Switch } from "../../components/ui/switch";

export const ElementAccueilSombre = (): JSX.Element => {
  const stats = [
    { value: "75", label: "Maison", subLabel: "en Vente" },
    { value: "18", label: "Terrains", subLabel: "en Vente" },
    { value: "75", label: "Immeuble", subLabel: "en Vente" },
  ];

  const settings = [
    { label: "Prix en", highlight: "euro" },
    { label: "Ouverture sur", highlight: "Recherche" },
    { label: "Mode", highlight: "Sombre" },
  ];

  return (
    <div className="w-full min-h-screen bg-[#0150BC] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url(/blie-pattern.png)] opacity-50" />

      {/* Main Content Container */}
      <div className="relative mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6 sm:mb-10">
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-bold text-white leading-tight">
              Salut,
              <br />
              Rakoto.
            </h1>
          </div>
          <img src="/logo-couleur.png" alt="Logo" className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20" />
        </div>

        {/* Welcome Card */}
        <div className="relative bg-[#1E2B47] rounded-3xl p-4 sm:p-6 mb-8 sm:mb-12">
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <img src="/profil.png" alt="Profile" className="w-6 h-6 sm:w-8 sm:h-8" />
            <img src="/notif.png" alt="Notifications" className="w-6 h-6 sm:w-8 sm:h-8" />
            <img src="/parametre.png" alt="Settings" className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <p className="text-white text-lg sm:text-xl md:text-2xl max-w-xs sm:max-w-sm md:max-w-md pr-16 sm:pr-20 md:pr-0">
            Bienvenu ! En quelques clics, achetez, vendez ou louez le bien idéal en toute simplicité
          </p>
          <img 
            src="/calque-6.png" 
            alt="Person" 
            className="absolute right-4 sm:right-3 md:right-5 bottom-[-0px] h-[230px] sm:h-[240px] md:h-[280px] z-10"
          />
        </div>

        {/* Stats Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
            Tafo Immo en quelques chiffres
          </h2>
          <div className="flex justify-end gap-3 sm:gap-6 border-t border-[#59e0c5] pt-3 sm:pt-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-['Anton'] text-white">
                  {stat.value}
                </div>
                <div className="text-[#59e0c5] text-[10px] sm:text-xs">
                  <div>{stat.label}</div>
                  <div>{stat.subLabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4">
          {/* Sell/Rent Card */}
          <Card className="bg-[#1E2B47] text-white rounded-3xl overflow-hidden">
            <CardContent className="p-2 sm:p-3 md:p-4">
              <div className="flex justify-between items-start mb-1 sm:mb-2">
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-tight">
                  Vendre<br />ou Louer votre<br />Immeuble
                </h3>
                <img src="/purple-hme.png" alt="Home" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
              </div>
              <Separator className="my-1 sm:my-2 md:my-3 bg-[#59e0c5]" />
              <p className="text-[8px] sm:text-[10px] md:text-xs">Hivarotra Tany na Trano, na koa hampanofa Trano</p>
            </CardContent>
          </Card>

          {/* Find Home Card */}
          <Card className="bg-[#1E2B47] text-white rounded-3xl overflow-hidden">
            <CardContent className="p-2 sm:p-3 md:p-4">
              <div className="flex justify-between items-start mb-1 sm:mb-2">
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-tight">
                  Trouvez<br />votre prochain<br />
                  <span className="text-[#59e0c5]">chez vous</span>
                </h3>
                <img src="/calque-3.png" alt="Search" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
              </div>
              <Separator className="my-1 sm:my-2 md:my-3 bg-[#59e0c5]" />
              <p className="text-[8px] sm:text-[10px] md:text-xs">Hanofa na hividy Tany na Trano</p>
            </CardContent>
          </Card>

          {/* Guide Card */}
          <Card className="bg-[#1E2B47] text-white rounded-3xl overflow-hidden">
            <CardContent className="p-2 sm:p-3 md:p-4">
              <div className="flex justify-between items-start mb-1 sm:mb-2">
                <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-tight">
                  Guide<br />
                  <span className="text-[#59e0c5]">d'Utilisation</span><br />
                  de ton application
                </h3>
                <img src="/book.png" alt="Guide" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
              </div>
              <Separator className="my-1 sm:my-2 md:my-3 bg-[#59e0c5]" />
              <p className="text-[8px] sm:text-[10px] md:text-xs">Torolalana</p>
            </CardContent>
          </Card>

          {/* Advice Card */}
          <Card className="bg-[#1E2B47] text-white rounded-3xl overflow-hidden">
            <CardContent className="p-2 sm:p-3 md:p-4">
              <div className="flex flex-col items-center">
                <img src="/ampoule-.png" alt="Tip" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 mb-1 sm:mb-2" />
                <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-center mb-1 sm:mb-2">
                  Notre ptit' <span className="text-[#59e0c5]">Conseil</span> :
                </h3>
                <p className="text-[8px] sm:text-xs md:text-sm text-center mb-1 sm:mb-2">
                  "Comparer plusieurs offres avant de prendre une décision. 
                  <span className="text-[#59e0c5]"> Aza maika</span> eee !!!"
                </p>
                <Separator className="my-1 sm:my-2 bg-[#59e0c5] w-full" />
                <p className="text-[8px] sm:text-[10px] md:text-xs text-center">
                  Voir d'autres Astuces et Tips Immobliers
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <Card className="bg-[#1E2B47] text-white rounded-3xl overflow-hidden mb-6 sm:mb-8">
          <CardContent className="p-3 sm:p-4">
            <img src="/calque-5.png" alt="Settings" className="w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2" />
            {settings.map((setting, index) => (
              <div key={index} className="flex items-center justify-between py-1 sm:py-2">
                <span className="text-base sm:text-lg font-bold">
                  {setting.label}{" "}
                  <span className="text-[#59e0c5]">{setting.highlight}</span>
                </span>
                <Switch className="data-[state=checked]:bg-[#59e0c5] scale-75 sm:scale-100" />
              </div>
            ))}
          </CardContent>
        </Card>
        
        {/* Bottom Line */}
        <div className="w-full h-[2px] bg-white my-8 mx-auto max-w-xl"></div>
      </div>
    </div>
  );
};