import { describe, it, expect } from "vitest";
import { applySpecialPointTemplateScalars } from "@/lib/reports/applySpecialPointTemplateScalars";
import type {
  ExtendedSpecialPointsResult,
  SignNumber,
  SpecialPointsResult,
  VedicPointPlacement,
} from "@/types";

const ZODIAC: Record<number, string> = {
  1: "Aries",
  2: "Taurus",
  3: "Gemini",
  4: "Cancer",
  5: "Leo",
  6: "Virgo",
  7: "Libra",
  8: "Scorpio",
  9: "Sagittarius",
  10: "Capricorn",
  11: "Aquarius",
  12: "Pisces",
};

function signLabel(n: number): string {
  return ZODIAC[n] ?? "";
}

function formatLon(n: number | undefined): string {
  if (n === undefined || Number.isNaN(n)) return "";
  return String(Math.round(n * 1000) / 1000);
}

function vp(
  house: number,
  sign: SignNumber,
  nak = "Magha",
  pada = 2
): VedicPointPlacement {
  return {
    houseFromLagna: house,
    rasiSignNumber: sign,
    rasiName: ZODIAC[sign] ?? "",
    nakshatra: nak,
    pada,
  };
}

describe("applySpecialPointTemplateScalars", () => {
  it("fills AK, GL, Gulika, and PP scalars from placements + extended", () => {
    const vars: Record<string, string> = {};

    const sp = {
      natalLagna: { signNumber: 5 as SignNumber },
      arudhaLagna: {
        arudhaSignNumber: 4 as SignNumber,
        lagnaSignNumber: 5 as SignNumber,
        lagnaLord: "Sun" as const,
        lordSignNumber: 5 as SignNumber,
        stepsFromLagnaToLord: 1,
        exceptionApplied: "none" as const,
      },
      ghatiLagna: {
        ghatiLagnaSignNumber: 3 as SignNumber,
        ghatiLagnaDegree: 11.25,
        fullGhatikasSinceSunrise: 10,
        vighatikasFraction: 0,
        sunLongitudeAtSunrise: 0,
        isDayBirth: true,
        baseLongitudeUsed: 0,
      },
      bhavaLagna: {
        bhavaLagnaSignNumber: 6 as SignNumber,
        bhavaLagnaDegree: 0,
        totalGhatikasSinceSunrise: 0,
        sunLongitudeAtSunrise: 0,
        isDayBirth: true,
        baseLongitudeUsed: 0,
      },
      horaLagna: {
        horaLagnaSignNumber: 7 as SignNumber,
        horaLagnaDegree: 0,
        totalGhatikasSinceSunrise: 0,
        sunLongitudeAtSunrise: 0,
        isDayBirth: true,
        baseLongitudeUsed: 0,
      },
      charakarakas: {
        karakas: [
          {
            rank: "Atmakaraka" as const,
            planet: "Sun" as const,
            rankingDegree: 15,
            rankingArcMinutes: 0,
            rankingArcSeconds: 0,
            rawDegreeInSign: 15,
            sharedRank: false,
          },
        ],
        deficit: null,
      },
      placements: {
        natalLagna: vp(1, 5),
        arudhaLagna: vp(2, 4),
        ghatiLagna: vp(3, 3, "Ashlesha", 4),
        bhavaLagna: vp(4, 6),
        horaLagna: vp(5, 7),
        charakarakas: {
          Atmakaraka: vp(1, 5, "Purva Phalguni", 2),
        },
      },
    } as unknown as SpecialPointsResult;

    const ext = {
      varnadaLagna: {
        varnadaLagnaSignNumber: 8 as SignNumber,
        lagnaIsOdd: true,
        horaLagnaIsOdd: false,
        countFromAries: 3,
        countFromHoraLagna: 2,
      },
      pranapada: {
        pranapadalagnaSignNumber: 9 as SignNumber,
        pranapadalagnaDegree: 7.5,
        sunSignNature: "dual" as const,
        startingLongitude: 0,
        vighatisSinceSunrise: 0,
        baseOffsetDegrees: 0,
        isFortunate: true,
        houseFromLagna: 8,
        sunLongitudeAtSunrise: 0,
      },
      upapadaLagna: {
        upapadaSignNumber: 10 as SignNumber,
        twelfthHouseLord: "Jupiter" as const,
        lordSignNumber: 11 as SignNumber,
        stepsFromTwelfthToLord: 2,
        exceptionApplied: "none" as const,
      },
      sreeLagna: {
        sreeLagnaSignNumber: 12 as SignNumber,
        ninthLordFromLagnaKalas: 1,
        ninthLordFromMoonKalas: 2,
        totalKalas: 3,
        remainder: 1,
      },
      bhriguBindu: {
        bhriguBinduLongitude: 123.456,
        bhriguBinduSign: 5 as SignNumber,
        bhriguBinduDegree: 3.456,
        moonLongitudeUsed: 0,
        rahuLongitudeUsed: 0,
      },
      beejaSphuata: {
        beejaSphutaLongitude: 10,
        beejaSphutaSign: 1 as SignNumber,
        beejaSphutaDegree: 10,
      },
      kshetraSphuata: {
        kshetraSphutaLongitude: 20,
        kshetraSphutaSign: 2 as SignNumber,
        kshetraSphutaDegree: 20,
      },
      trisphuta: {
        triSphutaLongitude: 30,
        triSphutaSign: 3 as SignNumber,
        triSphutaDegree: 30,
        gulikaLongitudeUsed: 0,
      },
      dhoomaChain: {
        dhooma: 40,
        vyatipata: 50,
        parivesha: 60,
        indraChapa: 70,
        upaketu: 80,
        dhoomaSign: 4 as SignNumber,
        vyatipataSign: 5 as SignNumber,
        pariveshaSign: 6 as SignNumber,
        indraChapSign: 7 as SignNumber,
        upaKetuSign: 8 as SignNumber,
      },
      kaalVelas: {
        gulika: {
          planet: "Gulika" as const,
          portionNumber: 1,
          startMinutesFromSunrise: 10,
          endMinutesFromSunrise: 20,
          referenceLongitude: 100,
          midpointLongitude: 100,
          signNumber: 5 as SignNumber,
        },
        maandi: {
          planet: "Maandi" as const,
          portionNumber: 2,
          startMinutesFromSunrise: 20,
          endMinutesFromSunrise: 30,
          referenceLongitude: 110,
          midpointLongitude: 110,
          signNumber: 6 as SignNumber,
        },
        kaala: {
          planet: "Kaala" as const,
          portionNumber: 3,
          startMinutesFromSunrise: 30,
          endMinutesFromSunrise: 40,
          referenceLongitude: 120,
          midpointLongitude: 120,
          signNumber: 7 as SignNumber,
        },
        mrityu: {
          planet: "Mrityu" as const,
          portionNumber: 4,
          startMinutesFromSunrise: 40,
          endMinutesFromSunrise: 50,
          referenceLongitude: 130,
          midpointLongitude: 130,
          signNumber: 8 as SignNumber,
        },
        ardhaprahara: {
          planet: "Ardhaprahara" as const,
          portionNumber: 5,
          startMinutesFromSunrise: 50,
          endMinutesFromSunrise: 60,
          referenceLongitude: 140,
          midpointLongitude: 140,
          signNumber: 9 as SignNumber,
        },
        yamaghantaka: {
          planet: "Yamaghantaka" as const,
          portionNumber: 6,
          startMinutesFromSunrise: 60,
          endMinutesFromSunrise: 70,
          referenceLongitude: 150,
          midpointLongitude: 150,
          signNumber: 10 as SignNumber,
        },
      },
      placements: {
        varnadaLagna: vp(2, 8),
        pranapada: vp(8, 9),
        upapadaLagna: vp(6, 10),
        sreeLagna: vp(7, 12),
        bhriguBindu: vp(3, 5),
        beejaSphuta: vp(1, 1),
        kshetraSphuta: vp(2, 2),
        trisphuta: vp(4, 3),
        dhoomaChain: {
          dhooma: vp(1, 4),
          vyatipata: vp(2, 5),
          parivesha: vp(3, 6),
          indraChapa: vp(4, 7),
          upaketu: vp(5, 8),
        },
        kaalVelas: {
          gulika: vp(6, 5),
          maandi: vp(7, 6),
          kaala: vp(8, 7),
          mrityu: vp(9, 8),
          ardhaprahara: vp(10, 9),
          yamaghantaka: vp(11, 10),
        },
      },
    } as unknown as ExtendedSpecialPointsResult;

    applySpecialPointTemplateScalars(vars, sp, ext, signLabel, formatLon);

    expect(vars.sp_AK_planet).toBe("Sun");
    expect(vars.sp_AK_house).toBe("1");
    expect(vars.sp_GL_nakshatra).toBe("Ashlesha");
    expect(vars.sp_gulika_sign).toBe("Leo");
    expect(vars.sp_gulika_longitude).toBe("100");
    expect(vars.sp_PP_degree).toBe("7.5");
    expect(vars.sp_PP_fortunate).toBe("true");
    expect(vars.sp_BB_sign).toBe("Leo");
  });
});
